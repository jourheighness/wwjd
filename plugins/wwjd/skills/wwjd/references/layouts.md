# Layouts

38 layouts. Read the index, grep `### <id>`, read one entry. `kit` classes live in `kit/layouts.css` (copy it); other entries carry their key CSS inline.

## Index

| id | job | use when (register · product types) | kit |
|---|---|---|---|
| shell-sidebar | global frame of a product app | Operate, Monitor · 1–5, 7, 9, 10, 12–14, 17, 19–25 | `.shell` |
| inbox-3pane | process items one after another, queue in view | Operate · 10, 26, 11, review queues | `.inbox` |
| list-peek | list is the surface; side panel previews/edits the selection | Operate · 1, 2, 3, 5, 17, 20 | `.list-peek` |
| record-page | a record that is its own workspace | Operate · 2, 5, 10, 14, 17, 20, 24 | `.record` |
| workspace-canvas | create on a canvas, tools start, inspector end | Operate · 27, 12, 15 | – |
| settings | sub-nav plus section pages | Operate (Flow for plan changes) · 7, every SaaS | `.settings` |
| admin-table | manage records across rows | Operate · 1, 5, 9, 14, 17, admin | – |
| board-kanban | move items through a workflow by status | Operate · 2, 3, 17, 20 | – |
| calendar | week/day grid plus mini-month | Operate (booker: Flow/Transact) · 4, 16, 17, 24, 25 | – |
| map-list | browse results that have a place | Transact, Operate · 18, 25, 22 | – |
| dashboard | L0 strip plus regions | Monitor · 8, 19, 21, admin overview | – |
| chat-artifact | threads, conversation, artifact pane | Converse · 6, 11 | – |
| copilot-panel | AI side panel docked beside the app's view | Converse in Operate · any type with AI | `.shell > .inspector` |
| command-palette | one door to search, navigation and actions | Operate, Reference · all | – |
| wizard | stepper, step, action bar | Flow · 15, 16, 18, 22, onboarding | `.wizard` |
| auth-card | sign in / sign up | Flow · all | `.auth` |
| empty-first-run | first use that leads to first value | Operate, Flow · all Operate | `.empty` (base) |
| editor-preview | edit beside a live preview on the real template | Operate · 12, 15, 16 | – |
| file-browser | grid ⇄ list with an info panel | Operate · 23, 12, 27 | – |
| timeline-gantt | work over time, sticky label column | Operate · 3, 20, 25, 17 | – |
| landing | hero, proof, argument, pricing, FAQ, footer | Persuade · marketing | `.container` `.grid-12` |
| pricing | plan cards plus comparison table | Persuade, Transact · SaaS, 9 | – |
| product-detail | gallery, buy box, specs, reviews | Transact · stores, 18 | – |
| listing-search | facets plus results | Transact · 18, 5, 23 | – |
| feed | browse a stream in an adaptive grid | Showcase, Transact · 18, media, 23 | `.tiles` |
| cart-checkout | steps plus order summary | Transact, Flow · stores, 18, 9 | – |
| docs | nav tree, content, on-page contents | Reference · docs, 13, 16 | `.docs` |
| article | reading column, breakouts, sidenotes | Editorial · blogs, reports, 8 | `.article` |
| blog-index | scannable posts without cards | Editorial · blogs | – |
| changelog | dated entries with anchors | Reference · all products | – |
| case-study | portfolio index plus case page | Showcase · portfolios | – |
| status-page | public service health | Monitor (public) · 21 | – |
| error-page | 404 / 500 | the site's register · all | – |
| mobile-tabs-stack | tab bar plus a stack per tab | native · 22, 11, 26, 25 | – |
| mobile-master-detail | list → pushed detail | native · 26, 10, 20, 2 | – |
| bottom-sheet | content over context, with detents | native · 18, 25, filters, pickers | – |
| fullscreen-flow | focused task, app chrome hidden | Flow + native · 22, signup, checkout | – |
| fab | one floating primary create action | native (Material) · 26, 3, 22 | – |

## How to pick
1. **Register first** (SKILL.md register table), for the surface, not the product. Persuade, Editorial, Reference, Transact and Showcase use section B; Flow uses wizard, auth-card or fullscreen-flow.
2. **Operate:** the verb → layout table and the detail container (inbox-3pane / list-peek / record-page) live in `registers/operate.md`.
3. **Compose; don't invent.** One outer layout (shell-sidebar or a page grid), one inner layout per pane, plus overlays (command-palette, copilot-panel, bottom-sheet). Two layouts in one prompt: the dominant object's owns the frame, the other is a view tab ("list and board" = one query, two views).
4. **Every width tier gets its own form;** the ≤480 form is designed, not the desktop stacked. Mobile and native add section C.
5. **Nothing fits?** Name the nearest entry and the difference, and ask before inventing one.

