// ledger.mjs: the per-session note of UI work the Strictness gate reads (gate.mjs) and the edit hook writes
// (wwjd.mjs check --hook, one process per edit). Per session, in $TMPDIR/wwjd-gate. Updated under a lock, re-read and
// merged field by field, then renamed into place, so parallel hooks never undo each other. No deps, Node 20.10+.
import { closeSync, mkdirSync, openSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { SKIP_DIR, STORY, TEST, UI_EXT } from "./paths.mjs";

/** UI work for the gate: tests, fixtures, stories and build output are not. */
export const isUI = (p) => typeof p === "string" && UI_EXT.has(extname(p)) && !SKIP_DIR.test(p) && !TEST.test(p) && !STORY.test(p);

const nap = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** The ledger of the session the hook input names: read, a locked update, and read-or-start. */
export function openLedger(input) {
  const state = join(process.env.TMPDIR || tmpdir(), "wwjd-gate");
  const file = join(state, `${String(input.session_id || "none").replace(/[^\w.-]/g, "_")}.json`);
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
  if (!["Write", "Edit", "MultiEdit"].includes(input.tool_name) || !isUI(fp)) return false;
  const now = Date.now(), at = resolve(input.cwd || process.cwd(), fp);
  // A page edit (anything but a Design canvas, .dc.html) is what the render checks look at; a canvas edit never clears it.
  openLedger(input).update((l) => { l.lastEdit = now; l.lastFile = at; if (!/\.dc\.html$/.test(at)) { l.lastPage = at; l.lastPageEdit = now; } });
  return true;
}
