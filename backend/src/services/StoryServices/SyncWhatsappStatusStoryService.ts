import fs from "fs";
import path from "path";
import { proto, WASocket } from "baileys";
import Story from "../../models/Story";
import { getIO } from "../../libs/socket";

type Session = WASocket & {
  id?: number;
  user?: {
    id?: string;
    name?: string;
  };
};

interface DownloadedMedia {
  data: Buffer;
  mimetype: string;
  filename: string;
}

const getMediaPayload = (message: proto.IWebMessageInfo) =>
  message.message?.imageMessage ||
  message.message?.videoMessage ||
  message.message?.ephemeralMessage?.message?.imageMessage ||
  message.message?.ephemeralMessage?.message?.videoMessage ||
  message.message?.viewOnceMessage?.message?.imageMessage ||
  message.message?.viewOnceMessage?.message?.videoMessage ||
  message.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage ||
  message.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage;

const getStoryCaption = (message: proto.IWebMessageInfo) =>
  message.message?.imageMessage?.caption ||
  message.message?.videoMessage?.caption ||
  message.message?.ephemeralMessage?.message?.imageMessage?.caption ||
  message.message?.ephemeralMessage?.message?.videoMessage?.caption ||
  message.message?.viewOnceMessage?.message?.imageMessage?.caption ||
  message.message?.viewOnceMessage?.message?.videoMessage?.caption ||
  message.message?.conversation ||
  message.message?.extendedTextMessage?.text ||
  null;

const resolveMediaType = (message: proto.IWebMessageInfo) => {
  if (
    message.message?.videoMessage ||
    message.message?.ephemeralMessage?.message?.videoMessage ||
    message.message?.viewOnceMessage?.message?.videoMessage ||
    message.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage
  ) {
    return "video";
  }

  if (
    message.message?.imageMessage ||
    message.message?.ephemeralMessage?.message?.imageMessage ||
    message.message?.viewOnceMessage?.message?.imageMessage ||
    message.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage
  ) {
    return "image";
  }

  return "text";
};

const serializeStory = (story: Story) => ({
  ...story.toJSON(),
  mediaUrl: story.mediaPath
    ? `/public/${String(story.mediaPath || "").replace(/^\/+/, "")}`
    : "",
  author: {
    key: String(
      story.userId || story.sourceJid || (story.whatsappId ? `whatsapp-${story.whatsappId}` : `story-${story.id}`)
    ),
    name: story.authorName || "Story",
    avatar: story.authorAvatar || null
  }
});

const SyncWhatsappStatusStoryService = async ({
  companyId,
  message,
  wbot,
  downloadMedia
}: {
  companyId: number;
  message: proto.IWebMessageInfo;
  wbot: Session;
  downloadMedia: (
    msg: proto.IWebMessageInfo,
    isImported: Date | null,
    socket: Session
  ) => Promise<DownloadedMedia>;
}): Promise<void> => {
  if (!message?.key?.id || message.key.remoteJid !== "status@broadcast") {
    return;
  }

  const storyKind = resolveMediaType(message);
  const caption = getStoryCaption(message);

  if (storyKind === "text" && !caption) {
    return;
  }

  const sourceJid =
    message.key.participant ||
    message.participant ||
    (message.key.fromMe ? wbot.user?.id || null : null);

  const [existingStory, created] = await Story.findOrCreate({
    where: {
      companyId,
      sourceType: "whatsapp_status",
      sourceMessageId: message.key.id
    },
    defaults: {
      companyId,
      userId: null,
      whatsappId: wbot.id || null,
      sourceType: "whatsapp_status",
      sourceJid,
      sourceMessageId: message.key.id,
      authorName:
        message.pushName ||
        (message.key.fromMe ? `Status ${wbot.user?.name || ""}`.trim() : sourceJid?.split("@")[0]) ||
        "Status do WhatsApp",
      authorAvatar: sourceJid
        ? await wbot.profilePictureUrl(sourceJid, "image").catch(() => null)
        : null,
      caption,
      mediaPath: null,
      mediaName: null,
      mediaType: storyKind === "video" ? "video/mp4" : storyKind === "image" ? "image/jpeg" : "text/plain",
      expiresAt: new Date(
        Math.floor(Number(message.messageTimestamp || Date.now() / 1000) * 1000) + 24 * 60 * 60 * 1000
      ),
      isActive: true
    }
  });

  if (!created) {
    return;
  }

  if (storyKind !== "text") {
    const media = await downloadMedia(message, null, wbot);
    const folder = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      `company${companyId}`,
      "stories",
      "whatsapp-status"
    );

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      fs.chmodSync(folder, 0o777);
    }

    const fileName = `${message.key.id}-${media.filename}`.replace(/[^\w.\-]/g, "_");
    const fullPath = path.join(folder, fileName);

    await fs.promises.writeFile(fullPath, media.data);

    const relativePath = path
      .relative(path.resolve(__dirname, "..", "..", "..", "public"), fullPath)
      .replace(/\\/g, "/");

    await existingStory.update({
      mediaPath: relativePath,
      mediaName: fileName,
      mediaType: media.mimetype
    });
  }

  getIO().of(String(companyId)).emit(`company-${companyId}-story`, {
    action: "create",
    record: serializeStory(existingStory)
  });
};

export default SyncWhatsappStatusStoryService;
