import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { conformanceCase, ConformanceCase, ConformanceReport } from "../core/conformance.js";
import { doctor } from "./doctor.js";
import { init } from "./init.js";
import { CheckStatus } from "../core/report.js";
import { SUPPORTED_RUNTIMES } from "../core/types.js";

export interface ConformanceOptions { cwd: string; }
const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../templates/runtime");

export async function conformance(options: ConformanceOptions): Promise<ConformanceReport> {
  const cases: ConformanceCase[] = [];
  const health = await doctor({ cwd: options.cwd });
  const dryRun = await init({ cwd: options.cwd, runtimes: [], dryRun: true, force: false });
  cases.push(conformanceCase("bootstrap.dry-run", dryRun.complete ? "VERIFICADO" : "FALLIDO", "ai-engineering init --dry-run", dryRun.complete ? "Dry-run completed without writing adoption state." : "Dry-run did not complete.", "Review init output before changing the target project."));
  const healthStatus: CheckStatus = health.complete ? "VERIFICADO" : "NO_VERIFICADO";
  cases.push(conformanceCase("doctor.readiness", healthStatus, "ai-engineering doctor --format json", health.complete ? "Doctor reports operational readiness." : "Doctor reports unresolved checks.", "Resolve the listed doctor checks; external access must be verified explicitly."));
  for (const check of health.checks.filter(({ id }) => id.startsWith("runtime."))) {
    cases.push(conformanceCase(check.id, check.status, "ai-engineering doctor --format json", check.evidence, check.remediation));
  }
  const blockers = health.checks.filter(({ status }) => status !== "VERIFICADO").map(({ id, status, remediation }) => `${id} [${status}]: ${remediation}`);
  const templates = await validateTemplates();
  cases.push(templates);
  return { command: "conformance", target: options.cwd, complete: cases.every(({ status }) => status === "VERIFICADO"), cases, externalBlockers: blockers };
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