## Conventions
- **Width tiers** (container, rem): XL ≥80 (1280) · L ~64 (1024) · M ~48 (768) · S ≤30 (480).
- **Containers:** `.shell` is container `shell`, its main pane container `main`; layouts inside the app query `main`. Pages outside the shell query the viewport. Top-layer overlays (dialogs, palettes, sheets) use `@media`, never `@container`.
- **Panes** are sibling scroll regions (`min-block-size:0; overflow:auto; scrollbar-gutter:stable`); never a scroll inside a scroll. The shell is `100dvh`.
- **Absent areas:** a child whose area is missing at this width is `display:none` or in an overlay, or it lands in an implicit track.
- **Resizable panes:** handle is `role="separator"`, arrow keys move it, double-click resets, width remembered per person, width in a custom property (`--list-w`).
- **Shared sizes:** header 48px (control 32 + 2×8); nav 15rem, rail 3.5rem; inspector 18–20rem; peek, drawer, copilot 25–30rem; text tracks `minmax(12ch,1fr)`; panels `min(Xrem,100%)`.

---

# A. App shells

### shell-sidebar: global frame of a product app; navigation recedes, the work leads
Kit: `.shell` (`.nav` · `main` · `.inspector`).
```
+----------+-----------------------------------+
| ws ▾  ⌘K | crumb · view tabs        ⋯ [New] | header 48
| Inbox    +-----------------------------------+
| My work  |   main (one pane surface)         |
| ☆ Views  |                                   |
| avatar ? |                                   |
+----------+-----------------------------------+
```
- **Regions:** nav 15rem, resizable 12.5–20rem, one tone below the content (`--surface-1`); header 48px sticky; main `minmax(0,1fr)` on `--surface-2`, optionally inset 8px with radius 8.
- **Responsive:** ≥1280 full nav · ~1024 icon rail 3.5rem · ~768 nav becomes a drawer from the header · ≤480 bottom tab bar, 3–5 places (mobile-tabs-stack).
- **Mistakes:** sections in a top nav and a side nav → one nav; action icons in the nav → nav icons are places only; nav on the content's tone → one tone below; a header layout per page → one header anatomy.
- **Example:** Linear.

### inbox-3pane: process items one after another, keeping the queue in view
Kit: `.inbox` (`.views` · `.list` · `.thread` · `.context`).
```
+------+---------------+----------------------+---------+
|Views |● Subject   2m | Thread title  [Reply]| Customer|
|Mine 4|  preview line | message              | facts   |
|Unass.|▸ selected     | + composer -------+  | orders  |
+------+---------------+----------------------+---------+
```
- **Regions:** views 14rem; list 20–25rem, resizable, min 17.5rem; thread `1fr`, min 30rem, ~70ch reading column inside; context 18rem, toggled and remembered; sticky thread header; sticky composer at the bottom.
- **Responsive** (main pane width): ≥84rem all four · <84rem context becomes a drawer · <66rem views move to a dropdown in the list header · <48rem stacked drill-down; back restores scroll and selection.
- **Mistakes:** item opens in a modal → split pane; jump to top after an action → advance to the next item, keep scroll; six meta fields per row → sender, subject, one preview line, time; context forced open at 1024 → toggle and remember.
- **Example:** Front. Superhuman is the single-pane variant.

### list-peek: the list is the main surface; a non-modal panel previews and edits the selection
Kit: `.list-peek` (`.list` · `.peek`, width `--peek-w`).
```
+------------------------------+------------------+
| Issues · Active  Filter Display| ✕ ⤢ ENG-412   ⋯ |
| ▾ Today 3                     | ● In progress   |
|  ▸ row -------- ◔ ● Oct 18    | properties      |
|  ▸ row (selected)             | activity        |
+------------------------------+------------------+
```
- **Regions:** list `minmax(32rem,1fr)`; peek 25–30rem, resizable 22.5rem to 50%, **pushes** the list, never covers it; ⤢ opens the record page; Esc closes and returns focus to the row; j/k moves the selection while open.
- **Responsive:** ≥1280 pushes · ~1024 overlays as a drawer · ~768 the record is a full-page route · ≤480 list, then pushed detail.
- **Mistakes:** modal record view → peek; peek open on load → only on selection; peek covering the selected row → push; edit modal on the peek → edit in place.
- **Example:** Linear issue peek.

