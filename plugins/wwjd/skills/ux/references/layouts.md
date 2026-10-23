# Layouts

38 layouts. Read the index, grep `### <id>`, read one entry. Kit classes: `kit/layouts.css` (copy it). Keys: **Regions** sizes, behaviour · **Responsive** per width tier · **Mistakes** never → instead · **Ex** a product to study.

## Index

| id | job | use when (register · product types) |
|---|---|---|
| shell-sidebar | global frame of a product app | Operate, Monitor · 1–5, 7, 9, 10, 12–14, 17, 19–25 |
| inbox-3pane | process items one after another, queue in view | Operate · 10, 26, 11, review queues |
| list-peek | list is the surface; side panel previews/edits the selection | Operate · 1, 2, 3, 5, 17, 20 |
| record-page | a record that is its own workspace | Operate · 2, 5, 10, 14, 17, 20, 24 |
| workspace-canvas | create on a canvas, tools start, inspector end | Operate · 27, 12, 15 |
| settings | sub-nav plus section pages | Operate (Flow for plan changes) · 7, every SaaS |
| admin-table | manage records across rows | Operate · 1, 5, 9, 14, 17, admin |
| board-kanban | move items through a workflow by status | Operate · 2, 3, 17, 20 |
| calendar | week/day grid plus mini-month | Operate (booker: Flow/Transact) · 4, 16, 17, 24, 25 |
| map-list | browse results that have a place | Transact, Operate · 18, 25, 22 |
| dashboard | the model's lead plus regions | Monitor · 8, 19, 21, admin overview |
| chat-artifact | threads, conversation, artifact pane | Converse · 6, 11 |
| copilot-panel | AI side panel docked beside the app's view | Converse in Operate · any type with AI |
| command-palette | one door to search, navigation and actions | Operate, Reference · all |
| wizard | stepper, step, action bar | Flow · 15, 16, 18, 22, onboarding |
| auth-card | sign in / sign up | Flow · all |
| empty-first-run | first use that leads to first value | Operate, Flow · all Operate |
| editor-preview | edit beside a live preview on the real template | Operate · 12, 15, 16 |
| file-browser | grid ⇄ list with an info panel | Operate · 23, 12, 27 |
| timeline-gantt | work over time, sticky label column | Operate · 3, 20, 25, 17 |
| landing | hero, proof, argument, pricing, FAQ, footer | Persuade · marketing |
| pricing | plan cards plus comparison table | Persuade, Transact · SaaS, 9 |
| product-detail | gallery, buy box, specs, reviews | Transact · stores, 18 |
| listing-search | facets plus results | Transact · 18, 5, 23 |
| feed | browse a stream in an adaptive grid | Showcase, Transact · 18, media, 23 |
| cart-checkout | steps plus order summary | Transact, Flow · stores, 18, 9 |
| docs | nav tree, content, on-page contents | Reference · docs, 13, 16 |
| article | reading column, breakouts, sidenotes | Editorial · blogs, reports, 8 |
| blog-index | scannable posts without cards | Editorial · blogs |
| changelog | dated entries with anchors | Reference · all products |
| case-study | portfolio index plus case page | Showcase · portfolios |
| status-page | public service health | Monitor (public) · 21 |
| error-page | 404 / 500 | the site's register · all |
| mobile-tabs-stack | tab bar plus a stack per tab | native · 22, 11, 26, 25 |
| mobile-master-detail | list → pushed detail | native · 26, 10, 20, 2 |
| bottom-sheet | content over context, with detents | native · 18, 25, filters, pickers |
| fullscreen-flow | focused task, app chrome hidden | Flow + native · 22, signup, checkout |
| fab | one floating primary create action | native (Material) · 26, 3, 22 |

