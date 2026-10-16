# SaaS and work tools: structure, lists, budgets

Read this for any product-app screen (Operate). A SaaS screen should read as a calm product with one job per view, not a raw HTML page or a screen that shows everything at once.

## 1. Before building any SaaS screen
1. **Blueprint:** pick it from the table below, and the detail container by its rule.
2. **Job:** write the one decision this screen serves ("what do I do next, and for whom").
3. **Fields:** list every attribute and mark each as a list column (at most 6), detail-only, or optional under Display. Give each a form from the value table (§3).
4. **Grouping and sort:** group by the person's next decision, not by the data model. One default sort.
5. **Actions:** one primary per region, at most one inline row action, everything else in ⋯, the context menu or the bulk bar.
6. **Kit:** map every part to a kit component (shell, header, view tabs, filter chips, table, avatar, status, progress, menu, panel, skeleton, empty). Missing parts become kit variants first.
7. **States:** loading, true empty, filtered empty, one item, 200+, the longest title, no permission.
8. **Check** against the bans (§6) and the render at 1440 and 390.

## 2. Blueprints
| Prompt says | Blueprint | Detail container |
|---|---|---|
| list, manage, track, CRM, tasks, orders, records | List → detail | Peek panel by default; full page for big records |
| inbox, notifications, review, approve, queue, triage, support | Inbox | Split view, always |
| editor, doc, canvas, builder | Workspace | Inspector at the end, tools at the start |
| settings, preferences, account, billing, integrations | Settings | Sub-nav plus section pages |
| users, roles, permissions, audit, API keys | Admin | List → detail, with review sheets |
| dashboard, overview, metrics | `registers/monitor.md` | Drill into a list |

- **Choosing the detail container:**
  - **Split view** when people move item to item (process, review, reply). It keeps selection and scroll after an action, and a queue advances to the next item.
  - **Peek panel** (non-modal, resizable, pushes the list aside) when the list is the main surface.
  - **Full page** (own route, breadcrumb back) when the record is its own workspace.
  - **Create and edit** happen in a drawer over the current view. A modal only for a create of 1–3 fields.
  - **Narrow widths:** the split view becomes a stacked drill-down. Back restores scroll and selection.
- **Shell:**
  - **Sidebar:** workspace switcher, search / ⌘K, personal (Inbox, My work), sections, favourites or saved views. It sits one tone below the content, so navigation recedes and the work leads. Icons stand for places, never actions.
  - **Header:** one fixed anatomy on every page.
    - Start: breadcrumb or title, then view tabs.
    - End: share/copy link, then ⋯, then the primary, always in the same order.
    - No description paragraph under the title.
  - **List bar:** Filter and Display on list views only.
- **Settings:**
  - 5–9 categories in the sub-nav. Each page holds sections of rows: label and one-line hint at the start, control at the end.
  - Choices of 2–4 options are segmented buttons under their label.
  - Toggles and selects save instantly. Text fields save per section.
  - Members is a table. Billing and deletion go through review sheets. The danger zone comes last.

## 3. Lists and tables
- **Pick the form:**
  - **Table:** people compare or sort across rows, and records have 3+ typed attributes.
  - **List:** people act on items one at a time.
  - **Cards or board:** visual objects or a workflow by status. Never cards for tabular records.
- **Anatomy, top to bottom:**
  1. **View tabs:** saved views, defaults first, at most 5 then "More". Personal options persist; "Set as default" and "Reset" exist.
  2. **Filter bar:**
     - A Filter button, then active filters as chips ("Status: Active ✕"). "Clear filters" appears only when something is active.
     - Filter labels match the column headers.
     - Apply live when results return in under 1s.
     - No open filter sidebar by default.
  3. **Display menu:** layout, group by, order by, visible properties, density, show empty groups. Hiding a property is not filtering.
  4. **Header row:**
     - Sticky, at row height. Labels 12px, muted, sentence case, aligned like their cells.
     - One column sorted by default, showing its arrow; the others show the arrow on hover.
  5. **Group headers:** sticky; a quiet label, a muted count, a collapse chevron, and "+" on hover. Empty groups are hidden.
  6. **Rows:** one constant height from the density token (32–36 compact, 40–44 comfortable; 48+ only for 2-line rows). Every row shares one grid template, so avatars, dates and bars line up across rows and groups.
  7. **Bulk bar:** appears on selection, floating at the bottom so it never moves the layout. "N selected", up to 4 actions, ⋯, ✕.
  8. **Footer:** pagination past about 50 rows, or virtualisation when measured slow.
