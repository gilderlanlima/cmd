import { execFile } from "child_process";
import { promisify } from "util";
import { REPO_ROOT, BRANCH } from "../../config/systemUpdate";

const execFileAsync = promisify(execFile);

interface VersionOption {
  tag: string;
  version: string;
}

interface UpdateCheckResult {
  currentVersion: string;
  currentTag: string | null;
  latestVersion: string;
  latestTag: string | null;
  upToDate: boolean;
  changes: string[];
  downgradeOptions: VersionOption[];
}

const CONVENTIONAL_PREFIX = /^[a-z]+(\([^)]*\))?:\s*/i;
const NOISE_PREFIXES = ["chore", "docs", "test", "ci", "build"];

const readVersionAt = async (ref: string): Promise<string> => {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["show", `${ref}:backend/package.json`],
      { cwd: REPO_ROOT }
    );
    const { version } = JSON.parse(stdout);
    return version || "0.0.0";
  } catch {
    return "0.0.0";
  }
};

const describeChange = (subject: string): string | null => {
  const match = subject.match(/^([a-z]+)(\([^)]*\))?:/i);
  const type = match?.[1]?.toLowerCase();
  if (type && NOISE_PREFIXES.includes(type)) {
    return null;
  }
  const clean = subject.replace(CONVENTIONAL_PREFIX, "").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// Compara "3.3.19" com "3.3.20" numericamente (maior = mais recente).
// Cobre apenas o formato X.Y.Z usado neste projeto.
const isVersionNewer = (a: string, b: string): boolean => {
  const pa = a.split(".").map(n => parseInt(n, 10) || 0);
  const pb = b.split(".").map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
};

// Tags de release ordenadas da mais nova para a mais antiga (SemVer).
export const listReleaseTags = async (limit = 10): Promise<string[]> => {
  const { stdout } = await execFileAsync(
    "git",
    ["tag", "--list", "v*", "--sort=-v:refname"],
    { cwd: REPO_ROOT }
  );
  return stdout.split("\n").filter(Boolean).slice(0, limit);
};

// Tag cujo package.json bate com a versão informada (usada para achar a tag
// da versão atualmente rodando, que pode não ser exatamente o HEAD).
const findTagForVersion = (
  tags: string[],
  versions: string[],
  version: string
): string | null => {
  const index = versions.findIndex(v => v === version);
  return index === -1 ? null : tags[index];
};

const CheckForUpdatesService = async (): Promise<UpdateCheckResult> => {
  await execFileAsync(
    "git",
    ["fetch", "origin", BRANCH, "--tags", "--quiet"],
    { cwd: REPO_ROOT }
  );

  const { stdout: currentOut } = await execFileAsync(
    "git",
    ["rev-parse", "HEAD"],
    { cwd: REPO_ROOT }
  );
  const currentCommit = currentOut.trim();
  const currentVersion = await readVersionAt(currentCommit);

  // A versão "oficial" mais recente é a da última tag de release
  // (v0.0.0), não o HEAD cru do branch — main pode ter commits (docs,
  // ajustes de script etc.) ainda não publicados como release.
  const releaseTags = await listReleaseTags();
  const releaseVersions = await Promise.all(
    releaseTags.map(tag => readVersionAt(tag))
  );

  const latestTag = releaseTags[0] || null;
  const latestVersion = latestTag ? releaseVersions[0] : currentVersion;

  const upToDate = !isVersionNewer(latestVersion, currentVersion);

  let changes: string[] = [];
  if (!upToDate && latestTag) {
    const { stdout: logOut } = await execFileAsync(
      "git",
      ["log", `${currentCommit}..${latestTag}`, "--pretty=format:%s"],
      { cwd: REPO_ROOT }
    );
    changes = logOut
      .split("\n")
      .filter(Boolean)
      .map(describeChange)
      .filter((line): line is string => Boolean(line));
  }

  const currentTag = findTagForVersion(releaseTags, releaseVersions, currentVersion);
  const currentIndex = currentTag ? releaseTags.indexOf(currentTag) : -1;

  // As até 3 releases anteriores à atualmente instalada, para permitir
  // reverter (downgrade) direto pela tela de atualização.
  const downgradeOptions: VersionOption[] = (
    currentIndex === -1
      ? releaseTags.filter(tag => tag !== latestTag)
      : releaseTags.slice(currentIndex + 1)
  )
    .slice(0, 3)
    .map(tag => ({
      tag,
      version: releaseVersions[releaseTags.indexOf(tag)]
    }));

  return {
    currentVersion,
    currentTag,
    latestVersion,
    latestTag,
    upToDate,
    changes,
    downgradeOptions
  };
};

export default CheckForUpdatesService;
