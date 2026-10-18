#!/usr/bin/env node
// gate.mjs: the Strictness dial, enforced by hooks. Reads the hook JSON on stdin; prints a hook decision or nothing.
//   pre    PreToolUse (Write): from Strictness 3, a new UI file waits for a grade sheet (.wwjd/grade/*.md) written
//          this session. A surface within budget still gets one line there ("within budget: title + 3").
//   post   PostToolUse (Write, Edit, MultiEdit, Agent): notes the session's last UI edit and its last wwjd-critic run.
//   stop   Stop: the checks the dial asks for, all newer than the last UI edit, before the turn may end:
//          2 a screenshot · 3 two widths · 4 a dark shot and a runtime report · 5 a wwjd-critic run.
//          .wwjd/shots/UNAVAILABLE (render.mjs writes it when Playwright can't run) stands in for shots and runtime.
//          Blocks at most twice in a row, so a check that can't be done never traps the turn.
//   status the same state as JSON, for the wwjd status band (hooks/status.tsx): stdin { session_id, cwd }.
// Strictness: the nearest .wwjd.json "dials" > the plugin option > WWJD_DIALS > 3. No deps, Node 20.10+.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

const UI_EXT = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".mdx", ".css", ".scss"]);
const SKIP_DIR = /(^|\/)(node_modules|dist|build|out|\.next|\.git|\.wwjd)(\/|$)/;
const RENDER = join(import.meta.dirname, "render.mjs");

const mode = process.argv[2];
let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const cwd = input.cwd || process.cwd();
const root = (() => {
  try { return execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || cwd; }
  catch { return cwd; }
})();

function strictness() {
  for (let d = cwd; ; d = dirname(d)) {
    const f = join(d, ".wwjd.json");
    if (existsSync(f)) {
      try { const v = JSON.parse(readFileSync(f, "utf8")).dials?.strictness; if (v !== undefined) return Number(v); } catch { /* bad config: fall through */ }
      break;
    }
    if (dirname(d) === d) break;
  }
  const opt = process.env.CLAUDE_PLUGIN_OPTION_STRICTNESS;
  if (opt) return Number(opt);
  const m = /(?:^|\s)strictness=(\d)/.exec(process.env.WWJD_DIALS || "");
  return m ? Number(m[1]) : 3;
}

const mtime = (p) => { try { return statSync(p).mtimeMs; } catch { return 0; } };
const sessionStart = () => {
  try { const s = statSync(input.transcript_path); return s.birthtimeMs || s.ctimeMs; } catch { return 0; }
};
const isUI = (p) => p && UI_EXT.has(extname(p)) && !SKIP_DIR.test(p);

const ledgerFile = join(process.env.TMPDIR || tmpdir(), "wwjd-gate", `${String(input.session_id || "none").replace(/[^\w.-]/g, "_")}.json`);
const ledger = (() => { try { return JSON.parse(readFileSync(ledgerFile, "utf8")); } catch { return {}; } })();
const save = () => { mkdirSync(dirname(ledgerFile), { recursive: true }); writeFileSync(ledgerFile, JSON.stringify(ledger)); };

const say = (o) => { console.log(JSON.stringify(o)); process.exit(0); };
if (!ledger.start) { ledger.start = sessionStart() || Date.now(); save(); }

// The newest grade sheet written this session, or null.
function sheet() {
  const dir = join(root, ".wwjd", "grade");
  if (!existsSync(dir)) return null;
  const fresh = readdirSync(dir).filter((f) => f.endsWith(".md") && mtime(join(dir, f)) >= ledger.start - 1000);
  return fresh.sort((a, b) => mtime(join(dir, b)) - mtime(join(dir, a)))[0] ?? null;
}