### record-page: a record that is its own workspace
Kit: `.record` (`.head` · `.body` · `.side`).
```
+------------------------------------------------+
| ‹ Deals / Acme renewal     ● Won   [Action]  ⋯ |
| Overview   Activity   Files                     |
+-----------------------------+------------------+
| body, notes, activity       | ≤7 key properties|
|                             | related records  |
+-----------------------------+------------------+
```
- **Regions:** sticky header: title (wraps), status, at most 2 actions + ⋯; at most 5 tabs; body `1fr`, reading content ≤48rem; side 16–20rem, sticky under the header.
- **Responsive:** ≥1024 two columns · ~768 side stacks **above** the body as a compact property list, the rest under "More fields" · ≤480 one column, actions in ⋯ or a sticky bottom bar.
- **Mistakes:** properties as a form in the body → side list with popover pickers; >7 side properties → "More fields"; tabs as activity filters → filter inside Activity; description paragraph under the title → none.
- **Example:** GitHub issue.

### workspace-canvas: create on a canvas with tools at the start and the inspector at the end
```
+---------------------------------------------------+
| File ▾   ▸ ◻ ○ T ✎            Share  ▶   100% ▾  |
+--------+-----------------------------+------------+
| Layers |          canvas             | Inspector  |
| Pages  |     + context toolbar +     | (selection |
|        |                             |  or doc)   |
+--------+-----------------------------+------------+
```
- **Regions:** top bar 48px; layers 15rem, resizable; canvas `1fr`, pans and zooms inside itself, never scrolls the page; inspector 15–17.5rem; context toolbar beside the selection (tools may float at the bottom instead).
- **Responsive:** ≥1280 all panes · ~1024 layers toggle (⌘\) as an overlay · ~768 inspector becomes a bottom sheet · ≤480 view and comment only.
- **CSS:** `grid-template:"bar bar bar" 3rem "left canvas right" 1fr / var(--left-w,15rem) minmax(0,1fr) var(--right-w,16rem)`; canvas `overflow:hidden; position:relative`.
- **Mistakes:** property dialogs → inspector; panels covering the selection → dock at the edges; active tool or mode not shown → show it; empty inspector with no selection → document properties.
- **Example:** Figma UI3.

### settings: sub-nav plus section pages
Kit: `.settings` (`.subnav` · `.body`), rows `.setting`.
```
+------------+-------------------------------------+
| ‹ Back     | Profile                              |
| Account    | Name               [__________]      |
|  Profile   | Theme              [Light|Dark|Auto] |
| Workspace  | Email digests              [toggle]  |
|  Members   | -- Danger zone --  [Delete account…] |
+------------+-------------------------------------+
```
- **Regions:** sub-nav 14rem replaces the app nav or sits inside main; content ≤45rem, start-aligned; rows: label and hint at the start, control at the end; 5–9 categories; danger zone last.
- **Responsive:** ≥1024 sub-nav + content · ~768 sub-nav becomes an index page, sections drill in · ≤480 grouped list then push; control stacks under its label.
- **Mistakes:** one long form → section pages; centred floating card → start-aligned column; Save on toggles → instant save; danger zone mid-page → last.
- **Example:** Linear settings.

### admin-table: manage records across rows
```
+-------------------------------------------------+
| Members  [All][Admins][Invited]      ⋯ [Invite] |
| Filter  Role: Admin ✕                 Display   |
+--+---------------+---------+--------+----------+
|☐ | Name ↓        | Role    | Active |    Seats | sticky 32
|☐ | Sara Lind     | Admin   | Oct 18 |        3 | --row-h
|     [ 3 selected · Suspend · Change role · ⋯ ✕ ]| floating
+-------------------------------------------------+
```
- **Regions:** view tabs 36px; filter bar at control height; table edge to edge, header 32px, rows `--row-h`; identifier column `minmax(14ch,2fr)`, sticky on horizontal scroll; bulk bar floats at the bottom; paginate past 50 rows.
- **Responsive:** ≥1280 4–6 columns · ~1024 columns drop by priority · ~768 identifier, status and the one deciding number · ≤480 two-line list items. Sideways scroll only when comparing is the job: sticky first column inside a focusable region.
- **CSS:** grid `2.5rem minmax(14ch,2fr) repeat(3,minmax(9ch,1fr)) 6rem`; each row `grid-column:1/-1; grid-template-columns:subgrid`; low-priority cells get a class hidden by container query.
- **Mistakes:** KPI tiles above the table → that's Monitor; buttons on every row → one inline action + ⋯; card around the table → edge to edge; zebra stripes or centred cells → hairlines, start-aligned.
- **Example:** Stripe Customers.

