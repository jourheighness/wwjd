#!/usr/bin/env node
// beats.mjs: the beat sheet of an art-directed motion piece (motion.beats.json), checked before any animation code.
//
// Usage: node beats.mjs <command> [file]   (default file: ./motion.beats.json)
//   check   the story, shot, staging and timing rules (SKILL.md S, ST, O, T, X, E): errors first. Exit 1 on errors.
//   table   the beat sheet as a Markdown table, the one to show the owner for approval
//   init    write a starter motion.beats.json (never overwrites)
//   --json  machine output for check
// Times are seconds from the start of the piece, every time absolute. The format: references/workflow.md.
// No deps, Node 20.10+.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const cmd = args[0];
const json = args.includes("--json");
const file = resolve(args.slice(1).find((a) => !a.startsWith("--")) || "motion.beats.json");

const TRAVEL = new Set(["enter", "exit", "move", "camera"]);
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const round = (n) => Math.round(n * 100) / 100;
/** How long a line must stay readable once it has stopped moving (T3). */
export const holdFor = (text) => Math.max(1.5, 0.5 + 0.3 * words(text));
const SETTLE = 0.3; // a line is read from when it stops moving, ~0.3 s after it starts entering

/** Every finding for a beat sheet, errors first: { rule, severity, what, fix }. */
export function check(m) {
  const F = [];
  const add = (rule, severity, what, fix) => F.push({ rule, severity, what, fix });
  if (!m || typeof m !== "object" || !Array.isArray(m.shots) || !m.shots.length) {
    add("shape", "error", "No shots.", "Write one row per shot in shots[] (references/workflow.md).");
    return F;
  }
  const shots = m.shots;
  for (const [i, s] of shots.entries()) {
    if (!(typeof s.at === "number" && typeof s.end === "number" && s.end > s.at)) add("shape", "error", `Shot ${s.id ?? i + 1} needs at < end, in seconds.`, "Give every shot numeric at and end.");
  }
  if (F.length) return F;
  const total = typeof m.length === "number" ? m.length : Math.max(...shots.map((s) => s.end));
  const plays = m.plays || "once";
  const name = (s) => s.id || `shot ${shots.indexOf(s) + 1}`;
  const moves = shots.flatMap((s) => (Array.isArray(s.moves) ? s.moves : []).map((mv) => ({ ...mv, shot: s, from: mv.at, to: mv.at + (mv.dur || 0) })))
    .filter((mv) => typeof mv.at === "number");

  // ── story (S) ──
  if (!m.message) add("message", "error", "No message: the one sentence the piece says.", "Write message (≤ 15 words) before the shots (SKILL.md S1).");
  else if (words(m.message) > 15) add("message", "warn", `The message runs ${words(m.message)} words.`, "Cut it to one idea in ≤ 15 words.");
  if (!m.abt?.but || !m.abt?.therefore) add("abt", "warn", "No But and Therefore: the piece is a list, not a story.", "Write abt.and, abt.but and abt.therefore, one sentence each (S2).");
  if (!m.end) add("end", "warn", "The last frame is not described.", "Write end: the final frame as a still that reads with no motion and no sound (S5).");
  if (m.carry) {
    const share = shots.filter((s) => s.carries).length / shots.length;
    if (share < 0.6) add("carry", "warn", `"${m.carry}" is in ${Math.round(share * 100)}% of the shots.`, "Carry one object through most shots, problem to payoff (S4), or mark the shots it is in (carries: true).");
  }
  const first = Math.min(...moves.map((mv) => mv.from), ...shots.filter((s) => s.text).map((s) => s.textAt ?? s.at));
  if (plays !== "scroll" && first > 1) add("hook", "warn", `Nothing happens until ${round(first)} s.`, "Put the subject on screen by 1 s (S6).");

  // ── shots (ST) ──
  const sorted = [...shots].sort((a, b) => a.at - b.at);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].at - sorted[i - 1].end;
    if (gap < -0.01) add("shape", "error", `${name(sorted[i - 1])} and ${name(sorted[i])} overlap by ${round(-gap)} s.`, "One shot at a time: end one where the next starts.");
  }
  for (const s of shots) {
    const d = s.end - s.at;
    const last = s === sorted.at(-1);
    if (plays !== "scroll" && !last && (d < 2 || d > 8)) add("shot-length", "warn", `${name(s)} runs ${round(d)} s.`, d < 2 ? "Too fast to read: merge it or give it 3-6 s (ST2)." : "Split it: one subject, one action, one change (ST1).");
    if (!s.subject) add("subject", "warn", `${name(s)} names no subject.`, "Name the one thing the eye should be on (ST1).");
    if (!s.change) add("change", "warn", `${name(s)} names no change.`, "Name its before → after; a shot that changes nothing is cut (ST1).");
    if (!last && !s.out?.why) add("transition", "warn", `The way out of ${name(s)} has no reason.`, "Say why: same object, next step, the camera follows, or unrelated (ST4).");
  }
  const big = sorted.filter((s) => s.big);
  if (big.length > 2) add("big", "warn", `${big.length} big moments.`, "Keep at most 2 (ST5).");
  for (let i = 1; i < sorted.length; i++) if (sorted[i].big && sorted[i - 1].big) add("big", "warn", `${name(sorted[i - 1])} and ${name(sorted[i])} are big moments back to back.`, "Put a quiet shot between them (ST5).");
  if (plays !== "scroll" && shots.length / (total / 60) > 20) add("pace", "warn", `${Math.round(shots.length / (total / 60))} shots a minute.`, "Story pieces run 8-20 a minute; give each shot room (ST2).");
  for (let i = 3; i < sorted.length; i++) {
    const run = sorted.slice(i - 3, i + 1).map((s) => s.end - s.at);
    if (Math.max(...run) - Math.min(...run) < 0.15) { add("rhythm", "warn", `Four shots of the same length in a row, from ${name(sorted[i - 3])}.`, "Vary the beats; tighten toward the payoff (T7)."); break; }
  }

  // ── on screen at once (O) ──
  const travel = moves.filter((mv) => TRAVEL.has(mv.kind) && mv.to > mv.from);
  // Sweep: at any moment at most one thing travels; a camera that follows may carry one subject with it.
  const points = [...new Set(travel.flatMap((mv) => [mv.from, mv.to]))].sort((a, b) => a - b);
  const told = new Set();
  for (let i = 0; i < points.length - 1; i++) {
    const t = (points[i] + points[i + 1]) / 2;
    if (points[i + 1] - points[i] < 0.1) continue; // a hand-over, not two movers
    const on = travel.filter((mv) => mv.from < t && mv.to > t);
    const follows = on.some((mv) => mv.kind === "camera" && mv.follow);
    const camera = on.some((mv) => mv.kind === "camera");
    const subjects = on.filter((mv) => mv.kind !== "camera");
    const tooMany = follows ? subjects.length > 1 : subjects.length > 1 || (camera && subjects.length > 0);
    if (!tooMany) continue;
    const key = on.map((mv) => mv.what).sort().join("|");
    if (told.has(key)) continue;
    told.add(key);
    add(camera && subjects.length === 1 ? "camera-and-subject" : "one-mover", "error",
      `At ${round(t)} s ${on.map((mv) => `${mv.what || "?"} (${mv.kind})`).join(", ")} move at once.`,
      camera && subjects.length === 1 ? "Move the camera or the subject, never both; a camera that rides with what it follows says follow: true (O2)." : "One thing travels at a time; the rest hold or change in place (O1).");
  }
  for (const s of shots) {
    // a camera that follows rides with its subject: one mover
    const early = new Set(moves.filter((mv) => mv.shot === s && mv.from < s.at + 0.5 && mv.kind !== "hold" && !(mv.kind === "camera" && mv.follow)).map((mv) => mv.what));
    if (s !== sorted[0] && early.size > 1) add("quiet-after-cut", "warn", `${name(s)} starts ${early.size} things in its first 0.5 s.`, "After a cut only the new subject moves for 0.5 s (O3).");
  }
  const starts = travel.filter((mv) => mv.kind !== "exit").sort((a, b) => a.from - b.from);
  for (let i = 1; i < starts.length; i++) {
    const gap = starts[i].from - starts[i - 1].from;
    if (gap > 0.15 && gap < 0.5 && starts[i].what !== starts[i - 1].what) add("beat-gap", "warn", `${starts[i - 1].what} and ${starts[i].what} start ${round(gap)} s apart.`, "Land two beats together (< 0.1 s) or ≥ 0.5 s apart; between, the second is missed (T4).");
  }

  // ── text (X, T3) ──
  for (const s of shots.filter((x) => x.text)) {
    const n = words(s.text);
    if (n > 8) add("text-words", "warn", `${name(s)}: "${s.text}" is ${n} words on one line.`, "≤ 8 words a line; a longer thought is two lines (T3).");
    const from = (s.textAt ?? s.at) + SETTLE, to = s.textOut ?? s.end;
    const need = holdFor(s.text);
    if (to - from < need - 0.01) add("text-hold", "error", `${name(s)}: "${s.text}" is readable for ${round(Math.max(0, to - from))} s; it needs ${round(need)} s.`, `Hold it ${round(need)} s after it settles (0.5 s + 0.3 s a word, at least 1.5 s) or cut words (T3).`);
    const under = travel.find((mv) => mv.kind === "camera" && mv.from < to && mv.to > from);
    if (under) add("text-under-move", "error", `${name(s)}: the camera moves (${round(under.from)}-${round(under.to)} s) while "${s.text}" is read.`, "Keep the camera out of reading holds: the line goes first, then the camera moves (O5).");
  }

  // ── timing (T) ──
  const enters = travel.filter((mv) => mv.kind === "enter").map((mv) => mv.to - mv.from).sort((a, b) => a - b);
  const medianEnter = enters.length ? enters[Math.floor(enters.length / 2)] : null;
  for (const mv of travel) {
    const d = mv.to - mv.from;
    if ((mv.kind === "enter" || mv.kind === "move") && d < 0.4) add("move-short", "warn", `${mv.what} ${mv.kind}s in ${round(d)} s.`, "A story move takes 0.5-0.9 s; under 0.4 s it reads as a glitch (T1).");
    if ((mv.kind === "enter" || mv.kind === "move") && d > 1.6) add("move-long", "warn", `${mv.what} ${mv.kind}s for ${round(d)} s.`, "Longer than a scene change; shorten it or make it the camera's move (T1).");
    if (mv.kind === "camera" && d < 0.8) add("move-short", "warn", `A camera move of ${round(d)} s.`, "Camera moves take 1.2-2 s; a fast camera loses the eye (T1).");
    if (mv.kind === "exit" && medianEnter && d > medianEnter * 0.9) add("exit-long", "warn", `${mv.what} leaves in ${round(d)} s, as slow as things enter.`, "Exits take ~2/3 of the entrance: nobody waits to watch something leave (T2).");
  }
  // Dead time: nothing moving, no line being read, no declared hold. The final hold is its own rule.
  const lastMove = Math.max(...moves.filter((mv) => mv.kind !== "hold").map((mv) => mv.to), 0);
  const busy = [
    ...moves.map((mv) => [mv.from, mv.to]),
    ...shots.filter((s) => s.text).map((s) => [s.textAt ?? s.at, s.textOut ?? s.end]),
  ].sort((a, b) => a[0] - b[0]);
  let reach = Math.min(0, ...busy.map((b) => b[0]));
  for (const [a, b] of busy) {
    if (a - reach > 1.2 && reach < lastMove) add("dead-time", "warn", `Nothing happens from ${round(reach)} to ${round(a)} s.`, "Cut the gap, or declare a beat meant to be seen ({ kind: \"hold\" }) (T6).");
    reach = Math.max(reach, b);
  }
  if (plays !== "scroll") {
    const hold = total - lastMove;
    if (hold < 2 - 0.01) add("final-hold", "error", `The piece is still for ${round(Math.max(0, hold))} s at the end.`, "End on the payoff, everything still, for at least 2 s (T7, E1).");
  }

  // ── endings and access (E) ──
  if ((plays === "once" || plays === "loop") && total > 5 && m.pause !== true) add("pause", "error", `${round(total)} s of motion with no Pause.`, "Over 5 s needs a visible Pause that stops everything (E2); set pause: true once it has one.");
  if (plays === "loop" && total > 34) add("loop-length", "warn", `A ${round(total)} s loop.`, "Loops run ≤ 34 s (E1).");
  const SEV = ["error", "warn"];
  return F.sort((a, b) => SEV.indexOf(a.severity) - SEV.indexOf(b.severity));
}

