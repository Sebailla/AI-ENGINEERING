import { ImpeccableAuditRequest, ImpeccableAuditReport, verifyImpeccableAudit } from "../core/impeccable-audit.js";

/**
 * The harness intentionally has no Impeccable SDK or guessed MCP transport.
 * The public CLI is blocker-only; only a runtime adapter may inject its real, verified bridge into the core verifier.
 */
export async function impeccableVerify(request: ImpeccableAuditRequest): Promise<ImpeccableAuditReport> {
  return verifyImpeccableAudit(request);
}