### board-kanban: move items through a workflow by status
```
+----------------------------------------------------->
| Project · Board            Filter   Display   [New]
| +Todo 4  ++ +In progress 2+ +Review 1+ +Done ▸+
| | card    | | card        | | card   | +------+
| | + New   | |             | |        |
```
- **Regions:** columns fixed 17–20rem, gap 12; board scrolls sideways (focusable, labelled), each column vertically; sticky column headers; Done collapsible; optional swimlanes with sticky lane headers.
- **Responsive:** ≥1280 4–5 columns · ~1024 3 · ~768 2 with snap · ≤480 one column per screen with mandatory snap and a switcher, or a list grouped by status.
- **CSS:** `grid-auto-flow:column; grid-auto-columns:var(--col-w,18rem); overflow-x:auto; scroll-snap-type:x proximity`; column `grid-template-rows:auto minmax(0,1fr)`; ≤480 `--col-w:calc(100% - 2.5rem)`, snap mandatory.
- **Mistakes:** board for records with no workflow → table; drag the only way to move → menu and keyboard too; columns squeezed to fit → fixed width plus scroll; 8 fields per card → identifier, status, avatar, one deciding meta.
- **Example:** Linear board.

### calendar: week/day grid plus a mini-month sidebar
```
+----------+-----------------------------------------+
| [Create] | ‹ › Today   Oct 12–18, 2026     Week ▾  |
| . mini   |     Mon   Tue   Wed   Thu   Fri  Sat Sun|
|   month  | 09 +---+                                |
| ☑ Work   | 10 |ev |       -- now --                |
+----------+-----------------------------------------+
```
- **Regions:** sidebar 16rem; time gutter 3.5rem; hour rows 48px (15-min rows 12px); sticky day header and gutter; all-day row; opens scrolled to now or working hours; details in a popover anchored to the event; drag to create. Variants: resources (one column per person or room); booker (event info | month | slots).
- **Responsive:** ≥1280 week + sidebar · ~1024 sidebar toggles · ~768 3 days · ≤480 one day with a week strip, swipe between days, or agenda. Booker stacks info → month → slots.
- **CSS:** week `grid-template-columns:3.5rem repeat(var(--days,7),minmax(0,1fr)); grid-auto-rows:calc(var(--hour-h,3rem)/4)`; event `grid-column:calc(var(--day) + 1); grid-row:calc(var(--q) + 1)/span var(--len)`; `--days` 3 at M, 1 at S.
- **Mistakes:** month as the scheduling default → week; edit in a centred modal → popover, then side panel; unlabelled timezone → labelled, switchable; view resets to midnight → scroll to now.
- **Example:** Google Calendar.

### map-list: browse results that have a place
- **Regions:** list ~60%, card grid min 16rem; map ~40%, sticky full height; hover or focus on a card highlights its pin and the reverse; "Search as I move the map" is opt-in. Dispatch variant: map | unassigned queue | per-technician timeline.
- **Responsive:** ≥1280 two-column cards + map · ~1024 one column + map · ~768 floating List/Map toggle · ≤480 full-screen map, list in a bottom sheet.
- **CSS:** `grid-template-columns:minmax(0,3fr) minmax(20rem,2fr)`; map `position:sticky; top:var(--header-h); block-size:calc(100dvh - var(--header-h))`.
- **Mistakes:** results change as the map pans → "Search this area"; pins with no list equivalent → the list is the source of truth for keyboard and screen readers; map scrolls away → sticky.
- **Example:** Airbnb.

### dashboard: an L0 strip plus regions
```
+-------------------------------------------------+
| Prod · Last 6h (UTC) · Live 12s ago · On call  |
| ◆ sev-2 checkout 5xx · unacked  [Ack]   +2 more | L0
+------------------------------+------------------+
| Services, worst first        | Error rate / p99 | L1
| ● api  __# 2.1%  __= 840ms   | (shared x-axis)  |
+------------------------------+------------------+
| Recent deploys (5)                              |
+-------------------------------------------------+
```
- **Regions:** header line; L0 full width, ≤5 rows, or one quiet line when calm; ≤5 regions; charts at a fixed aspect ratio; L0 + L1 fit 1280×800.
- **Responsive:** ≥1024 2fr/1fr · ≤768 one column, L0 first · ≤480 L0, one headline trend, then sparkline rows.
- **CSS:** areas `"l0 l0" "main side" "foot foot"`, columns `minmax(0,2fr) minmax(20rem,1fr)`, `align-items:start`; `.chart{aspect-ratio:16/6}`. Panels in a grid: `.tiles`.
- **Mistakes:** KPI tile row first → L0 list; filler widgets → empty space is allowed; time range per widget → one global range; gauges or donuts → a number or a bullet bar.
- **Example:** Datadog service overview.

