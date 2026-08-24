export type UiWorkflowState = "READY" | "PROMPT_DISPATCHED" | "AWAITING_CLIENT_CONFIRMATION" | "CLIENT_CONFIRMED" | "APPLYING" | "APPLIED" | "AUDITING" | "AUDITED" | "DELIVERY_READY" | "BLOCKED";

export interface UiWorkflowSnapshot {
  candidateId: string;
  state: UiWorkflowState;
  promptId?: string;
  confirmedPromptId?: string;
  appliedRevision?: string;
  auditId?: string;
  auditVersion?: string;
  blockedFrom?: UiWorkflowState;
  blockReason?: string;
}

export interface UiAuditReceipt {
  auditId: string;
  revision: string;
  auditVersion: string;
  status: "VERIFICADO" | "NO_VERIFICADO" | "FALLIDO";
}

export class UiWorkflow {
  private snapshot: UiWorkflowSnapshot;

  constructor(candidateId: string) {
    this.snapshot = { candidateId, state: "READY" };
  }

  get current(): UiWorkflowSnapshot { return { ...this.snapshot }; }

  dispatchPrompt(promptId: string): UiWorkflowSnapshot {
    return this.move("PROMPT_DISPATCHED", ["READY"], { promptId });
  }

  awaitClientConfirmation(): UiWorkflowSnapshot {
    return this.move("AWAITING_CLIENT_CONFIRMATION", ["PROMPT_DISPATCHED"]);
  }

  confirmClient(promptId: string): UiWorkflowSnapshot {
    if (this.snapshot.state !== "AWAITING_CLIENT_CONFIRMATION") return this.block("Client confirmation is not currently expected.");
    if (promptId !== this.snapshot.promptId) return this.block("Client confirmation does not match the dispatched prompt.");
    return this.move("CLIENT_CONFIRMED", ["AWAITING_CLIENT_CONFIRMATION"], { confirmedPromptId: promptId });
  }

  startApply(): UiWorkflowSnapshot { return this.move("APPLYING", ["CLIENT_CONFIRMED"]); }

  recordApplied(revision: string): UiWorkflowSnapshot { return this.move("APPLIED", ["APPLYING"], { appliedRevision: revision }); }

  startAudit(): UiWorkflowSnapshot { return this.move("AUDITING", ["APPLIED"]); }

  recordAudit(receipt: UiAuditReceipt): UiWorkflowSnapshot {
    if (receipt.revision !== this.snapshot.appliedRevision || !receipt.auditId || !receipt.auditVersion) {
      return this.block("Audit receipt does not match the applied candidate revision or lacks an auditor version.");
    }
    if (receipt.status !== "VERIFICADO") return this.block(`Impeccable audit is ${receipt.status}; delivery remains blocked.`);
    return this.move("AUDITED", ["AUDITING"], { auditId: receipt.auditId, auditVersion: receipt.auditVersion });
  }

  prepareDelivery(): UiWorkflowSnapshot {
    return this.move("DELIVERY_READY", ["AUDITED"]);
  }

  private move(state: UiWorkflowState, allowed: UiWorkflowState[], values: Partial<UiWorkflowSnapshot> = {}): UiWorkflowSnapshot {
    if (!allowed.includes(this.snapshot.state)) return this.block(`Cannot transition from ${this.snapshot.state} to ${state}.`);
    this.snapshot = { ...this.snapshot, ...values, state };
    return this.current;
  }

  block(reason: string): UiWorkflowSnapshot {
    this.snapshot = { ...this.snapshot, state: "BLOCKED", blockedFrom: this.snapshot.state, blockReason: reason };
    return this.current;
  }
}
