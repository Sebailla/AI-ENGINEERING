#!/usr/bin/env node
import { init } from "./commands/init.js";
import { doctor } from "./commands/doctor.js";
import { conformance } from "./commands/conformance.js";
import { packageAudit } from "./commands/package-audit.js";
import { releaseCheck } from "./commands/release-check.js";
import { UiToolingProfile } from "./core/types.js";
import { uiToolingApply } from "./commands/ui-tooling-apply.js";
import { stitchVerify } from "./commands/stitch-verify.js";
import { impeccableVerify } from "./commands/impeccable-verify.js";

function usage(): string {
  return "Usage: ai-engineering init|doctor|conformance|package-audit|release-check|ui-tooling-apply|stitch-verify|impeccable-verify [--candidate <id>] [--revision <revision>] [--cwd <project>] [--runtime <name>]... [--ui-tooling manual|impeccable|stitch|full] [--dry-run] [--apply] [--force] [--format text|json]";
}

async function main(): Promise<void> {
  const [command, ...arguments_] = process.argv.slice(2);
  if (command !== "init" && command !== "doctor" && command !== "conformance" && command !== "package-audit" && command !== "release-check" && command !== "ui-tooling-apply" && command !== "stitch-verify" && command !== "impeccable-verify") throw new Error(usage());

  const options = { cwd: process.cwd(), runtimes: [] as string[], dryRun: false, apply: false, force: false, format: "text", uiTooling: "manual" as UiToolingProfile, candidateId: "", revision: "" };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    const value = arguments_[index + 1];
    if (argument === "--cwd" && value) { options.cwd = value; index += 1; }
    else if (argument === "--runtime" && value) { options.runtimes.push(value); index += 1; }
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--apply") options.apply = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--candidate" && value) { options.candidateId = value; index += 1; }
    else if (argument === "--revision" && value) { options.revision = value; index += 1; }
    else if (argument === "--ui-tooling" && value && ["manual", "impeccable", "stitch", "full"].includes(value)) { options.uiTooling = value as UiToolingProfile; index += 1; }
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

  if (command === "package-audit") {
    const report = await packageAudit(options.cwd);
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`package-audit: ${report.complete ? "complete" : "incomplete"}`);
      for (const file of report.files) console.log(`file: ${file}`);
      for (const error of report.errors) console.log(`error: ${error}`);
    }
    if (!report.complete) process.exitCode = 2;
    return;
  }

  if (command === "release-check") {
    const report = await releaseCheck(options.cwd);
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`release-check: ${report.complete ? "complete" : "incomplete"} (${report.version})`);
      for (const error of report.errors) console.log(`error: ${error}`);
    }
    if (!report.complete) process.exitCode = 2;
    return;
  }

  if (command === "ui-tooling-apply") {
    const report = await uiToolingApply({ cwd: options.cwd, profile: options.uiTooling, confirmed: options.apply });
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`ui-tooling-apply: ${report.complete ? "complete" : "blocked"}`);
      for (const receipt of report.receipts) console.log(`${receipt.status}: ${receipt.id} — ${receipt.verification} — ${receipt.evidence}`);
    }
    if (!report.complete) process.exitCode = 2;
    return;
  }

  if (command === "stitch-verify") {
    const report = await stitchVerify();
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`stitch-verify: ${report.status}`);
      console.log(`endpoint: ${report.endpoint}`);
      console.log(`auth: ${report.authMode}`);
      console.log(`tools: ${report.toolCount}`);
      console.log(`evidence: ${report.evidence}`);
    }
    if (report.status !== "VERIFICADO") process.exitCode = 2;
    return;
  }

  if (command === "impeccable-verify") {
    if (!options.candidateId || !options.revision) throw new Error("impeccable-verify requires --candidate and --revision.");
    const report = await impeccableVerify({ candidateId: options.candidateId, revision: options.revision });
    if (options.format === "json") console.log(JSON.stringify(report));
    else {
      console.log(`impeccable-verify: ${report.status}`);
      console.log(`source: ${report.source}`);
      console.log(`evidence: ${report.evidence}`);
      console.log(`remediation: ${report.remediation}`);
    }
    if (report.status !== "VERIFICADO") process.exitCode = 2;
    return;
  }

  const report = await init(options);
  if (options.format === "json") console.log(JSON.stringify(report));
  else {
    console.log(`init: ${report.complete ? "complete" : "incomplete"}${report.dryRun ? " (dry run)" : ""}`);
    for (const entry of report.entries) console.log(`${entry.action}: ${entry.path} — ${entry.reason}`);
    for (const warning of report.warnings) console.log(`warning: ${warning}`);
    for (const step of report.uiTooling.steps) console.log(`ui-tooling: ${step.id} ${step.action} — ${step.verification}`);
  }
  if (!report.complete) process.exitCode = 2;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
