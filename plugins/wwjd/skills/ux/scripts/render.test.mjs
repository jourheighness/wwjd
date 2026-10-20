// node --test skills/ux/scripts/render.test.mjs: render.mjs fit on small pages, real findings and the scroll false
// positives. Skips when no Playwright is found (render exits 2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
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
