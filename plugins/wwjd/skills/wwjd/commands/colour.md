# colour: palette, surfaces, themes, status, charts

The project's palette wins. This command decides where the colour goes.

## Strategy per register
| Register | Colour strategy |
|---|---|
| Operate, Monitor, Reference | Colour means attention: no signal, no colour. The accent marks the primary action, the selection and real state, and stays under about 5% of the view |
| Persuade, Showcase | Colour is identity: a committed ground and fields of colour are fine. The accent still marks the action |
| Editorial | Colour lives in the frame and the figures, not the text |
| Transact | Product photography carries the colour; the UI stays neutral |
| Converse | Neutral; the content leads |

## Rules
- **One ground, one ink, one accent,** plus status colours used only on status.
- **Never colour alone.** Pair it with a shape (dot, diamond, triangle) or a word. Text stays ink; colour sits on the glyph.
- **Status:**
  - Calm stays calm: the quiet colour of the system, not alarm.
  - Act and attend states are the only loud ones.
  - A needs-you signal too faint to find is as wrong as a christmas tree.
  - Tints stay soft; when in doubt, halve them.
- **Neutrals:** one gray family, never warm and cool mixed. No gray text on a coloured background; use a darker shade of that hue instead. Define overlay colours explicitly instead of using alpha, except for focus rings and state layers.
- **Surfaces:**
  - Layers separate by a lightness step (in OKLCH, about 2–6 L per level), before borders or shadows.
  - Shadows only on real overlays: menus, dialogs, sticky bars.
  - Keep a `1px solid transparent` border so forced-colors mode can draw it.
  - Panes get their own surface, so nothing melts together.
- **Flat by default:** no decorative gradients, glass or glow. A project look may own a gradient or a material. The only generic exception is a neutral scrim over a photo.
- **Light theme:** avoid harsh pure-white grounds. A slightly warm or tinted neutral reads calmer, from low-chroma stone, never yellow cream.
- **Dark theme:**
  - Depth comes from lighter surfaces in about 3 steps.
  - Desaturate accents slightly, and put accent on text rather than faded fills (which go dirty in dark).
  - Balance cold and warm.
  - Dim images slightly. Recolour charts; never invert them.
- **Themes:** when both ship, check each on its own: dividers visible, state parity, contrast. Dark-first products may ship dark only.
- **Contrast:** AA for body text, 7:1 preferred for long reading. 3:1 for large text, icons, component edges and focus rings.
- **Focus ring:** one shared ring, `:focus-visible`, 2px with an offset, at least 3:1 against what surrounds it, and it appears instantly.
- **Not the library default:** never ship an untouched default accent (the stock indigo or violet).

## Charts
- **Form follows the job:**
  - trend → line
  - comparison → bar
  - part of a whole → bar, unless it has 5 or fewer parts
- **Series** differ by more than hue: dashed, dotted, marker shape. Use a colour-blind-safe categorical palette. Movement uses a diverging pair plus a direction glyph.
- **Every point** is hoverable and focusable, with one tooltip system across all charts.
- **Labels:**
  - Label directly instead of using a legend that restates.
  - Gridlines are low contrast.
  - No big axis labels, no scribble of dots.
- **Lines:** edge to edge at a fixed aspect ratio. They never stretch vertically and never escape their container.
- **Integrity** (any failure fails the chart):
  - Bars start at zero, and compared series share a scale.
  - Show the full relevant period, and give percentages their denominator.
  - No 3D, no area scaling.
  - Never present correlation as cause.
