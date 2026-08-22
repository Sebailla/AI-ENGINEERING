import assert from "node:assert/strict";
import test from "node:test";
import { runClaudeAuthorityJourney } from "../src/adapters/claude.js";

test("Claude Code adapter uses JSON plan mode without session persistence", async () => {
  let received: { command: string; args: string[]; cwd: string } | undefined;
  const result = await runClaudeAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async (command, args, cwd) => {
    received = { command, args, cwd };
    return { code: 0, supported: true, stdout: '{"result":"Gentle-AI is the authority"}', stderr: "" };
  });
  assert.equal(received?.command, "claude");
  assert.deepEqual(received?.args.slice(0, 6), ["--print", "--output-format", "json", "--no-session-persistence", "--permission-mode", "plan"]);
  assert.equal(result.status, "VERIFICADO");
});

test("Claude Code adapter preserves unsupported foreground evidence", async () => {
  const result = await runClaudeAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async () => ({
    code: 0,
    supported: false,
    stdout: "",
    stderr: "Claude Code foreground capture unavailable",
  }));
  assert.equal(result.status, "NO_VERIFICADO");
});
