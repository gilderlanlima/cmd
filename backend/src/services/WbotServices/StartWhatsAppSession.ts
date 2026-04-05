import { getWbot, initWASocket } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";

const startThrottleByWhatsapp = new Map<number, number>();
const START_THROTTLE_MS = 3500;

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  const now = Date.now();
  const lastStart = startThrottleByWhatsapp.get(whatsapp.id) || 0;

  // Evita reinicializar sessao ja ativa (causa oscilacao CONNECTED/OPENING).
  try {
    const existingSession = getWbot(whatsapp.id);
    const readyState = (existingSession as any)?.ws?.readyState;
    const isSocketAlive = readyState === 0 || readyState === 1;
    if (isSocketAlive) {
      return;
    }
  } catch (error) {
    // Sessao ainda nao existe em memoria, segue fluxo normal.
  }

  // Throttle contra chamadas repetidas em curto intervalo.
  if (now - lastStart < START_THROTTLE_MS) {
    return;
  }
  startThrottleByWhatsapp.set(whatsapp.id, now);

  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  try {
    const wbot = await initWASocket(whatsapp);

    if (wbot.id) {
      wbotMessageListener(wbot, companyId);
      wbotMonitor(wbot, whatsapp, companyId);
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};
