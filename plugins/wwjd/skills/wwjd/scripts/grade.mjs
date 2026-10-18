#!/usr/bin/env node
// grade.mjs: the grade gate. Prints the answer sheet for one over-budget surface; you answer it, then build what stays.
//   node grade.mjs spec.json [--surface row|card|hero|…] [--budget N]
// When: once per surface with more candidate facts than its budget, before building it (references/budgets.md Grade gate).
// Budgets: references/budgets.md (max visible facts; kept items never count); --surface keys are its `key` column.
// spec.json: { "goal": "...", "surface": "...", "surfaceType": "row",
//   "items":   { "key": "text as shown", ... },          role + placement, budget split
//   "keep":    ["key", ...],                              hard rules: identifier, legal, price, consent
//   "regions": { "key": "what the region shows", ... }, which region leads
//   "object":  "invoice", "actions": { "key": "label" }, "states": { "key": "state description" } }  primary action per state
// Dials (wwjd.mjs dials): budget shifts every budget by (dial − 3).
// Inclusion needs proof: an item stays only when it is needed here and restates or explains nothing.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, basename } from "node:path";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--"));
if (!file) { console.error("usage: grade.mjs spec.json [--surface <key>] [--budget N]"); process.exit(2); }
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
const budget = Number(opt("--budget")) || spec.budget || Math.max(1, (SURFACES[surfaceType] || 4) + shift);
if (!opt("--budget") && !spec.budget && !SURFACES[surfaceType]) console.error(`grade: no budget for surface "${surfaceType ?? ""}" (keys: ${Object.keys(SURFACES).join(" ")}); using 4. Pass --budget N.`);
const keep = new Set(spec.keep || []);
const sheet = file.replace(/\.json$/, "") + ".md";

console.log(`Grade: ${spec.surface}\nGoal: ${spec.goal}\nBudget: ${budget} shown facts (${surfaceType || "surface"}${shift ? `, budget dial ${shift > 0 ? "+" : ""}${shift}` : ""}); * items are kept by rule and never count.`);
console.log(`\nWrite ${sheet}, one line per item, before building:`);
console.log("  key | role decides/delights/nothing | needed here y/n | restates y/n | explains y/n | missed y/n | goes show/tooltip/expand/detail/empty_state/onboarding/settings/drop");
console.log("\nItems:");
for (const [k, v] of Object.entries(spec.items || {})) console.log(`- ${keep.has(k) ? "*" : " "}${k}: "${v}"`);
if (spec.regions) {
  console.log("\nRegions: rank by how prominent each should be for the goal; one leads.");
  for (const [k, v] of Object.entries(spec.regions)) console.log(`- ${k}: ${v}`);
}
if (spec.states && spec.actions) {
  console.log(`\nStates: name the one primary action for this ${spec.object || "object"} in each (${Object.values(spec.actions).join(" / ")}).`);
  for (const [k, v] of Object.entries(spec.states)) console.log(`- ${k}: ${v}`);
}
console.log(`
Rules:
- show only when needed here = y, restates = n, explains = n; the ${budget} most important to the goal fill the budget.
- Not shown and missed = y: it moves one step away (tooltip, expand, detail, empty_state, onboarding, settings), never just vanishes.
- drop only when missed = n and its role is nothing.
- Free slots stay empty unless an item earns them. To bring one back, name the shown item it replaces; the budget never grows.
- One delight at most gets its own small moment. The handover says where moved groups went ("SKU, weight → detail").`);
if (existsSync(sheet)) console.log(`\n${basename(sheet)} exists: this surface is graded. Build from it.`);
