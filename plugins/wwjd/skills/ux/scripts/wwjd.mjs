#!/usr/bin/env node
// wwjd: project status, static UI lint, baseline ratchet and debt map. No deps, Node 20.10+.
//
// Usage: node wwjd.mjs <command> [paths...] [options]
//   status [paths]             stage (scratch | kit | messy), baseline files, kit, Storybook, golden and legacy files,
//                              dials, and whether over-budget surfaces get a grade.mjs sheet (Strictness 3+);
//                              PRODUCT.md / DESIGN.md: the nearest up from the paths (or cwd), nested ones listed
//   dials                      the effective dials, one line: plugin options (/plugin configure wwjd@wwjd), then
//                              "dials" in .wwjd.json override per project; meanings in references/dials.md
//   check [paths]              lint UI files (default: files changed against HEAD plus untracked)
//     --register <name>        persuade showcase editorial reference operate monitor converse transact flow native
//     --new                    only errors, plus warnings not in .wwjd-baseline.json (errors only when there is none)
//     --baseline               write .wwjd-baseline.json from a full scan (or the given paths); counts only go down
//     --max <n>                print at most n findings      --json   machine output
//     --hook                   PostToolUse mode: reads the hook JSON on stdin, checks the edited file with --new,
//                              prints ≤5 lines as additionalContext, nothing when clean
//   audit [paths]              debt map: findings by area, rebuild candidates, golden picks, RATCHET.md [design] lines
// Config: --config <file>, else the nearest .wwjd.json up from the first path (or cwd), else ~/.config/wwjd/wwjd.json
//   (or ui-check.json)
//   { "register": "operate", "locale": ["en"], "kitDirs": ["packages/ui"], "tokenFiles": "regex",
//     "rules": { "<id>": "off"|"warn"|"error" }, "golden": ["src/pages/Orders.tsx"], "legacy": ["src/old/**"],
//     "storybook": "pnpm storybook", "tags": { "design": "[design]", "eng": "[eng]" } }
//   Repo-relative paths only; never preview URLs or hosts (use WWJD_PREVIEW or an untracked AGENTS.local.md).
// Ignore one line with a trailing comment containing `wwjd-ignore: <reason>` (ui-check-ignore also works).
// Findings are leads, not verdicts: fix each one or justify it.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from "node:fs";
import { join, extname, resolve, relative, dirname, basename, sep } from "node:path";
import { homedir } from "node:os";
import { DIALS, stopOf, valueOf, isDefault, isGated } from "./dials-spec.mjs";
import { STORY, TEST, UI_EXT, nearestConfig } from "./paths.mjs";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 10)) { console.error("wwjd needs Node 20.10 or newer"); process.exit(2); }

// ── args ───────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const CMDS = new Set(["status", "check", "audit", "dials"]);
const cmd = CMDS.has(argv[0]) ? argv.shift() : argv[0] === "-h" || argv[0] === "--help" || !argv.length ? "help" : "check";
const opt = { paths: [], json: false, register: null, config: null, new: false, baseline: false, max: Infinity, hook: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--json") opt.json = true;
  else if (a === "--register") opt.register = argv[++i];
  else if (a === "--config") opt.config = argv[++i];
  else if (a === "--new") opt.new = true;
  else if (a === "--baseline") opt.baseline = true;
  else if (a === "--max") opt.max = Number(argv[++i]) || Infinity;
  else if (a === "--hook") opt.hook = true;
  else if (a === "-h" || a === "--help") { help(); process.exit(0); }
  else opt.paths.push(a);
}
function help() {
  const head = [];
  for (const l of readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1)) { if (!l.startsWith("//")) break; head.push(l.replace(/^\/\/ ?/, "")); }
  console.log(head.join("\n"));
}
if (cmd === "help") { help(); process.exit(0); }

// hook mode: the edited file comes from the PostToolUse JSON on stdin
let hookCwd = null;
if (opt.hook) {
  let input = {};
  try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
  const fp = input.tool_input?.file_path || input.tool_input?.notebook_path;
  if (!fp) process.exit(0);
  hookCwd = input.cwd || process.cwd();
  opt.paths = [resolve(hookCwd, fp)];
  opt.new = true; opt.max = 5;
}

// ── project root and config ────────────────────────────────────────
const git = (args, cwd) => { try { return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 }); } catch { return null; } };
// NUL-separated, so names with spaces, quotes or non-ASCII come through verbatim
const gitPaths = (args, cwd) => { const out = git([...args, "-z"], cwd); return out === null ? null : out.split("\0").filter(Boolean); };
function findRoot(start) {
  let d = start;
  try { if (statSync(d).isFile()) d = dirname(d); } catch { d = dirname(d); }
  const top = existsSync(d) ? git(["rev-parse", "--show-toplevel"], d)?.trim() : null;
  if (top) return top;
  for (let p = d; ; p = dirname(p)) { if (existsSync(join(p, ".wwjd.json"))) return p; if (dirname(p) === p) break; }
  return d;
}
const START = opt.paths.length ? resolve(opt.paths[0]) : process.cwd();
const ROOT = findRoot(START);
let cfg = {};
const userCfg = join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "wwjd");
const startDir = (() => { try { return statSync(START).isDirectory() ? START : dirname(START); } catch { return dirname(START); } })();
// the nearest .wwjd.json up from where we start, like gate.mjs and grade.mjs
const PROJECT_CFG = nearestConfig(startDir);
for (const p of [opt.config, PROJECT_CFG, join(userCfg, "wwjd.json"), join(userCfg, "ui-check.json")]) {
  if (p && existsSync(p)) { try { cfg = JSON.parse(readFileSync(p, "utf8")); } catch (e) { if (!opt.hook) console.error(`wwjd: bad config ${p}: ${e.message}`); process.exit(opt.hook ? 0 : 2); } break; }
}
const REGISTER = (opt.register || cfg.register || "operate").toLowerCase();
const KIT_DEFAULTS = ["packages/ui", "packages/kit", "components/ui", "src/components/ui", "src/ui", "src/kit", "kit", "primitives"];
const KIT_DIRS = (cfg.kitDirs || KIT_DEFAULTS).map((d) => d.replace(/\/$/, ""));
const LOCALES = [].concat(cfg.locale || ["en"]).map(String);
const ENGLISH_ONLY = LOCALES.length > 0 && LOCALES.every((l) => /^en([-_]|$)/i.test(l));
const TOKEN_FILE = new RegExp(cfg.tokenFiles || "(tokens?|theme|palette|colou?rs?|variables|globals?)\\.(css|scss|ts|js|json)$|(^|/)tokens?/", "i");
const BASELINE = join(ROOT, ".wwjd-baseline.json");
const rel = (f) => relative(ROOT, resolve(f)).split(sep).join("/");
// ** / matches any folders (or none); a ** elsewhere, like a trailing src/old/**, matches everything below
const glob = (g) => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*\//g, "\u0000").replace(/\*\*/g, "\u0001")
  .replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]").replace(/\u0000/g, "(.*/)?").replace(/\u0001/g, ".*") + "$");
