import { execFile } from "child_process";
import { promisify } from "util";
import { REPO_ROOT, BRANCH } from "../../config/systemUpdate";

const execFileAsync = promisify(execFile);

interface UpdateCheckResult {
  currentCommit: string;
  latestCommit: string;
  upToDate: boolean;
  pendingCommits: string[];
}

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

  let pendingCommits: string[] = [];
  if (currentCommit !== latestCommit) {
    const { stdout: logOut } = await execFileAsync(
      "git",
      ["log", `${currentCommit}..${latestCommit}`, "--pretty=format:%h %s"],
      { cwd: REPO_ROOT }
    );
    pendingCommits = logOut.split("\n").filter(Boolean);
  }

  return {
    currentCommit,
    latestCommit,
    upToDate: currentCommit === latestCommit,
    pendingCommits
  };
};

export default CheckForUpdatesService;
