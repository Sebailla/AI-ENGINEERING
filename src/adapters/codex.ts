import { evaluateJourney, JourneyExecution, JourneyResult, RuntimeJourney } from "../core/journeys.js";

export type CodexRunner = (command: string, args: string[], cwd: string) => Promise<JourneyExecution>;

export function createCodexAuthorityJourney(project: string, prompt: string): RuntimeJourney {
  return {
    id: "codex.authority-probe",
    runtime: "codex",
    command: "codex",
    args: ["exec", "--json", "--ephemeral", "-C", project, prompt],
    prompt,
    expectedEvidence: "Gentle-AI",
    negativeControl: "Run without the workspace projection and require NO_VERIFICADO.",
  };
}

export async function runCodexAuthorityJourney(cwd: string, prompt: string, runner: CodexRunner): Promise<JourneyResult> {
  const journey = createCodexAuthorityJourney(cwd, prompt);
  const execution = await runner(journey.command, journey.args, cwd);
  return evaluateJourney(journey, execution);
}
