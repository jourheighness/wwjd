# Surface budgets

Every surface has a range. Below the minimum it is too thin to earn its own box (merge it); above the maximum something moves or goes. A project's DESIGN.md may override a row.

**Facts** = visible pieces of information (a label + value is one). **Actions** = visible controls besides the whole-surface click. The identifier, legal, consent, price (commerce) and safety text never count against the budget and never move.

| Surface | Facts | Actions | Overflow goes to |
|---|---|---|---|
| List / table row | identifier + 2–5, on ≤2 lines (meta on one line) | row click + ≤1 inline | hover toolbar or ⋯; detail or peek |
| Table | 4–7 columns | 1 primary per view, bulk on selection | column picker; detail |
| Entity card | title + 2–4 | ≤1 primary + 1 secondary | expand, or the detail view |
| Product card (listing) | image + name + price + 1–2 decision facts | card click (+ ≤1 visible, never hover-only) | product page |
| Stat tile | 1 number + label + ≤1 comparison | tile click | drill-down |
| Record header | identifier + status + ≤3 key facts | 1 primary + ≤2 secondary | tabs, side panel, ⋯ |
| Dashboard | ≤5 regions, ≤4 charts, ≤4 headline numbers | ≤1 per region | drill-down pages, a second view |
| Hero | headline ≤2 lines + lede ≤2 lines + ≤1 moment (proof or delight) | 1 (+1 quiet link); a tool hero holds its own CTA, ≤3 inputs | the next sections |
| Landing section | 1 claim + 1 proof, ≤3 sub-points | ≤1 | FAQ `<details>`, docs, comparison page |
| Pricing card | plan + price + who-for line + ≤5 features | 1 | comparison table |
| Form step | 1 question or task; ≤7 fields | 1 primary (Back on top) | "+ Add details", a later step, derived values |
| Settings group | ≤7 settings | auto-save, or 1 save per page | sub-page, "Advanced" disclosure |
| Dialog | title + ≤2 sentences + ≤3 fields | 1 primary + 1 secondary | a page or drawer |
| Drawer / side panel | identifier + ≤8 facts in groups | 1 primary + ≤2 | the full record page |
| Popover | ≤5 facts | ≤2 | the detail view |
| Tooltip | 1 line, non-essential | 0 | (essential info never lives here) |
| Toast | 1 line | ≤1 (Undo) | activity log |
| Menu | ≤7 ungrouped, or groups of ≤5 | – | search inside the menu, sub-menu |
| Toolbar | – | 1 primary + ≤3 visible | ⋯ |
| Sidebar nav | ≤7 top items | 1 create | groups, "More", command palette |
| Mobile tab bar | 3–5 tabs | – | a "More" tab, in-screen nav |
| Empty state | title + 1 sentence | 1 | docs link |
| Chat answer | the answer first, ≤1 screen | ≤3 follow-ups | collapsed sources, "Show steps" |
| Notification item | 1 line + time | ≤1 | the thing it points to |

## When it overflows
1. **Grade** every item: decides, delights, nothing (SKILL.md). Optional: `scripts/grade.mjs spec.json --surface <row>` ranks with a fast decision model when `OPENROUTER_API_KEY` is set (experimental); without a key it prints the same questions for you to answer.
2. **Throw away** "nothing": system facts (sync time, internal IDs, warehouse, distance when time is shown), duplicates, anything the person can't act on. Not "one step away": gone.
3. **Keep** the top-ranked "decides" up to the max, plus at most one "delights" moment where the surface has room for one (hero, empty state, success).
4. **Move** the rest one step away, choosing by what it is:
   - an explanation or definition of something visible → tooltip (never essential);
   - more of the same kind → "Show more" or expand in place;
   - details of this object → the detail view, peek or side panel;
   - more actions → ⋯ or the hover toolbar (never the only path on touch);
   - a comparison → a table or page of its own;
   - a setting → settings, near where it applies.
5. **Say where it went** in the handover, one line per moved group ("SKU, weight → product page specs").
