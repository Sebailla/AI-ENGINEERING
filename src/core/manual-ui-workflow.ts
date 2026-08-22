import { UiWorkflow, UiWorkflowSnapshot } from "./ui-workflow.js";

export interface ManualArtifactReceipt {
  candidateId: string;
  promptId: string;
  revision: string;
  digest: string;
}

export interface ManualAuditReceipt {
  candidateId: string;
  revision: string;
  auditId: string;
  status: "VERIFICADO" | "NO_VERIFICADO" | "FALLIDO";
  source: "MANUAL_FALLBACK";
}

export interface ManualUiSnapshot {
  mode: "MANUAL_FALLBACK";
  liveMcp: "NO_VERIFICADO";
  workflow: UiWorkflowSnapshot;
  artifact?: ManualArtifactReceipt;
  audit?: ManualAuditReceipt;
}

export class ManualUiWorkflow {
  private readonly workflow: UiWorkflow;
  private artifact?: ManualArtifactReceipt;
  private audit?: ManualAuditReceipt;

  constructor(private readonly candidateId: string) {
    this.workflow = new UiWorkflow(candidateId);
  }

  get current(): ManualUiSnapshot {
    return { mode: "MANUAL_FALLBACK", liveMcp: "NO_VERIFICADO", workflow: this.workflow.current, artifact: this.artifact, audit: this.audit };
  }

  dispatchPrompt(promptId: string): ManualUiSnapshot {
    this.workflow.dispatchPrompt(promptId);
    this.workflow.awaitClientConfirmation();
    return this.current;
  }

  confirmClient(promptId: string): ManualUiSnapshot {
    this.workflow.confirmClient(promptId);
    return this.current;
  }

  recordArtifact(receipt: ManualArtifactReceipt): ManualUiSnapshot {
    if (this.workflow.current.state !== "CLIENT_CONFIRMED") return this.block("Artifact receipt requires explicit client confirmation.");
    if (receipt.candidateId !== this.candidateId || receipt.promptId !== this.workflow.current.confirmedPromptId || !receipt.revision || !receipt.digest) {
      return this.block("Artifact receipt does not match the confirmed candidate or is incomplete.");
    }
    this.artifact = { ...receipt };
    return this.current;
  }

  startApply(): ManualUiSnapshot {
    if (!this.artifact) return this.block("Artifact receipt is required before apply.");
    this.workflow.startApply();
    return this.current;
  }

  recordApplied(revision: string): ManualUiSnapshot {
    if (!this.artifact || revision !== this.artifact.revision) return this.block("Applied revision does not match the artifact receipt.");
    this.workflow.recordApplied(revision);
    return this.current;
  }

  startAudit(): ManualUiSnapshot {
    this.workflow.startAudit();
    return this.current;
  }

  recordAudit(receipt: ManualAuditReceipt): ManualUiSnapshot {
    if (receipt.candidateId !== this.candidateId || receipt.revision !== this.artifact?.revision || receipt.source !== "MANUAL_FALLBACK") {
      return this.block("Audit receipt does not match the applied candidate or fallback source.");
    }
    this.audit = { ...receipt };
    this.workflow.recordAudit(receipt.auditId, receipt.status);
    return this.current;
  }

  prepareDelivery(): ManualUiSnapshot {
    this.workflow.prepareDelivery();
    return this.current;
  }

  private block(reason: string): ManualUiSnapshot {
    this.workflow.block(reason);
    return this.current;
  }
}
