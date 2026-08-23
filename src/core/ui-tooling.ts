import { UiToolingPlan, UiToolingProfile, UiToolingStep } from "./types.js";
import { planStitchConnection } from "./stitch-remote-plan.js";

export const IMPECCABLE_VERSION = "4.1.1";
export const IMPECCABLE_INSTALL_COMMAND = `npx impeccable@${IMPECCABLE_VERSION} install --scope=project`;

const profiles: Record<UiToolingProfile, Array<"impeccable" | "stitch">> = {
  manual: [],
  impeccable: ["impeccable"],
  stitch: ["stitch"],
  full: ["impeccable", "stitch"],
};

export function planUiTooling(profile: UiToolingProfile, environment: NodeJS.ProcessEnv = process.env): UiToolingPlan {
  const steps = profiles[profile].map((id) => stepFor(id, environment));
  return { profile, steps, fallback: "MANUAL_FALLBACK" };
}

function stepFor(id: "impeccable" | "stitch", environment: NodeJS.ProcessEnv): UiToolingStep {
  if (id === "impeccable") {
    return {
      id,
      action: "external",
      owner: "external",
      command: IMPECCABLE_INSTALL_COMMAND,
      requiredEnv: [],
      verification: "NO_VERIFICADO",
      reason: "The external skill installer is planned but is not executed by harness init.",
    };
  }

  const hasApiKey = Boolean(environment.STITCH_API_KEY);
  const hasAccessToken = Boolean(environment.STITCH_ACCESS_TOKEN && environment.GOOGLE_CLOUD_PROJECT);
  const credentialsReady = hasApiKey || hasAccessToken;
  const connection = planStitchConnection(environment);
  return {
    id,
    action: credentialsReady ? "external" : "blocked",
    owner: "gentle-ai",
    requiredEnv: hasApiKey ? [] : ["STITCH_API_KEY or STITCH_ACCESS_TOKEN + GOOGLE_CLOUD_PROJECT"],
    verification: "NO_VERIFICADO",
    reason: credentialsReady
      ? "Credentials are present, but runtime MCP registration and a live tool call still require Gentle-AI verification."
      : "Stitch credentials are missing; preserve the manual fallback and do not register an unverified MCP.",
    connection,
  };
}
