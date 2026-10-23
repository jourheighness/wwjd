// node --test skills/ux/scripts/paths.test.mjs: where a project's artifacts live (paths.mjs artifactRoot).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { artifactRoot, logRoot } from "./paths.mjs";

const PATHS = join(dirname(fileURLToPath(import.meta.url)), "paths.mjs");

test("artifactRoot: a stray .wwjd/ in a folder directly in /tmp (a per-user temp folder) is no project; deeper ones and .wwjd.json are", () => {
  const user = realpathSync(mkdtempSync("/tmp/wwjd-user-")); // as /tmp/<user>
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

test("logRoot: a worktree's project logs to the same folder in the main checkout", () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "wwjd-wt-")));
  const git = (args, cwd) => execFileSync("git", args, { cwd, stdio: "ignore" });
  mkdirSync(join(base, "main", "app"), { recursive: true });
  writeFileSync(join(base, "main", "app", ".wwjd.json"), "{}");
  git(["init", "-q"], join(base, "main"));
  git(["add", "-A"], join(base, "main"));
  git(["-c", "user.email=a@b", "-c", "user.name=a", "commit", "-qm", "i"], join(base, "main"));
  git(["worktree", "add", "-q", join(base, "wt")], join(base, "main"));
  assert.equal(logRoot(join(base, "wt", "app")), join(base, "main", "app"));
  assert.equal(logRoot(join(base, "main", "app")), join(base, "main", "app"));
});
