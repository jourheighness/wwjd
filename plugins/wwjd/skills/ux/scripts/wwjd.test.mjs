// node --test skills/ux/scripts/wwjd.test.mjs: the lint (wwjd.mjs) and its PostToolUse hook (hooks/check.sh).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WWJD = join(HERE, "wwjd.mjs");
const CHECK = join(HERE, "..", "..", "..", "hooks", "check.sh");
const env = { ...process.env, XDG_CONFIG_HOME: join(tmpdir(), "wwjd-no-user-config"), WWJD_DIALS: "" };

function repo(files, config) {
  const root = mkdtempSync(join(tmpdir(), "wwjd-lint-"));
  execFileSync("git", ["init", "-q", root]);
  if (config) writeFileSync(join(root, ".wwjd.json"), JSON.stringify(config));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}
const check = (root, args) => JSON.parse(spawnSync("node", [WWJD, "check", ...args, "--json"], { cwd: root, env, encoding: "utf8" }).stdout);

const DEAD = '<a href="#">Open</a>\n';
const HIDDEN = '<style>.x { display: flex }</style><div class="x" hidden>Hi</div>\n';

test('a trailing ** in "legacy" covers everything below', () => {
  const page = 'import { Button } from "../../../components/ui/button";\nexport const Orders = () => <Button>Ship order</Button>;\n';
  const golden = (legacy) => {
    const root = repo({ "src/old/pages/deep/Orders.tsx": page, "components/ui/button.tsx": "export const Button = () => null;\n" }, { legacy });
    return JSON.parse(spawnSync("node", [WWJD, "status", "--json"], { cwd: root, env, encoding: "utf8" }).stdout).goldenSuggested;
  };
  assert.deepEqual(golden(["elsewhere/**"]), ["src/old/pages/deep/Orders.tsx"]);
  assert.deepEqual(golden(["src/old/**"]), []);
});

test("file-level rules take the configured severity, not only off", () => {
  const root = repo({ "page.html": HIDDEN }, { rules: { "hidden-guard": "warn" } });
  const r = check(root, ["page.html"]);
  assert.equal(r.findings.find((x) => x.rule === "hidden-guard")?.severity, "warn");
  const off = repo({ "page.html": HIDDEN }, { rules: { "hidden-guard": "off" } });
  assert.equal(check(off, ["page.html"]).findings.some((x) => x.rule === "hidden-guard"), false);
});

test("config comes from the nearest .wwjd.json, not only the repo root", () => {
  const root = repo({ "apps/web/page.html": HIDDEN });
  writeFileSync(join(root, "apps/web/.wwjd.json"), JSON.stringify({ rules: { "hidden-guard": "off" } }));
  const r = JSON.parse(spawnSync("node", [WWJD, "check", "page.html", "--json"], { cwd: join(root, "apps/web"), env, encoding: "utf8" }).stdout);
  assert.equal(r.findings.some((x) => x.rule === "hidden-guard"), false);
});

test("changed files with spaces and non-ASCII names are checked", () => {
  const root = repo({ "src/kort ö.html": DEAD });
  const r = check(root, []);
  assert.equal(r.files, 1);
  assert.equal(r.findings[0]?.file, "src/kort ö.html");
});

test("check.sh: non-UI paths exit before node; UI files get findings", () => {
  // a stand-in node that only says it ran: a non-UI path must never get that far
  const bin = mkdtempSync(join(tmpdir(), "wwjd-bin-"));
  writeFileSync(join(bin, "node"), "#!/bin/sh\necho node-ran\n", { mode: 0o755 });
  const hook = (input) => spawnSync("bash", [CHECK], { input: JSON.stringify(input), env: { ...env, PATH: `${bin}:/usr/bin:/bin` }, encoding: "utf8" });
  const md = hook({ tool_input: { file_path: "/x/README.md" } });
  assert.equal(md.status, 0);
  assert.equal(md.stdout, "");
  assert.equal(hook({ tool_input: { file_path: "/x/card.tsx" } }).stdout.trim(), "node-ran");
  const root = repo({ "card.html": DEAD });
  const ui = spawnSync("bash", [CHECK], { input: JSON.stringify({ cwd: root, tool_input: { file_path: join(root, "card.html") } }), env, encoding: "utf8" });
  assert.match(ui.stdout, /dead-link/);
  const fixture = repo({ "fixtures/card.html": DEAD });
  const quiet = spawnSync("bash", [CHECK], { input: JSON.stringify({ cwd: fixture, tool_input: { file_path: join(fixture, "fixtures/card.html") } }), env, encoding: "utf8" });
  assert.equal(quiet.stdout, "");
});
