# Surface budgets

Every surface has a range. Below the minimum it is too thin to earn its own box: merge it. Above the maximum something moves or goes. A project's DESIGN.md may override a row.

**Facts** = visible pieces of information (a label + value is one). **Actions** = visible controls besides the whole-surface click. The identifier, legal, consent, price (commerce) and safety text never count and never move.

**Expose by job.** The job picks the kind. *Budget surfaces* (glance, decide, one-off: card, row, hero, dialog…) cut and move. *Exposure surfaces* (configure, review, compare, bulk edit, audit, inspect: rows marked **expose**) show everything the job needs; their numbers cap a group, never the page. Organise overflow there, never hide it:
- headed sections; ≥5 sections: a sticky anchor index marking the current one; ≥8 sections or ≥40 settings: search;
- tables: sticky header, frozen identifier, density, a column chooser the person controls; compare: "Hide identical rows";
- not applicable: dimmed with its value kept, never removed.
- Disclose only the rare (a small minority uses it: last section, one level), the destructive (danger zone, last, visible) and the dependent (child follows its parent). Never an expander, "Show more", tooltip or hover peek around settings, answers, columns or properties the job needs. The person's own editable data is content, not clutter.

**Grades** (one per fact; this file is their home):
| Grade | Means | Gets |
|---|---|---|
| Decides | changes what the person thinks or does next | a place by the action it informs; the settling one its own moment |
| Delights | true, specific, makes it feel better or more trustworthy; never copy about the interface | at most one moment where the surface has room |
| Nothing | changes nothing; includes raw inputs when their derived answer shows | cut |

Example, drone coffee delivery: arrival time decides; "68 °C in your hands" delights (its own line); distance, an input to the time, is nothing.

| Surface (`--surface`) | Facts | Actions | Overflow goes to |
|---|---|---|---|
| List / table row (`row`) | identifier + 2–5, on ≤2 lines (meta on one line) | row click + ≤1 inline | hover toolbar or ⋯; detail or peek |
| Table, browse (`table`) | 4–7 columns | 1 primary per view, bulk on selection | column picker; detail |
| **expose** Grid, spreadsheet (`grid`) | every column the job edits; 6–12 at 1440, rows 24–32px | inline edit per editable cell, keyboard; bulk on selection | horizontal scroll, frozen identifier + header; column chooser |
| **expose** Admin / audit list (`admin-table`) | identifier + 5–8 columns; audit: who, what, target, when, result | 1 primary, bulk on selection, ≤1 inline | column chooser; detail panel; full text on hover/focus |
| **expose** Comparison (`compare`) | 2–5 items × every differing attribute | ≤1 per item | "Hide identical rows"; filter before adding items |
| Entity card (`card`) | title + 2–4 | ≤1 primary + 1 secondary | expand, or the detail view |
| Product card (listing) (`product-card`) | image + name + price + 1–2 decision facts | card click (+ ≤1 visible, never hover-only) | product page |
| Stat tile (`stat`) | 1 number + label + ≤1 comparison | tile click | drill-down |
| Record header (`header`) | identifier + status + ≤3 key facts | 1 primary + 1 secondary + ⋯ | tabs, side panel, ⋯ |
| Dashboard (`dashboard`) | ≤5 regions, ≤4 charts, ≤4 headline numbers | ≤1 per region | drill-down pages, a second view |
| Hero (`hero`) | headline ≤2 lines + lede ≤2 lines + ≤1 moment (proof or delight) | 1 (+1 quiet link); a tool hero holds its own CTA, ≤3 inputs | the next sections |
| Landing section (`section`) | 1 claim + 1 proof, ≤3 sub-points | ≤1 | FAQ `<details>`, docs, comparison page |
| Pricing card (`pricing`) | plan + price + the total for the chosen quantity ("$120 a month for 10 seats") + who-for (≤8 words) + ≤5 feature names | 1 | comparison table |
| Form step, Flow (`form-step`) | 1 question or task; ≤7 fields | 1 primary (Back on top) | a later step, "+ Add details" for rarely filled optional fields, derived values |
| **expose** Edit form, Operate (`edit-form`) | every field of the record, sections of ≤10 | 1 save per page, or autosave | another headed section; dependent fields follow their parent |
| **expose** Settings page (`settings-page`) | 1–12 sections, all expanded | autosave, or 1 save per page | ≥5 sections: anchor index; ≥8 or ≥40 settings: search; a new sub-nav category |
| **expose** Settings section (`settings`) | 1–10 settings under a heading + ≤1 preview | the page's save model | split into two headed sections; rare → last "Advanced" section; danger zone last, visible |
| **expose** Check answers (`review`) | every answer, "Not provided" for skipped, in headed sections | 1 Change per row + 1 submit | more sections, never hidden |
| **expose** Inspector (`inspector`) | every editable property, sections of ≤10, sticky headings | inline controls | more sections; collapse only by the person, remembered |
| Dialog (`dialog`) | title + ≤2 sentences + ≤3 fields | 1 primary + 1 secondary | a page or drawer |
| Drawer, peek (`drawer`) | identifier + ≤8 facts in groups | 1 primary + 1 secondary + ⋯ | the full record page, the inspector |
| Popover (`popover`) | ≤5 facts | ≤2 | the detail view |
| Tooltip (`tooltip`) | 1 line, non-essential | 0 | – (essentials never live here) |
| Toast (`toast`) | 1 line | ≤1 (Undo) | activity log |
| Menu (`menu`) | ≤7 ungrouped, or groups of ≤5; longer only grouped + type-ahead | – | search inside the menu, sub-menu |
| Toolbar | – | 1 primary + ≤3 visible tools (icon toggles, filters) | ⋯ |
| Sidebar nav (`nav`) | ≤7 top items | 1 create | groups, "More", command palette |
| Mobile tab bar (`tabbar`) | 3–5 tabs | – | a "More" tab, in-screen nav |
| Empty state (`empty`) | title + 1 sentence | 1 | docs link |
| Chat answer (`chat`) | the answer first, ≤1 screen | ≤3 follow-ups | collapsed sources, "Show steps" |
| Notification item (`notification`) | 1 line + time | ≤1 | the thing it points to |

