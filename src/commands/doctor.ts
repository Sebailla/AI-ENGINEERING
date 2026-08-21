import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve } from "node:path";
import { discoverProject, resolveProjectRoot } from "../core/discovery.js";
import { loadState, isIntactState } from "../core/state.js";
import { DoctorCheck, DoctorReport } from "../core/report.js";
import { SUPPORTED_RUNTIMES } from "../core/types.js";
import { readUtf8 } from "../core/filesystem.js";

export interface DoctorOptions { cwd: string; }

export async function doctor(options: DoctorOptions): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];
  let root: string;
  try {
    root = await resolveProjectRoot(options.cwd);
    checks.push(check("project.root", "VERIFICADO", "Project root is a recognized project directory.", "Run from a Git project or provide --cwd."));
  } catch (error: unknown) {
    checks.push(check("project.root", "FALLIDO", message(error), "Provide --cwd pointing to a real project directory."));
    return report(options.cwd, checks);
  }

  const discovery = await discoverProject(root);
  checks.push(check("project.git", discovery.git ? "VERIFICADO" : "BLOQUEADO", discovery.git ? "Git metadata detected." : "Git metadata is missing.", "Initialize Git before adopting the harness."));
  checks.push(check("project.canonical-sources", discovery.canonicalSources ? "VERIFICADO" : "BLOQUEADO", discovery.canonicalSources ? "Canonical .ai sources are present." : "Canonical .ai sources are incomplete.", "Restore .ai/SYSTEM.md and .ai/rules/gentle-ai.md from the base."));

  const state = await loadState(root);
  if (state.error) checks.push(check("harness.state", "FALLIDO", state.error, "Review the state file or rerun init --force after preserving user changes."));
  else if (!state.state) checks.push(check("harness.state", "NO_VERIFICADO", "No adoption state exists yet.", "Run ai-engineering init --dry-run, review the plan, then run ai-engineering init."));
  else checks.push(check("harness.state", isIntactState(state.state) ? "VERIFICADO" : "FALLIDO", isIntactState(state.state) ? "Adoption state digest is valid." : "Adoption state digest does not match its content.", "Review the file and use init --force only after confirming the change is safe."));

  for (const runtime of SUPPORTED_RUNTIMES) {
    const detected = discovery.detectedRuntimes.includes(runtime);
    checks.push(check(`runtime.${runtime}`, detected ? "VERIFICADO" : "NO_VERIFICADO", detected ? `${runtime} workspace configuration detected.` : `No ${runtime} workspace configuration detected.`, `Configure ${runtime} through its supported runtime or Gentle-AI flow.`));
  }

  for (const tool of ["gentle-ai", "pnpm", "codegraph"]) {
    const available = await executableOnPath(tool);
    checks.push(check(`tool.${tool}`, available ? "VERIFICADO" : "NO_VERIFICADO", available ? `${tool} is available on PATH.` : `${tool} was not found on PATH.`, `Install or expose ${tool} before relying on this capability.`));
  }

  const remote = await hasOriginRemote(root);
  checks.push(check("delivery.git-remote", remote ? "VERIFICADO" : "NO_VERIFICADO", remote ? "An origin remote is configured." : "No origin remote is configured.", "Configure a reviewed Git remote before publication."));
  checks.push(check("delivery.github-project", "NO_VERIFICADO", "Project access is external state and is not inferred from local files.", "Verify gh auth and the applicable GitHub Project explicitly."));
  return report(root, checks);
}

function check(id: string, status: DoctorCheck["status"], evidence: string, remediation: string): DoctorCheck { return { id, status, evidence, remediation }; }
function report(target: string, checks: DoctorCheck[]): DoctorReport {
  const unresolved = checks.some(({ id, status }) => status !== "VERIFICADO" && !id.startsWith("runtime."));
  return { command: "doctor", target, complete: !unresolved, checks };
}
function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }

async function executableOnPath(name: string): Promise<boolean> {
  for (const directory of (process.env.PATH ?? "").split(":").filter(Boolean)) {
    try { await access(join(directory, name), constants.X_OK); return true; } catch { /* continue */ }
  }
  return false;
}

async function hasOriginRemote(root: string): Promise<boolean> {
  const gitConfig = await readUtf8(resolve(root, ".git", "config"));
  return gitConfig !== undefined && /\[remote\s+"origin"\]/.test(gitConfig);
}
