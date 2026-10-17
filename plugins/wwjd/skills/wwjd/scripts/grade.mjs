#!/usr/bin/env node
// grade.mjs (experimental): grade content by the surface's goal with a fast decision model.
//   node grade.mjs spec.json [--surface row|card|hero|…] [--budget N] [--offline]
// When: once per surface with more candidate facts than its budget, before building it (references/budgets.md Decider).
// Budgets: references/budgets.md (max visible facts; kept items never count); --surface keys are its `key` column.
// spec.json: { "goal": "...", "surface": "...",
//   "items":   { "key": "text as shown", ... },          role + placement + rank, budget split
//   "keep":    ["key", ...],                              hard rules: identifier, legal, price, consent
//   "regions": { "key": "what the region shows", ... }, which region leads
//   "object":  "invoice", "actions": { "key": "label" }, "states": { "key": "state description" } }  primary action per state
// With a key (plugin option decider_key → WWJD_DECIDER_KEY, or OPENROUTER_API_KEY): OpenRouter Decisions API,
// model $WWJD_DECIDER (default typesafe/jev-1.14). Dials (wwjd.mjs dials): budget shifts every budget by (dial − 3),
// decider off = offline, strict = its cuts stand unless swapped.
// Without it (or --offline): prints the same typed questions for the agent to answer itself.
// Inclusion needs proof: an item stays only with stay >= .7 and no restates/explains flag. Explainers move (tooltip,
// empty state, onboarding), never just vanish. Unsure items go to the thinking model; scores rank only.
// Cuts are logged to .wwjd/cuts.jsonl when .wwjd/ exists; recurring patterns become bans.
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--"));
if (!file) { console.error("usage: grade.mjs spec.json [--surface <key>] [--budget N] [--offline]"); process.exit(2); }
const spec = JSON.parse(readFileSync(file, "utf8"));
// Max counted facts per budgets.md row (identifier, legal, price, consent go in `keep` and never count).
const SURFACES = { row: 5, table: 7, card: 4, "product-card": 3, stat: 2, header: 4, dashboard: 4, hero: 3, section: 5, pricing: 7,
  "form-step": 7, settings: 8, dialog: 5, drawer: 8, popover: 5, tooltip: 1, toast: 1, menu: 7, nav: 7, tabbar: 5, empty: 2, chat: 3, notification: 2 };
const opt = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const surfaceType = opt("--surface") || spec.surfaceType;
// Dials: plugin options (WWJD_DIALS) < the nearest .wwjd.json "dials"
const dial = {};
for (const [k, v] of (process.env.WWJD_DIALS || "").split(/\s+/).filter(Boolean).map(x => x.split("="))) dial[k] = v;
for (let d = process.cwd(); ; d = dirname(d)) {
  const f = join(d, ".wwjd.json");
  if (existsSync(f)) { try { Object.assign(dial, JSON.parse(readFileSync(f, "utf8")).dials || {}); } catch {} break; }
  if (dirname(d) === d) break;
}
const shift = Math.min(2, Math.max(-2, Math.round(Number(dial.budget ?? 3) - 3) || 0));
const mode = ["off", "assist", "strict"].includes(dial.decider) ? dial.decider : "assist";
const budget = Number(opt("--budget")) || spec.budget || Math.max(1, (SURFACES[surfaceType] || 4) + shift);
if (!opt("--budget") && !spec.budget && !SURFACES[surfaceType]) console.error(`grade: no budget for surface "${surfaceType ?? ""}" (keys: ${Object.keys(SURFACES).join(" ")}); using 4. Pass --budget N.`);
const key = mode === "off" ? null : process.env.WWJD_DECIDER_KEY || process.env.OPENROUTER_API_KEY;
const model = process.env.WWJD_DECIDER || "typesafe/jev-1.14";
const offline = args.includes("--offline") || !key;