## How to pick
1. **Register first** (SKILL.md §4), per surface, not per product. Persuade, Editorial, Reference, Transact and Showcase use section B; Flow uses wizard, auth-card or fullscreen-flow.
2. **Operate:** the verb → layout table and the detail container (inbox-3pane / list-peek / record-page) live in `registers/operate.md`.
3. **Compose; don't invent.** One outer layout (shell-sidebar or a page grid), one inner layout per pane, plus overlays (command-palette, copilot-panel, bottom-sheet). Two layouts asked for: the dominant object's owns the frame, the other is a view tab ("list and board" = one query, two views).
4. **Every width tier gets its own form;** the ≤480 form is designed, not the desktop stacked. Mobile and native add section C.
5. **Nothing fits?** Name the nearest entry and the difference, and ask before inventing one.

## Conventions
- **Width tiers** (container, rem): XL ≥80 (1280) · L ~64 (1024) · M ~48 (768) · S ≤30 (480).
- **Containers:** `.shell` is container `shell`, its main pane container `main`; layouts inside the app query `main`, pages outside the shell query the viewport. Top-layer overlays (dialogs, palettes, sheets) use `@media`, never `@container`.
- **Panes** are sibling scroll regions (`min-block-size:0; overflow:auto; scrollbar-gutter:stable`); never a scroll inside a scroll. The shell is `100dvh`.
- **Absent areas:** a child whose grid area is missing at this width is hidden (`display:none`) or moved to an overlay; otherwise it lands in an implicit track.
- **Resizable panes:** handle is `role="separator"`, arrow keys move it, double-click resets, width remembered per person in a custom property (`--list-w`).
- **Shared sizes:** header 48px (control 32 + 2×8); nav 15rem, rail 3.5rem; inspector 18–20rem; peek, drawer, copilot 25–30rem; text tracks `minmax(12ch,1fr)`; panels `min(Xrem,100%)`.

---

# A. App shells

### shell-sidebar: global frame of a product app
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
- **Responsive:** ≥1280 full nav · ~1024 icon rail 3.5rem · ~768 nav as a drawer from the header · ≤480 bottom tab bar, 3–5 places (mobile-tabs-stack).
- **Mistakes:** top nav and side nav both → one nav; action icons in the nav → places only; nav on the content's tone → one tone below; a header layout per page → one header anatomy.
- **Ex:** Linear, Slack.

### inbox-3pane: process items one after another, queue in view
Kit: `.inbox` (`.views` · `.list` · `.thread` · `.context`).
```
+------+---------------+----------------------+---------+
|Views |● Subject   2m | Thread title  [Reply]| Customer|
|Mine 4|  preview line | message              | facts   |
|Unass.|▸ selected     | + composer -------+  | orders  |
+------+---------------+----------------------+---------+
```
- **Regions:** views 14rem; list 20–25rem, resizable, min 17.5rem; thread `1fr`, min 30rem, ~70ch reading column; context 18rem, toggled and remembered; sticky thread header and composer.
- **Responsive** (main pane width): ≥84rem all four · <84rem context as a drawer · <66rem views move to a dropdown in the list header · <48rem stacked drill-down; back restores scroll and selection.
- **Mistakes:** item opens in a modal → split pane; jump to top after an action → advance to the next item, keep scroll; six meta fields per row → sender, subject, one preview line, time.
- **Ex:** Front.

### list-peek: list is the surface; side panel previews/edits the selection
Kit: `.list-peek` (`.list` · `.peek`, width `--peek-w`).
- **Regions:** list `minmax(32rem,1fr)`; peek 25–30rem, resizable 22.5rem to 50%, **pushes** the list, never covers it; ⤢ opens the record page; Esc closes and returns focus to the row; j/k moves the selection while open.
- **Responsive:** ≥1280 pushes · ~1024 overlays as a drawer · ~768 the record is a full-page route · ≤480 list, then pushed detail.
- **Mistakes:** modal record view → peek; peek open on load → only on selection; edit modal on the peek → edit in place.
- **Ex:** Linear issue peek.

