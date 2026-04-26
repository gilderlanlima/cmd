import User from "../../models/User";
import AppError from "../../errors/AppError";
import ShowUserService from "./ShowUserService";
import { normalizeFollowMePhone } from "../FollowMeServices/FollowMeHelpers";

interface FollowMeScheduleDay {
  enabled?: boolean;
  start?: string;
  end?: string;
}

interface FollowMeSchedule {
  [key: string]: FollowMeScheduleDay;
}

interface Request {
  userId: string | number;
  companyId: number;
  followMeEnabled?: boolean;
  followMePhone?: string;
  followMeWhatsappId?: number | string | null;
  followMeSchedule?: FollowMeSchedule | null;
}

const UpdateUserFollowMeService = async ({
  userId,
  companyId,
  followMeEnabled,
  followMePhone,
  followMeWhatsappId,
  followMeSchedule
}: Request): Promise<User> => {
  const user = await ShowUserService(userId, companyId);

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await user.update({
    followMeEnabled: Boolean(followMeEnabled),
    followMePhone: normalizeFollowMePhone(followMePhone),
    followMeWhatsappId: followMeWhatsappId ? Number(followMeWhatsappId) : null,
    followMeSchedule: followMeSchedule || null
  });

  await user.reload();

  return user;
};

export default UpdateUserFollowMeService;