const ROLE = {
  decides: "The person needs this to understand or act toward the goal.",
  delights: "Not needed to decide, but makes it feel better or more trustworthy; worth a small moment.",
  nothing: "Changes nothing the person thinks or does toward the goal.",
};
const PLACE = {
  primary: "One of the two or three most prominent things on this surface.",
  inline: "Visible, secondary.",
  one_step_away: "Behind a tooltip, expand or detail view.",
  cut: "Remove from this surface.",
};
const LEVELS = ["Not needed here", "Could go one step away", "Useful, secondary", "Important", "Essential: fails without it"];
const PROMINENCE = ["Hide or move elsewhere", "Small, at the edge", "Visible, secondary", "Prominent", "Leads the screen"];

const questions = {};
const YN = (instructions, yes, no) => ({ type: "noul", instructions, criteria: { true: yes, false: no } });
const DEST = {
  tooltip: "A one-line explanation of something visible; fine to hover or focus for.",
  expand: "More of the same kind; a 'Show more' or expand in place.",
  detail: "Details of this object; its detail view, peek or side panel.",
  empty_state: "Teaching copy that only helps before there is content.",
  onboarding: "Teaching copy for first use; a one-time tip or docs.",
  settings: "A preference; settings, near where it applies.",
  drop: "Nobody needs it anywhere; throw it away.",
};
for (const k of Object.keys(spec.items || {})) {
  const it = `\`items.${k}\``;
  questions[`item:${k}:role`] = { type: "choice", instructions: `Item ${it}: given \`goal\` and \`surface\`, what does it do for the person?`, criteria: ROLE };
  questions[`item:${k}:stay`] = YN(`Should ${it} stay visible on this surface? Yes only if the person needs it here, to decide or act toward \`goal\`.`, "It must stay visible here.", "It can leave this surface.");
  questions[`item:${k}:restates`] = YN(`Does ${it} restate something another item in \`items\` already shows?`, "It repeats information already visible.", "It adds information nothing else shows.");
  questions[`item:${k}:explains`] = YN(`Is ${it} explaining another element or how the interface works, rather than being content itself?`, "It explains, instructs, narrates or reassures.", "It is content: a fact, value, name or action.");
  questions[`item:${k}:missed`] = YN(`Would the person notice and miss ${it} if it were gone?`, "They would miss it.", "They would not notice.");
  questions[`item:${k}:now`] = YN(`Does the person need ${it} to decide or act right now on this surface, rather than later or elsewhere?`, "Needed now, here.", "Only later or elsewhere.");
  questions[`item:${k}:dest`] = { type: "choice", instructions: `If ${it} leaves this surface, where should it go?`, criteria: DEST };
  questions[`item:${k}:rank`] = { type: "score", instructions: `How important is ${it} on this surface, given \`goal\`?`, criteria: LEVELS };
}
for (const k of Object.keys(spec.regions || {})) {
  questions[`region:${k}`] = { type: "score", instructions: `How prominent should region \`regions.${k}\` be, given \`goal\`?`, criteria: PROMINENCE };
}
for (const k of spec.actions ? Object.keys(spec.states || {}) : []) {
  questions[`state:${k}`] = { type: "choice", instructions: `For this \`object\` in state \`states.${k}\`, which one action should be the primary button?`, criteria: spec.actions };
}
const state = { goal: spec.goal, surface: spec.surface, items: spec.items, regions: spec.regions, object: spec.object, states: spec.states };

if (offline) {
  console.log(`No decider (${mode === "off" ? "dial decider=off" : `no key: set decider_key in /plugin configure wwjd@wwjd to use ${model}`}). Answer these yourself, same options, then apply the budget (${budget}):`);
  console.log(`Goal: ${spec.goal}\nSurface: ${spec.surface}`);
  for (const [id, q] of Object.entries(questions)) {
    const opts = Array.isArray(q.criteria) ? q.criteria.map((c, i) => `${i}=${c}`).join(" | ") : Object.keys(q.criteria).join(" | ");
    console.log(`- ${id}: ${opts}`);
  }
  if (spec.keep?.length) console.log(`Always keep: ${spec.keep.join(", ")}`);
  process.exit(0);
}

