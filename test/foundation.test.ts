import assert from "node:assert/strict";
import test from "node:test";
import { digest, stableJson } from "../src/core/digest.js";
import { discoverProject, resolveProjectRoot } from "../src/core/discovery.js";

test("stable JSON has a deterministic digest", () => {
  const first = { schemaVersion: 1, runtimes: ["codex"], metadata: { version: "0.1.0", format: "json" } };
  const second = { runtimes: ["codex"], metadata: { format: "json", version: "0.1.0" }, schemaVersion: 1 };
  assert.equal(stableJson(first), stableJson(second));
  assert.equal(digest(stableJson(first)), digest(stableJson(second)));
});

test("discovery recognizes the harness project", async () => {
  const root = await resolveProjectRoot(process.cwd());
  const discovery = await discoverProject(root);
  assert.equal(discovery.git, true);
  assert.equal(discovery.canonicalSources, true);
  assert.equal(discovery.instructionFiles.includes("AGENTS.md"), true);
});
