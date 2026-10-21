#!/usr/bin/env node
// gate.mjs: the Strictness dial, enforced by hooks. Reads the hook JSON on stdin; prints a hook decision or nothing.
//   pre    PreToolUse (Write): a new project's first UI file waits for the start question (commands/start.md §0): the
//          person picks variants first or straight to build, recorded as "start" in the project's .wwjd.json. Any
//          Strictness: wwjd owns the design side, so a new product never starts as code by default.
//          From Strictness 4, a new UI file also waits for a grade sheet (.wwjd/grade/*.md) written this session;
//          below that the agent grades in its head. A surface within budget still gets one line ("within budget: title + 3").
//   post   notes the session's last UI edit (ledger.mjs). The edit hook does this in its own process (wwjd.mjs check
//          --hook); this mode is the same call for scripts and tests.
//   stop   Stop: the checks the dial asks for, all newer than the last UI edit, before the turn may end:
//          2 a screenshot · 3 two widths · 4 a dark shot and a runtime report · 5 a wwjd-critic run.
//          .wwjd/shots/UNAVAILABLE (render.mjs writes it when it can't render) stands in for shots and runtime.
//          A Design canvas board (.dc.html) asks for no shots, fit or runtime: it renders only in its canvas.
//          Blocks at most twice per user turn, so a check that can't be done never traps the turn.
//   status the same state as JSON, for the wwjd status band (hooks/status.tsx): stdin { session_id, cwd }.
// The Hooks setting (paths.mjs hooksMode): "quiet" never blocks (no pre, no stop), "off" runs nothing.
// Artifacts (.wwjd/) live at the nearest ancestor with .wwjd.json or .wwjd/, else the git root (paths.mjs): of the file
// being written or last edited when a session in one folder works on another project, else of cwd.
// Tests, fixtures and stories are not UI work here. The ledger: ledger.mjs. A wwjd-critic run is read from the transcript.
// Strictness: the nearest .wwjd.json "dials" > the plugin option > WWJD_DIALS > 3. No deps, Node 20.10+.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isGated } from "./dials-spec.mjs";
import { isUI, noteEdit, openLedger } from "./ledger.mjs";
import { MARKUP, artifactRoot, boardMode, dialsFor, hasUI, hooksMode, nearestConfig, projectOf } from "./paths.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RENDER = join(HERE, "render.mjs");

const mode = process.argv[2];
let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const cwd = input.cwd || process.cwd();

// Cheap exits first: no ledger, config or git for calls the gate does not care about.
const fp = input.tool_input?.file_path;
if (mode === "pre" && (input.tool_name !== "Write" || !isUI(fp) || existsSync(resolve(cwd, fp)))) process.exit(0);
if (mode === "post") { noteEdit(input); process.exit(0); }

const { read: readLedger, update, ensured } = openLedger(input);
const say = (o) => { console.log(JSON.stringify(o)); process.exit(0); };

// ── project ──
// The project is the file being written's (pre), else the last edited file's, else cwd's: a session in one repo may
// edit another, and its settings, board and dials are that project's.
const fileDir = mode === "pre" ? dirname(resolve(cwd, fp)) : null;
const lastFile = mode === "pre" ? null : readLedger().lastFile;
const projectDir = fileDir || (lastFile ? dirname(lastFile) : cwd);
// The Hooks setting (paths.mjs hooksMode): quiet keeps the edit note and drops every block; off drops the gate too.
const hooks = hooksMode(projectDir);
if (hooks === "off" || (hooks === "quiet" && (mode === "pre" || mode === "stop"))) {
  if (mode === "status") console.log(JSON.stringify({ strictness: 0, hooks, hasEdits: false, lastFile: null, sheet: { needed: false, file: null, due: false }, checks: [] }));
  process.exit(0);
}
const fileConfig = fileDir ? nearestConfig(fileDir) : null;
const configFile = nearestConfig(projectDir) || nearestConfig(cwd);
const config = (() => { try { return configFile ? JSON.parse(readFileSync(configFile, "utf8")) : {}; } catch { return {}; } })();
// Strictness: the project's dial (paths.mjs dialsFor: .wwjd.json > the plugin option > WWJD_DIALS > 3).
const strictness = () => dialsFor(configFile ? dirname(configFile) : projectDir).d.strictness;
let rootMemo = null;
const root = () => (rootMemo ??= artifactRoot(cwd));
const mtime = (p) => { try { return statSync(p).mtimeMs; } catch { return 0; } };

