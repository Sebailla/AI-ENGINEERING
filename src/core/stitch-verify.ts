import { planStitchConnection } from "./stitch-remote-plan.js";
import { CheckStatus } from "./report.js";

export interface StitchTool { name?: string; }

export interface StitchToolClientLike {
  listTools(): Promise<{ tools: StitchTool[] }>;
  close(): Promise<void>;
}

export interface StitchVerificationReport {
  command: "stitch-verify";
  endpoint: string;
  authMode: "api-key" | "oauth" | "missing";
  status: CheckStatus;
  toolCount: number;
  tools: string[];
  evidence: string;
  remediation: string;
}

export async function verifyStitchMcp(
  environment: NodeJS.ProcessEnv = process.env,
  client?: StitchToolClientLike,
): Promise<StitchVerificationReport> {
  const connection = planStitchConnection(environment);
  if (connection.authMode === "missing") {
    return {
      command: "stitch-verify",
      endpoint: connection.endpoint,
      authMode: connection.authMode,
      status: "BLOQUEADO",
      toolCount: 0,
      tools: [],
      evidence: "Stitch credentials are missing; no remote call was attempted.",
      remediation: "Set STITCH_API_KEY or STITCH_ACCESS_TOKEN with GOOGLE_CLOUD_PROJECT, then rerun stitch-verify.",
    };
  }

  if (!client) throw new Error("A StitchToolClient is required when no client is provided.");
  try {
    const result = await client.listTools();
    const tools = result.tools.map((tool) => tool.name).filter((name): name is string => Boolean(name)).sort();
    const status: CheckStatus = tools.length > 0 ? "VERIFICADO" : "NO_VERIFICADO";
    return {
      command: "stitch-verify",
      endpoint: connection.endpoint,
      authMode: connection.authMode,
      status,
      toolCount: tools.length,
      tools,
      evidence: tools.length > 0 ? `Live MCP listTools returned ${tools.length} tool definitions.` : "Live MCP listTools returned no tool definitions.",
      remediation: tools.length > 0 ? "Keep Stitch registration owned by Gentle-AI and preserve this receipt." : "Verify the Stitch account and MCP endpoint before using the UI workflow.",
    };
  } catch (error) {
    return {
      command: "stitch-verify",
      endpoint: connection.endpoint,
      authMode: connection.authMode,
      status: "FALLIDO",
      toolCount: 0,
      tools: [],
      evidence: redact(error instanceof Error ? error.message : String(error)),
      remediation: "Check Stitch credentials, endpoint reachability and Gentle-AI ownership before retrying.",
    };
  } finally {
    await client.close().catch(() => undefined);
  }
}

function redact(value: string): string {
  return value.replace(/(STITCH_API_KEY|STITCH_ACCESS_TOKEN|GITHUB_TOKEN|NPM_TOKEN)=?[^\s\n]*/gi, "$1=<redacted>");
}
