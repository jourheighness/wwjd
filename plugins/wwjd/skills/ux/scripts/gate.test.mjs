// node --test skills/ux/scripts/gate.test.mjs: the Strictness gate (gate.mjs) as the hooks call it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, utimesSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GATE = join(dirname(fileURLToPath(import.meta.url)), "gate.mjs");

function project(strictness) {
  const root = mkdtempSync(join(tmpdir(), "wwjd-gate-"));
  execFileSync("git", ["init", "-q", root]);
  writeFileSync(join(root, ".wwjd.json"), JSON.stringify({ dials: { strictness } }));
  const state = mkdtempSync(join(tmpdir(), "wwjd-state-"));
  const transcript = join(root, "transcript.jsonl");
  writeFileSync(transcript, "");
  const sid = "s-" + Math.random().toString(36).slice(2);
  const env = { ...process.env, TMPDIR: state, WWJD_DIALS: "", CLAUDE_PLUGIN_OPTION_STRICTNESS: "", WWJD_PREVIEW: "" };
  const stdin = (input) => JSON.stringify({ session_id: sid, transcript_path: transcript, cwd: root, ...input });
  const run = (mode, input, extra = {}) => {
    const out = execFileSync("node", [GATE, mode], { input: stdin(input), env: { ...env, ...extra }, encoding: "utf8" }).trim();
    return out ? JSON.parse(out) : null;
  };
  // Started together, as parallel hooks are.
  const runAsync = (mode, input) => new Promise((ok, fail) => {
    const c = spawn("node", [GATE, mode], { env });
    c.on("error", fail).on("close", ok);
    c.stdin.end(stdin(input));
  });
  const ledger = () => JSON.parse(readFileSync(join(state, "wwjd-gate", `${sid}.json`), "utf8"));
  const file = (rel, text = "x", age = 0) => {
    const p = join(root, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, text);
    const t = Date.now() / 1000 + age;
    utimesSync(p, t, t);
    return p;
  };
  // as a Write leaves it: the file exists
  const edit = (rel) => {
    const f = join(root, rel);
    if (!existsSync(f)) { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, "<div></div>"); utimesSync(f, Date.now() / 1000 - 60, Date.now() / 1000 - 60); }
    return run("post", { tool_name: "Write", tool_input: { file_path: f } });
  };
  return { root, state, run, runAsync, ledger, file, edit, transcript };
}

const write = (p) => ({ tool_name: "Write", tool_input: { file_path: p, content: "<div></div>" } });

test("pre: Strictness 4 denies a new UI file until a grade sheet exists this session", () => {
  const p = project(4);
  const r = p.run("pre", write(join(p.root, "card.html")));
  assert.equal(r.hookSpecificOutput.permissionDecision, "deny");
  assert.match(r.hookSpecificOutput.permissionDecisionReason, /grade/);
  p.file(".wwjd/grade/card.md", "within budget", -3600); // older than the session: does not count
  assert.equal(p.run("pre", write(join(p.root, "card.html"))).hookSpecificOutput.permissionDecision, "deny");
  p.file(".wwjd/grade/card.md", "within budget: title + 3");
  assert.equal(p.run("pre", write(join(p.root, "card.html"))), null);
});

test("pre: silent below 4 (graded in the head), for existing files, non-UI files and Edit", () => {
  assert.equal(project(2).run("pre", write("/x/card.html")), null);
  const q = project(3);
  assert.equal(q.run("pre", write(join(q.root, "card.html"))), null);
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
  p.file(".wwjd/decisions.jsonl", JSON.stringify({ id: "d1", at: new Date(Date.now() + 5000).toISOString(), surface: "Card", kind: "choice", text: "x" }));
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  p.file(".wwjd/fit.json", JSON.stringify({ findings: [] }), 5);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);

  const q = project(3);
  q.edit("card.html");
  q.file(".wwjd/decisions.jsonl", JSON.stringify({ id: "d1", at: new Date(Date.now() + 5000).toISOString(), surface: "Card", kind: "choice", text: "x" }));
  q.file(".wwjd/shots/UNAVAILABLE", "render needs Playwright", 5);
  assert.equal(q.run("stop", { stop_hook_active: false }), null);
});

test("stop: Strictness 4 adds a dark shot and a runtime report", () => {
  const p = project(4);
  p.edit("card.html");
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  p.file(".wwjd/fit.json", JSON.stringify({ findings: [] }), 5);
  const r = p.run("stop", { stop_hook_active: false });
  assert.match(r.reason, /dark/);
  assert.match(r.reason, /runtime/);
  const done = () => Object.fromEntries(p.run("status", {}).checks.map((c) => [c.key, c.done]));
  p.file(".wwjd/shots/card-390-dark.png", "png", 5);
  assert.deepEqual([done().dark, done().runtime], [true, false]);
  p.file(".wwjd/runtime.json", "{}", 5);
  assert.equal(done().runtime, true);
});

