// node --test skills/ux/scripts/gate.test.mjs: the Strictness gate (gate.mjs) as the hooks call it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, utimesSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GATE = join(import.meta.dirname, "gate.mjs");

function project(strictness) {
  const root = mkdtempSync(join(tmpdir(), "wwjd-gate-"));
  execFileSync("git", ["init", "-q", root]);
  writeFileSync(join(root, ".wwjd.json"), JSON.stringify({ dials: { strictness } }));
  const state = mkdtempSync(join(tmpdir(), "wwjd-state-"));
  const transcript = join(root, "transcript.jsonl");
  writeFileSync(transcript, "");
  const sid = "s-" + Math.random().toString(36).slice(2);
  const run = (mode, input) => {
    const out = execFileSync("node", [GATE, mode], {
      input: JSON.stringify({ session_id: sid, transcript_path: transcript, cwd: root, ...input }),
      env: { ...process.env, TMPDIR: state, WWJD_DIALS: "", CLAUDE_PLUGIN_OPTION_STRICTNESS: "" },
      encoding: "utf8",
    }).trim();
    return out ? JSON.parse(out) : null;
  };
  const file = (rel, text = "x", age = 0) => {
    const p = join(root, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, text);
    const t = Date.now() / 1000 + age;
    utimesSync(p, t, t);
    return p;
  };
  const edit = (rel) => run("post", { tool_name: "Write", tool_input: { file_path: join(root, rel) } });
  return { root, run, file, edit, transcript };
}

const write = (p) => ({ tool_name: "Write", tool_input: { file_path: p, content: "<div></div>" } });

test("pre: Strictness 3 denies a new UI file until a grade sheet exists this session", () => {
  const p = project(3);
  const r = p.run("pre", write(join(p.root, "card.html")));
  assert.equal(r.hookSpecificOutput.permissionDecision, "deny");
  assert.match(r.hookSpecificOutput.permissionDecisionReason, /grade/);
  p.file(".wwjd/grade/card.md", "within budget", -3600); // older than the session: does not count
  assert.equal(p.run("pre", write(join(p.root, "card.html"))).hookSpecificOutput.permissionDecision, "deny");
  p.file(".wwjd/grade/card.md", "within budget: title + 3");
  assert.equal(p.run("pre", write(join(p.root, "card.html"))), null);
});

test("pre: silent below 3, for existing files, non-UI files and Edit", () => {
  assert.equal(project(2).run("pre", write("/x/card.html")), null);
  const p = project(5);
  p.file("old.html");
  assert.equal(p.run("pre", write(join(p.root, "old.html"))), null);
  assert.equal(p.run("pre", write(join(p.root, "notes.md"))), null);
  assert.equal(p.run("pre", { tool_name: "Edit", tool_input: { file_path: join(p.root, "new.html") } }), null);
});

test("stop: silent when no UI file was edited this session", () => {
  assert.equal(project(5).run("stop", { stop_hook_active: false }), null);
});

test("stop: Strictness 1 never blocks; 2 wants a shot newer than the last UI edit", () => {
  const one = project(1);
  one.edit("card.html");
  assert.equal(one.run("stop", { stop_hook_active: false }), null);

  const p = project(2);
  p.file(".wwjd/shots/card-390-light.png", "png", -3600);
  p.edit("card.html");
  const r = p.run("stop", { stop_hook_active: false });
  assert.equal(r.decision, "block");
  assert.match(r.reason, /render\.mjs shoot/);
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("stop: Strictness 3 wants two widths; an UNAVAILABLE marker from render.mjs passes", () => {
  const p = project(3);
  p.edit("card.html");
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);

  const q = project(3);
  q.edit("card.html");
  q.file(".wwjd/shots/UNAVAILABLE", "render needs Playwright", 5);
  assert.equal(q.run("stop", { stop_hook_active: false }), null);
});

test("stop: Strictness 4 adds a dark shot and a runtime report", () => {
  const p = project(4);
  p.edit("card.html");
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /dark/);
  p.file(".wwjd/shots/card-390-dark.png", "png", 5);
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /runtime/);
  p.file(".wwjd/runtime.json", "{}", 5);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("stop: Strictness 5 adds a wwjd-critic run after the last edit", () => {
  const p = project(5);
  p.edit("card.html");
  for (const f of ["card-390-light.png", "card-1440-light.png", "card-390-dark.png"]) p.file(`.wwjd/shots/${f}`, "png", 5);
  p.file(".wwjd/runtime.json", "{}", 5);
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /critic/);
  const read = new Date(Date.now() + 5000).toISOString();
  appendFileSync(p.transcript, JSON.stringify({ timestamp: read, message: { content: [{ type: "tool_result", content: "5 Strict: adds the wwjd-critic agent" }] } }) + "\n");
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /critic/);
  const later = new Date(Date.now() + 5000).toISOString();
  appendFileSync(p.transcript, JSON.stringify({ timestamp: later, message: { content: [{ type: "tool_use", name: "Agent", input: { subagent_type: "wwjd:wwjd-critic" } }] } }) + "\n");
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("stop: blocks at most twice in a row, then lets the turn end", () => {
  const p = project(2);
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
  assert.equal(p.run("stop", { stop_hook_active: true }).decision, "block");
  assert.equal(p.run("stop", { stop_hook_active: true }), null);
});

test("post notes a wwjd-critic run, which satisfies Strictness 5", () => {
  const p = project(5);
  p.edit("card.html");
  p.file(".wwjd/shots/UNAVAILABLE", "no playwright", 5);
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /critic/);
  p.run("post", { tool_name: "Agent", tool_input: { subagent_type: "wwjd:wwjd-critic", prompt: "review" } });
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("status reports the dial, the sheet and each check", () => {
  const p = project(3);
  let s = p.run("status", {});
  assert.equal(s.strictness, 3);
  assert.deepEqual(s.sheet, { needed: true, file: null });
  assert.equal(s.hasEdits, false);
  p.file(".wwjd/grade/task-card.md", "within budget");
  p.edit("card.html");
  s = p.run("status", {});
  assert.equal(s.sheet.file, "task-card.md");
  assert.deepEqual(s.checks.map((c) => [c.key, c.done]), [["shots", false]]);
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  assert.equal(p.run("status", {}).checks[0].done, true);
});
