import { Request, Response } from "express";
import CheckForUpdatesService from "../services/UpdateService/CheckForUpdatesService";
import {
  runSystemUpdate,
  getUpdateStatus,
  getUpdateLog
} from "../services/UpdateService/RunSystemUpdateService";

export const check = async (req: Request, res: Response): Promise<Response> => {
  const result = await CheckForUpdatesService();
  return res.status(200).json(result);
};

export const apply = async (req: Request, res: Response): Promise<Response> => {
  const result = runSystemUpdate();
  return res.status(202).json(result);
};

export const status = async (req: Request, res: Response): Promise<Response> => {
  const currentStatus = getUpdateStatus();
  const log = getUpdateLog();
  return res.status(200).json({ ...currentStatus, log });
};