test("stop: Strictness 5 adds a wwjd-critic run after the last edit", () => {
  const p = project(5);
  p.edit("card.html");
  for (const f of ["card-390-light.png", "card-1440-light.png", "card-390-dark.png"]) p.file(`.wwjd/shots/${f}`, "png", 5);
  p.file(".wwjd/fit.json", JSON.stringify({ findings: [] }), 5);
  p.file(".wwjd/runtime.json", "{}", 5);
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /critic/);
  const critic = () => p.run("status", {}).checks.find((c) => c.key === "critic").done;
  const read = new Date(Date.now() + 5000).toISOString();
  appendFileSync(p.transcript, JSON.stringify({ timestamp: read, message: { content: [{ type: "tool_result", content: "5 Strict: adds the wwjd-critic agent" }] } }) + "\n");
  assert.equal(critic(), false);
  const later = new Date(Date.now() + 5000).toISOString();
  appendFileSync(p.transcript, JSON.stringify({ timestamp: later, message: { content: [{ type: "tool_use", name: "Agent", input: { subagent_type: "wwjd:wwjd-critic" } }] } }) + "\n");
  assert.equal(critic(), true);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("stop: asks once per run of edits; with no new edit it stays silent, in this turn and the next", () => {
  const p = project(2);
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
  // the agent says why the checks can't run (or the person declined them): no re-prompt loop
  assert.equal(p.run("stop", { stop_hook_active: true }), null);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
});

test("status reports the dial, the sheet and each check", () => {
  const p = project(4);
  let s = p.run("status", {});
  assert.equal(s.strictness, 4);
  assert.deepEqual(s.sheet, { needed: true, file: null, due: false });
  assert.equal(s.hasEdits, false);
  p.file(".wwjd/grade/task-card.md", "within budget");
  p.edit("card.html");
  s = p.run("status", {});
  assert.equal(s.sheet.file, "task-card.md");
  assert.deepEqual(s.checks.map((c) => [c.key, c.done]), [["shots", false], ["fit", false], ["dark", false], ["runtime", false], ["log", false]]);
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  assert.equal(p.run("status", {}).checks[0].done, true);
});

test("stop: edits after a block don't reset the count; a new user turn does", () => {
  const p = project(2);
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: true }).decision, "block");
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: true }), null);
  p.edit("card.html");
  assert.equal(p.run("stop", { stop_hook_active: false }).decision, "block");
});

test("ledger: parallel hooks merge their fields instead of overwriting each other", async () => {
  const p = project(5);
  p.edit("card.html");
  const calls = [];
  for (let i = 0; i < 6; i++) {
    calls.push(p.runAsync("pre", write(join(p.root, `new${i}.html`))));
    calls.push(p.runAsync("post", { tool_name: "Edit", tool_input: { file_path: join(p.root, `c${i}.css`) } }));
  }
  await Promise.all(calls);
  const l = p.ledger();
  assert.ok(l.denied > 0, "the gate's refusal note survives the edits");
  assert.match(l.lastFile, /c\d\.css$/);
  assert.equal(readdirSync(join(p.state, "wwjd-gate")).filter((f) => /\.(tmp|lock)$/.test(f)).length, 0);
});

