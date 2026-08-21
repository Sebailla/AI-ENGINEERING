import { Runtime } from "./types.js";
import { CheckStatus } from "./report.js";

export interface RuntimeJourney {
  id: string;
  runtime: Runtime;
  command: string;
  args: string[];
  prompt: string;
  expectedEvidence: string | RegExp;
  negativeControl: string;
}

export interface JourneyExecution {
  code: number;
  stdout: string;
  stderr: string;
  supported: boolean;
}

export interface JourneyResult {
  id: string;
  runtime: Runtime;
  status: CheckStatus;
  command: string;
  evidence: string;
  remediation: string;
}

export function evaluateJourney(journey: RuntimeJourney, execution: JourneyExecution, home = process.env.HOME): JourneyResult {
  const output = redact(`${execution.stdout}\n${execution.stderr}`, home);
  if (!execution.supported) return result(journey, "NO_VERIFICADO", output || "Foreground journey is not supported by this runtime.", "Provide a supported foreground adapter before claiming runtime conformance.");
  if (execution.code !== 0) return result(journey, "FALLIDO", output || `Journey exited with code ${execution.code}.`, "Inspect the runtime error and rerun the bounded journey.");
  if (!matches(journey.expectedEvidence, output)) return result(journey, "NO_VERIFICADO", output || "Journey completed without the expected authority evidence.", "Capture the projected system prompt or report the runtime boundary as unsupported.");
  return result(journey, "VERIFICADO", output, "Keep the journey bounded and repeat it after adapter changes.");
}

export function redact(value: string, home = process.env.HOME): string {
  const redactedHome = home ? value.replaceAll(home, "~") : value;
  return redactedHome.replaceAll(/(?:ghp|github_pat|sk)[_-][A-Za-z0-9_-]+/g, "<redacted-token>").trim();
}

function matches(expected: string | RegExp, output: string): boolean {
  if (typeof expected === "string") return output.includes(expected);
  expected.lastIndex = 0;
  return expected.test(output);
}

function result(journey: RuntimeJourney, status: CheckStatus, evidence: string, remediation: string): JourneyResult {
  return { id: journey.id, runtime: journey.runtime, status, command: `${journey.command} ${journey.args.join(" ")}`.trim(), evidence, remediation };
}
