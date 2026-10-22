#!/usr/bin/env node
// canvas.mjs: the project canvas's files (references/canvas.md), made from what is already on disk: a claude.ai Design
// canvas with the flow diagram, one row of real screenshots per journey and the design decisions as stickies under
// each screen. Claude publishes what it writes; nobody edits the generated files by hand.
//   uploads                        prints { upload: [abs paths] }: shots in wwjd.flow.json not uploaded yet, or changed.
//   assets <path>=</_blob/url>…    records uploads in .wwjd/canvas-assets.json (with each file's mtime and size).
//   build [--current <file>] [--title "…"] [--all]
//                                  writes .wwjd/canvas/project/canvas.json, Main.dc.html (the flow diagram) and one
//                                  artboard per screen with an uploaded shot; prints { root, file_path, files, removed,
//                                  missing }. `files` holds only artboards changed since the last build
//                                  (.wwjd/canvas-sent.json); --all sends every one. --current is the live canvas.json read
//                                  back from the artifact: the person's moves and notes are kept.
// Every command takes --root <project> (default: artifactRoot(cwd)). No deps, Node 20.10+.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, openSync, readFileSync, readSync, closeSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { artifactRoot } from "../../ux/scripts/paths.mjs";

const argv = process.argv.slice(2);
const opt = { root: "", current: "", title: "", all: false, pairs: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--root") opt.root = argv[++i] || "";
  else if (a === "--current") opt.current = argv[++i] || "";
  else if (a === "--title") opt.title = argv[++i] || "";
  else if (a === "--all") opt.all = true;
  else opt.pairs.push(a);
}
const cmd = opt.pairs.shift(); // the first word that is not a flag
const fail = (msg) => { console.error(`canvas.mjs: ${msg}`); process.exit(2); };
const root = resolve(opt.root || artifactRoot(process.cwd()));
const dir = join(root, ".wwjd");
const json = (f, fallback) => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return fallback; } };
const print = (x) => console.log(JSON.stringify(x, null, 2));
/** A shot's key: project-relative, forward slashes. */
const keyOf = (p) => relative(root, resolve(root, p)).split(sep).join("/");
const mtimeOf = (abs) => { try { return Math.floor(statSync(abs).mtimeMs); } catch { return null; } };
const assetsFile = join(dir, "canvas-assets.json");

/** Width and height from a PNG's IHDR (bytes 16-23), or null for anything that is not a PNG. */
function pngSize(abs) {
  try {
    const b = Buffer.alloc(24), fd = openSync(abs, "r");
    try { readSync(fd, b, 0, 24, 0); } finally { closeSync(fd); }
    if (b.readUInt32BE(0) !== 0x89504e47 || b.toString("ascii", 12, 16) !== "IHDR") return null;
    const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
    return w && h ? { w, h } : null;
  } catch { return null; }
}

const flowFile = join(root, "wwjd.flow.json");
const flow = json(flowFile, null);
if (!["uploads", "assets", "build"].includes(cmd)) fail("usage: canvas.mjs uploads | assets <path>=<url>… | build [--current <file>] [--title <name>] [--all]");
if (cmd !== "assets" && !flow) fail(`no readable wwjd.flow.json in ${root}`);
const screens = Array.isArray(flow?.screens) ? flow.screens.filter((s) => s && typeof s.id === "string" && s.id) : [];
const assets = json(assetsFile, {});

// ── uploads ──
if (cmd === "uploads") {
  const upload = [];
  for (const s of screens) {
    if (!s.shot) continue;
    const key = keyOf(s.shot), abs = join(root, key), m = mtimeOf(abs);
    if (m === null) { console.error(`canvas.mjs: ${s.id}: shot ${key} not found`); continue; }
    if ((!assets[key]?.url || assets[key].mtime !== m) && !upload.includes(abs)) upload.push(abs);
  }
  print({ upload });
  process.exit(0);
}

