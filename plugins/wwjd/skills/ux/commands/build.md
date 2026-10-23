# build: new, extend or rebuild

One command for every build. Match the spec (an approved variant, mockup, Figma frame or recorded decision) exactly: list every difference, improvise nothing. "It looked better in the mockup" is the failure this prevents.

## Modes
- **New:** golden files first (`wwjd.mjs status` lists them). Copy their structure, imports and naming; never a `legacy` file.
- **Extend:** the same job reuses the same component; a missing look becomes a kit variant with its story.
- **Rebuild:** a messy screen in scope is rebuilt, not renovated. Write a ≤10-line spec (job, register, layout id from `references/layouts.md`, regions, primary action per region, states), show it, build it fresh on the kit, then replace the old one. Example pair: `references/examples.md`.

## Before coding
1. **Inventory the spec:** regions, components, strings, spacing, states, interactions. Figma: read the whole frame, re-fetch each session.
2. **Map every part to a kit component.** Missing: a new kit component or variant plus a story with its states.
3. **Budget each surface:** name its job, then count its candidate facts and actions against `references/budgets.md`. Over budget: grade first (`budgets.md` § Grade gate) and build what stays. An approved spec over budget is flagged, never silently cut.
4. **Grep the decision log** for the surface's names, so nothing decided is lost.

## While coding
- **Kit first:** pages compose components and add no styling: no utility soup, hex or call-site overrides. A different look is a variant.
- **A bad kit component is fixed in the kit,** with its story, never patched at the call site. Outside scope: flag it.
- **A better pattern replaces the old one** everywhere in the agreed scope, in the same change.
- **Third-party UI** (shadcn, Magic UI, other registries): audit at import for reduced motion, cursor-reactive effects, auto-loops, contrast; exclude what fails.
- **Seed realistic data** for every state (`rules/states.md` § Data states).
- **The intended flow ships whole** (SKILL.md § 3): every step, state and transition; a `// TODO(api): …` adapter (stub, fixture or optimistic) where the backend can't yet.

## Verify (SKILL.md § 5 Checks)
- **Auto:** the hook's `wwjd.mjs check`. Fix each finding or justify it with `wwjd-ignore: <reason>`.
- **Shots:** read every one yourself; with a spec, compare the same state and list every difference: fixed, or flagged. A difference caused by real data (longer text, missing values) is the person's decision, never a silent redesign.
- **Live:** confirm the change is where the person will look (preview, workshop, deploy). Hand over the link and the `TODO(api)` list with what the backend must provide; ask "build now or later?".

## Delegating
The brief says "match exactly, list differences, never improvise" and names the spec, the kit components, the states and the screenshot check.
