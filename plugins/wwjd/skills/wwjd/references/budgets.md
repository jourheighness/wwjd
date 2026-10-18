# Surface budgets

Every surface has a range. Below the minimum it is too thin to earn its own box (merge it); above the maximum something moves or goes. A project's DESIGN.md may override a row.

**Facts** = visible pieces of information (a label + value is one). **Actions** = visible controls besides the whole-surface click. The identifier, legal, consent, price (commerce) and safety text never count against the budget and never move.

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
| Table (`table`) | 4–7 columns | 1 primary per view, bulk on selection | column picker; detail |
| Entity card (`card`) | title + 2–4 | ≤1 primary + 1 secondary | expand, or the detail view |
| Product card (listing) (`product-card`) | image + name + price + 1–2 decision facts | card click (+ ≤1 visible, never hover-only) | product page |
| Stat tile (`stat`) | 1 number + label + ≤1 comparison | tile click | drill-down |
| Record header (`header`) | identifier + status + ≤3 key facts | 1 primary + 1 secondary + ⋯ | tabs, side panel, ⋯ |
| Dashboard (`dashboard`) | ≤5 regions, ≤4 charts, ≤4 headline numbers | ≤1 per region | drill-down pages, a second view |
| Hero (`hero`) | headline ≤2 lines + lede ≤2 lines + ≤1 moment (proof or delight) | 1 (+1 quiet link); a tool hero holds its own CTA, ≤3 inputs | the next sections |
| Landing section (`section`) | 1 claim + 1 proof, ≤3 sub-points | ≤1 | FAQ `<details>`, docs, comparison page |
| Pricing card (`pricing`) | plan + price + the total for the chosen quantity ("$120 a month for 10 seats") + who-for (≤8 words) + ≤5 feature names | 1 | comparison table |
| Form step (`form-step`) | 1 question or task; ≤7 fields | 1 primary (Back on top) | "+ Add details", a later step, derived values |
| Settings group (`settings`) | ≤7 settings + ≤1 preview of their effect (a rendering, not a fact) | auto-save, or 1 save per page | sub-page, "Advanced" disclosure |
| Dialog (`dialog`) | title + ≤2 sentences + ≤3 fields | 1 primary + 1 secondary | a page or drawer |
| Drawer / side panel (`drawer`) | identifier + ≤8 facts in groups | 1 primary + 1 secondary + ⋯ | the full record page |
| Popover (`popover`) | ≤5 facts | ≤2 | the detail view |
| Tooltip (`tooltip`) | 1 line, non-essential | 0 | (essential info never lives here) |
| Toast (`toast`) | 1 line | ≤1 (Undo) | activity log |
| Menu (`menu`) | ≤7 ungrouped, or groups of ≤5 | – | search inside the menu, sub-menu |
| Toolbar | – | 1 primary + ≤3 visible tools (icon toggles, filters) | ⋯ |
| Sidebar nav (`nav`) | ≤7 top items | 1 create | groups, "More", command palette |
| Mobile tab bar (`tabbar`) | 3–5 tabs | – | a "More" tab, in-screen nav |
| Empty state (`empty`) | title + 1 sentence | 1 | docs link |
| Chat answer (`chat`) | the answer first, ≤1 screen | ≤3 follow-ups | collapsed sources, "Show steps" |
| Notification item (`notification`) | 1 line + time | ≤1 | the thing it points to |

## When it overflows
1. **Inclusion needs proof.** Ask "should this stay?", never "should this go?". An item stays only if the person needs it here to decide or act now; the default is out.
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
The `grade` dial: `gate` (default) or `light`; `wwjd.mjs status` prints which.
- **When:** a surface has more candidate facts than its budget: once, before building or simplifying it. Never per edit, never for a surface within budget.
- **gate:** write the spec, run `grade.mjs` and answer its sheet in `.wwjd/grade/<surface>.md` before the surface's markup. The sheet is the gate: no sheet, no build.
- **light:** the same questions in your head; the handover still says what moved and where.
- **Spec in a minute,** from the inventory you already have, at `.wwjd/grade/<surface>.json`:
```json
{ "goal": "find the order a customer is asking about", "surface": "order row in the support inbox",
  "surfaceType": "row", "keep": ["customer"],
  "items": { "customer": "Anna Berg", "total": "1 240 kr", "status": "Refund requested", "synced": "Synced 2 min ago" },
  "object": "order", "actions": { "refund": "Refund", "reply": "Reply" },
  "states": { "refund_requested": "the customer asked for a refund" } }
```
  `regions`, `actions` and `states` are optional; `keep` lists what never counts (identifier, legal, price, consent).
- **Run** `node <skill>/scripts/grade.mjs .wwjd/grade/<surface>.json`; it prints the budget, the items and the rules. Answer one line per item in `.wwjd/grade/<surface>.md`, then build only the `show` items and place the rest where their line says.
