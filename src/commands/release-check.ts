import { join } from "node:path";
import { PACKAGE_METADATA } from "../core/package-metadata.js";
import { validateReleaseMetadata } from "../core/release-metadata.js";
import { HARNESS_VERSION } from "../core/types.js";

export async function releaseCheck(cwd: string) {
  return validateReleaseMetadata(join(cwd, "CHANGELOG.md"), PACKAGE_METADATA.version, HARNESS_VERSION);
}
