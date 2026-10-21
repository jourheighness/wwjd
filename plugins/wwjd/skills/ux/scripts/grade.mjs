#!/usr/bin/env node
// grade.mjs: the grade gate. Prints the answer sheet for one surface; you answer it, then build what stays.
//   node grade.mjs spec.json [--surface row|card|settings|…] [--budget N]
// When: once per surface with more candidate facts than its budget, before building it (references/budgets.md Grade gate).
// Two kinds (references/budgets.md Expose by job):
//   budget surfaces (glance, decide, flow, persuade jobs): a hide budget; overflow is cut or moved one step away.
//   expose surfaces (rows marked expose, or a configure/review/compare/bulk-edit/audit/inspect job): no hide budget;
//   every item the job needs shows, only restating, explaining and system facts go, overflow is organised.
// Budgets: references/budgets.md (max visible facts; kept items never count); --surface keys are its `key` column.
// spec.json: { "goal": "...", "surface": "...", "surfaceType": "row", "job": "decide",
//   "items":   { "key": "text as shown", ... },          role + placement, budget split
//   "keep":    ["key", ...],                              hard rules: identifier, legal, price, consent
//   "missed":  ["key", ...],                              optional: items the person would miss; never a tooltip
//   "regions": { "key": "what the region shows", ... }, which region leads
//   "object":  "invoice", "actions": { "key": "label" }, "states": { "key": "state description" } }  primary action per state
// job (required): glance, decide, configure, review, compare, bulk-edit, audit, inspect, flow, persuade.
// Dials (wwjd.mjs dials): budget shifts every budget surface by (dial − 3); expose caps never shift.
// Inclusion needs proof on budget surfaces: an item stays only when it is needed here and restates or explains nothing.
import { readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { dialsFor } from "./paths.mjs";

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith("--"));
if (!file) { console.error("usage: grade.mjs spec.json [--surface <key>] [--budget N]"); process.exit(2); }
const spec = JSON.parse(readFileSync(file, "utf8"));
// Budget surfaces: max counted facts per budgets.md row (identifier, legal, price, consent go in `keep` and never count).
const BUDGET = { row: 5, table: 7, card: 4, "product-card": 3, stat: 2, header: 4, dashboard: 4, hero: 3, section: 5, pricing: 7,
  "form-step": 7, dialog: 5, drawer: 8, popover: 5, tooltip: 1, toast: 1, menu: 7, nav: 7, tabbar: 5, empty: 2, chat: 3, notification: 2 };
// Expose surfaces: the cap of one group, never of the page (budgets.md rows marked expose).
const EXPOSE = {
  grid: [12, "columns visible at 1440; the rest scroll with a frozen identifier + header"],
  "admin-table": [8, "columns besides the identifier; the rest in the column chooser and the detail panel"],
  compare: [5, "items side by side; every differing attribute shows"],
  "edit-form": [10, "fields per headed section"],
  "settings-page": [12, "sections, all expanded"],
  settings: [10, "settings per headed section"],
  review: [0, "every answer shows, in headed sections; skipped ones read \"Not provided\""],
  inspector: [10, "properties per section, sticky headings"],
};
const JOBS = ["glance", "decide", "configure", "review", "compare", "bulk-edit", "audit", "inspect", "flow", "persuade"];
const EXPOSE_JOBS = new Set(["configure", "review", "compare", "bulk-edit", "audit", "inspect"]);
const opt = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const surfaceType = opt("--surface") || spec.surfaceType;
const job = spec.job;
if (!JOBS.includes(job)) {
  console.error(`grade: spec needs "job", one of: ${JOBS.join(", ")}. Name the job before the surface kind.`);
  process.exit(2);
}
if (["drawer", "card", "row"].includes(surfaceType) && ["configure", "review", "bulk-edit"].includes(job))
  console.error(`grade: warning: a ${job} job on a "${surfaceType}" surface. Settings, answers and edits are expose surfaces (settings-page, settings, review, edit-form, inspector, grid); a settings page is never a drawer.`);
const expose = surfaceType in EXPOSE || EXPOSE_JOBS.has(job);
const keep = new Set(spec.keep || []);
const missed = new Set(spec.missed || []);
const sheet = file.replace(/\.json$/, "") + ".md";
const items = Object.entries(spec.items || {});
const mark = k => keep.has(k) ? "*" : missed.has(k) ? "!" : " ";

