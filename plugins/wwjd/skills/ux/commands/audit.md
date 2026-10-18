# audit: fix the codebase

For `messy` repos and "debt", "clean up the codebase", "why does this look inconsistent". Output is a map and a ratchet, not a rewrite.

## 1. Map
- `wwjd.mjs audit`: findings by area, rebuild candidates, golden picks, ready `[design]` lines.
- Classify each drift by root cause and fix it there:

| Cause | Fix |
|---|---|
| Missing token | add it to the tokens |
| One-off where a kit component exists | use the component |
| Bad kit component | fix it and its story; call sites follow |
| Flow differs from comparable features (modal vs page, autosave vs submit) | align the flow |
| Screen beyond repair | rebuild from a ≤10-line spec (`build`) |

## 2. Ratchet
- `wwjd.mjs check --baseline` writes `.wwjd-baseline.json`; commit it. From then on the hook and `check --new` report only new findings, and re-running `--baseline` only lowers counts.
- **Golden files:** confirm 1–3 of the suggested picks with the owner once; write them to `.wwjd.json` `golden`. Old patterns nobody should copy go to `legacy` globs.
- **RATCHET.md:** one Backlog line per area; what wwjd may write: `commands/start.md` §4.

## 3. Fix order
Honesty and floor first, then the kit components with the most call sites, then rebuild candidates, then the long tail as each screen is touched (inside the scope of the task at hand).

## 4. Facts the scripts don't check (milestone or on request)
- **Contrast:** AA text, 3:1 UI parts, icons, focus; the contrast matrix story exists and passes.
- **Semantics:** headings never skip a level; landmarks; every control labelled; icon-only buttons named.
- **Keyboard:** every flow works; roving focus in tabs and menus; Esc closes overlays. 200% zoom and text-spacing in a real browser.
- **Live regions:** status changes announced once, as a phrase.
- **Performance** (Persuade, Showcase, Editorial, Reference, Transact, Flow): LCP < 2.5s on a mid-range phone, LCP image preloaded, ≤2 font files above the fold with metric-matched fallbacks, modern image formats with set dimensions, no load shift.
- `render.mjs runtime` covers overflow, clipped text, targets, hover shift, focus visibility, reduced motion, broken images and spacing drift.

## Report
Severity: **blocks** · **major** (incl. any floor failure) · **minor**, with `file:line` fixes for the first two. A clean audit proves those defects are absent, not that the UI is good.