// The newest grade sheet written this session in any of `dirs` (project roots), or null.
function sheet(ledger, dirs = [root()]) {
  const fresh = dirs.flatMap((r) => {
    const dir = join(r, ".wwjd", "grade");
    return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md") && mtime(join(dir, f)) >= (ledger.start || 0) - 1000).map((f) => join(dir, f)) : [];
  });
  return fresh.sort((a, b) => mtime(b) - mtime(a))[0]?.split("/").pop() ?? null;
}

// What the transcript says happened after `since`: a wwjd-critic run, an ArtifactData write to the board. One pass,
// read only when a check needs it.
let seenMemo = null;
function seenSince(since, boardId) {
  if (seenMemo) return seenMemo;
  // The status band has no transcript path: it passes what it saw (hooks/status.tsx), as times.
  if (input.seen) return (seenMemo = { critic: (input.seen.critic || 0) > since, board: Boolean(boardId) && (input.seen.board?.[boardId] || 0) > since });
  const seen = { critic: false, board: false };
  try {
    for (const line of readFileSync(input.transcript_path, "utf8").split("\n")) {
      const critic = line.includes("wwjd-critic"), board = boardId && line.includes(boardId) && line.includes("ArtifactData");
      if (!critic && !board) continue;
      try {
        const row = JSON.parse(line);
        if (!(Date.parse(row.timestamp) > since)) continue;
        for (const b of Array.isArray(row.message?.content) ? row.message.content : []) {
          if (b.type !== "tool_use") continue;
          if (/wwjd-critic/.test(String(b.input?.subagent_type || ""))) seen.critic = true;
          if (boardId && b.name === "ArtifactData" && String(b.input?.url || "").includes(boardId)
            && ["set", "update", "batch", "delete", "str_replace"].includes(b.input?.action)) seen.board = true;
        }
      } catch { /* partial line */ }
    }
  } catch { /* no transcript */ }
  return (seenMemo = seen);
}

// What to point render.mjs at: an edited .html page itself; for source files, the running page.
function shotTarget(ledger) {
  if (ledger.lastPage && extname(ledger.lastPage) === ".html") return ledger.lastPage;
  return process.env.WWJD_PREVIEW || (typeof config.preview === "string" && config.preview) || "<your running page URL>";
}

// Where checks may have left their reports: the session's root and the edited file's project root (a page served over
// http is shot from wherever the server runs, a session in one repo edits another).
const editedMemo = new Map();
const editedRoot = (ledger) => (ledger.lastFile ? (editedMemo.has(ledger.lastFile) ? editedMemo.get(ledger.lastFile)
  : editedMemo.set(ledger.lastFile, artifactRoot(dirname(ledger.lastFile))).get(ledger.lastFile)) : root());
const roots = (ledger) => [...new Set([root(), editedRoot(ledger)])];
// An edit whose file is gone (a build fragment, deleted again) asks for no checks.
const editPending = (ledger) => Boolean(ledger.lastEdit) && !(ledger.lastFile && !existsSync(ledger.lastFile));
// Checks the person skipped in the sidebar (.wwjd/skipped.json, { key: time }): done for this run of edits.
function skippedAt(ledger) {
  const out = {};
  for (const r of roots(ledger)) { try { Object.assign(out, JSON.parse(readFileSync(join(r, ".wwjd", "skipped.json"), "utf8"))); } catch { /* none */ } }
  return out;
}

// Whether the sidebar's log (.wwjd/decisions.jsonl) gained an entry after `since`, in either root.
function loggedSince(since, ledger) {
  return roots(ledger).some((r) => {
    try {
      return readFileSync(join(r, ".wwjd", "decisions.jsonl"), "utf8").split("\n").some((line) => {
        try { return Date.parse(JSON.parse(line).at) > since; } catch { return false; }
      });
    } catch { return false; }
  });
}

