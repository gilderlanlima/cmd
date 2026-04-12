import moment from "moment-timezone";

import Contact from "../../models/Contact";
import OnCallSetting from "../../models/OnCallSetting";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import SendWhatsAppMessageAPI from "../WbotServices/SendWhatsAppMessageAPI";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import logger from "../../utils/logger";

type DayKey =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

interface Request {
  messageBody: string;
  companyId: number;
  ticket: Ticket & {
    queue?: Queue;
    user?: User;
    whatsapp?: Whatsapp;
    contact?: Contact;
  };
}

const dayMap: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

const toMinutes = (value?: string | null): number | null => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const matchesSchedule = (schedule: any, now: moment.Moment): boolean => {
  if (!schedule?.enabled) {
    return false;
  }

  const start = toMinutes(schedule.start);
  const end = toMinutes(schedule.end);

  if (start === null || end === null) {
    return false;
  }

  const currentMinutes = now.hours() * 60 + now.minutes();

  if (end >= start) {
    return currentMinutes >= start && currentMinutes <= end;
  }

  return currentMinutes >= start || currentMinutes <= end;
};

const canNotifyAgain = (
  setting: OnCallSetting,
  now: moment.Moment
): boolean => {
  if (!setting.lastNotificationAt) {
    return true;
  }

  const lastNotification = moment(setting.lastNotificationAt).tz(
    "America/Sao_Paulo"
  );

  return now.diff(lastNotification, "minutes") >= setting.intervalMinutes;
};

const buildNotificationBody = ({
  messageBody,
  ticket,
}: Omit<Request, "companyId">) => {
  const queueName = ticket.queue?.name || "Sem fila";
  const channelName = ticket.channel || "whatsapp";
  const customerName = ticket.contact?.name || ticket.contact?.number || "Cliente";
  const preview = String(messageBody || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return [
    "Plantão CRM Ideia no Bolso",
    `Novo atendimento recebido de ${customerName}.`,
    `Canal: ${channelName}`,
    `Fila: ${queueName}`,
    preview ? `Mensagem: ${preview}` : ""
  ]
    .filter(Boolean)
    .join("\n");
};

const NotifyOnCallSettingsService = async ({
  messageBody,
  companyId,
  ticket
}: Request): Promise<void> => {
  if (!ticket || ticket.isGroup || !ticket.contact || !ticket.contact.number) {
    return;
  }

  const now = moment().tz("America/Sao_Paulo");
  const scheduleKey = dayMap[now.day()];

  const settings = await OnCallSetting.findAll({
    where: {
      companyId,
      active: true
    },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "profileImage"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  if (!settings.length) {
    return;
  }

  const whatsappId =
    ticket.whatsappId || (await GetDefaultWhatsApp(companyId)).id;

  for (const setting of settings) {
    try {
      const schedule = setting.schedules?.[scheduleKey];
      if (!matchesSchedule(schedule, now)) {
        continue;
      }

      if (!canNotifyAgain(setting, now)) {
        continue;
      }

      const contact = Contact.build({
        companyId,
        number: String(setting.phone || "").replace(/\D/g, ""),
        name: setting.user?.name || "Plantonista",
        isGroup: false,
        channel: "whatsapp"
      });

      if (!contact.number) {
        continue;
      }

      await SendWhatsAppMessageAPI({
        body: buildNotificationBody({ messageBody, ticket }),
        whatsappId,
        contact
      });

      await setting.update({
        lastNotificationAt: now.toDate()
      });
    } catch (error) {
      logger.error(
        `[OnCall] Falha ao notificar plantão ${setting.id}: ${error}`
      );
    }
  }
};

export default NotifyOnCallSettingsService;