### record-page: a record that is its own workspace
Kit: `.record` (`.head` · `.body` · `.side`).
```
+------------------------------------------------+
| ‹ Deals / Halden renewal   ● Won   [Action]  ⋯ |
| Overview   Activity   Files                     |
+-----------------------------+------------------+
| body, notes, activity       | ≤7 key properties|
|                             | related records  |
+-----------------------------+------------------+
```
- **Regions:** sticky header: title (wraps), status, ≤2 actions + ⋯; ≤5 tabs; body `1fr`, reading content ≤48rem; side 16–20rem, sticky under the header.
- **Responsive:** ≥1024 two columns · ~768 side stacks **above** the body as a compact property list, the rest under "More fields" · ≤480 one column, actions in ⋯ or a sticky bottom bar.
- **Mistakes:** properties as a form in the body → side list with popover pickers; tabs as activity filters → filter inside Activity; description paragraph under the title → none.
- **Ex:** GitHub issue.

### workspace-canvas: create on a canvas, tools start, inspector end
- **Regions:** top bar 48px; layers 15rem, resizable; canvas `1fr` (`overflow:hidden`), pans and zooms inside itself, never scrolls the page; inspector 15–17.5rem; context toolbar beside the selection (tools may float at the bottom instead).
- **Responsive:** ≥1280 all panes · ~1024 layers toggle (⌘\) as an overlay · ~768 inspector as a bottom sheet · ≤480 view and comment only.
- **Mistakes:** property dialogs → inspector; active tool or mode not shown → show it; empty inspector with no selection → document properties.
- **Ex:** Figma.

### settings: sub-nav plus section pages
Kit: `.settings` (`.subnav` · `.body`), rows `.setting`.
- **Regions:** sub-nav 14rem, replacing the app nav or inside main; content ≤45rem, start-aligned; rows: label and hint at the start, control at the end; 5–9 categories; danger zone last.
- **Responsive:** ≥1024 sub-nav + content · ~768 sub-nav becomes an index page, sections drill in · ≤480 grouped list then push; control stacks under its label.
- **Mistakes:** one long form → section pages; danger zone mid-page → last.
- **Ex:** GitHub repository settings.

### admin-table: manage records across rows
- **Regions:** view tabs 36px; filter bar at control height; table edge to edge, header 32px, rows `--row-h`; identifier column `minmax(14ch,2fr)`, sticky on horizontal scroll; bulk bar floats at the bottom; paginate past 50 rows.
- **Responsive:** ≥1280 identifier + 5–8 columns (`budgets.md` `admin-table`) · ~1024 columns drop by priority · ~768 identifier, status and the one deciding number · ≤480 two-line list items. Sideways scroll only when comparing is the job: sticky first column inside a focusable region.
- **CSS:** each row `grid-column:1/-1; grid-template-columns:subgrid`; low-priority cells get a class hidden by container query.
- **Mistakes:** KPI tiles above the table → that's Monitor; buttons on every row → one inline action + ⋯.
- **Ex:** Stripe Customers.

### board-kanban: move items through a workflow by status
- **Regions:** columns fixed 17–20rem, gap 12; board scrolls sideways (focusable, labelled), each column vertically; sticky column headers; Done collapsible; optional swimlanes with sticky lane headers.
- **Responsive:** ≥1280 4–5 columns · ~1024 3 · ~768 2 with snap · ≤480 one column per screen with mandatory snap and a switcher, or a list grouped by status.
- **CSS:** `grid-auto-flow:column; grid-auto-columns:var(--col-w,18rem); overflow-x:auto; scroll-snap-type:x proximity`; ≤480 `--col-w:calc(100% - 2.5rem)`, snap mandatory.
- **Mistakes:** board for records with no workflow → table; 8 fields per card → identifier, status, avatar, one deciding meta.
- **Ex:** Trello.

