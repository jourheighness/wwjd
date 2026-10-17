# Layout: edges, spacing, wrapping, fit, responsive

Classes: `kit/base.css`; page shells: `kit/layouts.css`; layout ids: `references/layouts.md`.

## Edges
- **2–3 text edges per page** (six means placed one at a time); logical properties, so RTL holds.
- **`.bleed`** puts a container's surface and padding in the gutter (never ad-hoc negative margins); edge to edge when the page margin is narrower than the padding. **`.hang-fill`** hangs fills, leading icons and bullets the same way (pseudo-element, no layout).
- **`.breakout`:** text at `content` (the measure); tables, charts and media at `feature` or `full`.
- **`.subcards`:** sibling cards share rows through subgrid; titles, meta and actions align, actions pinned to the bottom.
- **Centre only** a table, figure or quote in a reading column, a canvas empty state, the hero moment, an icon in its button. A centred settings page or a step centred mid-flow is the defect.
- **Optical:** checkbox or icon aligns to the first text line; play and arrow glyphs nudge ~2px toward their direction; `text-box: trim-both cap alphabetic` in buttons where supported; nested radii concentric (outer = inner + padding).
- **Absent optional meta is omitted,** not "—" (table cells differ: `rules/states.md`). **DOM order = reading order;** no `order` or placement that changes meaning.

## Spacing
- **4px scale, `gap` between siblings,** chosen by relationship: `--space-inside` < `--space-between` < `--space-group` < `--space-section`; `--pad-box` inside boxes. `data-profile` and density set them.
- **Proximity:** more space above a heading than below; gaps between sections beat gaps inside; same slot, same padding; rhythm varies by content.
- **Controls side by side share `--control-h`** and align on both edges (runtime `control-height-mismatch`). One containment level; nothing cramped against an edge.

## Wrapping and truncation
| Field | Treatment |
|---|---|
| Identifier (name, title) | Wraps; 2 lines fine, past 3 the layout should switch |
| Secondary meta | End truncation (`.trunc`) |
| File names, paths, hashes, emails in dense tables | Middle truncation (`.trunc-mid`: head + fixed tail) |
| Previews, descriptions | `.clamp-2`, never on the title |
| Numbers, money, dates, anything compared | Never truncate; number and unit on one line (`10&nbsp;MB`) |
| Clickable text | Shorten first; may wrap; never clip |

- Full text of anything truncated on hover, focus and tap (kit tooltip or detail view).
- `min-width: 0` on flex text children; `flex-shrink: 0` on avatars, icons, badges.
- `overflow-wrap: anywhere` only on unbreakable tokens (`.break-token`); titles and prose use `break-word` (lint `anywhere-on-text`, `break-all`).
- Wrapping text: the row top-aligns, the icon slot is `block-size: 1lh`; never `align-items: center`.
- `text-wrap: balance` on headings (with a max inline size), `pretty` on prose; never global; no hard `<br>`.
- **Translation budget:** +30–40% for sentences, 200–300% for strings under 10 characters. Labelled controls get `min-width`, never a fixed `width`.

## Fit: components at every size
Size classes come from the slot: wrap it in `.fit`, never a shrink-wrapped flex item. Thresholds in rem, where the identifier would pass 2 lines with meta inline.

| | L ≥40rem | M | S <20rem |
|---|---|---|---|
| Layout | icon · identifier · meta · actions | meta under the identifier | stacked; actions row below |
| Meta | all; progress as label + count above its bar | tertiary drops (relative time, avatar stack, tags past 3 → "+N"); progress label drops, bar stays | status + the one deciding number |
| Actions | primary + ≤2 shortcuts + ⋯ | primary + ⋯ | primary + ⋯ |

`.fit-row` implements it: tertiary meta `data-tier="3"`, shortcuts `data-shortcut`, the progress label `.progress-label`.
- **Give-way order:** tertiary meta drops → shortcuts fold into ⋯ (focus returns to the trigger) → secondary text truncates, descriptions clamp to 2 → the layout switches → the identifier wraps more. **Never given up:** identifier, status, the deciding number, the primary, ⋯.
- Parent variants (`--density`, `--emphasis`) arrive by style queries. `cqi` for spacing only (`clamp(var(--space-2), 4cqi, var(--space-4))`), never font size in product UI.
- **Intrinsic primitives before breakpoints:** `.flow` (stack), `.cluster` (tags, meta, toolbars), `.with-sidebar`, `.switcher` (all in a row or all stacked), `.tiles`, `.reel` (browsable collections only, never actions or table columns).

