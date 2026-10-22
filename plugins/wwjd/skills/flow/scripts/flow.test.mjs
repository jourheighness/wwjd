import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { check, validate } from "./flow.mjs";

const FLOW = join(dirname(fileURLToPath(import.meta.url)), "flow.mjs");

// A screen with everything the checker wants, so a fixture only states what it breaks.
const S = (id, more = {}) => ({ id, title: id, job: `Do ${id}`, shot: `.wwjd/shots/${id}.png`, ...more });
const E = (from, to, kind = "forward") => ({ from, to, action: `Go to ${to}`, kind });
const J = (id, steps, more = {}) => ({ id, title: id, steps, goal: "Done", undoes: null, ...more });
const M = (screens, edges = [], journeys = []) => ({ v: 1, app: "Test", screens, edges, journeys });
const rules = (m, opts) => check(m, opts).map((f) => f.rule);
const only = (m, rule, opts) => check(m, opts).filter((f) => f.rule === rule);

const stilla = () => M(
  [
    S("pricing", { title: "Pricing page", job: "Pick the membership that fits", route: "/", entry: true, data: true, states: ["default", "empty", "loading", "error"] }),
    S("join", { title: "Welcome", job: "See the membership is active", terminal: true }),
    S("member", { title: "Membership", job: "See and manage the membership", entry: true }),
    S("cancel-review", { title: "Cancel membership", job: "Check what ends before cancelling", review: true, states: ["default", "error"] }),
    S("cancelled", { title: "Cancelled", job: "See the membership ended", terminal: true }),
  ],
  [E("pricing", "join"), E("join", "member"), E("member", "cancel-review"), E("cancel-review", "member", "back"), E("cancel-review", "cancelled", "destructive"), E("cancelled", "member", "undo")],
  [J("join", ["pricing", "join"], { goal: "Member" }), J("cancel", ["member", "cancel-review", "cancelled"], { goal: "Not a member", undoes: "join" })],
);
// Smallest clean app: an entry that leads to an end, which leads back.
const tiny = () => M([S("a", { entry: true }), S("b", { terminal: true })], [E("a", "b"), E("b", "a")], [J("go", ["a", "b"])]);

test("the Stilla example is clean: no findings at all", () => {
  assert.deepEqual(check(stilla()), []);
});

test("shape: bad ids, kinds and missing fields are errors; a valid model has none", () => {
  const m = M([{ id: "Bad Id", title: "x" }, S("a"), S("a")], [{ from: "a", to: "a", kind: "sideways" }], [{ id: "j", steps: "a" }]);
  const f = validate(m).findings.map((x) => x.what);
  assert.ok(f.some((w) => /has id "Bad Id"/.test(w)));
  assert.ok(f.some((w) => /share the id "a"/.test(w)));
  assert.ok(f.some((w) => /no job/.test(w)));
  assert.ok(f.some((w) => /kind "sideways"/.test(w)));
  assert.ok(f.some((w) => /"steps" is not a list/.test(w)));
  assert.deepEqual(validate(stilla()).findings, []);
  assert.equal(validate({ v: 1, app: "x", screens: {} }).ok, false);
});

test("unknown-ref: a way, a step or an undoes naming nothing", () => {
  const m = tiny(); m.edges.push(E("a", "ghost")); m.journeys.push(J("leave", ["a", "nowhere"], { undoes: "nope" }));
  assert.equal(only(m, "unknown-ref").length, 3);
  assert.deepEqual(only(tiny(), "unknown-ref"), []);
});

test("no-entry: nobody arrives anywhere", () => {
  const m = tiny(); m.screens[0].entry = false;
  assert.equal(only(m, "no-entry").length, 1);
  assert.deepEqual(only(tiny(), "no-entry"), []);
});

test("unreachable: a screen no path from an entry reaches", () => {
  const m = tiny(); m.screens.push(S("island", { terminal: true }));
  assert.deepEqual(only(m, "unreachable").map((f) => f.screen), ["island"]);
  assert.deepEqual(only(tiny(), "unreachable"), []);
});

