// node --test skills/ux/scripts/route.test.mjs: the UserPromptSubmit router (hooks/route.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROUTE = join(dirname(fileURLToPath(import.meta.url)), "../../../hooks/route.mjs");

function route(prompt, session = `t-${Math.random().toString(36).slice(2)}`) {
  const cwd = mkdtempSync(join(tmpdir(), "wwjd-route-"));
  const run = spawnSync("node", [ROUTE], { input: JSON.stringify({ prompt, session_id: session, cwd }), encoding: "utf8", env: { ...process.env, TMPDIR: cwd } });
  return run.stdout ? JSON.parse(run.stdout).hookSpecificOutput.additionalContext : null;
}

test("a redesign of an existing screen points at explore §5", () => {
  assert.match(route("redesign the resilience overview from scratch"), /explore\.md §5/);
  assert.match(route("can you start over on the settings page"), /explore\.md §5/);
});

test("a plain UI ask gets the skill without the redesign hint", () => {
  const ctx = route("clean up the dashboard, it looks busy");
  assert.match(ctx, /wwjd:ux/);
  assert.doesNotMatch(ctx, /§5/);
});

test("the redesign hint comes on later prompts of the session too", () => {
  const s = `t-${Date.now()}`;
  const cwd = mkdtempSync(join(tmpdir(), "wwjd-route-"));
  const env = { ...process.env, TMPDIR: cwd };
  const once = (prompt) => spawnSync("node", [ROUTE], { input: JSON.stringify({ prompt, session_id: s, cwd }), encoding: "utf8", env }).stdout;
  assert.match(once("build the dashboard"), /wwjd:ux/);
  assert.match(once("now redesign it"), /§5/);
  assert.equal(once("thanks"), "");
});
