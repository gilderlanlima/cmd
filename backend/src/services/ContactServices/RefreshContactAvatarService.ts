import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Whatsapp from "../../models/Whatsapp";
import CreateOrUpdateContactService from "./CreateOrUpdateContactService";

interface Request {
  contactId: number;
  companyId: number;
}

const RefreshContactAvatarService = async ({
  contactId,
  companyId
}: Request): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: {
      id: contactId,
      companyId
    }
  });

  if (!contact) {
    throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
  }

  const whatsapp = contact.whatsappId
    ? await Whatsapp.findOne({
        where: {
          id: contact.whatsappId,
          companyId
        }
      })
    : await GetDefaultWhatsApp(companyId);

  if (!whatsapp) {
    throw new AppError("ERR_NO_DEF_WAPP_FOUND", 404);
  }

  const wbot = getWbot(whatsapp.id);
  const targetJid =
    contact.remoteJid ||
    (contact.isGroup
      ? `${contact.number}@g.us`
      : `${contact.number}@s.whatsapp.net`);

  let profilePicUrl = "";
  try {
    profilePicUrl = await wbot.profilePictureUrl(targetJid, "image");
  } catch (error) {
    throw new AppError("ERR_CONTACT_AVATAR_NOT_FOUND", 404);
  }

  return CreateOrUpdateContactService({
    name: contact.name,
    number: contact.number,
    email: contact.email,
    isGroup: contact.isGroup,
    companyId,
    remoteJid: targetJid,
    profilePicUrl,
    whatsappId: whatsapp.id,
    wbot
  });
};

export default RefreshContactAvatarService;
