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

test("Strictness moves on instructions, never on a complaint about speed or roughness", () => {
  assert.match(route("just a quick fix on the hero button"), /strictness -1/);
  assert.match(route("make a rough draft of the landing page"), /strictness -1/);
  assert.doesNotMatch(route("the hero transitions are really rough") || "", /strictness/);
  assert.doesNotMatch(route("the dissolves on the hero go really quickly, too quick to read") || "", /strictness/);
  assert.match(route("polish this dashboard carefully"), /strictness \+1/);
});

test("exploring holds the handover checks until the person says keep", () => {
  const session = `t-${Math.random().toString(36).slice(2)}`;
  assert.match(route("just exploring the hero motion, we can verify with wwjd later", session), /checks are held/);
  assert.match(route("nice, keep it and make the cards bolder", session), /apply again/);
  assert.doesNotMatch(route("make the cards bolder") || "", /held|apply again/);
});

test("art-directed motion routes to wwjd:motion-design, UI motion to wwjd:motion, and a later story ask still gets it once", () => {
  assert.match(route("make a hero animation that tells the product story"), /wwjd:motion-design/);
  assert.doesNotMatch(route("add a hover animation to the cards"), /motion-design/);
  assert.match(route("add a hover animation to the cards"), /wwjd:motion\b/);
  const session = `t-${Math.random().toString(36).slice(2)}`;
  const cwd = mkdtempSync(join(tmpdir(), "wwjd-route-"));
  const run = (prompt) => { const r = spawnSync("node", [ROUTE], { input: JSON.stringify({ prompt, session_id: session, cwd }), encoding: "utf8", env: { ...process.env, TMPDIR: cwd } }); return r.stdout ? JSON.parse(r.stdout).hookSpecificOutput.additionalContext : ""; };
  assert.match(run("clean up the settings page"), /wwjd:ux/);
  assert.match(run("now storyboard an explainer for the landing page"), /wwjd:motion-design/);
  assert.doesNotMatch(run("another explainer tweak"), /motion-design/);
});
