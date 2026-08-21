#!/usr/bin/env node
import { init } from "./commands/init.js";
import { doctor } from "./commands/doctor.js";
import { conformance } from "./commands/conformance.js";

function usage(): string {
  return "Usage: ai-engineering init|doctor|conformance [--cwd <project>] [--runtime <name>]... [--dry-run] [--force] [--format text|json]";
}

async function main(): Promise<void> {
  const [command, ...arguments_] = process.argv.slice(2);
  if (command !== "init" && command !== "doctor" && command !== "conformance") throw new Error(usage());

  const options = { cwd: process.cwd(), runtimes: [] as string[], dryRun: false, force: false, format: "text" };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    const value = arguments_[index + 1];
    if (argument === "--cwd" && value) { options.cwd = value; index += 1; }
    else if (argument === "--runtime" && value) { options.runtimes.push(value); index += 1; }
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--format" && (value === "text" || value === "json")) { options.format = value; index += 1; }
    else throw new Error(`Unknown or incomplete argument: ${argument}`);
  }

  if (command === "doctor") {
    const report = await doctor({ cwd: options.cwd });
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`doctor: ${report.complete ? "complete" : "incomplete"}`);
      for (const check of report.checks) console.log(`${check.status}: ${check.id} — ${check.evidence}`);
    }
    if (!report.complete) process.exitCode = 2;
    return;
  }

  if (command === "conformance") {
    const report = await conformance({ cwd: options.cwd });
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`conformance: ${report.complete ? "complete" : "incomplete"}`);
      for (const item of report.cases) console.log(`${item.status}: ${item.id} — ${item.evidence}`);
      for (const blocker of report.externalBlockers) console.log(`blocker: ${blocker}`);
    }
    if (!report.complete) process.exitCode = 2;
    return;
  }

  const report = await init(options);
  if (options.format === "json") console.log(JSON.stringify(report));
  else {
    console.log(`init: ${report.complete ? "complete" : "incomplete"}${report.dryRun ? " (dry run)" : ""}`);
    for (const entry of report.entries) console.log(`${entry.action}: ${entry.path} — ${entry.reason}`);
    for (const warning of report.warnings) console.log(`warning: ${warning}`);
  }
  if (!report.complete) process.exitCode = 2;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