### chat-artifact: threads sidebar, conversation, artifact pane
```
+----------+------------------------+------------------+
| + New    |        + you ----+     | Artifact  ‹ › ✕  |
| Search   | Answer as a document,  | doc / code /     |
| Today    | ~70ch column           | preview          |
| Projects | + composer -- [Send] + |                  |
+----------+------------------------+------------------+
```
- **Regions:** threads 16rem, collapsible; thread column `min(48rem,100%)` centred in its pane; composer sticky, grows to 40dvh; artifact pane on demand ~50%, resizable; conversation keeps ≥24rem.
- **Responsive:** ≥1280 all three · ~1024 threads to a drawer while an artifact is open · ~768 Chat | Artifact toggle · ≤480 artifact as a full-screen sheet.
- **CSS:** `.chat:has(>.artifact){grid-template-columns:16rem minmax(24rem,1fr) minmax(24rem,var(--art-w,1fr))}`; `.composer{position:sticky;bottom:0;max-block-size:40dvh}`.
- **Mistakes:** assistant bubbles → a document column; 1200px lines → 48rem; artifact in a modal → a pane; following the bottom while streaming → pin the person's message.
- **Example:** Claude artifacts.

### copilot-panel: an AI side panel docked beside the app's own view
Kit: the `.shell > .inspector` slot.
```
+----+-------------------------------+----------------+
|nav | the app's view (doc/record)   | Assistant    ✕ |
|    | AI change lands HERE, marked  | Context: Doc X |
|    |     [Keep] [Undo]             | +composer--+   |
+----+-------------------------------+----------------+
```
- **Regions:** panel 22.5–30rem (default 25rem), resizable, **pushes** the content, non-modal; open state remembered per person; header toggle + shortcut; a context chip shows what the assistant sees.
- **Responsive:** ≥1280 pushes · ~1024 overlay drawer · ≤480 bottom sheet (medium/large).
- **Mistakes:** floating chat bubble over content → docked panel; auto-open → the person opens it; results only in the chat → they land in the object; panel covering the selection → push.
- **Example:** Notion AI.

### command-palette: one door to search, navigation and actions
- **Regions:** dialog `min(40rem,100% - 2rem)`, **anchored ~15vh from the top** so it doesn't jump as results change, max height `min(60dvh,32rem)`; items at control height, shortcut at the end, grouped; scope chip when scoped ("ENG-412 ›").
- **Responsive:** same at every width; ≤480 full-width top sheet plus a visible search entry in the header.
- **CSS:** `dialog.palette{display:grid;grid-template-rows:auto minmax(0,1fr);margin-block-start:15vh}`; listbox `overflow-y:auto`; option `grid-template-columns:auto 1fr auto`.
- **Mistakes:** vertically centred and resizing → top-anchored; navigation only → actions too; no visible entry point → header field showing ⌘K.
- **Example:** Linear ⌘K.

### wizard: stepper, step, action bar
Kit: `.wizard` (`.top` · `.body` · `.bar`, optional `.with-summary` + `.summary`).
```
+----------------------------------------------+
| wordmark                     Back to site  ✕ |
| ✓ Details -- ● Plan -- ○ Review               |
| ‹ Details                                     |
| Choose a plan                                 |
| [ field, full column width ]                  |
+----------------------------------------------+
| 3 seats · €36/mo                  [Continue] |
+----------------------------------------------+
```
- **Regions:** column `min(40rem,100% - 2rem)`, centred as a column, text start-aligned; stepper one row; Back above the heading; sticky action bar aligned to the column, summary at the start, primary at the end.
- **Responsive:** ≥1024 optional summary column 22rem · ≤480 stepper becomes "Plan · 2 of 3", bar sits above the keyboard.
- **Mistakes:** Back beside the primary → at the top; multi-column forms → one column; total inside the button → its own slot; no exit → wordmark + "Back to site", draft kept.
- **Example:** Vercel New Project.

### auth-card: a narrow centred card
Kit: `.auth` (`header` · `.card` · `footer`).
- **Regions:** card `min(24rem,100% - 2rem)`, ~12dvh from the top, not at the true centre (it shifts when the keyboard opens); split variant (form | brand panel) only at ≥1024.
- **Responsive:** ≤480 drops the card chrome; the form sits in the page column.
- **Mistakes:** carousel beside the form → nothing, or one brand panel; placeholder-only labels → labels above fields; password rules after failure → live checklist while typing.
- **Example:** Linear sign-in.

### empty-first-run: a first use that leads to the first value
Kit: `.empty` (base.css).
- **Regions:** inside the real shell; a start-aligned block at the list's left edge, ≤30rem, ~15% down; toolbar, filters and headers hidden; centred only on a canvas; seeded example content beats an empty screen.
- **Responsive:** same block; the primary goes full width at ≤480.
- **CSS:** `padding-block-start:15cqb` needs the page container `container-type:size`; otherwise `var(--space-16)`.
- **Mistakes:** illustration + paragraph + 3 CTAs → one line + one action; toolbar on an empty list → hidden; product tour → none.
- **Example:** Linear empty views.