/** The beat sheet as a Markdown table for the owner. */
export function table(m) {
  const head = `**${m.title || "Beat sheet"}**: ${m.message || "(no message)"}\n` +
    (m.abt ? `And ${m.abt.and || "…"} · But ${m.abt.but || "…"} · Therefore ${m.abt.therefore || "…"}\n` : "") +
    (m.end ? `Ends on: ${m.end}\n` : "") + "\n";
  const rows = [...m.shots].sort((a, b) => a.at - b.at).map((s, i) => [
    i + 1, `${s.at}-${s.end}`, s.beat || "", s.subject || "", s.action || "", s.change || "",
    s.text ? `"${s.text}" (${round(holdFor(s.text))} s)` : "—", s.camera || "hold", s.out ? `${s.out.kind || ""}${s.out.why ? `: ${s.out.why}` : ""}` : "—",
  ].join(" | "));
  return head + "| # | s | beat | subject | action | change | text (hold) | camera | out (why) |\n|---|---|---|---|---|---|---|---|---|\n" + rows.map((r) => `| ${r} |`).join("\n") + "\n";
}

const STARTER = {
  v: 1,
  title: "Hero",
  message: "Your product data, in every format, from one place",
  abt: { and: "Suppliers send product data as PDFs and sheets", but: "every distributor wants it in their own format", therefore: "publish once and each gets it their way" },
  contract: "because the person publishes once, the product converts each value, giving every distributor their format",
  carry: "the product card",
  end: "The card with every distributor's row filled, headline beside it",
  plays: "once",
  pause: true,
  shots: [
    { id: "problem", at: 0, end: 4, beat: "but", subject: "a pile of PDFs", action: "they land on the desk", change: "empty desk → a pile", carries: false, out: { kind: "pan", why: "next step: to where they go" },
      moves: [{ what: "pdfs", kind: "enter", at: 0.2, dur: 0.8 }, { what: "pile", kind: "hold", at: 1, dur: 2.5 }] },
    { id: "solution", at: 4, end: 8, beat: "therefore", subject: "the product card", action: "the hand presses Publish", change: "draft → published", carries: true, text: "Publish once", textAt: 4.2, textOut: 6.4, out: { kind: "camera", why: "the camera follows the data" },
      moves: [{ what: "card", kind: "enter", at: 4.1, dur: 0.8 }, { what: "publish", kind: "change", at: 6.6, dur: 0.4 }] },
    { id: "payoff", at: 8, end: 12.5, beat: "payoff", subject: "the filled rows", action: "values land in each row", change: "missing → filled", carries: true, camera: "follow",
      moves: [{ what: "camera", kind: "camera", follow: true, at: 8, dur: 1.6 }, { what: "values", kind: "move", at: 8.1, dur: 1.4 }] },
  ],
};

