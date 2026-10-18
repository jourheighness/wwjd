# Board: references → pick → variants

For "show me options", a reference board or a moodboard. Quick mode skips it.

## 1. Gather 6–8 references
- 2–3 queries of category + register + mood ("invoicing dashboard light dense").
- Sources per register, the bot-wall rule and the ethics rules are in `sources.md`. Live public pages only; never log in; skip any challenge.
- Score each candidate 0–5 (rubric in `sources.md`) and keep ≥3. Match the ask in layout **and** look.
- Screenshot to `.wwjd/refs/` (look.mjs gitignores `.wwjd/`). Write one card per reference: `.wwjd/refs/<letter>.yaml`.

## 2. Board
- A Claude Artifact, or a local HTML page when Artifacts are unavailable. Never public.
- One row per letter: thumbnail, name, URL, one line on why it fits, the axis vector, confidence.
- Ask one question: "Pick a letter, mix (A's type, C's density), or say 'you pick'."

## 3. Pick → tokens
- **One letter:** `node <skill>/scripts/look.mjs --card .wwjd/refs/B.yaml --brand "#hex" > look.json`. Values under .5 confidence fall back to the baseline. The reference's own accent is never used: the brand hue is.
- **Mix:** take the named axes from each card into one `look.json`. If look.mjs rejects a clash, say in one line which axis loses.
- **"You pick":** take the highest-scoring card that passes with no overrides, then give the reason in one line ("B: same register and density; its quiet accent suits a work tool").
- **No reference wanted:** write `look.json` directly (format in `axes.md`). With no axes at all, the result is the baseline: the kit's default `tokens.css`, value for value.
- Run `node <skill>/scripts/look.mjs --look look.json [--tokens <kit tokens file>] [--design DESIGN.md]`.
  - Exit 1 means a clash was rejected or a contrast floor failed. Change an axis. Never hand-patch a colour.
  - `"allow": ["<clash-id>"]` and `inkChroma` above .03 only when the user agrees and a reference card justifies it.

## 4. Variants
- **With a direction:** `--variants 3` gives A (the pick) plus B and C. Each moves a different pair of open axes, with pairwise distance ≥2 and at most one loud step from the anchor (look.mjs); the look's total loud axes follow the Look dial. `--sweep a,b,c` picks the axes.
- **No direction** ("show me options"): up to 5 references, picked with `--pick 5 .wwjd/refs/*.yaml` (farthest-point; every pair differs on ≥3 axes; at most 1 mood board). Run one `--card` per letter, so every variant is anchored on a real reference.
- Mood boards (Dribbble and the like) supply type, colour and imagery only, never layout or density.
- Show every variant on one board: reference left, variant right, and the line "Ref: Linear. Took: neutral, surface, density. Kept: brief layout."
