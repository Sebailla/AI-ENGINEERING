import assert from "node:assert/strict";
import test from "node:test";
import { runPiAuthorityJourney } from "../src/adapters/pi.js";

test("Pi adapter uses bounded JSON foreground mode and evaluates authority evidence", async () => {
  let received: { command: string; args: string[]; cwd: string } | undefined;
  const result = await runPiAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async (command, args, cwd) => {
    received = { command, args, cwd };
    return { code: 0, supported: true, stdout: '{"text":"Gentle-AI is the authority"}', stderr: "" };
  });
  assert.equal(received?.command, "pi");
  assert.deepEqual(received?.args.slice(0, 6), ["--print", "--mode", "json", "--no-session", "--no-tools", "--no-extensions"]);
  assert.equal(result.status, "VERIFICADO");
});

test("Pi adapter preserves unsupported runtime evidence", async () => {
  const result = await runPiAuthorityJourney("/tmp/isolated-project", "Identify the active authority and stop.", async () => ({
    code: 0,
    supported: false,
    stdout: "",
    stderr: "Pi foreground capture unavailable",
  }));
  assert.equal(result.status, "NO_VERIFICADO");
});
