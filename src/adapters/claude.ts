import { evaluateJourney, JourneyExecution, JourneyResult, RuntimeJourney } from "../core/journeys.js";

export type ClaudeRunner = (command: string, args: string[], cwd: string) => Promise<JourneyExecution>;

export function createClaudeAuthorityJourney(prompt: string): RuntimeJourney {
  return {
    id: "claude-code.authority-probe",
    runtime: "claude-code",
    command: "claude",
    args: ["--print", "--output-format", "json", "--no-session-persistence", "--permission-mode", "plan", prompt],
    prompt,
    expectedEvidence: "Gentle-AI",
    negativeControl: "Run without the workspace projection and require NO_VERIFICADO.",
  };
}

export async function runClaudeAuthorityJourney(cwd: string, prompt: string, runner: ClaudeRunner): Promise<JourneyResult> {
  const journey = createClaudeAuthorityJourney(prompt);
  const execution = await runner(journey.command, journey.args, cwd);
  return evaluateJourney(journey, execution);
}
