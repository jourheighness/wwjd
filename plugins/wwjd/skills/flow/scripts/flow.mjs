#!/usr/bin/env node
// flow.mjs: checks an app's UX structure (wwjd.flow.json at the project root) for flow bugs. No deps, Node 20.10+.
//   node flow.mjs [check] [--json] [--root <dir>]   findings by severity + a summary line; --json: {screens, journeys, findings}
//   node flow.mjs init [--root <dir>]               writes a starter wwjd.flow.json (never overwrites), prints its path
// Exit 1: an error finding (or init would overwrite). Exit 2: usage. Schema and rules: references/model.md.
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { artifactRoot, logRoot } from "../../ux/scripts/paths.mjs";

export const FILE = "wwjd.flow.json";
export const KINDS = ["forward", "back", "undo", "error", "destructive"];
const NEEDED_STATES = ["empty", "loading", "error"];
const LONG = 7;
const ID = /^[a-z0-9-]+$/;
const SEV = ["error", "warn", "info"];

const isStr = (v) => typeof v === "string" && v.trim() !== "";
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Shape problems as findings (rule "shape"). Returns { findings, ok } where ok means the rules can run. */
export function validate(m) {
  const out = [];
  const bad = (what, fix, at = {}) => out.push({ rule: "shape", severity: "error", ...at, what, fix });
  if (!isObj(m)) { bad("The flow file is not a JSON object.", `Start again with \`flow.mjs init\`.`); return { findings: out, ok: false }; }
  if (m.v !== 1) bad(`"v" is ${JSON.stringify(m.v)}, not 1.`, `Set "v": 1.`);
  if (!isStr(m.app)) bad(`"app" has no name.`, `Name the app in "app".`);
  for (const k of ["screens", "edges", "journeys"]) if (!Array.isArray(m[k])) bad(`"${k}" is not a list.`, `Make "${k}" a list, even an empty one.`);
  if (out.some((f) => /is not a list/.test(f.what))) return { findings: out, ok: false };

  const ids = new Set();
  m.screens.forEach((s, i) => {
    if (!isObj(s)) return bad(`Screen ${i + 1} is not an object.`, "Give it an id, a title and a job.");
    const at = isStr(s.id) ? { screen: s.id } : {};
    if (!isStr(s.id) || !ID.test(s.id)) bad(`Screen ${i + 1} has id ${JSON.stringify(s.id)}.`, "Use lowercase letters, digits and dashes.", at);
    else if (ids.has(s.id)) bad(`Two screens share the id "${s.id}".`, "Give each screen its own id.", at);
    else ids.add(s.id);
    if (!isStr(s.title)) bad(`Screen "${s.id}" has no title.`, "Add the name people see.", at);
    if (!isStr(s.job)) bad(`Screen "${s.id}" has no job.`, "Say the one thing a person does there.", at);
    for (const k of ["entry", "data", "review", "terminal", "modal"]) if (k in s && typeof s[k] !== "boolean") bad(`Screen "${s.id}": "${k}" is not true or false.`, `Set "${k}" to true or false.`, at);
    for (const k of ["route", "shot"]) if (k in s && s[k] !== null && typeof s[k] !== "string") bad(`Screen "${s.id}": "${k}" is not text.`, `Make "${k}" a string.`, at);
    if ("states" in s && !(Array.isArray(s.states) && s.states.every(isStr))) bad(`Screen "${s.id}": "states" is not a list of names.`, `List the states, like ["default", "empty"].`, at);
  });
  m.edges.forEach((e, i) => {
    if (!isObj(e)) return bad(`Way ${i + 1} is not an object.`, "Give it from, to, action and kind.");
    const name = `Way ${i + 1} (${e.from} to ${e.to})`;
    if (!isStr(e.from) || !isStr(e.to)) bad(`${name} is missing "from" or "to".`, "Name both screens by id.");
    if (!isStr(e.action)) bad(`${name} has no action.`, "Say what the person does to go there.");
    if (!KINDS.includes(e.kind)) bad(`${name} has kind ${JSON.stringify(e.kind)}.`, `Use one of: ${KINDS.join(", ")}.`);
  });
  const jids = new Set();
  m.journeys.forEach((j, i) => {
    if (!isObj(j)) return bad(`Journey ${i + 1} is not an object.`, "Give it an id, a title, steps and a goal.");
    const at = isStr(j.id) ? { journey: j.id } : {};
    if (!isStr(j.id) || !ID.test(j.id)) bad(`Journey ${i + 1} has id ${JSON.stringify(j.id)}.`, "Use lowercase letters, digits and dashes.", at);
    else if (jids.has(j.id)) bad(`Two journeys share the id "${j.id}".`, "Give each journey its own id.", at);
    else jids.add(j.id);
    if (!isStr(j.title)) bad(`Journey "${j.id}" has no title.`, "Name what the person sets out to do.", at);
    if (!isStr(j.goal)) bad(`Journey "${j.id}" has no goal.`, "Say what the person has at the end.", at);
    if (!(Array.isArray(j.steps) && j.steps.every(isStr))) bad(`Journey "${j.id}": "steps" is not a list of screen ids.`, "List the screens in order.", at);
    if ("undoes" in j && j.undoes !== null && !isStr(j.undoes)) bad(`Journey "${j.id}": "undoes" is not a journey id.`, `Name the journey it reverses, or null.`, at);
  });
  // The rules read only well-formed items; shape findings already name the rest.
  return { findings: out, ok: true };
}