**Identifier** (`data-identifier`; lint `identifier-truncate`, runtime `identifier-clipped`, `identifier-long`):
- Lists keep one row height sized for the usual identifier (often 2 lines); a rare longer one clamps there with full text on hover, focus, tap and in detail. Often longer → fix the layout.
- Meta stays one line; a value that would wrap goes compact (avatar, short date) or drops.
- Track `minmax(12ch, 1fr)`, never `minmax(0, 1fr)` beside fixed columns.
- **Exception, fixed-height dense UI** (tables, trees, tabs, file pickers): one line may truncate if the column resizes or detail has the full text, full text shows on hover/focus/tap, ≥4 characters stay, and shared-prefix siblings truncate in the middle.
- Breadcrumbs collapse middle items into a "…" menu; the current page never shortens. At S, numbers may go compact (`Intl.NumberFormat` `notation: "compact"`) with the exact value in the name or tooltip.

**Wrap without breaking alignment:**
- Rows and cards are grids; placement on the parent's child selector (`.row > .check`), never the component class (lint `component-placement`); optional children placed by name.
- Every text container has a definite or floored width (panels `inline-size: min(480px, 100%)`), never an auto or icon-sized track (runtime `text-collapsed`).
- A row chevron gets its own `auto` column, `align-self: center`. A phrase icon (↗, ▾) is glued to the last word in `.nowrap` with `&nbsp;` (`data-trailing-icon`; runtime `icon-detached`). A badge flows after the title's last word (`.title-badge`); a tag group is a `.cluster` on its own line.
- Trailing groups use `margin-inline-start: auto` or a grid column, never `space-between` with wrap (lint `between-wrap`).
- Button groups switch as a whole (`.switcher`, `.cluster`, short `nowrap` labels); never a 2-line button beside a 1-line one.

**Rings never clipped** (runtime `ring-clipped`): any non-`visible` overflow clips both axes. In scrollers draw rings inset (`.ring-inset`) or pad by ring + offset with matching `scroll-padding` (`.reel`). Rounded cards use `.clip-ring`, never `overflow: hidden` (it also clips diacritics).

**Hover-revealed actions** (lint `hover-hidden`, `hover-no-fallback`; runtime `hover-shift`, `hover-unreachable`):
- Only shortcuts hide, each also in the visible ⋯ or the detail view.
- **Placement:** the toolbar sits at the row's top-end corner, in the same spot on every row, over the trailing meta (time); never mid-row or trailing variable-width text.
- **A mark sits by what it describes:** an item's own state (unread, new, changed) sits at the row's end with its meta; a mark touching an avatar reads as that person's presence. Where the person can flip that state (read/unread), the mark is the toggle and the toolbar never repeats it (`rules/states.md` One home per state). Owner, 2026-10-16.
- Hidden only under `(hover: hover) and (pointer: fine)`, by opacity; shown while hovered, keyboard-focused within (`:has(:focus-visible)`) or menu open (`.row-actions`). Never `:focus-within` or selection: a click would hide the meta it swaps with (lint `focus-within-swap`).
- Space reserved: own column, or swapped with trailing meta in one grid area (`.swap-meta`). Never over the identifier; never animate width or margin.
- Tab order row link → actions; each names its item (`aria-label="Archive <title>"`). Row actions appear at once; hover cards wait 300–500ms, stay ~500ms, close on Esc, are hoverable (WCAG 1.4.13).
- **Never hover-reveal:** the view's main job (Approve in a review queue), touch-first registers, status and warnings, tables compared across rows, a destructive action with no other path.

**Test:** wrapper stories at 240, 320, 480, 720 with worst-case data plus one resizable `.probe` (viewport addons test media queries, not containers); then `scripts/render.mjs fit <url>`.

## Responsive structure
- Check 320, 390, 768, 1440, 1920 (runtime `page-overflow`). Container queries for components, viewport queries for pages (lint `viewport-in-component`).
- **Product UI responds structurally, not with fluid type:** sidebar → rail (56–72px, opt-in; labels stay in the DOM with tooltips) → off-canvas drawer on phones. Panes stack, collapse or resize; three fixed panes never crush main at 1280.
- **Wide tables:** keep the 3 columns that carry the work; the rest to a drill-in or column picker. Sticky header and first column. Never shrink text.
- **390 composed on its own,** by priority, not the desktop's order.
- **Navigation visible:** top nav on desktop, never a hamburger; tab bar on mobile. Tabs one row, overflow to More, peer views only.
- **Sticky header** <15% of mobile height, hides on scroll down. Text boxes get `min-height`, never fixed `height`.
- Touch, safe areas, keyboard, platform: `registers/native.md`.

## Panes and viewport
- `100dvh` (lint `vh-unit`). `scrollbar-gutter: stable`; `scroll-padding-top`/`scroll-margin-top` under sticky headers so focus and anchors never land beneath them.
- No nested scroll regions in the main scroll. Long content folds; what needs the person never does.
- A tall modal scrolls its body, footer sticky. Layers from `--z-sticky` … `--z-tooltip`, never 999 (lint `z-index-big`); popovers in the top layer.
- Page furniture: skip link, logo links home, `<html lang>` plus `lang` on foreign phrases.
