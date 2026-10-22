# Bans: never this, do that instead

Generated UI drifts to the most probable output; ban a default and it falls to the next one. So every ban names its replacement, and the drift lanes name where models go next. `look` = a look lane: still a ban, but `wwjd:look` owns the choice and a DESIGN.md that owns it overrides. Last column: `P` product, `M` marketing.

## Ban → instead
| Ban | Instead | |
|---|---|---|
| Explainer, reassurance, helper text restating the label | Nothing; format hints and "why we ask" stay | P+M |
| Big aggregate or zero counts | A dot or nothing; small-set progress above its bar and decision counts stay | P |
| Five actions on a card | Primary, secondary, ⋯ | P |
| Qualifier tails on list items | The item's name; a tail only when it is the difference (`rules/copy.md` List items are names) | P+M |
| Bare product screen: grey caption groups, label + control only, small title, an empty third of the canvas | Identity glyphs, values in ink, one live preview, a display-tier title (`rules/visual.md` Crafted calm) | P |
| Gradient backgrounds, buttons or text (look) | Flat; emphasis by weight | P+M |
| Indigo, violet or purple accent (look) | The project accent | P+M |
| Unmodified shadcn or library defaults | The kit's own variants | P+M |
| Glass or backdrop-blur panels (look) | An opaque surface a tone step off the ground; one frosted sticky bar is fine | P+M |
| Coloured left/top accent stripe on cards | State glyph + word, or a tone step | P+M |
| 3 or 6 identical icon-topped cards | Rows, a list, or one composed section | P+M |
| Rounded icon tile above a heading; coloured icon tiles | A 32px neutral tile inline at the row start for nouns with identity (channel, integration, place), or none | P+M |
| Uppercase tracked eyebrow or kicker | Nothing, or fold it into the heading | P+M |
| Pill "New" / "Beta" / "Introducing" badges | Plain text or nothing | P+M |
| 01/02/03 markers | Order by position; `<ol>` only for real sequences | P+M |
| Hero-metric strip ("10K+ users · 99.9%"), "Trusted by 10,000+ teams", fake logo strip | Real numbers and real logos, or drop the slot | M |
| Centred headline over 3 icon cards | One composed argument (`registers/persuade.md`) | M |
| FAQ accordion standing in for the argument; link-farm footer | Answer objections in the argument; a designed close | M |
| Coloured glow or shadow on buttons and cards | No shadow at rest; overlays only | P+M |
| Hairlines on everything, outlined boxes | Space or a tone step (tables and inputs may keep lines) | P+M |
| Border + shadow + white default card | Background only, or spacing only | P |
| Filled + ghost button pair everywhere | One primary; quiet secondary; text tertiary | P |
| Monospace labels, "technical voice" (look) | The text face with `tabular-nums` | P+M |
| One headline word in italic, colour or gradient | One face, one colour | P+M |
| Re-drawn chrome (traffic lights, phone, browser bar) | A real screenshot, or none | M |
| Fake dashboard of grey bars | A real interface fragment, or no image | M |
| Emoji as icons | One icon library | P+M |
| Spinner in the middle | A skeleton of the final layout | P |
| Swapping the element on state change (span → button/link with its own padding or underline) | One element in every state; state via attributes and styles | P |
| Confirm dialog for routine actions | Undo; the floor's exceptions get a review sheet with real choices | P |
| OS dropdowns and pickers on the web (`<select>` popups, native date pickers); OS-styled checkboxes beside kit controls | The component system's Select / Combobox / DatePicker; in a single-file prototype a styled popover listbox. OS pickers only in native apps | P+M |
| Bounce or elastic easing, `scale(0)` entrances, stagger or fade-up on every block | `wwjd:motion` skill | P+M |
| `→` on every link, "A · B · C" meta strings | Plain label | P+M |
| Celebration toast for a visible effect | Silent success | P |
| Jane Doe, Acme, 99.99%, identical avatars | Realistic messy seeded data | P+M |

## Drift lanes (where models go after the bans)
1. **"Warm editorial" (look):** cream ground (~#F4F1EA), terracotta (~#D97757), big italic serif; the most recognisable generated look. Warmth comes from low-chroma stone.
2. **Near-black + one acid accent (look)** (green or vermilion), with glow and grey text.
3. **"Broadsheet cosplay" (look):** hairlines everywhere, zero radius, mono captions, numbered margin labels.
4. **Bento by default:** every section a grid of rounded tiles.
5. **The next trendy font (look):** Space Grotesk, Instrument Serif, Fraunces, Syne, Bricolage, Satoshi, Clash. Choose by job and personality, never from a trend list.
6. **"Premium" (look):** double-bezel cards, floating glass pill nav, arrow-circle-in-button, blur + fade-up reveals, `rounded-[2rem]`.
7. **"Notion-minimal" (look):** bone ground, pastel uppercase pill tags, 1px #EAEAEA on everything, faux window dots.
8. **Avoidance aesthetic:** everything removed, nothing designed: a thin grey wireframe. Removal means fewer elements with stronger hierarchy; fill space with scale, real content or real primitives, never ornament. Test: cover the labels; if a grey grid of identical rows is left, add identity, values or a preview, never ornament.
9. **Tame:** new features bolted onto the old page instead of a redesign. If it looks like the old thing with additions, redo it (long-familiar surfaces excepted, `rules/visual.md`).

## Quick tests
- **Squint** (the one definition; others point here): blurred, only the primary, the needs-you signals and the groups still read.
- **First look:** exactly one thing is seen first, and it's the right one.
- **Cover the logo:** could a competitor use this marketing page? Then it's a category page.
- **Count left edges:** 2–3 per page; six means elements were placed one at a time.
