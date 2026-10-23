# Axes

Ten axes; light and dark are always both generated. **bold** preset = baseline (the kit's default tokens.css). ★ = loud; the Look dial sets how many (SKILL.md Quick mode).

| Axis | Presets | Changes |
|---|---|---|
| type | **grotesk** (Inter) · native (system-ui) · humanist (Source Sans 3) · serif-display ★ (Source Serif 4 headings, Inter body) · mono-label (IBM Plex Mono for IDs, codes and data cells only) | `--font-*`, heading weight, display tracking. `"fonts"` in look.json overrides with any open face (Google Fonts link emitted). The reading profile (Editorial) sets body text in Source Serif 4; `"fonts": {"reading": …}` names another (`--font-reading`) |
| neutral | temperature **stone** 70 · cool 255 · warm 55 · sage 165 · mauve 310, by chroma achromatic 0 · **quiet** .004 · tinted .012. Written `cool/quiet` | `--n`, chroma per role (text ≤.03, the rest ≤.02) |
| accent | **quiet** · mono (accent = ink) · wash (grays take the accent hue) · vivid ★ (gamut-max chroma, P3) · dual ★ (second hue at +60°) | accent roles, `--selected`, state layers |
| surface | **tonal** (ground darker than panes) · flat (one surface) · raised (white cards on a pale ground) · chrome (dark sidebar, `--chrome-*`) · translucent (Native only) | surface L steps |
| shape | sharp 0/2/2/4 · crisp 2/4/6/8 · **standard** 4/6/8/12 · soft 6/8/12/16 · round ★ 8/10/16/24 + pill buttons | `--r-1…4`, `--r-button` |
| density | compact 28/32, 13px · **regular** 32/36, 14px · comfortable 36/44, 14px · spacious: the register's page profile as is (marketing, reading, docs, consumer) | `<html data-density>` steps heights 4px from the profile's base; the profile owns the type ramp (kit base.css; tokens.css carries a fallback) |
| contrast | soft · **standard** · high (text-3 = text-2, 4.5:1 borders, 3px focus) | L-table offsets; floors always hold |
| elevation | flat (1px ring on overlays) · **hairline** (shadows on overlays only) · soft (card shadow, light mode) · layered (multi-layer, neutral-tinted) | `--shadow-*`, `--shadow-card` |
| motion | instant · **crisp** · smooth · springy ★ | name only: wwjd:motion's `motion.css` owns the values |
| imagery | **ui** · photo · line-illustration · diagram · brand-shape | prose only; fixed to `ui` in Operate, Monitor, Flow and Converse |

## Clashes (look.mjs rejects; `"allow": [id]` only with the person's OK)
| id | Rejects |
|---|---|
| serif-compact | serif-display + compact |
| mono-persuade | mono-label in Persuade or Showcase |
| warm-editorial | warm or stone tinted ground + accent hue 20–75 (bans.md lane 1) |
| tint-off-hue | tinted neutral more than 45° from the accent (use wash) |
| dual-tinted | dual + tinted |
| loud-product | vivid or dual in Operate or Monitor |
| glass | translucent outside Native |
| raised-flat · layered-flat | raised + flat elevation · layered + flat surface |
| chrome-wash | chrome + wash |
| round-compact · sharp-shadow | round + compact · sharp + soft/layered |
| spacious-work · spacious-app · compact-read | spacious in Operate or Monitor · spacious in Converse (the app profile has no spacious step) · compact in Persuade, Editorial or Showcase |
| soft-monitor · soft-tinted | soft contrast in Monitor · soft + tinted |
| springy-work | springy in Operate, Monitor, Flow or Transact |
| brand-shape · photo-mono · imagery-product | brand-shape without `"brandAsset": true` · photo + mono-label · non-ui imagery in product registers |
| indigo-default | accent hue 265–320 with no brand hex |
| trend-font | a `fonts` override naming a bans.md lane 5 face, unless `"lock": ["fonts"]` (the project's own faces) |
| ink-chroma | `inkChroma` above .03 (Stripe-style navy ink) |

## Generation (look.mjs)
- **Neutral L fixed per role** (table in look.mjs Build), so contrast holds for any hue at C ≤ .02.
- **Accent solid:** the brand L if white text passes 4.5:1; L ≥ .70 takes dark text; in between, the nearer of the two. Dark mode keeps the L, never inverts. accent-text (= focus) is solved to 4.5:1, C ≤ .13 in dark.
- **Status hues** (same solver): danger 27 (20 or 35 when the accent is within 20°), warning 62/80 (glyph-only in light, 3:1), success 150, info 245.
- **Floors** (exit 1 on any failure, both modes, sRGB and P3): 4.5:1 for every text token on every surface and fill it sits on, and on-accent on accent, hover and danger-solid; 3:1 for control edges. APCA warns only: body Lc 75, secondary 60, placeholder 30.
- Out-of-gamut chroma is fitted to sRGB; the extra goes in a `@media (color-gamut: p3)` block.
- **`fixed`:** a map of exact colours (`"on-surface": "#…"`, `"dark-surface": "…"`) applied as-is and only audited; this is how an existing DESIGN.md wins.
- **Tokens beyond the kit's** (additions only): `--font-display`, `--weight-heading`, `--tracking-display`, `--shadow-card`, `--r-button`, `--focus-width`; `--chrome-*`, `--surface-material`, `--accent-2`, `--font-reading` when the axis or profile uses them.

## Never varied (product UI)
- Contrast floors and the focus ring.
- Status hues and their meaning.
- Control heights from the density scale, the 4px space base, three text levels.
- Icon library, size and stroke; primitives and behaviour.
- Information architecture and layout from the brief.
- Reduced-motion handling.

## Variants
- Distance = summed weights of the differing axes: shape, elevation, motion .5; the rest 1.
- Each variant moves 2–3 open axes. Pairwise distance ≥2, ≤4 from the anchor, at most one ★ step from the anchor (look.mjs).
- Latin square: pairs from the top 4 open axes, least shared first, never the same move twice; triples only when pairs run out.
- Rejected variants (clash, ban, floor) are dropped for the next candidate, never repaired by hand.

## look.json
```json
{"name": "Tracker", "identity": "A dark, quiet, dense tool where structure comes from tone steps.",
 "register": "operate", "brand": "#5E6AD2",
 "axes": {"type": "grotesk", "neutral": "cool/achromatic", "accent": "quiet", "surface": "tonal", "shape": "crisp",
          "density": "compact", "contrast": "standard", "elevation": "hairline", "motion": "instant", "imagery": "ui"},
 "lock": ["register", "brand", "contrast"],
 "ref": {"id": "B", "name": "Linear", "url": "https://linear.app"}}
```
- Optional keys: `hue` (no brand), `brand2` (the dual accent), `fixed`, `allow`, `inkChroma`, `brandAsset`, `fonts` (`sans`/`display`/`mono`/`reading` stacks).
- Missing axes take the baseline.
