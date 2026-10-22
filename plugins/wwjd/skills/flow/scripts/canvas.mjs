#!/usr/bin/env node
// canvas.mjs: the project canvas's files (references/canvas.md), made from what is already on disk: a claude.ai Design
// canvas with the flow diagram, one row of real screenshots per journey and a "Why it looks like this" card ending each
// row. Claude publishes what it writes; nobody edits the generated files by hand.
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
// A screen's shot: an image inside the project, or nothing. A flow file from a cloned repo must never get Claude to
// upload a file from elsewhere on the machine.
const shotKey = (p) => {
  if (typeof p !== "string" || !p.trim()) return null;
  const key = keyOf(p);
  return key && !key.startsWith("..") && !isAbsolute(key) && /\.(png|jpe?g|webp|gif)$/i.test(key) ? key : null;
};
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
    const key = shotKey(s.shot);
    if (!key) { console.error(`canvas.mjs: ${s.id}: shot must be an image path inside the project`); continue; }
    const abs = join(root, key), m = mtimeOf(abs);
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
    const key = shotKey(isAbsolute(m[1]) ? m[1] : join(root, m[1]));
    if (!key) fail(`"${m[1]}": an image path inside the project`);
    const abs = join(root, key), mtime = mtimeOf(abs);
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
  const key = shotKey(s.shot) || "", a = key ? assets[key] : null;
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
// ── "Why it looks like this": one summary card per journey row, beside its screens ──
// Johannes stepped in first (the saves), then what Claude decided (UX or UI, one line why), then its guesses to check.
const short = (x) => x.title || String(x.text || "").split(/[,;:(]|\s[—–]\s/)[0].trim().split(/\s+/).slice(0, 7).join(" ");
const live = [...decisions.values()].filter((x) => !x.kept && (x.title || x.text));
const CARD = 480, INNER = CARD - 64;
const lines = (t, w, px) => Math.max(1, Math.ceil((String(t).length * px) / w));
const SHIELD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b5532f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0; margin-top: 2px"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>';
const label = (t) => `<div style="font-size: 13px; line-height: 18px; font-weight: 600; color: #6b6a65">${esc(t)}</div>`;
const item = (lead, x) => `<div style="display: flex; gap: 12px; align-items: flex-start">
${lead}
<div style="display: flex; flex-direction: column; gap: 2px">
<div style="font-size: 15px; line-height: 20px; font-weight: 600">${esc(short(x))}</div>
${x.why ? `<div style="font-size: 14px; line-height: 20px; color: #5c5a55">${esc(x.why)}</div>` : ""}
${x.correction?.note ? `<div style="font-size: 14px; line-height: 20px; color: #1f1e1c">Changed to: ${esc(x.correction.note)}</div>` : ""}
</div>
</div>`;
const tag = (x) => `<span style="flex-shrink: 0; width: 28px; padding: 2px 0; border-radius: 6px; background: #f1efea; color: #4a4944; font-size: 11px; line-height: 14px; font-weight: 600; text-align: center">${x.aspect === "ui" ? "UI" : x.aspect === "ux" ? "UX" : "·"}</span>`;
const itemH = (x, lead) => 20 * lines(short(x), INNER - lead, 8.6) + (x.why ? 2 + 20 * lines(x.why, INNER - lead, 7.4) : 0) + (x.correction?.note ? 20 * lines(`Changed to: ${x.correction.note}`, INNER - lead, 7.4) : 0);
function whyCard(where, list) {
  const saves = list.filter((x) => x.kind === "save"), choices = list.filter((x) => x.kind === "choice"), guesses = list.filter((x) => x.kind === "assumption");
  const parts = [], hs = [];
  if (saves.length) { parts.push(`<div style="display: flex; flex-direction: column; gap: 16px">\n${label("Johannes stepped in")}\n${saves.map((x) => item(SHIELD, x)).join("\n")}\n</div>`); hs.push(18 + saves.reduce((n, x) => n + 16 + itemH(x, 28), 0)); }
  if (choices.length) { parts.push(`<div style="display: flex; flex-direction: column; gap: 16px">\n${label("Claude decided")}\n${choices.map((x) => item(tag(x), x)).join("\n")}\n</div>`); hs.push(18 + choices.reduce((n, x) => n + 16 + itemH(x, 40), 0)); }
  if (guesses.length) { parts.push(`<div style="display: flex; flex-direction: column; gap: 12px">\n${label("Claude guessed, check these")}\n${guesses.map((x) => `<div style="font-size: 14px; line-height: 20px; color: #3d3c38">${esc(short(x))}</div>`).join("\n")}\n</div>`); hs.push(18 + guesses.reduce((n, x) => n + 12 + 20 * lines(short(x), INNER, 7.4), 0)); }
  const rule = '<div style="height: 1px; background: #ebe8e1"></div>';
  const h = Math.ceil(64 + 50 + hs.reduce((n, x) => n + x + 28, 0) + (hs.length - 1) * 29 + 24);
  const body = `<div style="width: ${CARD}px; height: ${h}px; box-sizing: border-box; padding: 32px; display: flex; flex-direction: column; gap: 28px; background: #ffffff; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1f1e1c">
<div style="display: flex; flex-direction: column; gap: 4px">
<div style="font-size: 13px; line-height: 18px; color: #6b6a65">${esc(where)}</div>
<h1 style="margin: 0; font-size: 22px; line-height: 28px; font-weight: 600">Why it looks like this</h1>
</div>
${parts.join(`\n${rule}\n`)}
</div>`;
  return { w: CARD, h, html: page(`Why: ${where}`, body, CARD, h) };
}
const noteId = (prefix, id) => {
  const s = id.replace(/[^A-Za-z0-9_-]/g, "_");
  return prefix.length + s.length <= 40 ? prefix + s : `${prefix}${s.slice(0, 40 - prefix.length - 9)}-${createHash("sha1").update(id).digest("hex").slice(0, 8)}`;
};

// ── the canvas: Main at the top, one row per journey: its screens, then its Why card ──
const curBoards = current?.boards && typeof current.boards === "object" ? current.boards : {};
const curNotes = current?.notes && typeof current.notes === "object" ? current.notes : {};
const boards = {}, order = [], notes = {}, why = new Map(); // why: file -> html
// The diagram keeps where the person put it; its size always follows the diagram drawn now.
const mainBox = { x: 0, y: 0, ...(curBoards["Main.dc.html"] ? pick(curBoards["Main.dc.html"], ["x", "y"]) : {}), w: MW, h: MH, title: "Flow" };
boards["Main.dc.html"] = mainBox;
order.push("Main.dc.html");
function pick(o, keys) { const r = {}; for (const k of keys) if (Number.isFinite(o?.[k])) r[k] = o[k]; return r; }
// One name registry for every generated artboard: a card never shares a file with a screen or another card.
const whyName = (stem) => { let name = stem, n = 2; while (taken.has(name)) name = `${stem}${n++}`; taken.add(name); return `${name}.dc.html`; };
const putWhy = (stem, where, list, x, y) => {
  const file = whyName(stem), c = whyCard(where, list), was = curBoards[file];
  boards[file] = { x, y, w: c.w, h: c.h, ...(was ? pick(was, ["x", "y"]) : {}), title: `Why: ${where}` };
  order.push(file);
  why.set(file, c.html);
  return c.h;
};

const placed = new Map(); // screen id -> board box
const onBoard = (d) => d.screen && art.has(d.screen) && screenOf.has(d.screen);
const loose = live.filter((d) => !onBoard(d));
const looseH = loose.length ? putWhy("WhyProject", flow.app || "The project", loose, mainBox.x + mainBox.w + 80, mainBox.y) : 0;
let rowTop = Math.max(mainBox.y + mainBox.h, mainBox.y + looseH) + 120 + 240;
const inJourney = new Set(journeys.flatMap((j) => j.steps));
const rows = [...journeys.map((j) => ({ key: String(j.id), id: noteId("w-j-", String(j.id)), title: j.title || j.id, steps: j.steps })),
  { key: "other", id: "w-o", title: "Other screens", steps: screens.map((s) => s.id).filter((id) => !inJourney.has(id)) }];
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
    rowH = Math.max(rowH, a.h);
    x += a.w + 80;
  }
  const mine = live.filter((d) => onBoard(d) && fresh.includes(d.screen));
  if (mine.length) { rowH = Math.max(rowH, putWhy(`Why${pascal(r.key)}`, r.title, mine, x, rowTop)); x += CARD + 80; }
  const was = curNotes[r.id];
  notes[r.id] = { kind: "title1", x: Number.isFinite(was?.x) ? was.x : 0, y: Number.isFinite(was?.y) ? was.y : rowTop - 240, text: r.title, maxW: x - 80 };
  rowTop += rowH + 120 + 240;
}