let res, out;
try {
  res = await fetch("https://openrouter.ai/api/alpha/decisions", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, state, questions }), signal: AbortSignal.timeout(20000),
  });
  out = await res.json();
} catch (e) { console.error(`decider unreachable (${e.name}). Run with --offline and answer the questions yourself.`); process.exit(1); }
if (!res.ok) { console.error(`decider error ${res.status}: ${JSON.stringify(out).slice(0, 300)}\nRun with --offline and answer the questions yourself.`); process.exit(1); }
const a = out.answers || {};
const sure = x => (x?.confidence ?? 0) >= .7;
const unsure = [];

if (spec.items) {
  // Inclusion needs proof: keep only with stay >= .7 and no bad-habit flag; then rank inside the budget.
  const keep = new Set(spec.keep || []);
  const p = (k, q) => a[`item:${k}:${q}`]?.noul ?? 0;
  const rows = Object.keys(spec.items).map(k => {
    const flags = [p(k, "restates") >= .5 && "restates", p(k, "explains") >= .5 && "explains", p(k, "missed") < .5 && "unmissed", p(k, "now") < .5 && "later"].filter(Boolean);
    const earns = keep.has(k) || (p(k, "stay") >= .7 && !flags.includes("restates") && !flags.includes("explains"));
    const unsureStay = !keep.has(k) && p(k, "stay") >= .4 && p(k, "stay") < .7;
    return { k, earns, flags, unsureStay, role: a[`item:${k}:role`]?.choice, dest: a[`item:${k}:dest`]?.choice, rank: a[`item:${k}:rank`]?.score ?? 0, stay: p(k, "stay") };
  });
  rows.sort((x, y) => (keep.has(y.k) - keep.has(x.k)) || (y.earns - x.earns) || y.rank - x.rank);
  let shown = 0;
  // Gone only when nobody would miss it; anything missed but not earned moves one step away.
  for (const r of rows) r.out = keep.has(r.k) ? "show" : r.earns && shown++ < budget ? "show"
    : p(r.k, "missed") < .5 && (r.dest === "drop" || r.role === "nothing") ? "drop" : (r.dest === "drop" || !r.dest ? "detail" : r.dest);
  console.log(`Items (${surfaceType || "surface"} budget ${budget}; * kept by rule, never counted; ? unsure, decide yourself)`);
  for (const r of rows) {
    if (r.unsureStay) unsure.push(r.k);
    console.log(`${r.unsureStay ? "?" : " "}${keep.has(r.k) ? "*" : " "} ${r.out.padEnd(11)} ${r.k.padEnd(14)} stay ${r.stay.toFixed(2)} ${r.flags.join(",").padEnd(26)} "${spec.items[r.k]}"`);
  }
  const free = budget - Math.min(shown, budget);
  if (free > 0) console.log(`${free} of ${budget} slots free: fill only with "?" items you can justify, or leave them empty.`);
  console.log("Swap rule: when full, an item comes back only by naming the shown item it replaces. The budget never grows.");
  if (existsSync(".wwjd")) appendFileSync(".wwjd/cuts.jsonl", rows.filter(r => r.out !== "show").map(r => JSON.stringify({ at: new Date().toISOString(), surface: surfaceType || spec.surface, item: spec.items[r.k], to: r.out, flags: r.flags })).join("\n") + "\n");
}
if (spec.regions) {
  const order = Object.keys(spec.regions).sort((x, y) => (a[`region:${y}`]?.score ?? 0) - (a[`region:${x}`]?.score ?? 0));
  console.log(`Leads: ${order[0]} (trust the lead; place the rest yourself). Order hint: ${order.join(" > ")}`);
}
if (spec.states && spec.actions) {
  console.log("Primary action per state");
  for (const k of Object.keys(spec.states)) {
    const s = a[`state:${k}`]; if (!sure(s)) unsure.push(`state:${k}`);
    console.log(`${sure(s) ? " " : "?"} ${k.padEnd(14)} → ${spec.actions[s?.choice] ?? "?"} (${(s?.confidence ?? 0).toFixed(2)})`);
  }
}
if (unsure.length) console.log(`Unsure: ${unsure.join(", ")}. Decide these yourself.`);
if (!offline && mode === "strict") console.log("Decider strict: its cuts stand; bring an item back only by swapping it for a shown one.");
console.log(`${out.model} · ${out.usage?.cost != null ? "$" + out.usage.cost.toFixed(6) : ""}`);
