import { execFile } from "child_process";
import { promisify } from "util";
import { REPO_ROOT, BRANCH } from "../../config/systemUpdate";

const execFileAsync = promisify(execFile);

interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  upToDate: boolean;
  changes: string[];
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

const getLatestReleaseTag = async (): Promise<string | null> => {
  const { stdout } = await execFileAsync(
    "git",
    ["tag", "--list", "v*", "--sort=-v:refname"],
    { cwd: REPO_ROOT }
  );
  const [latest] = stdout.split("\n").filter(Boolean);
  return latest || null;
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
  const latestTag = await getLatestReleaseTag();
  const latestVersion = latestTag
    ? await readVersionAt(latestTag)
    : currentVersion;

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

  return {
    currentVersion,
    latestVersion,
    upToDate,
    changes
  };
};

export default CheckForUpdatesService;