// The checks Strictness `s` asks for after the last UI edit, each with whether it is done and how to do it.
const q = (v) => JSON.stringify(String(v)); // a path with spaces stays one argument
function checks(ledger, s) {
  const since = ledger.lastEdit || 0;
  // Reports go to the edited project: render.mjs --root when it is not the session's own
  const edited = editedRoot(ledger);
  const at = edited !== root() ? ` --root ${q(edited)}` : "";
  // Render checks look at the last page edit; a session that only touched Design canvases (.dc.html) gets none, since
  // a canvas renders only inside its own runtime (the handover says it was looked at there).
  const pageSince = ledger.lastPageEdit || 0;
  const board = !ledger.lastPageEdit;
  const fresh = roots(ledger).flatMap((r) => { const dir = join(r, ".wwjd", "shots"); return existsSync(dir) ? readdirSync(dir).filter((f) => mtime(join(dir, f)) > pageSince) : []; });
  const unavailable = fresh.includes("UNAVAILABLE");
  const pngs = fresh.filter((f) => f.endsWith(".png"));
  const widths = new Set(pngs.map((f) => /-(\d+)-(?:light|dark)\.png$/.exec(f)?.[1]).filter(Boolean));
  const raw = shotTarget(ledger);
  const target = raw.startsWith("<") ? raw : q(raw);
  const R = q(RENDER);
  const out = [];
  if (s >= 2 && !board) out.push(s >= 3
    ? { key: "shots", label: "Look at it on desktop and phone", what: "Claude takes screenshots at both sizes and looks at them before saying the work is done.", done: unavailable || widths.size >= 2, how: `screenshots at desktop and phone width: node ${R} shoot ${target} --theme light${at}` }
    : { key: "shots", label: "Look at it", what: "Claude takes a screenshot and looks at it before saying the work is done.", done: unavailable || pngs.length > 0, how: `a screenshot: node ${R} shoot ${target} --one${at}, then look at it` });
  if (s >= 3 && !board) {
    // Fit runs at 320–720px and must come back clean: wrapping, clipping and lone items are layout bugs, not taste.
    let fit = null;
    const fitFile = roots(ledger).map((r) => join(r, ".wwjd", "fit.json")).filter((f) => mtime(f) > pageSince).sort((a, b) => mtime(b) - mtime(a))[0];
    try { fit = fitFile ? JSON.parse(readFileSync(fitFile, "utf8")) : null; } catch { /* unreadable: not done */ }
    const errs = fit ? fit.findings.filter((f) => f.severity === "error").map((f) => `${f.width}px ${f.rule}: ${f.what}`) : [];
    out.push({ key: "fit", label: errs.length ? "Fix layout on small screens" : "Check layout on small screens", what: errs.length ? `${new Set(errs).size} layout ${new Set(errs).size === 1 ? "problem" : "problems"} on phone-width screens (something clips, overflows or wraps badly). Claude fixes them before handing over.` : "Claude opens the page at phone widths and checks that nothing clips, overflows or wraps badly.", done: unavailable || (fit !== null && errs.length === 0),
      how: errs.length ? `fix the fit errors, then rerun fit: ${[...new Set(errs)].slice(0, 4).join("; ")}` : `the fit check: node ${R} fit ${target} --widths 320,480,720${at}` });
  }
  if (s >= 4 && !board) {
    out.push({ key: "dark", label: "Look at it in dark mode", what: "Claude takes a dark-mode screenshot and checks that colours and contrast still work.", done: unavailable || pngs.some((f) => f.includes("-dark.")), how: `a dark-mode shot: node ${R} shoot ${target} --theme dark${at}` });
    out.push({ key: "runtime", label: "Test it in a real browser", what: "Claude runs the page and checks for clipped text, small tap targets, hidden focus, layout jumps and broken images.", done: unavailable || roots(ledger).some((r) => mtime(join(r, ".wwjd", "runtime.json")) > pageSince), how: `the runtime checks: node ${R} runtime ${target}${at}` });
  }
  // Asked once per run of edits: an agent that made no unasked choice says so in the handover and may stop.
  if (s >= 2) out.push({ key: "log", label: "List the choices Claude made", what: "Claude writes down what it decided without asking you, so you can approve or change each one here.", done: (ledger.logAsked || 0) >= since || loggedSince(ledger.start || 0, ledger),
    how: "the design assumptions and choices you made without being told: one mcp__wwjd__log call each (surface, kind, one-line text, why, proof: the shot path, the page URL or the Artifact link that shows it); none? say so in the handover" });
  // The project board (references/board.md), when the setting is on and the project has one
  const boardUrl = typeof config.board === "string" && /^https:\/\//.test(config.board) ? config.board : null;
  const boardId = boardUrl ? /artifact\/([\w-]+)/.exec(boardUrl)?.[1] : null;
  if (s >= 2 && boardId && boardMode(projectDir) === "on") out.push({ key: "board", label: "Add this round to the board",
    what: "Claude adds this round's decisions, screenshots and checks to the shared project board.", done: seenSince(since, boardId).board,
    how: `add this round to the project board ${boardUrl} in one ArtifactData batch (references/board.md); the Project board setting turns this off` });
  if (s >= 5) out.push({ key: "critic", label: "Get a second opinion", what: "A separate reviewer looks at the result with fresh eyes and lists what to fix.", done: seenSince(since, boardId).critic, how: "a cold review: run the wwjd:wwjd-critic agent on what you built" });
  const skipped = skippedAt(ledger);
  for (const c of out) if ((skipped[c.key] || 0) > since) Object.assign(c, { done: true, skipped: true });
  return out;
}