- **Columns:** the first column is the readable identifier, never an auto ID. 4–6 visible at 1440; the rest via Display or the detail view. Columns are resizable and hideable, with a reset. Column priority sets the drop order (`commands/fit.md`).
- **Values become forms:**
  | Value | Render |
  |---|---|
  | Person | 20px avatar; stacks cap at 3 plus "+N"; name in the tooltip and accessible name |
  | Status, priority | Icon or dot from one vocabulary; icon alone when the view is grouped by status, icon plus word elsewhere |
  | Boolean | Icon or nothing, never "Yes"/"No" |
  | Tags | Up to 2 quiet chips, then "+N" |
  | Progress | The bar alone (about 48–64px); "3 of 8" in its tooltip and accessible name |
  | Date | "Oct 18"; the year only outside the current year; relative ("2d") only for recency |
  | Money, counts | End-aligned, `tabular-nums` |
  | Codes, phone numbers | Start-aligned |
  - Never repeat the column name in the cell: "Qualified", not "Lead: Qualified".
- **Row actions:**
  - At most one action pulled out of the menu (often the status circle that completes the item); the rest in ⋯, mirrored by a right-click menu.
  - Inline edit only for low-stakes single fields, through the same popover pickers as the detail view.
- **States:**
  - **Loading:** skeleton rows at real row height, inside the pane. Never "No results" while loading.
  - **True empty:** hide the toolbar, filters and headers. One line plus one 1–2-word action ("New task").
  - **Filtered empty:** keep the toolbar, echo the filters, offer "Clear filters".

## 4. What makes it read as a product
- **Surfaces:** the app background sits a step below the content panel. The content panel is one surface, with the list edge to edge inside it. No card per row, no card around the table.
- **Structure is felt, not seen:** low-contrast hairlines between rows, or none with hover fills. No column rules, no zebra stripes.
- **States:**
  - Hover is a neutral full-row fill.
  - Selected is an accent-tinted fill, stronger than hover.
  - Focus is the ring.
  - Checked plus selected reads differently from hover.
- **Type in a row:**
  - Only the identifier carries weight: 13–14px, medium.
  - Meta is 12–13px, regular, muted.
  - IDs are muted monospace.
- **Icons and colour:** icons 14–16px, one stroke weight, used sparingly, never on coloured backgrounds. Grey by default; red only on overdue or needs-you; the accent only on the primary, selection and focus.

## 5. Screen budgets
| Screen | First screen | One layer down |
|---|---|---|
| List | Title, view tabs, Filter plus chips, Display, 1 primary ("New …"), at most 1 secondary; 4–6 columns; rows | Import, export, column config in ⋯ or Display; row actions in ⋯; detail in the panel |
| Detail | Title, status, at most 2 actions plus ⋯; main column = body and activity; side panel = at most 7 key properties | Other properties under "More fields"; parallel sets as tabs (at most 5); history behind an activity filter |
| Settings | Sub-nav; one section's fields (at most 7 per group) | Advanced as a collapsed group at the end; danger zone last |

- **Toolbar:** at most 5 table toolbar actions.
- **Filters:** 0–3 quick filters visible as chips.
- **Reveal in context:** export once rows exist, bulk on selection, "+" in a group on hover.

## 6. Bans: never this, do that instead
| Never | Instead |
|---|---|
| A bare `<table>`/`<ul>` with browser styling | The kit's table or list primitive with tokens; add it to the kit first if missing |
| No header row | A sticky header row with a default sort |
| "Assigned to Sara Lind" written in the row | A 20px avatar in an Assignee column |
| Row height that varies with content | One density token; meta on one line, in its compact form or dropped |
| A flat list of 40 items | Groups by the person's next decision, with sticky group headers |
| Everything on load (KPI tiles, filter sidebar, list and open detail) | One job per view; detail opens on selection; KPIs belong in Monitor |
| 12 facets in an open sidebar | A Filter button and chips |
| Edit, Delete, Assign, Complete buttons on every row | One inline action, then ⋯ and the context menu |
| Edit in a centred modal | A side panel or drawer |
| A full-page spinner | Skeleton rows in the pane |
| Every database field as a column | 4–6 decision columns; the rest via Display or the detail view |
| Zebra stripes, borders on every cell, centred cell text | Soft separators, start-aligned text, end-aligned numbers |
| ISO or locale-default dates | "Oct 18" |
| A card grid for records | A list or table |
| A toolbar and filters on an empty list | The true-empty state, toolbar hidden |
| Each screen inventing its own header | One shell header anatomy with a fixed action order |
