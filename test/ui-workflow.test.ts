import assert from "node:assert/strict";
import test from "node:test";
import { UiWorkflow } from "../src/core/ui-workflow.js";

test("UI workflow requires client confirmation and a verified audit before delivery", () => {
  const workflow = new UiWorkflow("candidate-1");
  workflow.dispatchPrompt("prompt-1");
  workflow.awaitClientConfirmation();
  workflow.confirmClient("prompt-1");
  workflow.startApply();
  workflow.recordApplied("revision-1");
  workflow.startAudit();
  workflow.recordAudit({ auditId: "audit-1", revision: "revision-1", auditVersion: "4.1.1", status: "VERIFICADO" });
  assert.equal(workflow.prepareDelivery().state, "DELIVERY_READY");
});

test("wrong candidate confirmation blocks without losing the prompt identity", () => {
  const workflow = new UiWorkflow("candidate-1");
  workflow.dispatchPrompt("prompt-1");
  workflow.awaitClientConfirmation();
  const result = workflow.confirmClient("prompt-other");
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.blockedFrom, "AWAITING_CLIENT_CONFIRMATION");
  assert.equal(result.promptId, "prompt-1");
});

test("apply cannot start before confirmation", () => {
  const result = new UiWorkflow("candidate-1").startApply();
  assert.equal(result.state, "BLOCKED");
  assert.match(result.blockReason ?? "", /Cannot transition/);
});

test("an unverified audit blocks delivery", () => {
  const workflow = new UiWorkflow("candidate-1");
  workflow.dispatchPrompt("prompt-1");
  workflow.awaitClientConfirmation();
  workflow.confirmClient("prompt-1");
  workflow.startApply();
  workflow.recordApplied("revision-1");
  workflow.startAudit();
  assert.equal(workflow.recordAudit({ auditId: "audit-1", revision: "revision-1", auditVersion: "4.1.1", status: "NO_VERIFICADO" }).state, "BLOCKED");
});

test("audit evidence cannot authorize delivery for another applied revision", () => {
  const workflow = new UiWorkflow("candidate-1");
  workflow.dispatchPrompt("prompt-1");
  workflow.awaitClientConfirmation();
  workflow.confirmClient("prompt-1");
  workflow.startApply();
  workflow.recordApplied("revision-1");
  workflow.startAudit();
  assert.equal(workflow.recordAudit({ auditId: "audit-1", revision: "revision-other", auditVersion: "4.1.1", status: "VERIFICADO" }).state, "BLOCKED");
});