### editor-preview: editing beside a live preview on the real template
- **Regions:** editor `minmax(28rem,1fr)` | preview `1fr`, resizable, each scrolls on its own.
- **Responsive:** ≥1280 50/50 · ≤1024 Edit | Preview toggle · ≤480 edit only, preview full screen.
- **CSS:** `grid-template-columns:minmax(28rem,var(--edit-w,1fr)) minmax(0,1fr)`; children `overflow:auto; min-block-size:0`.
- **Mistakes:** preview only in a new tab → side by side; preview not the real template → render the real one; a Save button → autosave, Publish is the action.
- **Example:** Sanity Presentation.

### file-browser: grid ⇄ list with an info panel
- **Regions:** tile grid min 11rem, one thumbnail ratio; list mode = admin-table; info panel 20rem, toggled; upload tray bottom-end.
- **Responsive:** ~1024 info panel → drawer · ≤480 list form, swipeable full-screen preview.
- **CSS:** `repeat(auto-fill,minmax(min(100%,11rem),1fr))`; tile `grid-row:span 2; grid-template-rows:subgrid`; thumb `aspect-ratio:4/3`.
- **Mistakes:** file names truncated at the end → truncate in the middle; mixed thumbnail ratios → one; modal upload → tray.
- **Example:** Google Drive.

### timeline-gantt: work over time, with a sticky label column
- **Regions:** label column 16–20rem, sticky inline; time track scrolls sideways; sticky date header; today line; zoom week / month / quarter.
- **Responsive:** ≤768 agenda list grouped by date.
- **CSS:** `grid-template-columns:var(--label-w,16rem) minmax(0,1fr); overflow:auto`; label `position:sticky; inset-inline-start:0; z-index:var(--z-sticky)`.
- **Mistakes:** drag the only way to reschedule → date picker in the detail view; label column scrolls away → sticky; unlabelled bars → title on or beside the bar.
- **Example:** Linear timeline.

---

# B. Pages

### landing: hero, proof, argument sections, pricing, FAQ, footer
Kit: `.container`, `.grid-12` (`--span`, `--span-md`); profile `marketing`.
```
| wordmark     link link link       [Action] | nav
| Headline, ≤2 lines                          | hero
| Lede ≤2 lines     [Primary]   Secondary >   |
| [ real product UI or photo ]                |
| Proof: one named quote with a real number   |
| Claim 1 + proof         (layout A)          | argument
| Claim 2 + proof         (layout B)          |
| Pricing > FAQ (<details>) > designed close  |
```
- **Regions:** content 72–80rem; page margin and section padding from the marketing profile (`--page-margin`, `--space-section`); prose at the measure, media breaks out.
- **Responsive:** compose 390 on its own; nav becomes wordmark + action + menu; split sections stack claim first, then media.
- **Mistakes:** centred headline over 3 icon cards → claim-ordered sections; neighbouring sections with the same layout → vary them; link-farm footer → designed close; bento by default → one dominant thing per screen.
- **Example:** Linear.

### pricing: plan cards plus a comparison table
- **Regions:** 3–4 cards aligned with subgrid (name, price, CTA, lede, features); comparison table with a sticky plan header carrying the CTAs; max 72rem.
- **Responsive:** ≥1024 4 across · ~768 2×2 · ≤480 stacked in plan order; comparison becomes a two-plan picker or per-plan sections.
- **CSS:** `repeat(auto-fit,minmax(min(100%,15rem),1fr))`; plan `grid-row:span 5; grid-template-rows:subgrid`.
- **Mistakes:** features misaligned across cards → subgrid; yearly toggle hides the monthly price → show both; "Contact us" on every tier → real prices.
- **Example:** Vercel pricing.

### product-detail: gallery, buy box, specs, reviews
- **Regions:** gallery 7/12 at a fixed ratio; buy box 5/12, min 20rem, sticky; below, full width: collapsible specs and reviews.
- **Responsive:** ≥1024 7/5 · ≤768 gallery swipe → title and price → variants → Add to cart; sticky buy bar after scroll.
- **CSS:** areas `"gallery buy" "more more"`, columns `minmax(0,7fr) minmax(20rem,5fr)`, `align-items:start`; images `aspect-ratio:4/5; object-fit:cover`.
- **Mistakes:** hover-only Add to cart → visible; sold-out variants hidden → faded and named; "3–5 days" → a date; autoplay carousel → swipeable gallery.
- **Example:** Apple Store.

