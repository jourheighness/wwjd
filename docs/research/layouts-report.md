**Layout pattern library for wwjd: 43 layouts. Every one has a purpose, wireframe, regions, responsive rules, CSS, real examples and mistakes. An index table and a "how to pick" note are at the end.**

- **Built to fit wwjd:** it uses the blueprint names from saas.md, the product-type numbers from product-types.md, the register names, the container and grid rules from fit.md and layout.md, and the baseline.md tokens.
- **Checked against source:**
  - Android window size classes: compact <600, medium 600–839, expanded 840–1199, large 1200–1599, extra-large ≥1600dp.
  - Android canonical layouts: list-detail; supporting pane at 70/30 when expanded and 50/50 at medium; feed with columns of at least 180dp.
  - Carbon CSS: header and rail 48px, side nav 256px, collapses below lg.
  - Primer PageLayout code: pane small/medium/large = 240–256 / 256–296 / 256–320, narrow below 768px, resizable with keyboard and saved width, double-click resets.
  - Starlight CSS: sidebar 18.75rem, content 45rem, nav bar 3.5→4rem, sidebar shows from 50em, table of contents from 72rem.
  - Polaris docs: primary/secondary columns ⅔ + ⅓, body fixed at 998px.
- **Not checked against source:**
  - **The Apple HIG pages render client-side and came back empty.** Tab bar 49pt and the medium/large sheet detents come from the UIKit/SwiftUI APIs as I know them.
  - Atlassian publishes no shell dimensions, so none are given for it.
  - Fluent NavigationView breakpoints (641 / 1008) and the Material FAB sizes are from memory.
  - Sizes given for named products are approximate observations, not specs.

---

## Conventions (apply to every entry)
- **Width tiers** (container widths, in rem): **XL ≥80rem** (1280) · **L ~64rem** (1024) · **M ~48rem** (768) · **S ≤30rem** (480).
- **Containers:**
  - `.app{container:shell/inline-size}` wraps the shell, because a grid can't query itself.
  - The main pane wrapper is `container:page/inline-size`.
  - **Overlays in the top layer (dialogs, palettes, sheets) use `@media`, not `@container`.**
- **Panes:**
  - Panes are sibling scroll regions: `min-block-size:0; overflow:auto; scrollbar-gutter:stable`. Never nest a scroll inside another scroll.
  - The shell height is `100dvh`.
- **Absent areas:** a child whose area is missing from the current `grid-template-areas` must be `display:none` or moved to an overlay. Otherwise it lands in an implicit track.
- **Resizable panes:**
  - The handle is `role="separator"`, uses arrow keys, resets on double-click, and remembers its width per person.
  - Width comes from a custom property, e.g. `--list-w`.
- **Shared sizes:**
  - Header 48px = `--control-h` 32 + 2×`--space-2`.
  - Navigation: 15rem (240px), icon rail 3.5rem.
  - Inspector or side panel: 18–20rem.
  - Peek, drawer or copilot: 25–30rem (the baseline drawer is 480px).
  - Text tracks are `minmax(12ch,1fr)`. Panel widths are `min(Xrem,100%)`.

---

# A. App shells

### shell-sidebar: global frame for every product app; navigation recedes, the work leads
**Used by:** product types 1–5, 7, 9, 10, 12–14, 17, 19–25 · Operate, Monitor
```
┌──────────┬───────────────────────────────────┐
│ ws ▾  ⌘K │ crumb · view tabs        ⋯ [New] │ header 48
│ Inbox    ├───────────────────────────────────┤
│ My work  │                                   │
│ ─ Team ─ │   main (one pane surface)         │
│ ☆ Views  │                                   │
│ avatar ? │                                   │
└──────────┴───────────────────────────────────┘
```
- **Regions:**
  - Nav 15rem, resizable 12.5–20rem, on `--surface-1`. For reference: Carbon 256px, Fluent 320px open / 48px compact.
  - Header 48px, sticky.
  - Main `minmax(0,1fr)` on `--surface-2`, optionally inset 8px with radius 8.
- **Responsive:**
  - ≥1280: full nav.
  - ~1024: nav collapses to a 3.5rem icon rail (Carbon below lg, Fluent below 1008).
  - ~768: nav becomes a drawer opened from the header.
  - ≤480: bottom tab bar with 3–5 places (see mobile-tabs-stack).
