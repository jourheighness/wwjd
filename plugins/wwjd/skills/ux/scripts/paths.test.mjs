// node --test skills/ux/scripts/paths.test.mjs: where a project's artifacts live (paths.mjs artifactRoot).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { artifactRoot } from "./paths.mjs";

const PATHS = join(dirname(fileURLToPath(import.meta.url)), "paths.mjs");

test("artifactRoot: a stray .wwjd/ in a folder directly in /tmp (a per-user temp folder) is no project; deeper ones and .wwjd.json are", () => {
  const user = realpathSync(mkdtempSync("/tmp/wwjd-user-")); // as /tmp/claude-501
  mkdirSync(join(user, ".wwjd"));
  const scratch = join(user, "session", "scratchpad");
  mkdirSync(scratch, { recursive: true });
  assert.equal(artifactRoot(scratch), scratch);
  mkdirSync(join(user, "session", ".wwjd"));
  assert.equal(artifactRoot(scratch), join(user, "session"));
  writeFileSync(join(user, ".wwjd.json"), "{}");
  const loose = join(user, "loose");
  mkdirSync(loose);
  assert.equal(artifactRoot(loose), user);
});

test("artifactRoot: a .wwjd/ above the home folder is no project", () => {
  const top = realpathSync(mkdtempSync(join(tmpdir(), "wwjd-top-")));
  mkdirSync(join(top, ".wwjd"));
  const home = join(top, "home", "me");
  const work = join(home, "notes");
  mkdirSync(work, { recursive: true });
  const at = execFileSync("node", ["--input-type=module", "-e", `import { artifactRoot } from ${JSON.stringify(PATHS)}; console.log(artifactRoot(${JSON.stringify(work)}))`],
    { env: { ...process.env, HOME: home }, encoding: "utf8" }).trim();
  assert.equal(at, work);
});
