// node --test skills/ux/scripts/render.test.mjs: render.mjs fit on small pages, real findings and the scroll false
// positives. Skips when no Playwright is found (render exits 2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RENDER = join(dirname(fileURLToPath(import.meta.url)), "render.mjs");

function fit(body) {
  const root = mkdtempSync(join(tmpdir(), "wwjd-render-"));
  writeFileSync(join(root, ".wwjd.json"), "{}");
  const page = join(root, "page.html");
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:14px sans-serif}</style>${body}`);
  const run = spawnSync("node", [RENDER, "fit", page, "--widths", "480", "--json"], { cwd: root, encoding: "utf8", timeout: 60000 });
  if (run.status === 2) return null;
  return JSON.parse(run.stdout).findings.map((f) => f.rule);
}
const rows = (n) => Array.from({ length: n }, (_, i) => `<li>Row ${i + 1}</li>`).join("");
const buttons = (n) => Array.from({ length: n }, (_, i) => `<button>Keep ${i + 1}</button>`).join("");
const RING = "button{display:block;margin:4px 0}button:focus{outline:2px solid blue;outline-offset:2px}";

test("hover-shift: rows below the fold are not moved by the scroll that hover makes", (t) => {
  const rules = fit(`<div style="height:3000px">Intro</div><ul>${rows(5)}</ul>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("hover-shift"), rules.join(", "));
});

test("hover-shift: a row that grows on hover still counts", (t) => {
  const rules = fit(`<style>li:hover{padding-bottom:20px}</style><ul>${rows(5)}</ul>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(rules.includes("hover-shift"), rules.join(", "));
});

test("ring-clipped: a control scrolled out of a padded scroller is not clipped", (t) => {
  const rules = fit(`<style>${RING}</style><div style="height:200px;overflow-y:auto;padding:14px">${buttons(20)}</div>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("ring-clipped"), rules.join(", "));
});

test("ring-clipped: a ring cut by overflow:hidden at an edge still counts", (t) => {
  const rules = fit(`<style>${RING}button{margin:0}</style><div style="overflow:hidden;padding:0">${buttons(1)}</div>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(rules.includes("ring-clipped"), rules.join(", "));
});

// A 390px phone header, as in the live run: two segmented groups positioned over the headline.
const HEAD = "header{position:relative;width:390px;padding:16px;box-sizing:border-box}h1{font-size:28px;margin:0}button{font:inherit;padding:6px 10px}[role=group]{display:flex}";
const GROUPS = '<div role="group"><button>Dag</button><button>Vecka</button></div><div role="group"><button>Lista</button><button>Karta</button></div>';

test("overlap: controls positioned over the headline", (t) => {
  const rules = fit(`<style>${HEAD}.tools{position:absolute;top:16px;right:16px;display:flex;gap:8px}</style><header><h1>Mina utredningar och ärenden</h1><div class="tools">${GROUPS}</div></header>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(rules.includes("overlap"), rules.join(", "));
});

test("overlap: a laid-out header, field adornments, a fixed toast, a badge and ellipsis cells stay clean", (t) => {
  const rules = fit(`<style>${HEAD}header{display:flex;flex-wrap:wrap;gap:8px}h1{flex:1 1 100%}
    .field{position:relative;width:300px}.field input{width:100%;padding:18px 32px 6px 8px;box-sizing:border-box}.field label{position:absolute;left:8px;top:4px;font-size:11px}
    .field .clear{position:absolute;right:4px;top:8px;width:24px;height:24px;padding:0}.toast{position:fixed;bottom:16px;left:16px;right:16px;background:#222;color:#fff}
    .inbox{position:relative}.badge{position:absolute;top:-6px;right:-6px;font-size:10px}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
    table{table-layout:fixed;width:300px}td{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style>
    <header><h1>Mina utredningar och ärenden</h1>${GROUPS}<button class="inbox">Inkorg<span class="badge">3</span></button></header>
    <span class="sr">Filter för listan</span><p>Lista</p>
    <div class="field"><input id="q" placeholder=" "><label for="q">Sök ärende</label><button class="clear" aria-label="Rensa">×</button></div>
    <table><tr><td>Leverantörsavtal för städtjänster i region Mitt</td><td>Anna Lindqvist, handläggare</td></tr></table>
    <div class="toast" role="status">Ärendet sparades</div>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("overlap"), rules.join(", "));
});

const DOT = ".dot{width:8px;height:8px;border-radius:50%;background:green}";

test("orphan-item: a status dot wrapped alone, in a flex row of two and in running text", (t) => {
  const flex = fit(`<style>${DOT}.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:300px}</style>
    <div class="row"><b>Granskning av leverantörsavtalen 2026 i regionen</b><span class="dot"></span></div>`);
  if (!flex) return t.skip("no Playwright");
  assert.ok(flex.includes("orphan-item"), flex.join(", "));
  // monospace at the text's width in ch: the line is full, so the dot has to wrap
  const inline = fit(`<style>${DOT}.dot{display:inline-block}h3{width:19ch;font:bold 17px monospace}</style>
    <h3>Granskning av avtal <span class="dot"></span></h3>`);
  assert.ok(inline.includes("orphan-item"), inline.join(", "));
});

test("orphan-item: a dot centred beside taller text on one line is not alone", (t) => {
  const rules = fit(`<style>${DOT}.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}</style>
    <div class="row"><span style="font-size:20px">Granskning</span><span class="dot"></span><span>Aktiv</span></div>
    <pre>Rader\n<b>NS</b>\nskrivna så</pre>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("orphan-item"), rules.join(", "));
});

