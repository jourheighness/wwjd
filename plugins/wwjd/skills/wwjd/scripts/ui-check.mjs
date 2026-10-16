#!/usr/bin/env node
// ui-check: a static scan of UI source for wwjd rule violations.
//
// Usage: node ui-check.mjs [paths...] [--register <name>] [--json] [--config <file>]
//   With no paths, it scans files changed against HEAD plus untracked files.
//   Registers: persuade showcase editorial reference operate monitor converse transact flow native
//   Config (first found): --config, ./.wwjd.json, ~/.config/wwjd/ui-check.json
//     { "register": "operate", "rules": { "<id>": "off"|"warn"|"error" },
//       "kitDirs": ["packages/ui"], "tokenFiles": "regex" }
//   Ignore one line with a trailing comment containing `ui-check-ignore: <reason>`.
// Findings are leads, not verdicts: fix each one or justify it.
import { execSync } from "node:child_process";
import { readFileSync, statSync, readdirSync, existsSync } from "node:fs";
import { join, extname, resolve, relative } from "node:path";
import { homedir } from "node:os";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 10)) {
  console.error("ui-check needs Node 20.10 or newer");
  process.exit(2);
}

// ── args and config ────────────────────────────────────────────────
const argv = process.argv.slice(2);
const opt = { paths: [], json: false, register: null, config: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--json") opt.json = true;
  else if (a === "--register") opt.register = argv[++i];
  else if (a === "--config") opt.config = argv[++i];
  else if (a === "-h" || a === "--help") { console.log(readFileSync(new URL(import.meta.url)).toString().split("\n").slice(1, 13).join("\n").replace(/^\/\/ ?/gm, "")); process.exit(0); }
  else opt.paths.push(a);
}
let cfg = {};
for (const p of [opt.config, ".wwjd.json", join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "wwjd", "ui-check.json")]) {
  if (p && existsSync(p)) { try { cfg = JSON.parse(readFileSync(p, "utf8")); } catch (e) { console.error(`ui-check: bad config ${p}: ${e.message}`); process.exit(2); } break; }
}
const REGISTER = (opt.register || cfg.register || "operate").toLowerCase();
const KIT_DIRS = (cfg.kitDirs || ["packages/ui", "components/ui", "src/components/ui", "src/ui", "kit", "primitives"]).map((d) => d.replace(/\/$/, ""));
const TOKEN_FILE = new RegExp(cfg.tokenFiles || "(tokens?|theme|palette|colou?rs?|variables|globals?)\\.(css|scss|ts|js|json)$|(^|/)tokens?/", "i");

