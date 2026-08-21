import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";
import test from "node:test";
import { CommandRunner, conformance } from "../src/commands/conformance.js";

const execFileAsync = promisify(execFile);
const fixtureParent = join(process.cwd(), "test", "fixtures");

const fixtureCommandRunner: CommandRunner = async (_command, args) => {
  if (args[0] === "version") return { code: 0, stdout: "gentle-ai 2.4.0\n", stderr: "" };
  if (args[0] === "sync") return { code: 0, stdout: "gentle-ai sync — dry-run\nAgents: claude-code,opencode,pi,codex\nManaged components: engram, sdd, skills\nApply steps: 3\n", stderr: "" };
  return { code: 0, stdout: "  [ok] engram:reachable engram MCP reachable\n", stderr: "" };
};

async function createProject(): Promise<string> {
  const root = await mkdtemp(join(fixtureParent, "project-"));
  await mkdir(join(root, ".git"), { recursive: true });
  await mkdir(join(root, ".ai", "rules"), { recursive: true });
  await writeFile(join(root, ".ai", "SYSTEM.md"), "canonical\n");
  await writeFile(join(root, ".ai", "rules", "gentle-ai.md"), "orchestrator\n");
  return root;
}

test("conformance is read-only and exposes external blockers", async () => {
  const root = await createProject();
  try {
    const result = await conformance({ cwd: root, commandRunner: fixtureCommandRunner });
    assert.equal(result.command, "conformance");
    assert.equal(result.complete, false);
    assert.equal(result.cases.find((item) => item.id === "bootstrap.dry-run")?.status, "VERIFICADO");
    assert.equal(result.cases.find((item) => item.id === "templates.portability")?.status, "VERIFICADO");
    assert.equal(result.cases.filter((item) => item.id.startsWith("runtime.")).length, 4);
    assert.equal(result.cases.find((item) => item.id === "gentle-ai.sync-plan")?.status, "VERIFICADO");
    assert.equal(result.cases.find((item) => item.id === "context.continuity")?.status, "VERIFICADO");
    assert.equal(result.externalBlockers.some((blocker) => blocker.startsWith("harness.state")), true);
    await assert.rejects(readFile(join(root, ".ai-engineering", "state.json"), "utf8"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("compiled CLI emits conformance JSON and a readiness exit code", async () => {
  const root = await createProject();
  try {
    const cli = join(process.cwd(), "dist", "src", "cli.js");
    let stdout = "";
    try {
      ({ stdout } = await execFileAsync(process.execPath, [cli, "conformance", "--cwd", root, "--format", "json"]));
    } catch (error: unknown) {
      const result = error as { code?: number; stdout?: string };
      assert.equal(result.code, 2);
      stdout = result.stdout ?? "";
    }
    const report = JSON.parse(stdout) as { command: string; externalBlockers: string[] };
    assert.equal(report.command, "conformance");
    assert.ok(report.externalBlockers.length > 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("conformance keeps Gentle-AI command failures and context blockers explicit", async () => {
  const root = await createProject();
  try {
    const failingRunner: CommandRunner = async (_command, args) => {
      if (args[0] === "version") return { code: 1, stdout: "", stderr: "ghp_secret must not leak" };
      if (args[0] === "sync") return { code: 2, stdout: "", stderr: "sync unavailable" };
      return { code: 0, stdout: "[xx] engram:reachable initialize failed\n", stderr: "" };
    };
    const result = await conformance({ cwd: root, commandRunner: failingRunner });
    assert.equal(result.cases.find((item) => item.id === "gentle-ai.version")?.status, "BLOQUEADO");
    assert.equal(result.cases.find((item) => item.id === "gentle-ai.sync-plan")?.status, "BLOQUEADO");
    assert.equal(result.cases.find((item) => item.id === "context.continuity")?.status, "BLOQUEADO");
    assert.equal(result.cases.some((item) => item.evidence.includes("ghp_secret")), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
