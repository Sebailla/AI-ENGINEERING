import assert from "node:assert/strict";
import test from "node:test";
import { verifyStitchMcp, StitchToolClientLike } from "../src/core/stitch-verify.js";

function fakeClient(tools: string[], shouldFail = false): StitchToolClientLike {
  return {
    async listTools() {
      if (shouldFail) throw new Error("STITCH_API_KEY=secret");
      return { tools: tools.map((name) => ({ name })) };
    },
    async close() { return undefined; },
  };
}

test("stitch verification records live tool evidence", async () => {
  const report = await verifyStitchMcp({ STITCH_API_KEY: "configured" }, fakeClient(["z_tool", "a_tool"]));
  assert.equal(report.status, "VERIFICADO");
  assert.deepEqual(report.tools, ["a_tool", "z_tool"]);
  assert.equal(report.toolCount, 2);
});

test("stitch verification blocks without credentials", async () => {
  const report = await verifyStitchMcp({}, fakeClient(["tool"]));
  assert.equal(report.status, "BLOQUEADO");
  assert.equal(report.toolCount, 0);
});

test("stitch verification redacts credential-shaped errors", async () => {
  const report = await verifyStitchMcp({ STITCH_API_KEY: "configured" }, fakeClient([], true));
  assert.equal(report.status, "FALLIDO");
  assert.match(report.evidence, /STITCH_API_KEY=<redacted>/);
  assert.doesNotMatch(report.evidence, /secret/);
});
