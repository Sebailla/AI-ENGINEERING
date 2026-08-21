import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const templateRoot = join(process.cwd(), "templates", "runtime");

test("runtime templates are portable and policy-linked", async () => {
  const files = (await readdir(templateRoot)).filter((file) => file.endsWith(".md") && file !== "README.md");
  assert.deepEqual(files.sort(), ["claude-code.md", "codex.md", "opencode.md", "pi.md"]);
  for (const file of files) {
    const content = await readFile(join(templateRoot, file), "utf8");
    assert.match(content, /\.ai\/SYSTEM\.md/);
    assert.match(content, /\.ai\/rules\/gentle-ai\.md/);
    assert.doesNotMatch(content, /(?:\/Users\/|\/home\/|[A-Za-z]:\\)/);
    assert.doesNotMatch(content, /(?:sk-|api[_-]?key\s*[:=])/i);
  }
});
