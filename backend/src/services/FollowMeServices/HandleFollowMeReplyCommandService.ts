import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Contact from "../../models/Contact";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import { Session } from "../../libs/wbot";
import { normalizeFollowMePhone } from "./FollowMeHelpers";

interface Request {
  bodyMessage: string;
  senderNumber: string;
  companyId: number;
  whatsappId: number;
  wbot: Session;
}

const HandleFollowMeReplyCommandService = async ({
  bodyMessage,
  senderNumber,
  companyId,
  whatsappId,
  wbot
}: Request): Promise<boolean> => {
  const match = String(bodyMessage || "").trim().match(/^!!(\d+)\s+([\s\S]+)/);

  if (!match) {
    return false;
  }

  const normalizedSender = normalizeFollowMePhone(senderNumber);

  const followMeUser = await User.findOne({
    where: {
      companyId,
      followMeEnabled: true,
      followMePhone: normalizedSender
    }
  });

  if (!followMeUser) {
    return false;
  }

  const [, ticketId, replyBody] = match;

  const ticket = await Ticket.findOne({
    where: {
      id: ticketId,
      companyId
    },
    include: [
      { model: Contact, as: "contact" },
      { model: Queue, as: "queue" },
      { model: Whatsapp, as: "whatsapp" }
    ]
  });

  if (!ticket) {
    await wbot.sendMessage(`${normalizedSender}@s.whatsapp.net`, {
      text: `Ticket ${ticketId} não encontrado neste CRM.`
    });
    return true;
  }

  if (ticket.whatsappId !== whatsappId) {
    await wbot.sendMessage(`${normalizedSender}@s.whatsapp.net`, {
      text: `O ticket ${ticketId} pertence a outra conexão.`
    });
    return true;
  }

  await SendWhatsAppMessage({
    body: replyBody.trim(),
    ticket
  });

  await wbot.sendMessage(`${normalizedSender}@s.whatsapp.net`, {
    text: `Resposta enviada ao ticket ${ticket.id}.`
  });

  return true;
};

export default HandleFollowMeReplyCommandService;