const UI_EXT = new Set([".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".mdx", ".css", ".scss"]);
const SKIP_DIR = /(^|\/)(node_modules|dist|build|\.next|\.svelte-kit|\.astro|coverage|storybook-static|\.git|vendor)(\/|$)/;
const STORY = /\.stories\.|\.story\./;
const TEST = /\.(test|spec)\.|__tests__|__fixtures__|fixtures?\//;
const MARKUP = /\.(tsx|jsx|vue|svelte|astro|html)$/;
const COMPONENT = /\.(tsx|jsx|vue|svelte|astro)$/;
const inKit = (f) => KIT_DIRS.some((d) => f === d || f.startsWith(d + "/") || f.includes("/" + d + "/"));

const R = (...names) => new Set(names);
const EXPRESSIVE = R("persuade", "showcase");
const READING = R("editorial", "reference");

// sev: default severity. off: registers where the rule doesn't apply.
const rules = [
  // ── floor: accessibility and honesty ──
  { id: "no-zoom", sev: "error", re: /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/, msg: "zoom disabled" },
  { id: "tabindex-positive", sev: "error", re: /tabIndex=\{?["']?[1-9]/, msg: "positive tabIndex breaks keyboard order" },
  { id: "div-click", sev: "error", re: /<(div|span|li)\b[^>]*\bonClick=/, only: /\.(tsx|jsx)$/, msg: "clickable div/span; use a button, a link or the kit's item" },
  { id: "dead-link", sev: "error", re: /href=["']#["']/, msg: 'dead link href="#"; give it a real target or make it a button' },
  { id: "alert", sev: "error", re: /\bwindow\.alert\(|\balert\(\s*["'`]/, msg: "alert(); show the error inline" },
  { id: "focus-removed", sev: "warn", re: /outline:\s*none|\boutline-none\b|\boutline-0\b/, unless: /focus(-visible)?:(ring|outline)|:focus-visible/, msg: "focus outline removed without a visible focus-visible replacement" },
  { id: "img-dimensions", sev: "warn", re: /<img\b(?![^>]*\b(width|height)=)(?![^>]*aspect-)[^>]*>/, only: MARKUP, msg: "image without dimensions shifts layout as it loads" },
  { id: "fake-urgency", sev: "error", re: /\b(only \d+ left|hurry|offer ends in|limited time only|\d+ people are (viewing|looking))\b/i, only: MARKUP, msg: "urgency/scarcity copy; only if true and verifiable" },
  // ── copy ──
  { id: "explainer-copy", sev: "warn", re: /\b(nothing is (ever )?(lost|saved|shared)|everything is (private|saved|safe)|don['’]t worry|no need to worry|rest assured|simply (click|drag|select)|just (click|drag|select)|click here|here you can|this (page|section|view|panel|feature|card) (lets|allows|shows|helps|will)|you can (now|always|easily)|we['’]ll (start|begin|automatically)|this will (start|begin|automatically))\b/i, only: MARKUP, msg: "explaining or reassuring copy; the UI should explain itself" },
  { id: "banned-label", sev: "warn", re: />\s*(Submit|OK|Ok|Click here|Learn more|Get started|Read more)\s*</, only: MARKUP, msg: "generic label; name the action and its target" },
  { id: "oops", sev: "warn", re: /\b(Oops|Whoops|Uh oh)\b|["'`>][^"'`<\n]{2,80}!\s*["'`<]/, only: MARKUP, skip: (f) => STORY.test(f), off: EXPRESSIVE, msg: "'Oops' or an exclamation in UI copy; keep it plain and calm" },
  { id: "buzzword", sev: "warn", re: /\b(supercharge|unleash|harness the power|best-in-class|industry-leading|world-class|next-generation|cutting-edge|revolutioni[sz]e|game-?changer|future-proof|seamless(ly)?|effortless(ly)?|delve|tapestry)\b/i, only: MARKUP, msg: "marketing buzzword" },
  { id: "ai-dash", sev: "warn", re: />[^<{}]*\s[—–]\s[^<{}]*<|["'`][^"'`\n]*\s[—–]\s[^"'`\n]*["'`]/, only: MARKUP, skip: (f) => STORY.test(f), off: R("editorial", "persuade", "showcase"), msg: "dash in a UI string reads as AI copy (fine in prose)" },
  { id: "count-of", sev: "warn", re: /\{[^}]+\}\s*(of|\/)\s*\{[^}]+\}|\$\{[^}]+\}\s*(of|\/)\s*\$\{[^}]+\}/, only: MARKUP, off: R("transact", "persuade", "showcase"), msg: "'N of M' count; justify it, or use a progress mark or dot" },
  { id: "confirm-dialog", sev: "warn", re: /\bwindow\.confirm\(|\bconfirm\(\s*["'`]|are you sure/i, off: R("transact", "flow"), msg: "confirm dialog; use undo (a review step only for money, legal or sending to others)" },
  { id: "locale-format", sev: "warn", re: /\.toLocale(Date|Time)?String\(\)|\.toFixed\(/, only: COMPONENT, msg: "ad-hoc formatting; use Intl.* with the app locale" },
  // ── system ──
  { id: "hex-in-ui", sev: "warn", re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/, only: COMPONENT, skip: (f) => TOKEN_FILE.test(f) || /icon/i.test(f), msg: "raw hex in a component or page; use a token" },
  { id: "raw-palette", sev: "warn", re: /\b(bg|text|border|ring|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/, only: MARKUP, skip: (f) => TOKEN_FILE.test(f) || STORY.test(f) || inKit(f), msg: "raw palette class; use a semantic token" },
  { id: "arbitrary-value", sev: "warn", re: /\b(?:[a-z]+-)+\[(?:#|\d+(?:\.\d+)?(?:px|rem|em|%)|rgb|hsl|oklch)[^\]]*\]/, only: MARKUP, skip: (f) => inKit(f), msg: "arbitrary Tailwind value; use the scale or a token" },
  { id: "inline-style", sev: "warn", re: /\bstyle=\{\{[^}]*(color|margin|padding|font|background)|\bstyle="[^"]*(color|margin|padding|font|background)/, only: COMPONENT, skip: (f) => STORY.test(f) || inKit(f), msg: "inline style; put the look in a kit variant" },
  { id: "callsite-override", sev: "warn", re: /<(Button|Card|Badge|Chip|Tooltip|Avatar|Input|Select|Dialog|Sheet)\b[^>]*\bclassName=["'{`][^"'}`]*\b(bg-|text-(?!left|right|center|start|end)|border-|rounded|p[xytrbl]?-\d|shadow|font-)/, only: /\.(tsx|jsx)$/, skip: (f) => inKit(f) || STORY.test(f), msg: "styling a kit component at the call site; add a variant in the kit" },
  { id: "native-control", sev: "warn", re: /<(select|datalist)\b|<input[^>]*type=["'](date|time|datetime-local|color|range)["']/, only: MARKUP, skip: (f) => inKit(f), off: R("native", "flow", "transact"), msg: "native OS control on desktop UI; use the kit's control if one exists" },
  { id: "important", sev: "warn", re: /!important\b/, msg: "!important; fix the cascade or the variant" },
  { id: "native-title", sev: "warn", re: /<(?!svg\b|title\b|iframe\b|abbr\b|link\b|frame\b|object\b)[a-z][a-z0-9]*\b[^>]*\stitle=["{]/, only: MARKUP, msg: "native title tooltip; use the kit tooltip (works on focus and touch)" },
  // ── layout ──
  { id: "centered-text", sev: "warn", re: /\btext-center\b|text-align:\s*center/, off: R("persuade", "showcase", "editorial", "converse", "flow"), msg: "centred text; start-align unless it is genuinely centred content" },
  { id: "eyebrow", sev: "warn", re: /\buppercase\b[^"'`\n]*\btracking-|\btracking-[^"'`\s]+[^"'`\n]*\buppercase\b/, off: R("editorial"), msg: "uppercase tracked eyebrow; use sentence case or nothing" },
  { id: "vh-unit", sev: "warn", re: /\b100vh\b|\bh-screen\b|\bmin-h-screen\b/, msg: "100vh; use dvh" },
  { id: "z-index-big", sev: "warn", re: /z-index:\s*\d{3,}|\bz-\[\d{3,}\]/, msg: "magic z-index; use the semantic layer scale" },
  { id: "break-all", sev: "warn", re: /word-break:\s*break-all|\bbreak-all\b/, msg: "break-all; use overflow-wrap:anywhere on a shrinkable child" },
  // ── visual ──
  { id: "gradient-text", sev: "warn", re: /bg-clip-text|background-clip:\s*text/, msg: "gradient text is a generated-UI tell" },
  { id: "gradient", sev: "warn", re: /\bbg-gradient-|\bbg-linear-|\bbg-radial-|linear-gradient\(|radial-gradient\(|conic-gradient\(/, skip: (f) => TOKEN_FILE.test(f), off: EXPRESSIVE, msg: "decorative gradient; flat unless the project's look owns it" },
  { id: "glass", sev: "warn", re: /\bbackdrop-blur|backdrop-filter:\s*blur/, off: R("native"), msg: "glass/blur; flat by default" },
  { id: "accent-stripe", sev: "warn", re: /\bborder-[ls]-(?:[2-9]|\[)|border-left:\s*[2-9]px/, off: READING, msg: "thick accent stripe on a card is a generated-UI tell" },
  { id: "default-accent", sev: "warn", re: /#(6366f1|8b5cf6|7c3aed|a855f7|4f46e5|9333ea)\b|\b(bg|text|from|to)-(indigo|violet|purple)-(500|600)\b/i, skip: (f) => TOKEN_FILE.test(f), msg: "library default accent (indigo/violet); use the project accent" },
  // ── motion ──
  { id: "transition-all", sev: "warn", re: /\btransition-all\b|transition:\s*all\b/, msg: "transition-all; animate transform and opacity only" },
  { id: "animate-layout", sev: "warn", re: /transition(-property)?:\s*[^;]*\b(width|height|top|left|margin|padding)\b/, msg: "animating layout properties causes shift and jank" },
  { id: "bounce", sev: "warn", re: /\banimate-bounce\b|@keyframes\s+(bounce|elastic|wobble|jiggle)|cubic-bezier\([^)]*(-0\.[2-9]|1\.[2-9])/, msg: "bounce/elastic easing; use ease-out" },
  { id: "scale-zero", sev: "warn", re: /scale\(0\)|\bscale-0\b|\bease-in\b(?!-out)/, msg: "scale(0) entrance or ease-in; start at 0.95–0.98 with ease-out" },
  { id: "attention-loop", sev: "warn", re: /\banimate-(pulse|ping)\b/, skip: (f) => /skeleton/i.test(f), msg: "perpetual attention loop; motion only explains a change" },
  { id: "anim-end-state", sev: "warn", re: /on(Animation|Transition)End\s*=|addEventListener\(\s*["'](animationend|transitionend)/, msg: "state set on animation end; set the final state directly" },
  { id: "spinner", sev: "warn", re: /\banimate-spin\b|<Spinner\b/, off: R("converse"), msg: "spinner; prefer a skeleton that reserves the layout (fine inside a button)" },
];

for (const r of rules) {
  const o = cfg.rules?.[r.id];
  r.level = o || (r.off?.has(REGISTER) ? "off" : r.sev);
}

// ── files ──────────────────────────────────────────────────────────
function changedFiles() {
  try {
    const top = execSync("git rev-parse --show-toplevel", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    let out = "";
    try { out += execSync("git diff --name-only HEAD", { cwd: top, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { /* no commits yet */ }
    out += execSync("git ls-files --others --exclude-standard", { cwd: top, encoding: "utf8" });
    return out.split("\n").filter(Boolean).map((f) => relative(process.cwd(), resolve(top, f)));
  } catch { return []; }
}
function walk(p, acc) {
  let st; try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) { if (!SKIP_DIR.test(p)) for (const e of readdirSync(p)) walk(join(p, e), acc); }
  else if (UI_EXT.has(extname(p)) && !SKIP_DIR.test(p)) acc.push(p);
}
const files = [];
for (const p of opt.paths.length ? opt.paths : changedFiles()) walk(p, files);
const uiFiles = files.filter((f) => !TEST.test(f));

// ── scan ───────────────────────────────────────────────────────────
const findings = [];
const COMMENT = /^\s*(\/\/|\*|\/\*|\{\/\*|<!--)/;
for (const f of uiFiles) {
  let text; try { text = readFileSync(f, "utf8"); } catch { continue; }
  const lines = text.split("\n");
  for (const r of rules) {
    if (r.level === "off") continue;
    if (r.only && !r.only.test(f)) continue;
    if (r.skip && r.skip(f)) continue;
    lines.forEach((line, i) => {
      if (line.includes("ui-check-ignore") || COMMENT.test(line)) return;
      if (!r.re.test(line)) return;
      if (r.unless && r.unless.test(line)) return;
      findings.push({ file: f, line: i + 1, rule: r.id, severity: r.level, message: r.msg });
    });
  }
}

const errors = findings.filter((x) => x.severity === "error").length;
if (opt.json) {
  console.log(JSON.stringify({ register: REGISTER, files: uiFiles.length, errors, warnings: findings.length - errors, findings }, null, 2));
} else {
  for (const x of findings) console.log(`${x.file}:${x.line}  ${x.severity === "error" ? "ERROR" : "warn "} ${x.rule}: ${x.message}`);
  console.log(`\nui-check (${REGISTER}): ${uiFiles.length} files, ${errors} errors, ${findings.length - errors} warnings`);
}
process.exit(errors ? 1 : 0);
