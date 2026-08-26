import path from "path";

export const REPO_ROOT =
  process.env.SYSTEM_UPDATE_REPO_PATH ||
  path.resolve(__dirname, "..", "..", "..");

export const BRANCH = process.env.SYSTEM_UPDATE_BRANCH || "main";

export const PM2_BACKEND_NAME = process.env.PM2_BACKEND_NAME || "backend";
export const PM2_FRONTEND_NAME = process.env.PM2_FRONTEND_NAME || "frontend";

export const LOG_DIR = path.join(REPO_ROOT, "backend", "update-logs");
export const LOG_FILE = path.join(LOG_DIR, "latest.log");
export const STATUS_FILE = path.join(LOG_DIR, "status.json");
export const UPDATE_SCRIPT = path.join(REPO_ROOT, "scripts", "update.sh");
