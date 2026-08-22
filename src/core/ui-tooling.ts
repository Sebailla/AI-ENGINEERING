import { UiToolingPlan, UiToolingProfile, UiToolingStep } from "./types.js";

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
      command: "npx impeccable install --scope=project",
      requiredEnv: [],
      verification: "NO_VERIFICADO",
      reason: "The external skill installer is planned but is not executed by harness init.",
    };
  }

  const hasApiKey = Boolean(environment.STITCH_API_KEY);
  const hasAccessToken = Boolean(environment.STITCH_ACCESS_TOKEN && environment.GOOGLE_CLOUD_PROJECT);
  const credentialsReady = hasApiKey || hasAccessToken;
  return {
    id,
    action: credentialsReady ? "external" : "blocked",
    owner: "gentle-ai",
    requiredEnv: hasApiKey ? [] : ["STITCH_API_KEY or STITCH_ACCESS_TOKEN + GOOGLE_CLOUD_PROJECT"],
    verification: "NO_VERIFICADO",
    reason: credentialsReady
      ? "Credentials are present, but runtime MCP registration and a live tool call still require Gentle-AI verification."
      : "Stitch credentials are missing; preserve the manual fallback and do not register an unverified MCP.",
  };
}
