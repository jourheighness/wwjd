# Baseline: the ground

For a project with no design system, so a screen never comes out as raw HTML or an untouched library default. The project's own tokens and kit win; this fills gaps.

- **Tokens:** `kit/tokens.css`, the default look preset (stone neutral, flat, Inter, radii 4/6/8/12). `wwjd:look` may replace it under the same variable names; never rename one. Re-check contrast after any change (4.5:1 text, 3:1 edges and focus).
- **Structure:** `kit/base.css` (components, `data-profile` type and rhythm, `data-density`); page frames in `kit/layouts.css`. Their comments carry the values.

## Primitives: never hand-roll dialogs, menus, selects or tooltips
| Stack | Primitives |
|---|---|
| React | **Base UI** (`@base-ui/react` 1.x) |
| Svelte | Bits UI |
| Vue | Reka UI |
| Several frameworks | Ark UI |
| Single-file prototype | `<dialog>` + `showModal()`, the Popover API + CSS anchor positioning (menus; selects as a styled listbox, never a `<select>` popup), `<details>`, native checkbox/radio/range styled by `kit/base.css` |

- **Base UI:** wrap the app in `.root` (`isolation: isolate`) so portals stack above it. Style through its state attributes: `data-popup-open`, `data-highlighted`, `data-checked`, `data-pressed`, `data-active`, `data-disabled`, `data-invalid`, `data-starting-style` / `data-ending-style`, and variables `--available-height`, `--anchor-width`, `--transform-origin`.
- **Other libraries** mostly use `data-state="open|closed|checked"`: add those to the selectors.

## Class → part (`kit/base.css`)
| Class | Part |
|---|---|
| `.btn` (+ `-primary` one per region, `-tertiary`, `-icon` + `.is-filled`, `-danger` review steps only, `-sm`/`-lg`) | Base UI Button or `<button>`; loading keeps the label plus an inline spinner |
| `.field` › `.field-label`, `.input` / `.select` / `.textarea`, `.field-description` / `.field-error` | Field.Root/Label/Control, Select.Trigger, Combobox.Input |
| `.segmented` › `.segment` | ToggleGroup / Toggle, 2–4 options |
| `.checkbox`, `.radio`, `.switch`, `.choice` | Root with `data-checked`; `.choice` makes the label the hit area |
| `.status[data-tone]` | Shape + word (diamond danger, triangle warning, dot success/info, ring neutral); never a pill |
| `.badge` | Decision counts and tags only |
| `.avatar`, `.avatar-stack` | Avatar.Root/Image/Fallback; neutral initials; stacks ≤3 + "+N" |
| `.progress-track` › `.progress-indicator` | Progress; width never animates |
| `.popup` › `.item`, `.sep`, `.group-label` | Menu / Select / Combobox / Popover Popup |
| `.tooltip` | Tooltip (Provider delay 500ms); never essential info |
| `.dialog`, `.drawer`, `.backdrop` | Dialog / Drawer; primary last in the footer |
| `.toast-viewport` › `.toast` | Toast; status mark, one line, Undo at the end |
| `.tabs` › `.tab` | Tabs (`data-active`); ink underline, the accent stays free |
| `.scroll-area`, `.scrollbar` | ScrollArea |
| `.table`, `.row`, `.group-header` | Plain; sticky headers, `.num` end-aligned |
| `.card`, `.empty`, `.skeleton`, `kbd` | Plain; skeletons static, no shimmer |
| `.flow`, `.breakout` | Prose rhythm; reading column with feature/full breakouts |
| `.chrome`, `.material`, `.t-accent-2` | Only with the look tokens behind them (wwjd:look surface chrome / translucent, accent dual): a dark sidebar or bar, one frosted Native bar or sheet, one secondary category |

## Faces
- **Product UI:** Inter variable (opsz 14–32, 400–600) or the system stack when it should feel native. **Reading:** Source Serif 4 (`data-profile="reading"`). **Persuade/Showcase:** the brand face; choosing one is `wwjd:look`. **Mono:** only code, IDs, hashes.

## The 15 details that make it read as a product
1. Surfaces: a tone step first, a hairline second, a shadow only on overlays.
2. Three text levels; never a fourth grey.
3. Icons 16px, 1.5 stroke, one library, `--text-2`, aligned to the first text line.
4. Padding 8, 12 or 16; the same slot gets the same padding everywhere.
5. Everything pressable has a hover fill and a pressed fill (hover only under `(hover: hover) and (pointer: fine)`).
6. Selected = a tint plus an indicator, never colour alone.
7. Table and group headers stick, with scroll padding under them.
8. Compared numbers end-aligned and tabular.
9. Controls 28, 32 or 36px, so a toolbar row lines up.
10. Nested radii concentric.
11. The whole row is the target, the hover fill hung on the row.
12. One focus ring: 2px, ≥3:1, `:focus-visible`, instant; fields and menu items inset.
13. Column headers 12/500 sentence case, never uppercase and tracked.
14. Popups grow from their trigger in under 200ms; exits faster.
15. Empty, loading, error and longest-string states exist before a screen is done.