test("orphan-item: a cell holding one word or a checkbox is laid out by the table; a lone row item still counts", (t) => {
  const rules = fit(`<style>table{width:460px}</style>
    <table><tr><th><span>Off</span></th><td><input type="checkbox" aria-label="Aktiv"></td><td>Leverantörsavtal</td></tr>
    <tr><td><span>På</span></td><td><input type="checkbox" aria-label="Aktiv"></td><td>Städtjänster</td></tr></table>
    <div role="grid"><div role="row" style="display:flex"><div role="gridcell" style="flex:1"><input type="checkbox" aria-label="Vald"></div><div role="gridcell" style="flex:3">Region Mitt</div></div></div>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("orphan-item"), rules.join(", "));
  const lone = fit(`<div><div><input type="checkbox" aria-label="Vald"></div><p>Leverantörsavtal för städtjänster</p></div>`);
  assert.ok(lone.includes("orphan-item"), lone.join(", "));
});

test("identifier-clipped: a visually hidden (sr-only) heading is skipped; a clipped one still counts", (t) => {
  const rules = fit(`<style>.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}
    .vh{position:absolute;clip-path:inset(50%);white-space:nowrap}</style>
    <h2 class="sr-only">Mina utredningar</h2><h2 class="vh">Mina utredningar och ärenden</h2><p>Lista</p>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("identifier-clipped"), rules.join(", "));
  const cut = fit(`<h2 style="width:120px;overflow:hidden;white-space:nowrap">Mina utredningar och ärenden</h2>`);
  assert.ok(cut.includes("identifier-clipped"), cut.join(", "));
});

const EXCERPT = "Leverantören har inte lämnat de begärda underlagen inom utsatt tid och vi behöver därför skicka en påminnelse innan nästa vecka, annars går ärendet vidare.";

test("text-sliced: an excerpt whose box cuts its third line in half", (t) => {
  const rules = fit(`<style>p{width:300px;font:14px/20px sans-serif;margin:0}</style><div style="height:50px;overflow:hidden"><p>${EXCERPT}</p></div>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(rules.includes("text-sliced"), rules.join(", "));
});

test("text-sliced: a cut on a line boundary, line-clamp, a scroller and a fade stay clean", (t) => {
  const rules = fit(`<style>p{width:300px;font:14px/20px sans-serif;margin:0}</style>
    <p style="height:40px;overflow:hidden">${EXCERPT}</p>
    <p style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${EXCERPT}</p>
    <div style="height:50px;overflow:auto"><p>${EXCERPT}</p></div>
    <p style="height:50px;overflow:hidden;mask-image:linear-gradient(#000 40%,transparent)">${EXCERPT}</p>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("text-sliced"), rules.join(", "));
});

// shoot --theme dark: { shot, stderr, status }, or null without Playwright.
function shootDark(body) {
  const root = mkdtempSync(join(tmpdir(), "wwjd-render-"));
  writeFileSync(join(root, ".wwjd.json"), "{}");
  writeFileSync(join(root, "page.html"), `<!doctype html><meta charset="utf-8">${body}`);
  const run = spawnSync("node", [RENDER, "shoot", join(root, "page.html"), "--theme", "dark", "--widths", "390", "--out", join(root, "shots")], { cwd: root, encoding: "utf8", timeout: 60000 });
  if (run.status === 2) return null;
  return { shot: existsSync(join(root, "shots", "page-390-dark.png")), stderr: run.stderr, status: run.status };
}

test("shoot dark: an app that keeps its theme in localStorage is shot dark", (t) => {
  const r = shootDark(`<style>html{background:#fff}html.dark{background:#111}</style>
    <script>if (!localStorage.getItem("theme")) localStorage.setItem("theme", "light");
    if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");</script><p>App</p>`);
  if (!r) return t.skip("no Playwright");
  assert.equal(r.shot, true, r.stderr);
  assert.equal(r.status, 0, r.stderr);
});

test("shoot dark: a page that stays light gets no dark shot and says so", (t) => {
  const r = shootDark(`<style>html{background:#fff}</style><p>Light only</p>`);
  if (!r) return t.skip("no Playwright");
  assert.equal(r.shot, false);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dark not applied/);
  const media = shootDark(`<style>html{background:#fff}@media (prefers-color-scheme: dark){html{background:#111}}</style><p>Both</p>`);
  assert.equal(media.shot, true, media.stderr);
});

test("a missing page exits 1 with file not found, never a clean fit or a blank shot", () => {
  const root = mkdtempSync(join(tmpdir(), "wwjd-render-"));
  for (const cmd of ["fit", "shoot"]) {
    const run = spawnSync("node", [RENDER, cmd, join(root, "gone.html"), "--widths", "390", "--out", join(root, "shots")], { cwd: root, encoding: "utf8", timeout: 60000 });
    assert.equal(run.status, 1, cmd + ": " + run.stdout + run.stderr);
    assert.match(run.stderr, /file not found/);
    assert.equal(existsSync(join(root, "shots")), false);
  }
});

test("overlap: an animated stage is measured at rest (a faint placeholder, glyphs mid-roll, an SVG with a class)", (t) => {
  const rules = fit(`<style>.stage{position:relative;height:80px}.stage span{position:absolute;left:0;top:0;font-size:24px}
    .ghost{opacity:.02}.roll{animation:roll 4s linear}@keyframes roll{from{transform:translateX(40px)}to{transform:translateX(0)}}
    @media (prefers-reduced-motion:reduce){.roll{animation:none}}.next{top:40px!important}</style>
    <div class="stage"><span class="ghost">Hidden copy behind</span><span class="roll">4210 g</span><span class="next">Accept all</span>
    <svg class="mark" width="20" height="20" style="clip-path:inset(0)"><g><rect width="20" height="20"/></g></svg></div>`);
  if (!rules) return t.skip("no Playwright");
  assert.ok(!rules.includes("overlap"), rules.join(", "));
});
