#!/usr/bin/env node
// UserPromptSubmit: on the first UI-shaped prompt of a session, tell the agent to call the wwjd:ux skill (and
// wwjd:look / wwjd:motion when their words appear), with the dials that are off default; on every prompt of the
// session, name per-request dial nudges ("bolder" → Look +1). Silent for everything else, and for messages that are
// not the person's own (other sessions, task notifications, system notices). One process, no dependencies.
// Extra trigger words: WWJD_ROUTE_WORDS="banner|carousel|badge".
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { DIALS, isDefault, stopOf } from "../skills/ux/scripts/dials-spec.mjs";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const prompt = String(input.prompt ?? "");
// Not the person typing: another agent's hand-back, a task or system notification, a slash command's caveat.
if (/^\s*(<(agent-message|task-notification|system-reminder|local-command-caveat)|\[SYSTEM NOTIFICATION|Another Claude session sent a message)/.test(prompt)) process.exit(0);

const word = (alts) => new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alts})(?![\\p{L}\\p{N}_])`, "iu");

// Per-request nudges: one stop, this request only; a dial nudged both ways is left alone.
const NUDGES = [
  ["creativity", +1, "bolder|wilder|more creative|more daring|surprise me|more personality"],
  ["creativity", -1, "safer|tamer|more conservative|more standard|less flashy"],
  ["budget", -1, "leaner|less busy|less cluttered|strip (?:it )?down|fewer things"],
  ["budget", +1, "show more|more detail|more info(?:rmation)?|richer"],
  ["density", +1, "denser|more compact|tighter"],
  ["density", -1, "airier|roomier|more breathing room|more space"],
  ["motion", +1, "livelier|more (?:motion|animation)|more alive"],
  ["motion", -1, "calmer|less (?:motion|animation)|no animations?"],
  ["voice", +1, "warmer|friendlier|more human"],
  ["voice", -1, "terser|drier|less chatty|less wordy"],
  ["strictness", -1, "quick|quickly|rough|just ship"],
  ["strictness", +1, "thorough|carefully|polish(?:ed)?|pixel.perfect"],
];
const moves = {};
for (const [key, step, alts] of NUDGES) if (word(alts).test(prompt)) (moves[key] ??= new Set()).add(step);
const nudges = Object.entries(moves).filter(([, s]) => s.size === 1).map(([k, s]) => `${k} ${[...s][0] > 0 ? "+1" : "-1"}`);
const nudgeText = nudges.length ? ` Dial nudge for this request only: ${nudges.join("; ")} (references/dials.md).` : "";

const say = (text) => { console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: text } })); process.exit(0); };

const sid = String(input.session_id || "none").replace(/[^\w.-]/g, "_");
const marker = join(process.env.TMPDIR || tmpdir(), "wwjd-route", sid);
if (existsSync(marker)) { if (nudgeText) say(`wwjd:${nudgeText}`); process.exit(0); }

// Strong: UI on its own. Weak nouns only count next to a design word.
const strong = "ui|ux|(?:chat|assistant|copilot|agent) (?:panel|ui|interface|window|sidebar|view)|redesign|layouts?|mock-?ups?|wireframes?|figma|storybook|landing ?page|hero|dashboard|css(?!-(?:loader|modules?|in-js))|tailwind|styling|typography|fonts?|colou?r ?palette|contrast|dark mode|light mode|animations?|hover|tooltips?|modal|drawer|sidebar|navbar|buttons?|cards?|components?|design system|design\\.md|onboarding|empty state|ui copy|microcopy|a11y|accessibility" + (process.env.WWJD_ROUTE_WORDS ? `|${process.env.WWJD_ROUTE_WORDS}` : "");
const weak = "page|screen|view|form|table|menu|header|footer|input|labels?|copy|charts?|list|panel|chat|checkout|article|docs|blog|templates?|settings|pricing|navigation|profile";
const verb = "design|redesign|bolder|safer|leaner|richer|denser|airier|roomier|livelier|calmer|warmer|terser|make it|looks?|align|aligned|spacing|padding|polish|prettier|cleaner|clean ?up|busy|cluttered|messy|ugly|nicer|simplify|style|restyle|tidy|centered|centred|wrap|jumps?|responsive|mobile|reads? well|readab(?:le|ility)|hard to (?:use|read|find|navigate)";
const isUI = word(strong).test(prompt) || (word(weak).test(prompt) && word(verb).test(prompt)) || /\[Image #\d+\]/.test(prompt);
if (!isUI) process.exit(0);

mkdirSync(dirname(marker), { recursive: true });
writeFileSync(marker, "");

const also = [
  word("palette|colou?rs?|fonts?|typeface|typography|theme|brand(?:ing)?|moodboard|dark mode|light mode|look and feel").test(prompt) && "wwjd:look",
  word("animat\\p{L}*|motion|transitions?|micro-?interactions?|smoother|snappier|feel alive").test(prompt) && "wwjd:motion",
].filter(Boolean);

// The dials off default: plugin options (CLAUDE_PLUGIN_OPTION_*), then the nearest .wwjd.json "dials".
const raw = {};
for (const d of DIALS) { const v = process.env[`CLAUDE_PLUGIN_OPTION_${d.key.toUpperCase()}`]; if (v) raw[d.key] = v; }
for (let dir = input.cwd || process.cwd(); ; dir = dirname(dir)) {
  const f = join(dir, ".wwjd.json");
  if (existsSync(f)) { try { Object.assign(raw, JSON.parse(readFileSync(f, "utf8")).dials || {}); } catch { /* bad file: options stand */ } break; }
  if (dirname(dir) === dir) break;
}
const off = DIALS.map((d) => [d, stopOf(d, raw[d.key] ?? d.default)]).filter(([d, i]) => !isDefault(d, i)).map(([d, i]) => `${d.name} ${i + 1} ${d.stops[i][0]}`);

say(
  `UI work: before designing, editing or reviewing it, read the files involved, then call the Skill tool with wwjd:ux` +
  (also.length ? `, and ${also.join(" and ")}` : "") + `. Its rules and the Strictness hooks apply to every UI edit in this session.` +
  (off.length ? ` Dials: ${off.join(", ")}.` : "") + nudgeText,
);
