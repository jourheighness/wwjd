#!/usr/bin/env node
// gate.mjs: the Strictness dial, enforced by hooks. Reads the hook JSON on stdin; prints a hook decision or nothing.
//   pre    PreToolUse (Write): from Strictness 3, a new UI file waits for a grade sheet (.wwjd/grade/*.md) written
//          this session. A surface within budget still gets one line there ("within budget: title + 3").
//   post   PostToolUse (Write, Edit, MultiEdit, Agent): notes the session's last UI edit and its last wwjd-critic run.
//   stop   Stop: the checks the dial asks for, all newer than the last UI edit, before the turn may end:
//          2 a screenshot · 3 two widths · 4 a dark shot and a runtime report · 5 a wwjd-critic run.
//          .wwjd/shots/UNAVAILABLE (render.mjs writes it when it can't render) stands in for shots and runtime.
//          Blocks at most twice per user turn, so a check that can't be done never traps the turn.
//   status the same state as JSON, for the wwjd status band (hooks/status.tsx): stdin { session_id, cwd }.
// Artifacts (.wwjd/) live at the nearest ancestor of cwd with .wwjd.json or .wwjd/, else the git root (paths.mjs).
// Tests, fixtures and stories are not UI work here. The ledger (per session, in $TMPDIR/wwjd-gate) is updated under a
// lock, re-read and merged field by field, then renamed into place, so parallel hooks never undo each other.
// Strictness: the nearest .wwjd.json "dials" > the plugin option > WWJD_DIALS > 3. No deps, Node 20.10+.
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { STORY, TEST, UI_EXT, artifactRoot, nearestConfig } from "./paths.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const RENDER = join(HERE, "render.mjs");
const SKIP_DIR = /(^|\/)(node_modules|dist|build|out|\.next|\.git|\.wwjd)(\/|$)/;

const mode = process.argv[2];
let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const cwd = input.cwd || process.cwd();
const isUI = (p) => typeof p === "string" && UI_EXT.has(extname(p)) && !SKIP_DIR.test(p) && !TEST.test(p) && !STORY.test(p);

// Cheap exits first: no ledger, config or git for calls the gate does not care about.
const fp = input.tool_input?.file_path;
const isCritic = ["Agent", "Task"].includes(input.tool_name) && /wwjd-critic/.test(String(input.tool_input?.subagent_type || ""));
if (mode === "pre" && (input.tool_name !== "Write" || !isUI(fp) || existsSync(resolve(cwd, fp)))) process.exit(0);
if (mode === "post" && !isCritic && (!["Write", "Edit", "MultiEdit"].includes(input.tool_name) || !isUI(fp))) process.exit(0);