// ── assets ──
if (cmd === "assets") {
  if (!opt.pairs.length) fail("assets needs <path>=</_blob/url> pairs");
  const recorded = [];
  for (const p of opt.pairs) {
    const m = /^(.+?)=((?:\/_blob\/|https:\/\/).+)$/.exec(p);
    if (!m) fail(`"${p}": want "<path>=</_blob/url>"`);
    const key = keyOf(isAbsolute(m[1]) ? m[1] : join(root, m[1])), abs = join(root, key), mtime = mtimeOf(abs);
    if (mtime === null) fail(`"${m[1]}": no such file`);
    const size = pngSize(abs);
    assets[key] = { url: m[2], mtime, ...(size ? { w: size.w, h: size.h } : {}) };
    recorded.push(key);
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(assetsFile, JSON.stringify(assets, null, 2));
  print({ recorded });
  process.exit(0);
}

// ── build ──
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const journeys = (Array.isArray(flow.journeys) ? flow.journeys : []).filter((j) => j && j.id && Array.isArray(j.steps));
const edges = Array.isArray(flow.edges) ? flow.edges.filter((e) => e && e.from && e.to) : [];
const screenOf = new Map(screens.map((s) => [s.id, s]));
const outDir = join(dir, "canvas"), projDir = join(outDir, "project");
const sentFile = join(dir, "canvas-sent.json");
const sent = json(sentFile, {});
sent.files ||= {};
sent.screens ||= {}; // board file -> screen id, for boards this script made
const current = opt.current ? json(resolve(opt.current), null) : null;
if (opt.current && !current) fail(`--current ${opt.current}: not readable JSON`);
const cfg = json(join(root, ".wwjd.json"), {});

/** The page skeleton every Design artboard needs; anything else fails silently. */
const page = (title, body, w, h) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<style>
body{margin:0}
</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`;

// Screen artboards: the shot at half its pixel size.
const pascal = (id) => id.split(/[^A-Za-z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join("") || "Screen";
const taken = new Set(["Main"]);
const art = new Map(); // screen id -> { file, w, h, html }
const missing = [];
for (const s of screens) {
  const key = s.shot ? keyOf(s.shot) : "", a = key ? assets[key] : null;
  const size = a?.url ? (pngSize(join(root, key)) || (a.w && a.h ? { w: a.w, h: a.h } : null)) : null;
  if (!size) { missing.push(s.id); continue; }
  let name = pascal(s.id), n = 2;
  if (/^\d/.test(name)) name = `S${name}`;
  while (taken.has(name)) name = `${pascal(s.id)}${n++}`;
  taken.add(name);
  // Shown at half the page's CSS width: render.mjs names shots <screen>-<css width>-<theme>.png, so a 2x retina file
  // (2880 px for a 1440 page) still shows at 720; without the width in the name, the file's pixel width stands in.
  const cssW = Number(/-(\d{3,4})-(?:light|dark)\.png$/.exec(key)?.[1]) || size.w;
  const w = Math.max(1, Math.round(cssW / 2)), h = Math.max(1, Math.round(size.h * (w / size.w))), title = s.title || s.id;
  const body = `<div style="width: ${w}px; height: ${h}px; background: #ffffff">
<img src="${esc(a.url)}" alt="${esc(title)}" style="display: block; width: ${w}px; height: ${h}px">
</div>`;
  art.set(s.id, { file: `${name}.dc.html`, w, h, title, html: page(title, body, w, h) });
}

// ── Main.dc.html: the flow diagram, one row per journey ──
const CARD_W = 220, CARD_H = 64, GAP = 64, M = 64, GREY = "#8a8378", RED = "#b5532f";
let markers = 0;
const marker = (color) => {
  const id = `dc-arrow-head-filled-${++markers}`;
  return { id, defs: `<defs><marker id="${id}" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible"><path d="M0 0 L4 2 L0 4 Z" fill="${color}" stroke="none" style="stroke: none; fill: ${color}; fill: context-stroke"/></marker></defs>` };
};
const svgStyle = (l, t, w, h, color) => `position: absolute; left: ${l}px; top: ${t}px; width: ${w}px; height: ${h}px; overflow: visible; fill: none; stroke: ${color}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round`;
/** A horizontal segment from x to x+n at y; with a head, its tip lands on x+n. */
const hseg = (x, y, n, color, head) => {
  const mk = head ? marker(color) : null;
  return `<svg width="${n}" height="8" viewBox="0 0 ${n} 8" preserveAspectRatio="none" style="${svgStyle(x, y - 4, n, 8, color)}">${mk ? mk.defs : ""}<path d="${head ? `M 0 4 L ${n - 4} 4` : `M 0 4 L ${n} 4`}"${mk ? ` marker-end="url(#${mk.id})"` : ""}></path></svg>`;
};
/** A vertical segment from y to y+n at x: plain going down, or with a head pointing up (tip at y). */
const vseg = (x, y, n, color, headUp) => {
  const mk = headUp ? marker(color) : null;
  return `<svg width="8" height="${n}" viewBox="0 0 8 ${n}" preserveAspectRatio="none" style="${svgStyle(x - 4, y, 8, n, color)}">${mk ? mk.defs : ""}<path d="${headUp ? `M 4 ${n} L 4 4` : `M 4 0 L 4 ${n}`}"${mk ? ` marker-end="url(#${mk.id})"` : ""}></path></svg>`;
};
const div = (style, text) => `<div style="${style}">${esc(text)}</div>`;

