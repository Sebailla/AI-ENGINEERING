import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { auditPackageFiles, PackageAuditResult } from "../core/package-audit.js";
import { HARNESS_VERSION } from "../core/types.js";
import { PACKAGE_METADATA } from "../core/package-metadata.js";

const execFileAsync = promisify(execFile);

export async function packageAudit(cwd: string): Promise<PackageAuditResult> {
  const destination = await mkdtemp(join(tmpdir(), "ai-engineering-pack-"));
  try {
    const { stdout } = await execFileAsync("pnpm", ["pack", "--pack-destination", destination, "--json"], { cwd });
    const parsed = JSON.parse(stdout.trim()) as { files?: Array<{ path?: string }> } | Array<{ files?: Array<{ path?: string }> }>;
    const metadata = Array.isArray(parsed) ? parsed[0] : parsed;
    const files = metadata?.files?.filter((file): file is { path: string } => typeof file.path === "string") ?? [];
    return auditPackageFiles(files, PACKAGE_METADATA.version, HARNESS_VERSION);
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
}
