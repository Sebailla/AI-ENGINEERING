import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";
import test from "node:test";
import { doctor } from "../src/commands/doctor.js";

const execFileAsync = promisify(execFile);
const fixtureParent = join(process.cwd(), "test", "fixtures");

async function createProject(): Promise<string> {
  const root = await mkdtemp(join(fixtureParent, "project-"));
  await mkdir(join(root, ".git"), { recursive: true });
  await mkdir(join(root, ".ai", "rules"), { recursive: true });
  await writeFile(join(root, ".ai", "SYSTEM.md"), "canonical\n");
  await writeFile(join(root, ".ai", "rules", "gentle-ai.md"), "orchestrator\n");
  await writeFile(join(root, ".git", "config"), '[remote "origin"]\n\turl = https://github.com/example/project.git\n');
  return root;
}

test("doctor reports structured, honest checks", async () => {
  const root = await createProject();
  try {
    const result = await doctor({ cwd: root });
    assert.equal(result.command, "doctor");
    assert.equal(result.complete, false);
    assert.equal(result.checks.find((check) => check.id === "project.canonical-sources")?.status, "VERIFICADO");
    assert.equal(result.checks.find((check) => check.id === "harness.state")?.status, "NO_VERIFICADO");
    assert.equal(result.checks.find((check) => check.id === "delivery.git-remote")?.status, "VERIFICADO");
    assert.equal(result.checks.some((check) => check.evidence.includes("https://")), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("doctor detects the workspace-scoped Gentle-AI OpenCode adapter", async () => {
  const root = await createProject();
  try {
    await mkdir(join(root, ".config", "opencode"), { recursive: true });
    await writeFile(join(root, ".config", "opencode", "opencode.json"), "{}\n");
    const result = await doctor({ cwd: root });
    assert.equal(result.checks.find((check) => check.id === "runtime.opencode")?.status, "VERIFICADO");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("compiled CLI emits doctor JSON", async () => {
  const root = await createProject();
  try {
    const cli = join(process.cwd(), "dist", "src", "cli.js");
    let stdout = "";
    try {
      ({ stdout } = await execFileAsync(process.execPath, [cli, "doctor", "--cwd", root, "--format", "json"]));
    } catch (error: unknown) {
      const result = error as { code?: number; stdout?: string };
      assert.equal(result.code, 2);
      stdout = result.stdout ?? "";
    }
    const result = JSON.parse(stdout) as { command: string; checks: unknown[] };
    assert.equal(result.command, "doctor");
    assert.ok(result.checks.length >= 10);
    await assert.rejects(readFile(join(root, ".ai-engineering", "state.json"), "utf8"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