### calendar: week/day grid plus mini-month
- **Regions:** sidebar 16rem; time gutter 3.5rem; hour rows 48px (15-min rows 12px); sticky day header and gutter; all-day row; opens scrolled to now or working hours; details in a popover anchored to the event; drag to create. Variants: resources (one column per person or room); booker (event info | month | slots).
- **Responsive:** ≥1280 week + sidebar · ~1024 sidebar toggles · ~768 3 days · ≤480 one day with a week strip, swipe between days, or agenda. Booker stacks info → month → slots.
- **CSS:** week `grid-template-columns:3.5rem repeat(var(--days,7),minmax(0,1fr)); grid-auto-rows:calc(var(--hour-h,3rem)/4)`; event `grid-column:calc(var(--day) + 1); grid-row:calc(var(--q) + 1)/span var(--len)`.
- **Mistakes:** month as the scheduling default → week; edit in a centred modal → popover, then side panel; unlabelled timezone → labelled, switchable; view resets to midnight → scroll to now.
- **Ex:** Google Calendar.

### map-list: browse results that have a place
- **Regions:** list ~60%, card grid min 16rem; map ~40%, sticky full height; hover or focus on a card highlights its pin and the reverse; "Search as I move the map" is opt-in. Dispatch variant: map | unassigned queue | per-technician timeline.
- **Responsive:** ≥1280 two-column cards + map · ~1024 one column + map · ~768 floating List/Map toggle · ≤480 full-screen map, list in a bottom sheet.
- **Mistakes:** results change as the map pans → "Search this area"; pins with no list equivalent → the list is the source of truth for keyboard and screen readers.
- **Ex:** Airbnb.

### dashboard: the model's lead plus regions
The lead (L0) follows the model (`registers/monitor.md` §2): alerting an L0 strip (shown), scorecard metrics against target, explore or trend one large trend, progress the goal and today.
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
- **Regions:** header line; L0 full width (a list: ≤5 rows, or one quiet line when calm); ≤5 regions; charts at a fixed aspect ratio (`16/6`); L0 + L1 fit 1280×800.
- **Responsive:** ≥1024 2fr/1fr · ≤768 one column, L0 first · ≤480 L0, one headline trend, then sparkline rows or a short ranked list.
- **Mistakes:** bare KPI tiles first → the model's lead, every number with its context; filler widgets → empty space is allowed; time range per widget → one global range; gauges or donuts → a number or a bullet bar.
- **Ex:** Datadog (alerting), PostHog (explore).

### chat-artifact: threads, conversation, artifact pane
- **Regions:** threads 16rem, collapsible; thread column `min(48rem,100%)` centred in its pane; composer sticky, grows to 40dvh; artifact pane on demand ~50%, resizable; conversation keeps ≥24rem.
- **Responsive:** ≥1280 all three · ~1024 threads to a drawer while an artifact is open · ~768 Chat | Artifact toggle · ≤480 artifact as a full-screen sheet.
- **CSS:** `.chat:has(>.artifact){grid-template-columns:16rem minmax(24rem,1fr) minmax(24rem,var(--art-w,1fr))}`.
- **Mistakes:** assistant bubbles → a document column; artifact in a modal → a pane; following the bottom while streaming → pin the person's message.
- **Ex:** Claude artifacts.

### copilot-panel: AI side panel docked beside the app's view
Kit: the `.shell > .inspector` slot.
- **Regions:** panel 22.5–30rem (default 25rem), resizable, non-modal, **pushes** the content; open state remembered per person; header toggle + shortcut; a context chip shows what the assistant sees.
- **Responsive:** ≥1280 pushes · ~1024 overlay drawer · ≤480 bottom sheet (medium/large).
- **Mistakes:** floating chat bubble over content → docked panel; auto-open → the person opens it; results only in the chat → they land in the object.
- **Ex:** Notion AI.

### command-palette: one door to search, navigation and actions
- **Regions:** dialog `min(40rem,100% - 2rem)`, **anchored ~15vh from the top** so it doesn't jump as results change, max height `min(60dvh,32rem)`; items at control height, shortcut at the end, grouped; scope chip when scoped ("ENG-412 ›").
- **Responsive:** ≤480 full-width top sheet plus a visible search entry in the header.
- **Mistakes:** navigation only → actions too; no visible entry point → header field showing ⌘K.
- **Ex:** Raycast, Linear ⌘K.

