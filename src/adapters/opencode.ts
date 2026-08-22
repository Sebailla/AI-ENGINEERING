import { evaluateJourney, JourneyExecution, JourneyResult, RuntimeJourney } from "../core/journeys.js";

export type OpenCodeRunner = (command: string, args: string[], cwd: string) => Promise<JourneyExecution>;

export function createOpenCodeAuthorityJourney(project: string, prompt: string): RuntimeJourney {
  return {
    id: "opencode.authority-probe",
    runtime: "opencode",
    command: "opencode",
    args: ["run", "--format", "json", "--agent", "gentle-orchestrator", "--dir", project, prompt],
    prompt,
    expectedEvidence: "Gentle-AI",
    negativeControl: "Run without the workspace adapter and require NO_VERIFICADO.",
  };
}

export async function runOpenCodeAuthorityJourney(cwd: string, prompt: string, runner: OpenCodeRunner): Promise<JourneyResult> {
  const journey = createOpenCodeAuthorityJourney(cwd, prompt);
  const execution = await runner(journey.command, journey.args, cwd);
  return evaluateJourney(journey, execution);
}
