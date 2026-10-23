# Board: references → pick → variants

For "show me options", a reference board or a moodboard. Quick mode skips it.

## 1. Gather 6–8 references
- 2–3 queries of category + register + mood ("invoicing dashboard light dense"); sources and rules in `sources.md`.
- Score each candidate 0–5 (`sources.md` rubric) and keep ≥3. Match the ask in layout **and** look.
- Capture per `sources.md`; one card per reference: `.wwjd/refs/<letter>.yaml`.

## 2. Board
- A private hosted page (an Artifact where available) or a local HTML page.
- One row per letter: thumbnail, name, URL, one line on why it fits, the axis vector, confidence.
- Ask one question: "Pick a letter, mix (A's type, C's density), or say 'you pick'."

## 3. Pick → tokens
- **One letter:** `node <skill>/scripts/look.mjs --card .wwjd/refs/B.yaml --brand "#hex" > look.json`. Values under .5 confidence fall back to the baseline; the brand hue replaces the reference's accent.
- **Mix:** take the named axes from each card into one `look.json`. If look.mjs rejects a clash, say in one line which axis loses.
- **"You pick":** take the highest-scoring card that passes with no overrides; give the reason in one line.
- **No reference wanted:** write `look.json` directly (`axes.md`); no axes at all gives the kit's default `tokens.css`.
- Run `node <skill>/scripts/look.mjs --look look.json [--tokens <kit tokens file>] [--design DESIGN.md]`.
  - Exit 1 = a clash or a contrast floor failed: change an axis, never hand-patch a colour.
  - `"allow": ["<clash-id>"]` and `inkChroma` above .03 only when the person agrees and a reference card justifies it.

## 4. Variants
- **With a direction:** `--variants 3` gives A (the pick) plus B and C, under axes.md Variants; `--sweep a,b,c` picks the axes.
- **No direction** ("show me options"): up to 5 references, picked with `--pick 5 .wwjd/refs/*.yaml` (farthest-point; every pair differs on ≥3 axes; at most 1 mood board). One `--card` per letter, so every variant has a real reference.
- Show every variant on one board: reference left, variant right, and the line "Ref: Linear. Took: neutral, surface, density. Kept: brief layout."
