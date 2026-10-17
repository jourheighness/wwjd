# Visual: colour, surfaces, themes, contrast, type

The how behind SKILL.md's Visual rules. Choosing palette and faces is the `wwjd-look` skill; each register file carries its colour line; charts live in `registers/monitor.md`.

## Colour
- **One ground, one ink, one accent,** plus status colours only on status.
- **The accent is the person's own next step,** never an upsell, paid add-on or retention surface. Error red is never the brand or CTA red.
- **Near-misses are errors:** within ΔE2000 < 6 of a token, or spacing/radius 1–2px off the scale: snap to the token (lint `hex-in-ui`, `raw-palette`, `arbitrary-value`).
- **Pair colour with a shape** (dot, diamond, triangle) or a word; colour sits on the glyph, text stays ink (`.status[data-tone]`).
- **Status:** calm stays quiet; only act and attend states are loud. Tints soft (in doubt, halve them); ≤3 signal colours per card or row.
- **Neutrals:** one gray family, never warm and cool mixed. No gray text on a coloured ground (use a darker shade of that hue). Overlay colours defined, not alpha, except focus rings and `--hover`/`--press`.
- **Never an untouched stock indigo or violet** (lint `default-accent`).

## Surfaces
- **Layers separate by lightness** (~2–6 OKLCH L per level: `--surface-1/2/3`), never hairline + border + shadow on every card. Shadows only on real overlays (menus, dialogs, sticky bars). Panes get their own surface.
- **Keep `1px solid transparent` borders** so forced-colors mode can draw them.
- **Flat exceptions:** a look DESIGN.md owns (lint `gradient`, `gradient-text`, `glass` off for it); a neutral scrim over a photo (always under text on busy imagery); one frosted sticky bar.
- **Grounds:** tinted neutral, never yellow cream (`references/bans.md`); pure white when the brand needs it.

## Crafted calm (product screens)
Calm is fewer elements, each designed; never a bare wireframe (Owner, 2026-10-16: "the settings got very very plain"). Test: `references/bans.md` Avoidance aesthetic.
- **Three levels at a squint:** page title one tier above its section headings (app: `--text-display` vs `--text-heading`); group labels ink 600, never grey captions.
- **Identity on nouns:** a channel, integration, place or person shows its glyph at the row start: a 16px icon on a 32px neutral `--fill` tile (`.mark`), or the real logo/avatar in its own colours (identity, not accent).
- **The value in its form:** row ends show the current value in ink (`.setting-value`), connections a glyph + word, schedules a 3-stop line. A live preview of the effect (notification, email, theme) beats any caption; it uses seeded real data (`.preview-card`).
- **Panels:** one tone step + one 1px `--border` edge, radius one tier above the controls inside; dividers inset to the text edge; rows ≥44px (64 with a hint); 40px between sections.

## Themes
- **Follow the system** ("System" is the default choice); check each theme on its own: dividers, state parity, contrast. Dark-only is a DESIGN.md decision.
- **Dark:** depth from lighter surfaces in ~3 steps; accents slightly desaturated, accent on text rather than faded fills; images dimmed slightly; charts recoloured, never inverted.
- **Paint the root:** `html` gets the ground, `:root` declares `color-scheme`, plus `<meta name="color-scheme" content="light dark">` and `theme-color` per scheme (lint `root-background`). Theme set before first paint: no flash.

## Contrast and focus
- 7:1 preferred for long reading. **Contrast matrix:** every text token on every surface it is declared on, ≥ AA, as a workshop story or CI check. `--text-3` on surfaces, not `--fill`.
- **Brand colour** gets an AA text variant (`--accent-text`); light brands (yellow, orange, mint) take a darker shade on text-bearing buttons.
- **Focus ring:** one shared `:focus-visible` ring, 2px with offset, instant, never animated (lint `focus-removed`).

## Type
- **Sizes from `data-profile`** (`kit/base.css`); nothing read under 12px; touch inputs ≥16px.
- **Families:** one in Operate, Monitor, Flow; text + mono for Reference and Converse; text + display for Editorial; ≤2 in Persuade, Showcase, Transact. Persuade and Showcase display ≥3× body. Native: iOS 17pt, Android 16sp, Dynamic Type.
- **~5 roles** (caption, secondary, body, subheading, heading) with clear steps; 14/15/16px side by side read as mud. Real `h1`–`h6` in order.
- **Weight:** 3–4 at most; Medium vs Regular is too weak for hierarchy; real weights (`font-synthesis: none`). One emphasis at a time: italic in text, never underline, bold + italic or bold paragraphs.
- **Leading:** headings 1.1–1.2; body ~1.5 unless the profile sets it; multi-line never below 1.3; light on dark slightly more leading, lighter weight.
- **Measure** 45–75ch for prose; UI, tables and docs columns may run wider.
- **Tracking:** never widen body; display may tighten −0.02 to −0.05em; caps (where allowed) +5–12%. Uppercase only for short labels a platform or publication requires; never decorative eyebrows (lint `eyebrow`).
- **Figures:** `tabular-nums` where numbers align or change (`.num`); old-style in editorial prose. **Mono** for code, identifiers and hashes only. Headings roman unless a publication's convention.
- **Loading:** preload the regular body weight; `font-display: swap` with a metric-matched fallback (`size-adjust`), or `optional` where zero shift matters most. `rem`/`clamp()`, never vw only.

Motion: `wwjd-animation` skill.
