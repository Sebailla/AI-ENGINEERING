import assert from "node:assert/strict";
import test from "node:test";
import { runOpenCodeAuthorityJourney } from "../src/adapters/opencode.js";

test("OpenCode adapter uses JSON events and the Gentle-AI orchestrator", async () => {
  let received: { command: string; args: string[]; cwd: string } | undefined;
  const result = await runOpenCodeAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async (command, args, cwd) => {
    received = { command, args, cwd };
    return { code: 0, supported: true, stdout: '{"message":"Gentle-AI is the authority"}', stderr: "" };
  });
  assert.equal(received?.command, "opencode");
  assert.deepEqual(received?.args.slice(0, 7), ["run", "--format", "json", "--agent", "gentle-orchestrator", "--dir", "/tmp/isolated-project"]);
  assert.equal(result.status, "VERIFICADO");
});

test("OpenCode adapter preserves unsupported foreground evidence", async () => {
  const result = await runOpenCodeAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async () => ({
    code: 0,
    supported: false,
    stdout: "",
    stderr: "OpenCode foreground capture unavailable",
  }));
  assert.equal(result.status, "NO_VERIFICADO");
});