/** Strongly connected components (Tarjan), each a list of ids. */
function components(ids, out) {
  let n = 0; const idx = new Map(), low = new Map(), on = new Set(), stack = [], res = [];
  const visit = (v) => {
    idx.set(v, n); low.set(v, n); n++; stack.push(v); on.add(v);
    for (const w of out.get(v)) {
      if (!idx.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); }
      else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
    }
    if (low.get(v) === idx.get(v)) { const c = []; let w; do { w = stack.pop(); on.delete(w); c.push(w); } while (w !== v); res.push(c); }
  };
  for (const v of ids) if (!idx.has(v)) visit(v);
  return res;
}

function reach(starts, next) {
  const seen = new Set(starts), q = [...starts];
  while (q.length) for (const w of next.get(q.shift()) || []) if (!seen.has(w)) { seen.add(w); q.push(w); }
  return seen;
}

/** Every finding for a model. `decisions`: parsed .wwjd/decisions.jsonl entries. */
export function check(m, { decisions = [] } = {}) {
  const v = validate(m);
  if (!v.ok) return v.findings;
  const F = [...v.findings];
  const add = (rule, severity, at, what, fix) => F.push({ rule, severity, ...at, what, fix });

  const screens = m.screens.filter((s) => isObj(s) && isStr(s.id) && ID.test(s.id));
  const by = new Map(screens.map((s) => [s.id, s]));
  const name = (id) => (by.get(id)?.title ? `${by.get(id).title} (${id})` : id);
  const journeys = m.journeys.filter((j) => isObj(j) && isStr(j.id) && Array.isArray(j.steps));
  const jby = new Map(journeys.map((j) => [j.id, j]));

  // 1 unknown-ref
  const edges = [];
  for (const e of m.edges.filter((e) => isObj(e) && isStr(e.from) && isStr(e.to))) {
    const miss = [e.from, e.to].filter((id) => !by.has(id));
    for (const id of miss) add("unknown-ref", "error", {}, `The way "${e.action ?? ""}" from ${e.from} to ${e.to} names "${id}", which is not a screen.`, `Add the screen "${id}" or fix the way.`);
    if (!miss.length) edges.push(e);
  }
  for (const j of journeys) {
    for (const id of j.steps) if (!by.has(id)) add("unknown-ref", "error", { journey: j.id }, `Journey "${j.title}" steps through "${id}", which is not a screen.`, `Add the screen "${id}" or fix the step.`);
    if (isStr(j.undoes) && !jby.has(j.undoes)) add("unknown-ref", "error", { journey: j.id }, `Journey "${j.title}" reverses "${j.undoes}", which is not a journey.`, `Add the journey "${j.undoes}" or fix "undoes".`);
  }

  const out = new Map(screens.map((s) => [s.id, []])), back = new Map(screens.map((s) => [s.id, []]));
  for (const e of edges) { out.get(e.from).push(e.to); back.get(e.to).push(e.from); }
  const entries = screens.filter((s) => s.entry === true).map((s) => s.id);

  // 2 no-entry
  if (screens.length && !entries.length) add("no-entry", "error", {}, "No screen is marked as where people arrive.", `Set "entry": true on the screens people land on.`);

  // 3 unreachable
  const reached = reach(entries, out);
  if (entries.length) for (const s of screens) if (!reached.has(s.id))
    add("unreachable", "error", { screen: s.id }, `Nobody can get to ${name(s.id)} from where people arrive.`, "Add a way to it from a screen people reach, or cut it.");

  // 4 dead-end
  const dead = new Set(screens.filter((s) => !out.get(s.id).length && s.terminal !== true).map((s) => s.id));
  for (const id of dead) add("dead-end", "error", { screen: id }, `${name(id)} has no way onward and is not an end.`, `Add the next step or a way back; if it really is an end, like a confirmation, set "terminal": true.`);

  // 5 journey-gap
  for (const j of journeys) for (let i = 1; i < j.steps.length; i++) {
    const [a, b] = [j.steps[i - 1], j.steps[i]];
    if (by.has(a) && by.has(b) && !out.get(a).includes(b))
      add("journey-gap", "error", { journey: j.id, screen: a }, `Journey "${j.title}" goes from ${name(a)} to ${name(b)}, but nothing on ${name(a)} leads there.`, `Add the action on ${name(a)} that takes people to ${name(b)}.`);
  }

  // 11 trap (computed before 6 so a screen is reported once)
  const trapped = new Set();
  for (const c of components(screens.map((s) => s.id), out)) {
    const inC = new Set(c);
    if (c.some((id) => out.get(id).some((w) => !inC.has(w)))) continue; // has a way out
    if (c.some((id) => by.get(id).terminal === true)) continue;
    if (c.length === 1 && !out.get(c[0]).length) continue; // a lone screen with no way on: dead-end already
    const enterable = c.some((id) => entries.includes(id) || back.get(id).some((w) => !inC.has(w)));
    if (!enterable) continue;
    c.forEach((id) => trapped.add(id));
    const ord = screens.map((s) => s.id).filter((id) => inC.has(id));
    add("trap", "error", { screen: ord[0] }, `Once in ${ord.map(name).join(", ")}, people can move around but never get out, and none of it is an end.`, "Add a way out to the rest of the app, or mark the real end as terminal.");
  }

  // 6 no-way-back
  const home = reach(entries, back);
  if (entries.length) for (const s of screens)
    if (s.entry !== true && s.terminal !== true && !home.has(s.id) && !dead.has(s.id) && !trapped.has(s.id))
      add("no-way-back", "warn", { screen: s.id }, `From ${name(s.id)} there is no way back to where people started.`, "Add a back or cancel action that leads home.");

  // 7 destructive-unguarded: guarded by a review step on either side, or an undo from where it lands
  for (const e of edges.filter((e) => e.kind === "destructive")) {
    const [a, b] = [by.get(e.from), by.get(e.to)];
    const undo = edges.some((x) => x.from === e.to && x.kind === "undo");
    if (a.review !== true && b.review !== true && !undo)
      add("destructive-unguarded", "error", { screen: e.from }, `"${e.action}" from ${name(e.from)} to ${name(e.to)} cannot be taken back and has no review step.`, `Put a review step before it ("review": true), or add an undo from ${name(e.to)}.`);
  }

  // 8 leaving-harder: counted from where people arrive, so a cancel buried in settings costs its depth too.
  // A review step the Floor asks for is not a hurdle, so it does not count on either side.
  const depth = new Map(entries.map((id) => [id, 0])), dq = [...entries];
  while (dq.length) { const v = dq.shift(); for (const w of out.get(v)) if (!depth.has(w)) { depth.set(w, depth.get(v) + 1); dq.push(w); } }
  const effort = (j) => (depth.get(j.steps[0]) ?? 0) + j.steps.filter((id) => by.get(id)?.review !== true).length;
  for (const j of journeys) {
    const k = isStr(j.undoes) && jby.get(j.undoes);
    if (k && effort(j) > effort(k))
      add("leaving-harder", "error", { journey: j.id }, `"${j.title}" takes ${effort(j)} steps from where people arrive, but "${k.title}" took ${effort(k)}.`, `Cut "${j.title}" to ${effort(k)} steps or fewer, counting the way to its first screen and leaving review steps aside.`);
  }

  // 14 review-no-change: a review must let people correct or keep what they have (WCAG 3.3.4, GOV.UK check answers)
  for (const s of screens.filter((s) => s.review === true)) {
    const earlier = new Set(back.get(s.id));
    for (const j of journeys) { const i = j.steps.indexOf(s.id); if (i > 0) j.steps.slice(0, i).forEach((id) => earlier.add(id)); }
    const ok = edges.some((e) => e.from === s.id && (e.kind === "back" || e.kind === "undo" || (e.to !== s.id && earlier.has(e.to))));
    if (!ok && earlier.size)
      add("review-no-change", "error", { screen: s.id }, `${name(s.id)} reviews what is about to happen but offers no way to change it or keep things as they are.`, `Add a Change or Cancel way from ${name(s.id)} back to the step it reviews.`);
  }

  // 15 modal-no-dismiss: every modal has an obvious way to close it (Apple HIG Modality; NN/g emergency exit)
  for (const s of screens.filter((s) => s.modal === true))
    if (!edges.some((e) => e.from === s.id && (e.kind === "back" || e.kind === "undo")))
      add("modal-no-dismiss", "error", { screen: s.id }, `${name(s.id)} is a modal with no way to close it.`, `Add a Cancel or Close way ("kind": "back") from ${name(s.id)}.`);

  // 16 no-failure-path: a commit that can fail needs somewhere to go when it does (NN/g heuristic 9; Baymard declined cards)
  const failing = new Set();
  for (const e of edges.filter((e) => e.kind === "destructive")) {
    const handled = [e.from, e.to].some((id) => (Array.isArray(by.get(id).states) && by.get(id).states.includes("error")) || edges.some((x) => x.from === id && x.kind === "error"));
    if (!handled && !failing.has(e.from)) {
      failing.add(e.from);
      add("no-failure-path", "warn", { screen: e.from }, `"${e.action}" on ${name(e.from)} can fail, and nothing says what people see when it does.`, `Add an "error" state to ${name(e.from)}, or an "error" way back to the step that failed, with the data kept.`);
    }
  }

  // 17 error-restarts: a failure goes back to the step that failed, not further (GOV.UK question pages; Baymard)
  for (const e of edges.filter((e) => e.kind === "error")) for (const j of journeys) {
    const [a, b] = [j.steps.indexOf(e.from), j.steps.indexOf(e.to)];
    if (a >= 0 && b >= 0 && b < a - 1) {
      add("error-restarts", "warn", { journey: j.id, screen: e.from }, `When "${e.action}" fails on ${name(e.from)}, people go back to ${name(e.to)}, ${a - b} steps earlier in "${j.title}".`, `Send the failure back to the step that failed, with what people entered kept.`);
      break;
    }
  }

  // 18 end-no-next: an end offers the next sensible step (GOV.UK confirmation pages)
  for (const s of screens.filter((s) => s.terminal === true && !out.get(s.id).length))
    add("end-no-next", "warn", { screen: s.id }, `${name(s.id)} is an end with nothing to do next.`, "Offer the next sensible step: the record, tracking, another one, or back to where they started.");

  // 9 missing-state
  for (const s of screens.filter((s) => s.data === true)) {
    const have = new Set(Array.isArray(s.states) ? s.states : []);
    for (const st of NEEDED_STATES) if (!have.has(st))
      add("missing-state", "warn", { screen: s.id }, `${name(s.id)} shows loaded data but has no ${st} state.`, `Design what ${name(s.id)} shows when ${{ empty: "there is nothing yet", loading: "data is on its way", error: "loading fails" }[st]}, and add "${st}" to its states.`);
  }

  // 10 long-journey
  for (const j of journeys) if (j.steps.length > LONG)
    add("long-journey", "warn", { journey: j.id }, `"${j.title}" takes ${j.steps.length} steps.`, `Cut steps nobody needs and branch so each person sees only theirs; a long form people finish over several sittings becomes a task list (GOV.UK).`);

  // 12 no-shot
  for (const s of screens) if (!isStr(s.shot))
    add("no-shot", "info", { screen: s.id }, `${name(s.id)} has no screenshot, so the canvas cannot show it.`, `Set "shot" once it is built.`);

  // 13 orphan-decision
  for (const d of decisions) if (isObj(d) && isStr(d.screen) && !by.has(d.screen))
    add("orphan-decision", "warn", { screen: d.screen }, `A logged decision ("${d.title || d.text || d.id || "untitled"}") names the screen "${d.screen}", which is not in the flow.`, "Add the screen, or correct the decision's screen.");

  return F.sort((a, b) => SEV.indexOf(a.severity) - SEV.indexOf(b.severity));
}

