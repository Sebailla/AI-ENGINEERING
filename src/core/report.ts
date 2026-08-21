export type CheckStatus = "VERIFICADO" | "NO_VERIFICADO" | "BLOQUEADO" | "FALLIDO";

export interface DoctorCheck {
  id: string;
  status: CheckStatus;
  evidence: string;
  remediation: string;
}

export interface DoctorReport {
  command: "doctor";
  target: string;
  complete: boolean;
  checks: DoctorCheck[];
}
