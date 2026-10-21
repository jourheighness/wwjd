// paths.mjs: where wwjd's scripts find a project's config and artifacts, and which files count as UI. No deps, Node 20.10+.
// gate.mjs, render.mjs and wwjd.mjs share it, so the gate reads what render writes and lints what the hook checks.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

export const UI_EXT = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".mdx", ".css", ".scss"]);
// Tests and fixtures: never linted, never gated.
export const TEST = /\.(test|spec)\.|__tests__|__fixtures__|(^|\/)fixtures?\//;
export const STORY = /\.stories\.|\.story\.|(^|\/)stories\//;

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

/** The nearest .wwjd.json from `start` up, or null. */
export function nearestConfig(start) {
  for (let d = start; ; d = dirname(d)) {
    const f = join(d, ".wwjd.json");
    if (existsSync(f)) return f;
    if (dirname(d) === d) return null;
  }
}

export function gitRoot(cwd) {
  try { return execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null; }
  catch { return null; }
}

/** Where .wwjd/ (shots, runtime.json, grade sheets) lives: the nearest ancestor of cwd with .wwjd.json or .wwjd/,
 * else the git root, else cwd. A stray ~/.wwjd/ does not make the home folder a project. */
export function artifactRoot(cwd) {
  const home = homedir();
  for (let d = cwd; ; d = dirname(d)) {
    if (existsSync(join(d, ".wwjd.json")) || (d !== home && isDir(join(d, ".wwjd")))) return d;
    if (dirname(d) === d) break;
  }
  return gitRoot(cwd) || cwd;
}

/** The project a file belongs to, even one not written yet: artifactRoot() from its nearest existing folder. */
export function projectOf(file, cwd = process.cwd()) {
  let d = dirname(resolve(cwd, file));
  while (!isDir(d) && dirname(d) !== d) d = dirname(d);
  return artifactRoot(d);
}

export const SKIP = new Set(["node_modules", "dist", "build", "out", ".next", ".git", ".wwjd", ".svelte-kit", ".astro", "coverage"]);
/** A path through a build, dependency or report folder: never UI work. */
export const SKIP_DIR = new RegExp(`(^|/)(${[...SKIP].map((d) => d.replace(".", "\\.")).join("|")})(/|$)`);
/** Markup files: what makes a project have a UI (the start question); styles and docs alone do not. */
export const MARKUP = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html"]);
/** Whether `root` already holds a UI file (tests, fixtures and stories aside). Bounded: a huge tree counts as "has UI". */
export function hasUI(root) {
  let seen = 0;
  const walk = (d, depth) => {
    let entries = [];
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return false; }
    for (const e of entries) {
      if (++seen > 4000) return true;
      const p = join(d, e.name);
      if (e.isDirectory()) { if (!SKIP.has(e.name) && !e.name.startsWith(".") && depth < 6 && walk(p, depth + 1)) return true; }
      else if (UI_EXT.has(extname(e.name)) && !TEST.test(p) && !STORY.test(p)) return true;
    }
    return false;
  };
  return walk(root, 0);
}

// A setting with a project override: the nearest .wwjd.json key > the plugin option (env) > a fallback env > the default.
function setting(start, key, envs, allowed, fallback) {
  const norm = (v) => { const x = String(v ?? "").trim().toLowerCase(); const m = { true: "on", 1: "on", false: "off", 0: "off" }[x] ?? x; return allowed.includes(m) ? m : null; };
  const f = nearestConfig(start);
  if (f) { try { const m = norm(JSON.parse(readFileSync(f, "utf8"))[key]); if (m) return m; } catch { /* bad file: the option stands */ } }
  for (const e of envs) { const m = norm(process.env[e]); if (m) return m; }
  return fallback;
}
/** The Hooks setting: "on" (route, lint, gates), "quiet" (route and lint, nothing blocks) or "off" (no wwjd hooks). */
export const hooksMode = (start = process.cwd()) => setting(start, "hooks", ["CLAUDE_PLUGIN_OPTION_HOOKMODE", "WWJD_HOOKS"], ["on", "quiet", "off"], "on");
/** The Project board setting: "on" (a new project offers a board; each handover adds its round) or "off". */
export const boardMode = (start = process.cwd()) => setting(start, "boardMode", ["CLAUDE_PLUGIN_OPTION_BOARDMODE", "WWJD_BOARD"], ["on", "off"], "on");
