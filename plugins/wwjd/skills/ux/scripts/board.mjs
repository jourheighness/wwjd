#!/usr/bin/env node
// board.mjs: the project board's writes, made from what is already on disk (references/board.md), so a round costs
// one command and one ArtifactData batch.
//   page  --title "Toolshed"   writes .wwjd/board.html: kit/board.html titled "<title> board" (its <title> is the
//                              gallery name), ready to publish.
//   round --title "<what was handed over>" [--summary "<one line>"] [--check "<label>=done|skipped|not run[: note]"]…
//         [--shot <screen>-<width>-<theme>.png=<upload url>]… [--again]
//         prints { writes, deleteAssets }: the batch for ArtifactData (each document a file under .wwjd/board-out/),
//         and the asset ids the new screenshots replaced. Reads .wwjd/decisions.jsonl (new entries, and entries settled
//         in the sidebar since) and .wwjd/directions.json (when the list changed). --again redoes the last round after
//         a failed batch.
// Every write creates a document, never changes one, so no write needs a version: a settled decision is a new
// settled/<id>-<round> document, a new screenshot or direction list carries its round in its id, and the page shows
// the newest of each. What was sent lives in .wwjd/board.json (local). No deps, Node 20.10+.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { artifactRoot } from "./paths.mjs";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..", "kit", "board.html");
const [cmd, ...argv] = process.argv.slice(2);
const opt = { title: "", summary: "", checks: [], shots: [], again: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--title") opt.title = argv[++i] || "";
  else if (a === "--summary") opt.summary = argv[++i] || "";
  else if (a === "--check") opt.checks.push(argv[++i] || "");
  else if (a === "--shot") opt.shots.push(argv[++i] || "");
  else if (a === "--again") opt.again = true;
}
const fail = (msg) => { console.error(`board.mjs: ${msg}`); process.exit(2); };
const root = artifactRoot(process.cwd());
const dir = join(root, ".wwjd");
const json = (f, fallback) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return fallback; } };

if (cmd === "page") {
  if (!opt.title) fail('page needs --title "<project name>"');
  const esc = opt.title.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "board.html");
  writeFileSync(out, readFileSync(KIT, "utf8").replace(/<title>[^<]*<\/title>/, `<title>${esc} board</title>`));
  console.log(out);
  process.exit(0);
}
if (cmd !== "round") fail("usage: board.mjs page --title <name> | round --title <what was handed over> [--check …] [--shot …]");
if (!opt.title) fail('round needs --title "<what was handed over>"');

// ── state: what earlier rounds sent ──
const stateFile = join(dir, "board.json");
let state = json(stateFile, null) || { rounds: 0, sent: {}, shots: {}, directions: "" };
if (opt.again) { if (!state.prev) fail("no round to redo"); state = state.prev; }
const prev = structuredClone(state);

const now = new Date();
const at = now.toISOString();
const n = state.rounds + 1;
const round = `r${String(n).padStart(3, "0")}`;
const out = join(dir, "board-out", round);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const writes = [];
const put = (collection, id, data) => {
  const file = join(out, `${String(writes.length + 1).padStart(3, "0")}-${collection}-${id}.json`.replace(/[^\w.@+-]/g, "_"));
  writeFileSync(file, JSON.stringify(data, null, 2));
  writes.push({ op: "set", collection, doc_id: id.replace(/[^\w.~:@+-]/g, "_"), file_path: file });
};

// ── the round ──
if (n === 1) {
  const cfg = json(join(root, ".wwjd.json"), {});
  put("meta", "project", { title: cfg.title || basename(root), summary: opt.summary || "" });
}
const STATUS = ["done", "skipped", "not run"];
const checks = opt.checks.map((c) => {
  const m = /^(.+?)=(done|skipped|not run)(?::\s*(.*))?$/.exec(c);
  if (!m) fail(`--check "${c}": want "<label>=done|skipped|not run[: note]"`);
  return { label: m[1].trim(), status: m[2], ...(m[3] ? { note: m[3].trim() } : {}) };
}).filter((c) => STATUS.includes(c.status));
put("handovers", round, { at, n, title: opt.title, checks });

// Decisions: new entries become documents; a settled one (sidebar ✕ or a correction) gets a settled document.
const statusOf = (x) => (x.correction ? "changed" : x.kept ? "dismissed" : "open");
const entries = (() => { try { return readFileSync(join(dir, "decisions.jsonl"), "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } }); } catch { return []; } })();
for (const x of entries) {
  if (!x.id || x.kind === "save") continue; // saves are the sidebar's flavor, not decisions
  const status = statusOf(x), change = x.correction?.note;
  if (!(x.id in state.sent)) {
    put("decisions", x.id, { at: x.at || at, round, task: x.task || "", surface: x.surface || "", kind: x.kind === "assumption" ? "assumption" : "choice",
      text: x.text || "", why: x.why || "", status, ...(change ? { change } : {}), proofs: Array.isArray(x.proof) ? x.proof : [] });
  } else if (state.sent[x.id] !== status) {
    put("settled", `${x.id}-${round}`, { id: x.id, at, status, ...(change ? { change } : {}) });
  }
  state.sent[x.id] = status;
}

// Directions: a changed list is a new set; the page shows the newest set.
const dirs = json(join(dir, "directions.json"), []);
const dirKey = JSON.stringify(dirs);
if (Array.isArray(dirs) && dirs.length && dirKey !== state.directions) {
  dirs.forEach((d, i) => put("directions", `${round}-${i + 1}`, { set: round, order: i + 1, name: String(d.name || ""), note: String(d.note || ""), url: String(d.url || ""), ...(d.board ? { board: String(d.board) } : {}) }));
  state.directions = dirKey;
}

// Screenshots: one per screen, width and theme is current; the one it replaces loses its asset.
const deleteAssets = [];
for (const s of opt.shots) {
  const eq = s.indexOf("=");
  const file = eq > 0 ? s.slice(0, eq) : "", url = eq > 0 ? s.slice(eq + 1) : "";
  const m = /([\w-]+?)-(\d+)-(light|dark)\.png$/.exec(basename(file));
  if (!m || !/^(https:\/\/|\/_blob\/)/.test(url)) fail(`--shot "${s}": want "<screen>-<width>-<theme>.png=<upload url>"`);
  const [, slug, width, theme] = m, key = `${slug}-${width}-${theme}`;
  const screen = slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
  put("shots", `${round}-${key}`, { at, screen, width: Number(width), theme, url });
  const old = state.shots[key];
  if (old && old !== url) deleteAssets.push(old.split("/").pop());
  state.shots[key] = url;
}

state.rounds = n;
state.prev = prev;
delete state.prev.prev;
writeFileSync(stateFile, JSON.stringify(state, null, 2));
const batches = [];
for (let i = 0; i < writes.length; i += 50) batches.push(writes.slice(i, i + 50));
console.log(JSON.stringify({ round, batches, deleteAssets }, null, 2));
