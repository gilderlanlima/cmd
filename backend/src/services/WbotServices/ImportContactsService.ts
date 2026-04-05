import * as Sentry from "@sentry/node";
import { isArray, isString } from "lodash";
import path from "path";
import fs from "fs";

import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";

interface ImportContactsResult {
  imported: number;
  updated: number;
  skipped: number;
  totalCandidates: number;
}

const parseContactsPayload = (rawContacts: unknown): any[] => {
  if (isArray(rawContacts)) {
    return rawContacts;
  }

  if (isString(rawContacts)) {
    try {
      const parsed = JSON.parse(rawContacts);
      return isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const loadContactsFromLocalCache = async (
  companyId: number
): Promise<any[] | null> => {
  const contactsFilePath = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    `company${companyId}`,
    "contactJson.txt"
  );

  if (!fs.existsSync(contactsFilePath)) {
    return null;
  }

  try {
    const fileContent = await fs.promises.readFile(contactsFilePath, "utf8");
    const parsedContacts = JSON.parse(fileContent);
    return isArray(parsedContacts) ? parsedContacts : null;
  } catch (error: any) {
    logger.warn(
      `[ImportContactsService] Falha ao ler cache local de contatos: ${error?.message || error}`
    );
    return null;
  }
};

const persistDebugFilesSafely = async (
  companyId: number,
  contacts: any[]
): Promise<void> => {
  try {
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const companyFolder = path.join(publicFolder, `company${companyId}`);

    if (!fs.existsSync(companyFolder)) {
      fs.mkdirSync(companyFolder, { recursive: true });
    }

    const beforeFilePath = path.join(companyFolder, "contatos_antes.txt");
    const afterFilePath = path.join(companyFolder, "contatos_depois.txt");

    await fs.promises.writeFile(beforeFilePath, JSON.stringify(contacts, null, 2));
    await fs.promises.writeFile(afterFilePath, JSON.stringify(contacts, null, 2));
  } catch (fileError: any) {
    logger.warn(
      `[ImportContactsService] Falha ao gerar arquivos auxiliares de debug: ${fileError?.message || fileError}`
    );
  }
};

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const tryGetContactsFromActiveSession = async (
  companyId: number
): Promise<{
  rawContacts: unknown;
  whatsappIdForImport: number;
}> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
  const whatsappIdForImport = defaultWhatsapp.id;

  let rawContacts: unknown = [];

  try {
    const wbot = getWbot(defaultWhatsapp.id);

    if (typeof wbot.resyncAppState === "function") {
      // Garante sincronizacao da arvore de contatos quando sessao acabou de abrir.
      await wbot.resyncAppState(["critical_unblock_low"], false);
    }

    await wait(1200);
    const contactsString = await ShowBaileysService(whatsappIdForImport);
    rawContacts = contactsString.contacts;
  } catch (error) {
    // Se nao houver sessao em memoria, tentamos usar a base de dados baileys.
    const contactsString = await ShowBaileysService(whatsappIdForImport);
    rawContacts = contactsString.contacts;
  }

  return { rawContacts, whatsappIdForImport };
};

const ImportContactsService = async (
  companyId: number
): Promise<ImportContactsResult> => {
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  let rawContacts: unknown;
  let whatsappIdForImport: number | null = null;

  try {
    const response = await tryGetContactsFromActiveSession(companyId);
    rawContacts = response.rawContacts;
    whatsappIdForImport = response.whatsappIdForImport;
  } catch (err: any) {
    logger.warn(
      `[ImportContactsService] Falha ao importar via sessao ativa: ${err?.message || err}`
    );

    const fallbackWhatsapp =
      (await Whatsapp.findOne({
        where: { companyId, isDefault: true },
        attributes: ["id"],
        order: [["updatedAt", "DESC"]]
      })) ||
      (await Whatsapp.findOne({
        where: { companyId },
        attributes: ["id"],
        order: [["updatedAt", "DESC"]]
      }));

    if (!fallbackWhatsapp) {
      throw new AppError(
        "Nenhuma conexao WhatsApp encontrada para importar contatos.",
        400
      );
    }

    whatsappIdForImport = fallbackWhatsapp.id;

    try {
      const contactsString = await ShowBaileysService(whatsappIdForImport);
      rawContacts = contactsString.contacts;
    } catch (fallbackError: any) {
      const cachedContacts = await loadContactsFromLocalCache(companyId);
      if (cachedContacts && cachedContacts.length > 0) {
        rawContacts = cachedContacts;
      } else {
        Sentry.captureException(fallbackError);
        logger.error(
          `[ImportContactsService] Sem dados de contatos para importar. whatsappId=${whatsappIdForImport} err=${fallbackError?.message || fallbackError}`
        );
        throw new AppError(
          "Nao foi possivel importar contatos do aparelho. Conecte o WhatsApp e tente novamente.",
          400
        );
      }
    }
  }

  const phoneContactsList = parseContactsPayload(rawContacts);

  if (!phoneContactsList.length) {
    logger.warn(
      `[ImportContactsService] Nenhum contato disponivel para importacao. companyId=${companyId}`
    );
    return {
      imported,
      updated,
      skipped,
      totalCandidates: 0
    };
  }

  await persistDebugFilesSafely(companyId, phoneContactsList);

  for (const { id, name, notify } of phoneContactsList) {
    if (!id || id === "status@broadcast" || id.includes("g.us")) {
      skipped += 1;
      continue;
    }

    const number = String(id).replace(/\D/g, "");
    if (!number) {
      skipped += 1;
      continue;
    }

    const existingContact = await Contact.findOne({
      where: { number, companyId }
    });

    if (existingContact) {
      existingContact.name = name || notify || existingContact.name;
      await existingContact.save();
      updated += 1;
      continue;
    }

    try {
      await CreateContactService({
        number,
        name: name || notify || number,
        companyId
      });
      imported += 1;
    } catch (error) {
      Sentry.captureException(error);
      logger.warn(`Could not create whatsapp contact from phone. Err: ${error}`);
      skipped += 1;
    }
  }

  return {
    imported,
    updated,
    skipped,
    totalCandidates: phoneContactsList.length
  };
};

export default ImportContactsService;
