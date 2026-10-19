# Operate: product apps, editors, admin, settings

Contents: The bar · Pick the pattern · Before building a screen · Detail container · Shell and header · Lists and tables · Reads as a product · Settings · Screen budgets · Behaviour · Never → instead.

Profile: `data-profile="app"`, primary width 1440. Colour: attention only; the accent marks the primary, the selection and real state, under ~5% of the view.

Success: the person completes the task and gets back to work. A calm product with one job per view; never a raw HTML page or everything at once.

## The bar
- **Benchmark:** the best product in this category, named (B2B work tool: Linear, Figma, Things). Never the domain's dated look.
- **Brand** enters only through type, palette, density and one signature move. Navigation and controls stay standard.

## Pick the pattern
1. **The noun picks the type:** the object the person works on (deal, ticket, order, booking, patient, issue) → its block in `references/product-types.md`, whatever the product is called.
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
3. **Compose, don't invent:** one outer layout (shell-sidebar), one inner layout per pane, plus overlays (command-palette, copilot-panel). Two layouts in one prompt: the dominant object's owns the frame, the other is a view tab ("list and board" = one query, two views). Several types: the dominant object picks the shell; the rest are views, not apps. Nothing fits: name the nearest entry and the difference, and ask.
4. **"Dashboard for X" = X's work queue first.** A real dashboard only for types 8, 19, 21. "Admin panel" over existing data = type 1. "AI-powered X" is still type X. Two audiences = two surfaces, each in its register.
5. **Unsure:** ask "Who opens this first thing in the morning, and what do they do?"

## Before building a screen
1. **Job:** the one decision it serves ("what do I do next, and for whom").
2. **Fields:** every attribute marked list column (count: `references/budgets.md`, canonical for every number here), detail-only, or optional under Display; each gets a form from the value table.
3. **Grouping and sort:** by the person's next decision, not the data model. One default sort.
4. **Kit:** map every part (shell, header, view tabs, filter chips, table, avatar, status, progress, menu, panel, skeleton, empty); missing parts become kit variants first.
5. **States:** loading, true empty, filtered empty, one item, 200+, longest title, no permission.

## Detail container
- **inbox-3pane** when people move item to item (process, review, reply): keeps selection and scroll after an action; a queue advances to the next item.
- **list-peek** (non-modal, resizable, pushes the list aside) when the list is the main surface. The default.
- **record-page** (own route, breadcrumb back) when the record is its own workspace.
- **Create and edit** in a drawer over the current view; a modal only for a 1–3-field create.
- **Narrow:** the split becomes a stacked drill-down; Back restores scroll and selection.

## Shell and header
- **Global:** shell, navigation, header anatomy, panes, spacing, density. Local: what's inside a pane. Each pane gets its own surface; drawers and sidebars resize and remember their width.
- **Sidebar:** workspace switcher, search / ⌘K, personal (Inbox, My work), sections, saved views. One tone below the content, so the work leads. Icons stand for places, never actions.
- **Header, one anatomy everywhere:** start = breadcrumb or title, then view tabs; end = share/copy link, ⋯, primary, in that order. No description paragraph under the title.
- **⌘K / Ctrl+K** is the one door to search, navigation and actions. Every view, tab, filter and selection lives in the URL.
- **One question per view:** what is this, what do I do now? Needs-you first.

## Lists and tables
- **Form:** table when people compare or sort and records have 3+ typed attributes; list when they act one at a time; cards or board only for visual objects or a status workflow. Never cards for tabular records.
- **Anatomy, top to bottom:**
  1. **View tabs:** saved views, defaults first, ≤5 then "More"; personal options persist; "Set as default" and "Reset".
  2. **Filter bar:** a Filter button, active filters as chips ("Status: Active ✕"), "Clear filters" only when active. Labels match column headers. Live apply under 1s. No open filter sidebar. 0–3 quick filters visible.
  3. **Display menu:** layout, group by, order by, visible properties, density, empty groups. Hiding a property isn't filtering.
  4. **Header row:** sticky, row height, 12px muted sentence case, aligned like its cells; one default sort showing its arrow, the others on hover.
  5. **Group headers:** sticky; quiet label, muted count, collapse chevron, "+" on hover; empty groups hidden. Group by what the person acts on (overdue, today, this week, later; or status) once a list passes a handful.
  6. **Rows:** one height from the density token (2-line rows only at 48+); one shared grid template, so avatars, dates and bars line up across rows and groups.
  7. **Bulk bar:** on selection, floating at the bottom, never moving the layout: "N selected", ≤4 actions, ⋯, ✕. **Select-all across pages is explicit:** "All 50 on this page selected · Select all 1,284".
  8. **Footer:** pagination past ~50 rows, or virtualisation when measured slow. **Never infinite scroll on a goal list:** "Load more" or pages, position restored on Back.
