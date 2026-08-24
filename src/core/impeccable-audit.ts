import { CheckStatus } from "./report.js";

export interface ImpeccableAuditRequest {
  candidateId: string;
  revision: string;
}

export interface ImpeccableAuditResult {
  auditId?: string;
  candidateId?: string;
  revision?: string;
  status?: "VERIFICADO" | "NO_VERIFICADO" | "FALLIDO";
  impeccableVersion?: string;
  findings?: string[];
  remediation?: string;
}

/** A runtime-provided, read-only bridge to an already configured Impeccable MCP. */
export interface ImpeccableAuditClientLike {
  audit(request: ImpeccableAuditRequest): Promise<ImpeccableAuditResult>;
  close(): Promise<void>;
}

export interface ImpeccableAuditReport extends ImpeccableAuditRequest {
  command: "impeccable-verify";
  status: CheckStatus;
  source: "IMPECCABLE_MCP" | "EXTERNAL_BLOCKER";
  auditId?: string;
  impeccableVersion?: string;
  findings: string[];
  evidence: string;
  remediation: string;
}

/**
 * Verifies an audit receipt without discovering, registering, or mutating MCP configuration.
 * A missing bridge is an external blocker, never an inferred clean audit.
 */
export async function verifyImpeccableAudit(
  request: ImpeccableAuditRequest,
  client?: ImpeccableAuditClientLike,
): Promise<ImpeccableAuditReport> {
  if (!client) {
    return {
      command: "impeccable-verify",
      ...request,
      status: "NO_VERIFICADO",
      source: "EXTERNAL_BLOCKER",
      findings: [],
      evidence: "No runtime-provided Impeccable MCP bridge is available; no audit call was attempted.",
      remediation: "Configure Impeccable through Gentle-AI, then rerun the candidate-bound read-only audit.",
    };
  }

  try {
    const result = await client.audit(request);
    const isBound = result.candidateId === request.candidateId && result.revision === request.revision;
    const isComplete = Boolean(result.auditId && result.impeccableVersion);
    const status: CheckStatus = result.status === "FALLIDO"
      ? "FALLIDO"
      : result.status === "VERIFICADO" && isBound && isComplete
        ? "VERIFICADO"
        : "NO_VERIFICADO";
    return {
      command: "impeccable-verify",
      ...request,
      status,
      source: "IMPECCABLE_MCP",
      auditId: result.auditId,
      impeccableVersion: result.impeccableVersion,
      findings: result.findings ?? [],
      evidence: status === "VERIFICADO"
        ? `Read-only Impeccable audit ${result.auditId} verified candidate revision ${request.revision} with version ${result.impeccableVersion}.`
        : "Impeccable audit evidence is missing, failed, or does not match the applied candidate revision.",
      remediation: status === "VERIFICADO"
        ? (result.remediation ?? "Evaluate findings before delivery.")
        : (result.remediation ?? "Keep delivery blocked until a complete candidate-bound Impeccable receipt is available."),
    };
  } catch (error) {
    return {
      command: "impeccable-verify",
      ...request,
      status: "FALLIDO",
      source: "IMPECCABLE_MCP",
      findings: [],
      evidence: redact(error instanceof Error ? error.message : String(error)),
      remediation: "Check the configured Impeccable MCP bridge and retry the read-only audit; keep delivery blocked.",
    };
  } finally {
    await client.close().catch(() => undefined);
  }
}

function redact(value: string): string {
  return value.replace(/(IMPECCABLE_TOKEN|IMPECCABLE_API_KEY|GITHUB_TOKEN|NPM_TOKEN)=?[^\s\n]*/gi, "$1=<redacted>");
}