### wizard: stepper, step, action bar
Kit: `.wizard` (`.top` · `.body` · `.bar`, optional `.with-summary` + `.summary`).
- **Regions:** column `min(40rem,100% - 2rem)`, centred as a column, text start-aligned; stepper one row; Back above the heading; sticky action bar aligned to the column, summary at the start, primary at the end.
- **Responsive:** ≥1024 optional summary column 22rem · ≤480 stepper becomes "Plan · 2 of 3", bar sits above the keyboard.
- **Mistakes:** Back beside the primary → at the top; total inside the button → its own slot; no exit → wordmark + "Back to site", draft kept.
- **Ex:** Vercel New Project.

### auth-card: sign in / sign up
Kit: `.auth` (`header` · `.card` · `footer`).
- **Regions:** card `min(24rem,100% - 2rem)`, ~12dvh from the top (true centre shifts when the keyboard opens); split variant (form | brand panel) only at ≥1024.
- **Responsive:** ≤480 drops the card chrome; the form sits in the page column.
- **Mistakes:** carousel beside the form → nothing, or one brand panel; password rules after failure → live checklist while typing.
- **Ex:** Slack sign-in.

### empty-first-run: first use that leads to first value
Kit: `.empty` (base.css).
- **Regions:** inside the real shell; a start-aligned block at the list's left edge, ≤30rem, ~15% down; toolbar, filters and headers hidden; centred only on a canvas; seeded example content beats an empty screen.
- **Responsive:** same block; the primary goes full width at ≤480.
- **Mistakes:** illustration + paragraph + 3 CTAs → one line + one action; toolbar on an empty list → hidden; product tour → none.
- **Ex:** Notion first page, Figma drafts.

### editor-preview: edit beside a live preview on the real template
- **Regions:** editor `minmax(28rem,1fr)` | preview `1fr`, resizable, each scrolls on its own.
- **Responsive:** ≥1280 50/50 · ≤1024 Edit | Preview toggle · ≤480 edit only, preview full screen.
- **Mistakes:** preview only in a new tab → side by side; preview not the real template → render the real one; a Save button → autosave, Publish is the action.
- **Ex:** Sanity Presentation.

### file-browser: grid ⇄ list with an info panel
- **Regions:** tile grid min 11rem, one thumbnail ratio (4/3); list mode = admin-table; info panel 20rem, toggled; upload tray bottom-end.
- **Responsive:** ~1024 info panel → drawer · ≤480 list form, swipeable full-screen preview.
- **Mistakes:** file names truncated at the end → truncate in the middle; mixed thumbnail ratios → one; modal upload → tray.
- **Ex:** Google Drive.

### timeline-gantt: work over time, sticky label column
- **Regions:** label column 16–20rem, sticky inline (`inset-inline-start:0`); time track scrolls sideways; sticky date header; today line; zoom week / month / quarter.
- **Responsive:** ≤768 agenda list grouped by date.
- **Mistakes:** drag the only way to reschedule → date picker in the detail view; unlabelled bars → title on or beside the bar.
- **Ex:** Asana timeline.

---

# B. Pages

### landing: hero, proof, argument, pricing, FAQ, footer
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
- **Regions:** content 72–80rem; spacing from the marketing profile (`--page-margin`, `--space-section`); prose at the measure, media breaks out. Hero: `heroes.md`.
- **Responsive:** nav becomes wordmark + action + menu; split sections stack claim first, then media.
- **Mistakes:** centred headline over 3 icon cards → claim-ordered sections; neighbouring sections with the same layout → vary them; link-farm footer → designed close; bento by default → one dominant thing per screen.
- **Ex:** Plausible, Linear.

### pricing: plan cards plus comparison table
- **Regions:** 3–4 cards aligned with subgrid (name, price, CTA, lede, features); comparison table with a sticky plan header carrying the CTAs; max 72rem.
- **Responsive:** ≥1024 4 across · ~768 2×2 · ≤480 stacked in plan order; comparison becomes a two-plan picker or per-plan sections.
- **Mistakes:** features misaligned across cards → subgrid; yearly toggle hides the monthly price → show both; "Contact us" on every tier → real prices.
- **Ex:** Vercel pricing.

