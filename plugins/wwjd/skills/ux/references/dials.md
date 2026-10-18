# Dials

Six dials tune how wwjd designs, never what is correct. Each runs between two named ends; the middle stop is wwjd as written (the product type decides). Set them in the `/wwjd-dials` pane (one segmented row per dial, for you or for this project), with `/plugin configure wwjd@wwjd` or `/config`, or per project in `.wwjd.json` `"dials"`. Nudge one request with words; the prompt hook names the nudge. `wwjd.mjs dials` prints the non-default dials with what each does. Source of truth: `scripts/dials-spec.mjs`.

**Precedence:** Floor > DESIGN.md and the decision log > dials > wwjd defaults. A dial never breaks contrast, targets, states or the budgets' overflow rules; a DESIGN.md that owns the look outranks Look.

## Look: plain ↔ expressive (`creativity`)
- **1 Plain:** Close to the kit: brand hue only, the system face, the plainest hero that fits.
- **2 Restrained:** One quiet custom touch (a tinted neutral or a refined face); nothing loud.
- **3 Balanced (default):** One loud axis; a display face on marketing, editorial and consumer screens.
- **4 Bold:** Two loud axes, a display face on every screen, one signature moment per page.
- **5 Expressive:** Art-directed: one distinct visual idea per page, an unusual layout, a far-end hero.
- Nudge words: bolder, surprise me / safer, tamer.

## Content: lean ↔ rich (`budget`)
- **1 Minimal:** Every surface shows 2 fewer facts (min 1); cut before moving.
- **2 Lean:** Every surface shows 1 fewer fact.
- **3 Balanced (default):** Surface budgets as written.
- **4 Full:** Every surface shows 1 more fact.
- **5 Rich:** Every surface shows 2 more facts; overflow still moves one step away.
- Nudge words: show more, richer / leaner, less busy.

## Spacing: roomy ↔ compact (`density`)
- **1 Roomy:** data-density="comfortable": tall rows, generous gaps, fewer things per screen.
- **2 Airy:** A step roomier than the product type.
- **3 By product (default):** The product type decides: consumer roomy, work tools compact.
- **4 Snug:** A step denser than the product type.
- **5 Compact:** data-density="compact": 32px rows, tight gaps, more per screen.
- Nudge words: denser, tighter / airier, roomier.

## Motion: still ↔ lively (`motion`)
- **1 Still:** data-motion="instant": state changes only, nothing moves.
- **2 Crisp:** data-motion="crisp": short, quick transitions, no flourish.
- **3 By product (default):** The product type's motion theme.
- **4 Smooth:** data-motion="smooth": softer, slightly longer transitions.
- **5 Lively:** data-motion="springy": springy motion and one delight moment per flow.
- Nudge words: livelier / calmer, less motion.

## Copy: terse ↔ warm (`voice`)
- **1 Terse:** Labels and values only; sentences only in errors.
- **2 Brief:** Plain and shorter than usual.
- **3 Plain (default):** Plain language in the product's own words.
- **4 Friendly:** One human line in empty and success states.
- **5 Warm:** A light personality in empty, success and onboarding; never in errors, money or safety.
- Nudge words: warmer, friendlier / terser, drier.

## Strictness: fast ↔ strict (`strictness`)
How hard the agent is on its own work: grading before it builds, checks after.
- **1 Fast:** Over-budget surfaces graded in your head; after: lint only.
- **2 Light:** Over-budget surfaces graded in your head; after: lint and one desktop screenshot.
- **3 Standard (default):** A written grade sheet per over-budget surface before it is built; after: lint and screenshots at desktop and phone width.
- **4 Careful:** Grade sheets; after: adds dark mode, the key states and render.mjs runtime checks.
- **5 Strict:** Grade sheets; after: adds the critic agent, and 2–3 variants before building.
- Nudge words: thorough, polish / quick, rough.

## Using them
- **A nudge moves one dial one stop for that request only,** and the handover names it ("Look 4, Bold, for this page").
- **Grading is never off,** only how it is written down: Strictness 3 and up makes it a file before the build, 1–2 keep it in your head.
