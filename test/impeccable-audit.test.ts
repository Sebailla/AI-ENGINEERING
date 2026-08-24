import assert from "node:assert/strict";
import test from "node:test";
import { ImpeccableAuditClientLike, ImpeccableAuditResult, verifyImpeccableAudit } from "../src/core/impeccable-audit.js";

const request = { candidateId: "candidate-1", revision: "rev-1" };

function fakeClient(result: ImpeccableAuditResult, shouldFail = false): ImpeccableAuditClientLike {
  return {
    async audit() {
      if (shouldFail) throw new Error("IMPECCABLE_TOKEN=secret");
      return result;
    },
    async close() { return undefined; },
  };
}

test("Impeccable verification binds a verified receipt to the applied candidate and version", async () => {
  const report = await verifyImpeccableAudit(request, fakeClient({ auditId: "audit-1", candidateId: "candidate-1", revision: "rev-1", status: "VERIFICADO", impeccableVersion: "4.1.1", findings: [] }));
  assert.equal(report.status, "VERIFICADO");
  assert.equal(report.impeccableVersion, "4.1.1");
  assert.equal(report.revision, "rev-1");
});

test("Impeccable verification declares a missing MCP bridge as an external blocker", async () => {
  const report = await verifyImpeccableAudit(request);
  assert.equal(report.status, "NO_VERIFICADO");
  assert.equal(report.source, "EXTERNAL_BLOCKER");
  assert.match(report.evidence, /no audit call was attempted/i);
});

test("Impeccable verification blocks a failed audit and redacts credentials", async () => {
  const report = await verifyImpeccableAudit(request, fakeClient({}, true));
  assert.equal(report.status, "FALLIDO");
  assert.match(report.evidence, /IMPECCABLE_TOKEN=<redacted>/);
  assert.doesNotMatch(report.evidence, /secret/);
});

test("Impeccable verification rejects a receipt for another revision", async () => {
  const report = await verifyImpeccableAudit(request, fakeClient({ auditId: "audit-1", candidateId: "candidate-1", revision: "rev-other", status: "VERIFICADO", impeccableVersion: "4.1.1" }));
  assert.equal(report.status, "NO_VERIFICADO");
});
