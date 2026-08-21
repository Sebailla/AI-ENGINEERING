import { discoverProject, resolveProjectRoot } from "../core/discovery.js";
import { writeAtomic } from "../core/filesystem.js";
import { createState, isIntactState, loadState, serializeState, statePath } from "../core/state.js";
import { HARNESS_VERSION, InitReport, Runtime, SUPPORTED_RUNTIMES } from "../core/types.js";

export interface InitOptions {
  cwd: string;
  runtimes: string[];
  dryRun: boolean;
  force: boolean;
}

export async function init(options: InitOptions): Promise<InitReport> {
  const root = await resolveProjectRoot(options.cwd);
  const discovery = await discoverProject(root);
  const runtimes = normalizeRuntimes(options.runtimes.length > 0 ? options.runtimes : discovery.detectedRuntimes);
  const target = ".ai-engineering/state.json";
  const report: InitReport = { command: "init", target: ".", discovery, dryRun: options.dryRun, complete: false, entries: [], warnings: [] };
  const loaded = await loadState(root);

  if (loaded.error) {
    report.entries.push({ path: target, action: options.force ? "overwrite" : "preserve", reason: loaded.error });
    if (!options.force) {
      report.warnings.push("Existing state was preserved. Re-run with --force after reviewing it.");
      return report;
    }
  } else if (loaded.state) {
    if (!isIntactState(loaded.state)) {
      report.entries.push({ path: target, action: options.force ? "overwrite" : "preserve", reason: "State digest does not match; it may have been modified outside the harness." });
      if (!options.force) {
        report.warnings.push("Modified state was preserved. Re-run with --force after reviewing it.");
        return report;
      }
    } else if (loaded.state.harnessVersion !== HARNESS_VERSION) {
      report.entries.push({ path: target, action: "overwrite", reason: "Harness version changed; state will be migrated." });
    } else if (sameRuntimes(loaded.state.runtimes, runtimes)) {
      report.entries.push({ path: target, action: "skip", reason: "Existing harness state matches the requested configuration." });
      report.complete = true;
      return report;
    } else {
      report.entries.push({ path: target, action: "overwrite", reason: "Requested runtimes differ from the recorded harness state." });
    }
  } else {
    report.entries.push({ path: target, action: "create", reason: "No harness adoption state exists." });
  }

  if (!options.dryRun) await writeAtomic(statePath(root), serializeState(createState(runtimes)));
  report.complete = true;
  return report;
}

function normalizeRuntimes(values: string[]): Runtime[] {
  const runtimes = values.length === 0 ? [] : values;
  const unsupported = runtimes.filter((runtime) => !SUPPORTED_RUNTIMES.includes(runtime as Runtime));
  if (unsupported.length > 0) throw new Error(`Unsupported runtime: ${unsupported.join(", ")}.`);
  return [...new Set(runtimes as Runtime[])].sort();
}

function sameRuntimes(left: Runtime[], right: Runtime[]): boolean {
  return left.length === right.length && left.every((runtime, index) => runtime === right[index]);
}
