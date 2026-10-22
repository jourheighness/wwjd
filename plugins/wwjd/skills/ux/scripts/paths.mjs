// paths.mjs: where wwjd's scripts find a project's config and artifacts, and which files count as UI. No deps, Node 20.10+.
// gate.mjs, render.mjs and wwjd.mjs share it, so the gate reads what render writes and lints what the hook checks.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { DIALS, stopOf, valueOf } from "./dials-spec.mjs";

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

// Shared temp roots: a .wwjd/ in one, or in a folder directly in one (/tmp/claude-501), belongs to no project.
const realOf = (p) => { try { return realpathSync(p); } catch { return p; } };
const SHARED_TMP = new Set(["/tmp", "/var/tmp"].flatMap((p) => [p, realOf(p)]));
const TMP_ROOTS = new Set([...SHARED_TMP, tmpdir(), realOf(tmpdir())].map((p) => p.replace(/\/+$/, "")));
// Not a project folder for a stray .wwjd/: the home folder or above it, a temp root, or a folder directly in a shared one.
const strayRoot = (d, home) => d === home || home.startsWith(d.endsWith("/") ? d : d + "/") || TMP_ROOTS.has(d) || SHARED_TMP.has(dirname(d));

/** Where .wwjd/ (shots, runtime.json, grade sheets) lives: the nearest ancestor of cwd with .wwjd.json or .wwjd/,
 * else the git root, else cwd. A stray .wwjd/ in the home folder or above, or in a temp root, makes no project. */
export function artifactRoot(cwd) {
  const home = homedir();
  for (let d = cwd; ; d = dirname(d)) {
    if (existsSync(join(d, ".wwjd.json")) || (!strayRoot(d, home) && isDir(join(d, ".wwjd")))) return d;
    if (dirname(d) === d) break;
  }
  return gitRoot(cwd) || cwd;
}

/** Whether `file` sits inside a Claude Code plugin (an ancestor holds .claude-plugin/plugin.json): plugin code, never a
 * web page, so the gate asks it for no render checks. */
export function inPlugin(file) {
  for (let d = dirname(resolve(file)); dirname(d) !== d; d = dirname(d)) if (existsSync(join(d, ".claude-plugin", "plugin.json"))) return true;
  return false;
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
/** The Flow setting: "on" (wwjd:flow writes wwjd.flow.json and the gate checks it) or "off". */
export const flowMode = (start = process.cwd()) => setting(start, "flowMode", ["CLAUDE_PLUGIN_OPTION_FLOWMODE", "WWJD_FLOW"], ["on", "off"], "on");
/** The Canvas setting: "on" (a project canvas, kept current each round) or "off". */
export const canvasMode = (start = process.cwd()) => setting(start, "canvasMode", ["CLAUDE_PLUGIN_OPTION_CANVASMODE", "WWJD_CANVAS"], ["on", "off"], "on");

/** The effective dials for a project, one place for every script: the plugin options (CLAUDE_PLUGIN_OPTION_<KEY> in
 * hooks, WWJD_DIALS in Bash) < the nearest .wwjd.json "dials". Values outside a dial's stops fall back to its default.
 * Returns { d: { key: value }, from: { key: "plugin" | ".wwjd.json" } }. */
export function dialsFor(start = process.cwd()) {
  const raw = {}, from = {};
  const ok = (v) => { const n = Math.round(Number(v)); return v !== "" && n >= 1 && n <= 5; }; // anything else falls through
  for (const [k, v] of (process.env.WWJD_DIALS || "").split(/\s+/).filter(Boolean).map((x) => x.split("="))) if (ok(v)) { raw[k] = v; from[k] = "plugin"; }
  for (const d of DIALS) { const v = process.env[`CLAUDE_PLUGIN_OPTION_${d.key.toUpperCase()}`]; if (ok(v)) { raw[d.key] = v; from[d.key] = "plugin"; } }
  const f = nearestConfig(start);
  if (f) { try { for (const [k, v] of Object.entries(JSON.parse(readFileSync(f, "utf8")).dials || {})) if (ok(v)) { raw[k] = v; from[k] = ".wwjd.json"; } } catch { /* bad file: options stand */ } }
  const d = {};
  for (const dial of DIALS) d[dial.key] = valueOf(dial, stopOf(dial, raw[dial.key] ?? dial.default));
  return { d, from };
}
