import assert from "node:assert/strict";
import test from "node:test";
import { ManualUiWorkflow } from "../src/core/manual-ui-workflow.js";

const artifact = { candidateId: "candidate-1", promptId: "prompt-1", revision: "rev-1", digest: "sha256:abc" };

test("manual fallback reaches delivery with explicit artifact and audit receipts", () => {
  const flow = new ManualUiWorkflow("candidate-1");
  flow.dispatchPrompt("prompt-1");
  flow.confirmClient("prompt-1");
  flow.recordArtifact(artifact);
  flow.startApply();
  flow.recordApplied("rev-1");
  flow.startAudit();
  flow.recordAudit({ candidateId: "candidate-1", revision: "rev-1", auditId: "audit-1", auditorVersion: "manual-audit-v1", status: "VERIFICADO", source: "MANUAL_FALLBACK" });
  const result = flow.prepareDelivery();
  assert.equal(result.workflow.state, "DELIVERY_READY");
  assert.equal(result.mode, "MANUAL_FALLBACK");
  assert.equal(result.liveMcp, "NO_VERIFICADO");
});

test("manual fallback blocks apply without an artifact receipt", () => {
  const flow = new ManualUiWorkflow("candidate-1");
  flow.dispatchPrompt("prompt-1");
  flow.confirmClient("prompt-1");
  assert.equal(flow.startApply().workflow.state, "BLOCKED");
});

test("manual fallback rejects mismatched audit receipts", () => {
  const flow = new ManualUiWorkflow("candidate-1");
  flow.dispatchPrompt("prompt-1");
  flow.confirmClient("prompt-1");
  flow.recordArtifact(artifact);
  flow.startApply();
  flow.recordApplied("rev-1");
  flow.startAudit();
  const result = flow.recordAudit({ candidateId: "candidate-1", revision: "rev-other", auditId: "audit-1", auditorVersion: "manual-audit-v1", status: "VERIFICADO", source: "MANUAL_FALLBACK" });
  assert.equal(result.workflow.state, "BLOCKED");
});
