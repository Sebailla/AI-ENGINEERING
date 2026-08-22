import { evaluateJourney, JourneyExecution, JourneyResult, RuntimeJourney } from "../core/journeys.js";

export type PiRunner = (command: string, args: string[], cwd: string) => Promise<JourneyExecution>;

export function createPiAuthorityJourney(prompt: string): RuntimeJourney {
  return {
    id: "pi.authority-probe",
    runtime: "pi",
    command: "pi",
    args: ["--print", "--mode", "json", "--no-session", "--no-tools", "--no-extensions", prompt],
    prompt,
    expectedEvidence: "Gentle-AI",
    negativeControl: "Run without the workspace projection and require NO_VERIFICADO.",
  };
}

export async function runPiAuthorityJourney(cwd: string, prompt: string, runner: PiRunner): Promise<JourneyResult> {
  const journey = createPiAuthorityJourney(prompt);
  const execution = await runner(journey.command, journey.args, cwd);
  return evaluateJourney(journey, execution);
}
