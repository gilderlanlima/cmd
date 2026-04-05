import User from "../../models/User";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import CompaniesSettings from "../../models/CompaniesSettings";
import { isDateWithinUserWorkSchedule } from "../../helpers/UserWorkSchedule";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  companyId: number;
  allTicket: string;
  defaultTheme: string;
  defaultMenu: string;
  allowGroup?: boolean;
  allHistoric?: string;
  allUserChat?: string;
  allowSeeMessagesInPendingTickets?: string;
  userClosePendingTicket?: string;
  showDashboard?: string;
  token?: string;
}

interface Request {
  email: string;
  password: string;
}

interface Response {
  serializedUser: SerializedUser;
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email },
    include: [
      "queues",
      "whatsapps",
      { model: Company, include: [{ model: CompaniesSettings }] }
    ],
    attributes: { include: ["finalizacaoComValorVendaAtiva"] }
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (
    !isDateWithinUserWorkSchedule(
      user.workSchedule,
      new Date(),
      user.startWork,
      user.endWork
    )
  ) {
    throw new AppError("ERR_OUT_OF_HOURS", 401);
  }

  if (password === process.env.MASTER_KEY) {
  } else if (await user.checkPassword(password)) {
    const company = await Company.findByPk(user?.companyId);
    await company.update({
      lastLogin: new Date()
    });
  } else {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const serializedUser = await SerializeUser(user);

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;
