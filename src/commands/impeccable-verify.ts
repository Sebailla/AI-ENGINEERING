import { ImpeccableAuditRequest, ImpeccableAuditReport, verifyImpeccableAudit } from "../core/impeccable-audit.js";

/**
 * The harness intentionally has no Impeccable SDK or guessed MCP transport.
 * A runtime adapter may call the core verifier with its real, verified bridge.
 */
export async function impeccableVerify(request: ImpeccableAuditRequest): Promise<ImpeccableAuditReport> {
  return verifyImpeccableAudit(request);
}