### product-detail: gallery, buy box, specs, reviews
- **Regions:** gallery 7/12 at a fixed ratio (4/5, `object-fit:cover`); buy box 5/12, min 20rem, sticky; below, full width: collapsible specs and reviews.
- **Responsive:** ≥1024 7/5 · ≤768 gallery swipe → title and price → variants → Add to cart; sticky buy bar after scroll.
- **Mistakes:** sold-out variants hidden → faded and named; "3–5 days" → a date; autoplay carousel → swipeable gallery.
- **Ex:** Apple Store.

### listing-search: facets plus results
- **Regions:** facet sidebar 16rem, sticky with its own scroll (few facets: a horizontal bar instead); cards min 15rem, aligned with subgrid.
- **Responsive:** ≥1280 4 columns · ~1024 3 · ≤768 "Filters (2)" opens a full-height sheet with a sticky "Show 128 results" · ≤480 2 compact columns (`--card-min:9rem`).
- **Mistakes:** page reload per facet → live update; infinite scroll hiding the footer → "Show more".
- **Ex:** Zalando.

### feed: browse a stream in an adaptive grid
Kit: `.tiles` with `--tile-min: 11.25rem`.
- **Regions:** columns min 180dp, as many as fit; full-span headers (`grid-column:1/-1`); one column on compact widths.
- **Responsive:** column count follows the width; detail opens as list-peek or a push.
- **Mistakes:** masonry that reorders on load → fixed ratios; infinite scroll with the footer unreachable → paginate or show more.
- **Ex:** Google Play.

### cart-checkout: steps plus order summary
- **Regions:** form `minmax(0,36rem)`; summary 20–26rem, sticky, on a tinted surface; cart page: line items 2fr + sticky summary 1fr. Pick one side for the summary, once.
- **Responsive:** below ~56rem the summary collapses into a top row "Show order summary · €111"; the action bar sticks at the bottom.
- **Mistakes:** site nav leaking into checkout → wordmark + Back; forced account → guest checkout; total inside the button → its own slot.
- **Ex:** Shopify Checkout.

### docs: nav tree, content, on-page contents
Kit: `.docs` (`nav` · `main` · `.toc`); profile `docs`.
- **Regions:** nav bar 3.5rem (4rem from 50em); sidebar and contents 18.75rem, sticky with their own scroll; content ≤45rem, ending in Prev / Next, Edit and the updated date.
- **Responsive:** ≥72rem three panes · 50–72rem contents become a collapsible "On this page" bar · <50em sidebar becomes a menu drawer. Code scrolls inside its block at every width.
- **Mistakes:** marketing hero on the docs home → search + entry points; chatbot bubble over content → ⌘K; code that scrolls the page → scroll inside the block.
- **Ex:** Stripe Docs.

### article: reading column, breakouts, sidenotes
Kit: `.breakout .flow` (base.css) + `.article`; profile `reading`.
- **Regions:** named lines full / feature / content; measure 60–75ch; body 18–21px; sidenotes in the margin at ≥80rem. Scrollytelling variant: sticky graphic with stepping text.
- **Responsive:** ~1024 sidenotes become inline popovers · ≤480 figures edge to edge, body 17–18px.
- **Mistakes:** hero image pushes the first sentence below the phone fold → shorter crop; sticky share rails or a progress bar → none; text over images → captions.
- **Ex:** The Pudding.

### blog-index: scannable posts without cards
- **Regions:** max 48rem; date gutter 8rem + title and dek; archive by year.
- **Responsive:** ≤36rem date above the title.
- **Mistakes:** card grid of stock images → title, dek, date; relative dates → absolute; tag clouds → section links.
- **Ex:** Overreacted.

### changelog: dated entries with anchors
- **Regions:** date column 10rem, sticky (`align-self:start`); entry at the measure (≤45rem); media breaks out; an anchor per entry; RSS.
- **Responsive:** ≤768 date above the entry.
- **Mistakes:** versions without dates → both; no anchors → a linkable heading per entry.
- **Ex:** Stripe changelog.

