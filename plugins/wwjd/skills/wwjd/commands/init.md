# init: give the project a design system once

Init is optional. Until it runs, screens build on the ground (`references/baseline.md`). Run it when the project settles, when a second screen needs the same decisions, or when the user asks. Every later screen builds from what init writes, so the look is decided once and stays the same everywhere. If the project already has a design system, read it instead and only fill gaps the user agrees to.

## 1. PRODUCT.md (short; ask only what you can't infer)
- **Product type:** the type from `references/product-types.md`, with its core objects and the top 3 jobs.
- **Users:** who they are, and what they're doing when they use it (device, time pressure, frequency).
- **Registers:** which registers the product's surfaces use (for example, Persuade for the site, Operate for the app, Flow for signup).
- **Bar:** 2–3 named products to match in quality, from the same category.
- **Anti-references:** looks or products this one must not resemble.
- **Locale(s) and tone of voice:** one line each.

Ask in one batch, offering a recommended default for each question. Use the answers as given.

## 2. DESIGN.md (tokens plus named rules)
- **Start from the baseline** in `references/baseline.md`, then adjust it to the product.
  - **Accent hue:** one hue that suits the product's world. Never a library default; never the cream-and-terracotta or acid-on-black lanes.
  - **Neutral bias:** a slight hue bias toward the accent.
  - **Type:** a face chosen by job (the baseline lists safe picks), never from a trend list.
  - **Radius and density:** decided once.
- **Frontmatter tokens:** colours (light and dark, semantic roles), type scale, spacing, radius, shadows (overlays only), motion, density.
- **Body, in six sections:**
  1. Overview: one sentence of identity, the bar, the anti-references.
  2. Colours, with the strategy for each register.
  3. Typography.
  4. Elevation and surfaces.
  5. Components: the specs from the baseline, as adjusted.
  6. Do's and don'ts: named rules, each one line ("**The Calm Rule.** Colour only where something needs attention").
- **Decision log:** start one in `DESIGN.md`, or as `docs/decisions/`. Every rule the user states later goes there, dated.

## 3. Code
- **Tokens:** write them as CSS custom properties (or the stack's token format), with dark-mode overrides.
- **Kit:** if there is no component kit, start one: Base UI primitives (or the stack's equivalent, per `references/baseline.md`) wrapped as the project's own components, styled from `scripts/starter.css` mapped onto the tokens. Write the components the first screen needs as kit components, never inline on the page.
- **Workshop:** add a story or page that shows the tokens, plus a contrast matrix (every text token on every surface it's used on, all meeting AA).

## 4. Hand over
- Link `DESIGN.md`, `PRODUCT.md` and the token story.
- List each choice you made for the user, with one line on why, so they can veto it before anything is built on top.
