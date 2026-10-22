---
name: motion
description: 'Use for any UI animation, transition, micro-interaction, hover or press effect, scroll effect, page or view transition, loading, skeleton or "thinking" state: motion themes per product type and when not to animate (wwjd). Pairs with wwjd:ux; its floor wins. Not for video, canvas games or data-chart animation.'
when_to_use: '"animate this", "make it feel alive", "smoother", "snappier", "add a transition", "loading state", "hover effect".'
---

# wwjd:motion

Motion explains a change, or it goes. Refines wwjd:ux's motion rules; never loosens the floor (reduced motion, nothing shifts uncaused, interruptible, transform and opacity).

## 1. Decide first: should this move at all?
1. **How often is it seen?** 100+ a day (palette, shortcuts, context menu): none. Tens a day (hover, list nav, tabs): minimal or none. Occasional (dialog, drawer, toast): standard. Rare (onboarding, first success): may delight.
2. **Who triggered it?** Keyboard or repeated input: no animation. System change: slower, calmer, and only if the person needs to notice it.
3. **What does it explain?** Origin, change, cause and effect, or work in progress. "Looks nice" is not on the list.
4. **Cut unless it shows origin, change, cause or progress.**
5. **Is the person waiting?** Answer within 100ms (press state, optimistic update). Past 400ms show a skeleton; past 1s show progress.

## 2. Pick one theme per product
| Theme | fast / pop / modal | Feel | Default for |
|---|---|---|---|
| `instant` | 80 / 100 / 160ms | fade only, no scale or travel | Monitor, Reference, dense Operate, power tools, public-service forms |
| `crisp` | 120 / 160 / 220ms | ease-out from .97 (baseline, = kit/tokens.css) | Operate, Converse, checkout, Editorial chrome |
| `smooth` | 180 / 240 / 320ms | drawer curve, more travel | consumer apps, commerce browse, signup and onboarding (Flow) |
| `springy` | 120 / 180 / 320ms + 420ms spring | M3 Expressive spatial spring, ≈1.2% overshoot on transform only | Persuade, Showcase, playful consumer |
- **Read the Motion dial** (`wwjd.mjs dials`; wwjd:ux `references/dials.md`): 1 Still = `instant`; 2 one step calmer than this table's theme; 3 this table; 4 one step livelier; 5 Lively = `springy`, capped at `smooth` in Operate, Monitor, Flow and Transact. Steps run instant, crisp, smooth, springy. A theme DESIGN.md records wins.
- Set once: `<html data-motion="…">` with `motion.css` after the kit's `base.css`; record `motion:` in DESIGN.md.
- `springy` never in Operate, Monitor, Flow or Transact. One theme per surface.
- Per product type and signature moments: `references/themes.md` (it wins over this table). Native: the platform's own motion (`references/platform.md`).

## 3. Rules
- **Duration by size and distance:** press 100–160ms; tooltip, popover 125–200; dropdown 150–250; dialog, drawer 200–320; full-screen 300–400. UI feedback never over 500ms; a landing hero may run 400–1200ms once.
- **Exits 20–30% faster than entries.** Nobody waits to watch something leave.
- **Easing:** enter and exit `--ease-out`; on-screen move `--ease-move`; drawers and sheets `--ease-drawer`; colour and hover `ease`. Never `ease-in` on UI. `linear` only for progress and scroll-linked motion.
- **Springs:** for gestures (keep the throw's velocity) and the `springy` theme. Spatial springs may overshoot ≤2%; opacity and colour never spring. No elastic, no wobble.
- **Origin:** popovers grow from their trigger (`--transform-origin`); dialogs from centre; sheets from their edge. Start at scale .95–.98, never 0.
- **Interruptible:** CSS transitions, not keyframes, for anything toggled; `@starting-style` for entry. Re-trigger reverses from where it is. Never lock clicks while animating.
- **State flips don't animate:** select, read and toggle states change instantly or with a ≤150ms colour fade; nothing swaps, slides or fades in. Patch in place, never rebuild the list, or rows replay their entry transitions (wwjd `rules/states.md`). Owner, 2026-10-17.
- **One focus at a time:** one thing moves per moment; neighbours shift only via FLIP or a view transition.
- **Reduced motion:** transforms drop; fades stay ≤120ms. Autoplay over 5s needs pause. Loops stop off-screen.
- **Performance:** `transform` and `opacity` only (height via `grid-template-rows` or `<details>`); never `transition: all`; `will-change` only while moving; test at 4× CPU throttle.

## 4. Moments and files
Every moment (press to product demo) with when, spec and never: `references/moments.md`. Recipes: `motion.css`. Also `references/`: `themes.md`, `landing.md`, `platform.md`, `bans.md`, `sources.md`.

## 5. Verify
1. **Slow-mo:** DevTools Animations at 10%, screenshot mid-transition. Right origin, no jump at the end.
2. **Interrupt:** double-click open, Escape mid-entry. It reverses, never restarts or locks.
3. **Keyboard path:** shortcuts and arrow keys change state with no motion.
4. **Reduced motion:** emulate `prefers-reduced-motion: reduce`; no transform moves, nothing essential lost.
5. **Frequency audit:** list every animated thing with how often it's seen; cut the frequent ones.
6. **Throttle:** 4× CPU, no dropped frames; no width/height/top/left/margin in any transition.