const LEGACY = [].concat(cfg.legacy || []).map(glob);
const isLegacy = (f) => LEGACY.some((re) => re.test(f));

const SKIP_DIR = /(^|\/)(node_modules|dist|build|out|\.next|\.svelte-kit|\.astro|\.nuxt|coverage|storybook-static|\.storybook-static|vendor|\.git|\.wwjd)(\/|$)/;
const MARKUP = /\.(tsx|jsx|vue|svelte|astro|html)$/;
const COMPONENT = /\.(tsx|jsx|vue|svelte|astro)$/;
const inKit = (f) => KIT_DIRS.some((d) => f === d || f.startsWith(d + "/") || f.includes("/" + d + "/"));

const R = (...names) => new Set(names);
const EXPRESSIVE = R("persuade", "showcase");
const READING = R("editorial", "reference");
const near = (lines, i, re, span = 3) => lines.slice(Math.max(0, i - span), i + span + 1).some((l) => re.test(l));
// "N of M" is fine as progress through a small set or a position (step 3 of 8); flag only bare totals
const PROGRESS_EL = /<progress|role=["']progressbar|aria-valuenow|\b\w*(Progress|Meter|Stepper|Bar|Ring)\b|\bprogress|\bmeter\b/;
const PROGRESS_WORD = /\b(done|complete[ds]?|finished|answered|scored|published|connected|measured|assessed|counted|scanned|reviewed|checked|approved|signed|uploaded|read|set up|reporting|ready|passed|verified)|(step|page|question|item|slide|photo|image|result)s?\b[^\n]{0,4}[{$]|index(Of)?\s*\(|\+\s*1\s*\}/i;

// sev: default severity. off: registers where the rule doesn't apply. ok(lines, i): context that makes the hit fine.
const rules = [
  // ── floor: accessibility and honesty ──
  { id: "focus-within-swap", sev: "warn", re: /:focus-within[^{}]*\{[^}]*\b(opacity:\s*0|visibility:\s*hidden|display:\s*none)/, msg: "toggles visibility on :focus-within, so a mouse click toggles it too (meta flashes on select); use :has(:focus-visible)" },
  { id: "default-look", sev: "warn", re: /--a:\s*258\s*;/, msg: "the kit's default accent, unchanged: pick the look (wwjd:look quick mode); default tokens are a floor" },
  { id: "no-zoom", sev: "error", re: /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/, msg: "zoom disabled" },
  { id: "tabindex-positive", sev: "error", re: /tabIndex=\{?["']?[1-9]/, msg: "positive tabIndex breaks keyboard order" },
  { id: "div-click", sev: "error", re: /<(div|span|li|tr|td|article|Row|Card)\b[^>]*\bonClick=/, only: /\.(tsx|jsx)$/, msg: "clickable container; make the title a link/button stretched over the row, with inner actions above it" },
  { id: "icon-button-name", sev: "error", re: /<button\b(?![^>]*aria-label)[^>]*>\s*<(svg|[A-Z]\w*Icon|Icon)\b/, unless: /(\/>|<\/svg>|<\/\w*Icon>)\s*(\{|[^\s<])|sr-only|visually-hidden|VisuallyHidden/, only: MARKUP, msg: "icon-only button without aria-label" },
  { id: "input-label", sev: "warn", re: /<input\b(?![^>]*(aria-label|aria-labelledby|id=))(?![^>]*type=["'](hidden|submit|button|reset|image)["'])[^>]*>/, unless: /<label\b|\{\.\.\./, only: MARKUP, msg: "input without a label association" },
  { id: "dead-link", sev: "error", re: /href=["']#["']/, msg: 'dead link href="#"; give it a real target or make it a button' },
  { id: "alert", sev: "error", re: /\bwindow\.alert\(|\balert\(\s*["'`]/, msg: "alert(); show the error inline" },
  { id: "focus-removed", sev: "error", re: /outline:\s*none|\boutline-none\b|\boutline-0\b/, unless: /focus(-visible)?:(ring|outline)|:focus-visible/, msg: "focus outline removed without a visible focus-visible replacement" },
  { id: "img-dimensions", sev: "warn", re: /<img\b(?![^>]*\b(width|height)=)(?![^>]*aspect-)[^>]*>/, only: MARKUP, msg: "image without dimensions shifts layout as it loads" },
  { id: "fake-urgency", sev: "warn", re: /\b(only \d+ left|hurry|offer ends in|limited time only|\d+ people are (viewing|looking))\b/i, only: MARKUP, off: R("transact"), msg: "urgency/scarcity copy; only if true and verifiable" },
  // ── copy ──
  { id: "explainer-copy", sev: "warn", re: /\b(nothing is (ever )?(lost|saved|shared)|everything is (private|saved|safe)|don['’]t worry|no need to worry|rest assured|simply (click|drag|select)|just (click|drag|select)|click here|here you can|this (page|section|view|panel|feature|card) (lets|allows|shows|helps|will)|you can (now|always|easily)|we['’]ll (start|begin|automatically)|this will (start|begin|automatically))\b/i, only: MARKUP, msg: "explaining or reassuring copy; the UI should explain itself" },
  { id: "banned-label", sev: "warn", re: />\s*(Submit|OK|Ok|Click here|Learn more|Get started|Read more)\s*</, only: MARKUP, msg: "generic label; name the action and its target" },
  { id: "oops", sev: "warn", re: /\b(Oops|Whoops|Uh oh)\b|["'`>][^"'`<\n]{2,80}!\s*["'`<]/, only: MARKUP, skip: (f) => STORY.test(f), off: EXPRESSIVE, msg: "'Oops' or an exclamation in UI copy; keep it plain and calm" },
  { id: "buzzword", sev: "warn", re: /\b(supercharge|unleash|harness the power|best-in-class|industry-leading|world-class|next-generation|cutting-edge|revolutioni[sz]e|game-?changer|future-proof|seamless(ly)?|effortless(ly)?|delve|tapestry)\b/i, only: MARKUP, msg: "marketing buzzword" },
  { id: "ai-dash", sev: "warn", re: />[^<{}]*\s[—–]\s[^<{}]*<|["'`][^"'`\n]*\s[—–]\s[^"'`\n]*["'`]/, only: MARKUP, skip: (f) => STORY.test(f), off: R("editorial", "persuade", "showcase"), english: true, msg: "dash in a UI string reads as AI copy (fine in prose)" },
  { id: "count-of", sev: "warn", re: /\{[^}]+\}\s*(of|\/)\s*\{[^}]+\}|\$\{[^}]+\}\s*(of|\/)\s*\$\{[^}]+\}/, only: MARKUP, skip: (f) => STORY.test(f), off: R("transact", "persuade", "showcase"),
    ok: (lines, i) => PROGRESS_WORD.test(lines[i]) || near(lines, i, PROGRESS_EL),
    msg: "bare 'N of M' total; progress through a small set sits by its bar, otherwise a dot or nothing" },
  { id: "confirm-dialog", sev: "warn", re: /\bwindow\.confirm\(|\bconfirm\(\s*["'`]|are you sure/i, off: R("transact", "flow"), msg: "confirm dialog; use undo (a review step only for money, legal commitments, account deletion or sending to others)" },
  { id: "locale-format", sev: "warn", re: /\.toLocale(Date|Time)?String\(\)|\.toFixed\(/, only: COMPONENT, msg: "ad-hoc formatting; use Intl.* with the app locale" },
  // ── system ──
  { id: "hex-in-ui", sev: "warn", re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/, only: COMPONENT, skip: (f) => TOKEN_FILE.test(f) || /icon/i.test(f), msg: "raw hex in a component or page; use a token" },
  { id: "raw-palette", sev: "warn", re: /\b(bg|text|border|ring|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/, only: MARKUP, skip: (f) => TOKEN_FILE.test(f) || STORY.test(f) || inKit(f), msg: "raw palette class; use a semantic token" },
  { id: "arbitrary-value", sev: "warn", re: /\b(?:[a-z]+-)+\[(?:#|\d+(?:\.\d+)?(?:px|rem|em|%)|rgb|hsl|oklch)[^\]]*\]/, only: MARKUP, skip: (f) => inKit(f), msg: "arbitrary Tailwind value; use the scale or a token" },
  { id: "inline-style", sev: "warn", re: /\bstyle=\{\{[^}]*(color|margin|padding|font|background)|\bstyle="[^"]*(color|margin|padding|font|background)/, only: COMPONENT, skip: (f) => STORY.test(f) || inKit(f), msg: "inline style; put the look in a kit variant" },
  { id: "callsite-override", sev: "warn", re: /<(Button|Card|Badge|Chip|Tooltip|Avatar|Input|Select|Dialog|Sheet)\b[^>]*\bclassName=["'{`][^"'}`]*\b(bg-|text-(?!left|right|center|start|end)|border-|rounded|p[xytrbl]?-\d|shadow|font-)/, only: /\.(tsx|jsx)$/, skip: (f) => inKit(f) || STORY.test(f), msg: "styling a kit component at the call site; add a variant in the kit" },
  { id: "native-dropdown", sev: "error", re: /<(select|datalist)\b|<input[^>]*type=["'](date|time|datetime-local|month|week|color)["']/, only: MARKUP, skip: (f) => inKit(f), off: R("native"), msg: "OS dropdown or picker; use the component system's Select/Combobox/DatePicker (a styled popover listbox in prototypes)" },
  { id: "important", sev: "warn", re: /!important\b/, msg: "!important; fix the cascade or the variant" },
  { id: "native-title", sev: "warn", re: /<(?!svg\b|title\b|iframe\b|abbr\b|link\b|frame\b|object\b)[a-z][a-z0-9]*\b[^>]*\stitle=["{]/, only: MARKUP, msg: "native title tooltip; use the kit tooltip (works on focus and touch)" },
  // ── fit: components at every size ──
  { id: "identifier-truncate", sev: "error", re: /<(h[1-6]|label)\b[^>]*\b(truncate|text-ellipsis|line-clamp-1|whitespace-nowrap)\b|data-identifier[^>]*\b(truncate|text-ellipsis|line-clamp-\d|whitespace-nowrap)\b|\b(truncate|text-ellipsis|line-clamp-\d|whitespace-nowrap)\b[^>]*data-identifier/, only: MARKUP, msg: "identifier truncated; titles and names wrap (rules/layout.md)" },
  { id: "hover-hidden", sev: "error", re: /\b(hidden|invisible)\b[^"'`]*\bgroup-hover:(flex|block|inline-flex|visible|grid)\b/, only: MARKUP, msg: "hover reveal with display/visibility: keyboard can't reach it; use opacity, shown on group-has-[:focus-visible]" },
  { id: "hover-no-fallback", sev: "error", re: /\bopacity-0\b[^"'`]*\bgroup-hover:opacity-100\b/, unless: /group-(has-\[:focus-visible\]|focus-within):opacity-100/, only: MARKUP, msg: "hover-only reveal: add group-has-[:focus-visible]:opacity-100 (keyboard focus, not clicks) and keep it visible on touch (hover:none)" },
  { id: "between-wrap", sev: "warn", re: /\bjustify-between\b[^"'`]*\bflex-wrap\b|\bflex-wrap\b[^"'`]*\bjustify-between\b/, only: MARKUP, msg: "space-between with wrap strands the wrapped item; use ms-auto on the trailing group" },
  { id: "viewport-in-component", sev: "warn", re: /@media\s*\((min|max)-width/, only: /\.(tsx|jsx|vue|svelte)$/, skip: (f) => !/components?\//.test(f), msg: "viewport breakpoint inside a component; use a container query" },
  { id: "component-placement", sev: "warn", re: /^\s*\.[\w-]+\s*\{[^}]*\b(grid-area:\s*[a-z][\w-]*|grid-column:\s*[a-z][\w-]*|order:\s*-?\d)/, only: /\.(css|scss|tsx|jsx|vue|svelte|html|astro)$/, msg: "placement on a component class leaks into every grid it's reused in; put it on the parent's child selector (.row > .x)" },
  { id: "anywhere-on-text", sev: "warn", re: /(h[1-6]|title|name|heading|label|prose|body)[^{]*\{[^}]*overflow-wrap:\s*anywhere|(text|title|heading|prose)[\w-]*[^"'`]*\bbreak-anywhere\b/i, msg: "overflow-wrap:anywhere on titles/prose hides a too-narrow track as letter-stacked text; use break-word" },
  { id: "underlined-control", sev: "warn", re: /(step|tab|chip|segment|crumb|nav-item|pill)[\w-]*[^{]*\{[^}]*text-decoration:\s*underline|\.(steps|tabs|chips|stepper)\s+(button|a)\s*\{[^}]*text-decoration:\s*underline/i, msg: "underline on a step/tab/chip control; affordance is hover fill and focus ring, and every state keeps one box" },
  { id: "fill-on-inline", sev: "warn", re: /\.(on|fill|filled|value|stars?|rating|meter|bar)[\w-]*\s*\{[^}]*(clip-path:\s*inset\([^)]*var\(|width:\s*(calc\()?var\(--(pct|value|percent|p)\b)/i, unless: /display:\s*(block|inline-block|flex|grid)/, msg: "value fill (clip/width from a variable) on an element that may have no box; give it display:block/inline-block and a size, and check the render at 0 / partial / max" },
  // ── layout ──
  { id: "centered-text", sev: "warn", re: /\btext-center\b|text-align:\s*center/, off: R("persuade", "showcase", "editorial", "converse", "flow"), msg: "centred text; start-align unless it is genuinely centred content" },
  { id: "eyebrow", sev: "warn", re: /\buppercase\b[^"'`\n]*\btracking-|\btracking-[^"'`\s]+[^"'`\n]*\buppercase\b/, off: R("editorial"), msg: "uppercase tracked eyebrow; use sentence case or nothing" },
  // a fixed 100vh height hides content under mobile browser chrome; min-height wrappers and stories are harmless
  { id: "vh-unit", sev: "warn", re: /(?<![-\w])(height|block-size|max-height):\s*100vh\b|(?<![\w-])h-screen\b|\bmax-h-screen\b/, unless: /dvh|svh|lvh/, skip: (f) => STORY.test(f), msg: "fixed 100vh height; use 100dvh" },
  { id: "z-index-big", sev: "warn", re: /z-index:\s*\d{3,}|\bz-\[\d{3,}\]/, msg: "magic z-index; use the semantic layer scale" },
  { id: "break-all", sev: "warn", re: /word-break:\s*break-all|\bbreak-all\b/, msg: "break-all; use overflow-wrap:anywhere on a shrinkable child" },
  // ── visual (generated-UI tells; the project's DESIGN.md may own an exception: set the rule off in .wwjd.json) ──
  { id: "gradient-text", sev: "warn", re: /bg-clip-text|background-clip:\s*text/, msg: "gradient text is a generated-UI tell" },
  { id: "gradient", sev: "warn", re: /\bbg-gradient-|\bbg-linear-|\bbg-radial-|linear-gradient\(|radial-gradient\(|conic-gradient\(/, skip: (f) => TOKEN_FILE.test(f), off: EXPRESSIVE, msg: "decorative gradient; flat unless the project's look owns it" },
  { id: "glass", sev: "warn", re: /\bbackdrop-blur|backdrop-filter:\s*blur/, off: R("native"), msg: "glass/blur; flat by default" },
  { id: "accent-stripe", sev: "warn", re: /\bborder-[ls]-(?:[2-9]|\[)|border-left:\s*[2-9]px/, off: READING, msg: "thick accent stripe on a card is a generated-UI tell" },
  { id: "default-accent", sev: "warn", re: /#(6366f1|8b5cf6|7c3aed|a855f7|4f46e5|9333ea)\b|\b(bg|text|from|to)-(indigo|violet|purple)-(500|600)\b/i, skip: (f) => TOKEN_FILE.test(f), msg: "library default accent (indigo/violet); use the project accent" },
  // ── motion floor (how-to lives in the wwjd:motion skill) ──
  { id: "transition-all", sev: "warn", re: /\btransition-all\b|transition:\s*all\b/, msg: "transition-all; animate transform and opacity only" },
  { id: "animate-layout", sev: "warn", re: /transition(-property)?:\s*[^;]*\b(width|height|top|left|margin|padding)\b/, msg: "animating layout properties causes shift and jank" },
  { id: "bounce", sev: "warn", re: /\banimate-bounce\b|@keyframes\s+(bounce|elastic|wobble|jiggle)|cubic-bezier\([^)]*(-0\.[2-9]|1\.[2-9])/, msg: "bounce/elastic easing; use ease-out" },
  { id: "scale-zero", sev: "warn", re: /scale\((0|0?\.[0-7]\d*)\)|\bscale-(0|50|75)\b|\bease-in\b(?!-out)/, msg: "scale(0–0.8) entrance or ease-in; start at 0.95–0.98 with ease-out" },
  { id: "slow-motion", sev: "warn", re: /(transition|animation)(-duration)?:[^;}]*\b(([5-9]\d\d|\d{4,})ms|(0?\.[6-9]|[1-9](\.\d+)?)s)\b|\bduration-([6-9]\d\d|\d{4,})\b/, unless: /spin|progress|skeleton|shimmer|loading|indeterminate|infinite/i, skip: (f) => /hero|landing/i.test(f), msg: "UI motion over 500ms; feedback stays under it (a landing hero may run longer once)" },
  { id: "infinite-loop", sev: "warn", re: /animation:[^;}]*\binfinite\b|animation-iteration-count:\s*infinite/, unless: /spin|progress|skeleton|shimmer|loading|indeterminate/i, msg: "infinite animation outside a spinner, progress or skeleton; loops pull attention" },
  { id: "attention-loop", sev: "warn", re: /\banimate-(pulse|ping)\b/, skip: (f) => /skeleton/i.test(f), msg: "perpetual attention loop; motion only explains a change" },
  { id: "anim-end-state", sev: "warn", re: /on(Animation|Transition)End\s*=|addEventListener\(\s*["'](animationend|transitionend)/, msg: "state set on animation end; set the final state directly" },
  { id: "spinner", sev: "warn", re: /\banimate-spin\b|<Spinner\b/, off: R("converse"), msg: "spinner; prefer a skeleton that reserves the layout (fine inside a button)" },
];
for (const r of rules) {
  const o = cfg.rules?.[r.id];
  r.level = o || (r.off?.has(REGISTER) || (r.english && !ENGLISH_ONLY) ? "off" : r.sev);
}

// ── files ──────────────────────────────────────────────────────────
function changedFiles() {
  const names = [...(gitPaths(["diff", "--name-only", "HEAD"], ROOT) || []), ...(gitPaths(["ls-files", "--others", "--exclude-standard"], ROOT) || [])];
  return names.map((f) => join(ROOT, f));
}
function walk(p, acc, limit = 30000) {
  if (acc.length >= limit) return;
  let st; try { st = statSync(p); } catch { return; }
  const r = rel(p);
  if (st.isDirectory()) {
    const b = basename(p);
    if (r && (SKIP_DIR.test(r) || (b.startsWith(".") && !/^\.(storybook|ladle)$/.test(b)))) return;
    for (const e of readdirSync(p)) walk(join(p, e), acc, limit);
  } else if (UI_EXT.has(extname(p)) && !SKIP_DIR.test(r)) acc.push(p);
}
// inside git: tracked + untracked files that .gitignore doesn't exclude; elsewhere: a walk
let gitList = null;
function gitFiles() {
  if (gitList) return gitList;
  const out = gitPaths(["ls-files", "-co", "--exclude-standard"], ROOT);
  gitList = out === null ? [] : out.filter((f) => UI_EXT.has(extname(f)) && !SKIP_DIR.test(f)).map((f) => join(ROOT, f));
  return gitList;
}
function collect(paths) {
  const acc = [];
  for (const p0 of paths) {
    const p = resolve(p0);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isFile()) { if (UI_EXT.has(extname(p))) acc.push(p); continue; }
    const under = gitFiles().filter((f) => f === p || f.startsWith(p + sep));
    if (under.length) acc.push(...under); else walk(p, acc);
  }
  return [...new Set(acc)].filter((f) => !TEST.test(rel(f)) && existsSync(f));
}

// ── scan ───────────────────────────────────────────────────────────
const COMMENT = /^\s*(\/\/|\*|\/\*|\{\/\*|<!--)/;
const IGNORE = /wwjd-ignore|ui-check-ignore/;
const texts = new Map();
function scan(files) {
  const findings = [];
  for (const abs of files) {
    const f = rel(abs);
    let text; try { text = readFileSync(abs, "utf8"); } catch { continue; }
    texts.set(f, text);
    const lines = text.split("\n");
    for (const r of rules) {
      if (r.level === "off" || (r.only && !r.only.test(f)) || (r.skip && r.skip(f))) continue;
      lines.forEach((line, i) => {
        if (IGNORE.test(line) || COMMENT.test(line) || !r.re.test(line)) return;
        if ((r.unless && r.unless.test(line)) || (r.ok && r.ok(lines, i))) return;
        findings.push({ file: f, line: i + 1, rule: r.id, severity: r.level, message: r.msg, text: line.trim() });
      });
    }
    // file-level: hidden attribute without a global [hidden] guard; dark theme painting body but not html.
    // Severity: the configured level ("off" | "warn" | "error"), else the rule's own.
    const level = (id, sev) => cfg.rules?.[id] || sev;
    const off = (id, sev) => level(id, sev) === "off";
    const usesHidden = /\shidden(\s|>|=|\})|\.hidden\s*=|toggleAttribute\(\s*["']hidden/.test(text);
    const setsDisplay = /\{[^}]*\bdisplay:\s*(grid|flex|block|inline-flex|inline-grid)/.test(text);
    const guarded = /(^|[\s,}])\[hidden\](:not\([^)]*\))?\s*\{[^}]*display:\s*none/m.test(text);
    const hasDark = /prefers-color-scheme:\s*dark|data-theme=["']?dark|light-dark\(/.test(text);
    const paintsRoot = /(^|[\s,}])(html|:root)(\[[^\]]*\])?\s*\{[^}]*\bbackground(-color)?\s*:/m.test(text);
    const paintsBody = /(^|[\s,}])body\s*\{[^}]*\bbackground(-color)?\s*:/m.test(text);
    if (!off("root-background", "warn") && /\.(html|css|scss)$/.test(f) && hasDark && paintsBody && !paintsRoot)
      findings.push({ file: f, line: 1, rule: "root-background", severity: level("root-background", "warn"), message: "dark theme paints body but not html; overscroll flashes white. Put the ground colour on html", text: "file" });
    if (!off("timeline-supports", "warn") && /animation-timeline\s*:/.test(text) && !/@supports[^{]*animation-timeline/.test(text))
      findings.push({ file: f, line: lines.findIndex((l) => /animation-timeline\s*:/.test(l)) + 1, rule: "timeline-supports", severity: level("timeline-supports", "warn"), message: "scroll-driven animation-timeline without @supports; browsers without it must get the static state", text: "file" });
    if (!off("hidden-guard", "error") && /\.(html|svelte|vue|astro)$/.test(f) && usesHidden && setsDisplay && !guarded)
      findings.push({ file: f, line: 1, rule: "hidden-guard", severity: level("hidden-guard", "error"), message: "hidden attribute used with display rules but no global [hidden] { display: none !important }; hidden states will show", text: "file" });
  }
  return findings;
}

// ── baseline: counts per file + rule + line text, so edits elsewhere don't make old debt look new ──
const key = (x) => x.rule + " " + x.text.replace(/\s+/g, " ").slice(0, 160);
function readBaseline() { try { return JSON.parse(readFileSync(BASELINE, "utf8")); } catch { return null; } }
function tally(findings) {
  const t = {};
  for (const x of findings) { const k = key(x); ((t[x.file] ||= {})[k] = (t[x.file][k] || 0) + 1); }
  return t;
}
function newOnly(findings, base) {
  if (!base) return findings.filter((x) => x.severity === "error");
  // copy only the counters of the files being checked (a hook checks one file against a baseline of thousands)
  const left = {};
  for (const f of new Set(findings.map((x) => x.file))) if (base.files?.[f]) left[f] = { ...base.files[f] };
  return findings.filter((x) => {
    if (x.severity === "error") return true;
    const k = key(x), b = left[x.file];
    if (b && b[k] > 0) { b[k]--; return false; }
    return true;
  });
}

// ── status helpers ─────────────────────────────────────────────────
function findKit(files) {
  const found = KIT_DIRS.filter((d) => existsSync(join(ROOT, d)));
  if (found.length) return found;
  const dirs = new Set();
  for (const f of files) { const m = rel(f).match(/^(.*?(?:^|\/)(?:components\/ui|ui|kit|primitives|design-system))\//); if (m) dirs.add(m[1]); }
  return [...dirs].sort((a, b) => a.length - b.length).slice(0, 3);
}
function storybook() {
  if (cfg.storybook) return cfg.storybook;
  const pm = existsSync(join(ROOT, "pnpm-lock.yaml")) ? "pnpm" : existsSync(join(ROOT, "yarn.lock")) ? "yarn" : existsSync(join(ROOT, "bun.lock")) || existsSync(join(ROOT, "bun.lockb")) ? "bun" : "npm";
  const pkgs = [];
  const look = (d, depth) => {
    if (existsSync(join(d, "package.json"))) pkgs.push(d);
    if (depth <= 0) return;
    let es = []; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es) if (e.isDirectory() && !e.name.startsWith(".") && !SKIP_DIR.test(e.name)) look(join(d, e.name), depth - 1);
  };
  look(ROOT, 2);
  for (const d of pkgs) {
    let p; try { p = JSON.parse(readFileSync(join(d, "package.json"), "utf8")); } catch { continue; }
    const s = Object.entries(p.scripts || {}).find(([k, v]) => /^(storybook|ladle|histoire)$/.test(k) || /^(storybook|ladle|histoire)\b/.test(v) && !/build/.test(k + v));
    if (s) { const r = rel(d); return r ? (pm === "pnpm" ? `pnpm --filter ${p.name} ${s[0]}` : `cd ${r} && ${pm} run ${s[0]}`) : `${pm} run ${s[0]}`; }
  }
  return null;
}
function decisionLog() {
  const out = [];
  for (const d of ["docs/decisions", "docs/adr", "docs/adrs", "decisions", "adr"]) if (existsSync(join(ROOT, d))) out.push(d + "/");
  for (const d of ["", "docs"]) {
    let es = []; try { es = readdirSync(join(ROOT, d)); } catch { continue; }
    for (const e of es) if (/decision|owner-baseline/i.test(e) && /\.md$/i.test(e)) out.push(d ? `${d}/${e}` : e);
  }
  return out;
}
const importsKit = (text) => [...text.matchAll(/from\s+["']([^"']+)["']/g)].some(([, s]) => /^@[\w-]+\/(ui|kit|design-system)(\/|$)|(^|\/)(components\/ui|ui|kit|primitives)(\/|$)/.test(s) || KIT_DIRS.some((d) => s.includes(d)));
const SCREEN = /(^|\/)(pages?|routes?|screens?|views?|features?|app)\//;
function goldenPicks(files, findings, kit) {
  const bad = new Set(findings.map((x) => x.file));
  return files.map(rel)
    .filter((f) => COMPONENT.test(f) && !STORY.test(f) && !inKit(f) && !kit.some((k) => f.startsWith(k + "/")) && !isLegacy(f) && SCREEN.test(f) && !bad.has(f) && importsKit(texts.get(f) || ""))
    .sort((a, b) => (texts.get(b)?.length || 0) - (texts.get(a)?.length || 0)).slice(0, 3);
}
// PRODUCT.md and DESIGN.md per app: a monorepo keeps them by the app (apps/web/PRODUCT.md). The nearest one up from
// the paths in scope (or cwd) applies; the others are listed. Git lists them without a tree walk; outside git a walk
// four folders deep that skips SKIP_DIR.
const BRIEFS = ["PRODUCT.md", "DESIGN.md"];
function briefs() {
  const starts = (opt.paths.length ? opt.paths.map((p) => resolve(p)) : [process.cwd()])
    .map((p) => { try { return statSync(p).isDirectory() ? p : dirname(p); } catch { return dirname(p); } });
  const nearest = {};
  for (const name of BRIEFS) for (const s of starts) {
    for (let d = s; ; d = dirname(d)) {
      if (rel(d).startsWith("..")) break;
      if (existsSync(join(d, name))) { nearest[name] ??= rel(join(d, name)); break; }
      if (d === ROOT || dirname(d) === d) break;
    }
  }
  let all = git(["ls-files", "-z", "-co", "--exclude-standard", "--", ...BRIEFS.map((b) => `:(glob)**/${b}`)], ROOT)?.split("\0").filter(Boolean) ?? null;
  if (all === null) {
    all = [];
    const look = (d, depth) => {
      let es = []; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; }
      for (const e of es) {
        if (e.isFile() && BRIEFS.includes(e.name)) all.push(rel(join(d, e.name)));
        else if (e.isDirectory() && depth > 0 && !e.name.startsWith(".") && !SKIP_DIR.test(e.name)) look(join(d, e.name), depth - 1);
      }
    };
    look(ROOT, 4);
  }
  const others = all.filter((f) => !SKIP_DIR.test(f) && !Object.values(nearest).includes(f)).sort();
  return { nearest, others };
}
const kb = (f) => { try { return Math.round(statSync(join(ROOT, f)).size / 1024) + "KB"; } catch { return ""; } };

// ── commands ───────────────────────────────────────────────────────
const fmt = (x) => `${x.file}:${x.line}  ${x.severity === "error" ? "ERROR" : "warn "} ${x.rule}: ${x.message}`;

// ── dials (dials-spec.mjs): plugin options (WWJD_DIALS, from hooks) < project .wwjd.json "dials" ──
function dials() {
  const raw = {}, from = {};
  for (const [k, v] of (process.env.WWJD_DIALS || "").split(/\s+/).filter(Boolean).map((x) => x.split("="))) { raw[k] = v; from[k] = "plugin"; }
  for (const [k, v] of Object.entries(cfg.dials || {})) { raw[k] = v; from[k] = ".wwjd.json"; }
  const d = {};
  for (const dial of DIALS) d[dial.key] = valueOf(dial, stopOf(dial, raw[dial.key] ?? dial.default));
  return { d, from };
}
function dialLine() {
  const { d } = dials();
  const off = DIALS.filter((dial) => !isDefault(dial, stopOf(dial, d[dial.key]))).map((dial) => {
    const i = stopOf(dial, d[dial.key]); const [name, does] = dial.stops[i];
    return `${dial.name} (${dial.key}) ${i + 1}/5 ${name}: ${does}`;
  });
  if (!off.length) return "dials: all default";
  // An order, not a note: agents read "dials:" as information and build the default.
  const look = stopOf(DIALS[0], d.creativity) >= 3 ? " Look 4-5: call the Skill tool with wwjd:look (quick mode) before building, even for one component." : "";
  return `dials (apply each to everything you build and write this session; the handover names how each showed): ${off.join(" · ")}${look} The rest default; DESIGN.md and the Floor still win.`;
}

if (cmd === "dials") {
  if (opt.json) console.log(JSON.stringify(dials(), null, 2)); else console.log(dialLine());
  process.exit(0);
}

if (cmd === "status") {
  const files = collect([ROOT]);
  const findings = scan(files);
  const base = readBaseline();
  const open = base ? newOnly(findings, base) : findings;
  const kit = findKit(files);
  const tokens = files.map(rel).filter((f) => TOKEN_FILE.test(f) && /\.(css|scss)$/.test(f)).slice(0, 3);
  const density = files.length ? open.length / files.length : 0;
  const brief = briefs();
  const stage = !kit.length && !tokens.length && !brief.nearest["DESIGN.md"] && files.length < 5 ? "scratch"
    : !kit.length || density > 0.5 || LEGACY.length ? "messy" : "kit";
  const have = ["DESIGN.md", "PRODUCT.md", "RATCHET.md", ".wwjd.json", ".wwjd-baseline.json"].map((f) => f === ".wwjd.json" && PROJECT_CFG
    ? (dirname(PROJECT_CFG) === ROOT ? f : rel(PROJECT_CFG))
    : brief.nearest[f] ? `${brief.nearest[f]} ${kb(brief.nearest[f])}`
    : !BRIEFS.includes(f) && existsSync(join(ROOT, f)) ? `${f}${/\.md$/.test(f) ? " " + kb(f) : ""}` : `${f}: none`);
  const log = decisionLog();
  const golden = [].concat(cfg.golden || []);
  const picks = golden.length ? [] : goldenPicks(files, findings, kit);
  const read = [];
  if (brief.nearest["PRODUCT.md"]) read.push(brief.nearest["PRODUCT.md"]);
  if (brief.nearest["DESIGN.md"]) read.push(`${brief.nearest["DESIGN.md"]} prose (Named rules and Do's/Don'ts in full; skip token frontmatter)`);
  if (brief.others.length) read.push(`the ${brief.others.length > 1 ? "ones" : "one"} of ${brief.others.slice(0, 6).join(", ")} over the files you work on`);
  if (existsSync(join(ROOT, "RATCHET.md"))) read.push("RATCHET.md Gotchas, Tells, [design] items");
  if (log.length) read.push(`decision-log lines that grep for the surface's names (${log.join(", ")})`);
  read.push(golden.length ? `golden: ${golden.slice(0, 2).join(", ")}` : picks.length ? `golden (suggested): ${picks.slice(0, 2).join(", ")}` : "no golden file yet");
  const profile = process.env.WWJD_PROFILE ? "$WWJD_PROFILE" : existsSync(join(userCfg, "profile.md")) ? "~/.config/wwjd/profile.md" : null;
  const taste = process.env.WWJD_TASTE ? "$WWJD_TASTE" : existsSync(join(userCfg, "taste.md")) ? "~/.config/wwjd/taste.md" : null;
  if (taste) read.push(`taste ${taste} (your design rules for every project; the project's DESIGN.md and decision log outrank them)`);
  if (profile) read.push(`profile ${profile} (workflow, locale only)`);
  const dd = dials().d;
  if (opt.json) {
    console.log(JSON.stringify({ stage, uiFiles: files.length, findings: findings.length, open: open.length, density: +density.toFixed(2), kit, tokens, files: have, briefs: brief, decisionLog: log, taste, profile, storybook: storybook(), golden, goldenSuggested: picks, legacy: cfg.legacy || [], register: cfg.register || null, dials: dd, read }, null, 2));
  } else {
    console.log(`stage: ${stage}  (${files.length} UI files, ${open.length} ${base ? "new " : ""}findings, ${density.toFixed(2)}/file)`);
    console.log(`files: ${have.join(" · ")}`);
    if (brief.others.length) console.log(`nested: ${brief.others.slice(0, 8).join(", ")}${brief.others.length > 8 ? ` (+${brief.others.length - 8})` : ""}  (each applies to the files below it)`);
    console.log(`decision log: ${log.join(", ") || "none"}`);
    console.log(`kit: ${kit.join(", ") || "none"}${tokens.length ? `  tokens: ${tokens.join(", ")}` : ""}`);
    console.log(`storybook: ${storybook() || "none"}`);
    console.log(`register: ${cfg.register || "unset (name it per surface)"}`);
    console.log(`golden: ${golden.join(", ") || (picks.length ? `none set; suggested ${picks.join(", ")} (confirm, then add "golden" to .wwjd.json)` : "none")}`);
    console.log(`legacy: ${[].concat(cfg.legacy || []).join(", ") || "none"}  (never imitate)`);
    console.log(isGated(dd.strictness) ? "grade gate: before building an over-budget surface, write .wwjd/grade/<surface>.json, run grade.mjs on it and answer its sheet" : "grade light: grade over-budget surfaces in your head; the handover lists what moved and where");
    console.log(dialLine());
    console.log(`read: ${read.join("; ")}`);
  }
  process.exit(0);
}

if (cmd === "audit") {
  const files = collect(opt.paths.length ? opt.paths : [ROOT]);
  const findings = scan(files);
  const kit = findKit(files);
  const area = (f) => { const p = f.split("/"); const i = p.findIndex((s) => /^(features?|pages?|routes?|screens?|views?|components|app|modules)$/.test(s)); return p.slice(0, i >= 0 ? Math.min(i + 2, p.length - 1) : Math.min(2, p.length - 1)).join("/") || "."; };
  const areas = {};
  for (const x of findings) { const a = (areas[area(x.file)] ||= { errors: 0, warns: 0, rules: {} }); x.severity === "error" ? a.errors++ : a.warns++; a.rules[x.rule] = (a.rules[x.rule] || 0) + 1; }
  const perFile = {};
  for (const x of findings) perFile[x.file] = (perFile[x.file] || 0) + (x.severity === "error" ? 3 : 1);
  const rebuild = Object.entries(perFile).filter(([f]) => !STORY.test(f)).map(([f, s]) => [f, s, importsKit(texts.get(f) || "")]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const ranked = Object.entries(areas).sort((a, b) => (b[1].errors * 3 + b[1].warns) - (a[1].errors * 3 + a[1].warns));
  const top = (r) => Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ×${v}`).join(", ");
  const tag = cfg.tags?.design || "[design]";
  if (opt.json) { console.log(JSON.stringify({ files: files.length, findings: findings.length, areas: Object.fromEntries(ranked), rebuild, golden: goldenPicks(files, findings, kit) }, null, 2)); process.exit(0); }
  console.log(`debt map: ${files.length} UI files, ${findings.length} findings, kit: ${kit.join(", ") || "none"}\n`);
  for (const [a, v] of ranked.slice(0, 12)) console.log(`${String(v.errors * 3 + v.warns).padStart(4)}  ${a}  (${v.errors} errors, ${v.warns} warns: ${top(v.rules)})`);
  console.log(`\nrebuild candidates (rebuild from a ≤10-line spec, don't renovate):`);
  for (const [f, s, k] of rebuild) console.log(`  ${f}  weight ${s}${k ? "" : ", bypasses the kit"}`);
  const g = goldenPicks(files, findings, kit);
  console.log(`\ngolden picks: ${g.join(", ") || "none qualify (0 findings, imports the kit, a screen)"}`);
  console.log(`\nRATCHET.md backlog lines (suspicion, not target):`);
  for (const [a, v] of ranked.slice(0, 5)) console.log(`- ${tag} ${a}: ${top(v.rules)}; ${kit.some((k) => a.startsWith(k)) ? "suspect the kit component itself (fix there, not at call sites)" : "suspect drift from the kit here"}`);
  process.exit(0);
}

// check
const targets = opt.paths.length ? opt.paths : opt.baseline ? [ROOT] : changedFiles();
const files = collect(targets);
if (opt.hook && !files.length) process.exit(0);
const all = scan(files);

if (opt.baseline) {
  const old = readBaseline();
  const now = tally(all);
  const merged = opt.paths.length && old ? { ...old.files } : {};
  for (const f of new Set([...Object.keys(now), ...(opt.paths.length ? [] : Object.keys(old?.files || {}))])) {
    const cur = now[f] || {}, prev = old?.files?.[f];
    const out = {};
    for (const [k, n] of Object.entries(cur)) { const m = prev ? Math.min(n, prev[k] || 0) : old ? 0 : n; if (m > 0) out[k] = m; }
    if (Object.keys(out).length) merged[f] = out; else delete merged[f];
  }
  if (opt.paths.length) for (const f of files.map(rel)) if (!now[f]) delete merged[f];
  const total = Object.values(merged).reduce((s, r) => s + Object.values(r).reduce((a, b) => a + b, 0), 0);
  writeFileSync(BASELINE, JSON.stringify({ version: 1, note: "wwjd ratchet: counts only go down. Delete the file to accept new debt on purpose.", total, files: Object.fromEntries(Object.entries(merged).sort()) }, null, 2) + "\n");
  console.log(`wwjd: baseline ${old ? "ratcheted" : "written"}: ${total} findings in ${Object.keys(merged).length} files → ${rel(BASELINE)}`);
  process.exit(0);
}

const shown = (opt.new ? newOnly(all, readBaseline()) : all).sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1));
const errors = shown.filter((x) => x.severity === "error").length;
if (opt.hook) {
  if (!shown.length) process.exit(0);
  const lines = shown.slice(0, 5).map(fmt);
  if (shown.length > 5) lines[4] = `… ${shown.length - 4} more: node wwjd.mjs check ${rel(opt.paths[0])} --new`;
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: "wwjd check:\n" + lines.join("\n") } }));
  process.exit(0);
}
if (opt.json) {
  console.log(JSON.stringify({ register: REGISTER, files: files.length, errors, warnings: shown.length - errors, findings: shown }, null, 2));
} else {
  for (const x of shown.slice(0, opt.max)) console.log(fmt(x));
  if (shown.length > opt.max) console.log(`… ${shown.length - opt.max} more`);
  console.log(`\nwwjd check (${REGISTER}${opt.new ? ", new only" : ""}): ${files.length} files, ${errors} errors, ${shown.length - errors} warnings`);
}
process.exit(errors ? 1 : 0);
