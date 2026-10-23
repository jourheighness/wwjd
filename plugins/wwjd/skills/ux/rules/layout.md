# Layout: edges, spacing, wrapping, fit, responsive

Classes: `kit/base.css`; page shells: `kit/layouts.css`; layout ids: `references/layouts.md`.

## Edges
- **2–3 text edges per page;** logical properties, so RTL holds.
- **Chrome hangs in the gutter** so content keeps the column edge: `.bleed` for a container's surface and padding, `.hang-fill` for fills, leading icons, bullets and hover or edit fills. Never ad-hoc negative margins.
- **`.breakout`:** text at `content` (the measure); tables, charts and media at `feature` or `full`.
- **`.subcards`:** sibling cards share rows through subgrid; titles, meta and actions align, actions pinned to the bottom.
- **Centre only** a table, figure or quote in a reading column, a canvas empty state, the hero moment, an icon in its button; never a settings page or a mid-flow step.
- **Optical:** checkbox or icon aligns to the first text line; play and arrow glyphs nudge ~2px toward their direction; nested radii concentric (outer = inner + padding).
- **Size for the longest real string.** **Absent optional meta is omitted,** not "—" (table cells: `rules/states.md` § Data states). **DOM order = reading order;** no `order` or placement that changes meaning.

## Spacing
- **4px scale, `gap` between siblings,** by relationship: `--space-inside` < `--space-between` < `--space-group` < `--space-section`; `--pad-box` inside boxes.
- **Proximity:** more space above a heading than below; gaps between sections beat gaps inside; same slot, same padding.
- **Controls side by side share `--control-h`** and align on both edges (runtime `control-height-mismatch`). One containment level; nothing cramped against an edge.

## Wrapping and truncation
| Field | Treatment |
|---|---|
| Identifier (name, title) | Wraps; 2 lines fine, past 3 switch the layout |
| Secondary meta | End truncation (`.trunc`) |
| File names, paths, hashes, emails in dense tables | Middle truncation (`.trunc-mid`: head + fixed tail) |
| Previews, descriptions | `.clamp-2`, never on the title |
| Numbers, money, dates, anything compared | Never truncate; number and unit on one line (`10&nbsp;MB`) |
| Clickable text | Shorten first; may wrap; never clip |

- Anything truncated shows full text on hover, focus and tap (kit tooltip or detail view).
- `min-width: 0` on flex text children; `flex-shrink: 0` on avatars, icons, badges.
- `overflow-wrap: anywhere` only on unbreakable tokens (`.break-token`); titles and prose use `break-word` (lint `anywhere-on-text`, `break-all`).
- Wrapping text: the row top-aligns, the icon slot is `block-size: 1lh`; never `align-items: center`.
- `text-wrap: balance` on headings (with a max inline size), `pretty` on prose; never global; no hard `<br>`.
- **Translation budget:** +30–40% for sentences, 200–300% for strings under 10 characters. Labelled controls get `min-width`, never a fixed `width`.

## Fit: components at every size
Size classes come from the slot (`.fit`), never a shrink-wrapped flex item; thresholds in rem.

| | L ≥40rem | M | S <20rem |
|---|---|---|---|
| Layout | icon · identifier · meta · actions | meta under the identifier | stacked; actions row below |
| Meta | all; progress as label + count above its bar | tertiary drops (relative time, avatar stack, tags past 3 → "+N"); progress label drops, bar stays | status + the one deciding number |
| Actions | primary + ≤2 shortcuts + ⋯ | primary + ⋯ | primary + ⋯ |

`.fit-row` implements it: tertiary meta `data-tier="3"`, shortcuts `data-shortcut`, the progress label `.progress-label`.
- **Give-way order:** tertiary meta drops → shortcuts fold into ⋯ (focus returns to the trigger) → secondary text truncates, descriptions clamp to 2 → the layout switches → the identifier wraps more. **Never given up:** identifier, status, the deciding number, the primary, ⋯.
- Parent variants (`--density`, `--emphasis`) arrive by style queries; `cqi` for spacing only, never font size in product UI.
- **Intrinsic primitives before breakpoints:** `.flow` (stack), `.cluster` (tags, meta, toolbars), `.with-sidebar`, `.switcher` (all in a row or all stacked), `.tiles`, `.reel` (browsable collections only, never actions or table columns).

