import { spawn } from "child_process";
import fs from "fs";
import AppError from "../../errors/AppError";
import {
  REPO_ROOT,
  LOG_DIR,
  LOG_FILE,
  STATUS_FILE,
  UPDATE_SCRIPT
} from "../../config/systemUpdate";
import { listReleaseTags } from "./CheckForUpdatesService";

const TAG_FORMAT = /^v\d+\.\d+\.\d+$/;

interface UpdateStatus {
  running: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
}

const ensureLogDir = (): void => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

export const getUpdateStatus = (): UpdateStatus => {
  ensureLogDir();
  if (!fs.existsSync(STATUS_FILE)) {
    return {
      running: false,
      startedAt: null,
      finishedAt: null,
      exitCode: null
    };
  }
  return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
};

export const getUpdateLog = (maxLines = 300): string => {
  if (!fs.existsSync(LOG_FILE)) return "";
  const content = fs.readFileSync(LOG_FILE, "utf-8");
  return content.split("\n").slice(-maxLines).join("\n");
};

export const runSystemUpdate = async (
  targetTag: string
): Promise<{ started: boolean }> => {
  ensureLogDir();

  const status = getUpdateStatus();
  if (status.running) {
    throw new AppError("Já existe uma atualização em andamento", 409);
  }

  if (!TAG_FORMAT.test(targetTag || "")) {
    throw new AppError("Versão de destino inválida", 400);
  }

  // Confere contra as tags reais do repositório antes de repassar ao script
  // (que roda com privilégios de deploy) — evita apontar para uma tag
  // inexistente ou manipulada.
  const knownTags = await listReleaseTags();
  if (!knownTags.includes(targetTag)) {
    throw new AppError("Versão de destino não encontrada", 400);
  }

  if (!fs.existsSync(UPDATE_SCRIPT)) {
    throw new AppError(
      `Script de atualização não encontrado em ${UPDATE_SCRIPT}`,
      500
    );
  }

  fs.writeFileSync(LOG_FILE, "");

  const child = spawn(
    "bash",
    [UPDATE_SCRIPT, LOG_FILE, STATUS_FILE, targetTag],
    {
      cwd: REPO_ROOT,
      detached: true,
      stdio: "ignore",
      env: process.env
    }
  );
  child.unref();

  return { started: true };
};
