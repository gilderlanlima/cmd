import fs from "fs";
import path from "path";
import * as Yup from "yup";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Story from "../models/Story";
import User from "../models/User";

const serializeStory = (story: Story) => ({
  ...story.toJSON(),
  mediaUrl: `/public/${String(story.mediaPath || "").replace(/^\/+/, "")}`
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  await Story.update(
    { isActive: false },
    {
      where: {
        companyId,
        isActive: true,
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    }
  );

  const stories = await Story.findAll({
    where: {
      companyId,
      isActive: true,
      expiresAt: {
        [Op.gte]: new Date()
      }
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "profileImage"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return res.status(200).json(stories.map(serializeStory));
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const file = Array.isArray(req.files) ? req.files[0] : null;

  if (!file) {
    throw new AppError("ERR_NO_FILE_PROVIDED", 400);
  }

  const schema = Yup.object().shape({
    caption: Yup.string().max(255).nullable(),
    expiresAt: Yup.date().min(new Date()).required()
  });

  const payload = {
    caption: req.body.caption || null,
    expiresAt: req.body.expiresAt
  };

  await schema.validate(payload);

  const relativePath = path
    .relative(path.resolve(__dirname, "..", "..", "public"), file.path)
    .replace(/\\/g, "/");

  const story = await Story.create({
    companyId,
    userId,
    caption: payload.caption,
    mediaPath: relativePath,
    mediaName: file.filename,
    mediaType: file.mimetype || "application/octet-stream",
    expiresAt: new Date(payload.expiresAt),
    isActive: true
  });

  await story.reload({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "profileImage"]
      }
    ]
  });

  getIO().of(String(companyId)).emit(`company-${companyId}-story`, {
    action: "create",
    record: serializeStory(story)
  });

  return res.status(201).json(serializeStory(story));
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: currentUserId, profile } = req.user;
  const { storyId } = req.params;

  const story = await Story.findOne({
    where: {
      id: storyId,
      companyId
    }
  });

  if (!story) {
    throw new AppError("ERR_STORY_NOT_FOUND", 404);
  }

  if (profile !== "admin" && story.userId !== Number(currentUserId)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const filePath = path.resolve(__dirname, "..", "..", "public", story.mediaPath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await story.destroy();

  getIO().of(String(companyId)).emit(`company-${companyId}-story`, {
    action: "delete",
    id: Number(storyId)
  });

  return res.status(200).json({ message: "Story removido com sucesso" });
};
