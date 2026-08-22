import assert from "node:assert/strict";
import test from "node:test";
import { auditPackageFiles } from "../src/core/package-audit.js";
import { HARNESS_VERSION } from "../src/core/types.js";

test("package audit accepts the owned package boundary", () => {
  const result = auditPackageFiles([{ path: "package.json" }, { path: "dist/src/cli.js" }, { path: "templates/codex/AGENTS.md" }], HARNESS_VERSION, HARNESS_VERSION);
  assert.equal(result.complete, true);
});

test("package audit rejects managed, source, and workspace paths", () => {
  const result = auditPackageFiles([{ path: ".ai/SYSTEM.md" }, { path: "src/cli.ts" }, { path: "dist/test/example.test.js" }, { path: "../../secret" }], "0.1.0", HARNESS_VERSION);
  assert.equal(result.complete, false);
  assert.equal(result.errors.length, 4);
});

test("package audit rejects version drift", () => {
  const result = auditPackageFiles([{ path: "package.json" }], "9.9.9", HARNESS_VERSION);
  assert.equal(result.complete, false);
  assert.match(result.errors[0], /Version mismatch/);
});