test("tests, fixtures and stories are not UI work", () => {
  const p = project(3);
  for (const f of ["src/card.test.tsx", "src/card.spec.tsx", "src/card.stories.tsx", "src/__tests__/card.tsx", "fixtures/page.html"]) {
    assert.equal(p.run("pre", write(join(p.root, f))), null, f);
    p.edit(f);
  }
  assert.equal(p.run("status", {}).hasEdits, false);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("artifacts live at the nearest folder with .wwjd.json, as render.mjs writes them", () => {
  const p = project(2);
  const app = join(p.root, "apps", "web");
  mkdirSync(app, { recursive: true });
  writeFileSync(join(app, ".wwjd.json"), JSON.stringify({ dials: { strictness: 2 } }));
  const inApp = (mode, input) => p.run(mode, { cwd: app, ...input });
  writeFileSync(join(app, "card.html"), "<div></div>");
  inApp("post", { tool_name: "Write", tool_input: { file_path: join(app, "card.html") } });
  p.file(".wwjd/shots/card-390-light.png", "png", 5); // the git root: not this project's
  assert.equal(inApp("stop", { stop_hook_active: false }).decision, "block");
  p.file("apps/web/.wwjd/shots/card-390-light.png", "png", 5);
  assert.equal(inApp("stop", { stop_hook_active: false }), null);
});

test("shot commands point at an edited page, else the preview URL, never a source file", () => {
  const p = project(2);
  p.edit("card.html");
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /shoot \S*card\.html/);
  p.edit("src/Card.tsx");
  const how = (extra) => p.run("status", {}, extra).checks[0].how;
  assert.match(how({}), /shoot <your running page URL>/);
  assert.match(how({ WWJD_PREVIEW: "http://localhost:5173/board" }), /shoot http:\/\/localhost:5173\/board/);
  writeFileSync(join(p.root, ".wwjd.json"), JSON.stringify({ dials: { strictness: 2 }, preview: "http://localhost:3000" }));
  assert.match(how({}), /shoot http:\/\/localhost:3000/);
});

test("status: the sheet is due only after the pre gate refused a new file", () => {
  const p = project(4);
  p.file("old.html");
  p.edit("old.html");
  assert.equal(p.run("status", {}).sheet.due, false);
  p.run("pre", write(join(p.root, "new.html")));
  assert.equal(p.run("status", {}).sheet.due, true);
  p.file(".wwjd/grade/new.md", "within budget: title + 3");
  assert.equal(p.run("status", {}).sheet.due, false);
});

test("stop: from Strictness 2 asks once per run of edits for logged decisions", () => {
  const p = project(2);
  p.edit("card.html");
  p.file(".wwjd/shots/UNAVAILABLE", "no renderer", 5);
  const r = p.run("stop", { stop_hook_active: false });
  assert.match(r.reason, /mcp__wwjd__log/);
  assert.equal(p.run("stop", { stop_hook_active: false }), null); // asked once: a turn with nothing to log may end
  p.edit("card.html");
  p.file(".wwjd/shots/UNAVAILABLE", "no renderer", 5);
  p.file(".wwjd/decisions.jsonl", JSON.stringify({ id: "d1", at: new Date(Date.now() + 5000).toISOString(), surface: "Card", kind: "choice", text: "x" }));
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
  assert.equal(project(1).run("stop", { stop_hook_active: false }), null);
});

test("stop: from Strictness 3 a fit report with errors blocks and names them", () => {
  const p = project(3);
  p.edit("card.html");
  p.file(".wwjd/decisions.jsonl", JSON.stringify({ id: "d1", at: new Date(Date.now() + 5000).toISOString(), surface: "Card", kind: "choice", text: "x" }));
  p.file(".wwjd/shots/card-390-light.png", "png", 5);
  p.file(".wwjd/shots/card-1440-light.png", "png", 5);
  p.file(".wwjd/fit.json", JSON.stringify({ findings: [{ width: 480, rule: "orphan-item", severity: "error", what: "Assignee wrapped onto a line of its own" }] }), 5);
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /orphan-item: Assignee/);
  p.file(".wwjd/fit.json", JSON.stringify({ findings: [] }), 6);
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
});

test("status: decisions logged in the edited project count, not only the session's", () => {
  const p = project(3);
  const other = mkdtempSync(join(tmpdir(), "wwjd-other-"));
  execFileSync("git", ["init", "-q", other]);
  writeFileSync(join(other, "card.html"), "<div></div>");
  p.run("post", { tool_name: "Write", tool_input: { file_path: join(other, "card.html") } });
  const log = () => p.run("status", {}).checks.find((c) => c.key === "log").done;
  assert.equal(log(), false);
  mkdirSync(join(other, ".wwjd"));
  writeFileSync(join(other, ".wwjd", "decisions.jsonl"), JSON.stringify({ id: "d1", at: new Date(Date.now() + 5000).toISOString(), surface: "Card", kind: "choice", text: "x" }) + "\n");
  assert.equal(log(), true);
});

test("stop: an edited file that is gone again asks for no checks", () => {
  const p = project(3);
  p.edit("fragment.html");
  assert.match(p.run("stop", { stop_hook_active: false }).reason, /render/);
  rmSync(join(p.root, "fragment.html"));
  assert.equal(p.run("stop", { stop_hook_active: false }), null);
  assert.equal(p.run("status", {}).hasEdits, false);
});

