// paths.mjs: where wwjd's scripts find a project's config and artifacts, and which files count as UI. No deps, Node 20.10+.
// gate.mjs, render.mjs and wwjd.mjs share it, so the gate reads what render writes and lints what the hook checks.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

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