### case-study: portfolio index plus case page
- **Regions:** index as rows (title, discipline, year) with a hover or focus preview, or a grid min 20rem; case page on the article grid with full-bleed work (reads as Editorial).
- **Responsive:** index rows get inline thumbnails, discipline hidden ≤36rem; back to the index restores scroll.
- **Mistakes:** preloader or manifesto first → the work; crops that cut the work → one crop system.
- **Ex:** Pentagram.

### status-page: public service health
- **Regions:** one column, max 50rem; current state as the headline sentence (all fine, or what is affected since when, with the latest update); colour only when something is wrong; no uptime-% headline; components listed; 90 day bars mark incident days; subscribe to updates.
- **Responsive:** ≤480 bars thin to 30 days.
- **Mistakes:** relative times → UTC timestamps.
- **Ex:** GitHub Status.

### error-page: 404 / 500
- **Regions:** inside the real shell and grid, start-aligned at the content edge; a 500 adds Retry and a status-page link.
- **Mistakes:** jokes or illustrations on a 500 → state and recovery; a dead end → search + home.
- **Ex:** Stripe Docs 404.

---

# C. Mobile

### mobile-tabs-stack: tab bar plus a stack per tab
- **Regions:** iOS tab bar 49pt + safe area (the platform's own bar, never faked); Material navigation bar 80dp; each tab keeps its own stack; re-tapping pops to root or scrolls to top.
- **Responsive:** ≥600dp navigation rail · ≥840dp rail or drawer + list-detail · iPad: the tab bar adapts into a sidebar.
- **Mistakes:** hamburger hiding top-level places → tabs; tab bar inside flows → hidden.
- **Ex:** Apple Music.

### mobile-master-detail: list → pushed detail
- **Regions:** push with swipe back; back restores scroll and selection; detail actions in a bottom toolbar; side by side at ≥840dp or iPad regular width (inbox-3pane at ≥52.5rem).
- **Mistakes:** list re-fetches to the top on back → restore it; actions only by swipe → also in a toolbar or ⋯.
- **Ex:** Mail.

### bottom-sheet: content over context, with detents
- **Regions:** detents peek (7.5rem) / medium / large; behind stays interactive at peek and medium (non-modal); grabber + close button; scrolling inside first expands to the next detent.
- **Desktop:** a side sheet or panel 22.5–25rem, never a bottom sheet.
- **CSS:** `position:fixed; inset-inline:0; bottom:0; block-size:calc(100dvh - 3rem); translate:0 calc(100% - var(--detent,50dvh)); padding-block-end:env(safe-area-inset-bottom)`. Motion: `wwjd:motion`.
- **Mistakes:** stacked sheets → navigate inside one.
- **Ex:** Apple Maps.

### fullscreen-flow: focused task, app chrome hidden
- **Regions:** header with ✕ and the step name; body scrolls; primary pinned above the keyboard. iOS `fullScreenCover` or a large sheet; Android full-screen dialog.
- **CSS:** `position:fixed; inset:0; grid-template-rows:auto minmax(0,1fr) auto`; footer `padding-block-end:max(var(--space-4),env(safe-area-inset-bottom))`; viewport meta `interactive-widget=resizes-content` so dvh shrinks with the keyboard.
- **Mistakes:** tab bar visible → hidden; ✕ loses data → keep the draft.
- **Ex:** Revolut send.

### fab: one floating primary create action
- **Regions:** 56dp, radius 16dp, 16dp from the edges, above the nav bar; the extended FAB (with label) shrinks on scroll; one per screen, only for the screen's primary create; the list gets `padding-block-end:5.5rem` so the last row stays reachable.
- **Platforms:** iOS has no FAB (primary in the nav or toolbar); desktop web uses the header primary.
- **Mistakes:** FAB for secondary or destructive actions → toolbar; several FABs → one; FAB on iOS → nav bar button.
- **Ex:** Gmail Android Compose.
