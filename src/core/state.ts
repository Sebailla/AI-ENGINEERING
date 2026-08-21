import { join } from "node:path";
import { digest, stableJson } from "./digest.js";
import { readUtf8 } from "./filesystem.js";
import { AdoptionState, HARNESS_VERSION, Runtime, STATE_SCHEMA_VERSION } from "./types.js";

export const STATE_DIRECTORY = ".ai-engineering";
export const STATE_FILE = "state.json";

export function statePath(root: string): string {
  return join(root, STATE_DIRECTORY, STATE_FILE);
}

export function createState(runtimes: Runtime[]): AdoptionState {
  const unsigned = {
    schemaVersion: STATE_SCHEMA_VERSION,
    harnessVersion: HARNESS_VERSION,
    runtimes: [...new Set(runtimes)].sort(),
    templates: [],
  };
  return { ...unsigned, stateDigest: digest(stableJson(unsigned)) };
}

export function serializeState(state: AdoptionState): string {
  return stableJson(state);
}

export function isIntactState(state: AdoptionState): boolean {
  const { stateDigest, ...unsigned } = state;
  return state.schemaVersion === STATE_SCHEMA_VERSION && typeof stateDigest === "string" && stateDigest === digest(stableJson(unsigned));
}

export async function loadState(root: string): Promise<{ state?: AdoptionState; error?: string }> {
  const raw = await readUtf8(statePath(root));
  if (raw === undefined) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!isAdoptionState(value)) return { error: "State has an unsupported shape." };
    return { state: value };
  } catch {
    return { error: "State is not valid JSON." };
  }
}

function isAdoptionState(value: unknown): value is AdoptionState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<AdoptionState>;
  return typeof state.schemaVersion === "number" && typeof state.harnessVersion === "string" && Array.isArray(state.runtimes) && Array.isArray(state.templates) && typeof state.stateDigest === "string";
}