// The person's own boards and notes stay as they are; boards for screens gone from the flow are removed.
const ours = new Set(["Main.dc.html", ...[...art.values()].map((a) => a.file), ...why.keys()]);
const removed = [];
// A removal stays pending until the live canvas shows it gone, so a failed publish is retried by the next build.
const gone = (file) => current && !(file in curBoards);
// A Why card wwjd sent before that has nothing to say now goes too.
for (const p of Object.keys(sent.files)) if (/^project\/Why[\w-]*\.dc\.html$/.test(p) && !why.has(p.slice(8)) && !ours.has(p.slice(8)) && !(p.slice(8) in sent.screens) && !gone(p.slice(8))) removed.push(p);
for (const [file, id] of Object.entries(sent.screens)) if (!ours.has(file) && !screenOf.has(id) && !gone(file)) removed.push(`project/${file}`);
for (const [file, b] of Object.entries(curBoards)) if (!ours.has(file) && !(file in sent.screens) && !removed.includes(`project/${file}`)) boards[file] = b;
for (const [file, id] of Object.entries(sent.screens)) if (!ours.has(file) && screenOf.has(id) && curBoards[file]) boards[file] = curBoards[file]; // its shot is gone: keep what is there
for (const [id, n] of Object.entries(curNotes)) if (!id.startsWith("w-")) notes[id] = n;
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
const out = [["Main.dc.html", mainHtml], ...[...art.values()].map((a) => [a.file, a.html]), ...why.entries()];
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
for (const [file, id] of Object.entries(sent.screens)) if (!(file in screensSent) && !gone(file)) { screensSent[file] = id; if (sent.files[`project/${file}`]) nextFiles[`project/${file}`] = sent.files[`project/${file}`]; }
for (const p of removed) if (p.startsWith("project/Why") && sent.files[p]) nextFiles[p] = sent.files[p]; // a card's removal is pending too
writeFileSync(sentFile, JSON.stringify({ files: nextFiles, screens: screensSent }, null, 2));
print({ root: outDir, file_path: canvasFile, files, removed, missing });
