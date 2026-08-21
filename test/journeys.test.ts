import assert from "node:assert/strict";
import test from "node:test";
import { evaluateJourney, RuntimeJourney } from "../src/core/journeys.js";

const journey: RuntimeJourney = {
  id: "codex.authority-probe",
  runtime: "codex",
  command: "codex",
  args: ["--probe"],
  prompt: "Identify the active operational authority and stop.",
  expectedEvidence: "Gentle-AI",
  negativeControl: "Remove the adapter and expect NO_VERIFICADO.",
};

test("journey evaluation verifies expected foreground evidence and redacts secrets", () => {
  const result = evaluateJourney(journey, { code: 0, supported: true, stdout: "/Users/sebailla/project Gentle-AI sk-test_secret", stderr: "" }, "/Users/sebailla");
  assert.equal(result.status, "VERIFICADO");
  assert.equal(result.evidence, "~/project Gentle-AI <redacted-token>");
});

test("unsupported foreground adapters remain unverified", () => {
  const result = evaluateJourney(journey, { code: 0, supported: false, stdout: "", stderr: "" });
  assert.equal(result.status, "NO_VERIFICADO");
});

test("failed journeys are distinct from unsupported journeys", () => {
  const result = evaluateJourney(journey, { code: 1, supported: true, stdout: "", stderr: "provider unavailable" });
  assert.equal(result.status, "FALLIDO");
  assert.match(result.evidence, /provider unavailable/);
});

test("missing authority evidence does not become a false success", () => {
  const result = evaluateJourney(journey, { code: 0, supported: true, stdout: "ready", stderr: "" });
  assert.equal(result.status, "NO_VERIFICADO");
});
