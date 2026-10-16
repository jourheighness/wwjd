# Bans: never this, do that instead

Generated UI drifts to the most probable output. Banning a default isn't enough, because the model falls to the next default. So every ban here names its replacement, and the drift lanes below name where models go after a ban.

Last column: `P` product UI, `M` marketing, `P+M` both.

## Ban → instead
| Ban | Instead | |
|---|---|---|
| Explainer, reassurance or helper text that restates the label | Nothing. Format hints and "why we ask" stay | P+M |
| "N of M", counts, zero counts | Progress mark, dot or nothing; decision-input counts stay (SKILL.md) | P |
| Five actions on a card | Primary, secondary, ⋯ | P |
| Gradient backgrounds, buttons or text | Flat by default; a gradient only when the project's look owns it. Emphasis by weight | P+M |
| Indigo, violet or purple accent | The project accent | P+M |
| Unmodified shadcn or library defaults | The repo kit's own variants | P+M |
| Glass or backdrop-blur panels | An opaque surface one tone step off the ground; one frosted sticky bar is fine | P+M |
| Coloured left or top accent stripe on cards | State glyph plus word, or a tone step | P+M |
| 3 or 6 identical icon-topped cards | Rows, a list, or one composed section | P+M |
| Rounded icon tile above a heading | Icon inline beside the text, or none | P+M |
| Uppercase tracked eyebrow or kicker | Nothing, or fold it into the heading; sentence case | P+M |
| Pill "New", "Beta" or "Introducing" badges | Plain text, or nothing | P+M |
| 01/02/03 markers | Order by position; `<ol>` only for real sequences | P+M |
| Hero-metric strip ("10K+ users · 99.9%") | Real numbers only, or drop the slot | M |
| Coloured glow or shadow on buttons and cards | No shadow at rest; overlays only | P+M |
| Hairlines on everything, outlined boxes | Space or a tone step (tables and inputs may keep lines) | P+M |
| Border plus shadow plus white default card | Background only, or spacing only | P |
| Filled + ghost button pair everywhere | One primary; secondary as a quiet button; tertiary as text | P |
| Monospace labels and "technical voice" | The text face with `tabular-nums` | P+M |
| One headline word in italic, colour or gradient | One face, one colour | P+M |
| Re-drawn chrome (traffic lights, phone, browser bar) | A real screenshot, or none | M |
| Fake dashboard of grey bars | A real interface fragment, or no image | M |
| Emoji as icons | One icon library | P+M |
| Spinner in the middle | A skeleton matching the final layout | P |
| Confirm dialog for routine actions | Undo; the floor's exceptions get a review sheet with real choices | P |
| Raw OS-styled select, date or checkbox next to kit controls | Kit controls built on native elements or APG primitives (native pickers are fine on touch) | P |
| Bounce or elastic easing, `scale(0)` entrances | Ease-out from 0.95–0.98 and opacity | P+M |
| Stagger, bubble-in, fade-up on every block | One orchestrated moment or none | P+M |
| `→` appended to every link, "A · B · C" meta strings | Plain label | P+M |
| Celebration toast for a visible effect | Silent success | P |
| Jane Doe, Acme, 99.99%, identical avatars | Realistic messy seeded data | P+M |

## Second-order drift lanes (where models go after the bans)
1. **"Warm editorial":** a cream ground (~#F4F1EA), terracotta or clay (~#D97757) and a big italic serif. This is now the most recognisable generated look. Warmth comes from low-chroma stone, never yellow cream plus terracotta.
2. **Near-black plus one acid accent** (green or vermilion), with glow and grey text.
3. **"Broadsheet cosplay":** hairlines everywhere, zero radius, mono captions, numbered margin labels.
4. **Bento by default:** every section a grid of rounded tiles.
5. **The next trendy font:** Space Grotesk, Instrument Serif, Fraunces, Syne, Bricolage, Satoshi, Clash. Use the project's font; choose a new face by job and personality, never from a trend list.
6. **"Premium" lane:** double-bezel cards, a floating glass pill nav, arrow-circle-in-button, blur plus fade-up reveals, `rounded-[2rem]`.
7. **"Notion-minimal" lane:** a bone ground, pastel uppercase pill tags, 1px #EAEAEA on everything, faux window dots.
8. **Avoidance aesthetic:** everything removed and nothing designed, so it reads as a thin grey wireframe. Removal means fewer elements with stronger hierarchy, not less design. Fill space with scale, real content or real primitives, never ornament.
9. **Tame:** bolting new features onto the old page instead of redesigning it. If the result looks like the old thing with additions, redo it. Long-familiar, high-trust surfaces are the named exception (SKILL.md section 3, Visual).

## Quick tests
- **Squint:** primary, secondary and groups still read when blurred.
- **One second:** exactly one thing is seen first, and it is the right one.
- **Cover the logo:** in marketing, could a competitor use this page? If yes, it is a category page, not this client's.
- **Count left edges:** 2–3 per page; six means the elements were placed one at a time.
