import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { promisify } from "node:util";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { conformanceCase, ConformanceCase, ConformanceReport } from "../core/conformance.js";
import { doctor } from "./doctor.js";
import { init } from "./init.js";
import { CheckStatus } from "../core/report.js";
import { SUPPORTED_RUNTIMES } from "../core/types.js";

export interface CommandResult { code: number; stdout: string; stderr: string; }
export type CommandRunner = (command: string, args: string[], cwd: string) => Promise<CommandResult>;
export interface ConformanceOptions { cwd: string; commandRunner?: CommandRunner; }
const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../templates/runtime");
const execFileAsync = promisify(execFile);

const defaultCommandRunner: CommandRunner = async (command, args, cwd) => {
  try {
    const result = await execFileAsync(command, args, { cwd, timeout: 15_000, maxBuffer: 256 * 1024 });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error: unknown) {
    const result = error as { code?: number | string; stdout?: string; stderr?: string; message?: string };
    return { code: typeof result.code === "number" ? result.code : 1, stdout: result.stdout ?? "", stderr: result.stderr ?? result.message ?? String(error) };
  }
};

export async function conformance(options: ConformanceOptions): Promise<ConformanceReport> {
  const cases: ConformanceCase[] = [];
  const run = options.commandRunner ?? defaultCommandRunner;
  const health = await doctor({ cwd: options.cwd });
  const dryRun = await init({ cwd: options.cwd, runtimes: [], dryRun: true, force: false });
  cases.push(conformanceCase("bootstrap.dry-run", dryRun.complete ? "VERIFICADO" : "FALLIDO", "ai-engineering init --dry-run", dryRun.complete ? "Dry-run completed without writing adoption state." : "Dry-run did not complete.", "Review init output before changing the target project."));
  const healthStatus: CheckStatus = health.complete ? "VERIFICADO" : "NO_VERIFICADO";
  cases.push(conformanceCase("doctor.readiness", healthStatus, "ai-engineering doctor --format json", health.complete ? "Doctor reports operational readiness." : "Doctor reports unresolved checks.", "Resolve the listed doctor checks; external access must be verified explicitly."));
  for (const check of health.checks.filter(({ id }) => id.startsWith("runtime."))) {
    cases.push(conformanceCase(check.id, check.status, "ai-engineering doctor --format json", check.evidence, check.remediation));
  }
  const gentleVersion = await run("gentle-ai", ["version"], options.cwd);
  cases.push(commandCase("gentle-ai.version", gentleVersion, "gentle-ai version", "Verify that Gentle-AI is available before trusting managed assets.", (result) => result.stdout.trim() || result.stderr.trim()));
  const syncPlan = await run("gentle-ai", ["sync", "--dry-run"], options.cwd);
  cases.push(commandCase("gentle-ai.sync-plan", syncPlan, "gentle-ai sync --dry-run", "Inspect the registered agents and managed components without applying changes.", summarizeSyncPlan));
  const gentleDoctor = await run("gentle-ai", ["doctor"], options.cwd);
  cases.push(commandCase("gentle-ai.doctor", gentleDoctor, "gentle-ai doctor", "Run the read-only ecosystem diagnostic.", summarizeDoctor));
  cases.push(contextContinuityCase(gentleDoctor));
  const blockers = health.checks.filter(({ status }) => status !== "VERIFICADO").map(({ id, status, remediation }) => `${id} [${status}]: ${remediation}`);
  const templates = await validateTemplates();
  cases.push(templates);
  blockers.push(...cases.filter(({ id, status }) => status !== "VERIFICADO" && !health.checks.some((healthCheck) => healthCheck.id === id)).map(({ id, status, remediation }) => `${id} [${status}]: ${remediation}`));
  return { command: "conformance", target: options.cwd, complete: cases.every(({ status }) => status === "VERIFICADO"), cases, externalBlockers: [...new Set(blockers)] };
}

function commandCase(id: string, result: CommandResult, command: string, remediation: string, evidence: (result: CommandResult) => string): ConformanceCase {
  const hasOutput = Boolean(result.stdout.trim() || result.stderr.trim());
  const status: CheckStatus = result.code === 0 ? (hasOutput ? "VERIFICADO" : "NO_VERIFICADO") : hasOutput ? "BLOQUEADO" : "NO_VERIFICADO";
  return conformanceCase(id, status, command, redact(evidence(result)), remediation, "local-command");
}

function summarizeSyncPlan(result: CommandResult): string {
  if (result.code !== 0) return redact(`${result.stderr || result.stdout}`);
  return redact(result.stdout.split("\n").filter((line) => /^(Agents|Managed components|Apply steps|Prepare steps|Pi background|OpenCode background)/.test(line)).join(" ")) || "Sync dry-run completed without a summarized plan.";
}

function summarizeDoctor(result: CommandResult): string {
  if (result.code !== 0) return redact(`${result.stderr || result.stdout}`);
  const lines = result.stdout.split("\n").filter((line) => /^\s*\[(ok|!!|xx)\]/.test(line));
  return redact(lines.join(" ")) || "Gentle-AI doctor completed without check output.";
}

function contextContinuityCase(result: CommandResult): ConformanceCase {
  const line = result.stdout.split("\n").find((entry) => entry.includes("engram:reachable"));
  if (line?.includes("[ok]")) return conformanceCase("context.continuity", "VERIFICADO", "gentle-ai doctor", redact(line.trim()), "Keep Engram reachable for context continuity.", "runtime-observation");
  if (line?.includes("[xx]")) return conformanceCase("context.continuity", "BLOQUEADO", "gentle-ai doctor", redact(line.trim()), "Repair the Engram MCP initialize handshake and rerun conformance.", "external");
  return conformanceCase("context.continuity", "NO_VERIFICADO", "gentle-ai doctor", "Engram reachability was not reported.", "Run a representative Engram/runtime check before claiming continuity.", "runtime-observation");
}

function redact(value: string): string {
  const home = process.env.HOME;
  const redactedHome = home ? value.replaceAll(home, "~") : value;
  return redactedHome.replaceAll(/(?:ghp|github_pat|sk)[_-][A-Za-z0-9_-]+/g, "<redacted-token>").trim();
}

async function validateTemplates(): Promise<ConformanceCase> {
  try {
    const files = (await readdir(TEMPLATE_ROOT)).filter((file) => file.endsWith(".md") && file !== "README.md").sort();
    if (files.length !== SUPPORTED_RUNTIMES.length) return conformanceCase("templates.portability", "FALLIDO", "pnpm pack", "Runtime template count does not match the supported runtime matrix.", "Restore one template per supported runtime.");
    for (const file of files) {
      const content = await readFile(join(TEMPLATE_ROOT, file), "utf8");
      if (!content.includes(".ai/SYSTEM.md") || !content.includes(".ai/rules/gentle-ai.md") || /(?:\/Users\/|\/home\/|[A-Za-z]:\\|sk-|api[_-]?key\s*[:=])/i.test(content)) {
        return conformanceCase("templates.portability", "FALLIDO", "pnpm pack", `${file} contains an invalid reference or sensitive-looking value.`, "Remove absolute paths and secrets from harness templates.");
      }
    }
    return conformanceCase("templates.portability", "VERIFICADO", "pnpm pack", "All runtime templates are relative, policy-linked and secret-free.", "Keep templates owned by the harness and use Gentle-AI for managed assets.");
  } catch (error: unknown) {
    return conformanceCase("templates.portability", "FALLIDO", "pnpm pack", error instanceof Error ? error.message : String(error), "Ensure the packaged templates directory is present.");
  }
}
