export type UiWorkflowState = "READY" | "PROMPT_DISPATCHED" | "AWAITING_CLIENT_CONFIRMATION" | "CLIENT_CONFIRMED" | "APPLYING" | "APPLIED" | "AUDITING" | "AUDITED" | "DELIVERY_READY" | "BLOCKED";

export interface UiWorkflowSnapshot {
  candidateId: string;
  state: UiWorkflowState;
  promptId?: string;
  confirmedPromptId?: string;
  appliedRevision?: string;
  auditId?: string;
  blockedFrom?: UiWorkflowState;
  blockReason?: string;
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

  recordAudit(auditId: string, status: "VERIFICADO" | "NO_VERIFICADO" | "FALLIDO"): UiWorkflowSnapshot {
    if (status !== "VERIFICADO") return this.block(`Impeccable audit is ${status}; delivery remains blocked.`);
    return this.move("AUDITED", ["AUDITING"], { auditId });
  }

  prepareDelivery(): UiWorkflowSnapshot {
    return this.move("DELIVERY_READY", ["AUDITED"]);
  }

  private move(state: UiWorkflowState, allowed: UiWorkflowState[], values: Partial<UiWorkflowSnapshot> = {}): UiWorkflowSnapshot {
    if (!allowed.includes(this.snapshot.state)) return this.block(`Cannot transition from ${this.snapshot.state} to ${state}.`);
    this.snapshot = { ...this.snapshot, ...values, state };
    return this.current;
  }

  private block(reason: string): UiWorkflowSnapshot {
    this.snapshot = { ...this.snapshot, state: "BLOCKED", blockedFrom: this.snapshot.state, blockReason: reason };
    return this.current;
  }
}
