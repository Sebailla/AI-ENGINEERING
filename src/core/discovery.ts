import { realpath } from "node:fs/promises";
import { basename, resolve } from "node:path";

const PROJECT_MARKERS = [".git", "package.json", "pnpm-workspace.yaml", ".ai", "AGENTS.md"];

export class DiscoveryError extends Error {}

export async function resolveProjectRoot(cwd: string): Promise<string> {
  const root = await realpath(resolve(cwd));
  const home = process.env.HOME ? await realpath(process.env.HOME).catch(() => process.env.HOME) : undefined;
  if (root === home || basename(root) === "tmp" || root.startsWith("/tmp/") || root.startsWith("/var/tmp/")) {
    throw new DiscoveryError("The target must be a project directory, not a home or temporary directory.");
  }

  const { access } = await import("node:fs/promises");
  const { constants } = await import("node:fs");
  const isProject = await Promise.all(
    PROJECT_MARKERS.map(async (marker) => {
      try {
        await access(resolve(root, marker), constants.F_OK);
        return true;
      } catch {
        return false;
      }
    }),
  );

  if (!isProject.some(Boolean)) {
    throw new DiscoveryError("The target is not a recognized project. Initialize Git or add a project manifest first.");
  }
  return root;
}

export async function discoverProject(root: string): Promise<import("./types.js").ProjectDiscovery> {
  const { access } = await import("node:fs/promises");
  const { constants } = await import("node:fs");
  const exists = async (path: string): Promise<boolean> => {
    try { await access(resolve(root, path), constants.F_OK); return true; } catch { return false; }
  };
  const instructionCandidates = ["AGENTS.md", "CLAUDE.md", ".ai/SYSTEM.md"];
  const detectedRuntimes: import("./types.js").Runtime[] = [];
  if (await exists(".codex")) detectedRuntimes.push("codex");
  if (await exists("CLAUDE.md") || await exists(".claude")) detectedRuntimes.push("claude-code");
  // Gentle-AI's workspace-scoped OpenCode adapter is intentionally kept under
  // .config/opencode; also accept the runtime's native project locations.
  if (await exists("opencode.json") || await exists(".opencode") || await exists(".config/opencode/opencode.json")) detectedRuntimes.push("opencode");
  if (await exists(".pi")) detectedRuntimes.push("pi");
  return {
    git: await exists(".git"),
    instructionFiles: (await Promise.all(instructionCandidates.map(async (path) => (await exists(path)) ? path : undefined))).filter((path): path is string => path !== undefined),
    canonicalSources: await exists(".ai/SYSTEM.md") && await exists(".ai/rules/gentle-ai.md"),
    detectedRuntimes,
  };
}
