# build: implement an approved design

The approved mockup, Figma frame or recorded decision is the spec. Match it exactly, list every difference, never improvise. "It looked better in the mockup" is the failure this command exists to prevent.

## Before coding
1. **Inventory the spec:** every region, component, string, spacing, state and interaction. For Figma, read the whole frame and re-fetch it each session.
2. **Map each part to a kit component.** A missing part becomes a new kit component or variant, with a workshop story showing its states. Never style it inline on the page.
3. **Re-read the decision log** so nothing decided earlier is lost.

## While coding
- **Pages compose components and add no styling of their own:** no utility soup, no hex values, no overrides at the call site. A page that needs a different look gets a variant in the component.
- **When an existing component inside your scope is hand-rolled or does bad UX,** fix it in the kit; don't copy it. Outside your scope, flag it.
- **When a better pattern replaces an old one,** replace it everywhere within the agreed scope in the same change.
- **Audit third-party UI at import** (shadcn, Magic UI, React Bits and other registries): reduced-motion handling, cursor-reactive effects, auto-loops, contrast. Exclude what fails; never import it to patch later.
- **Seed realistic data** for first use, one item, many, the longest text, and empty.
- **Build the intended flow, not the current limits.** Every step, state and transition of the approved design ships, even where the backend can't do it yet: put a small named adapter in front (local stub, fixture or optimistic implementation, marked `// TODO(api): …`) and keep it working end to end. Never simplify the flow or fall back to a worse pattern to fit the API. Wiring the real backend waits, or ask "build now or later?".

## Verify before saying done
1. **Paired screenshots** of the app and the spec in the same state:
   - light and dark
   - the primary width (1440 for desktop tools, 390 for mobile-first registers) and the other end
   - Look at them yourself, e.g. with `scripts/shoot.sh`.
2. **Difference list:** every visible difference is either fixed or flagged. A difference caused by real data (longer text, missing values) goes to the user as a decision; don't silently redesign.
3. **Static check:** run `scripts/ui-check.mjs --register <register>` (in this skill's folder) on the changed files.
4. **Live check:** confirm the change is live where the user will look (preview, workshop, deploy). Hand over the link, with every `TODO(api)` mock and what the backend must provide.
5. **Cold review:** for larger builds, a reviewer that did not write the code compares it against the spec (in Claude Code, the `wwjd-critic` agent). It runs in the background after the handover; never hold the work back for it.

## Delegating a build
The brief says "match exactly, list differences, never improvise". It names:
- the spec link
- the kit components to use
- the states to cover
- the paired-screenshot check
