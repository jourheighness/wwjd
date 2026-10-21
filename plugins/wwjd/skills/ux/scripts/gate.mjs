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
// Artifacts (.wwjd/) live at the nearest ancestor with .wwjd.json or .wwjd/, else the git root (paths.mjs): of the file
// being written or last edited when a session in one folder works on another project, else of cwd.
// Tests, fixtures and stories are not UI work here. The ledger: ledger.mjs. A wwjd-critic run is read from the transcript.
// Strictness: the nearest .wwjd.json "dials" > the plugin option > WWJD_DIALS > 3. No deps, Node 20.10+.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isGated } from "./dials-spec.mjs";
import { isUI, noteEdit, openLedger } from "./ledger.mjs";
import { artifactRoot, gitRoot, hasUI, nearestConfig, projectOf } from "./paths.mjs";

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
// The project's config: the file being written's (pre), else cwd's. A session in one repo may edit another.
const fileDir = mode === "pre" && fp ? dirname(resolve(cwd, fp)) : null;
const fileConfig = fileDir ? nearestConfig(fileDir) : null;
const configFile = fileConfig || nearestConfig(cwd);
const config = (() => { try { return configFile ? JSON.parse(readFileSync(configFile, "utf8")) : {}; } catch { return {}; } })();
function strictness() {
  const v = config.dials?.strictness;
  if (v !== undefined) return Number(v);
  const opt = process.env.CLAUDE_PLUGIN_OPTION_STRICTNESS;
  if (opt) return Number(opt);
  const m = /(?:^|\s)strictness=(\d)/.exec(process.env.WWJD_DIALS || "");
  return m ? Number(m[1]) : 3;
}
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

// Whether a wwjd-critic agent ran after `since`, from the transcript.
function criticSince(since) {
  try {
    for (const line of readFileSync(input.transcript_path, "utf8").split("\n")) {
      if (!line.includes("wwjd-critic")) continue;
      try {
        const row = JSON.parse(line);
        const blocks = Array.isArray(row.message?.content) ? row.message.content : [];
        const called = blocks.some((b) => b.type === "tool_use" && /wwjd-critic/.test(String(b.input?.subagent_type || "")));
        if (called && Date.parse(row.timestamp) > since) return true;
      } catch { /* partial line */ }
    }
  } catch { /* no transcript */ }
  return false;
}

// What to point render.mjs at: an edited .html page itself; for source files, the running page.
function shotTarget(ledger) {
  if (ledger.lastFile && extname(ledger.lastFile) === ".html") return ledger.lastFile;
  return process.env.WWJD_PREVIEW || (typeof config.preview === "string" && config.preview) || "<your running page URL>";
}

// The checks Strictness `s` asks for after the last UI edit, each with whether it is done and how to do it.
// Whether the sidebar's log (.wwjd/decisions.jsonl) gained an entry after `since`: at the session's root, or at the
// root of the last edited file (the log tool writes to the project being edited, hooks/sidebar.tsx).
// Where checks may have left their reports: the session's root and the edited file's project root (a page served over
// http is shot from wherever the server runs, a session in one repo edits another).
const roots = (ledger) => [...new Set([root(), ...(ledger.lastFile ? [artifactRoot(dirname(ledger.lastFile))] : [])])];
// An edit whose file is gone (a build fragment, deleted again) asks for no checks.
const editPending = (ledger) => Boolean(ledger.lastEdit) && !(ledger.lastFile && !existsSync(ledger.lastFile));
function loggedSince(since, ledger) {
  return roots(ledger).some((r) => {
    try {
      return readFileSync(join(r, ".wwjd", "decisions.jsonl"), "utf8").split("\n").some((line) => {
        try { return Date.parse(JSON.parse(line).at) > since; } catch { return false; }
      });
    } catch { return false; }
  });
}