test("dead-end: no way on and not an end", () => {
  const m = tiny(); m.screens[1].terminal = false; m.edges.pop();
  assert.deepEqual(only(m, "dead-end").map((f) => f.screen), ["b"]);
  assert.deepEqual(only(tiny(), "dead-end"), []);
});

test("journey-gap: two steps in a row with no way between them", () => {
  const m = M([S("a", { entry: true }), S("b"), S("c", { terminal: true })], [E("a", "b"), E("b", "c"), E("b", "a", "back")], [J("skip", ["a", "c"])]);
  assert.deepEqual(only(m, "journey-gap").map((f) => [f.journey, f.screen]), [["skip", "a"]]);
  m.journeys[0].steps = ["a", "b", "c"];
  assert.deepEqual(only(m, "journey-gap"), []);
});

test("no-way-back: a middle screen that cannot get home warns", () => {
  const m = M([S("a", { entry: true }), S("b"), S("c", { terminal: true })], [E("a", "b"), E("b", "c")]);
  const f = only(m, "no-way-back");
  assert.deepEqual(f.map((x) => [x.screen, x.severity]), [["b", "warn"]]);
  m.edges.push(E("b", "a", "back"));
  assert.deepEqual(only(m, "no-way-back"), []);
});

test("destructive-unguarded: no review step and no undo", () => {
  const m = M([S("a", { entry: true }), S("gone", { terminal: true })], [E("a", "gone", "destructive")]);
  assert.deepEqual(only(m, "destructive-unguarded").map((f) => f.screen), ["a"]);
  const reviewed = structuredClone(m); reviewed.screens[0].review = true;
  assert.deepEqual(only(reviewed, "destructive-unguarded"), []);
  const target = structuredClone(m); target.screens[1].review = true;
  assert.deepEqual(only(target, "destructive-unguarded"), []);
  const undone = structuredClone(m); undone.edges.push(E("gone", "a", "undo"));
  assert.deepEqual(only(undone, "destructive-unguarded"), []);
});

test("leaving-harder: undoing takes more steps than doing; review steps do not count", () => {
  const m = stilla(); m.screens.push(S("survey", { job: "Say why you leave" }));
  m.edges.push(E("member", "survey"), E("survey", "cancel-review"));
  m.journeys[1].steps = ["member", "survey", "cancel-review", "cancelled"];
  assert.deepEqual(only(m, "leaving-harder").map((f) => f.journey), ["cancel"]);
  assert.deepEqual(only(stilla(), "leaving-harder"), []);
});

test("missing-state: one warning per missing empty, loading or error state", () => {
  const m = tiny(); Object.assign(m.screens[0], { data: true, states: ["default", "loading"] });
  assert.deepEqual(only(m, "missing-state").map((f) => /no (\w+) state/.exec(f.what)[1]), ["empty", "error"]);
  m.screens[0].states.push("empty", "error");
  assert.deepEqual(only(m, "missing-state"), []);
});

test("long-journey: more than 7 steps", () => {
  const ids = "abcdefgh".split("");
  const m = M(ids.map((id, i) => S(id, { entry: i === 0, terminal: i === 7 })), ids.slice(1).map((id, i) => E(ids[i], id)), [J("long", ids)]);
  ids.slice(1).forEach((id) => m.edges.push(E(id, "a", "back")));
  assert.deepEqual(only(m, "long-journey").map((f) => f.journey), ["long"]);
  m.journeys[0].steps = ids.slice(0, 7);
  assert.deepEqual(only(m, "long-journey"), []);
});

test("trap: a loop you can enter but never leave, with no end in it", () => {
  const m = M([S("a", { entry: true }), S("x"), S("y"), S("done", { terminal: true })], [E("a", "x"), E("x", "y"), E("y", "x"), E("a", "done")]);
  const f = only(m, "trap");
  assert.equal(f.length, 1);
  assert.match(f[0].what, /x \(x\)|x, y/);
  assert.ok(!rules(m).includes("dead-end"));
  assert.ok(!only(m, "no-way-back").some((x) => ["x", "y"].includes(x.screen)), "a trapped screen is reported once");
  m.edges.push(E("y", "a", "back"));
  assert.deepEqual(only(m, "trap"), []);
});

