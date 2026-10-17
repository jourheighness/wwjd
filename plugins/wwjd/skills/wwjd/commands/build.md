# build: new, extend or rebuild

One command for every build. The spec (an approved variant, mockup, Figma frame or recorded decision) is matched exactly: every difference listed, nothing improvised. "It looked better in the mockup" is the failure this prevents.

## Modes
- **New:** golden files first (`wwjd.mjs status` lists them). Copy their structure, imports and naming; never a `legacy` file.
- **Extend:** the same job reuses the same component; a missing look becomes a kit variant with its story.
- **Rebuild:** a messy screen in scope is rebuilt, not renovated. Write a ≤10-line spec (job, register, layout id from `references/layouts.md`, regions, primary action per region, states), show it, build it fresh on the kit, then replace the old one. Pair: `references/examples.md`.

## Before coding
1. **Inventory the spec:** regions, components, strings, spacing, states, interactions. Figma: read the whole frame, re-fetch each session.
2. **Map every part to a kit component.** Missing → new kit component or variant plus a story with its states.
3. **Budget each surface:** count its candidate facts and actions against `references/budgets.md`. Over budget: grade them (`decider: on`: run `grade.mjs` once now; off: grade yourself) and build what stays. An approved spec over budget is flagged, never silently cut.
4. **Grep the decision log** for the surface's names, so nothing decided is lost.

## While coding
- **Kit first:** pages compose components and add no styling: no utility soup, hex or call-site overrides. A different look is a variant.
- **A bad kit component is fixed in the kit,** with its story, never patched at the call site. Outside scope: flag it.
- **A better pattern replaces the old one** everywhere in the agreed scope, in the same change.
- **Third-party UI** (shadcn, Magic UI, React Bits, other registries): audit at import for reduced motion, cursor-reactive effects, auto-loops, contrast. Exclude what fails.
- **Seed realistic data:** first use, one, many, longest text, empty.
- **The intended flow ships whole:** every step, state and transition, behind a small named adapter (stub, fixture or optimistic) marked `// TODO(api): …` where the backend can't yet. Never the worse pattern to fit the API.

## Verify (tiers: SKILL.md loop)
- **Auto:** the hook's `wwjd.mjs check`. Fix each finding or justify it with `wwjd-ignore: <reason>`.
- **Each handover:** `render.mjs shoot <url> --one`, read it yourself; with a spec, compare the same state and list every difference: fixed, or flagged. A difference caused by real data (longer text, missing values) is the user's decision, never a silent redesign.
- **Milestone:** `render.mjs shoot` (primary + other width × light/dark), `render.mjs fit` for anything that resizes, `render.mjs runtime`, empty and longest-text states.
- **Live:** confirm the change is where the user will look (preview, workshop, deploy). Hand over the link and the `TODO(api)` list with what the backend must provide; ask "build now or later?".

## Delegating
The brief says "match exactly, list differences, never improvise" and names the spec, the kit components, the states and the screenshot check.
