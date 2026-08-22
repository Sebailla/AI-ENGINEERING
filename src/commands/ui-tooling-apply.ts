import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { applyUiTooling, UiToolingCommandExecutor } from "../core/ui-tooling-apply.js";
import { UiToolingApplyReport, UiToolingProfile } from "../core/types.js";

const execFileAsync = promisify(execFile);

export async function uiToolingApply(options: { cwd: string; profile: UiToolingProfile; confirmed: boolean }): Promise<UiToolingApplyReport> {
  return applyUiTooling(options.profile, options.cwd, options.confirmed, executeCommand);
}

const executeCommand: UiToolingCommandExecutor = async (command, args, cwd) => {
  const result = await execFileAsync(command, args, { cwd, env: process.env });
  return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 };
};