test("no-shot: info, never an error", () => {
  const m = tiny(); delete m.screens[0].shot;
  assert.deepEqual(only(m, "no-shot").map((f) => [f.screen, f.severity]), [["a", "info"]]);
  assert.deepEqual(only(tiny(), "no-shot"), []);
});

test("orphan-decision: a logged decision names a screen not in the flow", () => {
  const decisions = [{ title: "Cut the stats row", screen: "dashboard" }, { title: "Price visible", screen: "a" }, { title: "No screen" }];
  assert.deepEqual(only(tiny(), "orphan-decision", { decisions }).map((f) => f.screen), ["dashboard"]);
  assert.deepEqual(only(tiny(), "orphan-decision", { decisions: decisions.slice(1) }), []);
});

test("leaving-harder: the way to a buried cancel counts too", () => {
  const m = stilla(); m.screens[2].entry = false;
  m.screens.push(S("home", { entry: true }), S("account", { job: "See the account" }), S("billing", { job: "See billing" }));
  m.edges.push(E("home", "account"), E("account", "billing"), E("billing", "member"), E("member", "home", "back"));
  assert.deepEqual(only(m, "leaving-harder").map((f) => f.journey), ["cancel"]);
  assert.match(only(m, "leaving-harder")[0].what, /takes 4 steps from where people arrive, but "join" took 2/);
});

test("review-no-change: a review with no way to change or keep is an error", () => {
  const m = stilla(); m.edges = m.edges.filter((e) => !(e.from === "cancel-review" && e.kind === "back"));
  assert.deepEqual(only(m, "review-no-change").map((f) => [f.screen, f.severity]), [["cancel-review", "error"]]);
  m.edges.push({ from: "cancel-review", to: "member", action: "Keep my membership", kind: "forward" });
  assert.deepEqual(only(m, "review-no-change"), []);
});

test("modal-no-dismiss: a modal needs a back or undo way out", () => {
  const m = tiny(); m.screens.push(S("sheet", { modal: true, terminal: true })); m.edges.push(E("a", "sheet"), E("sheet", "b"));
  assert.deepEqual(only(m, "modal-no-dismiss").map((f) => [f.screen, f.severity]), [["sheet", "error"]]);
  m.edges.push(E("sheet", "a", "back"));
  assert.deepEqual(only(m, "modal-no-dismiss"), []);
  assert.ok(validate(M([S("x", { modal: "yes" })])).findings.some((f) => /"modal" is not true or false/.test(f.what)));
});

test("no-failure-path: a commit with no error state or error way warns once per screen", () => {
  const m = stilla(); m.screens[3].states = ["default"];
  m.screens.push(S("gone", { terminal: true })); m.edges.push(E("cancel-review", "gone", "destructive"), E("gone", "member"));
  assert.deepEqual(only(m, "no-failure-path").map((f) => [f.screen, f.severity]), [["cancel-review", "warn"]]);
  m.edges.push(E("cancelled", "cancel-review", "error"));
  m.screens.at(-1).states = ["error"];
  assert.deepEqual(only(m, "no-failure-path"), []);
});

test("error-restarts: a failure sent back past the step that failed warns", () => {
  const m = M([S("cart", { entry: true }), S("address"), S("pay", { states: ["error"] }), S("done", { terminal: true })],
    [E("cart", "address"), E("address", "pay"), E("pay", "done", "destructive"), E("done", "cart"), E("pay", "address", "back"), E("address", "cart", "back"), E("pay", "cart", "error")],
    [J("buy", ["cart", "address", "pay", "done"])]);
  assert.deepEqual(only(m, "error-restarts").map((f) => [f.journey, f.screen]), [["buy", "pay"]]);
  m.edges.at(-1).to = "address";
  assert.deepEqual(only(m, "error-restarts"), []);
});