**Identifier** (`data-identifier`; lint `identifier-truncate`, runtime `identifier-clipped`, `identifier-long`):
- Lists keep one row height sized for the usual identifier (often 2 lines); a rare longer one clamps there, full text on hover, focus, tap and in detail.
- **Fixed-height dense UI** (tables, trees, tabs, file pickers) may truncate to one line if the column resizes or detail has the full text; ≥4 characters stay; shared-prefix siblings truncate in the middle.
- Meta stays one line (`nowrap`; runtime `orphan-item`); a value that would wrap goes compact (avatar, short date) or drops in give-way order.
- **No lone item:** an avatar, icon or badge never sits alone on its line; it joins its row (a person's avatar before the meta or as its last item, never alone at the far edge). A footer exists only for an action or ≥2 items.
- Track `minmax(12ch, 1fr)`, never `minmax(0, 1fr)` beside fixed columns.
- Breadcrumbs collapse middle items into a "…" menu; the current page never shortens. At S, numbers may go compact (`notation: "compact"`), exact value in the name or tooltip.

**Wrap without breaking alignment:**
- Rows and cards are grids; place children from the parent (`.row > .check`), never in the component class (lint `component-placement`); optional children placed by name.
- Every text container has a definite or floored width (panels `min(480px, 100%)`), never an auto or icon-sized track (runtime `text-collapsed`).
- A row chevron gets its own `auto` column. A phrase icon (↗, ▾) is glued to the last word (`.nowrap`, `&nbsp;`, `data-trailing-icon`; runtime `icon-detached`). A badge flows after the title's last word (`.title-badge`); a tag group is a `.cluster` on its own line.
- Trailing groups use a grid column (`1fr auto`) or `margin-inline-start: auto` in a `nowrap` row; never `space-between` or an auto margin in a wrapping row, where they fall to their own line (lint `between-wrap`).
- Button groups switch as a whole (`.switcher`, `.cluster`, short `nowrap` labels); never a 2-line button beside a 1-line one.

**Rings never clipped** (runtime `ring-clipped`): any non-`visible` overflow clips both axes. In scrollers draw rings inset (`.ring-inset`) or pad by ring + offset (`.reel`). Rounded cards use `.clip-ring`, never `overflow: hidden`.

**Hover-revealed actions** (lint `hover-hidden`, `hover-no-fallback`; runtime `hover-shift`, `hover-unreachable`):
- Only shortcuts hide, each also in ⋯ or the detail view.
- **Placement:** the row's top-end corner, the same spot on every row, over the trailing meta; never mid-row.
- **A mark sits by what it describes:** an item's state (unread, new) at the row's end with its meta, never touching an avatar (that reads as presence). A state the person can flip: the mark is the toggle, never repeated in the toolbar (`rules/states.md` One home per state).
- Hidden only under `(hover: hover) and (pointer: fine)`, by opacity; shown on hover, `:has(:focus-visible)` or menu open (`.row-actions`). Never `:focus-within` or selection: a click would hide the meta it swaps with (lint `focus-within-swap`).
- Space reserved: own column, or swapped with trailing meta (`.swap-meta`). Never over the identifier; never animate width or margin.
- Tab order row link → actions; each names its item (`aria-label="Archive <title>"`). Row actions appear at once; hover cards open after 300–500ms, close on Esc, are hoverable (WCAG 1.4.13).
- **Never hover-reveal:** the view's main job (Approve in a review queue), touch-first registers, status and warnings, tables compared across rows, a destructive action with no other path.

**Test:** wrapper stories at 240, 320, 480, 720 with worst-case data plus one resizable `.probe` (not viewport addons: they test media queries); then `scripts/render.mjs fit <url>`.

## Table or list
- **A table** when people compare items on the same 3+ facts, sort, or scan down a column (orders, invoices). **A list** when each item is read on its own: one identifier, ≤ 2 meta, or mixed content (inbox, search results).
- A table with 1–2 columns is a list; a list whose every row repeats the same 4 labelled facts is a table. Phones: § Wide tables.

## Responsive structure
- Check 320, 390, 768, 1440, 1920 (runtime `page-overflow`). Container queries for components, viewport queries for pages (lint `viewport-in-component`).
- **Product UI responds structurally, not with fluid type:** sidebar → rail (56–72px, opt-in, labels kept as tooltips) → a tab bar or off-canvas drawer on phones. Panes stack, collapse or resize; three fixed panes never crush main at 1280.
- **Wide tables** use `.table-wrap` (`kit/base.css`, cues from `kit/table-scroll.js`):
  - **Fewer columns first:** keep the ones that carry the work; the rest to a column picker or drill-in. Never shrink text.
  - **The rest scrolls inside the table** within its pane, never the page, so its scrollbar stays on screen. No scroll-snap.
  - **Pinned identifier** (with the select checkbox), ≤40% of the width, edge shadow only while content is under it; sticky header; a fade on the edge with more to scroll.
  - **Reachable:** the scroller is `role=region`, named by the table's heading, `tabindex=0`, visible focus; `scroll-padding-inline-start` = pinned width.
  - **Phones:** keep the columns, or become a list of the 2–3 deciding facts; never a card per row repeating every label. Content registers (Editorial, Reference, Flow) may stack rows into cards.
- **390 composed on its own,** by priority, not the desktop's order.
- **Navigation visible:** top-level places stay on screen on desktop, never behind a hamburger (a top bar for a few, a sidebar for many); a tab bar on phones. Tabs one row, overflow to More, peer views only.
- **Sticky header** <15% of mobile height, hides on scroll down. Text boxes get `min-height`, never `height`.
- Touch, safe areas, keyboard, platform: `registers/native.md`.

## Panes and viewport
- `100dvh` (lint `vh-unit`). `scrollbar-gutter: stable`; `scroll-padding-top`/`scroll-margin-top` under sticky headers so focus and anchors never land beneath them.
- No nested scroll regions in the main scroll. Long content folds; what needs the person never folds.
- A tall modal scrolls its body, footer sticky. Layers from `--z-sticky` … `--z-tooltip`, never 999 (lint `z-index-big`); popovers in the top layer.
- Page furniture: skip link, logo links home, `<html lang>` plus `lang` on foreign phrases.
