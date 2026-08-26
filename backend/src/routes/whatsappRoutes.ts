import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";

import * as WhatsAppController from "../controllers/WhatsAppController";

import multer from "multer";
import uploadConfig from "../config/upload";
import { mediaUpload } from "../services/WhatsappService/uploadMediaAttachment";
import { deleteMedia } from "../services/WhatsappService/uploadMediaAttachment";

const upload = multer(uploadConfig);


const whatsappRoutes = express.Router();

whatsappRoutes.get("/whatsapp/", isAuth, WhatsAppController.index);
whatsappRoutes.get("/whatsapp/filter", isAuth, WhatsAppController.indexFilter);
whatsappRoutes.get("/whatsapp/all", isAuth, isSuper, WhatsAppController.listAll);
whatsappRoutes.get("/whatsapp/sync-templates/:whatsappId", isAuth, WhatsAppController.syncTemplatesOficial);

whatsappRoutes.post("/whatsapp/", isAuth, WhatsAppController.store);
whatsappRoutes.post("/facebook/", isAuth, WhatsAppController.storeFacebook);
whatsappRoutes.get("/whatsapp/:whatsappId", isAuth, WhatsAppController.show);
whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsAppController.update);
whatsappRoutes.delete("/whatsapp/:whatsappId", isAuth, WhatsAppController.remove);
whatsappRoutes.post("/closedimported/:whatsappId", isAuth, WhatsAppController.closedTickets);

//restart
whatsappRoutes.post("/whatsapp-restart/", isAuth, WhatsAppController.restart);
whatsappRoutes.post("/whatsapp/:whatsappId/media-upload", isAuth, upload.array("file"), mediaUpload);

whatsappRoutes.delete("/whatsapp/:whatsappId/media-upload", isAuth, deleteMedia);


whatsappRoutes.delete("/whatsapp-admin/:whatsappId", isAuth, isSuper, WhatsAppController.remove);

whatsappRoutes.put("/whatsapp-admin/:whatsappId", isAuth, isSuper, WhatsAppController.updateAdmin);

whatsappRoutes.get("/whatsapp-admin/:whatsappId", isAuth, isSuper, WhatsAppController.showAdmin);

export default whatsappRoutes;
