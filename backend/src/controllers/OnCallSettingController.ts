import { Request, Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import OnCallSetting from "../models/OnCallSetting";
import User from "../models/User";

const scheduleShape = Yup.object().shape({
  enabled: Yup.boolean().required(),
  start: Yup.string().nullable(),
  end: Yup.string().nullable()
});

const schema = Yup.object().shape({
  userId: Yup.number().required(),
  phone: Yup.string().required(),
  intervalMinutes: Yup.number().min(1).max(1440).required(),
  active: Yup.boolean().required(),
  schedules: Yup.object().shape({
    monday: scheduleShape.required(),
    tuesday: scheduleShape.required(),
    wednesday: scheduleShape.required(),
    thursday: scheduleShape.required(),
    friday: scheduleShape.required(),
    saturday: scheduleShape.required(),
    sunday: scheduleShape.required()
  }).required()
});

const ensureValidSchedules = (schedules: Record<string, any>) => {
  const hasAtLeastOneEnabledDay = Object.values(schedules || {}).some(
    (schedule: any) =>
      schedule?.enabled && schedule?.start && schedule?.end
  );

  if (!hasAtLeastOneEnabledDay) {
    throw new AppError("ERR_ONCALL_SCHEDULE_REQUIRED", 400);
  }
};

const listWithUser = async (companyId: number) =>
  OnCallSetting.findAll({
    where: { companyId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "profileImage", "companyId"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const settings = await listWithUser(companyId);
  return res.json(settings);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { onCallId } = req.params;

  const setting = await OnCallSetting.findOne({
    where: { id: onCallId, companyId },
    include: [{ model: User, attributes: ["id", "name", "email", "profileImage", "companyId"] }]
  });

  if (!setting) {
    throw new AppError("ERR_ONCALL_NOT_FOUND", 404);
  }

  return res.json(setting);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await schema.validate(req.body);
  ensureValidSchedules(req.body.schedules);
  const payload = {
    ...req.body,
    phone: String(req.body.phone || "").replace(/\D/g, ""),
    companyId
  };

  const user = await User.findOne({ where: { id: payload.userId, companyId } });
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const setting = await OnCallSetting.create(payload);
  const created = await OnCallSetting.findByPk(setting.id, {
    include: [{ model: User, attributes: ["id", "name", "email", "profileImage", "companyId"] }]
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-oncall`, {
    action: "create",
    setting: created
  });

  return res.status(201).json(created);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await schema.validate(req.body);
  ensureValidSchedules(req.body.schedules);
  const { onCallId } = req.params;

  const setting = await OnCallSetting.findOne({ where: { id: onCallId, companyId } });
  if (!setting) {
    throw new AppError("ERR_ONCALL_NOT_FOUND", 404);
  }

  const user = await User.findOne({ where: { id: req.body.userId, companyId } });
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await setting.update({
    ...req.body,
    phone: String(req.body.phone || "").replace(/\D/g, "")
  });

  const updated = await OnCallSetting.findByPk(setting.id, {
    include: [{ model: User, attributes: ["id", "name", "email", "profileImage", "companyId"] }]
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-oncall`, {
    action: "update",
    setting: updated
  });

  return res.json(updated);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;
  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { onCallId } = req.params;
  const setting = await OnCallSetting.findOne({ where: { id: onCallId, companyId } });
  if (!setting) {
    throw new AppError("ERR_ONCALL_NOT_FOUND", 404);
  }

  await setting.destroy();

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-oncall`, {
    action: "delete",
    onCallId: Number(onCallId)
  });

  return res.json({ message: "On-call setting deleted" });
};