const arrows = [], cards = [], labels = [];
const seen = new Set();
let cardTop = 112, maxCols = 0, bottom = 72;
for (const j of journeys) {
  const steps = j.steps.filter((x) => typeof x === "string");
  if (!steps.length) continue;
  maxCols = Math.max(maxCols, steps.length);
  const xOf = (i) => M + i * (CARD_W + GAP);
  labels.push(div(`position: absolute; left: ${M}px; top: ${cardTop - 24}px; font-size: 13px; color: ${GREY}`, j.title || j.id));
  steps.forEach((id, i) => {
    const again = seen.has(id);
    seen.add(id);
    cards.push(div(`position: absolute; left: ${xOf(i)}px; top: ${cardTop}px; width: ${CARD_W}px; height: ${CARD_H}px; box-sizing: border-box; padding: 8px; display: flex; align-items: center; justify-content: center; text-align: center; background: #ffffff; border: 1px ${again ? "dashed" : "solid"} #d6d2c4; border-radius: 10px; font-size: 15px`, screenOf.get(id)?.title || id));
    if (i > 0) {
      const bad = edges.some((e) => e.from === steps[i - 1] && e.to === id && e.kind === "destructive");
      arrows.push(hseg(xOf(i - 1) + CARD_W, cardTop + CARD_H / 2, GAP - 1, bad ? RED : GREY, true));
    }
  });
  // Back and undo edges from a later step to an earlier one: loops under the row, 24px apart.
  const first = (id) => steps.indexOf(id);
  const loops = edges.filter((e) => (e.kind === "back" || e.kind === "undo") && first(e.from) > first(e.to) && first(e.to) >= 0);
  const cardBottom = cardTop + CARD_H;
  loops.forEach((e, k) => {
    const xl = xOf(first(e.from)) + CARD_W / 2, xe = xOf(first(e.to)) + CARD_W / 2, d = 36 + 24 * k, y = cardBottom + d;
    arrows.push(vseg(xl, cardBottom, d, GREY, false), hseg(xe, y, xl - xe, GREY, false), vseg(xe, cardBottom + 1, d - 1, GREY, true));
    labels.push(div(`position: absolute; left: ${xe}px; top: ${y + 12}px; width: ${xl - xe}px; text-align: center; font-size: 13px; color: ${GREY}`, e.kind === "undo" ? "Undo" : "Back"));
  });
  const extent = loops.length ? CARD_H + 36 + 24 * (loops.length - 1) + 12 + 16 : CARD_H;
  bottom = cardTop + extent;
  cardTop += Math.max(200, extent + 52);
}
const MW = Math.max(480, 2 * M + maxCols * CARD_W + Math.max(0, maxCols - 1) * GAP), MH = bottom + M;
const mainBody = `<div style="position: relative; width: ${MW}px; height: ${MH}px; background: #ffffff; font-family: system-ui, sans-serif">
${[...arrows, div(`position: absolute; left: 64px; top: 40px; font-size: 20px; font-weight: 600; color: #2b2925`, "How people move"), ...cards, ...labels].join("\n")}
</div>`;
const mainHtml = page("Flow", mainBody, MW, MH);

// ── decisions: the last line per id wins; dismissed ones are left out ──
const decisions = new Map();
try {
  for (const l of readFileSync(join(dir, "decisions.jsonl"), "utf8").split("\n")) {
    if (!l.trim()) continue;
    try { const x = JSON.parse(l); if (x && x.id) decisions.set(String(x.id), x); } catch { /* a torn line */ }
  }
} catch { /* no log yet */ }
const stickyText = (x) => {
  // An entry without a title shows its text up to the first clause break, at most seven words (as the sidebar does).
  const head = x.title || String(x.text || "").split(/[,;:(]|\s[—–]\s/)[0].trim().split(/\s+/).slice(0, 7).join(" "), why = x.why ? `\n${x.why}` : "";
  let t = x.kind === "save" ? `Johannes stepped in\n${head}${why}`
    : x.kind === "assumption" ? `Check: ${head}${why}`
    : `${x.aspect === "ux" ? "UX" : x.aspect === "ui" ? "UI" : "Decided"}: ${head}${why}`;
  if (x.correction?.note) t += `\nChanged to: ${x.correction.note}`;
  return t;
};
const FILL = { save: "orange", assumption: "blue" };
const noteId = (prefix, id) => {
  const s = id.replace(/[^A-Za-z0-9_-]/g, "_");
  return prefix.length + s.length <= 40 ? prefix + s : `${prefix}${s.slice(0, 40 - prefix.length - 9)}-${createHash("sha1").update(id).digest("hex").slice(0, 8)}`;
};
const estimate = (text, w) => Math.min(400, 32 + 22 * text.split("\n").reduce((n, l) => n + Math.max(1, Math.ceil((l.length * 7.5) / Math.max(40, w - 24))), 0));
const live = [...decisions.values()].filter((x) => !x.kept && (x.title || x.text));

// ── the canvas: Main at the top, one row per journey, stickies under each screen ──
const curBoards = current?.boards && typeof current.boards === "object" ? current.boards : {};
const curNotes = current?.notes && typeof current.notes === "object" ? current.notes : {};
const boards = {}, order = [], notes = {};
const mainBox = { x: 0, y: 0, w: MW, h: MH, ...(curBoards["Main.dc.html"] ? pick(curBoards["Main.dc.html"], ["x", "y", "w", "h"]) : {}), title: "Flow" };
boards["Main.dc.html"] = mainBox;
order.push("Main.dc.html");
function pick(o, keys) { const r = {}; for (const k of keys) if (Number.isFinite(o?.[k])) r[k] = o[k]; return r; }

/** Lays out a stack of stickies from (x, y): a note already on the canvas keeps its place, new ones go below. */
const noteAt = new Map(); // sticky id -> its decision's time, so the oldest give way first
const stack = (list, x, y, w) => {
  let cursor = y;
  for (const d of list) {
    const id = noteId("w-d-", String(d.id)), text = stickyText(d), h = estimate(text, w), was = curNotes[id];
    const at = was && Number.isFinite(was.x) && Number.isFinite(was.y) ? { x: was.x, y: was.y } : { x, y: cursor };
    notes[id] = { ...at, text, w, maxH: 400, fill: FILL[d.kind] || "gray" };
    noteAt.set(id, String(d.at || ""));
    cursor = Math.max(cursor, (was ? at.y : cursor) + h + 24);
  }
  return cursor - y;
};

const placed = new Map(); // screen id -> board box
const onBoard = (d) => d.screen && art.has(d.screen) && screenOf.has(d.screen);
const loose = live.filter((d) => !onBoard(d));
const looseH = stack(loose, mainBox.x + mainBox.w + 80, mainBox.y, 360);
let rowTop = Math.max(mainBox.y + mainBox.h, mainBox.y + looseH) + 120 + 240;
const inJourney = new Set(journeys.flatMap((j) => j.steps));
const rows = [...journeys.map((j) => ({ id: noteId("w-j-", String(j.id)), title: j.title || j.id, steps: j.steps })),
  { id: "w-o", title: "Other screens", steps: screens.map((s) => s.id).filter((id) => !inJourney.has(id)) }];
for (const r of rows) {
  const fresh = [...new Set(r.steps)].filter((id) => art.has(id) && !placed.has(id));
  if (!fresh.length) continue;
  let x = 0, rowH = 0;
  for (const id of fresh) {
    const a = art.get(id), was = curBoards[a.file];
    const box = { x, y: rowTop, w: a.w, h: a.h, ...(was ? pick(was, ["x", "y"]) : {}), title: a.title };
    boards[a.file] = box;
    order.push(a.file);
    placed.set(id, box);
    const w = Math.min(a.w, 360);
    const sh = stack(live.filter((d) => d.screen === id && onBoard(d)), box.x, box.y + a.h + 40, w);
    rowH = Math.max(rowH, a.h + (sh ? 40 + sh - 24 : 0));
    x += a.w + 80;
  }
  const was = curNotes[r.id];
  notes[r.id] = { kind: "title1", x: Number.isFinite(was?.x) ? was.x : 0, y: Number.isFinite(was?.y) ? was.y : rowTop - 240, text: r.title, maxW: x - 80 };
  rowTop += rowH + 120 + 240;
}

// The person's own boards and notes stay as they are; boards for screens gone from the flow are removed.
const ours = new Set(["Main.dc.html", ...[...art.values()].map((a) => a.file)]);
const removed = [];
for (const [file, id] of Object.entries(sent.screens)) if (!ours.has(file) && !screenOf.has(id)) removed.push(`project/${file}`);
for (const [file, b] of Object.entries(curBoards)) if (!ours.has(file) && !(file in sent.screens)) boards[file] = b;
for (const [file, id] of Object.entries(sent.screens)) if (!ours.has(file) && screenOf.has(id) && curBoards[file]) boards[file] = curBoards[file]; // its shot is gone: keep what is there
for (const [id, n] of Object.entries(curNotes)) if (!id.startsWith("w-")) notes[id] = n;
// Under 200 notes: the oldest decision stickies give way.
const cut = [];
for (const id of Object.keys(notes)
  .filter((id) => id.startsWith("w-d-"))
  .sort((a, b) => noteAt.get(a).localeCompare(noteAt.get(b)))) {
  if (Object.keys(notes).length < 200) break;
  delete notes[id];
  cut.push(id);
}
const curOrder = Array.isArray(current?.order) ? current.order.filter((f) => f in boards) : [];
const allOrder = [...new Set([...curOrder, ...order, ...Object.keys(boards)])];

// Keys this script doesn't own (the editor's own, ones added later) stay as the live canvas has them.
const canvas = {
  ...(current && typeof current === "object" ? current : {}),
  v: 3,
  createdOnFiles: current?.createdOnFiles || { v: 1, at: new Date().toISOString() },
  title: current?.title || opt.title || cfg.title || flow.app || basename(root),
  launch: current?.launch || { view: "canvas" },
  pages: Array.isArray(current?.pages) ? current.pages : [],
  boards,
  order: allOrder,
  notes,
  designSystems: Array.isArray(current?.designSystems) ? current.designSystems : [],
};

// ── write, and list only what changed since the last build ──
mkdirSync(projDir, { recursive: true });
const files = {}, hash = (s) => createHash("sha1").update(s).digest("hex");
const out = [["Main.dc.html", mainHtml], ...[...art.values()].map((a) => [a.file, a.html])];
const nextFiles = {};
for (const [file, html] of out) {
  writeFileSync(join(projDir, file), html);
  const h = hash(html), p = `project/${file}`;
  nextFiles[p] = h;
  if (opt.all || sent.files[p] !== h) files[p] = p;
}
for (const p of removed) rmSync(join(outDir, p), { force: true });
const canvasFile = join(projDir, "canvas.json");
writeFileSync(canvasFile, JSON.stringify(canvas, null, 2));
const screensSent = Object.fromEntries([...art.entries()].map(([id, a]) => [a.file, id]));
for (const [file, id] of Object.entries(sent.screens)) if (!removed.includes(`project/${file}`) && !(file in screensSent)) { screensSent[file] = id; if (sent.files[`project/${file}`]) nextFiles[`project/${file}`] = sent.files[`project/${file}`]; }
writeFileSync(sentFile, JSON.stringify({ files: nextFiles, screens: screensSent }, null, 2));
print({ root: outDir, file_path: canvasFile, files, removed, missing, ...(cut.length ? { notesCut: cut.length } : {}) });
