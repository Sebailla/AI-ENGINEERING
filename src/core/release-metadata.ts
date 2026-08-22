import { readFile } from "node:fs/promises";

export interface ReleaseMetadataResult {
  complete: boolean;
  version: string;
  errors: string[];
}

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export async function validateReleaseMetadata(changelogPath: string, packageVersion: string, harnessVersion: string): Promise<ReleaseMetadataResult> {
  const errors: string[] = [];
  if (!SEMVER.test(packageVersion)) errors.push(`Invalid package version: ${packageVersion}.`);
  if (packageVersion !== harnessVersion) errors.push(`Version mismatch: package.json=${packageVersion}, harness=${harnessVersion}.`);
  let changelog: string;
  try {
    changelog = await readFile(changelogPath, "utf8");
  } catch {
    changelog = "";
    errors.push(`Changelog not found: ${changelogPath}.`);
  }
  if (changelog && !new RegExp(`^## \\[${escapeRegExp(packageVersion)}\\](?: |$)`, "m").test(changelog)) {
    errors.push(`Changelog has no heading for version ${packageVersion}.`);
  }
  return { complete: errors.length === 0, version: packageVersion, errors };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
