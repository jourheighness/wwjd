# Baseline: the ground

Use this whenever the project has no design system. It's the look and the component behaviour to build on, so a screen never comes out as raw HTML or as an untouched library default. When the project has its own tokens and kit, they win, and this only fills gaps.

## 1. Primitives: never hand-roll dialogs, menus, selects or tooltips
| Stack | Primitives |
|---|---|
| React | **Base UI** (`@base-ui/react` 1.x) |
| Svelte | Bits UI |
| Vue | Reka UI |
| Several frameworks | Ark UI |
| Single-file HTML prototype | Native: `<dialog>` with `showModal()`, the Popover API plus CSS anchor positioning, `<details>`, native form controls, all styled by `starter.css` |

- **Base UI setup:** wrap the app in `.root { isolation: isolate }` so portals stack above it.
- **Styling hooks:** style through its state attributes and variables:
  - `data-popup-open`, `data-highlighted`, `data-checked`, `data-pressed`, `data-active`, `data-disabled`, `data-invalid`
  - `data-starting-style` / `data-ending-style`
  - `--available-height`, `--anchor-width`, `--transform-origin`
- **Other libraries** mostly use `data-state="open|closed|checked"`: add those to the selectors.

## 2. Tokens (`scripts/starter.css`)
- **Copy and adapt `starter.css`:** change the accent hue `--a` to the brand's. Re-check every text token on every surface afterwards (4.5:1 for text, 3:1 for edges and focus).
- **Neutrals:** one low-chroma stone family (hue bias `--n`), never cream. Dark ground at OKLCH L 0.185, not near-black.
- **Surfaces, three steps,** separated by tone before borders:

  | Token | Used for |
  |---|---|
  | `--surface-1` | ground, sidebar |
  | `--surface-2` | panes, cards, tables, inputs |
  | `--surface-3` | popups, dialogs, toasts |

  - Quiet fills (`--fill`) are explicit colours.
  - Hover and press are translucent state layers.
- **Borders:**

  | Token | Used for |
  |---|---|
  | `--border` | hairline separators |
  | `--border-strong` | hover, outlined cards |
  | `--border-control` | inputs, checkboxes, switch track; 3:1 on every surface |
- **Text:** three levels plus disabled. `--text-3` is AA on surfaces, never on `--fill`.
- **Accent:** one.

  | Token | Used for |
  |---|---|
  | `--accent` | fills |
  | `--accent-text` | text and links, at AA |
  | `--focus` | focus ring; same value as `--accent-text` |
- **Status:** danger, warning, success, info, used only on status. Warning is for glyphs only in light mode. Tints are opaque mixes `in oklab` (mixing `in oklch` swings the hue).
- **Radius,** decided once:

  | Radius | Used on |
  |---|---|
  | 4px | badge, checkbox, menu item, kbd |
  | 6px | controls |
  | 8px | card, popup, toast |
  | 12px | dialog |
  | full | avatar, switch |

  Nested radii stay concentric.
- **Spacing:** a 4px base: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Type:**

  | Role | Size / line height |
  |---|---|
  | caption | 12/16 |
  | body | 14/20 (13 in compact density) |
  | heading | 16/24 |
  | title | 20/28 |
  | display | 28/34 |

  - Weights: 400, 500 for labels and buttons, 600 for headings.
  - Tracking is never widened.
- **Shadows** only on overlays, in two layers: `--shadow-1` for popups, tooltips and toasts; `--shadow-2` for dialogs and drawers.
- **Motion:** easings `--ease-out`, `--ease-move`, `--ease-drawer`. Durations 120ms for press and colour, 160ms for popups, 220ms for modals. Exits are faster.
- **Density:** controls 28 / 32 / 36 and rows 32 / 36 / 44 for compact / regular / comfortable, set with `data-density`.
- **Themes:** every colour is `light-dark(light, dark)`. `data-theme` forces one theme; otherwise it follows the system.

## 3. Fonts
- **Product UI:** Inter variable (optical sizes 14–32, weights 400–600), with a system fallback stack. Or the system stack alone when the product should feel native.
- **Reading pages:** Source Serif 4 for long-form; body text elsewhere stays in the UI face.
- **Persuade and Showcase:** the brand face if one exists; never a trend pick (see `bans.md` drift lane 5).
- **Mono:** `ui-monospace` and its fallbacks, only for code, IDs and hashes. `tabular-nums` on every number that aligns or updates.

## 4. Components (class → Base UI part)
- **States everywhere:**
  - Hover only under `(hover: hover) and (pointer: fine)`.
  - Focus: one 2px ring (≥3:1) with a 2px offset. Fields and menu items use an inset ring.
  - Active: a darker fill, plus `scale(.98)` on buttons only.
  - Disabled: opacity .45. If it explains itself, it uses `aria-disabled` and stays focusable.