if (process.argv[1]?.endsWith("beats.mjs")) {
  if (cmd === "init") {
    if (existsSync(file)) { console.error(`beats: ${file} exists; nothing written`); process.exit(1); }
    writeFileSync(file, JSON.stringify(STARTER, null, 2) + "\n");
    console.log(`beats: wrote ${file} (an example; replace every row)`);
    process.exit(0);
  }
  if (cmd !== "check" && cmd !== "table") {
    console.error("usage: node beats.mjs check|table|init [motion.beats.json] [--json]");
    process.exit(2);
  }
  let m;
  try { m = JSON.parse(readFileSync(file, "utf8")); }
  catch (e) { console.error(`beats: can't read ${file} (${e.message.split("\n")[0]}); node beats.mjs init starts one`); process.exit(2); }
  if (cmd === "table") { console.log(table(m)); process.exit(0); }
  const F = check(m);
  const errors = F.filter((f) => f.severity === "error").length;
  if (json) console.log(JSON.stringify({ file, errors, warnings: F.length - errors, findings: F }, null, 2));
  else {
    for (const f of F) console.log(`${f.severity === "error" ? "✗" : "!"} ${f.rule}: ${f.what} ${f.fix}`);
    console.log(`beats: ${errors} errors, ${F.length - errors} warnings`);
  }
  process.exit(errors ? 1 : 0);
}
