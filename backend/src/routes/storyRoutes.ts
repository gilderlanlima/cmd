import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadConfig from "../config/upload";
import * as StoryController from "../controllers/StoryController";

const storyRoutes = express.Router();
const upload = multer(uploadConfig);

storyRoutes.get("/stories", isAuth, StoryController.index);
storyRoutes.post("/stories", isAuth, upload.array("file"), StoryController.store);
storyRoutes.delete("/stories/:storyId", isAuth, StoryController.remove);

export default storyRoutes;
