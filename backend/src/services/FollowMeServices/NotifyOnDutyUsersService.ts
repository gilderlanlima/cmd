import User from "../../models/User";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
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
  isFirstUnreadMessage?: boolean;
  notificationType?: "newTicket" | "queueSelection";
  selectionLabel?: string | null;
}

const NotifyOnDutyUsersService = async ({
  ticket,
  contact,
  bodyMessage,
  whatsappId,
  senderNumber,
  wbot,
  isFirstUnreadMessage = false,
  notificationType = "newTicket",
  selectionLabel = null
}: Request): Promise<void> => {
  const sanitizedBody = String(bodyMessage || "").trim();
  logger.info(
    `[FOLLOW ME] ticket=${ticket.id} from=${senderNumber} type=${notificationType} firstUnread=${isFirstUnreadMessage} bodyPresent=${Boolean(sanitizedBody)} isGroup=${ticket.isGroup}`
  );

  if (
    (notificationType === "newTicket" && !sanitizedBody) ||
    /^!!\d+\s+/i.test(sanitizedBody) ||
    ticket.isGroup ||
    (notificationType === "newTicket" && !isFirstUnreadMessage)
  ) {
    logger.info(`[FOLLOW ME] ticket=${ticket.id} skipped by initial guards`);
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
    logger.info(
      `[FOLLOW ME] ticket=${ticket.id} no eligible users for whatsappId=${whatsappId}`
    );
    return;
  }

  const contactName = contact.name || contact.number;
  const notificationText =
    notificationType === "queueSelection"
      ? [
          `Ticket ID: ${ticket.id}`,
          `Contato: ${contactName} - ${contact.number}`,
          "",
          `Setor/Opção selecionada: ${selectionLabel || "Não identificado"}`,
          "",
          `Última mensagem: ${sanitizedBody || "Sem texto"}`,
          "",
          `Para responder, envie !!${ticket.id} e a mensagem desejada em texto!`
        ].join("\n")
      : [
          `Ticket ID: ${ticket.id}`,
          `Contato: ${contactName} - ${contact.number}`,
          "",
          `Mensagem: ${sanitizedBody}`,
          "",
          `Para responder, envie !!${ticket.id} e a mensagem desejada em texto!`
        ].join("\n");

  for (const user of users) {
    const destinationPhone = normalizeFollowMePhone(user.followMePhone);

    if (!destinationPhone) {
      logger.info(
        `[FOLLOW ME] ticket=${ticket.id} user=${user.id} skipped by destination validation`
      );
      continue;
    }

    if (!isFollowMeScheduleActive(user.followMeSchedule)) {
      logger.info(
        `[FOLLOW ME] ticket=${ticket.id} user=${user.id} skipped by schedule`
      );
      continue;
    }

    try {
      logger.info(
        `[FOLLOW ME] ticket=${ticket.id} notifying user=${user.id} destination=${destinationPhone} whatsappId=${whatsappId}`
      );
      await wbot.sendMessage(`${destinationPhone}@s.whatsapp.net`, {
        text: notificationText
      });
      logger.info(
        `[FOLLOW ME] ticket=${ticket.id} notification sent to user=${user.id}`
      );
    } catch (error) {
      logger.error(
        `[FOLLOW ME] Erro ao notificar usuário ${user.id} no ticket ${ticket.id}: ${error.message}`
      );
    }
  }
};

export default NotifyOnDutyUsersService;
