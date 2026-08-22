import assert from "node:assert/strict";
import test from "node:test";
import { applyUiTooling } from "../src/core/ui-tooling-apply.js";

test("apply requires explicit confirmation", async () => {
  let invoked = false;
  const report = await applyUiTooling("impeccable", "/project", false, async () => { invoked = true; return { stdout: "", stderr: "", exitCode: 0 }; });
  assert.equal(report.complete, false);
  assert.equal(report.receipts[0]?.verification, "BLOQUEADO");
  assert.equal(invoked, false);
});

test("Impeccable apply is injectable and remains unverified", async () => {
  const report = await applyUiTooling("impeccable", "/project", true, async (command, args, cwd) => {
    assert.equal(command, "npx");
    assert.deepEqual(args, ["impeccable", "install", "--scope=project"]);
    assert.equal(cwd, "/project");
    return { stdout: "installed", stderr: "", exitCode: 0 };
  });
  assert.equal(report.complete, true);
  assert.equal(report.receipts[0]?.status, "APPLIED");
  assert.equal(report.receipts[0]?.verification, "NO_VERIFICADO");
});

test("Stitch apply remains blocked without a provider executor", async () => {
  const report = await applyUiTooling("stitch", "/project", true, async () => ({ stdout: "", stderr: "", exitCode: 0 }));
  assert.equal(report.complete, true);
  assert.equal(report.receipts[0]?.status, "BLOCKED");
  assert.match(report.receipts[0]?.evidence ?? "", /Gentle-AI/i);
});
