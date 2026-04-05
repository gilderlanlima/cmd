import { Chat, Contact } from "baileys";
import Baileys from "../../models/Baileys";

interface Request {
  whatsappId: number;
  contacts?: Contact[];
  chats?: Chat[];
}

const parseArraySafely = (value: unknown): any[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const dedupeById = <T extends { id?: string }>(items: T[]): T[] => {
  const uniqueMap = new Map<string, T>();

  for (const item of items) {
    const id = String(item?.id || "").trim();
    if (!id) {
      continue;
    }
    uniqueMap.set(id, item);
  }

  return Array.from(uniqueMap.values());
};

const createOrUpdateBaileysService = async ({
  whatsappId,
  contacts,
  chats
}: Request): Promise<Baileys> => {
  try {
    const baileysExists = await Baileys.findOne({
      where: { whatsappId }
    });

    if (baileysExists) {
      const currentChats = parseArraySafely(baileysExists.chats);
      const currentContacts = parseArraySafely(baileysExists.contacts);

      const mergedChats = chats
        ? dedupeById([...(currentChats as Chat[]), ...chats])
        : currentChats;

      const mergedContacts = contacts
        ? dedupeById([...(currentContacts as Contact[]), ...contacts])
        : currentContacts;

      if (!chats && !contacts) {
        return baileysExists;
      }

      return await baileysExists.update({
        chats: JSON.stringify(mergedChats),
        contacts: JSON.stringify(mergedContacts)
      });
    }

    const contactsToSave = dedupeById(Array.isArray(contacts) ? contacts : []);
    const chatsToSave = dedupeById(Array.isArray(chats) ? chats : []);

    const baileys = await Baileys.create({
      whatsappId,
      contacts: JSON.stringify(contactsToSave),
      chats: JSON.stringify(chatsToSave)
    });

    return baileys;
  } catch (error: any) {
    console.log(error, whatsappId, contacts);
    throw new Error(error?.message || String(error));
  }
};

export default createOrUpdateBaileysService;
