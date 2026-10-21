// node --test skills/look/scripts/look.test.mjs: look.mjs bans apply to new choices, not to a project's own faces; font
// links load only faces in use, single-weight faces without a range; its own state lands in the root's .wwjd/, never under --out;
// the type scale and heights are the register's profile, as kit/base.css renders it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LOOK = join(dirname(fileURLToPath(import.meta.url)), "look.mjs");
// runs in the temp dir, so the root's .wwjd/ is the temp dir's own
function run(look, out, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), "wwjd-look-"));
  writeFileSync(join(dir, "look.json"), JSON.stringify(look));
  for (const [f, t] of Object.entries(files)) writeFileSync(join(dir, f), t);
  const r = spawnSync("node", [LOOK, "--look", join(dir, "look.json"), "--out", out || dir], { encoding: "utf8", cwd: dir });
  return { ...r, dir, out: join(dir, out || "") };
}
const font = css => css.match(/css2\?family=(\S+)&display=swap/)[1];
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
  assert.ok(existsSync(join(r.dir, ".wwjd", "look.json")));
});

test("fonts: a single-weight display face is linked without a weight range and never claims a heavier weight", () => {
  const r = run({ register: "operate", hue: 150, fonts: { display: '"Young Serif", Georgia, serif' } });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const css = readFileSync(join(r.dir, "tokens.css"), "utf8");
  assert.deepEqual(font(css).split("&family="), ["Inter:opsz,wght@14..32,400..600", "Young+Serif"]);
  assert.match(css, /--weight-heading: 400;/);
  const md = readFileSync(join(r.dir, "DESIGN.md"), "utf8");
  assert.match(md, /display:\n    fontFamily: "Young Serif"\n    fontSize: \d+px\n    fontWeight: 400/);
  assert.match(md, /title:\n    fontFamily: "Young Serif"\n    fontSize: \d+px\n    fontWeight: 400/);
  assert.doesNotMatch(md, /Headings weight 600/);
});

test("fonts: a display override replaces the preset's serif in the link, the token and the prose", () => {
  const r = run({ register: "editorial", hue: 150, axes: { type: "serif-display" }, fonts: { display: '"Newsreader", Georgia, serif' } });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const css = readFileSync(join(r.dir, "tokens.css"), "utf8");
  assert.deepEqual(font(css).split("&family="), ["Inter:opsz,wght@14..32,400..600", "Newsreader:wght@400..700"]);
  assert.match(css, /--font-display: "Newsreader"/);
  assert.doesNotMatch(css, /Source.Serif/);
  const md = readFileSync(join(r.dir, "DESIGN.md"), "utf8");
  assert.doesNotMatch(md, /Source Serif/);
  assert.match(md, /Newsreader for display and titles, Inter for body text/);
});

test("--out: tokens and DESIGN.md go to --out, the look's state to the root's .wwjd/, never a nested .wwjd/", () => {
  const r = run({ register: "operate", hue: 150 }, ".wwjd/looks/A");
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.ok(existsSync(join(r.out, "tokens.css")));
  assert.ok(existsSync(join(r.out, "DESIGN.md")));
  assert.ok(!existsSync(join(r.out, ".wwjd")));
  assert.ok(existsSync(join(r.dir, ".wwjd", "look.A.json")));
  assert.ok(!existsSync(join(r.dir, ".wwjd", "look.json")));
});

// the kit's profile blocks: what the page renders, so what tokens.css and DESIGN.md must say
const BASE = readFileSync(join(dirname(LOOK), "..", "..", "ux", "kit", "base.css"), "utf8");
const block = (p) => BASE.match(new RegExp(`\\[data-profile="${p}"\\] \\{([^}]*)\\}`))[1];
const ramp = (css) => Object.fromEntries([...css.matchAll(/--(text|lh)-(caption|body|heading|title|display):\s*([^;]+);/g)].map((m) => [`${m[1]}-${m[2]}`, m[3].trim()]));

test("profile: each register's tokens.css ramp is its kit profile's ramp", () => {
  for (const [register, profile] of [["persuade", "marketing"], ["editorial", "reading"], ["reference", "docs"], ["transact", "consumer"]]) {
    const r = run({ register, hue: 150 });
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const css = readFileSync(join(r.dir, "tokens.css"), "utf8"), kit = ramp(block(profile)), got = ramp(css);
    assert.equal(Object.keys(kit).length, 10, profile);
    assert.deepEqual(got, kit, `${register} → ${profile}`);
    assert.match(css, new RegExp(`Profile: <html data-profile="${profile}">`));
  }
});

test("profile: Persuade writes marketing type and heights into DESIGN.md, never the app's", () => {
  const r = run({ register: "persuade", hue: 150, axes: { density: "comfortable" } });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const md = readFileSync(join(r.dir, "DESIGN.md"), "utf8");
  assert.match(md, /display:\n    fontFamily: "Inter"\n    fontSize: 80px/);
  assert.match(md, /body-md:\n    fontFamily: "Inter"\n    fontSize: 20px/);
  assert.match(md, /marketing profile \(`<html data-profile="marketing">`\), comfortable: 48px controls, 56px rows, 17–20px body/);
  assert.match(md, /control: 48px/);
  assert.doesNotMatch(md, /fontSize: 28px|14px body/);
});

test("profile: Operate keeps the app ramp; compact moves body only, as base.css does", () => {
  const r = run({ register: "operate", hue: 150, axes: { density: "compact" } });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const css = readFileSync(join(r.dir, "tokens.css"), "utf8");
  assert.deepEqual(ramp(css), { "text-caption": "12px", "lh-caption": "16px", "text-body": "13px", "lh-body": "20px", "text-heading": "16px", "lh-heading": "24px",
    "text-title": "20px", "lh-title": "28px", "text-display": "28px", "lh-display": "34px" });
  assert.match(css, /--control-h: 28px; --row-h: 32px;/);
});

test("profile: a look without a register takes the project's from PRODUCT.md", () => {
  const r = run({ hue: 150 }, undefined, { "PRODUCT.md": "# Product\n\nRegisters per surface: Persuade site, Flow booking.\n" });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /\(persuade\)/);
  assert.match(readFileSync(join(r.dir, "DESIGN.md"), "utf8"), /- Register: persuade/);
});

test("fonts: no display face, no --font-display (headings keep the profile's text face)", () => {
  const r = run({ register: "operate", hue: 150 });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.doesNotMatch(readFileSync(join(r.dir, "tokens.css"), "utf8"), /--font-display/);
});
