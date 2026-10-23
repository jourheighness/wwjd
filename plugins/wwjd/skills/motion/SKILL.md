---
name: motion
description: 'UI motion (wwjd): transitions, hover and press, micro-interactions, scroll effects, loading and skeletons, and when not to animate. Not art-directed pieces people watch (wwjd:motion-design), video or games.'
when_to_use: '"animate this", "smoother", "snappier", "add a transition", "loading state", "hover effect".'
---

# wwjd:motion

Motion explains a change, or it goes. wwjd:ux's Floor wins (reduced motion, nothing shifts uncaused, interruptible).

**Boundary:** wwjd:motion is UI motion that answers an action or a state change (press, hover, transition, loading, a single scroll reveal). wwjd:motion-design is a piece people watch that tells a story in shots (story hero, explainer, launch film, product demo built in code, pinned scroll story): load it instead.

## 1. Decide first: should this move at all?
1. **How often is it seen?** 100+ a day (palette, context menu): none. Tens (hover, tabs): minimal or none. Occasional (dialog, toast): standard. Rare (onboarding, first success): may delight.
2. **Who triggered it?** Keyboard or repeated input: none. The system: calmer, and only if the person must notice.
3. **What does it explain?** Origin, change, cause and effect, or progress. None of these: cut it.
4. **Is the person waiting?** Respond within 100ms (press state, optimistic update); past 400ms a skeleton; past 1s progress.

## 2. Pick one theme per product
| Theme | fast / pop / modal | Feel | Default for |
|---|---|---|---|
| `instant` | 80 / 100 / 160ms | fade only, no scale or travel | Monitor, Reference, dense Operate, power tools, public-service forms |
| `crisp` | 120 / 160 / 220ms | ease-out from .97 (baseline, = kit/tokens.css) | Operate, Converse, checkout, Editorial chrome |
| `smooth` | 180 / 240 / 320ms | drawer curve, more travel | consumer apps, commerce browse, signup and onboarding (Flow) |
| `springy` | 120 / 180 / 320ms + 420ms spring | spatial spring, ≈1.2% overshoot on transform only | Persuade, Showcase, playful consumer |
- **The Motion dial** (wwjd:ux `references/dials.md`): 1 = `instant`; 2 one step calmer than the table; 3 the table; 4 one step livelier; 5 = `springy`. A theme in DESIGN.md wins.
- **`springy` never in Operate, Monitor, Flow or Transact** (dial 5 caps at `smooth` there). One theme per surface.
- Set once: `<html data-motion="…">`, `motion.css` after the kit's `base.css`; record `motion:` in DESIGN.md.

## 3. Rules
- **Duration by size and distance:** press 100–160ms; tooltip, popover 125–200; dropdown 150–250; dialog, drawer 200–320; full-screen 300–400. UI feedback never over 500ms; a landing hero may run 400–1200ms once.
- **Exits 20–30% faster than entries.**
- **Easing:** enter and exit `--ease-out`; on-screen move `--ease-move`; drawers and sheets `--ease-drawer`; colour and hover `ease`. Never `ease-in` on UI; `linear` only for progress and scroll-linked motion.
- **Springs:** gestures (keep the throw's velocity) and `springy` only; overshoot ≤2%, on transform only; no elastic.
- **Origin:** popovers from their trigger (`--transform-origin`), dialogs from centre, sheets from their edge. Start at scale .95–.98, never 0.
- **Interruptible:** CSS transitions, not keyframes, for anything toggled (`@starting-style` for entry); re-trigger reverses; never lock clicks.
- **State flips don't animate:** select, read and toggle states change instantly or with a ≤150ms colour fade. Patch in place, never rebuild the list, or rows replay their entry transitions (wwjd:ux `rules/states.md`).
- **One mover at a time;** neighbours shift only via FLIP or a view transition.
- **Reduced motion:** transforms drop; fades stay ≤120ms. Autoplay over 5s needs pause; loops stop off-screen.
- **Performance:** `transform` and `opacity` only (height via `grid-template-rows` or `<details>`); never `transition: all`; `will-change` only while moving.

## 4. Files
Per moment (when, spec, never): `references/moments.md` · per product type: `references/themes.md` (wins over §2) · recipes: `motion.css` · tells and lint: `references/bans.md` · landing pages: `references/landing.md` · CSS support, libraries, native: `references/platform.md`.

## 5. Verify
- **Slow-mo** at 10%, screenshot mid-transition: right origin, no end jump.
- **Interrupt** (double-click, Escape mid-entry): it reverses, never restarts or locks.
- **Keyboard** changes state with no motion; **reduced motion** emulated: no transform moves, nothing lost.
- **Frequency:** list every animated thing by how often it's seen; cut the frequent ones.
- **Throttle** 4× CPU: no dropped frames.
