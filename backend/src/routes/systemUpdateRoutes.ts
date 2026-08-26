import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as SystemUpdateController from "../controllers/SystemUpdateController";

const systemUpdateRoutes = Router();

systemUpdateRoutes.get(
  "/system-update/check",
  isAuth,
  isSuper,
  SystemUpdateController.check
);
systemUpdateRoutes.get(
  "/system-update/status",
  isAuth,
  isSuper,
  SystemUpdateController.status
);
systemUpdateRoutes.post(
  "/system-update/apply",
  isAuth,
  isSuper,
  SystemUpdateController.apply
);

export default systemUpdateRoutes;
