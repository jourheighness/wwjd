# Dials

Six dials tune how wwjd designs, never what is correct. Each runs between two named ends; the middle stop is wwjd as written (the product type decides). Set them under Settings in the `/wwjd` sidebar (one segmented row per dial, for you or for this project), with `/plugin configure wwjd@wwjd` or `/config`, or per project in `.wwjd.json` `"dials"`. Nudge one request with words; the prompt hook names the nudge. `wwjd.mjs dials` prints the non-default dials with what each does. Source of truth: `scripts/dials-spec.mjs`.

**Precedence:** SKILL.md §1. A dial never breaks contrast, targets, states or the budgets' overflow rules; a DESIGN.md that owns the look outranks Look.

## Look: plain ↔ expressive (`creativity`)
- **1 Plain:** Neutrals and one accent hue (the brand's, else one picked for the subject; never the kit default), used for the one primary thing; no tinted chips or fills; status and priority in text or a neutral mark; the system face; flat, a 1px border at most; the plainest hero that fits.
- **2 Restrained:** Plain plus one quiet custom touch (a tinted neutral, a refined face or one semantic colour); nothing loud.
- **3 Balanced (default):** One loud axis; a display face on marketing, editorial and consumer screens.
- **4 Bold:** Two loud axes, a display face on every screen, one signature moment per page.
- **5 Expressive:** Art-directed: two loud axes plus one distinct visual idea per page, an unusual layout, a far-end hero.
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
- **2 Airy:** One step roomier than the product type.
- **3 By product (default):** The product type decides: consumer roomy, work tools compact.
- **4 Snug:** One step denser than the product type.
- **5 Compact:** data-density="compact": 32px rows, tight gaps, more per screen.
- Nudge words: denser, tighter / airier, roomier.

## Motion: still ↔ lively (`motion`)
- **1 Still:** data-motion="instant": state changes only, nothing moves.
- **2 Crisp:** One step calmer than the product's motion theme (instant, crisp, smooth, springy); no flourish.
- **3 By product (default):** The product type's motion theme.
- **4 Smooth:** One step livelier than the product's motion theme; softer, slightly longer transitions.
- **5 Lively:** data-motion="springy" and one delight moment per flow; Operate, Monitor, Flow and Transact cap at smooth.
- Nudge words: livelier / calmer, less motion.

## Copy: terse ↔ warm (`voice`)
- **1 Terse:** Labels and values only; sentences only in errors.
- **2 Brief:** Plain and shorter than usual.
- **3 Plain (default):** Plain language in the product's own words.
- **4 Friendly:** Plain, plus spoken dates and counts ("Due Thursday", "3 left") and one human line in empty and success states.
- **5 Warm:** A human voice wherever there are words: spoken dates, counts and states ("Due Thursday", "3 to go", "Almost there"), one friendly line in empty, success and onboarding; never in errors, money or safety.
- Nudge words: warmer, friendlier / terser, drier.

## Strictness: fast ↔ strict (`strictness`)
How hard the agent is on its own work: grading before it builds, checks after. Hooks enforce it (`scripts/gate.mjs`) unless Hooks is quiet or off; the checks are owed either way.
- **Before:** from 4, a new UI file waits for a grade sheet written this session.
- **After:** from 2, the first stop after a run of UI edits names every check below that can run and is not yet newer than the last UI edit, at most twice a turn; one that can't run is said in the handover. The gate asks only for what can run and matters: render checks need a page to point at (an edited `.html` file or `WWJD_PREVIEW`); the phone-width fit check only where the product has phone screens (not Operate or Monitor, unless `.wwjd.json` "devices" names "phone"); a Design canvas, a plugin file, a page about the work (a plan, brief, report or review) or an edit that only touches comments needs no checks. Fit and runtime measure an animated page at rest (reduced motion, animations settled). While the person is exploring ("just exploring", "verify later") the checks are held until they say keep. `.wwjd/shots/UNAVAILABLE` stands in when no renderer can run. The checks are between the gate and Claude: the `/wwjd` sidebar never shows them.
- **Also from 2:** a clean `flow.mjs check` while Flow is on and the project keeps `wwjd.flow.json` (owed only while it has errors); a canvas publish while Canvas is on and `.wwjd.json` links one. Logging decisions is the skill's job (SKILL.md Loop), never a gate.
- **1 Fast:** Over-budget surfaces graded in your head; after: lint only.
- **2 Light:** Over-budget surfaces graded in your head; after: lint and one screenshot at the main width.
- **3 Standard (default):** Over-budget surfaces graded in your head; after: lint, screenshots at desktop and phone width and a clean fit check.
- **4 Careful:** A written grade sheet per over-budget surface before it is built; after: adds dark mode, the key states and render.mjs runtime checks.
- **5 Strict:** Grade sheets; after: adds the critic agent (one run covers the surfaces built so far; applying its findings owes no second run, a new UI file does), and explore's variants before building.
- Nudge words, as instructions only: "be thorough", "carefully", "polish it" / "quick fix", "rough draft", "just ship it". A complaint ("too quick", "really rough") moves nothing: it asks for more care.

## Using them
- **A nudge moves one dial one stop for that request only,** and the handover names it ("Look 4, Bold, for this page").
- **Grading is never off,** only how it is written down: Strictness 4 and up makes it a file before the build, 1–3 keep it in your head.