test("end-no-next: an end with nothing to do next warns", () => {
  const m = tiny(); m.edges.pop();
  assert.deepEqual(only(m, "end-no-next").map((f) => [f.screen, f.severity]), [["b", "warn"]]);
  assert.deepEqual(only(tiny(), "end-no-next"), []);
});

function project() {
  const root = mkdtempSync(join(tmpdir(), "wwjd-flow-"));
  const run = (...args) => spawnSync("node", [FLOW, ...args, "--root", root], { encoding: "utf8" });
  return { root, run };
}

test("cli check: text grouped by severity with a summary; exit 1 on errors, 0 when clean", () => {
  const p = project();
  const m = stilla(); delete m.screens[0].shot; m.screens[1].terminal = false; m.edges = m.edges.filter((e) => e.from !== "join");
  writeFileSync(join(p.root, "wwjd.flow.json"), JSON.stringify(m));
  mkdirSync(join(p.root, ".wwjd"));
  writeFileSync(join(p.root, ".wwjd", "decisions.jsonl"), JSON.stringify({ title: "x", screen: "ghost" }) + "\nnot json\n");
  const r = p.run("check");
  assert.equal(r.status, 1);
  const lines = r.stdout.trim().split("\n");
  assert.deepEqual(lines.slice(0, -1).map((l) => l.split(" ")[0]), ["error", "warn", "info"]);
  assert.equal(lines.at(-1), "flow: 5 screens, 2 journeys, 1 errors, 1 warnings");
  const j = JSON.parse(p.run("--json").stdout);
  assert.deepEqual([j.screens, j.journeys, j.findings.map((f) => f.rule)], [5, 2, ["dead-end", "orphan-decision", "no-shot"]]);
  writeFileSync(join(p.root, "wwjd.flow.json"), JSON.stringify(stilla()));
  rmDecisions(p.root);
  const ok = p.run();
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout.trim(), "flow: 5 screens, 2 journeys, 0 errors, 0 warnings");
});
const rmDecisions = (root) => writeFileSync(join(root, ".wwjd", "decisions.jsonl"), "");

test("cli check: a missing or broken file is an error, not a crash", () => {
  const p = project();
  assert.equal(p.run().status, 1);
  writeFileSync(join(p.root, "wwjd.flow.json"), "{ nope");
  const r = p.run();
  assert.equal(r.status, 1);
  assert.match(r.stdout, /not valid JSON/);
  assert.equal(p.run("frobnicate").status, 2);
});

test("cli init: writes a starter that checks, and never overwrites", () => {
  const p = project();
  const r = p.run("init");
  assert.equal(r.status, 0);
  const file = r.stdout.trim();
  assert.equal(file, join(p.root, "wwjd.flow.json"));
  const m = JSON.parse(readFileSync(file, "utf8"));
  assert.equal(m.screens.length, 1);
  assert.equal(m.screens[0].entry, true);
  assert.deepEqual(m.journeys[0].steps, []);
  assert.deepEqual(validate(m).findings, []);
  assert.equal(p.run("init").status, 1);
  assert.ok(existsSync(file));
});

test("a flow file holding null is a shape error, never a clean report", () => {
  const dir = mkdtempSync(join(tmpdir(), "wwjd-flow-null-"));
  writeFileSync(join(dir, "wwjd.flow.json"), "null");
  const r = spawnSync("node", [FLOW, "check", "--json", "--root", dir], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.equal(JSON.parse(r.stdout).findings[0].rule, "shape");
});

test("a non-list states never crashes the checker", () => {
  const m = { v: 1, screens: [{ id: "a", title: "A", job: "x", entry: true, states: 3 }, { id: "b", title: "B", job: "x", terminal: true, review: true, states: {} }],
    edges: [{ from: "a", to: "b", action: "Delete", kind: "destructive" }, { from: "b", to: "a", action: "Back", kind: "back" }], journeys: [{ id: "j", title: "J", steps: ["a", "b"], goal: "g" }] };
  assert.doesNotThrow(() => check(m));
});