console.log(`Grade: ${spec.surface}\nGoal: ${spec.goal}\nJob: ${job}`);
if (expose) {
  const [cap, unit] = EXPOSE[surfaceType] || [10, "items per headed section"];
  const counted = items.filter(([k]) => !keep.has(k)).length;
  console.log(`Expose surface (${surfaceType || "surface"}, ${job}): show every item the job needs; cut only restating, explaining and system facts; organise overflow (sections, anchors, search, frozen headers).`);
  console.log(cap ? `Group cap: ${cap} ${unit}. It caps a group, never the page; a group over it splits.` : `Group cap: none; ${unit}.`);
  if (cap && counted > cap && /section|field|setting|propert/.test(unit)) console.log(`${counted} items: at least ${Math.ceil(counted / cap)} headed sections.`);
  console.log(`\nWrite ${sheet}, one line per item, before building:`);
  console.log("  key | restates y/n | explains y/n | system fact nobody acts on y/n | goes show/section:<name>/advanced/danger-zone/dependent:<parent>/drop");
  console.log("\nItems:");
  for (const [k, v] of items) console.log(`- ${mark(k)}${k}: "${v}"`);
  printExtras();
  console.log(`
Rules:
- show every item the job needs; drop only restates = y, explains = y or a system fact nobody acts on.
- Organise, never hide: headed sections; ≥5 sections: a sticky anchor index with the current section marked; ≥8 sections or ≥40 settings: search; tables: sticky header, frozen identifier, density, a column chooser the person controls; compare: "Hide identical rows".
- Not applicable: dimmed with its value kept, never removed.
- Apart only when rare (last "Advanced" section, one level), destructive (danger zone, last, visible) or dependent (follows its parent).
- Never a tooltip, expander, "Show more" or hover peek around an item the job needs. The person's own editable data is content, not clutter.`);
} else {
  // Dials: paths.mjs dialsFor (plugin options < the nearest .wwjd.json "dials")
  const shift = dialsFor(process.cwd()).d.budget - 3;
  const budget = Number(opt("--budget")) || spec.budget || Math.max(1, (BUDGET[surfaceType] || 4) + shift);
  if (!opt("--budget") && !spec.budget && !BUDGET[surfaceType]) console.error(`grade: no budget for surface "${surfaceType ?? ""}" (keys: ${[...Object.keys(BUDGET), ...Object.keys(EXPOSE)].join(" ")}); using 4. Pass --budget N.`);
  console.log(`Budget: ${budget} shown facts (${surfaceType || "surface"}${shift ? `, budget dial ${shift > 0 ? "+" : ""}${shift}` : ""}); * items are kept by rule and never count; ! items would be missed.`);
  console.log(`\nWrite ${sheet}, one line per item, before building:`);
  console.log("  key | role decides/delights/nothing | needed here y/n | restates y/n | explains y/n | missed y/n | goes show/expand/detail/empty_state/onboarding/settings/tooltip (missed = n only)/drop");
  console.log("\nItems:");
  for (const [k, v] of items) console.log(`- ${mark(k)}${k}: "${v}"`);
  printExtras();
  console.log(`
Rules:
- show only when needed here = y, restates = n, explains = n; the ${budget} most important to the goal fill the budget.
- Not shown and missed = y: it moves one step away (expand, detail, empty_state, onboarding, settings), never a tooltip, never just vanishes.
- tooltip only for an explanation nobody would miss (missed = n).
- drop only when missed = n and its role is nothing.
- Free slots stay empty unless an item earns them. To bring one back, name the shown item it replaces; the budget never grows.
- One delight at most gets its own small moment. The handover says where moved groups went ("SKU, weight → detail").`);
}
if (existsSync(sheet)) console.log(`\n${basename(sheet)} exists: this surface is graded. Build from it.`);

function printExtras() {
  if (spec.regions) {
    console.log("\nRegions: rank by how prominent each should be for the goal; one leads.");
    for (const [k, v] of Object.entries(spec.regions)) console.log(`- ${k}: ${v}`);
  }
  if (spec.states && spec.actions) {
    console.log(`\nStates: name the one primary action for this ${spec.object || "object"} in each (${Object.values(spec.actions).join(" / ")}).`);
    for (const [k, v] of Object.entries(spec.states)) console.log(`- ${k}: ${v}`);
  }
}