// Whether a wwjd-critic agent ran after `since`: the post hook's note, else the transcript.
function criticSince(since) {
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

// The checks Strictness `s` asks for after the last UI edit, each with whether it is done and how to do it.
function checks(s) {
  const since = ledger.lastEdit || 0;
  const shotsDir = join(root, ".wwjd", "shots");
  const fresh = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => mtime(join(shotsDir, f)) > since) : [];
  const unavailable = fresh.includes("UNAVAILABLE");
  const pngs = fresh.filter((f) => f.endsWith(".png"));
  const widths = new Set(pngs.map((f) => /-(\d+)-(?:light|dark)\.png$/.exec(f)?.[1]).filter(Boolean));
  const target = ledger.lastFile || "<file or url>";
  const out = [];
  if (s >= 2) out.push(s >= 3
    ? { key: "shots", label: "Shots at 2 widths", done: unavailable || widths.size >= 2, how: `screenshots at desktop and phone width: node ${RENDER} shoot ${target} --theme light` }
    : { key: "shots", label: "Screenshot", done: unavailable || pngs.length > 0, how: `a screenshot: node ${RENDER} shoot ${target} --one, then look at it` });
  if (s >= 4) {
    out.push({ key: "dark", label: "Dark shot", done: unavailable || pngs.some((f) => f.includes("-dark.")), how: `a dark-mode shot: node ${RENDER} shoot ${target} --theme dark` });
    out.push({ key: "runtime", label: "Runtime checks", done: unavailable || mtime(join(root, ".wwjd", "runtime.json")) > since, how: `the runtime checks: node ${RENDER} runtime ${target}` });
  }
  if (s >= 5) out.push({ key: "critic", label: "Critic", done: criticSince(since), how: "a cold review: run the wwjd:wwjd-critic agent on what you built" });
  return out;
}

if (mode === "status") {
  const s = strictness();
  say({ strictness: s, hasEdits: Boolean(ledger.lastEdit), lastFile: ledger.lastFile || null,
    sheet: s >= 3 ? { needed: true, file: sheet() } : { needed: false, file: null }, checks: checks(s) });
}

if (mode === "pre") {
  const fp = input.tool_input?.file_path;
  if (input.tool_name !== "Write" || !isUI(fp)) process.exit(0);
  if (existsSync(resolve(cwd, fp))) process.exit(0);
  const s = strictness();
  if (s < 3 || sheet()) process.exit(0);
  say({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason:
    `wwjd Strictness ${s}: grade this surface before building it (references/budgets.md, Grade gate). ` +
    `Write .wwjd/grade/<surface>.json, run node ${join(import.meta.dirname, "grade.mjs")} .wwjd/grade/<surface>.json and answer its sheet in .wwjd/grade/<surface>.md. ` +
    `Within budget: one line in that .md ("within budget: title + 3"). Then write ${fp} again.` } });
}

if (mode === "post") {
  if (["Agent", "Task"].includes(input.tool_name) && /wwjd-critic/.test(String(input.tool_input?.subagent_type || ""))) {
    ledger.critic = Date.now();
    save();
    process.exit(0);
  }
  const fp = input.tool_input?.file_path;
  if (!["Write", "Edit", "MultiEdit"].includes(input.tool_name) || !isUI(fp)) process.exit(0);
  ledger.lastEdit = Date.now();
  ledger.lastFile = resolve(cwd, fp);
  ledger.blocks = 0;
  save();
  process.exit(0);
}

if (mode === "stop") {
  if (!ledger.lastEdit) process.exit(0);
  const s = strictness();
  const missing = checks(s).filter((c) => !c.done).map((c) => c.how);
  if (!missing.length) { ledger.blocks = 0; save(); process.exit(0); }
  ledger.blocks = input.stop_hook_active ? (ledger.blocks || 0) : 0;
  if (ledger.blocks >= 2) { ledger.blocks = 0; save(); process.exit(0); }
  ledger.blocks += 1;
  save();
  say({ decision: "block", reason:
    `wwjd Strictness ${s}: before handing over, after your last UI edit:\n- ${missing.join("\n- ")}\n` +
    `Then hand over with what they showed. Can't run one? Say why in the handover.` });
}
