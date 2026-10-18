# Surface budgets

Every surface has a range. Below the minimum it is too thin to earn its own box (merge it); above the maximum something moves or goes. A project's DESIGN.md may override a row.

**Facts** = visible pieces of information (a label + value is one). **Actions** = visible controls besides the whole-surface click. The identifier, legal, consent, price (commerce) and safety text never count against the budget and never move.

**Expose by job.** The job picks the kind. *Budget surfaces* (glance, decide, one-off: card, row, hero, dialog…) cut and move. *Exposure surfaces* (configure, review, compare, bulk edit, audit, inspect: rows marked **expose**) show everything the job needs; their numbers cap a group, never the page. Overflow there is organised, never hidden: split into headed sections; ≥5 sections: a sticky anchor index with the current section marked; ≥8 sections or ≥40 settings: search; tables: sticky header, frozen identifier, density, a column chooser the person controls, "Hide identical rows" in compare; not applicable: dimmed with its value kept, never removed. Disclose only what is rare (a small minority uses it, last section, one level), destructive (danger zone, last, visible), or dependent (child follows its parent). Never an expander, "Show more", tooltip or hover peek around settings, answers, columns or properties the job needs. The person's own editable data is content, not clutter.

**Grades** (one per fact; this file is their home):
| Grade | Means | Gets |
|---|---|---|
| Decides | changes what the person thinks or does next | a place by the action it informs; the settling one its own moment |
| Delights | true, specific, makes it feel better or more trustworthy; never copy about the interface | at most one moment where the surface has room |
| Nothing | changes nothing; includes raw inputs when their derived answer shows | cut |

Example, coffee delivered by drone: arrival time decides; "68 °C in your hands" delights, so it gets its own line; the distance is an input to the time, so it is nothing.

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
| Tooltip (`tooltip`) | 1 line, non-essential | 0 | (essential info never lives here) |
| Toast (`toast`) | 1 line | ≤1 (Undo) | activity log |
| Menu (`menu`) | ≤7 ungrouped, or groups of ≤5; longer only grouped + type-ahead | – | search inside the menu, sub-menu |
| Toolbar | – | 1 primary + ≤3 visible tools (icon toggles, filters) | ⋯ |
| Sidebar nav (`nav`) | ≤7 top items | 1 create | groups, "More", command palette |
| Mobile tab bar (`tabbar`) | 3–5 tabs | – | a "More" tab, in-screen nav |
| Empty state (`empty`) | title + 1 sentence | 1 | docs link |
| Chat answer (`chat`) | the answer first, ≤1 screen | ≤3 follow-ups | collapsed sources, "Show steps" |
| Notification item (`notification`) | 1 line + time | ≤1 | the thing it points to |

## When it overflows
Budget surfaces only. On an **expose** surface nothing is cut for count: drop only what restates or explains, then organise with the Expose-by-job tools; a group over its cap splits, it never folds.
1. **Inclusion needs proof.** Ask "should this stay?", never "should this go?". An item stays only if the person needs it here to decide or act now; on a budget surface the default is out.
2. **Ask about the bad habits directly,** per item, before ranking anything:
   - Does it restate something already visible?
   - Is it explaining another element or the interface, rather than being content?
   - Would the person notice if it were gone?
   - Is it needed now, or only later or elsewhere?
   An item that restates or explains never stays, however "important" it sounds.
3. **Throw away** what nobody would miss: system facts (sync time, internal IDs, warehouse), inputs whose answer is shown, duplicates.
4. **Keep** what earned its place, ranked, up to the max, plus at most one "delights" moment where the surface has room (hero, empty state, success). A free slot stays empty unless an unsure item is justified.
5. **Move** the rest one step away, by kind; explainers move, they don't vanish:
   - an explanation of something visible → tooltip (never essential);
   - teaching copy → the empty state or one-time onboarding;
   - more of the same kind → "Show more" or expand in place;
   - details of this object → the detail view, peek or side panel;
   - more actions → ⋯ or the hover toolbar (never the only path on touch);
   - a comparison → a table or page of its own; a preference → settings.
6. **Swap, never grow.** To bring a cut item back, name the shown item it replaces. The budget is fixed.
7. **Say where it went** in the handover, one line per moved group ("SKU, weight → product page specs").
8. **Keep the sheets:** the answered `.wwjd/grade/*.md` sheets are the record of what was cut. Something cut again and again (subtitles, "Learn more", helper text under every field) becomes a ban in `bans.md` or DESIGN.md, so it stops being proposed.

## Grade gate
Set by the Strictness dial: 3 and up writes a sheet (gate), 1–2 grade in your head (light); `wwjd.mjs status` prints which. With the gate, a hook refuses a new UI file until a `.wwjd/grade/*.md` from this session exists. A surface within budget, or an expose surface: the sheet is one line naming the surface, its job and its kind ("Profile settings: configure, expose").
- **When:** a surface has more candidate facts than its budget: once, before building or simplifying it. Never per edit. Expose surfaces skip the count; grade only for restating, explaining and system facts. Name the job first; a settings page is never graded as a drawer.
- **gate:** write the spec, run `grade.mjs` and answer its sheet in `.wwjd/grade/<surface>.md` before the surface's markup. The sheet is the gate: no sheet, no build.
- **light:** the same questions in your head; the handover still says what moved and where.
- **Spec in a minute,** from the inventory you already have, at `.wwjd/grade/<surface>.json`:
```json
{ "goal": "find the order a customer is asking about", "surface": "order row in the support inbox",
  "surfaceType": "row", "job": "decide", "keep": ["customer"],
  "items": { "customer": "Anna Berg", "total": "1 240 kr", "status": "Refund requested", "synced": "Synced 2 min ago" },
  "object": "order", "actions": { "refund": "Refund", "reply": "Reply" },
  "states": { "refund_requested": "the customer asked for a refund" } }
```
  `job` is required: glance, decide, configure, review, compare, bulk-edit, audit, inspect, flow or persuade. `regions`, `actions` and `states` are optional; `keep` lists what never counts (identifier, legal, price, consent).
- **Run** `node <skill>/scripts/grade.mjs .wwjd/grade/<surface>.json`; it prints the budget (or, on an expose surface, the organise rules), the items and the rules. Answer one line per item in `.wwjd/grade/<surface>.md`, then build only the `show` items and place the rest where their line says.
