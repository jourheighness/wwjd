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
import { openLedger } from "../skills/ux/scripts/ledger.mjs";
import { dialsFor, hooksMode } from "../skills/ux/scripts/paths.mjs";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
if (hooksMode(input.cwd || process.cwd()) === "off") process.exit(0); // the Hooks setting
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
  // Strictness moves on instructions only: "too quick" or "really rough" is a complaint asking for more care, not less.
  ["strictness", -1, "quick (?:fix|draft|pass|mock(?:-?up)?|sketch|and dirty)|rough (?:draft|pass|mock(?:-?up)?|sketch|cut)|just ship(?: it)?|skip the checks"],
  ["strictness", +1, "be thorough|thoroughly|carefully|pixel.perfect|polish (?:it|this)"],
];
const moves = {};
for (const [key, step, alts] of NUDGES) if (word(alts).test(prompt)) (moves[key] ??= new Set()).add(step);
const nudges = Object.entries(moves).filter(([, s]) => s.size === 1).map(([k, s]) => `${k} ${[...s][0] > 0 ? "+1" : "-1"}`);
// A redesign is explore §5, every time it is asked for: build would keep today's structure.
const redesign = word("redesign|redo|start over|from scratch|rethink|re-?imagine|clean slate").test(prompt);
// Exploring: the person says the checks can wait ("just exploring", "verify later", "no wwjd here"); the gate holds its
// checks for the session until they say it is a keeper ("keep it", "verify now", "lock it in"). gate.mjs reads it.
const exploring = word("(?:just |we'?re |i'?m )?exploring|explore freely|verify (?:it )?later|check (?:it )?later|(?:no|skip|don'?t (?:need to )?use) wwjd(?: here| for this| now)?").test(prompt);
const keeper = word("keep (?:it|this|that)|(?:it'?s|that'?s) a keeper|lock (?:it|this) in|verify (?:it )?now|run the checks|check it now").test(prompt);
let held = "";
if (exploring !== keeper) {
  try { openLedger(input).update((l) => { l.explore = exploring; }); } catch { /* no state dir: nothing held */ }
  held = exploring ? " Exploring: wwjd's handover checks are held until the person says keep; still follow the rules and the Floor." : " Kept: wwjd's handover checks apply again from here.";
}
const nudgeText = (nudges.length ? ` Dial nudge for this request only: ${nudges.join("; ")} (references/dials.md).` : "") +
  (redesign ? " Redesign: commands/explore.md §5 (today's layout is the before, not the brief; 3 directions from the job)." : "") + held;

const say = (text) => { console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: text } })); process.exit(0); };

const sid = String(input.session_id || "none").replace(/[^\w.-]/g, "_");
const marker = join(process.env.TMPDIR || tmpdir(), "wwjd-route", sid);
if (existsSync(marker)) { if (nudgeText) say(`wwjd:${nudgeText}`); process.exit(0); }

// Strong: UI on its own. Weak nouns only count next to a design word.
const strong = "ui|ux|(?:chat|assistant|copilot|agent) (?:panel|ui|interface|window|sidebar|view)|redesign|layouts?|mock-?ups?|wireframes?|figma|storybook|landing ?page|hero|dashboard|css(?!-(?:loader|modules?|in-js))|tailwind|styling|typography|fonts?|colou?r ?palette|contrast|dark mode|light mode|animations?|hover|tooltips?|modal|drawer|sidebar|navbar|buttons?|cards?|components?|design system|design\\.md|onboarding|empty state|ui copy|microcopy|a11y|accessibility" + (process.env.WWJD_ROUTE_WORDS ? `|${process.env.WWJD_ROUTE_WORDS}` : "");
const weak = "page|screen|view|form|table|menu|header|footer|input|labels?|copy|charts?|list|panel|chat|checkout|article|docs|blog|templates?|settings|pricing|navigation|profile";
const verb = "design|redesign|redo|start over|from scratch|rethink|re-?imagine|bolder|safer|leaner|richer|denser|airier|roomier|livelier|calmer|warmer|terser|make it|looks?|align|aligned|spacing|padding|polish|prettier|cleaner|clean ?up|busy|cluttered|messy|ugly|nicer|simplify|style|restyle|tidy|centered|centred|wrap|jumps?|responsive|mobile|reads? well|readab(?:le|ility)|hard to (?:use|read|find|navigate)";
const isUI = word(strong).test(prompt) || (word(weak).test(prompt) && word(verb).test(prompt)) || /\[Image #\d+\]/.test(prompt);
if (!isUI) process.exit(0);

mkdirSync(dirname(marker), { recursive: true });
writeFileSync(marker, "");

const also = [
  word("palette|colou?rs?|fonts?|typeface|typography|theme|brand(?:ing)?|moodboard|dark mode|light mode|look and feel").test(prompt) && "wwjd:look",
  word("animat\\p{L}*|motion|transitions?|micro-?interactions?|smoother|snappier|feel alive").test(prompt) && "wwjd:motion",
].filter(Boolean);

// The dials off default (paths.mjs dialsFor: plugin options, then the nearest .wwjd.json "dials").
const { d: dialValues } = dialsFor(input.cwd || process.cwd());
const off = DIALS.map((d) => [d, stopOf(d, dialValues[d.key])]).filter(([d, i]) => !isDefault(d, i)).map(([d, i]) => `${d.name} ${i + 1} ${d.stops[i][0]}`);

say(
  `UI work: call the Skill tool with wwjd:ux now, before anything else` +
  (also.length ? ` (then ${also.join(" and ")})` : "") + `; it says what to read and do. Its rules and the Strictness hooks apply to every UI edit in this session.` +
  (off.length ? ` Dials: ${off.join(", ")}.` : "") + nudgeText,
);
