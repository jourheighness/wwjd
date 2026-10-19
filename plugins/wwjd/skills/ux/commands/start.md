# start: a project's UI baseline

For `scratch`, or UI without baseline files. Each step is skippable; showing work never waits on it. An existing design system wins: read it and fill only the gaps the user agrees to.

## 1. PRODUCT.md (short; infer, then ask the rest in one batch, each with a default)
- **Product type** (`references/product-types.md`): core objects, top 3 jobs.
- **Users:** who, doing what, on which device, time pressure, frequency.
- **Registers** per surface: Persuade site, Operate app, Flow signup.
- **Bar:** 2–3 named products in the category to match. **Anti-references:** what it must not resemble.
- **Locale(s) and voice:** one line each.

## 2. Look: hand to `wwjd:look`
- It picks palette, type face, shape, depth and density from references and writes `DESIGN.md` plus tokens under the `kit/tokens.css` names.
- DESIGN.md follows the google-labs-code spec's 8 sections: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts (named rules, one line each: "**The Calm Rule.** Colour only where something needs attention").
- No `wwjd:look`, or the user skips it: `kit/tokens.css` as is (the baseline preset) and a short DESIGN.md that says so.

## 3. Kit skeleton
- **CSS:** copy `kit/tokens.css`, `kit/base.css`, `kit/layouts.css` into the project's styles, in that order, plus `kit/table-scroll.js` once a table can be wider than its pane; set `<html data-profile>` from the register file's Profile line.
- **Components:** no kit yet → Base UI primitives (or the stack's equivalent, `references/baseline.md`) wrapped as the project's own components, styled with base.css classes. What the first screen needs goes in the kit, never inline on the page.
- **Workshop:** Storybook or Ladle, with a tokens story and a contrast matrix (every text token on every surface it sits on, AA).
- **`.wwjd.json`** (committed, repo-relative only): `register`, `locale`, `kitDirs`, `golden`, `legacy`, `storybook`, `tags`, `rules`. Never preview URLs or hosts: those come from `WWJD_PREVIEW` or an untracked `AGENTS.local.md`.
- **`.gitignore`:** `.wwjd/` (shots, refs, look.json).
- **Existing UI:** `wwjd.mjs check --baseline` writes `.wwjd-baseline.json`. Commit it: the hook then reports only new findings, and counts only go down. Delete it to accept new debt on purpose.

## 4. Decision log and RATCHET.md
- **Decision log:** `docs/decisions/` if it exists, else a "Decisions" section in DESIGN.md. Every later rule goes there, dated, the user's words quoted.
- **RATCHET.md** is shared with ig-ratchet. wwjd writes only: Backlog items tagged `[design]` or `[eng]` (the suspicion, not the target), Gotchas, Tells. Never Config or Scheduler. Create it with the first finding to park.

## 5. Hand over
Links to PRODUCT.md, DESIGN.md and the tokens story; every choice made for the user, one line why, vetoable before anything builds on it.
