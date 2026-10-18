#!/usr/bin/env node
// gate.mjs: the Strictness dial, enforced by hooks. Reads the hook JSON on stdin; prints a hook decision or nothing.
//   pre    PreToolUse (Write): from Strictness 3, a new UI file waits for a grade sheet (.wwjd/grade/*.md) written
//          this session. A surface within budget still gets one line there ("within budget: title + 3").
//   post   PostToolUse (Write, Edit, MultiEdit): notes the time of the session's last UI edit.
//   stop   Stop: the checks the dial asks for, all newer than the last UI edit, before the turn may end:
//          2 a screenshot · 3 two widths · 4 a dark shot and a runtime report · 5 a wwjd-critic run.
//          .wwjd/shots/UNAVAILABLE (render.mjs writes it when Playwright can't run) stands in for shots and runtime.
//          Blocks at most twice in a row, so a check that can't be done never traps the turn.
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

if (mode === "pre") {
  const fp = input.tool_input?.file_path;
  if (input.tool_name !== "Write" || !isUI(fp)) process.exit(0);
  const file = resolve(cwd, fp);
  if (existsSync(file)) process.exit(0);
  const s = strictness();
  if (s < 3) process.exit(0);
  const dir = join(root, ".wwjd", "grade");
  const start = sessionStart() - 1000;
  const fresh = existsSync(dir) && readdirSync(dir).some((f) => f.endsWith(".md") && mtime(join(dir, f)) >= start);
  if (fresh) process.exit(0);
  say({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason:
    `wwjd Strictness ${s}: grade this surface before building it (references/budgets.md, Grade gate). ` +
    `Write .wwjd/grade/<surface>.json, run node ${join(import.meta.dirname, "grade.mjs")} .wwjd/grade/<surface>.json and answer its sheet in .wwjd/grade/<surface>.md. ` +
    `Within budget: one line in that .md ("within budget: title + 3"). Then write ${fp} again.` } });
}

if (mode === "post") {
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
  if (s < 2) process.exit(0);
  const since = ledger.lastEdit;
  const shotsDir = join(root, ".wwjd", "shots");
  const fresh = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => mtime(join(shotsDir, f)) > since) : [];
  const unavailable = fresh.includes("UNAVAILABLE");
  const pngs = fresh.filter((f) => f.endsWith(".png"));
  const widths = new Set(pngs.map((f) => /-(\d+)-(?:light|dark)\.png$/.exec(f)?.[1]).filter(Boolean));
  const target = ledger.lastFile || "<file or url>";
  const missing = [];
  if (!unavailable) {
    if (s >= 2 && !pngs.length) missing.push(`a screenshot: node ${RENDER} shoot ${target} --one, then look at it`);
    else if (s >= 3 && widths.size < 2) missing.push(`screenshots at desktop and phone width: node ${RENDER} shoot ${target} --theme light`);
    if (s >= 4 && !pngs.some((f) => f.includes("-dark."))) missing.push(`a dark-mode shot: node ${RENDER} shoot ${target} --theme dark`);
    if (s >= 4 && mtime(join(root, ".wwjd", "runtime.json")) <= since) missing.push(`the runtime checks: node ${RENDER} runtime ${target}`);
  }
  if (s >= 5) {
    let critic = false;
    try {
      for (const line of readFileSync(input.transcript_path, "utf8").split("\n")) {
        if (!line.includes("wwjd-critic")) continue;
        try {
          const row = JSON.parse(line);
          const blocks = Array.isArray(row.message?.content) ? row.message.content : [];
          const called = blocks.some((b) => b.type === "tool_use" && /wwjd-critic/.test(String(b.input?.subagent_type || "")));
          if (called && Date.parse(row.timestamp) > since) { critic = true; break; }
        } catch { /* partial line */ }
      }
    } catch { /* no transcript */ }
    if (!critic) missing.push("a cold review: run the wwjd:wwjd-critic agent on what you built");
  }
  if (!missing.length) { ledger.blocks = 0; save(); process.exit(0); }
  ledger.blocks = input.stop_hook_active ? (ledger.blocks || 0) : 0;
  if (ledger.blocks >= 2) { ledger.blocks = 0; save(); process.exit(0); }
  ledger.blocks += 1;
  save();
  say({ decision: "block", reason:
    `wwjd Strictness ${s}: before handing over, after your last UI edit:\n- ${missing.join("\n- ")}\n` +
    `Then hand over with what they showed. Can't run one? Say why in the handover.` });
}
