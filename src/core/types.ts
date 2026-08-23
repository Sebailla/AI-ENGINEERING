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
  uiTooling: UiToolingPlan;
}

export type UiToolingProfile = "manual" | "impeccable" | "stitch" | "full";
export type UiToolingAction = "preserve" | "external" | "blocked";
export type VerificationStatus = "VERIFICADO" | "NO_VERIFICADO" | "BLOQUEADO";
export type StitchAuthMode = "api-key" | "oauth" | "missing";

export interface StitchConnectionPlan {
  endpoint: string;
  authMode: StitchAuthMode;
  owner: "gentle-ai";
  registration: "DELEGATED";
  requiredEnv: string[];
  verification: "NO_VERIFICADO";
}

export interface UiToolingStep {
  id: "impeccable" | "stitch";
  action: UiToolingAction;
  owner: "harness" | "gentle-ai" | "external";
  command?: string;
  requiredEnv: string[];
  verification: VerificationStatus;
  reason: string;
  connection?: StitchConnectionPlan;
}

export interface UiToolingPlan {
  profile: UiToolingProfile;
  steps: UiToolingStep[];
  fallback: "MANUAL_FALLBACK";
}

export interface UiToolingReceipt {
  id: "impeccable" | "stitch";
  command?: string;
  status: "APPLIED" | "BLOCKED" | "FAILED";
  verification: VerificationStatus;
  evidence: string;
}

export interface UiToolingApplyReport {
  profile: UiToolingProfile;
  confirmed: boolean;
  complete: boolean;
  receipts: UiToolingReceipt[];
  fallback: "MANUAL_FALLBACK";
}