### listing-search: facets plus a results grid or list
- **Regions:** facet sidebar 16rem, sticky with its own scroll (few facets: a horizontal bar instead); cards min 15rem, aligned with subgrid.
- **Responsive:** ≥1280 4 columns · ~1024 3 · ≤768 "Filters (2)" opens a full-height sheet with a sticky "Show 128 results" · ≤480 2 compact columns (`--card-min:9rem`).
- **CSS:** `grid-template-columns:16rem minmax(0,1fr)`; facets `position:sticky; max-block-size:calc(100dvh - var(--header-h)); overflow:auto`; results `repeat(auto-fill,minmax(min(100%,var(--card-min,15rem)),1fr))`.
- **Mistakes:** page reload per facet → live update; infinite scroll hiding the footer → "Show more"; price only on hover → visible.
- **Example:** Zalando.

### feed: browse a stream of content in an adaptive grid
Kit: `.tiles` with `--tile-min: 11.25rem`.
- **Regions:** columns min 180dp, as many as fit; full-span headers (`grid-column:1/-1`); one column on compact widths.
- **Responsive:** column count follows the width; detail opens as list-peek or a push.
- **Mistakes:** masonry that reorders on load → fixed ratios; infinite scroll with the footer unreachable → paginate or show more.
- **Example:** Google Play.

### cart-checkout: steps plus an order summary
- **Regions:** form `minmax(0,36rem)`; summary 20–26rem, sticky, on a tinted surface; cart page: line items 2fr + sticky summary 1fr. Pick one side for the summary, once.
- **Responsive:** below ~56rem the summary collapses into a top row "Show order summary · €111"; the action bar sticks at the bottom.
- **CSS:** `justify-content:center; grid-template-columns:minmax(0,36rem) minmax(20rem,26rem)`; summary `position:sticky; align-self:start`.
- **Mistakes:** site nav leaking into checkout → wordmark + Back; costs revealed at the last step → up front; forced account → guest checkout; total inside the button → its own slot.
- **Example:** Shopify Checkout.

### docs: nav tree, content, on-page contents
Kit: `.docs` (`nav` · `main` · `.toc`); profile `docs`.
```
+---------------------------------------------------+
| logo   Search ⌘K                v2 ▾  GitHub  ◐  |
+----------+---------------------------+------------+
| Guides   | Guides › Auth             | On this page|
| ▸ Auth   | # Title                   | Install     |
| Ref      | prose · code              | Configure   |
|          | ‹ Prev           Next ›   |             |
|          | Edit · Updated Oct 2      |             |
+----------+---------------------------+------------+
```
- **Regions:** nav bar 3.5rem (4rem from 50em); sidebar and contents sticky with their own scroll; content ≤45rem. Starlight reference: sidebar and contents 18.75rem.
- **Responsive:** ≥72rem three panes · 50–72rem contents become a collapsible "On this page" bar · <50em sidebar becomes a menu drawer. Code scrolls inside its block at every width.
- **Mistakes:** marketing hero on the docs home → search + entry points; chatbot bubble over content → ⌘K; code that scrolls the page → scroll inside the block.
- **Example:** Stripe Docs.

### article: reading column, breakouts, sidenotes
Kit: `.breakout .flow` (base.css) + `.article`; profile `reading`.
```
| masthead                                       |
|            Headline                            |
|            Dek · Byline · 16 Oct 2026          |
| +---------- figure (feature / full) -------+   |
|            body ~66ch           +sidenote+     |
|      +---- table (feature) ----++--------+     |
```
- **Regions:** named lines full / feature / content; measure 60–75ch; body 18–21px; sidenotes in the margin at ≥80rem. Scrollytelling variant: sticky graphic with stepping text.
- **Responsive:** ~1024 sidenotes become inline popovers · ≤480 figures edge to edge, body 17–18px.
- **Mistakes:** hero image pushes the first sentence below the fold on a phone → shorter crop; sticky share rails or a progress bar → none; text over images → captions.
- **Example:** The Pudding.

### blog-index: scannable posts without cards
- **Regions:** max 48rem; date gutter 8rem + title and dek; archive by year.
- **Responsive:** ≤36rem date above the title.
- **CSS:** `grid-template-columns:8rem minmax(0,1fr); column-gap:var(--space-6); row-gap:var(--space-8)`.
- **Mistakes:** card grid of stock images → title, dek, date; relative dates → absolute; tag clouds → section links.
- **Example:** Overreacted.

### changelog: dated entries with anchors
- **Regions:** date column 10rem, sticky; entry at the measure; media breaks out; an anchor per entry; RSS.
- **Responsive:** ≤768 date above the entry.
- **CSS:** `grid-template-columns:10rem minmax(0,45rem)`; `time{position:sticky; align-self:start}`.
- **Mistakes:** versions without dates → both; no anchors → a linkable heading per entry.
- **Example:** Linear changelog.

