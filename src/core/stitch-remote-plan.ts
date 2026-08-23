import { StitchAuthMode, StitchConnectionPlan } from "./types.js";

export const STITCH_DEFAULT_ENDPOINT = "https://stitch.googleapis.com/mcp";

export function planStitchConnection(environment: NodeJS.ProcessEnv = process.env): StitchConnectionPlan {
  const hasApiKey = Boolean(environment.STITCH_API_KEY);
  const hasOAuth = Boolean(environment.STITCH_ACCESS_TOKEN && environment.GOOGLE_CLOUD_PROJECT);
  const authMode: StitchAuthMode = hasApiKey ? "api-key" : hasOAuth ? "oauth" : "missing";
  return {
    endpoint: environment.STITCH_HOST || STITCH_DEFAULT_ENDPOINT,
    authMode,
    owner: "gentle-ai",
    registration: "DELEGATED",
    requiredEnv: authMode === "api-key" ? [] : authMode === "oauth" ? [] : ["STITCH_API_KEY or STITCH_ACCESS_TOKEN + GOOGLE_CLOUD_PROJECT"],
    verification: "NO_VERIFICADO",
  };
}
