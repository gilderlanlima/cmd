import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";
import jwt from "jsonwebtoken";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  company: Company | null;
  super: boolean;
  queues: Queue[];
  startWork: string;
  endWork: string;
  workingHours?: Record<string, any> | null;
  allTicket: string;
  whatsappId: number;
  profileImage: string;
  defaultTheme: string;
  defaultMenu: string;
  allHistoric: string;
  allUserChat?: string;
  defaultTicketsManagerWidth?: number;
  userClosePendingTicket?: string;
  showDashboard?: string;
  token?: string;
  allowGroup: boolean;
  allowRealTime: string;
  allowConnections: string;
  allowSeeMessagesInPendingTickets: string;
  finalizacaoComValorVendaAtiva: boolean;
  showContacts: string;
  showCampaign: string;
  showFlow: string;
  followMeEnabled?: boolean;
  followMePhone?: string;
  followMeWhatsappId?: number;
  followMeSchedule?: Record<string, any> | null;
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  const generateToken = (userId: number | string): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });
  };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company: user.company,
    super: user.super,
    queues: user.queues,
    startWork: user.startWork,
    endWork: user.endWork,
    workingHours: user.workingHours,
    allTicket: user.allTicket,
    whatsappId: user.whatsappId,
    profileImage: user.profileImage,
    defaultTheme: user.defaultTheme,
    defaultMenu: user.defaultMenu,
    allHistoric: user.allHistoric,
    allUserChat: user.allUserChat,
    userClosePendingTicket: user.userClosePendingTicket,
    showDashboard: user.showDashboard,
    token: generateToken(user.id),
    allowGroup: user.allowGroup,
    allowRealTime: user.allowRealTime,
    allowSeeMessagesInPendingTickets:
      user.allowSeeMessagesInPendingTickets || "enabled",
    allowConnections: user.allowConnections,
    finalizacaoComValorVendaAtiva: user.finalizacaoComValorVendaAtiva,
    showContacts: user.showContacts,
    showCampaign: user.showCampaign,
    showFlow: user.showFlow,
    followMeEnabled: user.followMeEnabled,
    followMePhone: user.followMePhone,
    followMeWhatsappId: user.followMeWhatsappId,
    followMeSchedule: user.followMeSchedule
  };
};