### case-study: portfolio index plus case page
- **Regions:** index as rows (title, discipline, year) with a hover or focus preview, or a grid min 20rem; case page on the article grid with full-bleed work (reads as Editorial).
- **Responsive:** index rows get inline thumbnails; back to the index restores scroll.
- **CSS:** row `grid-template-columns:minmax(12ch,1fr) 10rem 4rem`; ≤36rem `1fr auto`, discipline hidden.
- **Mistakes:** preloader or manifesto first → the work; crops that cut the work → one crop system.
- **Example:** Pentagram.

### status-page: public service health
- **Regions:** one column, max 50rem; current state as one line, no green "All systems operational" banner; day bars mark incident days; no uptime-% headline.
- **Responsive:** ≤480 bars thin to 30 days.
- **CSS:** bars `grid-template-columns:repeat(var(--days,90),1fr); gap:2px`.
- **Mistakes:** colour alone on bars → shape + tooltip text; relative times → UTC timestamps.
- **Example:** GitHub Status.

### error-page: 404/500
- **Regions:** inside the real shell and grid, start-aligned at the content edge; a 500 adds Retry and a status-page link.
- **Mistakes:** jokes or illustrations on a 500 → state and recovery; a dead end → search + home.
- **Example:** Stripe Docs 404 with search.

---

# C. Mobile

### mobile-tabs-stack: tab bar plus a stack per tab
- **Regions:** iOS tab bar 49pt + safe area (iOS 26 floats it in Liquid Glass; don't fake it); Material navigation bar 80dp; each tab keeps its own stack; re-tapping pops to root or scrolls to top.
- **Responsive:** ≥600dp navigation rail · ≥840dp rail or drawer + list-detail · iPad: the tab bar adapts into a sidebar.
- **CSS:** `grid-template-rows:minmax(0,1fr) auto; block-size:100dvh`; tab bar `padding-block-end:env(safe-area-inset-bottom)`; ≥37.5rem `"rail main" / 5rem minmax(0,1fr)`.
- **Mistakes:** hamburger hiding top-level places → tabs; >5 tabs → cut or merge; tab bar inside flows → hidden.
- **Example:** Apple Music.

### mobile-master-detail: list → push detail
- **Regions:** push navigation with swipe back; back restores scroll and selection; detail actions in a bottom toolbar; side by side at ≥840dp or iPad regular width (inbox-3pane at ≥52.5rem).
- **Mistakes:** list re-fetches to the top on back → restore it; actions only by swipe → also in a toolbar or ⋯.
- **Example:** Mail.

### bottom-sheet: content over context, with detents
- **Regions:** detents peek / medium / large; behind stays interactive at peek and medium (non-modal); grabber + close button; scrolling inside first expands to the next detent.
- **Desktop:** a side sheet or panel 22.5–25rem, never a bottom sheet.
- **CSS:** `position:fixed; inset-inline:0; bottom:0; block-size:calc(100dvh - 3rem); translate:0 calc(100% - var(--detent,50dvh)); padding-block-end:env(safe-area-inset-bottom)`; peek `--detent:7.5rem`, large `100%`. Motion: `wwjd-animation` skill.
- **Mistakes:** drag the only way to close → close button; stacked sheets → navigate inside one; bottom sheet on desktop → side panel.
- **Example:** Apple Maps.

### fullscreen-flow: a focused task that hides the app chrome
- **Regions:** header with ✕ and the step name; body scrolls; primary pinned above the keyboard. iOS `fullScreenCover` or a large sheet; Android full-screen dialog.
- **CSS:** `position:fixed; inset:0; grid-template-rows:auto minmax(0,1fr) auto`; footer `padding-block-end:max(var(--space-4),env(safe-area-inset-bottom))`; viewport meta `interactive-widget=resizes-content` so dvh shrinks with the keyboard.
- **Mistakes:** tab bar visible → hidden; primary under the keyboard → pinned above; ✕ loses data → keep the draft.
- **Example:** Revolut send.

### fab: one floating primary create action
- **Regions:** 56dp, radius 16dp, 16dp from the edges, above the nav bar; the extended FAB (with label) shrinks on scroll; one per screen, only for the screen's primary create.
- **Platforms:** iOS has no FAB (primary in the nav or toolbar); desktop web uses the header primary.
- **CSS:** `position:fixed; inset-inline-end:max(1rem,env(safe-area-inset-right)); bottom:calc(var(--tabbar-h,0px) + 1rem + env(safe-area-inset-bottom))`; the list gets `padding-block-end:5.5rem` so the last row isn't under it.
- **Mistakes:** FAB for secondary or destructive actions → toolbar; several FABs → one; FAB on iOS → nav bar button.
- **Example:** Gmail Android Compose.
