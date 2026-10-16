# fit: components at every size

A component lives in many slots: a sidebar, a list, a dialog, a phone. Design how it behaves as its container shrinks, not just at the size it was drawn. The identifier is the last thing to give way.

## 1. Size classes come from the container
- **Query the slot, not the viewport.** The parent's wrapper gets `container-type: inline-size; container-name: <name>`. An element can't query itself, so never put this on a shrink-wrapped flex item or inline element.
- **Three classes, in rem.** Set the thresholds where the identifier would pass 2 lines with meta inline, not at device widths.
  ```css
  @container card (width < 20rem) { … }                     /* S */
  @container card (20rem <= width < 40rem) { … }            /* M */
  ```
  | | L (≥40rem) | M | S (<20rem) |
  |---|---|---|---|
  | Layout | Columns: icon · title + meta · meta · actions | Meta under the title | Stacked; actions row below |
  | Meta | All; progress as label + count above its bar | Tertiary drops (relative time, avatar stack, tags past 3 become "+N"); the progress label drops, the bar stays | Status and the one deciding number |
  | Actions | Primary + up to 2 shortcuts + ⋯ | Primary + ⋯ | Primary + ⋯ |
- **Variants from the parent:** `--density` and `--emphasis` arrive through style queries on custom properties, not through extra size classes.
- **Container units:** `cqi` is for spacing only (`padding: clamp(var(--space-2), 4cqi, var(--space-4))`), never for font size in product UI. It needs the wrapper to exist.
- **Prefer intrinsic primitives;** add a container breakpoint only where they can't express the change.
  | Primitive | Use |
  |---|---|
  | Stack | Vertical rhythm |
  | Cluster (`flex-wrap: wrap; gap`) | Tags, meta, toolbars |
  | Sidebar | Two parts that stack when the main part would be narrower |
  | Switcher | All in one row, or all stacked: never in between |
  | RAM grid `repeat(auto-fill, minmax(min(100%, 18rem), 1fr))` | Card grids |
  | Reel | Browsable collections only; never actions or table columns |

## 2. What gives way, in order
1. Decorative or tertiary meta drops: relative time, avatars, extra tags become "+N".
2. Shortcut actions collapse into ⋯ (priority+: visible in priority order, the rest in the menu, focus returns to the trigger).
3. Secondary text truncates at the end; a description clamps to 2 lines.
4. The layout switches: meta under the title, actions below.
5. The identifier wraps onto more lines.

**Never given up:** the identifier, status, the deciding number, the primary action and ⋯.

## 3. The identifier never disappears
- **Mark it:** the title or name element gets `data-identifier`.
- **It wraps; it never ends in an ellipsis on one line** in rows, cards, list items, headers, navigation, labels or errors.
- **Lists keep one constant row height,** sized for the identifier's usual length (often 2 lines). Short titles keep that height. A rare title longer than that clamps at that line count, with the full text on hover, focus, tap and in the detail view. If titles often exceed it, fix the layout (drop meta, widen the slot).
- **Meta columns stay on one line.** A meta value that would wrap is replaced by its compact form (avatar for a name, short date) or drops.
- **It never gets the only shrinking track.** A grid that gives fixed widths to meta and `minmax(0, 1fr)` to the title deletes the title first. Give the identifier track a floor (`minmax(12ch, 1fr)`), and drop or move the fixed columns at the container breakpoint.
- **The one exception: single-line truncation in fixed-height dense UI** (tables, trees, tabs, file pickers). It needs all four:
  - The column resizes, or the full text sits in the detail view.
  - The full text shows on hover, focus and tap.
  - At least 4 characters stay visible.
  - Siblings that share a prefix truncate in the middle ("Renew supplier co…" hides the part that differs).
- **Breadcrumbs** collapse their middle items into a "…" menu. The current page is never shortened.
- **Numbers never truncate.** Keep the number and its unit on one line (`10&nbsp;MB`). At S, compact notation (`Intl.NumberFormat({ notation: 'compact' })`) is fine, with the exact value in the accessible name or tooltip.

## 4. Wrap without breaking alignment
- **Rows and cards are grids, not flex chains:**
  ```css
  .row { display: grid; grid-template-columns: auto minmax(12ch, 1fr) auto; column-gap: var(--space-3); align-items: start; }
  .icon-slot { block-size: 1lh; display: grid; place-items: center; }   /* leading icon on the first line */
  ```
  Never use `align-items: center` on a row whose text can wrap; it centres on the whole block.