test("checks run from where the page is served count: reports at the edited file's project root", () => {
  const p = project(3);
  const site = mkdtempSync(join(tmpdir(), "wwjd-site-"));
  writeFileSync(join(site, ".wwjd.json"), "{}");
  writeFileSync(join(site, "page.html"), "<div></div>");
  p.run("post", { tool_name: "Write", tool_input: { file_path: join(site, "page.html") } });
  const later = Date.now() / 1000 + 5;
  mkdirSync(join(site, ".wwjd", "shots"), { recursive: true });
  for (const w of [390, 1440]) { const f = join(site, ".wwjd", "shots", `page-${w}-light.png`); writeFileSync(f, "png"); utimesSync(f, later, later); }
  writeFileSync(join(site, ".wwjd", "fit.json"), JSON.stringify({ url: "http://127.0.0.1/page.html", errors: 0, findings: [] }));
  utimesSync(join(site, ".wwjd", "fit.json"), later, later);
  const done = Object.fromEntries(p.run("status", {}).checks.map((c) => [c.key, c.done]));
  assert.equal(done.shots, true);
  assert.equal(done.fit, true);
});

test("pre: a new project's first UI file waits for the start question, at any Strictness", () => {
  const p = project(1);
  const app = mkdtempSync(join(tmpdir(), "wwjd-new-"));
  execFileSync("git", ["init", "-q", app]);
  writeFileSync(join(app, "package.json"), "{}");
  const r = p.run("pre", write(join(app, "src", "App.tsx")));
  assert.equal(r.hookSpecificOutput.permissionDecision, "deny");
  assert.match(r.hookSpecificOutput.permissionDecisionReason, /start question/);
  assert.match(r.hookSpecificOutput.permissionDecisionReason, /wwjd-new-\w+\/\.wwjd\.json/);
  writeFileSync(join(app, ".wwjd.json"), JSON.stringify({ start: "variants", dials: { strictness: 1 } }));
  assert.equal(p.run("pre", write(join(app, "src", "App.tsx"))), null);
});

test("pre: no start question for a project that already has UI, or a loose page outside any project", () => {
  const p = project(1);
  const app = mkdtempSync(join(tmpdir(), "wwjd-old-"));
  execFileSync("git", ["init", "-q", app]);
  mkdirSync(join(app, "src"));
  writeFileSync(join(app, "src", "Home.tsx"), "<div/>");
  assert.equal(p.run("pre", write(join(app, "src", "New.tsx")), { CLAUDE_PLUGIN_OPTION_STRICTNESS: "2" }), null);
  const loose = mkdtempSync(join(tmpdir(), "wwjd-scratch-"));
  assert.equal(p.run("pre", write(join(loose, "variants.html")), { CLAUDE_PLUGIN_OPTION_STRICTNESS: "2" }), null);
});

test("pre: a session in one repo writing another project reads that project's dials and grade sheets", () => {
  const p = project(1);
  const app = mkdtempSync(join(tmpdir(), "wwjd-other-"));
  execFileSync("git", ["init", "-q", app]);
  writeFileSync(join(app, ".wwjd.json"), JSON.stringify({ dials: { strictness: 4 } }));
  const r = p.run("pre", write(join(app, "Card.tsx")));
  assert.equal(r.hookSpecificOutput.permissionDecision, "deny");
  assert.match(r.hookSpecificOutput.permissionDecisionReason, new RegExp(`grade/<surface>\\.json in ${app.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  mkdirSync(join(app, ".wwjd", "grade"), { recursive: true });
  writeFileSync(join(app, ".wwjd", "grade", "card.md"), "within budget: title + 2");
  assert.equal(p.run("pre", write(join(app, "Card.tsx"))), null);
});

test("stop: render commands write to the edited project with --root when it is not the session's", () => {
  const p = project(3);
  const app = mkdtempSync(join(tmpdir(), "wwjd-other-"));
  writeFileSync(join(app, ".wwjd.json"), "{}");
  writeFileSync(join(app, "Card.tsx"), "<div/>");
  p.run("post", { tool_name: "Write", tool_input: { file_path: join(app, "Card.tsx") } });
  const how = p.run("status", {}).checks.map((c) => c.how).join("\n");
  assert.match(how, new RegExp(`shoot .* --root ${app.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  assert.match(how, /fit .* --root /);
  p.edit("card.html");
  assert.doesNotMatch(p.run("status", {}).checks.map((c) => c.how).join("\n"), /--root/);
});

test("stop: a Design canvas board (.dc.html) asks for no shots or fit, only the log", () => {
  const p = project(4);
  p.edit("canvas/project/Main.dc.html");
  const r = p.run("stop", { stop_hook_active: false });
  assert.match(r.reason, /mcp__wwjd__log/);
  assert.doesNotMatch(r.reason, /render\.mjs/);
  assert.deepEqual(p.run("status", {}).checks.map((c) => c.key), ["log"]);
});
