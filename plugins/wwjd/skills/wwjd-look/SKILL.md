---
name: wwjd-look
description: How a product looks. Palette, theme, colours, type face, shape, density, depth, brand and visual identity, chosen from live references and turned into contrast-checked tokens.css + DESIGN.md. Use for "make it look like…", "change the look/theme/palette/font", brand colours, a reference board or moodboard, look variants, or writing DESIGN.md. Pairs with the wwjd skill, which owns structure, flow and copy.
compatibility: scripts/look.mjs needs Node 20.10+, no dependencies. Reference screenshots need Playwright.
---

# wwjd-look

References → board → pick → `look.json` → `scripts/look.mjs` → `tokens.css` + `DESIGN.md` + `.wwjd/look.json`.
Axes, presets and clashes: `references/axes.md`. Where references come from and the card format: `references/sources.md`.

## Quick mode (no DESIGN.md, no board asked)
wwjd runs this before the first build in a project without a look. About a minute; no screenshots, no questions.
- **Read the Look dial** (`creativity`; `wwjd.mjs dials`, wwjd `references/dials.md`): 1 Plain stays near the kit, 3 Balanced is the steps below, 5 Expressive adds a second loud axis and one distinct visual idea per page.
- **Subject first:** one line of the subject's world: materials, place, tools, audience, era.
- **Anchor:** name one real product or site it should feel like (from what you know; no capture).
- **Choose the open axes from the subject:** accent hue from its world (never the kit's default 258, never indigo/violet without a brand); neutral temperature; shape; surface; elevation. Density follows the register.
- **Type with personality:** a text face by job, plus for Persuade, Showcase, Editorial and consumer apps a display face picked for this subject from Google Fonts (`"fonts": {"display": "\"Name\", …", "sans": …}`; never the trend list in wwjd `bans.md`). Work tools may keep a grotesk, but still choose hue, neutral and shape.
- **One loud axis** (★ in axes.md); everything else quiet.
- **Richness defaults per register:** Operate and Monitor pick an icon set (one stroke, 16px), set the page title in the display tier, and put panels at `--r-4` with hairline elevation. Flow and Transact add soft elevation on the one decision card. The handover line names the icon set.
- Write `look.json`, run `look.mjs`, use its `tokens.css`. Handover line: "Look: Archivo + Public Sans, warm neutral, green, soft corners; anchored on <X>. Say 'show me options' for a board."
- **The kit's default tokens are a floor (contrast, states), never the finished look.** Shipping them unchanged is a miss.

## 0. Detect and defer
- **Existing `DESIGN.md` wins.** Read it and fill only the axes it leaves open. `--design DESIGN.md` pins its colours (a pinned `primary` becomes the brand). look.mjs never overwrites a DESIGN.md it did not write; it writes `DESIGN.look.md` instead.
- Also read `PRODUCT.md` (the register), `.impeccable/design.json` and `.stitch/DESIGN.md`.
- **impeccable, taste** (`design-taste-frontend`, `stitch-design-taste`) **or Stitch** skills installed (`.claude/skills`, `~/.claude/skills`, `.agents/skills`, plugin dirs)? Offer them first. DESIGN.md + the `tokens.css` names are the shared contract.
  - Upload to Stitch only through its skill or MCP, with the user's OK.
  - taste dials: VISUAL_DENSITY → density, MOTION_INTENSITY → motion. DESIGN_VARIANCE is layout: wwjd's job.

## 1. Lock the identity
- One identity sentence: what it is, who uses it, the feel. Example: "A dark, quiet, dense tool where structure comes from tone steps."
- Locks (never varied): register, brand hex, contrast floor, density when the product type dictates it, plus wwjd's fixed list (`references/axes.md`).
- No brand? The accent hue is open, but never indigo or violet by default.

## 2. Gather 6–8 references
- 2–3 queries of category + register + mood ("invoicing dashboard light dense").
- Sources per register, the bot-wall rule and the ethics rules are in `references/sources.md`. Live public pages only; never log in; skip any challenge.
- Score each candidate 0–5 (rubric in sources.md) and keep ≥3. Match the ask in layout **and** look.
- Screenshot to `.wwjd/refs/` (look.mjs gitignores `.wwjd/`). Write one card per reference: `.wwjd/refs/<letter>.yaml`.

## 3. Board
- A Claude Artifact, or a local HTML page when Artifacts are unavailable. Never public.
- One row per letter: thumbnail, name, URL, one line on why it fits, the axis vector, confidence.
- Ask one question: "Pick a letter, mix (A's type, C's density), or say 'you pick'."

## 4. Pick → tokens
- **One letter:** `node scripts/look.mjs --card .wwjd/refs/B.yaml --brand "#hex" > look.json`. Values under .5 confidence fall back to the baseline. The reference's own accent is never used: the brand hue is.
- **Mix:** take the named axes from each card into one `look.json`. If look.mjs rejects a clash, say in one line which axis loses.
- **"You pick":** take the highest-scoring card that passes with no overrides, then give the reason in one line ("B: same register and density; its quiet accent suits a work tool").
- **No reference wanted:** write `look.json` directly (format in axes.md). With no axes at all, the result is the baseline: the kit's default `tokens.css` (formerly starter.css), value for value.
- Run `node scripts/look.mjs --look look.json [--tokens <kit tokens file>] [--design DESIGN.md]`.
  - Exit 1 means a clash was rejected or a contrast floor failed. Change an axis. Never hand-patch a colour.
  - `"allow": ["<clash-id>"]` and `inkChroma` above .03 only when the user agrees and a reference card justifies it.

## 5. Variants
- **With a direction:** `--variants 3` gives A (the pick) plus B and C. Each moves a different pair of open axes, with pairwise distance ≥2 and at most one loud step. `--sweep a,b,c` picks the axes.
- **No direction** ("show me options"): up to 5 references, picked with `--pick 5 .wwjd/refs/*.yaml` (farthest-point; every pair differs on ≥3 axes; at most 1 mood board). Run one `--card` per letter, so every variant is anchored on a real reference.
- Mood boards (Dribbble and the like) supply type, colour and imagery only, never layout or density.
- Show every variant on one board: reference left, variant right, and the line "Ref: Linear. Took: neutral, surface, density. Kept: brief layout."

## 6. Hand back
- `tokens.css` replaces the kit's `:root` token block. The names are the same; new tokens are only additions (`--font-display`, `--weight-heading`, `--tracking-display`, `--shadow-card`, `--r-button`, `--focus-width`, plus `--chrome-*`, `--surface-material` and `--accent-2` when the axis uses them). Components stay untouched.
- Density is applied with `<html data-density="compact|comfortable">` (kit `base.css` owns the scale), as the tokens.css header says.
- Load the font with the `<link>` in the tokens.css header. Licensed reference fonts map to the open preset with the same job.
- **Motion:** name the theme only. Set `<html data-motion="…">` with wwjd-animation's `motion.css`; the theme owns the durations and easings.
- Commit `tokens.css` and `DESIGN.md`. `.wwjd/` stays local, and `--look DESIGN.md` rebuilds the look from the DESIGN.md comment.
- Then return to wwjd for structure, flow and copy.
