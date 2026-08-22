import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface PackageMetadata {
  name: string;
  version: string;
}

export function loadPackageMetadata(start = dirname(fileURLToPath(import.meta.url))): PackageMetadata {
  let directory = start;
  while (true) {
    const candidate = join(directory, "package.json");
    try {
      const value = JSON.parse(readFileSync(candidate, "utf8")) as Partial<PackageMetadata>;
      if (typeof value.name === "string" && typeof value.version === "string") return { name: value.name, version: value.version };
    } catch {
      // Continue toward the filesystem root; a missing or unrelated package is not a match.
    }
    const parent = dirname(directory);
    if (parent === directory) throw new Error("Unable to locate package.json.");
    directory = parent;
  }
}

export const PACKAGE_METADATA = loadPackageMetadata();