// ── ledger ──
const STATE = join(process.env.TMPDIR || tmpdir(), "wwjd-gate");
const ledgerFile = join(STATE, `${String(input.session_id || "none").replace(/[^\w.-]/g, "_")}.json`);
const readLedger = () => { try { return JSON.parse(readFileSync(ledgerFile, "utf8")); } catch { return {}; } };
const nap = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function locked(fn) {
  mkdirSync(STATE, { recursive: true });
  const lock = ledgerFile + ".lock", until = Date.now() + 2000;
  let fd = null;
  while (fd === null) {
    try { fd = openSync(lock, "wx"); } catch (e) {
      if (e.code !== "EEXIST") break; // can't lock here: the rename below still keeps the file whole
      try { if (Date.now() - statSync(lock).mtimeMs > 5000) { unlinkSync(lock); continue; } } catch { continue; } // a crashed holder
      if (Date.now() > until) break;
      nap(5);
    }
  }
  try { return fn(); } finally { if (fd !== null) { closeSync(fd); try { unlinkSync(lock); } catch { /* gone */ } } }
}
const sessionStart = () => { try { const s = statSync(input.transcript_path); return s.birthtimeMs || s.ctimeMs; } catch { return 0; } };
/** Re-reads the ledger under the lock, lets `change` set only its own fields, writes a temp file and renames it. */
function update(change) {
  return locked(() => {
    const l = readLedger();
    if (!l.start) l.start = sessionStart() || Date.now();
    change(l);
    const tmp = `${ledgerFile}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(l));
    renameSync(tmp, ledgerFile);
    return l;
  });
}
const ensured = () => { const l = readLedger(); return l.start ? l : update(() => {}); };
const say = (o) => { console.log(JSON.stringify(o)); process.exit(0); };

// ── project ──
const configFile = nearestConfig(cwd);
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

// The newest grade sheet written this session, or null.
function sheet(ledger) {
  const dir = join(root(), ".wwjd", "grade");
  if (!existsSync(dir)) return null;
  const fresh = readdirSync(dir).filter((f) => f.endsWith(".md") && mtime(join(dir, f)) >= (ledger.start || 0) - 1000);
  return fresh.sort((a, b) => mtime(join(dir, b)) - mtime(join(dir, a)))[0] ?? null;
}

// Whether a wwjd-critic agent ran after `since`: the post hook's note, else the transcript.
function criticSince(ledger, since) {
  if ((ledger.critic || 0) > since) return true;
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
  const fresh = roots(ledger).flatMap((r) => { const dir = join(r, ".wwjd", "shots"); return existsSync(dir) ? readdirSync(dir).filter((f) => mtime(join(dir, f)) > since) : []; });
  const unavailable = fresh.includes("UNAVAILABLE");
  const pngs = fresh.filter((f) => f.endsWith(".png"));
  const widths = new Set(pngs.map((f) => /-(\d+)-(?:light|dark)\.png$/.exec(f)?.[1]).filter(Boolean));
  const target = shotTarget(ledger);
  const out = [];
  if (s >= 2) out.push(s >= 3
    ? { key: "shots", label: "Shots at 2 widths", done: unavailable || widths.size >= 2, how: `screenshots at desktop and phone width: node ${RENDER} shoot ${target} --theme light` }
    : { key: "shots", label: "Screenshot", done: unavailable || pngs.length > 0, how: `a screenshot: node ${RENDER} shoot ${target} --one, then look at it` });
  if (s >= 3) {
    // Fit runs at 320–720px and must come back clean: wrapping, clipping and lone items are layout bugs, not taste.
    let fit = null;
    const fitFile = roots(ledger).map((r) => join(r, ".wwjd", "fit.json")).filter((f) => mtime(f) > since).sort((a, b) => mtime(b) - mtime(a))[0];
    try { fit = fitFile ? JSON.parse(readFileSync(fitFile, "utf8")) : null; } catch { /* unreadable: not done */ }
    const errs = fit ? fit.findings.filter((f) => f.severity === "error").map((f) => `${f.width}px ${f.rule}: ${f.what}`) : [];
    out.push({ key: "fit", label: errs.length ? "Fit errors" : "Fit check", done: unavailable || (fit !== null && errs.length === 0),
      how: errs.length ? `fix the fit errors, then rerun fit: ${[...new Set(errs)].slice(0, 4).join("; ")}` : `the fit check: node ${RENDER} fit ${target} --widths 320,480,720` });
  }
  if (s >= 4) {
    out.push({ key: "dark", label: "Dark shot", done: unavailable || pngs.some((f) => f.includes("-dark.")), how: `a dark-mode shot: node ${RENDER} shoot ${target} --theme dark` });
    out.push({ key: "runtime", label: "Runtime checks", done: unavailable || roots(ledger).some((r) => mtime(join(r, ".wwjd", "runtime.json")) > since), how: `the runtime checks: node ${RENDER} runtime ${target}` });
  }
  // Asked once per run of edits: an agent that made no unasked choice says so in the handover and may stop.
  if (s >= 2) out.push({ key: "log", label: "Decisions logged", done: (ledger.logAsked || 0) >= since || loggedSince(ledger.start || 0, ledger),
    how: "the design assumptions and choices you made without being told: one mcp__wwjd__log call each (surface, kind, one-line text, why); none? say so in the handover" });
  if (s >= 5) out.push({ key: "critic", label: "Critic", done: criticSince(ledger, since), how: "a cold review: run the wwjd:wwjd-critic agent on what you built" });
  return out;
}

if (mode === "status") {
  const s = strictness();
  const ledger = ensured();
  const file = s >= 3 ? sheet(ledger) : null;
  // due: the pre gate refused a new UI file this session and no sheet has been written since.
  say({ strictness: s, hasEdits: editPending(ledger), lastFile: ledger.lastFile || null,
    sheet: { needed: s >= 3, file, due: s >= 3 && Boolean(ledger.denied) && !file }, checks: checks(ledger, s) });
}

if (mode === "pre") {
  const s = strictness();
  if (s < 3) process.exit(0);
  const ledger = ensured();
  if (sheet(ledger)) process.exit(0);
  update((l) => { l.denied = Date.now(); });
  say({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason:
    `wwjd Strictness ${s}: grade this surface before building it (references/budgets.md, Grade gate). ` +
    `Write .wwjd/grade/<surface>.json in ${root()}, run node ${join(HERE, "grade.mjs")} .wwjd/grade/<surface>.json there and answer its sheet in .wwjd/grade/<surface>.md. ` +
    `Within budget: one line in that .md ("within budget: title + 3"). Then write ${fp} again.` } });
}

if (mode === "post") {
  const now = Date.now();
  if (isCritic) update((l) => { l.critic = now; });
  else update((l) => { l.lastEdit = now; l.lastFile = resolve(cwd, fp); });
  process.exit(0);
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
