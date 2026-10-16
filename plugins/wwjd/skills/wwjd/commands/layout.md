# layout: grid, alignment, spacing, wrapping

People scan along edges. Misaligned starts, zig-zag reading and text that wraps out of line are the most visible defects.

## System first
- **Decide what is global before laying out a screen:** shell, navigation, header anatomy, page grid, spacing scale, pane surfaces. A screen composes these; it never invents its own margins.
- **Related components mirror each other:** rows, cards and headers that sit together share slots, order and alignment.

## Edges
- **One left edge per column** (one start edge, in RTL). A page has 2–3 text edges in total; six means things were placed one at a time.
- **Content aligns; chrome hangs.** A card's text sits on the same line as the paragraph above it, and the card's surface and padding bleed into the gutter. Ship this once as a kit primitive (`Bleed`/`Inset`), never as ad-hoc negative margins:
  ```css
  .bleed { --pad: var(--space-4); padding-inline: var(--pad); margin-inline: calc(var(--pad) * -1); }
  ```
- **Hover and selection fills hang too.** Put them on a pseudo-element so they add no layout:
  ```css
  .row { position: relative; isolation: isolate; }
  .row::before { content: ""; position: absolute; inset: 0 calc(var(--pad) * -1);
                 border-radius: var(--radius-2); background: var(--hover); opacity: 0; z-index: -1; }
  .row:hover::before, .row:focus-visible::before { opacity: 1; }
  ```
- **Leading icons and bullets hang into the gutter,** so text keeps the column edge.
- **Collapse the bleed** when the page margin is narrower than the padding; cards then go edge to edge.
- **Column and breakout:** a named-line grid keeps reading text at `content` (the measure), while tables, charts and media take `feature` or `full`. The measure is set in `typeset.md`.
  ```css
  .page { display: grid; grid-template-columns:
    [full-start] minmax(var(--gap), 1fr) [feature-start] minmax(0, 6rem)
    [content-start] min(var(--measure), 100% - var(--gap) * 2) [content-end]
    minmax(0, 6rem) [feature-end] minmax(var(--gap), 1fr) [full-end]; }
  .page > * { grid-column: content; }
  ```
- **Sibling cards** align their insides with subgrid, so titles, meta and actions share a line and the actions pin to the bottom.
- **Start-aligned by default; centring is a decision, not a habit.** Centre where the design motivates it: a table, figure or quote in a reading column, a canvas empty state, the register's hero moment, an icon in its button. Alignment is a product-wide choice: the same kind of page aligns the same way everywhere, so one centred settings page among start-aligned ones, or a step that suddenly centres mid-flow, is the defect.
- **No reserved slots.** If an optional badge or meta is absent, the content moves to the start. An absent optional meta line is omitted, not shown as "—" (table cells are different: `harden.md`).
- **Optical alignment:**
  - A checkbox or icon aligns to the first line of text.
  - Play and arrow glyphs nudge about 2px towards their direction.
  - `text-box: trim-both cap alphabetic` centres text in buttons where supported.
  - Nested radii stay concentric: outer equals inner plus padding.

## Spacing
- **Use the kit's scale** on a 4px base, with `gap` between siblings.
- **Proximity carries grouping:** related items sit closer than separate groups, a heading has more space above than below, and the gap between sections exceeds any gap inside one.
- **Consistency:** the same slot gets the same padding in every instance.
- **Room:** nothing is cramped against an edge, and there are no cards inside cards.

## Wrapping and truncation
How a component behaves as its slot shrinks (what gives way, identifiers, icons, hover reveal) lives in `fit.md`. Per field:

| Field | Treatment |
|---|---|
| Names and titles that identify | Wrap, never truncate. Two lines is fine; past three, the layout should switch (`fit.md`) |
| Secondary meta | Truncate at the end |
| File names, paths, hashes, emails in dense tables | Truncate in the middle (head plus a fixed tail), full text on hover, focus and tap |
| Card previews | `line-clamp: 2` |
| Numbers, money, dates, anything compared | Never truncate |

- **Truncated text is readable in full,** via the kit tooltip or the detail view, and on touch too.
- **Flex and grid fixes:**
  - Text children of flex get `min-width: 0`. A grid track that holds an identifier gets a floor (`minmax(12ch, 1fr)`), never `minmax(0, 1fr)` beside fixed columns.
  - Avatars, icons and badges get `flex-shrink: 0`.
  - Long URLs and IDs get `overflow-wrap: anywhere`, never `break-all`.
- **When text can wrap,** top-align the row so the icon stays with the first line.
- **Clickable text:** shorten first; it may wrap; never clip.
- **Headings and prose:** `text-wrap: balance` on headings with a max inline size, `pretty` on prose; never applied globally.
- **Translation:** budget +30–40% width for sentences and up to 200–300% for strings under 10 characters. Use non-breaking spaces between values and units.

## Panes and viewport
- **Height:** use `100dvh`, not `100vh`. Add `scrollbar-gutter: stable` on scroll containers and `scroll-padding-top` under sticky headers.
- **Scroll:** no nested scroll regions inside the main scroll. Long content folds; what needs the person never does.
- **Overlays:** a semantic layer scale (dropdown, sticky, backdrop, modal, toast, tooltip), never 999. Popovers render in the top layer so ancestors can't clip them.
- **Width:** no horizontal page scroll anywhere between 320 and 1920px.
