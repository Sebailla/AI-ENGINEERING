import { CheckStatus } from "./report.js";

export interface ConformanceCase {
  id: string;
  status: CheckStatus;
  command: string;
  evidence: string;
  remediation: string;
  source?: "local-command" | "runtime-observation" | "external";
}

export interface ConformanceReport {
  command: "conformance";
  target: string;
  complete: boolean;
  cases: ConformanceCase[];
  externalBlockers: string[];
}

export function conformanceCase(id: string, status: CheckStatus, command: string, evidence: string, remediation: string, source: ConformanceCase["source"] = "local-command"): ConformanceCase {
  return { id, status, command, evidence, remediation, source };
}
