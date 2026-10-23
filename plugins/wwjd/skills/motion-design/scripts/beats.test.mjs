// node --test skills/motion-design/scripts/beats.test.mjs: the beat-sheet checker on the mistakes it exists for.
import { test } from "node:test";
import assert from "node:assert/strict";
import { check, holdFor, table } from "./beats.mjs";

const base = (shots, extra = {}) => ({
  message: "Publish once, every format", abt: { and: "a", but: "b", therefore: "c" }, end: "the filled card", plays: "once", pause: true, shots, ...extra,
});
const rules = (m) => check(m).map((f) => f.rule);
const shot = (id, at, end, more = {}) => ({ id, at, end, subject: id, change: "a → b", out: { kind: "cut", why: "next step" }, ...more });

test("a calm piece is clean", () => {
  const m = base([
    shot("one", 0, 4, { moves: [{ what: "card", kind: "enter", at: 0.2, dur: 0.8 }, { what: "card", kind: "hold", at: 1, dur: 2.5 }] }),
    shot("two", 4, 9, { text: "Publish once", textAt: 4.1, textOut: 6.2, moves: [{ what: "button", kind: "change", at: 6.4, dur: 0.4 }, { what: "rows", kind: "enter", at: 7.2, dur: 0.8 }] }),
    shot("end", 9, 12, { moves: [{ what: "rows", kind: "change", at: 9.1, dur: 0.6 }] }),
  ]);
  assert.deepEqual(check(m), []);
});

test("two things travelling at once, and the camera with a subject, are errors; a follow camera is not", () => {
  const two = base([shot("a", 0, 6, { moves: [{ what: "card", kind: "enter", at: 0.2, dur: 0.8 }, { what: "chip", kind: "move", at: 0.5, dur: 0.8 }] })]);
  assert.ok(rules(two).includes("one-mover"));
  const both = base([shot("a", 0, 6, { moves: [{ what: "camera", kind: "camera", at: 0.2, dur: 1.5 }, { what: "card", kind: "move", at: 0.6, dur: 0.8 }] })]);
  assert.ok(rules(both).includes("camera-and-subject"));
  const follow = base([shot("a", 0, 6, { moves: [{ what: "camera", kind: "camera", follow: true, at: 0.2, dur: 1.5 }, { what: "values", kind: "move", at: 0.2, dur: 1.4 }] })]);
  assert.ok(!rules(follow).some((r) => r === "one-mover" || r === "camera-and-subject"));
});

test("text: too short a hold and a camera moving under it are errors; long lines warn", () => {
  assert.equal(holdFor("Publish once"), 1.5);
  assert.equal(Math.round(holdFor("Your data is spread over many PDFs") * 10) / 10, 2.6);
  const m = base([shot("a", 0, 6, { text: "Your data is spread over many PDFs and sheets today", textAt: 0.2, textOut: 1.4, moves: [{ what: "camera", kind: "camera", at: 1, dur: 1.5 }] })]);
  const r = rules(m);
  assert.ok(r.includes("text-hold") && r.includes("text-under-move") && r.includes("text-words"), r.join(", "));
});

test("timing: no final hold, no Pause, dead time, a 0.3 s beat gap and a glitch-fast move", () => {
  const m = base([
    shot("a", 0, 5, { moves: [{ what: "card", kind: "enter", at: 0.2, dur: 0.3 }, { what: "chip", kind: "enter", at: 0.5, dur: 0.6 }] }),
    shot("b", 5, 9, { moves: [{ what: "rows", kind: "enter", at: 8.5, dur: 0.5 }] }),
  ], { pause: false });
  const r = rules(m);
  for (const k of ["final-hold", "pause", "dead-time", "beat-gap", "move-short"]) assert.ok(r.includes(k), `${k} in ${r.join(", ")}`);
});

test("story and shots: no message, no reason out, four equal beats, big moments back to back, a late hook", () => {
  const m = {
    plays: "once", pause: true,
    shots: [0, 1, 2, 3, 4].map((i) => ({ id: `s${i}`, at: i * 3, end: i * 3 + 3, big: i === 1 || i === 2, moves: [{ what: `x${i}`, kind: "enter", at: i * 3 + 1.5, dur: 0.6 }] })),
  };
  m.shots.at(-1).end = 17;
  const r = rules(m);
  for (const k of ["message", "abt", "end", "transition", "subject", "change", "rhythm", "big", "hook"]) assert.ok(r.includes(k), `${k} in ${r.join(", ")}`);
});

test("errors sort first, and the table shows the holds the owner reads", () => {
  const m = base([shot("a", 0, 3, { text: "Publish once", textAt: 2, moves: [{ what: "a", kind: "enter", at: 0.2, dur: 0.3 }] })], { pause: false });
  const F = check(m);
  assert.equal(F[0].severity, "error");
  assert.match(table(m), /\| 1 \| 0-3 \|.*"Publish once" \(1\.5 s\)/);
});
