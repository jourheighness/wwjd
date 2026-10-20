// node --test skills/look/scripts/look.test.mjs: look.mjs bans apply to new choices, not to a project's own faces.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LOOK = join(dirname(fileURLToPath(import.meta.url)), "look.mjs");
function run(look) {
  const dir = mkdtempSync(join(tmpdir(), "wwjd-look-"));
  writeFileSync(join(dir, "look.json"), JSON.stringify(look));
  const r = spawnSync("node", [LOOK, "--look", join(dir, "look.json"), "--out", dir], { encoding: "utf8" });
  return { ...r, dir };
}
const FONTS = { display: '"Space Grotesk", sans-serif', sans: '"Inter", sans-serif' };

test("trend-font: a new pick of a trend face is rejected", () => {
  const r = run({ register: "operate", hue: 150, fonts: FONTS });
  assert.equal(r.status, 1);
  assert.match(r.stderr + r.stdout, /trend-font/);
});

test("trend-font: the project's own faces (lock fonts) are kept, and its pinned neutrals stay as they are", () => {
  const r = run({ register: "operate", brand: "#0F766E", fonts: FONTS, lock: ["register", "brand", "fonts"],
    fixed: { surface: "#FAFAF9", "on-surface": "#1C1917", "dark-surface": "#1C1917", "dark-on-surface": "#FAFAF9" } });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const css = readFileSync(join(r.dir, "tokens.css"), "utf8");
  assert.match(css, /--font-display: "Space Grotesk"/);
  const md = readFileSync(join(r.dir, "DESIGN.md"), "utf8");
  assert.match(md, /surface: "#FAFAF9"/);
  assert.match(md, /on-surface: "#1C1917"/);
});
