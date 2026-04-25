import User from "../../models/User";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import { Session } from "../../libs/wbot";
import { Op } from "sequelize";
import { isFollowMeScheduleActive, normalizeFollowMePhone } from "./FollowMeHelpers";
import logger from "../../utils/logger";

interface Request {
  ticket: Ticket;
  contact: Contact;
  bodyMessage: string;
  whatsappId: number;
  senderNumber: string;
  wbot: Session;
}

const NotifyOnDutyUsersService = async ({
  ticket,
  contact,
  bodyMessage,
  whatsappId,
  senderNumber,
  wbot
}: Request): Promise<void> => {
  const sanitizedBody = String(bodyMessage || "").trim();

  if (!sanitizedBody || /^!!\d+\s+/i.test(sanitizedBody) || ticket.isGroup) {
    return;
  }

  const inboundMessagesCount = await Message.count({
    where: {
      ticketId: ticket.id,
      fromMe: false
    }
  });

  if (inboundMessagesCount > 0) {
    return;
  }

  const normalizedSender = normalizeFollowMePhone(senderNumber);

  const users = await User.findAll({
    where: {
      companyId: ticket.companyId,
      followMeEnabled: true,
      followMePhone: {
        [Op.ne]: ""
      },
      [Op.or]: [
        { followMeWhatsappId: whatsappId },
        { followMeWhatsappId: null }
      ]
    }
  });

  if (!users.length) {
    return;
  }

  const contactName = contact.name || contact.number;
  const notificationText = [
    `Ticket ID: ${ticket.id}`,
    `Contato: ${contactName} - ${contact.number}`,
    "",
    `Mensagem: ${sanitizedBody}`,
    "",
    `Para responder, envie !!${ticket.id} e a mensagem desejada em texto!`
  ].join("\n");

  for (const user of users) {
    const destinationPhone = normalizeFollowMePhone(user.followMePhone);

    if (!destinationPhone || destinationPhone === normalizedSender) {
      continue;
    }

    if (!isFollowMeScheduleActive(user.followMeSchedule)) {
      continue;
    }

    try {
      await wbot.sendMessage(`${destinationPhone}@s.whatsapp.net`, {
        text: notificationText
      });
    } catch (error) {
      logger.error(
        `[FOLLOW ME] Erro ao notificar usuário ${user.id} no ticket ${ticket.id}: ${error.message}`
      );
    }
  }
};

export default NotifyOnDutyUsersService;
