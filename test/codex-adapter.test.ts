import assert from "node:assert/strict";
import test from "node:test";
import { runCodexAuthorityJourney } from "../src/adapters/codex.js";

test("Codex adapter uses ephemeral JSON execution in the target project", async () => {
  let received: { command: string; args: string[]; cwd: string } | undefined;
  const result = await runCodexAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async (command, args, cwd) => {
    received = { command, args, cwd };
    return { code: 0, supported: true, stdout: '{"type":"message","text":"Gentle-AI is the authority"}', stderr: "" };
  });
  assert.equal(received?.command, "codex");
  assert.deepEqual(received?.args.slice(0, 5), ["exec", "--json", "--ephemeral", "-C", "/tmp/isolated-project"]);
  assert.equal(result.status, "VERIFICADO");
});

test("Codex adapter preserves unsupported foreground evidence", async () => {
  const result = await runCodexAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async () => ({
    code: 0,
    supported: false,
    stdout: "",
    stderr: "Codex foreground capture unavailable",
  }));
  assert.equal(result.status, "NO_VERIFICADO");
});
