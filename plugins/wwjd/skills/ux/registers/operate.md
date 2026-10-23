# Operate: product apps, editors, admin, settings

Profile: `data-profile="app"`, primary width 1440 (390 for a phone-first app). Colour: attention only; the accent marks the primary, the selection and real state, under ~5% of the view.

Success: the person completes the task and moves on. One job per view, detail on selection; never everything on load (KPI tiles belong in Monitor).

## The bar
- **Benchmark:** the best current product doing this job for this audience and platform (a dense pro tool, a consumer app and a developer tool each have their own). Never the domain's dated look.
- **Brand** enters only through type, palette, density and one signature move. Navigation and controls stay standard.

## Pick the pattern
1. **The noun picks the type:** the object the person works on (deal, ticket, order, patient) → its block in `references/product-types.md`.
2. **The verb picks the shell** (ids in `references/layouts.md`):

   | Verb | Layout | Types |
   |---|---|---|
   | track, move, list, manage | list-peek or board-kanban | 2, 3, 20 |
   | answer, reply, review, approve, triage | inbox-3pane | 10, 11, 26 |
   | book, schedule | calendar | 4 |
   | write | editor-preview or record-page | 12, 13 |
   | draw, build | workspace-canvas | 27 |
   | watch, report | dashboard (`registers/monitor.md`) | 8, 19, 21 |
   | find a place | map-list | 18, 25 |
   | pay, buy | Transact register | 9, 18, 22 |
   | configure | settings | 7 |
   | administer users, roles, keys, audit | admin-table → record-page, review sheets | 1 |
3. **Compose, don't invent:** one outer layout (shell-sidebar), one inner layout per pane, plus overlays (command-palette, copilot-panel). Several layouts or types in one ask: the dominant object owns the frame, the rest are view tabs. Nothing fits: name the nearest entry and the difference, and ask.
4. **"Dashboard for X" = X's work queue first.** A real dashboard only for types 8, 19, 21. "Admin panel" over existing data = type 1. "AI-powered X" is still type X. Two audiences = two surfaces, each in its register.
5. **Unsure:** ask "Who opens this, when, and what do they do first?"

## Before building a screen
1. **Job:** the one decision it serves ("what do I do next, and for whom").
2. **Fields:** mark each attribute list column (count: `references/budgets.md`, canonical for every number here), detail-only, or optional under Display; each takes a form from the value table.
3. **Grouping and sort:** by the person's next decision, not the data model. One default sort.
4. **Kit:** map every part to a kit component; missing parts become kit variants first.
5. **States:** SKILL.md's list plus filtered empty and 200+.

## Detail container
- **list-peek** (default; non-modal, resizable, pushes the list aside) when the list is the main surface.
- **inbox-3pane** when people move item to item (process, review, reply): selection and scroll survive an action; a queue advances to the next item.
- **record-page** (own route, breadcrumb back) when the record is its own workspace.
- **Create and edit** with the work still visible: a drawer or the detail pane; a modal only for a 1–3-field create; a page when the record is its own workspace.
- **Narrow:** the split becomes a stacked drill-down; Back restores scroll and selection.

## Shell and header
- **Same on every screen:** shell, navigation, header anatomy, panes, spacing, density; only pane contents vary. Each pane gets its own surface; drawers and sidebars resize and remember their width.
- **Navigation by place count:** a sidebar for many places or workspaces (switcher, search, personal views, sections, saved views; a tone step below the content), a top bar for a few, a tab bar on phones (`registers/native.md`). Icons stand for places, never actions.
- **Header, one anatomy everywhere:** start = breadcrumb or title, then view tabs; end = actions in one fixed order (e.g. share, ⋯, primary). No description paragraph under the title.
- **⌘K / Ctrl+K** is the one door to search, navigation and actions in expert and keyboard-heavy tools; simpler apps keep a visible search. Every view, tab, filter and selection lives in the URL.

## Lists and tables
- **Form:** `rules/layout.md` Table or list, always from the kit, never a browser-styled `<table>`/`<ul>`. Cards or board only for visual objects or a status workflow.
- **Anatomy, top to bottom** (only the parts the list needs; a short list needs no tabs, filters or Display):
  1. **View tabs:** saved views, defaults first, ≤5 then "More"; personal options persist, with "Set as default" and "Reset".
  2. **Filter bar:** a Filter button, active filters as chips ("Status: Active ✕"), "Clear filters" only when active; labels match column headers; live apply under 1s; 0–3 quick filters; a filter sidebar only for faceted browsing (`registers/transact.md` Listing).
  3. **Display menu:** layout, group by, order by, visible properties, density, empty groups. Hiding a property isn't filtering.
  4. **Header row:** sticky, row height, 12px muted sentence case, aligned like its cells; the default sort shows its arrow, others on hover.
  5. **Group headers:** sticky; quiet label, muted count, collapse chevron, "+" on hover; empty groups hidden. Past ~7 items, group by what the person acts on (overdue, today, this week, later; or status).
  6. **Rows:** one height from the density token (2-line rows only at 48+); one shared grid template across rows and groups.
  7. **Bulk bar:** on selection, floating at the bottom without moving the layout: "N selected", ≤4 actions, ⋯, ✕. Select-all across pages is explicit: "All 50 on this page selected · Select all 1,284".
  8. **Footer:** pagination past ~50 rows (virtualise only when measured slow); never infinite scroll on a goal list: "Load more" or pages, position restored on Back.
