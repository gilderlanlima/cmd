import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as OnCallSettingController from "../controllers/OnCallSettingController";

const onCallSettingRoutes = Router();

onCallSettingRoutes.get("/on-call-settings", isAuth, OnCallSettingController.index);
onCallSettingRoutes.get("/on-call-settings/:onCallId", isAuth, OnCallSettingController.show);
onCallSettingRoutes.post("/on-call-settings", isAuth, OnCallSettingController.store);
onCallSettingRoutes.put("/on-call-settings/:onCallId", isAuth, OnCallSettingController.update);
onCallSettingRoutes.delete("/on-call-settings/:onCallId", isAuth, OnCallSettingController.remove);

export default onCallSettingRoutes;
