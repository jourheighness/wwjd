// ledger.mjs: the per-session (and per-subagent) note of UI work the Strictness gate reads (gate.mjs) and the edit hook writes
// (wwjd.mjs check --hook, one process per edit). Per session, in $TMPDIR/wwjd-gate. Updated under a lock, re-read and
// merged field by field, then renamed into place, so parallel hooks never undo each other. No deps, Node 20.10+.
import { closeSync, mkdirSync, openSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { NOT_PRODUCT, SKIP_DIR, STORY, TEST, UI_EXT, inPlugin } from "./paths.mjs";

/** UI work for the gate: tests, fixtures, stories, build output and pages about the work (plans, briefs) are not. */
export const isUI = (p) => typeof p === "string" && UI_EXT.has(extname(p)) && !SKIP_DIR.test(p) && !TEST.test(p) && !STORY.test(p) && !NOT_PRODUCT.test(p);

// An edit that only touches comments or whitespace changes nothing anyone sees.
const bare = (s) => String(s ?? "").replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|(^|[^:"'`\\])\/\/[^\n]*/g, "$1").replace(/\s+/g, "");
const cosmetic = (input) => {
  const t = input.tool_input || {};
  const pairs = input.tool_name === "Edit" ? [t] : input.tool_name === "MultiEdit" && Array.isArray(t.edits) ? t.edits : null;
  return Boolean(pairs?.length) && pairs.every((e) => typeof e.old_string === "string" && typeof e.new_string === "string" && bare(e.old_string) === bare(e.new_string));
};

const nap = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** The ledger of the session the hook input names: read, a locked update, and read-or-start. */
export function openLedger(input) {
  const state = join(process.env.TMPDIR || tmpdir(), "wwjd-gate");
  // A subagent's tool calls carry its agent_id: its edits and checks are its own, so parallel agents on different
  // projects never answer for each other, and the main session's Stop never waits on a subagent's page.
  const id = [input.session_id || "none", input.agent_id].filter(Boolean).join(".");
  const file = join(state, `${String(id).replace(/[^\w.-]/g, "_")}.json`);
  const read = () => { try { return JSON.parse(readFileSync(file, "utf8")); } catch { return {}; } };
  const locked = (fn) => {
    mkdirSync(state, { recursive: true });
    const lock = file + ".lock", until = Date.now() + 2000;
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
  };
  const sessionStart = () => { try { const s = statSync(input.transcript_path); return s.birthtimeMs || s.ctimeMs; } catch { return 0; } };
  /** Re-reads the ledger under the lock, lets `change` set only its own fields, writes a temp file and renames it. */
  const update = (change) => locked(() => {
    const l = read();
    if (!l.start) l.start = sessionStart() || Date.now();
    change(l);
    const tmp = `${file}.${process.pid}.tmp`;
    writeFileSync(tmp, JSON.stringify(l));
    renameSync(tmp, file);
    return l;
  });
  const ensured = () => { const l = read(); return l.start ? l : update(() => {}); };
  return { file, read, update, ensured };
}

/** Notes a UI edit (Write, Edit, MultiEdit) from PostToolUse input; anything else is ignored. */
export function noteEdit(input) {
  const fp = input.tool_input?.file_path;
  if (!["Write", "Edit", "MultiEdit"].includes(input.tool_name) || !isUI(fp) || cosmetic(input)) return false;
  const now = Date.now(), at = resolve(input.cwd || process.cwd(), fp);
  // A page edit is what the render checks look at. A Design canvas (.dc.html) and a file inside a Claude Code plugin
  // (plugin code, not a web page) never set it, so they ask only for the log.
  const page = !/\.dc\.html$/.test(at) && !inPlugin(at);
  openLedger(input).update((l) => { l.lastEdit = now; l.lastFile = at; if (page) { l.lastPage = at; l.lastPageEdit = now; } });
  return true;
}
