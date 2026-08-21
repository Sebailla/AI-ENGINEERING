import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";
import test from "node:test";
import { init } from "../src/commands/init.js";
import { digest, stableJson } from "../src/core/digest.js";

const execFileAsync = promisify(execFile);
const fixtureParent = join(process.cwd(), "test", "fixtures");

async function createProject(): Promise<string> {
  await mkdir(fixtureParent, { recursive: true });
  const root = await mkdtemp(join(fixtureParent, "project-"));
  await mkdir(join(root, ".git"));
  return root;
}

async function removeProject(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}

test("adopts an empty Git project with portable state", async () => {
  const root = await createProject();
  try {
    const report = await init({ cwd: root, runtimes: ["codex"], dryRun: false, force: false });
    const raw = await readFile(join(root, ".ai-engineering", "state.json"), "utf8");
    assert.equal(report.complete, true);
    assert.deepEqual(report.entries.map((entry) => entry.action), ["create"]);
    assert.equal(raw.includes(root), false);
    assert.deepEqual(JSON.parse(raw).runtimes, ["codex"]);
  } finally {
    await removeProject(root);
  }
});

test("dry-run creates no bytes", async () => {
  const root = await createProject();
  try {
    const report = await init({ cwd: root, runtimes: [], dryRun: true, force: false });
    assert.equal(report.complete, true);
    assert.equal(report.dryRun, true);
    await assert.rejects(readFile(join(root, ".ai-engineering", "state.json"), "utf8"));
  } finally {
    await removeProject(root);
  }
});

test("a repeated init is idempotent", async () => {
  const root = await createProject();
  try {
    await init({ cwd: root, runtimes: ["pi", "codex"], dryRun: false, force: false });
    const before = await readFile(join(root, ".ai-engineering", "state.json"), "utf8");
    const report = await init({ cwd: root, runtimes: ["codex", "pi"], dryRun: false, force: false });
    const after = await readFile(join(root, ".ai-engineering", "state.json"), "utf8");
    assert.equal(report.complete, true);
    assert.deepEqual(report.entries.map((entry) => entry.action), ["skip"]);
    assert.equal(after, before);
  } finally {
    await removeProject(root);
  }
});

test("migrates an intact state created by an older harness version", async () => {
  const root = await createProject();
  try {
    const file = join(root, ".ai-engineering", "state.json");
    await init({ cwd: root, runtimes: ["codex"], dryRun: false, force: false });
    const previous = JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
    previous.harnessVersion = "0.0.9";
    const { stateDigest: _, ...unsigned } = previous;
    previous.stateDigest = digest(stableJson(unsigned));
    await writeFile(file, stableJson(previous));

    const report = await init({ cwd: root, runtimes: ["codex"], dryRun: false, force: false });
    assert.equal(report.complete, true);
    assert.deepEqual(report.entries.map((entry) => entry.action), ["overwrite"]);
    assert.equal((await readFile(file, "utf8")).includes('"harnessVersion": "0.1.0"'), true);
  } finally {
    await removeProject(root);
  }
});

test("preserves modified harness state unless force is explicit", async () => {
  const root = await createProject();
  try {
    const file = join(root, ".ai-engineering", "state.json");
    await init({ cwd: root, runtimes: ["codex"], dryRun: false, force: false });
    const original = await readFile(file, "utf8");
    await writeFile(file, original.replace('"harnessVersion": "0.1.0"', '"harnessVersion": "user-change"'));

    const preserved = await init({ cwd: root, runtimes: ["codex"], dryRun: false, force: false });
    assert.equal(preserved.complete, false);
    assert.deepEqual(preserved.entries.map((entry) => entry.action), ["preserve"]);
    assert.equal(await readFile(file, "utf8"), original.replace('"harnessVersion": "0.1.0"', '"harnessVersion": "user-change"'));

    const forced = await init({ cwd: root, runtimes: ["codex"], dryRun: false, force: true });
    assert.equal(forced.complete, true);
    assert.deepEqual(forced.entries.map((entry) => entry.action), ["overwrite"]);
    assert.equal((await readFile(file, "utf8")).includes('"harnessVersion": "0.1.0"'), true);
  } finally {
    await removeProject(root);
  }
});

test("compiled CLI reports dry-run JSON without writing", async () => {
  const root = await createProject();
  try {
    const cli = join(process.cwd(), "dist", "src", "cli.js");
    const { stdout } = await execFileAsync(process.execPath, [cli, "init", "--cwd", root, "--runtime", "opencode", "--dry-run", "--format", "json"]);
    const report = JSON.parse(stdout);
    assert.equal(report.complete, true);
    assert.equal(report.dryRun, true);
    await assert.rejects(readFile(join(root, ".ai-engineering", "state.json"), "utf8"));
  } finally {
    await removeProject(root);
  }
});
