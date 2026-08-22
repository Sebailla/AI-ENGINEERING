import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateReleaseMetadata } from "../src/core/release-metadata.js";

async function changelog(contents: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "ai-engineering-release-"));
  const path = join(directory, "CHANGELOG.md");
  await writeFile(path, contents);
  return path;
}

test("release metadata accepts matching SemVer and changelog entry", async () => {
  const path = await changelog("# Changelog\n\n## [0.1.0] - 2026-08-22\n");
  const result = await validateReleaseMetadata(path, "0.1.0", "0.1.0");
  assert.equal(result.complete, true);
});

test("release metadata rejects an absent changelog entry", async () => {
  const path = await changelog("# Changelog\n\n## [0.0.9] - 2026-08-21\n");
  const result = await validateReleaseMetadata(path, "0.1.0", "0.1.0");
  assert.equal(result.complete, false);
  assert.match(result.errors[0], /no heading/);
});

test("release metadata rejects invalid and inconsistent versions", async () => {
  const path = await changelog("# Changelog\n");
  const result = await validateReleaseMetadata(path, "01.0", "0.1.0");
  assert.equal(result.complete, false);
  assert.equal(result.errors.length, 3);
});