- **Columns:** the first is the readable identifier, never an auto ID. Visible count per `budgets.md` (`table`, `grid`, `admin-table`); the rest via Display or detail. Resizable and hideable, with reset; priority sets the drop order. Too wide: `rules/layout.md` Wide tables.
- **Values become forms** (dense tables; roomier lists may write values out):

  | Value | Render |
  |---|---|
  | Person | 20px avatar, name in tooltip and accessible name; stacks ≤3 + "+N". Names written out where identity is the point (detail, pickers) |
  | Status, priority | Icon or dot from one vocabulary; icon alone when grouped by status, icon + word elsewhere |
  | Boolean | Icon or nothing, never Yes/No |
  | Tags | ≤2 quiet chips, then "+N" |
  | Progress | The bar alone (48–64px); "3 of 8" in tooltip and accessible name |
  | Date | Short ("Oct 18"); year only outside the current year; relative ("2d") only for recency (`rules/copy.md` Time) |
  | Money, counts | End-aligned, `tabular-nums` |
  | Codes, phone numbers | Start-aligned |

  Never repeat the column name in the cell ("Qualified", not "Lead: Qualified"). One line per item; markers at the end, reasons in tooltips.
- **Row actions:** ≤1 pulled out (often the completing status circle); the rest in ⋯ and a right-click menu. Inline edit only for low-stakes single fields, via the detail view's popover pickers; a `grid` edits every editable cell in place, by keyboard.
- **States** (`rules/states.md` Data states): skeleton rows inside the pane, never "No results" while loading. True empty hides toolbar, filters and headers: one line plus a 1–2-word action ("New task"). Filtered empty keeps the toolbar.

## Reads as a product
- **Surfaces:** the app ground one tone step below the content panel; the list edge to edge inside it. No card per row or around the table.
- **Structure felt, not seen:** low-contrast row hairlines or hover fills only. No column rules, zebra or per-cell borders (a `grid` or wide numeric table read across may add faint zebra); never centred cell text.
- **Row states:** hover = neutral full-row fill; selected = stronger accent tint; focus = the ring; checked + selected differs from hover.
- **Type:** only the identifier carries weight (medium, at the density's body size); meta 12–13px regular muted; IDs muted mono.
- **Icons:** 14–16px, sparing, never on coloured backgrounds. Red only on overdue or needs-you.

## Settings
An exposure surface: everything visible per `budgets.md` Expose by job (sections expanded, anchor index, search, rare and danger zone last); never graded as a drawer.
- 5–9 categories in a sub-nav, one page when there are few; ≤10 settings per section, then split.
- Toggles and selects save instantly (`rules/actions.md` Toggles); text fields save per section. Reset to default per setting or section.
- Members is a table.
- **Rich, not loud** (`rules/visual.md` Crafted calm): row = label + current value or one-line hint at the start, control at the end. Add what the job earns: the noun's identity mark (icon, logo, avatar or swatch) when it has one, also on its column header; a dense or developer-facing page may stay label + value. Always-on = lock icon + reason, never a faded control.
- **Dependent settings show the parent's state, never a copy of its control:** while a parent (a notification channel, a feature) is off, its dependents read "Off" and dim, keeping their saved values and size; the switch lives only on the parent's row (`rules/states.md` One home per state).
- **A preview** where a label can't show the effect (notifications, digests, themes, templates): sticky aside when the main pane is ≥62rem, else inline.

## Screen budgets
| Screen | First screen | One layer down |
|---|---|---|
| List | Title, view tabs, Filter + chips, Display, 1 primary ("New …"), ≤1 secondary; columns per `budgets.md` | Import, export, column config; row actions in ⋯; detail in the panel |
| Detail | Title, status, ≤2 actions + ⋯; main = body and activity; side = key properties (`drawer` row) | The full record as `inspector` or `edit-form` rows (all fields, in sections); parallel sets as tabs (≤5); history behind an activity filter |

- Table toolbar: the `budgets.md` Toolbar row; "+" in a group on hover.

## Behaviour
- **Disclosure** per `rules/actions.md` Disclosure; an inline form may also replace its row. Popover, menu or drawer, never a push-down fold-out.
- **Autosave everything;** publish is the action.
- **The person decides:** manual choices and preferences persist per person, across reloads and devices. Never auto-open panels, auto-forward, re-sort under the pointer or pick "recents" for them.
- **Expert tools keep their shortcuts;** where a key changes meaning by mode, the mode is always visible.
- **Presence and permission** states show.
- **AI inside the product** works in the type's own objects: `references/ai.md`.
