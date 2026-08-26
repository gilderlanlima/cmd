import path from "path";

export const REPO_ROOT =
  process.env.SYSTEM_UPDATE_REPO_PATH ||
  path.resolve(__dirname, "..", "..", "..");

export const BRANCH = process.env.SYSTEM_UPDATE_BRANCH || "main";

// Nome da unidade systemd do backend (ex: crm-backend.service) e caminho do
// script (root, sudoers NOPASSWD escopado) que publica o build do frontend.
// Ver docs/deploy-vps.md para o setup completo do sudoers.
export const SYSTEMD_BACKEND_SERVICE = process.env.SYSTEMD_BACKEND_SERVICE || "";
export const FRONTEND_SYNC_SCRIPT = process.env.FRONTEND_SYNC_SCRIPT || "";

export const LOG_DIR = path.join(REPO_ROOT, "backend", "update-logs");
export const LOG_FILE = path.join(LOG_DIR, "latest.log");
export const STATUS_FILE = path.join(LOG_DIR, "status.json");
export const UPDATE_SCRIPT = path.join(REPO_ROOT, "scripts", "update.sh");
