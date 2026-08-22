import assert from "node:assert/strict";
import test from "node:test";
import { planUiTooling } from "../src/core/ui-tooling.js";

test("manual UI tooling is the safe default", () => {
  assert.deepEqual(planUiTooling("manual"), { profile: "manual", steps: [], fallback: "MANUAL_FALLBACK" });
});

test("Impeccable remains an explicit external install", () => {
  const plan = planUiTooling("impeccable");
  assert.equal(plan.steps[0]?.action, "external");
  assert.equal(plan.steps[0]?.command, "npx impeccable@4.1.1 install --scope=project");
  assert.equal(plan.steps[0]?.verification, "NO_VERIFICADO");
});

test("Stitch blocks without credentials", () => {
  const plan = planUiTooling("stitch", {});
  assert.equal(plan.steps[0]?.action, "blocked");
  assert.match(plan.steps[0]?.reason ?? "", /credentials are missing/i);
});

test("full profile plans both tools and keeps the fallback", () => {
  const plan = planUiTooling("full", { STITCH_API_KEY: "test-only" });
  assert.deepEqual(plan.steps.map((step) => step.id), ["impeccable", "stitch"]);
  assert.equal(plan.steps[1]?.action, "external");
  assert.equal(plan.fallback, "MANUAL_FALLBACK");
});