- **Icons:**
  - **A row-level chevron** ("this opens something") gets its own `auto` column with `align-self: center`. It is never inline after the title, where it can drop to its own line.
  - **A phrase-level icon** (↗ external, ▾ on a link) is glued to the last word: `<span class="nowrap">contract&nbsp;<svg aria-hidden="true"/></span>`. It is never a flex sibling of the text.
- **Badges:**
  - A badge beside a title flows inline after the last word (`display: inline-flex; white-space: nowrap; vertical-align: baseline`).
  - A tag group is a Cluster on its own line, and each tag gets `flex-shrink: 0`.
- **Trailing groups:** never `justify-content: space-between` on content that wraps, because a wrapped trailing item gets stranded at the start. Use `margin-inline-start: auto` on the trailing group, or a grid column.
- **Card grids line up with subgrid:**
  ```css
  .card { display: grid; grid-row: span 4; grid-template-rows: subgrid; }
  ```
  Titles, meta, body and actions share rows, and actions pin to the bottom. `line-clamp: 2` goes on descriptions only, never on the title.
- **Button groups switch as a whole:** short `nowrap` labels in a Switcher or Cluster. Never a 2-line button next to a 1-line one. A lone full-width button may wrap its label.
- **Long strings:** `overflow-wrap: anywhere` only on unbreakable tokens (URLs, IDs, emails, hashes, file names), plus `min-width: 0` on flex children. Titles and prose use `overflow-wrap: break-word`: when their track is too narrow, it shows as a visible overflow instead of one letter per line.
- **Components never carry their own placement.** `grid-area`, `grid-column`, `order` and positioning margins that only make sense inside one parent belong on that parent's child selector (`.row > .check { grid-area: check }`), never on the component class. A reused component otherwise lands in an implicit track of its new grid, and its neighbours fall into the wrong columns.
- **Text never sits in an auto or icon-sized track.** Every container that holds text has a definite or floored width: panels `inline-size: min(480px, 100%)`, text tracks `minmax(12ch, 1fr)`. Place conditional or optional grid children by name, so a missing or extra child can't shift the rest.
- **Text wrapping:** `text-wrap: balance` on titles, `pretty` on descriptions, never set globally.
- **Rounded cards** use `overflow: clip` with `overflow-clip-margin` equal to the ring width, never `overflow: hidden`, which clips focus rings and diacritics.

## 5. Hover-revealed actions
- **Only shortcuts hide.** Everything a hover reveals is also in the always-visible ⋯ or the detail view. The primary action and ⋯ never hide.
- **Visible by default.** Hide only where a fine pointer can hover, and keep actions shown while the row has focus, is selected, or has its menu open:
  ```css
  @media (hover: hover) and (pointer: fine) {
    .row:not(:hover, :focus-within, :has([aria-expanded="true"]), [aria-selected="true"]) .row-actions { opacity: 0; }
  }
  .row-actions { transition: opacity 100ms ease; }
  ```
- **Space is reserved; nothing reflows:**
  - The actions either keep their own column and only change opacity,
  - or they swap with the trailing meta in the same grid area (the mail-list pattern: the timestamp fades, the actions appear).
  - They never overlay the identifier, and never animate width or margin.
- **Keyboard and screen readers:**
  - Hide with opacity only; `display: none` and `visibility: hidden` take the actions out of the tab order.
  - Tab order runs from the row link to the actions.
  - Each action names its item (`aria-label="Archive Renew supplier contract"`).
- **Timing:**
  - Row actions appear at once.
  - Hover cards and previews wait 300–500ms and stay about 500ms after the pointer leaves.
  - Previews close with Esc and can themselves be hovered (WCAG 1.4.13).
- **Don't hover-reveal:**
  - the main job of the view (Approve in a review queue)
  - touch-first registers
  - status and warnings
  - tables where people compare across rows
  - a destructive action with no other path

## 6. Test every size
- **Workshop stories** at container widths 240, 320, 480 and 720px, each with the worst-case data (`harden.md`), plus one resizable story:
  ```css
  .probe { container-type: inline-size; resize: inline; overflow: auto; inline-size: 480px; }
  ```
  Storybook's viewport addon resizes the window, which tests media queries, not containers; use wrapper stories.
- **Static:** `scripts/ui-check.mjs` flags truncated identifiers, hover-hidden actions without a focus or touch fallback, and `space-between` with wrap.
- **Runtime:** `scripts/fit-check.mjs <url>` renders at each width and fails on:
  - a clipped identifier
  - an icon that leaves its label's line
  - horizontal overflow
  - layout shift on hover
  - hover-only actions that a keyboard or touch can't reach
