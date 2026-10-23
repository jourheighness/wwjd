---
name: look
description: 'How a product looks (wwjd): palette, theme, type face, shape, density, depth and brand, chosen from references and written as contrast-checked tokens.css and DESIGN.md. Not layout, copy or chart colours.'
when_to_use: '"make it look like…", theme, palette, font, brand colours, a moodboard, look variants, DESIGN.md.'
compatibility: scripts need Node 20.10+, no dependencies; reference screenshots need Playwright.
---

# wwjd:look

References → board → pick → `look.json` → `node <skill>/scripts/look.mjs` → `tokens.css` + `DESIGN.md` (in `--out`) + `.wwjd/look.json` (always the project root's `.wwjd/`; `look.<out folder>.json` for another `--out`).
Axes, presets, clashes and the look.json format: `references/axes.md`. References and the card format: `references/sources.md`.

## Quick mode (no DESIGN.md, no board asked)
wwjd:ux runs this before the first build in a project without a look; in a new project only once chosen at wwjd:ux `commands/start.md` §0. No screenshots, no questions.
- **Read the Look dial** (`creativity`; `wwjd.mjs dials`): loud axes (★ in axes.md) 1–3 at most one, 4 two, 5 two plus one signature idea per page; the rest quiet. Even 1 Plain picks its accent hue for the subject (lint `default-look`).
- **The project's own look wins:** fonts or colour tokens already in the repo (tokens file, shadcn `globals.css`, Tailwind theme, `@font-face`) are the brand: keep its faces (`"fonts"` + `"lock": ["fonts"]`), pin its colours (`"fixed"`: `surface`, `on-surface`, `primary`, `outline`, `dark-…`), choose only the open axes. Bans apply to new choices only.
- **Subject first:** one line of the subject's world (materials, place, tools, audience, era), plus one real product or site it should feel like (from what you know; no capture).
- **Open axes from the subject:** accent hue from its world (never the kit's default 258 or indigo/violet without a brand), neutral temperature, shape, surface, elevation. Density follows the register.
- **Type:** a text face by job; Persuade, Showcase, Editorial and consumer apps add a display face chosen for this subject from Google Fonts (`"fonts": {"display": …}`; never a wwjd:ux `references/bans.md` trend face). Work and developer tools may keep a grotesk or the system stack.
- **Register starting points** (move any the subject argues against): Operate and Monitor pick an icon set (one stroke, 16px), a page title a tier above its sections, panels at `--r-4` with hairline elevation. Flow and Transact add soft elevation on the one decision card.
- Write `look.json`, run `look.mjs`, use its `tokens.css`. Handover line: "Look: Archivo + Public Sans, warm neutral, green, soft corners, <icon set>; anchored on <X>. Say 'show me options' for a board."
- **The kit's default tokens are a floor (contrast, states), never the finished look.**

## 0. Detect and defer
- **Existing `DESIGN.md` wins.** Fill only the axes it leaves open; `--design DESIGN.md` pins its colours (a pinned `primary` becomes the brand). look.mjs never overwrites a DESIGN.md it did not write; it writes `DESIGN.look.md` instead.
- Also read `PRODUCT.md` (the register), `.impeccable/design.json` and `.stitch/DESIGN.md`.
- **impeccable, taste** (`design-taste-frontend`, `stitch-design-taste`) **or Stitch** skills installed? Offer them first; DESIGN.md + the `tokens.css` names are the shared contract. Stitch uploads only through its skill or MCP, with the person's OK. taste dials: VISUAL_DENSITY → density, MOTION_INTENSITY → motion; DESIGN_VARIANCE is layout (wwjd:ux).

## 1. Lock the identity
- One identity sentence: what it is, who uses it, the feel ("A dark, quiet, dense tool where structure comes from tone steps").
- Never varied: register, brand hex, contrast floor, density when the product type dictates it, plus axes.md Never varied.

## 2. Board ("show me options", references, moodboard)
`references/board.md`.

## 3. Hand back
- `tokens.css` uses the kit's names (`--surface-1`, `--text`, `--accent`) and replaces the kit's `:root` block; a repo with its own names (shadcn `--background`) keeps them, each value mapped onto its existing token, never a second set. Components stay untouched.
- Apply density, profile and font `<link>` as the tokens.css header says. Licensed reference fonts map to the open preset with the same job.
- **Motion:** name the theme only, set as `<html data-motion="…">` with wwjd:motion's `motion.css`.
- Commit `tokens.css` and `DESIGN.md`; `.wwjd/` stays local. `--look DESIGN.md` rebuilds the look from the DESIGN.md comment.
- Then return to wwjd:ux for structure, flow and copy.