```css
.shell{display:grid;block-size:100dvh;grid-template:"nav head" auto "nav main" 1fr / var(--nav-w,15rem) minmax(0,1fr)}
.shell>main{overflow:auto;scrollbar-gutter:stable}
@container shell (width<64rem){.shell{--nav-w:3.5rem}}               /* icon rail */
@container shell (width<48rem){.shell{grid-template:"head" auto "main" 1fr/1fr}.shell>nav{display:none}} /* nav → <dialog> drawer */
```
- **Examples:** Linear, Shopify admin, Atlassian navigation (top bar plus resizable side nav, Ctrl+[ to hide it).
- **Mistakes:**
  - Sections listed in both a top nav and a side nav → one nav.
  - Action icons in the nav → nav icons stand for places only.
  - Nav on the same tone as the content → one tone below.
  - A header layout per page → one header anatomy.

### inbox-3pane: process items one after another, keeping the queue in view
**Used by:** 10, 26, 11 (variant), review queues in 1, 9, 17 · Operate
```
┌──────┬───────────────┬──────────────────────┬─────────┐
│Views │● Subject   2m │ Thread title  [Reply]│ Customer│
│Mine 4│  preview line │ message              │ facts   │
│Unass.│▸ selected     │ message              │ orders  │
│Team  │  Subject      │ ┌ composer ───────┐  │         │
└──────┴───────────────┴──────────────────────┴─────────┘
```
- **Regions:**
  - Views 14rem.
  - List 20–25rem, resizable, min 17.5rem.
  - Thread `1fr`, min 30rem, with a ~70ch reading column inside.
  - Context 18rem: toggled, remembered.
  - Sticky thread header; sticky composer at the bottom.
- **Responsive:**
  - ≥1280: all four panes.
  - ~1024: context becomes a drawer.
  - ~768: views move into a dropdown in the list header.
  - ≤480: stacked drill-down, where back restores scroll and selection.
```css
.inbox{display:grid;grid-template-areas:"views list thread ctx";grid-template-columns:14rem var(--list-w,22rem) minmax(30rem,1fr) 18rem}
.inbox>*{min-block-size:0;overflow:auto}
@container shell (width<80rem){.inbox{grid-template-areas:"views list thread";grid-template-columns:14rem var(--list-w,20rem) minmax(0,1fr)}}
@container shell (width<64rem){.inbox{grid-template-areas:"list thread";grid-template-columns:var(--list-w,20rem) minmax(0,1fr)}}
@container shell (width<48rem){.inbox{grid-template-areas:"list";grid-template-columns:1fr}} /* route shows list OR thread */
```
- **Examples:** Front, Help Scout, Gmail/Outlook reading pane. Superhuman is the single-pane variant: the open thread takes the full width.
- **Mistakes:**
  - Opening an item in a modal → split pane.
  - Jumping to the top after an action → advance to the next item and keep scroll.
  - Six meta fields in a list row → sender, subject, one preview line, time.
  - Context panel forced open at 1024 → toggle and remember.

### list-peek: the list is the main surface; a non-modal panel previews and edits the selection
**Used by:** 1, 2, 3, 5, 17, 20 · Operate
```
┌──────────────────────────────┬──────────────────┐
│ Issues · Active  Filter Display│ ✕ ⤢ ENG-412   ⋯ │
│ Status: Open ✕                │ ● In progress   │
│ ▾ Today 3                     │ properties      │
│  ▸ row ──────── ◔ ● Oct 18    │ description     │
│  ▸ row (selected)             │ activity        │
└──────────────────────────────┴──────────────────┘
```
- **Regions:**
  - List `minmax(32rem,1fr)`.
  - Peek 25–30rem, resizable from 22.5rem to 50%. It **pushes** the list; it never covers it.
  - ⤢ opens the full record page. Esc closes the peek and returns focus to the row.
  - j/k moves the selection while the peek is open.
- **Responsive:**
  - ≥1280: the peek pushes the list.
  - ~1024: the peek overlays as a drawer.
  - ~768: the record opens as a full-page route.
  - ≤480: list, then pushed detail.
```css
.split{display:grid;grid-template-areas:"list peek";grid-template-columns:minmax(0,1fr) auto}
.split>.peek{inline-size:clamp(22.5rem,var(--peek-w,28rem),50cqi);overflow:auto}
@container page (width<64rem){.split>.peek{position:fixed;inset-block:0;inset-inline-end:0;inline-size:min(28rem,100%)}}
```
- **Examples:** Linear issue peek, Notion database side peek, Attio record panel.
- **Mistakes:**
  - A modal record view → peek.
  - A peek that opens on load → open only on selection.
  - A peek covering the selected row → push the list.
  - An edit modal on top of the peek → edit in place.

### record-page: a record that is its own workspace (header, main, side panel)
**Used by:** 2, 5, 10, 14, 17, 20, 24 · Operate
```
┌────────────────────────────────────────────────┐
│ ‹ Deals / Acme renewal     ● Won   [Action]  ⋯ │
│ Overview   Activity   Files                     │
├─────────────────────────────┬──────────────────┤
│ main: body, notes,          │ ≤7 key properties│
│ activity timeline           │ related records  │
└─────────────────────────────┴──────────────────┘
```
- **Regions:**
  - Sticky header: the title wraps, then status, at most 2 actions plus ⋯.
  - At most 5 tabs.
  - Main `1fr`, reading content up to ~48rem.
  - Side 16–20rem, sticky under the header. Polaris uses ⅔ + ⅓; Primer uses an end pane of 256–296px.
- **Responsive:**
  - ≥1024: two columns.
  - ~768: the side panel stacks **above** main as a compact property list; the rest goes under "More fields".
  - ≤480: one column; actions move to ⋯ or a sticky bottom bar.
```css
.record{display:grid;gap:var(--space-6);align-items:start;grid-template-areas:"head head" "main side";grid-template-columns:minmax(0,1fr) 18rem}
.record>.side{position:sticky;top:calc(var(--header-h) + var(--space-4))}
@container page (width<48rem){.record{grid-template-areas:"head" "side" "main";grid-template-columns:1fr}.record>.side{position:static}}
```
- **Examples:** GitHub issue/PR, Shopify order detail, Attio/HubSpot record.
- **Mistakes:**
  - Properties as a form in main → side list with popover pickers.
  - More than 7 side properties → "More fields".
  - Tabs used as activity filters → filter inside Activity.
  - A description paragraph under the title → none.

### workspace-canvas: create on a canvas with tools at the start and the inspector at the end
**Used by:** 27, 12, 15 (builder) · Operate
```
┌───────────────────────────────────────────────────┐
│ File ▾   ▸ ◻ ○ T ✎            Share  ▶   100% ▾  │
├────────┬─────────────────────────────┬────────────┤
│ Layers │                             │ Inspector  │
│ Pages  │          canvas             │ (selection │
│        │     ┌ context toolbar ┐     │  or doc)   │
└────────┴─────────────────────────────┴────────────┘
```
- **Regions:**
  - Top bar 48px.
  - Layers 15rem, resizable.
  - Canvas `1fr`: pans and zooms inside itself, never scrolls the page.
  - Inspector 15–17.5rem.
  - A context toolbar floats beside the selection. Tools may float at the bottom instead (Figma UI3, tldraw).
- **Responsive:**
  - ≥1280: all panes.
  - ~1024: layers toggle with ⌘\ as an overlay.
  - ~768: the inspector becomes a bottom sheet.
  - ≤480: view and comment only.
```css
.ws{display:grid;block-size:100dvh;grid-template:"bar bar bar" 3rem "left canvas right" 1fr / var(--left-w,15rem) minmax(0,1fr) var(--right-w,16rem)}
.ws>.canvas{overflow:hidden;position:relative}
@container shell (width<64rem){.ws{grid-template-areas:"bar bar" "canvas right";grid-template-columns:minmax(0,1fr) 16rem}}
@container shell (width<48rem){.ws{grid-template:"bar" 3rem "canvas" 1fr/1fr}}
```
- **Examples:** Figma UI3, Framer, tldraw/Excalidraw.
- **Mistakes:**
  - Property dialogs → inspector.
  - Panels covering the selection → dock panels at the edges.
  - The active tool or mode not shown → show it.
  - Inspector disappearing when nothing is selected → show document properties.

### settings: sub-nav plus section pages
**Used by:** 7, plus every SaaS · Operate (Flow for plan changes)
```
┌────────────┬─────────────────────────────────────┐
│ ‹ Back     │ Profile                              │
│ Account    │ Name               [__________]      │
│  Profile   │ Theme              [Light|Dark|Auto] │
│ Workspace  │ Email digests              [toggle]  │
│  Members   │ ── Danger zone ──  [Delete account…] │
└────────────┴─────────────────────────────────────┘
```
- **Regions:**
  - The sub-nav (14rem) replaces the app nav (Linear, Vercel) or sits inside main (GitHub, Primer SplitPageLayout).
  - Content up to 45rem, start-aligned.
  - Rows: label and hint at the start, control at the end. 5–9 categories.
- **Responsive:**
  - ≥1024: sub-nav plus content.
  - ~768: the sub-nav becomes an index page; sections drill in.
  - ≤480: the iOS Settings pattern, a grouped list then push. Rows stack the control under the label.
```css
.settings{display:grid;grid-template-areas:"sub body";grid-template-columns:14rem minmax(0,45rem);column-gap:var(--space-8)}
.setting{display:grid;grid-template-columns:minmax(12ch,1fr) auto;column-gap:var(--space-4);align-items:start;padding-block:var(--space-3)}
@container page (width<48rem){.settings{grid-template-areas:"body";grid-template-columns:1fr}}
@container page (width<30rem){.setting{grid-template-columns:1fr}}
```
- **Examples:** Linear, GitHub settings, Stripe Dashboard settings. Polaris annotated layout (title and description on the left, card on the right) for Shopify app settings.
- **Mistakes:**
  - One long form → section pages.
  - A centred floating card → a start-aligned column.
  - Save on toggles → instant save.
  - Danger zone mid-page → last.

### admin-table: manage records across rows
**Used by:** 1, 5, 9, 14, 17, plus admin in every SaaS · Operate
```
┌─────────────────────────────────────────────────┐
│ Members  [All][Admins][Invited]      ⋯ [Invite] │
│ Filter  Role: Admin ✕                 Display   │
├──┬───────────────┬─────────┬────────┬──────────┤
│☐ │ Name ↓        │ Role    │ Active │    Seats │ sticky 32
│☐ │ Sara Lind     │ Admin   │ Oct 18 │        3 │ --row-h
│     [ 3 selected · Suspend · Change role · ⋯ ✕ ]│ floating
└─────────────────────────────────────────────────┘
```
- **Regions:**
  - View tabs 36px, filter bar at control height.
  - The table runs edge to edge: header 32px, rows `--row-h`, identifier column `minmax(14ch,2fr)` sticky on horizontal scroll.
  - Bulk bar floats at the bottom.
  - Pagination past 50 rows.
- **Responsive:**
  - ≥1280: 4–6 columns.
  - ~1024: columns drop by priority.
  - ~768: identifier, status and the one deciding number.
  - ≤480: two-line list items. Never a sideways-scrolling table unless comparing is the job; then sticky first column inside a focusable region.
```css
.table{display:grid;grid-template-columns:2.5rem minmax(14ch,2fr) repeat(3,minmax(9ch,1fr)) 6rem}
.table>.row{display:grid;grid-column:1/-1;grid-template-columns:subgrid;min-block-size:var(--row-h)}
.table>.head{position:sticky;top:0;block-size:2rem}
@container page (width<64rem){.table{grid-template-columns:2.5rem minmax(14ch,2fr) repeat(2,minmax(9ch,1fr)) 6rem}.p3{display:none}}
@container page (width<30rem){.table>.row{grid-template-columns:auto 1fr;grid-template-areas:"check id" ". meta"}}
```
- **Examples:** Stripe Customers, GitHub org People, Clerk Users.
- **Mistakes:**
  - KPI tiles above the table → Monitor.
  - Buttons on every row → one inline action plus ⋯.
  - A card around the table → edge to edge.
  - Zebra stripes or centred cells → hairlines, start-aligned text.

### board-kanban: move items through a workflow by status
**Used by:** 2, 3, 17, 20 · Operate
```
┌─────────────────────────────────────────────────────→
│ Project · Board            Filter   Display   [New]
│ ┌Todo 4  +┐ ┌In progress 2┐ ┌Review 1┐ ┌Done ▸┐
│ │ card    │ │ card        │ │ card   │ └──────┘
│ │ card    │ │             │ │        │
│ │ + New   │ │             │ │        │
```
- **Regions:**
  - Columns fixed at 17–20rem (Trello 272px), gap 12.
  - The board scrolls sideways (focusable, labelled). Each column scrolls vertically.
  - Sticky column headers. Done is collapsible. Optional swimlanes with sticky lane headers.
- **Responsive:**
  - ≥1280: 4–5 columns visible.
  - ~1024: 3.
  - ~768: 2, with snap.
  - ≤480: one column per screen with mandatory snap and a column switcher, or switch to a list grouped by status.
```css
.board{display:grid;grid-auto-flow:column;grid-auto-columns:var(--col-w,18rem);gap:var(--space-3);overflow-x:auto;
  scroll-snap-type:x proximity;padding-inline:var(--space-4);scroll-padding-inline:var(--space-4)}
.col{display:grid;grid-template-rows:auto minmax(0,1fr);min-block-size:0}.col>ul{overflow-y:auto}
@media (width<30rem){.board{--col-w:calc(100% - 2.5rem);scroll-snap-type:x mandatory}}
```
- **Examples:** Linear board, GitHub Projects, Trello.
- **Mistakes:**
  - A board for records with no workflow → table.
  - Drag as the only way to move → a menu and keyboard alternative.
  - Columns squeezed to fit → fixed width plus scroll.
  - 8 fields on a card → identifier, status, avatar, one deciding meta.

### calendar: week/day grid plus a mini-month sidebar
**Used by:** 4 (host), 16, 17, 24, 25 · Operate. The booker side is Flow/Transact.
```
┌──────────┬─────────────────────────────────────────┐
│ [Create] │ ‹ › Today   Oct 12–18, 2026     Week ▾  │
│ ░ mini   │     Mon   Tue   Wed   Thu   Fri  Sat Sun│
│   month  │ 09 ┌───┐                                │
│ My cals  │ 10 │ev │       ┌───┐   ── now ──        │
│ ☑ Work   │ 11 └───┘       └───┘                    │
└──────────┴─────────────────────────────────────────┘
```
- **Regions:**
  - Sidebar 16rem.
  - Time gutter 3.5rem. Hour rows 48px (15-minute rows of 12px).
  - Sticky day header and gutter. An all-day row.
  - Opens scrolled to now or working hours.
  - Event details in a popover anchored to the event. Drag to create.
- **Variants:**
  - Resources: one column per person or room (Fresha).
  - Booker (Cal.com): event info | month grid | slot list.
- **Responsive:**
  - ≥1280: week plus sidebar.
  - ~1024: the sidebar toggles.
  - ~768: 3 days.
  - ≤480: one day with a week strip, swipe between days, or an agenda list.
  - The booker stacks info → month → slots.
```css
.cal{display:grid;grid-template-areas:"side bar" "side grid";grid-template-columns:16rem minmax(0,1fr);grid-template-rows:auto 1fr}
.week{display:grid;grid-template-columns:3.5rem repeat(var(--days,7),minmax(0,1fr));grid-auto-rows:calc(var(--hour-h,3rem)/4)}
.week>.ev{grid-column:calc(var(--day) + 1);grid-row:calc(var(--q) + 1)/span var(--len)}
@container page (width<64rem){.cal{grid-template-areas:"bar" "grid";grid-template-columns:1fr}}
@container page (width<48rem){.week{--days:3}} @container page (width<30rem){.week{--days:1}}
```
- **Examples:** Google Calendar, Notion Calendar, Cal.com booker.
- **Mistakes:**
  - Month as the scheduling default → week.
  - Edit in a centred modal → popover, then side panel.
  - Unlabelled timezone → label it and make it switchable.
  - The view resetting to midnight → scroll to now.

### map-list: browse results that have a place
**Used by:** 18 (buyer), 25 (dispatch), 22 (ATMs/branches) · Transact, Operate
```
┌──────────────────────────┬─────────────────────┐
│ Where · When · Who   Filters (2)              │
│ 312 stays                 │                     │
│ ┌card┐ ┌card┐            │      MAP            │
│ └────┘ └────┘            │   €120   €98        │
│ ┌card┐ ┌card┐            │        €140         │
└──────────────────────────┴─────────────────────┘
```
- **Regions:**
  - List ~60% as a card grid (min 16rem).
  - Map ~40%, sticky at full height.
  - Hovering or focusing a card highlights its pin, and the reverse.
  - "Search as I move the map" is an explicit opt-in.
  - Dispatch variant: map | unassigned queue | per-technician timeline.
- **Responsive:**
  - ≥1280: two-column cards plus map.
  - ~1024: one-column cards plus map.
  - ~768: a floating List/Map toggle.
  - ≤480: full-screen map with the list in a bottom sheet (peek/medium/large).
```css
.mapsplit{display:grid;grid-template-areas:"list map";grid-template-columns:minmax(0,3fr) minmax(20rem,2fr)}
.mapsplit>.map{position:sticky;top:var(--header-h);block-size:calc(100dvh - var(--header-h))}
.results{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr));gap:var(--space-6)}
@container shell (width<48rem){.mapsplit{grid-template-areas:"view";grid-template-columns:1fr}}
```
- **Examples:** Airbnb, Zillow, Google Maps.
- **Mistakes:**
  - Results changing as the map pans → "Search this area" button.
  - Pins with no list equivalent → the list is the source of truth for keyboard and screen readers.
  - The map scrolling away → sticky.

### dashboard: an L0 strip plus regions
**Used by:** 8, 19, 21, plus the admin overview and SaaS home (as a queue) · Monitor
```
┌─────────────────────────────────────────────────┐
│ Prod · Last 6h (UTC) · Live 12s ago · On call  │
│ ◆ sev-2 checkout 5xx · unacked  [Ack]   +2 more │ L0
├──────────────────────────────┬──────────────────┤
│ Services, worst first        │ Error rate / p99 │ L1
│ ● api  ▁▂▇ 2.1%  ▁▃▅ 840ms   │ ─ SLO ┊ deploy   │
│ 14 healthy ▸                 │ (shared x-axis)  │
├──────────────────────────────┴──────────────────┤
│ Recent deploys (5)                              │
└─────────────────────────────────────────────────┘
```
- **Regions:**
  - Header line.
  - L0 full width: at most 5 rows, or one quiet line when calm.
  - At most 5 regions. Charts at a fixed aspect ratio.
  - L0 and L1 fit within 1280×800.
- **Responsive:**
  - ≥1024: 2fr/1fr.
  - ≤768: one column, L0 first.
  - ≤480: L0, one headline trend, then sparkline rows.
```css
.dash{display:grid;gap:var(--space-4);align-items:start;grid-template-areas:"l0 l0" "main side" "foot foot";
  grid-template-columns:minmax(0,2fr) minmax(20rem,1fr)}
.dash .chart{aspect-ratio:16/6}
@container page (width<64rem){.dash{grid-template-areas:"l0" "main" "side" "foot";grid-template-columns:1fr}}
```
- **Examples:** Grafana/Datadog service overview, Plausible/PostHog (switchable trend plus ranked lists), Vercel Observability.
- **Mistakes:**
  - A KPI tile row first → L0 list.
  - Filler widgets → empty space is allowed.
  - A time range per widget → one global range.
  - Gauges or donuts → a number or a bullet bar.

### chat-artifact: threads sidebar, conversation, artifact pane
**Used by:** 6, 11 (Converse + Operate) · Converse
```
┌──────────┬────────────────────────┬──────────────────┐
│ + New    │        ┌ you ────┐     │ Artifact  ‹ › ✕  │
│ Search   │ Answer as a document,  │ doc / code /     │
│ Today    │ ~70ch column           │ preview          │
│  thread  │ ┌ composer ──────────┐ │                  │
│ Projects │ └─────────── [Send] ─┘ │                  │
└──────────┴────────────────────────┴──────────────────┘
```
- **Regions:**
  - Threads 16rem, collapsible.
  - Thread column `min(48rem,100%)`, centred in its pane.
  - Composer sticky, grows to at most 40dvh.
  - Artifact pane on demand at ~50%, resizable; the conversation keeps a min of 24rem.
- **Responsive:**
  - ≥1280: all three.
  - ~1024: threads go to a drawer while an artifact is open.
  - ~768: a Chat | Artifact toggle.
  - ≤480: the artifact opens as a full-screen sheet.
```css
.chat{display:grid;block-size:100dvh;grid-template-areas:"threads convo";grid-template-columns:16rem minmax(0,1fr)}
.chat:has(>.artifact){grid-template-areas:"threads convo art";grid-template-columns:16rem minmax(24rem,1fr) minmax(24rem,var(--art-w,1fr))}
.thread{inline-size:min(48rem,100%);margin-inline:auto}.composer{position:sticky;bottom:0;max-block-size:40dvh}
@container shell (width<64rem){.chat:has(>.artifact){grid-template-areas:"convo art";grid-template-columns:minmax(20rem,1fr) 1fr}}
@container shell (width<48rem){.chat,.chat:has(>.artifact){grid-template-areas:"convo";grid-template-columns:1fr}}
```
- **Examples:** Claude (artifacts), ChatGPT (canvas), Perplexity.
- **Mistakes:**
  - Assistant bubbles → a document column.
  - Full-width 1200px lines → 48rem.
  - The artifact in a modal → a pane.
  - Following the bottom while streaming → pin the person's message.

### copilot-panel: an AI side panel docked beside the app's own view
**Used by:** any Operate type with AI (2, 3, 10, 12, 13, 14) · Converse inside Operate
```
┌────┬───────────────────────────────┬────────────────┐
│nav │ the app's view (doc/record)   │ Assistant    ✕ │
│    │ AI change lands HERE, marked  │ Context: Doc X │
│    │     [Keep] [Undo]             │ thread         │
│    │                               │ ┌composer──┐   │
└────┴───────────────────────────────┴────────────────┘
```
- **Regions:**
  - Panel 22.5–30rem (default 25rem), resizable. **Pushes** the content; non-modal.
  - Open state remembered per person; a header toggle plus a shortcut.
  - A context chip shows what the assistant sees.
- **Responsive:**
  - ≥1280: pushes.
  - ~1024: overlay drawer.
  - ≤480: bottom sheet (medium/large).
```css
.shell:has(>.copilot[data-open]){grid-template:"nav head ai" auto "nav main ai" 1fr / var(--nav-w) minmax(0,1fr) var(--ai-w,25rem)}
@container shell (width<64rem){.copilot{position:fixed;inset-block:0;inset-inline-end:0;inline-size:min(25rem,100%)}}
```
- **Examples:** GitHub Copilot Chat, Notion AI, Microsoft 365 Copilot pane, Intercom Copilot in the inbox.
- **Mistakes:**
  - A floating chat bubble over the content → docked panel.
  - Auto-opening → the person opens it.
  - Results only in the chat → they land in the object.
  - The panel covering the selection → it pushes.

### command-palette: one door to search, navigation and actions
**Used by:** every Operate type, docs search · Operate, Reference
```
          ┌──────────────────────────────────────┐
          │ ⌕ Type a command or search…      esc │
          ├──────────────────────────────────────┤
          │ Recent                               │
          │ ▸ ENG-412 Fix checkout retry      ↵  │
          │   Assign to…                    ⌘⇧A  │
          │ Navigation                           │
          └──────────────────────────────────────┘
```
- **Regions:**
  - Dialog `min(40rem,100%-2rem)`, **anchored ~15vh from the top**, so it doesn't jump as results change. Max height 60dvh.
  - Items at control height with the shortcut at the end; grouped.
  - A scope chip when scoped ("ENG-412 ›").
- **Responsive:** the same at every width. ≤480: a full-width top sheet, plus a visible search entry in the header.
```css
dialog.palette{inline-size:min(40rem,100% - 2rem);margin-block-start:15vh;max-block-size:min(60dvh,32rem);
  padding:0;display:grid;grid-template-rows:auto minmax(0,1fr)}
.palette [role=listbox]{overflow-y:auto}.palette [role=option]{min-block-size:var(--control-h);display:grid;grid-template-columns:auto 1fr auto}
@media (width<30rem){dialog.palette{inline-size:100%;margin-block-start:0}}
```
- **Examples:** Linear ⌘K, Raycast, GitHub command palette.
- **Mistakes:**
  - Vertically centred and resizing as results change → anchored to the top.
  - Navigation only → actions too.
  - No visible entry point → a header field showing ⌘K.

### wizard: stepper, step, action bar
**Used by:** 15 (respondent), 16, 18 (listing creation), 22 (payments), onboarding · Flow
```
┌──────────────────────────────────────────────┐
│ wordmark                     Back to site  ✕ │
│ ✓ Details ── ● Plan ── ○ Review               │
│ ‹ Details                                     │
│ Choose a plan                                 │
│ [ field, full column width ]                  │
├──────────────────────────────────────────────┤
│ 3 seats · €36/mo                  [Continue] │
└──────────────────────────────────────────────┘
```
- **Regions:**
  - Column `min(40rem,100%-2rem)`. The column itself is centred; text inside is start-aligned.
  - The stepper is one row.
  - Back sits above the heading.
  - Sticky action bar aligned to the column: summary at the start, primary at the end.
- **Responsive:**
  - ≥1024: optional summary column (22rem).
  - ≤480: the stepper becomes "Plan · 2 of 3"; the action bar sits above the keyboard.
```css
.flow{display:grid;min-block-size:100dvh;grid-template-areas:"top" "body" "bar";grid-template-rows:auto 1fr auto;
  grid-template-columns:min(40rem,100% - 2rem);justify-content:center}
.flow>.bar{position:sticky;bottom:0;display:grid;grid-template-columns:1fr auto;align-items:center}
@container shell (width>=64rem){.flow.with-summary{grid-template-areas:"top top" "body sum" "bar sum";grid-template-columns:minmax(0,40rem) 22rem;column-gap:var(--space-12)}}
```
- **Examples:** Vercel New Project, Stripe Connect onboarding, GOV.UK question pages.
- **Mistakes:**
  - Back beside the primary → back at the top.
  - Multi-column forms → one column.
  - The total inside the button → its own slot.
  - No exit → wordmark plus "Back to site" with the draft kept.

### auth-card: a narrow centred card
**Used by:** every product · Flow
```
┌──────────────────────────────────────┐
│ wordmark                             │
│           ┌────────────────┐         │
│           │ Sign in        │         │
│           │ [Use passkey]  │         │
│           │ Email ________ │         │
│           │ [Continue]     │         │
│           │ SSO · Sign up  │         │
│           └────────────────┘         │
│ Privacy · Terms                      │
```
- **Regions:**
  - Card `min(24rem,100%-2rem)`, placed ~12dvh from the top, not at the true vertical centre (it shifts when the keyboard opens).
  - Optional split variant (form | brand panel) only at ≥1024.
- **Responsive:** ≤480 drops the card chrome; the form sits in the page column.
```css
.auth{display:grid;min-block-size:100dvh;grid-template-rows:auto 1fr auto;justify-items:center}
.auth>.card{inline-size:min(24rem,100% - 2rem);align-self:start;margin-block-start:12dvh}
@media (width<30rem){.auth>.card{background:none;padding:0;margin-block-start:var(--space-8)}}
```
- **Examples:** Linear, Vercel, Clerk `<SignIn/>`.
- **Mistakes:**
  - A carousel beside the form → nothing, or one brand panel.
  - Placeholder-only labels → labels above fields.
  - Password rules shown after failure → live checklist as they type.

### empty-first-run: a first use that leads to the first value
**Used by:** every Operate type · Operate, Flow
```
┌────────┬──────────────────────────────────┐
│ nav    │ Projects                         │
│        │                                  │
│        │ No projects yet                  │
│        │ Projects group issues by goal.   │
│        │ [New project]   Import           │
└────────┴──────────────────────────────────┘
```
- **Regions:**
  - Inside the real shell.
  - A start-aligned block at the list's left edge, max 30rem, ~15% down.
  - Toolbar, filters and headers hidden.
  - Centred only on a canvas.
  - Prefer seeded example content to an empty screen.
- **Responsive:** the same block; the primary goes full width at ≤480.
```css
.empty{max-inline-size:30rem;padding-block-start:15cqb;display:grid;gap:var(--space-3);justify-items:start}
```
(`cqb` needs the page container set to `container-type:size`; otherwise use `padding-block-start:var(--space-16)`.)
- **Examples:** Linear empty views, Notion templates, Stripe test-mode data.
- **Mistakes:**
  - Illustration, paragraph and 3 CTAs → one line plus one action.
  - Toolbar on an empty list → hidden.
  - A product tour → none.

### editor-preview: editing beside a live preview on the real template
**Used by:** 12, 15, 16 (authoring) · Operate, Editorial preview
```
┌─────────────────────────┬──────────────────────┐
│ Entry · Draft                       [Publish] │
├─────────────────────────┼──────────────────────┤
│ Title ______            │ live preview on the  │
│ Body blocks…            │ real template; click │
│                         │ a field to edit      │
│                         │ [Desktop|Mobile]     │
└─────────────────────────┴──────────────────────┘
```
- **Regions:** editor `minmax(28rem,1fr)` and preview `1fr`, resizable, each scrolling on its own.
- **Responsive:**
  - ≥1280: 50/50.
  - ~1024 and below: an Edit | Preview toggle.
  - ≤480: edit only, with the preview full screen.
```css
.ep{display:grid;grid-template-areas:"edit prev";grid-template-columns:minmax(28rem,var(--edit-w,1fr)) minmax(0,1fr)}
.ep>*{overflow:auto;min-block-size:0}
@container page (width<64rem){.ep{grid-template-areas:"pane";grid-template-columns:1fr}}
```
- **Examples:** Sanity Presentation, Storyblok visual editor, Typeform builder.
- **Mistakes:**
  - Preview only in a new tab → side by side.
  - A preview that isn't the real template → render the real one.
  - A Save button → autosave, and publish is the action.

### file-browser: grid ⇄ list with an info panel
**Used by:** 23, 12 (assets), 27 (file list) · Operate
```
┌────────┬─────────────────────────────────┬─────────────┐
│ Recent │ My files › Brand   ▦|☰ [Upload] │ Preview     │
│ Shared │ ┌──┐ ┌──┐ ┌──┐ ┌──┐             │ meta · v3   │
│ Starred│ └──┘ └──┘ └──┘ └──┘             │ Share       │
│        │ ┌ Uploading 2 of 5 ▴ ┐          │             │
└────────┴─────────────────────────────────┴─────────────┘
```
- **Regions:**
  - Tile grid min 11rem with one thumbnail ratio; list mode is admin-table.
  - Info panel 20rem, toggled.
  - Upload tray bottom-end.
- **Responsive:**
  - ~1024: the info panel becomes a drawer.
  - ≤480: list form, with a full-screen preview you can swipe.
```css
.files{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,11rem),1fr));gap:var(--space-4)}
.files>.tile{display:grid;grid-row:span 2;grid-template-rows:subgrid}.tile>.thumb{aspect-ratio:4/3}
.browser:has(>.info){grid-template-columns:minmax(0,1fr) 20rem}
```
- **Examples:** Google Drive, Dropbox, Frame.io.
- **Mistakes:**
  - Truncated file names → truncate in the middle.
  - Mixed thumbnail ratios → one ratio.
  - A modal upload → tray.

### timeline-gantt: work over time, with a sticky label column
**Used by:** 3, 20 (roadmap), 25 (dispatch), 17 (leave) · Operate
```
┌───────────────┬──────────────────────────────────┐
│ Items         │ Oct      │ Nov      │ Dec  ┊today│
│ ▸ Launch      │ █████████                        │
│   API v2      │      ███████──◆                  │
│ ▸ Mobile      │               ██████████         │
└───────────────┴──────────────────────────────────┘
```
- **Regions:**
  - Label column 16–20rem, sticky inline.
  - The time track scrolls sideways; sticky date header; a today line.
  - Zoom: week, month, quarter.
- **Responsive:** ≤768 renders as an agenda list grouped by date.
```css
.tl{display:grid;grid-template-columns:var(--label-w,16rem) minmax(0,1fr);overflow:auto}
.tl .label{position:sticky;inset-inline-start:0;z-index:var(--z-sticky)}
.tl .track{display:grid;grid-template-columns:repeat(var(--units),var(--unit-w,2rem))}
```
- **Examples:** Linear timeline, GitHub Projects roadmap, Asana timeline.
- **Mistakes:**
  - Drag as the only way to reschedule → a date picker in the detail view.
  - The label column scrolling away → sticky.
  - Bars with no labels → title on or beside the bar.

---

# B. Pages

### landing: hero, proof, argument sections, pricing, FAQ, footer
**Used by:** the marketing site of any type · Persuade
```
│ wordmark     link link link       [Action] │ nav
│ Headline, ≤2 lines                          │ hero
│ Lede ≤2 lines     [Primary]   Secondary →   │
│ [ real product UI or photo ]                │
│ Proof: one named quote with a real number   │
│ Claim 1 + proof         (layout A)          │ argument
│ Claim 2 + proof         (layout B)          │
│ Pricing → FAQ (<details>) → designed close  │
```
- **Regions:**
  - Content max 72–80rem; page gutter `clamp(1rem,5vw,4rem)`.
  - Section padding `clamp(4rem,10cqi,8rem)`.
  - Prose at the reading measure; media breaks out (named lines).
- **Responsive:**
  - Compose 390 on its own.
  - The nav becomes wordmark, action and menu.
  - Split sections stack claim first, then media.
```css
.page{display:grid;grid-template-columns:[full-start] minmax(var(--gutter),1fr) [content-start] min(72rem,100% - 2*var(--gutter)) [content-end] minmax(var(--gutter),1fr) [full-end]}
.page>section{grid-column:full;display:grid;grid-template-columns:subgrid;padding-block:clamp(4rem,10cqi,8rem)}
.page>section>*{grid-column:content}
.claim{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:var(--space-12)}
```
- **Examples:** Linear, Stripe, Raycast.
- **Mistakes:**
  - A centred headline over 3 icon cards → claim-ordered sections.
  - Neighbouring sections with the same layout → vary them.
  - A link-farm footer → a designed close.
  - Bento by default → one dominant thing per screen.

### pricing: plan cards plus a comparison table
**Used by:** any SaaS, 9 · Persuade, Transact
```
│ Pricing                    [Monthly | Yearly] │
│ ┌Free──┐ ┌Pro────┐ ┌Business┐ ┌Enterprise┐   │
│ │ €0   │ │ €12/u │ │ €24/u  │ │ Contact  │   │
│ │[Start]│ │[Start]│ │[Start] │ │ [Talk]   │   │
│ │5 keys│ │5 keys │ │5 keys  │ │          │   │
│ Compare plans (sticky plan-name header)        │
│ Calculator · FAQ · footer                      │
```
- **Regions:**
  - 3–4 cards aligned with subgrid: name, price, CTA, lede, features.
  - Comparison table with a sticky plan header carrying the CTAs.
  - Max 72rem.
- **Responsive:**
  - ≥1024: 4 across.
  - ~768: 2×2.
  - ≤480: stacked in plan order. The comparison becomes a two-plan picker or per-plan sections.
```css
.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:var(--space-4)}
.plan{display:grid;grid-row:span 5;grid-template-rows:subgrid}
.compare thead{position:sticky;top:var(--nav-h)}
```
- **Examples:** Linear, Vercel, Notion pricing.
- **Mistakes:**
  - Features misaligned across cards → subgrid.
  - A yearly toggle that hides the monthly price → show both.
  - "Contact us" on every tier → real prices.

### product-detail: gallery, buy box, specs, reviews
**Used by:** 18 (buyer), any store · Transact
```
│ Home › Shoes › Runner                         │
│ ┌──────── gallery ───────┐ │ Runner Pro      │
│ │      main image        │ │ ★ 4.6 (212) €89 │
│ └────────────────────────┘ │ Colour ○ ○ ●    │
│  ▫ ▫ ▫ ▫ ▫                 │ Size  [42 ▾]    │
│                            │ [Add to cart]   │
│                            │ Delivery Thu 22 │
│ Details ▸  Specs ▸  Reviews (distribution)    │
```
- **Regions:**
  - Gallery 7/12 at a fixed ratio.
  - Buy box 5/12, min 20rem, sticky.
  - Below, full width: collapsible specs and reviews.
- **Responsive:**
  - ≥1024: 7/5.
  - ≤768: gallery swipe → title and price → variants → Add to cart. A sticky buy bar appears after scroll.
```css
.pdp{display:grid;gap:var(--space-8);align-items:start;grid-template-areas:"gallery buy" "more more";grid-template-columns:minmax(0,7fr) minmax(20rem,5fr)}
.pdp>.buy{position:sticky;top:calc(var(--nav-h) + var(--space-4))}
.pdp .gallery img{aspect-ratio:4/5;object-fit:cover}
@container page (width<48rem){.pdp{grid-template-areas:"gallery" "buy" "more";grid-template-columns:1fr}.pdp>.buy{position:static}}
```
- **Examples:** Apple Store, Shopify's Dawn theme, IKEA.
- **Mistakes:**
  - Hover-only Add to cart → always visible.
  - Sold-out variants hidden → faded and named.
  - "3–5 days" → a date.
  - An autoplaying carousel → a swipeable gallery.

### listing-search: facets plus a results grid or list
**Used by:** 18, 5 (storefront), 23 (search) · Transact
```
│ "boots" · 312 results          Sort: Relevance ▾│
│ Size 42 ✕   Brown ✕   Clear all                 │
│ Facets    │ ┌card┐ ┌card┐ ┌card┐ ┌card┐        │
│ ▸ Size    │ │img │ │    │ │    │ │    │        │
│ ▸ Colour  │ │t €p│ │    │ │    │ │    │        │
│ ▸ Price   │ └────┘ └────┘ └────┘ └────┘        │
│           │ Show more · 24 of 312              │
```
- **Regions:**
  - Facet sidebar 16rem, sticky with its own scroll. For few facets, a horizontal facet bar instead.
  - Cards min 15rem, aligned with subgrid.
- **Responsive:**
  - ≥1280: 4 columns.
  - ~1024: 3.
  - ≤768: "Filters (2)" opens a full-height sheet with a sticky "Show 128 results".
  - ≤480: 2 compact columns.
```css
.plp{display:grid;gap:var(--space-6);grid-template-areas:"bar bar" "facets grid";grid-template-columns:16rem minmax(0,1fr)}
.plp>.facets{position:sticky;top:var(--nav-h);max-block-size:calc(100dvh - var(--nav-h));overflow:auto}
.plp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,var(--card-min,15rem)),1fr))}
@container page (width<64rem){.plp{grid-template-areas:"bar" "grid";grid-template-columns:1fr}}
@container page (width<30rem){.plp{--card-min:9rem}}
```
- **Examples:** Zalando, Etsy, Amazon.
- **Mistakes:**
  - A full page reload per facet → live update.
  - Infinite scroll that hides the footer → "Show more".
  - Price shown only on hover → always visible.

### feed: browse a stream of content in an adaptive grid
**Used by:** 18 (discovery), media and social, 23 (gallery) · Showcase, Transact
```
│ For you  Following  Saved            │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│ │    │ │    │ │    │ │    │          │
│ └────┘ └────┘ └────┘ └────┘          │
│ ── section header spans all ──       │
```
- **Regions:**
  - Columns min 180dp, as many as fit (Material feed). Full-span headers.
  - Single column on compact widths.
- **Responsive:** column count follows the width; the list detail opens as list-peek or a push.
```css
.feed{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,11.25rem),1fr));gap:var(--space-4)}
.feed>.span{grid-column:1/-1}
```
- **Examples:** Google Play, Pinterest, YouTube home.
- **Mistakes:**
  - Masonry that reorders on load → fixed ratios.
  - Infinite scroll with no footer reachable → paginate or show more.

### cart-checkout: steps plus an order summary
**Used by:** 18, any store, 9 (upgrade) · Transact, Flow
```
│ wordmark                    Back to store     │
│ [Express pay] [Express pay] │ Order summary   │
│ ───────── or ─────────      │ Runner ×1   €89 │
│ Contact · Delivery · Payment│ Shipping     €4 │
│ [ fields ]                  │ Tax         €18 │
│ €111            [Pay now]   │ Total      €111 │
```
- **Regions:**
  - Form `minmax(0,36rem)`.
  - Summary 20–26rem, sticky, on a tinted surface.
  - Cart page: line items 2fr plus a sticky summary 1fr.
  - Shopify puts the summary on the right, Stripe Checkout on the left: pick one side, once.
- **Responsive:** below ~56rem the summary collapses into a top row "Show order summary · €111", and the action bar sticks at the bottom.
```css
.checkout{display:grid;justify-content:center;column-gap:var(--space-12);grid-template-areas:"form summary";grid-template-columns:minmax(0,36rem) minmax(20rem,26rem)}
.checkout>.summary{position:sticky;top:var(--space-6);align-self:start}
@container page (width<56rem){.checkout{grid-template-areas:"summary" "form";grid-template-columns:1fr}.checkout>.summary{position:static}}
```
- **Examples:** Shopify Checkout, Stripe Checkout, Apple Store bag.
- **Mistakes:**
  - Site nav leaking out of checkout → wordmark plus Back.
  - Costs revealed at the last step → shown up front.
  - Forced account creation → guest checkout.
  - The total inside the button → its own slot.

### docs: nav tree, content, on-page contents
**Used by:** docs sites, 13 (reader), 16 (lesson: outline | lesson | Next) · Reference
```
┌───────────────────────────────────────────────────┐
│ logo   Search ⌘K                v2 ▾  GitHub  ◐  │
├──────────┬───────────────────────────┬────────────┤
│ Guides   │ Guides › Auth             │ On this page│
│  Start   │ # Title                   │ Install     │
│ ▸ Auth   │ prose 65–80ch · code      │ Configure   │
│ Ref      │ ‹ Prev           Next ›   │             │
│          │ Edit · Updated Oct 2      │             │
└──────────┴───────────────────────────┴────────────┘
```
- **Regions (Starlight):**
  - Nav bar 3.5rem, 4rem at ≥50em.
  - Sidebar 18.75rem; content 45rem; table of contents 18.75rem.
  - Sidebar and table of contents sticky with their own scroll.
- **Responsive:**
  - ≥72rem: three panes.
  - 50–72rem: the table of contents becomes a collapsible "On this page" bar.
  - <50em: the sidebar becomes a menu drawer.
  - Code scrolls inside its block at every width.
```css
.docs{display:grid;grid-template-areas:"nav main toc";grid-template-columns:18.75rem minmax(0,1fr) 18.75rem}
.docs>main{inline-size:min(45rem,100%);padding-inline:var(--space-6)}
.docs>nav,.docs>.toc{position:sticky;top:var(--header-h);max-block-size:calc(100dvh - var(--header-h));overflow:auto}
@container shell (width<72rem){.docs{grid-template-areas:"nav main";grid-template-columns:18.75rem minmax(0,1fr)}}
@container shell (width<50rem){.docs{grid-template-areas:"main";grid-template-columns:1fr}}
```
- **Examples:** Starlight, Fumadocs, Stripe Docs.
- **Mistakes:**
  - A marketing hero on the docs home → search plus entry points.
  - A chatbot bubble over the content → ⌘K.
  - Code that scrolls the page → scroll inside the block.

### article: reading column, breakouts, sidenotes
**Used by:** blogs, reports, 8 (commentary), case studies · Editorial
```
│ masthead                                       │
│            Kicker                              │
│            Headline                            │
│            Dek · Byline · 16 Oct 2026          │
│ ┌────────── figure (feature / full) ───────┐   │
│            body ~66ch           ┌sidenote┐     │
│      ┌──── table (feature) ────┐└────────┘     │
```
- **Regions:**
  - Named lines full / feature / content (layout.md); measure 60–75ch; body 18–21px.
  - Sidenotes in the margin at ≥80rem.
  - Scrollytelling variant: a sticky graphic with stepping text (The Pudding, NYT).
- **Responsive:**
  - ~1024: sidenotes become inline popovers.
  - ≤480: figures go edge to edge; body 17–18px.
```css
.article{display:grid;grid-template-columns:[full-start] minmax(var(--gap),1fr) [feature-start] minmax(0,6rem)
  [content-start] min(66ch,100% - 2*var(--gap)) [content-end] minmax(0,6rem) [feature-end] minmax(var(--gap),1fr) [full-end]}
.article>*{grid-column:content}.article>.wide{grid-column:feature}.article>.bleed{grid-column:full}
@container shell (width>=80rem){.article>.sidenote{grid-column:content-end/full-end;max-inline-size:16rem;margin-inline-start:var(--space-8)}}
```
- **Examples:** NYT, The Pudding, Tufte CSS.
- **Mistakes:**
  - A hero image pushing the first sentence below the fold on a phone → a shorter crop.
  - Sticky share rails or a progress bar → none.
  - Text over images → captions.

### blog-index: scannable posts without cards
**Used by:** blogs, newsletters · Editorial
```
│ Blog                                    RSS │
│ Oct 14  │ Title of the post                 │
│         │ One-line dek · Author             │
│ Oct 2   │ Title…                            │
```
- **Regions:** max 48rem; date gutter 8rem plus title and dek; an archive by year.
- **Responsive:** ≤36rem puts the date above the title.
```css
.posts{display:grid;grid-template-columns:8rem minmax(0,1fr);column-gap:var(--space-6);row-gap:var(--space-8);max-inline-size:48rem}
@container page (width<36rem){.posts{grid-template-columns:1fr}}
```
- **Examples:** Stripe blog, Overreacted, Paul Graham essays.
- **Mistakes:**
  - A card grid of stock images → title, dek and date.
  - Relative dates → absolute.
  - Tag clouds → section links.

### changelog: dated entries with anchors
**Used by:** any product · Reference
```
┌────────────┬──────────────────────────────────┐
│ Oct 14     │ ## Feature name              #   │
│ 2026       │ [screenshot / video, feature col]│
│ (sticky)   │ prose · Fixes and improvements   │
│ Oct 1      │ ## …                             │
```
- **Regions:** date column 10rem, sticky; entry at the measure; media breaks out; an anchor per entry; RSS.
- **Responsive:** ≤768 puts the date above the entry.
```css
.log{display:grid;grid-template-columns:10rem minmax(0,45rem);column-gap:var(--space-8)}
.log>time{position:sticky;top:var(--nav-h);align-self:start}
@container page (width<48rem){.log{grid-template-columns:1fr}.log>time{position:static}}
```
- **Examples:** Linear, Vercel, Raycast changelogs.
- **Mistakes:**
  - Versions without dates → both.
  - No anchors → a linkable heading per entry.

### case-study: portfolio index plus case page
**Used by:** portfolio and agency sites · Showcase (the case page reads as Editorial)
```
INDEX                              CASE
│ Project — Identity — 2026  [prev]│ Title · role · client · year │
│ Project — Product  — 2025        │ ┌──── full-bleed work ────┐  │
│ Project — Web      — 2025        │ problem → move → result      │
│                                  │ ‹ Prev     Index     Next ›  │
```
- **Regions:**
  - The index is rows (title, discipline, year) with a hover or focus preview, or a grid with min 20rem.
  - The case page uses the article grid with full-bleed work.
- **Responsive:** the index becomes rows with inline thumbnails; back to the index restores scroll.
```css
.index>li{display:grid;grid-template-columns:minmax(12ch,1fr) 10rem 4rem;column-gap:var(--space-4)}
@container page (width<36rem){.index>li{grid-template-columns:1fr auto}.index .discipline{display:none}}
```
- **Examples:** Pentagram, Koto, personal portfolios.
- **Mistakes:**
  - A preloader or manifesto first → the work.
  - Crops that cut the work → one crop system.

### status-page: public service health
**Used by:** 21 (public face) · Monitor (public)
```
│ logo                                Subscribe │
│ ◆ Degraded: API — since 09:12 UTC             │
│ Incident title · updates, newest first        │
│ API         ▮▮▮▮▮▮▮▮▮▮▮▯▮▮  90 days            │
│ Dashboard   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮                     │
│ Past incidents by date                        │
```
- **Regions:**
  - One column, max 50rem.
  - The current state as one line, with no green "All systems operational" banner.
  - Day bars mark incident days; no uptime-% headline.
- **Responsive:** bars thin to 30 days at ≤480.
```css
.status{max-inline-size:50rem;margin-inline:auto;display:grid;gap:var(--space-8)}
.bars{display:grid;grid-template-columns:repeat(var(--days,90),1fr);gap:2px}
@media (width<30rem){.bars{--days:30}}
```
- **Examples:** GitHub Status (Atlassian Statuspage), Better Stack, Instatus.
- **Mistakes:**
  - Colour alone on bars → shape plus tooltip text.
  - Relative times → UTC timestamps.

### error-page: 404/500
**Used by:** every site · the register of the surrounding site
```
│ site nav (unchanged)                          │
│ Page not found                                │
│ [ Search ______ ]   Go to home                │
│ footer                                        │
```
- **Regions:** inside the real shell and grid, start-aligned at the content edge. A 500 adds Retry and a status-page link.
- **Responsive:** same.
```css
.error{grid-column:content;display:grid;gap:var(--space-4);justify-items:start;padding-block:var(--space-16)}
```
- **Examples:** GitHub 404, Stripe Docs 404 with search.
- **Mistakes:**
  - Jokes or illustrations on a 500 → state and recovery.
  - A dead end → search plus home.

---

# C. Mobile

### mobile-tabs-stack: tab bar plus a stack per tab
**Used by:** 22, 11, 26, 25 (field), consumer apps · native overlay
```
┌───────────────┐
│ Large Title   │
│ [ Search ]    │
│ row         › │
│ row         › │
├───────────────┤
│ ⌂   ☰   ✉   ● │ 3–5 tabs
└───────────────┘
```
- **Regions:**
  - iOS tab bar 49pt plus the safe area. On iOS 26 it floats in Liquid Glass; don't fake it.
  - Material navigation bar 80dp.
  - Each tab keeps its own stack; re-tapping a tab pops to root or scrolls to the top.
- **Responsive:**
  - ≥600dp: navigation rail.
  - ≥840dp: rail or drawer plus list-detail.
  - iPad: the tab bar adapts into a sidebar.
```css
.m-app{display:grid;block-size:100dvh;grid-template-rows:minmax(0,1fr) auto}
.tabbar{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;min-block-size:3.5rem;padding-block-end:env(safe-area-inset-bottom)}
@media (width>=37.5rem){.m-app{grid-template:"rail main" 1fr/5rem minmax(0,1fr)}}
```
- **Examples:** Instagram, Apple Music, Revolut.
- **Mistakes:**
  - A hamburger hiding top-level places → tabs.
  - More than 5 tabs → cut or merge.
  - The tab bar shown inside flows → hide it.

### mobile-master-detail: list → push detail
**Used by:** 26, 10, 20, 2 (mobile) · native overlay
```
LIST            →   DETAIL
┌───────────┐       ┌───────────┐
│ Inbox     │       │ ‹ Inbox  ⋯│
│ row       │       │ Title     │
│ row ▸     │       │ body      │
│ row       │       │ [Reply]   │
└───────────┘       └───────────┘
```
- **Regions:**
  - Push navigation with swipe back; back restores scroll and selection.
  - Detail actions in a bottom toolbar.
  - It becomes list-detail side by side at ≥840dp or iPad regular width.
- **CSS:** route-based; at ≥52.5rem use the inbox-3pane template.
- **Examples:** Mail, Gmail, Linear mobile.
- **Mistakes:**
  - The list re-fetching to the top on back → restore it.
  - Actions only reachable by swipe → also in a toolbar or ⋯.

### bottom-sheet: content over context, with detents
**Used by:** 18, 25 (maps), filters, pickers, copilot on mobile · native overlay
```
┌───────────────┐
│ map / content │
│ (interactive) │
├──── ═══ ──────┤ grabber
│ peek ~7.5rem  │
│ medium ~50%   │
│ large ≈ full  │
└───────────────┘
```
- **Regions:**
  - Detents: peek, medium, large.
  - Behind the sheet stays interactive at peek and medium (non-modal).
  - Grabber plus a close button. Scrolling inside the sheet first expands it to the next detent.
- **Desktop form:** a side sheet or panel of 22.5–25rem, never a bottom sheet.
```css
.sheet{position:fixed;inset-inline:0;bottom:0;block-size:calc(100dvh - 3rem);border-radius:12px 12px 0 0;
  translate:0 calc(100% - var(--detent,50dvh));transition:translate 220ms var(--ease-drawer);padding-block-end:env(safe-area-inset-bottom)}
.sheet[data-detent=peek]{--detent:7.5rem}.sheet[data-detent=large]{--detent:100%}
```
- **Examples:** Apple Maps, Google Maps, Airbnb map results.
- **Mistakes:**
  - Drag as the only way to close → a close button.
  - Stacked sheets → navigate inside one sheet.
  - A bottom sheet on desktop → side panel.

### fullscreen-flow: a focused task that hides the app chrome
**Used by:** 22 (send money), signup, compose, mobile checkout · Flow plus native overlay
```
┌───────────────┐
│ ✕    Amount   │ tab bar hidden
│ Send to Sara  │
│ [ €  120 ]    │
│ [ note ]      │
│               │
│ [ Continue ]  │ sticky above keyboard
└───────────────┘
```
- **Regions:**
  - Header with ✕ and the step name.
  - Body scrolls.
  - The primary is pinned above the keyboard.
- **Platform:** iOS `fullScreenCover` or a large sheet; Android full-screen dialog.
```css
.mflow{position:fixed;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto}
.mflow>footer{padding:var(--space-4);padding-block-end:max(var(--space-4),env(safe-area-inset-bottom))}
/* <meta name="viewport" content="…, interactive-widget=resizes-content"> so dvh shrinks with the keyboard */
```
- **Examples:** Revolut send, Monzo payments, Duolingo lesson.
- **Mistakes:**
  - The tab bar visible → hidden.
  - The primary under the keyboard → pinned above it.
  - ✕ losing data → keep the draft.

### fab: one floating primary create action
**Used by:** 26, 3, 22 (Android) · native overlay (Material)
```
┌───────────────┐
│ row           │
│ row           │
│          ┌──┐ │
│          │ +│ │ 56dp, 16dp inset
├──────────┴──┴─┤
│ nav bar       │
```
- **Regions:**
  - 56dp with 16dp radius, 16dp from the edges, above the nav bar.
  - The extended FAB (with label) shrinks on scroll.
  - One per screen, only for the screen's primary create action.
- **Platforms:** iOS has no FAB; the primary goes in the nav or toolbar. On desktop web it goes to the header primary.
```css
.fab{position:fixed;inset-inline-end:max(1rem,env(safe-area-inset-right));bottom:calc(var(--tabbar-h,0px) + 1rem + env(safe-area-inset-bottom));
  block-size:3.5rem;min-inline-size:3.5rem;border-radius:1rem}
.list{padding-block-end:5.5rem}
```
The list padding keeps the last row from sitting under the FAB.
- **Examples:** Gmail Android Compose, Google Keep.
- **Mistakes:**
  - A FAB for secondary or destructive actions → toolbar.
  - Several FABs → one.
  - A FAB on iOS → nav bar button.

---

## Index

| id | Used by (types) | Register |
|---|---|---|
| shell-sidebar | 1–5, 7, 9, 10, 12–14, 17, 19–25 | Operate/Monitor |
| inbox-3pane | 10, 26, 11, review queues | Operate |
| list-peek | 1, 2, 3, 5, 17, 20 | Operate |
| record-page | 2, 5, 10, 14, 17, 20, 24 | Operate |
| workspace-canvas | 27, 12, 15 | Operate |
| settings | 7, all SaaS | Operate (+Flow) |
| admin-table | 1, 5, 9, 14, 17 | Operate |
| board-kanban | 2, 3, 17, 20 | Operate |
| calendar | 4, 16, 17, 24, 25 | Operate (booker: Flow/Transact) |
| map-list | 18, 25, 22 | Transact/Operate |
| dashboard | 8, 19, 21, admin overview | Monitor |
| chat-artifact | 6, 11 | Converse |
| copilot-panel | any type with AI | Converse in Operate |
| command-palette | all Operate, docs | Operate/Reference |
| wizard | 15, 16, 18, 22, onboarding | Flow |
| auth-card | all | Flow |
| empty-first-run | all Operate | Operate/Flow |
| editor-preview | 12, 15, 16 | Operate |
| file-browser | 23, 12, 27 | Operate |
| timeline-gantt | 3, 20, 25, 17 | Operate |
| landing | marketing | Persuade |
| pricing | SaaS, 9 | Persuade/Transact |
| product-detail | stores, 18 | Transact |
| listing-search | 18, stores, 23 | Transact |
| feed | 18, media, 23 | Showcase/Transact |
| cart-checkout | stores, 18, 9 | Transact/Flow |
| docs | docs, 13, 16 | Reference |
| article | blogs, reports, 8 | Editorial |
| blog-index | blogs | Editorial |
| changelog | all products | Reference |
| case-study | portfolios | Showcase |
| status-page | 21 | Monitor (public) |
| error-page | all | site's register |
| mobile-tabs-stack | 22, 11, 26, 25 | native |
| mobile-master-detail | 26, 10, 20, 2 | native |
| bottom-sheet | 18, 25, filters | native |
| fullscreen-flow | 22, signup, checkout | Flow + native |
| fab | 26, 3, 22 (Android) | native |

## How to pick a layout from a prompt
1. **Register first** (SKILL.md §4), for the surface being built, not the whole product. Persuade, Editorial, Reference, Transact and Showcase map to section B; Flow maps to wizard, auth-card or fullscreen-flow.
2. **For Operate, the noun picks the type and the verb picks the shell:**
   - track → list-peek or board-kanban
   - answer → inbox-3pane
   - book → calendar
   - write → editor-preview or record-page
   - draw → workspace-canvas
   - watch → dashboard
   - find a place → map-list
3. **Detail container** (saas.md): people move item to item → inbox-3pane; the list is the main surface → list-peek; the record is a workspace → record-page.
4. **Compose; don't invent.**
   - One outer layout: shell-sidebar, or a page grid.
   - One inner layout per pane.
   - Plus overlays: command-palette, copilot-panel, bottom-sheet.
   - A prompt naming two layouts means the dominant object's layout owns the frame; the other becomes a view tab. "List and board" is one query with two views.
5. **Check every width tier.** Each entry's ≤480 form is designed on its own; it is not the desktop layout stacked. Mobile and native add section C.
6. **Nothing fits?** Name the nearest entry and the difference, and ask before making up a new layout.

**Sources:** [Android canonical layouts](https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts), [Android window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes), [Primer PageLayout](https://primer.style/product/components/page-layout/) plus `@primer/react@38.41.0` source, Carbon `@carbon/styles` UI shell SCSS, Starlight `props.css`, [Shopify app layout](https://shopify.dev/docs/apps/design/layout) / [Polaris layout](https://polaris.shopify.com/components/layout), [Atlassian new navigation](https://support.atlassian.com/navigation/docs/what-is-the-new-navigation-in-atlassian-home/).