## When it overflows
Budget surfaces only. On an **expose** surface nothing is cut for count: drop only what restates or explains, then organise as above; a group over its cap splits, never folds.
1. **Inclusion needs proof.** Ask "should this stay?", never "should this go?". An item stays only if the person needs it here to decide or act now; the default is out.
2. **Test each item before ranking:** does it restate something visible? Explain another element or the interface? Would the person notice it gone? Is it needed now, or only later or elsewhere? An item that restates or explains never stays, however important it sounds.
3. **Throw away** what nobody would miss: system facts (sync time, unless staleness changes a decision; internal IDs, warehouse), inputs whose answer is shown, duplicates.
4. **Keep** what earned its place, ranked, up to the max, plus at most one "delights" moment where the surface has room (hero, empty state, success). A free slot stays empty unless an unsure item is justified.
5. **Move** the rest one step away, by kind:
   - explanation of something visible → tooltip (never essential);
   - teaching copy → the empty state or one-time onboarding;
   - more of the same kind → "Show more" or expand in place;
   - details of this object → the detail view, peek or side panel;
   - more actions → ⋯ or the hover toolbar (never the only path on touch);
   - a comparison → its own table or page; a preference → settings.
6. **Swap, never grow.** To bring a cut item back, name the shown item it replaces.
7. **Say where it went** in the handover, one line per moved group ("SKU, weight → product page specs").
8. **Keep the sheets:** answered `.wwjd/grade/*.md` sheets record what was cut. Something cut repeatedly (subtitles, "Learn more", helper text under every field) becomes a ban in `bans.md` or DESIGN.md.

## Grade gate
The Strictness dial sets it (`dials.md`): 4 and up writes a sheet (gate), 1–3 grade without one (light); `wwjd.mjs status` prints which. Under the gate, a hook refuses a new UI file until a `.wwjd/grade/*.md` from this session exists. A surface within budget, or an expose surface: the sheet is one line naming surface, job and kind ("Profile settings: configure, expose").
- **When:** once per surface with more candidate facts than its budget, before building or simplifying it; never per edit. Name the job first: a settings page is never graded as a drawer. Expose surfaces skip the count and grade only for restating, explaining and system facts.
- **gate:** spec, `grade.mjs`, answered sheet, then markup. **light:** the same questions without a file; the handover still says what moved where.
- **Spec**, from the inventory already gathered, at `.wwjd/grade/<surface>.json`:
```json
{ "goal": "find the order a customer is asking about", "surface": "order row in the support inbox",
  "surfaceType": "row", "job": "decide", "keep": ["customer"],
  "items": { "customer": "Anna Berg", "total": "€1,240", "status": "Refund requested", "synced": "Synced 2 min ago" },
  "object": "order", "actions": { "refund": "Refund", "reply": "Reply" },
  "states": { "refund_requested": "the customer asked for a refund" } }
```
  `job` is required (glance, decide, configure, review, compare, bulk-edit, audit, inspect, flow, persuade). `regions`, `actions` and `states` are optional; `keep` lists what never counts (identifier, legal, price, consent).
- **Run** `node <skill>/scripts/grade.mjs .wwjd/grade/<surface>.json`: it prints the budget (or the organise rules on an expose surface), the items and the rules. Answer one line per item in the `.md`, build only the `show` items, place the rest where their line says.
