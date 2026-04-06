import * as Sentry from "@sentry/node";
import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import logger from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateOrUpdateContactServiceForImport from "../ContactServices/CreateOrUpdateContactServiceForImport";
import { isString, isArray } from "lodash";
import path from "path";
import fs from 'fs';

type PhoneContact = {
  id: string;
  name?: string;
  notify?: string;
};

type ImportContactsResult = {
  message: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  totalFound: number;
  whatsappId: number;
};

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const normalizePhoneContacts = (contacts: any): PhoneContact[] => {
  if (!contacts) {
    return [];
  }

  let parsedContacts = contacts;

  if (isString(parsedContacts)) {
    try {
      parsedContacts = JSON.parse(parsedContacts);
    } catch (error) {
      logger.warn(`[IMPORT CONTACTS] Falha ao parsear contatos em texto: ${error.message}`);
      return [];
    }
  }

  if (Array.isArray(parsedContacts)) {
    return parsedContacts.filter(contact => !!contact?.id);
  }

  if (typeof parsedContacts === "object") {
    return Object.values(parsedContacts).filter(contact => !!(contact as PhoneContact)?.id) as PhoneContact[];
  }

  return [];
};

const readContactsFromFile = async (companyId: number): Promise<PhoneContact[]> => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const filePath = path.join(publicFolder, `company${companyId}`, "contactJson.txt");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const fileContent = await fs.promises.readFile(filePath, "utf8");
    return normalizePhoneContacts(fileContent);
  } catch (error) {
    logger.warn(`[IMPORT CONTACTS] Falha ao ler arquivo de cache dos contatos: ${error.message}`);
    return [];
  }
};

const readContactsFromBaileys = async (whatsappId: number): Promise<PhoneContact[]> => {
  try {
    const baileysData = await ShowBaileysService(whatsappId);
    return normalizePhoneContacts(baileysData.contacts);
  } catch (error) {
    logger.warn(`[IMPORT CONTACTS] Cache do Baileys ainda indisponível para conexão ${whatsappId}: ${error.message}`);
    return [];
  }
};

const resolveImportWhatsapp = async (companyId: number): Promise<Whatsapp> => {
  const candidates: Whatsapp[] = [];

  try {
    const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    if (defaultWhatsapp) {
      candidates.push(defaultWhatsapp);
    }
  } catch (error) {
    logger.warn(`[IMPORT CONTACTS] Nenhum WhatsApp padrão conectado para empresa ${companyId}: ${error.message}`);
  }

  const availableWhatsapps = await Whatsapp.findAll({
    where: { companyId },
    order: [["isDefault", "DESC"], ["updatedAt", "DESC"]]
  });

  availableWhatsapps.forEach(whatsapp => {
    if (!candidates.some(candidate => candidate.id === whatsapp.id)) {
      candidates.push(whatsapp);
    }
  });

  for (const whatsapp of candidates) {
    try {
      getWbot(whatsapp.id);
      return whatsapp;
    } catch (error) {
      logger.warn(`[IMPORT CONTACTS] Sessão ${whatsapp.id} ainda não inicializada para importação: ${error.message}`);
    }
  }

  throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`);
};

const ImportContactsService = async (companyId: number): Promise<ImportContactsResult> => {
  const whatsapp = await resolveImportWhatsapp(companyId);
  const wbot = getWbot(whatsapp.id);

  let phoneContactsList: PhoneContact[] = [];

  for (let attempt = 1; attempt <= 5; attempt++) {
    const baileysContacts = await readContactsFromBaileys(wbot.id);
    const fileContacts = baileysContacts.length > 0 ? [] : await readContactsFromFile(companyId);
    phoneContactsList = baileysContacts.length > 0 ? baileysContacts : fileContacts;

    if (phoneContactsList.length > 0) {
      break;
    }

    logger.info(`[IMPORT CONTACTS] Nenhum contato disponível ainda para conexão ${wbot.id}. Tentativa ${attempt}/5.`);
    await wait(1500);
  }

  if (!isArray(phoneContactsList) || phoneContactsList.length === 0) {
    throw new AppError("ERR_WAPP_CONTACTS_NOT_READY", 409);
  }

  const filteredContacts = phoneContactsList.filter(({ id }) => {
    if (!id) return false;
    if (id === "status@broadcast") return false;
    if (id.includes("g.us")) return false;
    return true;
  });

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const { id, name, notify } of filteredContacts) {
    const number = id.replace(/\D/g, "");
    const safeName = (name || notify || number || "").trim();

    if (!number || !safeName) {
      skippedCount += 1;
      continue;
    }

    try {
      const existingContact = await Contact.findOne({
        where: { number, companyId }
      });

      await CreateOrUpdateContactServiceForImport({
        number,
        name: safeName,
        companyId,
        isGroup: false,
        whatsappId: whatsapp.id
      });

      if (existingContact) {
        updatedCount += 1;
      } else {
        importedCount += 1;
      }
    } catch (error) {
      skippedCount += 1;
      Sentry.captureException(error);
      logger.warn(`[IMPORT CONTACTS] Falha ao importar contato ${id}: ${error.message}`);
    }
  }

  return {
    message: "contacts imported",
    importedCount,
    updatedCount,
    skippedCount,
    totalFound: filteredContacts.length,
    whatsappId: whatsapp.id
  };
};

export default ImportContactsService;
