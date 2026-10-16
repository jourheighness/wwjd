#!/usr/bin/env node
// grade.mjs (experimental): grade content by the surface's goal with a fast decision model.
//   node grade.mjs spec.json [--surface row|card|hero|…] [--budget N] [--offline]
// Budgets: references/budgets.md (max visible facts; kept items never count).
// spec.json: { "goal": "...", "surface": "...",
//   "items":   { "key": "text as shown", ... },          role + placement + rank, budget split
//   "keep":    ["key", ...],                              hard rules: identifier, legal, price, consent
//   "regions": { "key": "what the region shows", ... }, which region leads
//   "object":  "invoice", "actions": { "key": "label" }, "states": { "key": "state description" } }  primary action per state
// With OPENROUTER_API_KEY set: OpenRouter Decisions API, model $WWJD_DECIDER (default typesafe/jev-1.14).
// Without it (or --offline): prints the same typed questions for the agent to answer itself.
// Confident answers (>= .7) can be applied; "unsure" ones go to the thinking model. Scores rank only.
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--"));
if (!file) { console.error("usage: grade.mjs spec.json [--budget N] [--offline]"); process.exit(2); }
const spec = JSON.parse(readFileSync(file, "utf8"));
const SURFACES = { row: 5, table: 7, card: 4, "product-card": 3, stat: 2, header: 4, hero: 4, section: 4, pricing: 6,
  "form-step": 7, settings: 7, dialog: 4, drawer: 9, popover: 5, toast: 1, empty: 2, notification: 1 };
const opt = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const surfaceType = opt("--surface") || spec.surfaceType;
const budget = Number(opt("--budget")) || spec.budget || SURFACES[surfaceType] || 4;
const key = process.env.OPENROUTER_API_KEY;
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
for (const k of Object.keys(spec.items || {})) {
  questions[`item:${k}:role`] = { type: "choice", instructions: `Item \`items.${k}\`: given \`goal\` and \`surface\`, what does it do for the person?`, criteria: ROLE };
  questions[`item:${k}:place`] = { type: "choice", instructions: `Item \`items.${k}\`: given \`goal\` and \`surface\`, where should it live?`, criteria: PLACE };
  questions[`item:${k}:rank`] = { type: "score", instructions: `How important is \`items.${k}\` on this surface, given \`goal\`?`, criteria: LEVELS };
}
for (const k of Object.keys(spec.regions || {})) {
  questions[`region:${k}`] = { type: "score", instructions: `How prominent should region \`regions.${k}\` be, given \`goal\`?`, criteria: PROMINENCE };
}
for (const k of Object.keys(spec.states || {})) {
  questions[`state:${k}`] = { type: "choice", instructions: `For this \`object\` in state \`states.${k}\`, which one action should be the primary button?`, criteria: spec.actions };
}
const state = { goal: spec.goal, surface: spec.surface, items: spec.items, regions: spec.regions, object: spec.object, states: spec.states };

if (offline) {
  console.log(`No decider (set OPENROUTER_API_KEY to use ${model}). Answer these yourself, same options, then apply the budget (${budget}):`);
  console.log(`Goal: ${spec.goal}\nSurface: ${spec.surface}`);
  for (const [id, q] of Object.entries(questions)) {
    const opts = Array.isArray(q.criteria) ? q.criteria.map((c, i) => `${i}=${c}`).join(" | ") : Object.keys(q.criteria).join(" | ");
    console.log(`- ${id}: ${opts}`);
  }
  if (spec.keep?.length) console.log(`Always keep: ${spec.keep.join(", ")}`);
  process.exit(0);
}

const res = await fetch("https://openrouter.ai/api/alpha/decisions", {
  method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, state, questions }),
});
const out = await res.json();
if (!res.ok) { console.error(`decider error ${res.status}: ${JSON.stringify(out).slice(0, 300)}\nRun with --offline and answer the questions yourself.`); process.exit(1); }
const a = out.answers;
const sure = x => (x?.confidence ?? 0) >= .7;
const unsure = [];

if (spec.items) {
  const keep = new Set(spec.keep || []);
  const rows = Object.keys(spec.items).map(k => ({ k, role: a[`item:${k}:role`], place: a[`item:${k}:place`], rank: a[`item:${k}:rank`]?.score ?? 0 }));
  rows.sort((x, y) => (keep.has(y.k) - keep.has(x.k)) || y.rank - x.rank);
  console.log(`Items (${surfaceType || "surface"} budget ${budget}; * = kept, never counted; away = one step away (references/budgets.md); drop = throw away; ? = unsure, decide yourself)`);
  let shown = 0;
  rows.forEach(r => {
    const show = keep.has(r.k) || (r.role?.choice !== "nothing" && shown++ < budget) ? "show" : r.role?.choice === "nothing" ? "drop" : "away";
    const flag = (sure(r.role) && sure(r.place)) ? " " : "?";
    if (flag === "?" && !keep.has(r.k)) unsure.push(r.k);
    console.log(`${flag}${keep.has(r.k) ? "*" : " "} ${show.padEnd(4)} ${r.k.padEnd(14)} ${String(r.role?.choice).padEnd(8)} ${String(r.place?.choice).padEnd(13)} rank ${r.rank.toFixed(1)}  "${spec.items[r.k]}"`);
  });
}
if (spec.regions) {
  const order = Object.keys(spec.regions).sort((x, y) => a[`region:${y}`].score - a[`region:${x}`].score);
  console.log(`Leads: ${order[0]} (trust the lead; place the rest yourself). Order hint: ${order.join(" > ")}`);
}
if (spec.states) {
  console.log("Primary action per state");
  for (const k of Object.keys(spec.states)) {
    const s = a[`state:${k}`]; if (!sure(s)) unsure.push(`state:${k}`);
    console.log(`${sure(s) ? " " : "?"} ${k.padEnd(14)} → ${spec.actions[s.choice]} (${s.confidence.toFixed(2)})`);
  }
}
if (unsure.length) console.log(`Unsure: ${unsure.join(", ")}. Decide these yourself.`);
console.log(`${out.model} · ${out.usage?.cost != null ? "$" + out.usage.cost.toFixed(6) : ""}`);