- **Button** `.btn`:
  - Sizes: sm 28 / md 32 / lg 36, radius 6, 14/500.
  - Secondary is the default (quiet fill). `.btn-primary`: accent, one per region. `.btn-tertiary`: transparent. `.btn-icon`: square, with `.is-filled` for a resting container. `.btn-danger`: only on review steps.
  - Loading keeps the label and adds an inline spinner.
- **Field:**
  - Parts: `.field` → `.field-label` → `.input` / `.select` / `.textarea` (Field.Control, Select.Trigger, Combobox.Input) → `.field-description` / `.field-error`.
  - Full column width, control height, 3:1 border.
  - Invalid: a danger border plus a 12px error line below.
  - 16px text on touch.
- **Segmented control** `.segmented > .segment` (ToggleGroup / Toggle, `data-pressed`): for 2–4 options.
- **Checkbox, radio, switch** `.checkbox`, `.radio`, `.switch` (Root with `data-checked`): the root draws the indicator; `.choice` makes the whole label the hit area.
- **Status mark** `.status[data-tone]`: an 8px shape plus a word (diamond for danger, triangle for warning, dot for success and info, ring for neutral). Never a pill.
- **Badge** `.badge`: 20px, quiet fill, tabular numbers. Only for decision counts and tags.
- **Avatar** `.avatar` (`--size` 20 / 24 / 32 / 40) and `.avatar-stack` (at most 3, then "+N"). Neutral initials, no rainbow.
- **Progress** `.progress-track > .progress-indicator`: 4px. Its width never animates.
- **Popup** `.popup` (Menu, Select, Combobox, Popover): at least 180px wide or the trigger width, padding 4, radius 8, `--surface-3`, `--shadow-1`.
  - It grows from `--transform-origin`, from scale .97.
  - Items `.item`: control height; `data-highlighted` gives the hover fill; shortcuts at the end in `--text-3`; `data-danger` uses danger text.
- **Tooltip** `.tooltip` (Provider delay 500ms): inverted, at most 240px wide. Neighbours open instantly (`data-instant`). Never holds essential information.
- **Dialog** `.dialog`: 480px wide, radius 12, header / body / footer, primary last.
- **Drawer** `.drawer`: from the right, 480px wide, swipe-aware.
- **Toast** `.toast`: bottom right, 360px wide. A status mark, one line, then Undo at the end. Undo stays until the next action.
- **Tabs** `.tabs > .tab` (`data-active`): 36px high. The active tab is ink with a static 2px underline; the accent stays free.
- **Table** `.table`:
  - Header: sticky, 32px high, 12/500 `--text-2`, sentence case.
  - Rows: `--row-h`, with hairline separators; the first and last cells meet the page edge.
  - Numbers: `.num`, end-aligned.
  - Hover gives a state layer; selected gives `--selected`.
- **Group header** `.group-header`: sticky, 32px high, one surface below the list.
- **Card** `.card`: `--surface-2` on `--surface-1`, padding 16, radius 8, a transparent border, no shadow.
- **Empty** `.empty`: start-aligned, a title, one sentence, one primary.
- **Skeleton** `.skeleton`: static blocks in the final layout, with no shimmer.
- **Kbd** `kbd`: 20px, hairline border.

## 5. The details that make it read as a product
1. **Surfaces:** a tone step first, a hairline second, a shadow only on overlays.
2. **Text:** three text levels; never a fourth grey.
3. **Icons:** 16px, 1.5 stroke, one library, in `--text-2`, aligned to the first line of text.
4. **Padding:** 8, 12 or 16, and the same slot gets the same padding everywhere.
5. **Feedback:** everything pressable has a hover fill and a pressed fill.
6. **Selection:** selected is a tint plus an indicator, never colour alone.
7. **Sticky headers:** table and group headers stick, with scroll padding under them.
8. **Numbers:** compared numbers are end-aligned and tabular.
9. **Heights:** controls are 28, 32 or 36px, so a toolbar row lines up.
10. **Radii:** nested radii are concentric.
11. **Click targets:** the whole row is the target, with the hover fill hung on the row.
12. **Focus:** one focus ring everywhere: 2px, at least 3:1, `:focus-visible`, instant.
13. **Column headers:** 12/500 in sentence case, never uppercase and tracked.
14. **Popups:** they grow from their trigger in under 200ms; exits are faster.
15. **States:** empty, loading, error and longest-string states exist before a screen is done.