function checks(ledger, s) {
  const since = ledger.lastEdit || 0;
  // Reports go to the edited project: render.mjs --root when it is not the session's own
  const edited = ledger.lastFile ? artifactRoot(dirname(ledger.lastFile)) : root();
  const at = edited !== root() ? ` --root ${edited}` : "";
  const fresh = roots(ledger).flatMap((r) => { const dir = join(r, ".wwjd", "shots"); return existsSync(dir) ? readdirSync(dir).filter((f) => mtime(join(dir, f)) > since) : []; });
  const unavailable = fresh.includes("UNAVAILABLE");
  const pngs = fresh.filter((f) => f.endsWith(".png"));
  const widths = new Set(pngs.map((f) => /-(\d+)-(?:light|dark)\.png$/.exec(f)?.[1]).filter(Boolean));
  const target = shotTarget(ledger);
  // A Design canvas board (.dc.html) renders only inside its canvas runtime: shots and fit would measure raw
  // template text, so they are skipped and the handover says it was looked at in the canvas.
  const board = /\.dc\.html$/.test(ledger.lastFile || "");
  const out = [];
  if (s >= 2 && !board) out.push(s >= 3
    ? { key: "shots", label: "Shots at 2 widths", done: unavailable || widths.size >= 2, how: `screenshots at desktop and phone width: node ${RENDER} shoot ${target} --theme light${at}` }
    : { key: "shots", label: "Screenshot", done: unavailable || pngs.length > 0, how: `a screenshot: node ${RENDER} shoot ${target} --one${at}, then look at it` });
  if (s >= 3 && !board) {
    // Fit runs at 320–720px and must come back clean: wrapping, clipping and lone items are layout bugs, not taste.
    let fit = null;
    const fitFile = roots(ledger).map((r) => join(r, ".wwjd", "fit.json")).filter((f) => mtime(f) > since).sort((a, b) => mtime(b) - mtime(a))[0];
    try { fit = fitFile ? JSON.parse(readFileSync(fitFile, "utf8")) : null; } catch { /* unreadable: not done */ }
    const errs = fit ? fit.findings.filter((f) => f.severity === "error").map((f) => `${f.width}px ${f.rule}: ${f.what}`) : [];
    out.push({ key: "fit", label: errs.length ? "Fit errors" : "Fit check", done: unavailable || (fit !== null && errs.length === 0),
      how: errs.length ? `fix the fit errors, then rerun fit: ${[...new Set(errs)].slice(0, 4).join("; ")}` : `the fit check: node ${RENDER} fit ${target} --widths 320,480,720${at}` });
  }
  if (s >= 4 && !board) {
    out.push({ key: "dark", label: "Dark shot", done: unavailable || pngs.some((f) => f.includes("-dark.")), how: `a dark-mode shot: node ${RENDER} shoot ${target} --theme dark${at}` });
    out.push({ key: "runtime", label: "Runtime checks", done: unavailable || roots(ledger).some((r) => mtime(join(r, ".wwjd", "runtime.json")) > since), how: `the runtime checks: node ${RENDER} runtime ${target}${at}` });
  }
  // Asked once per run of edits: an agent that made no unasked choice says so in the handover and may stop.
  if (s >= 2) out.push({ key: "log", label: "Decisions logged", done: (ledger.logAsked || 0) >= since || loggedSince(ledger.start || 0, ledger),
    how: "the design assumptions and choices you made without being told: one mcp__wwjd__log call each (surface, kind, one-line text, why, proof: the shot path, the page URL or the Artifact link that shows it); none? say so in the handover" });
  if (s >= 5) out.push({ key: "critic", label: "Critic", done: criticSince(since), how: "a cold review: run the wwjd:wwjd-critic agent on what you built" });
  return out;
}

if (mode === "status") {
  const s = strictness();
  const ledger = ensured();
  const file = isGated(s) ? sheet(ledger, roots(ledger)) : null;
  // due: the pre gate refused a new UI file this session and no sheet has been written since.
  say({ strictness: s, hasEdits: editPending(ledger), lastFile: ledger.lastFile || null,
    sheet: { needed: isGated(s), file, due: isGated(s) && Boolean(ledger.denied) && !file }, checks: checks(ledger, s) });
}

if (mode === "pre") {
  const project = projectOf(fp, cwd);
  // A new project (a repo or package with no .wwjd.json and no UI yet): the person decides how it starts, before any UI
  // file is written. Loose files outside a project (an Artifact page in a scratchpad, the variants themselves) pass.
  const isProject = existsSync(join(project, "package.json")) || Boolean(gitRoot(project));
  if (!fileConfig && isProject && !hasUI(project)) {
    say({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason:
      `wwjd: ${project} is a new project, and wwjd owns its design side. Before the first UI file, ask the start question ` +
      `(skills/ux/commands/start.md §0) in one AskUserQuestion batch, each with a default: how to begin (lettered variants ` +
      `in an Artifact first, recommended; or straight to build), how many directions, and the look (a board of options, ` +
      `or quick mode). Then write ${join(project, ".wwjd.json")} with "start": "variants" or "build" (plus "register" and, ` +
      `once the comparison Artifact exists, "board": its link), and do what they chose before writing ${fp}.` } });
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
