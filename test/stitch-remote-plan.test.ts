import assert from "node:assert/strict";
import test from "node:test";
import { planStitchConnection, STITCH_DEFAULT_ENDPOINT } from "../src/core/stitch-remote-plan.js";

test("Stitch plan defaults to a missing, Gentle-AI-delegated connection", () => {
  const plan = planStitchConnection({});
  assert.equal(plan.endpoint, STITCH_DEFAULT_ENDPOINT);
  assert.equal(plan.authMode, "missing");
  assert.equal(plan.owner, "gentle-ai");
  assert.equal(plan.registration, "DELEGATED");
  assert.equal(plan.verification, "NO_VERIFICADO");
  assert.deepEqual(plan.requiredEnv, ["STITCH_API_KEY or STITCH_ACCESS_TOKEN + GOOGLE_CLOUD_PROJECT"]);
});

test("Stitch plan identifies API-key auth without exposing its value", () => {
  const plan = planStitchConnection({ STITCH_API_KEY: "secret-value" });
  assert.equal(plan.authMode, "api-key");
  assert.equal(JSON.stringify(plan).includes("secret-value"), false);
});

test("Stitch plan identifies OAuth and allows a reviewed endpoint override", () => {
  const plan = planStitchConnection({ STITCH_ACCESS_TOKEN: "secret-value", GOOGLE_CLOUD_PROJECT: "project-id", STITCH_HOST: "https://stitch.example.test/mcp" });
  assert.equal(plan.authMode, "oauth");
  assert.equal(plan.endpoint, "https://stitch.example.test/mcp");
  assert.equal(JSON.stringify(plan).includes("secret-value"), false);
});
