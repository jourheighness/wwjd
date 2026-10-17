# Persuade: landing, pricing, campaign, waitlist

Profile: `data-profile="marketing"`. Colour: identity; a committed ground and fields of colour are fine, the accent still marks the action.

Success: the visitor decides and acts. A persuade page argues one claim and earns one action. Layouts: `landing`, `pricing`.

## Method
1. **Inventory** 8–12 facts only this subject has: name and meaning, place, real numbers, materials, rituals, artefacts, imagery that exists. Vague brief: state your reading in one line and proceed.
2. **Argument:** each section is one claim plus its proof; no claim, cut. The order of claims is the page order, which kills the template (hero, logos, 3 features, testimonial, pricing, CTA).
3. **Idea sentence:** "On this page [thing from the inventory] becomes [device]." **Competitor test:** swap in the nearest rival; if it still works, it's a category page. **Self-contradiction test:** the page demonstrates every hero claim (a "simple" product whose page takes 10s to parse fails).
4. **Copy deck before markup.** The first screen answers the visitor's first question in large type with one real button. Write the full content: thin sections are the commonest reason a clean page loses.
5. **Spend boldness in one place.** One memorable element; the rest quiet. Before shipping, remove one accessory.

## The page converts; the journey lives elsewhere
- Ordering, booking or signing up happen on their own stepped pages (Flow, Transact), never a shop crammed into the landing page.
- Map the journey after the click, each step in its register: product list (Transact) → pickup or delivery (Flow) → checkout.

## Composition
- **One dominant thing per screen;** neighbouring sections never share a layout. The gap between sections beats any gap inside one.
- **Above the fold at 1280×800:** headline, a lede of ≤2 lines, the CTA.
- **The hero may be the page's one centred moment:** ≤2 elements, the CTA off-axis.
- **Hero composition serves the idea sentence:** utility-first tool, live product demo, type-only, full-bleed media, or a surprise. Left text / right image is overdone and never the default. Hero compositions: `references/heroes.md`.
- **A hero tool carries its own CTA** (picker, estimator, calculator), and its input carries into the order or signup flow. Never a "try it" widget here and a "do it" button elsewhere: the split reads as not wanting the order.
- **Grade every fact** (`references/budgets.md`): the one that settles or delights gets its own moment with a small visual; the deciding fact sits next to the action; facts nobody acts on are cut.
- **Carry the idea** through pricing, FAQ and footer. Answer objections in the argument; a FAQ you keep uses `<details>`.
- **Nav** is a plain bar: wordmark, 3–5 links, one action. **Footer** is a designed close (the name at full width, or one quiet line), not a link farm.

## Type
- **Headlines ≤2 lines at every width** (~32–50 characters). Fix in order: cut words, widen the measure, shrink the size.
- Display ≥3× body; the project's faces, at most display + text.

## Imagery
- **Real raster first:** the subject's own, then generated, then open collections, then honest stock. One crop ratio, one grade.
- **Software shows its real UI,** rendered from the product; never drawn browser chrome or phone frames.
- **Text over media** gets a scrim.

## Proof and numbers
- **Real proof only** (logos, quotes, counts); unconfirmed = flagged as a sample, or cut. A real proof number changes the decision; a strip of round numbers doesn't.
- **Let them try it:** for a price or risk decision, a calculator or live preview instead of a description.
- **B2B:** give the champion copy they can paste into an internal memo.

## Motion
Motion: `wwjd-animation` skill. Never scroll hijack.

## Performance and meta
- **Performance is design:** preload the LCP image, ≤2 font files above the fold, metric-matched fallbacks, no shift as the hero loads.
- **Meta designed with the page:** a specific `<title>`, description, OG image, favicon, 404.

## Tells to avoid
- A centred headline over 3 icon cards; an eyebrow kicker above the H1; a gradient word in the headline.
- Bento by default; a fake logo strip, "Trusted by 10,000+ teams"; a stat banner of round numbers.
- Fade-up on everything; a FAQ accordion standing in for the argument; a link-farm footer.
