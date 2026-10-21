// node --test skills/ux/scripts/kit.test.mjs: kit/base.css reads every token wwjd:look adds beyond kit/tokens.css, and
// each falls back to the kit's own value, so a project on the default tokens renders as before.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "..", "kit"), LOOK = join(HERE, "..", "..", "look", "scripts", "look.mjs");
const BASE = readFileSync(join(KIT, "base.css"), "utf8");
const declared = (css) => new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

function tokens(look) {
  const dir = mkdtempSync(join(tmpdir(), "wwjd-kit-"));
  writeFileSync(join(dir, "look.json"), JSON.stringify(look));
  const r = spawnSync("node", [LOOK, "--look", join(dir, "look.json"), "--out", dir], { encoding: "utf8", cwd: dir });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  return readFileSync(join(dir, "tokens.css"), "utf8");
}

test("base.css reads every token wwjd:look adds (display face, card shadow, chrome, material, second accent)", () => {
  const kit = new Set([...declared(readFileSync(join(KIT, "tokens.css"), "utf8")), ...declared(BASE)]);
  const looks = [
    { register: "native", hue: 150, axes: { type: "serif-display", surface: "translucent", accent: "dual", elevation: "soft", shape: "round" } },
    { register: "operate", hue: 150, axes: { surface: "chrome" } },
  ];
  const added = new Set(looks.flatMap((l) => [...declared(tokens(l))]).filter((k) => !kit.has(k)));
  for (const k of ["--font-display", "--weight-heading", "--tracking-display", "--shadow-card", "--r-button", "--focus-width", "--accent-2", "--surface-material", "--chrome-bg"])
    assert.ok(added.has(k), `look.mjs no longer writes ${k}`);
  const unread = [...added].filter((k) => !BASE.includes(`var(${k}`));
  assert.deepEqual(unread, [], `base.css never reads ${unread.join(", ")}`);
});

test("each look token falls back to the kit's own value", () => {
  const fallback = { "--r-button": "var(--r-2)", "--font-display": "inherit", "--weight-heading": "600", "--tracking-display": "-.02em",
    "--shadow-card": "none", "--focus-width": "2px" };
  for (const [k, v] of Object.entries(fallback)) assert.ok(BASE.includes(`var(${k}, ${v})`), `${k} without its fallback ${v}`);
  // title tracking stays -.012em: half the display fallback
  assert.match(BASE, /\.t-title \{[^}]*letter-spacing: calc\(var\(--tracking-display, -\.024em\) \/ 2\)/);
  assert.match(BASE, /\.btn \{[^}]*border-radius: var\(--r-button, var\(--r-2\)\)/);
  assert.match(BASE, /\.card \{[^}]*box-shadow: var\(--shadow-card, none\)/);
});