- **Columns:** the first is the readable identifier, never an auto ID. Visible count per `budgets.md` (`table`, `grid`, `admin-table`); the rest via Display or detail. Resizable and hideable, with reset; column priority sets the drop order. Wider than the pane: pinned identifier, scroll cues (`rules/layout.md` Wide tables).
- **Values become forms:**

  | Value | Render |
  |---|---|
  | Person | 20px avatar, name in tooltip and accessible name; stacks ≤3 + "+N". Names written out in detail views, pickers, and wherever identity is the point |
  | Status, priority | Icon or dot from one vocabulary; icon alone when grouped by status, icon + word elsewhere |
  | Boolean | Icon or nothing, never Yes/No |
  | Tags | ≤2 quiet chips, then "+N" |
  | Progress | The bar alone (48–64px); "3 of 8" in tooltip and accessible name; the label only where there's room (cards, detail) |
  | Date | "Oct 18"; year only outside the current year; relative ("2d") only for recency |
  | Money, counts | End-aligned, `tabular-nums` |
  | Codes, phone numbers | Start-aligned |

  Never repeat the column name in the cell ("Qualified", not "Lead: Qualified"). One line per item; markers at the end, reasons in tooltips.
- **Row actions:** ≤1 pulled out (often the completing status circle); the rest in ⋯, mirrored by a right-click menu. Inline edit only for low-stakes single fields, through the detail view's popover pickers; a `grid` edits every editable cell in place, by keyboard.
- **States:** loading = skeleton rows at real height inside the pane, never "No results" while loading. True empty = toolbar, filters and headers hidden; one line plus a 1–2-word action ("New task"). Filtered empty = toolbar kept, filters echoed, "Clear filters".

## Reads as a product
- **Surfaces:** the app ground a step below the content panel; the list edge to edge inside one panel. No card per row, no card around the table.
- **Structure felt, not seen:** low-contrast row hairlines, or hover fills only. No column rules, no zebra, no borders on every cell, no centred cell text.
- **Row states:** hover = neutral full-row fill; selected = accent tint, stronger; focus = the ring; checked + selected reads differently from hover.
- **Type:** only the identifier carries weight (13–14px medium); meta 12–13px regular muted; IDs muted mono. Dense tools 13–14px; nothing read under 12. One family, ~5 roles, `tabular-nums` where numbers align.
- **Icons:** 14–16px, one stroke, sparing, never on coloured backgrounds. Red only on overdue or needs-you.

## Settings
An expose surface (`budgets.md` Expose by job): never graded as a drawer.
- 5–9 categories in a sub-nav. A settings screen = the category's sections, all expanded; ≥5 sections: a sticky anchor index. Sections of rows: label + one-line hint at the start, control at the end; ≤10 settings per section, then split.
- **Every setting in a section is visible.** Only rare settings (a last "Advanced" section) and the danger zone (last, visible) sit apart. No setting in a tooltip, hover or popover.
- Toggles and selects save instantly (`rules/actions.md` Toggles); text fields save per section.
- Members is a table. Billing and deletion go through review sheets.
- Settings search at ≥8 sections or ≥40 settings. Reset to default per setting or section.
- Preferences persist per person: never reset on reload or another device.
- **Rich, not loud:** row = glyph tile + label + value or hint at the start, control at the end. A noun with identity carries its glyph wherever it labels something, column headers included (`rules/visual.md` Crafted calm). Always-on = lock glyph + reason, never a faded control.
- **Dependent settings show the parent's state, never its control:** when a channel is off, its column header reads "Off" and its cells dim with saved values kept, same row height; the switch lives only on the channel row (`rules/states.md` One home per state).
- **Show what it does:** notification, digest, theme and template settings get a live preview, as a sticky aside when the main pane is ≥62rem, inline under the control otherwise.

## Screen budgets
| Screen | First screen | One layer down |
|---|---|---|
| List | Title, view tabs, Filter + chips, Display, 1 primary ("New …"), ≤1 secondary; columns per `budgets.md` | Import, export, column config; row actions in ⋯; detail in the panel |
| Detail | Title, status, ≤2 actions + ⋯; main = body and activity; side = key properties (`drawer` row) | The full record as `inspector` or `edit-form` rows (all fields, in sections); parallel sets as tabs (≤5); history behind an activity filter |
| Settings | Sub-nav; the category's sections, all expanded, anchor index; previews | Rare "Advanced" section last; danger zone last, visible |

- Table toolbar: the `budgets.md` Toolbar row. Export appears once rows exist, bulk on selection, "+" in a group on hover.

## Behaviour
- **Disclosure never moves the layout,** except trees and rows the person expands, or an inline form that replaces its row. Popover, menu or drawer, never a push-down fold-out.
- **Autosave everywhere.** An unsent input is a draft that survives reload; publish is the action.
- **The person decides:** manual choices persist per person. Never auto-open panels, auto-forward, re-sort under the pointer or pick "recents" for them.
- **Expert tools keep their shortcuts;** where a key changes meaning by mode, the mode is always visible.
- **Presence and permission** states show.
- **AI inside the product** works in the type's own objects: `references/ai.md`.

## Never → instead
| Never | Instead |
|---|---|
| A bare `<table>`/`<ul>` with browser styling | The kit's table or list; add it to the kit first |
| Everything on load (KPI tiles, filter sidebar, list, open detail) | One job per view; detail on selection; KPIs belong in Monitor |
| Edit in a centred modal | A side panel or drawer |
| Tabs that look like plain links; centred forms in a work tool | Kit tabs; start-aligned forms |
