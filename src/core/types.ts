import { PACKAGE_METADATA } from "./package-metadata.js";

export const HARNESS_VERSION = PACKAGE_METADATA.version;
export const STATE_SCHEMA_VERSION = 1;

export const SUPPORTED_RUNTIMES = ["codex", "claude-code", "opencode", "pi"] as const;
export type Runtime = (typeof SUPPORTED_RUNTIMES)[number];

export interface ManagedTemplate {
  path: string;
  digest: string;
}

export interface AdoptionState {
  schemaVersion: number;
  harnessVersion: string;
  runtimes: Runtime[];
  templates: ManagedTemplate[];
  stateDigest: string;
}

export type PlanAction = "create" | "preserve" | "skip" | "overwrite";

export interface PlanEntry {
  path: string;
  action: PlanAction;
  reason: string;
}

export interface ProjectDiscovery {
  git: boolean;
  instructionFiles: string[];
  canonicalSources: boolean;
  detectedRuntimes: Runtime[];
}

export interface InitReport {
  command: "init";
  target: string;
  discovery: ProjectDiscovery;
  dryRun: boolean;
  complete: boolean;
  entries: PlanEntry[];
  warnings: string[];
}