if (mode === "status") {
  const s = strictness();
  const ledger = ensured();
  const file = isGated(s) ? sheet(ledger, roots(ledger)) : null;
  // due: the pre gate refused a new UI file this session and no sheet has been written since.
  say({ strictness: s, hasEdits: editPending(ledger), lastFile: ledger.lastFile || null,
    sheet: { needed: isGated(s), file, due: isGated(s) && Boolean(ledger.denied) && !file }, checks: editPending(ledger) ? checks(ledger, s) : [] });
}

if (mode === "pre") {
  // The project is the nearest package (a monorepo's new app is its own project), else the artifact root.
  const project = (() => {
    const top = projectOf(fp, cwd);
    for (let d = fileDir; d !== dirname(d); d = dirname(d)) {
      if (existsSync(join(d, "package.json"))) return d;
      if (existsSync(join(d, ".git")) || existsSync(join(d, ".wwjd.json"))) break;
    }
    return top;
  })();
  // A new project (a repo or package with no .wwjd.json and no UI yet): the person decides how it starts, before any UI
  // file is written. Loose files outside a project (an Artifact page in a scratchpad, the variants themselves) pass.
  const isProject = existsSync(join(project, "package.json")) || existsSync(join(project, ".git"));
  const isMarkup = MARKUP.has(extname(fp)) && !/(^|\/)(docs?|emails?)\//.test(fp);
  if (!fileConfig && isMarkup && isProject && !hasUI(project)) {
    say({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason:
      `wwjd: ${project} is a new project, and wwjd owns its design side. Before the first UI file, ask the start question ` +
      `(skills/ux/commands/start.md §0) in one AskUserQuestion batch, each with a default: how to begin (lettered variants ` +
      `in an Artifact first, recommended; or straight to build), how many directions, and the look (a board of options, ` +
      `or quick mode). Then write ${join(project, ".wwjd.json")} with "start": "variants" or "build" (plus "register" and, ` +
      `once a project board exists, "board": its link, references/board.md), and do what they chose before writing ${fp}.` } });
  }
  const s = strictness();
  if (!isGated(s)) process.exit(0);
  const ledger = ensured();
  if (sheet(ledger, [...new Set([project, root()])])) process.exit(0);
  update((l) => { l.denied = Date.now(); });
  say({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason:
    `wwjd Strictness ${s}: grade this surface before building it (references/budgets.md, Grade gate). ` +
    `Write .wwjd/grade/<surface>.json in ${project}, run node ${join(HERE, "grade.mjs")} .wwjd/grade/<surface>.json there and answer its sheet in .wwjd/grade/<surface>.md. ` +
    `Within budget: one line in that .md ("within budget: title + 3"). Then write ${fp} again.` } });
}

if (mode === "stop") {
  const ledger = readLedger();
  if (!editPending(ledger)) process.exit(0);
  const s = strictness();
  const missing = checks(ledger, s).filter((c) => !c.done).map((c) => c.how);
  if (!missing.length && !ledger.blocks) process.exit(0);
  // Asked once per run of edits: once the checks were named, the handover says what ran and why the rest couldn't
  // (the person may have declined them), so a stop with no new UI edit since the ask stays silent, in this turn or
  // the next. Blocks also count per user turn: edits after a block can't loop the turn past two.
  let block = false;
  update((l) => {
    const prior = input.stop_hook_active ? (l.blocks || 0) : 0;
    const fresh = (l.lastEdit || 0) > (l.askedFor || 0);
    block = missing.length > 0 && fresh && prior < 2;
    l.blocks = block ? prior + 1 : 0;
    if (block) l.askedFor = l.lastEdit;
    if (block && missing.some((m) => m.includes("mcp__wwjd__log"))) l.logAsked = l.lastEdit;
  });
  if (!block) process.exit(0);
  say({ decision: "block", reason:
    `wwjd Strictness ${s}: before handing over, after your last UI edit:\n- ${missing.join("\n- ")}\n` +
    `Then hand over with what they showed. Can't run one? Say why in the handover.` });
}
