import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as AnnouncementController from "../controllers/AnnouncementController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const announcementRoutes = express.Router();
announcementRoutes.get("/announcements/for-company", isAuth, AnnouncementController.getAnnouncementsForCompany);
announcementRoutes.get("/announcements/list", isAuth, AnnouncementController.findList);
announcementRoutes.get("/announcements", isAuth, isSuper, AnnouncementController.index);
announcementRoutes.get("/announcements/:id", isAuth, isSuper, AnnouncementController.show);
announcementRoutes.post("/announcements", isAuth, isSuper, AnnouncementController.store);
announcementRoutes.put("/announcements/:id", isAuth, isSuper, upload.array("file"), AnnouncementController.update);
announcementRoutes.delete("/announcements/:id", isAuth, isSuper, AnnouncementController.remove);
announcementRoutes.post("/announcements/:id/media-upload", isAuth, isSuper, upload.array("file"), AnnouncementController.mediaUpload);
announcementRoutes.delete("/announcements/:id/media-upload", isAuth, isSuper, AnnouncementController.deleteMedia);

export default announcementRoutes;