/** Parsed decision-log entries; bad lines are skipped. */
export function readDecisions(root) {
  const f = join(logRoot(root), ".wwjd", "decisions.jsonl");
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
}

export function starter(app) {
  return {
    v: 1, app,
    screens: [{ id: "home", title: "Home", job: "Say the one thing a person does here", route: "/", entry: true, data: false, states: ["default"], review: false, terminal: false }],
    edges: [],
    journeys: [{ id: "first", title: "Name what a person sets out to do", steps: [], goal: "Say what they have at the end", undoes: null }],
  };
}

export function format(findings, m) {
  const lines = findings.map((f) => `${f.severity.padEnd(5)} ${f.rule}${f.screen ? ` [${f.screen}]` : f.journey ? ` [${f.journey}]` : ""}: ${f.what} Fix: ${f.fix}`);
  const n = (s) => findings.filter((f) => f.severity === s).length;
  const count = (k) => (Array.isArray(m?.[k]) ? m[k].length : 0);
  lines.push(`flow: ${count("screens")} screens, ${count("journeys")} journeys, ${n("error")} errors, ${n("warn")} warnings`);
  return lines.join("\n");
}

function main(argv) {
  const args = [...argv];
  const flag = (k) => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
  const opt = (k) => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const json = flag("--json");
  const rootArg = opt("--root");
  if (rootArg === undefined) { console.error("--root needs a folder"); return 2; }
  const cmd = args.shift() || "check";
  if (args.length || !["check", "init"].includes(cmd)) { console.error("usage: flow.mjs [check] [--json] [--root <dir>] | init [--root <dir>]"); return 2; }
  const root = rootArg ? resolve(rootArg) : artifactRoot(process.cwd());
  const file = join(root, FILE);

  if (cmd === "init") {
    if (existsSync(file)) { console.error(`${file} already exists; not overwriting.`); return 1; }
    writeFileSync(file, JSON.stringify(starter(basename(root)), null, 2) + "\n");
    console.log(file);
    return 0;
  }

  let m = null, findings;
  if (!existsSync(file)) findings = [{ rule: "shape", severity: "error", what: `There is no ${FILE} in ${root}.`, fix: "Run `flow.mjs init`, then write the app's screens, ways and journeys." }];
  else {
    let parsed = false;
    try { m = JSON.parse(readFileSync(file, "utf8")); parsed = true; } catch (e) { findings = [{ rule: "shape", severity: "error", what: `${FILE} is not valid JSON (${e.message}).`, fix: "Fix the JSON." }]; }
    // Any parsed value is checked, null included: the shape rule reports what isn't a model.
    if (parsed) findings = m && typeof m === "object" ? check(m, { decisions: readDecisions(root) }) : [{ rule: "shape", severity: "error", what: `${FILE} holds no model (it must be an object with screens, edges and journeys).`, fix: "Run `flow.mjs init` or write the model." }];
  }
  const screens = Array.isArray(m?.screens) ? m.screens.length : 0, journeys = Array.isArray(m?.journeys) ? m.journeys.length : 0;
  console.log(json ? JSON.stringify({ screens, journeys, findings }, null, 2) : format(findings, m));
  return findings.some((f) => f.severity === "error") ? 1 : 0;
}

const self = (() => { try { return realpathSync(fileURLToPath(import.meta.url)); } catch { return null; } })();
const invoked = (() => { try { return process.argv[1] && realpathSync(process.argv[1]); } catch { return null; } })();
if (self && self === invoked) process.exitCode = main(process.argv.slice(2));
