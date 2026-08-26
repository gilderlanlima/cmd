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

const CheckForUpdatesService = async (): Promise<UpdateCheckResult> => {
  await execFileAsync("git", ["fetch", "origin", BRANCH, "--quiet"], {
    cwd: REPO_ROOT
  });

  const { stdout: currentOut } = await execFileAsync(
    "git",
    ["rev-parse", "HEAD"],
    { cwd: REPO_ROOT }
  );
  const { stdout: latestOut } = await execFileAsync(
    "git",
    ["rev-parse", `origin/${BRANCH}`],
    { cwd: REPO_ROOT }
  );

  const currentCommit = currentOut.trim();
  const latestCommit = latestOut.trim();
  const upToDate = currentCommit === latestCommit;

  const currentVersion = await readVersionAt(currentCommit);
  const latestVersion = upToDate
    ? currentVersion
    : await readVersionAt(latestCommit);

  let changes: string[] = [];
  if (!upToDate) {
    const { stdout: logOut } = await execFileAsync(
      "git",
      ["log", `${currentCommit}..${latestCommit}`, "--pretty=format:%s"],
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
