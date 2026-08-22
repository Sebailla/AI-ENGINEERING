import { planUiTooling } from "./ui-tooling.js";
import { UiToolingApplyReport, UiToolingProfile, UiToolingReceipt } from "./types.js";

export interface UiToolingCommandExecutor {
  (command: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

export async function applyUiTooling(profile: UiToolingProfile, cwd: string, confirmed: boolean, execute: UiToolingCommandExecutor): Promise<UiToolingApplyReport> {
  const plan = planUiTooling(profile);
  if (!confirmed) return { profile, confirmed: false, complete: false, receipts: plan.steps.map((step) => ({ id: step.id, status: "BLOCKED", verification: "BLOQUEADO", evidence: "Explicit --apply confirmation is required." })), fallback: plan.fallback };

  const receipts: UiToolingReceipt[] = [];
  for (const step of plan.steps) {
    if (step.id === "stitch") {
      receipts.push({ id: step.id, status: "BLOCKED", verification: "NO_VERIFICADO", evidence: "Stitch registration remains owned by Gentle-AI and requires a verified runtime capability." });
      continue;
    }
    try {
      const result = await execute("npx", ["impeccable", "install", "--scope=project"], cwd);
      receipts.push({ id: step.id, command: "npx impeccable install --scope=project", status: result.exitCode === 0 ? "APPLIED" : "FAILED", verification: "NO_VERIFICADO", evidence: redact(`${result.stdout}\n${result.stderr}`) });
    } catch (error) {
      receipts.push({ id: step.id, command: "npx impeccable install --scope=project", status: "FAILED", verification: "NO_VERIFICADO", evidence: redact(error instanceof Error ? error.message : String(error)) });
    }
  }
  return { profile, confirmed: true, complete: receipts.every((receipt) => receipt.status === "APPLIED" || receipt.status === "BLOCKED"), receipts, fallback: plan.fallback };
}

function redact(value: string): string {
  return value.replace(/(STITCH_API_KEY|STITCH_ACCESS_TOKEN|GITHUB_TOKEN|NPM_TOKEN)=?[^\s\n]*/gi, "$1=<redacted>");
}
