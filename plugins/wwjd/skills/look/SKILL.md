---
name: look
description: 'Use for how a product looks: palette, theme, colours, type face, shape, density, depth, brand and visual identity, chosen from live references and turned into contrast-checked tokens.css + DESIGN.md. Pairs with wwjd:ux, which owns structure, flow and copy. Not for layout, copy or chart colours.'
when_to_use: '"make it look like…", "change the theme/palette/font", brand colours, dark mode colours, a moodboard or reference board, look variants, writing DESIGN.md.'
compatibility: scripts/look.mjs needs Node 20.10+, no dependencies. Reference screenshots need Playwright.
---

# wwjd:look

References → board → pick → `look.json` → `node <skill>/scripts/look.mjs` → `tokens.css` + `DESIGN.md` + `.wwjd/look.json`.
Axes, presets and clashes: `references/axes.md`. Where references come from and the card format: `references/sources.md`.

## Quick mode (no DESIGN.md, no board asked)
wwjd:ux runs this before the first build in a project without a look, once the person chose quick mode at wwjd:ux `commands/start.md` §0 (a new project asks first). About a minute; no screenshots, no questions.
- **Read the Look dial** (`creativity`; `wwjd.mjs dials`, wwjd:ux `references/dials.md`): loud axes 1–3 at most one, 4 two, 5 two plus one signature idea per page. 1 Plain still picks its accent hue for the subject, never the kit default (lint `default-look`).
- **The project's own look wins:** fonts or colour tokens already in the repo (a tokens file, shadcn `globals.css`, a Tailwind theme, `@font-face`) are the brand. Keep its faces (`"fonts"` + `"lock": ["fonts"]`) and pin its colours (`"fixed"`: `surface`, `on-surface`, `primary`, `outline`, `dark-…`); choose only the axes they leave open. The bans below are for new choices, never for faces or colours the project has.
- **Subject first:** one line of the subject's world: materials, place, tools, audience, era.
- **Anchor:** name one real product or site it should feel like (from what you know; no capture).
- **Choose the open axes from the subject:** accent hue from its world (never the kit's default 258, never indigo/violet without a brand); neutral temperature; shape; surface; elevation. Density follows the register.
- **Type with personality:** a text face by job, plus for Persuade, Showcase, Editorial and consumer apps a display face picked for this subject from Google Fonts (`"fonts": {"display": "\"Name\", …", "sans": …}`; never the trend list in wwjd `bans.md`). Work tools may keep a grotesk, but still choose hue, neutral and shape.
- **Loud axes per the dial** (★ in axes.md); everything else quiet.
- **Richness defaults per register:** Operate and Monitor pick an icon set (one stroke, 16px), set the page title in the display tier, and put panels at `--r-4` with hairline elevation. Flow and Transact add soft elevation on the one decision card. The handover line names the icon set.
- Write `look.json`, run `look.mjs`, use its `tokens.css`. Handover line: "Look: Archivo + Public Sans, warm neutral, green, soft corners; anchored on <X>. Say 'show me options' for a board."
- **The kit's default tokens are a floor (contrast, states), never the finished look.** Shipping them unchanged is a miss.

## 0. Detect and defer
- **Existing `DESIGN.md` wins.** Read it and fill only the axes it leaves open. `--design DESIGN.md` pins its colours (a pinned `primary` becomes the brand). look.mjs never overwrites a DESIGN.md it did not write; it writes `DESIGN.look.md` instead.
- Also read `PRODUCT.md` (the register), `.impeccable/design.json` and `.stitch/DESIGN.md`.
- **impeccable, taste** (`design-taste-frontend`, `stitch-design-taste`) **or Stitch** skills installed (`.claude/skills`, `~/.claude/skills`, `.agents/skills`, plugin dirs)? Offer them first. DESIGN.md + the `tokens.css` names are the shared contract.
  - Upload to Stitch only through its skill or MCP, with the user's OK.
  - taste dials: VISUAL_DENSITY → density, MOTION_INTENSITY → motion. DESIGN_VARIANCE is layout: wwjd:ux's job.

## 1. Lock the identity
- One identity sentence: what it is, who uses it, the feel. Example: "A dark, quiet, dense tool where structure comes from tone steps."
- Locks (never varied): register, brand hex, contrast floor, density when the product type dictates it, plus wwjd's fixed list (`references/axes.md`).
- No brand? The accent hue is open, but never indigo or violet by default.

## 2. Board ("show me options", references, moodboard)
Gather 6–8 references, board them, pick, run look.mjs, variants: `references/board.md`.

## 3. Hand back
- `tokens.css` uses the wwjd kit's names (`--surface-1`, `--text`, `--accent`) and replaces the kit's `:root` block. A repo with its own names (shadcn `--background`, `--foreground`, `--primary`) keeps them: map each value onto its existing token, never ship a second set. New tokens are only additions (`--font-display`, `--weight-heading`, `--tracking-display`, `--shadow-card`, `--r-button`, `--focus-width`, plus `--chrome-*`, `--surface-material` and `--accent-2` when the axis uses them). Components stay untouched.
- Density is applied with `<html data-density="compact|comfortable">` (kit `base.css` owns the scale), as the tokens.css header says.
- Load the font with the `<link>` in the tokens.css header. Licensed reference fonts map to the open preset with the same job.
- **Motion:** name the theme only. Set `<html data-motion="…">` with wwjd:motion's `motion.css`; the theme owns the durations and easings.
- Commit `tokens.css` and `DESIGN.md`. `.wwjd/` stays local, and `--look DESIGN.md` rebuilds the look from the DESIGN.md comment.
- Then return to wwjd:ux for structure, flow and copy.
