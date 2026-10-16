# animate: motion and transitions

Motion explains a change, or it goes.

## Decide
1. **How often is it seen?**
   | How often | Motion |
   |---|---|
   | 100+ times a day (palette, context menu, shortcuts) | None |
   | Tens a day (hover, list navigation) | Minimal |
   | Occasionally (drawer, modal, toast) | Standard |
   - Never animate keyboard-initiated actions.
2. **What does it explain?** Where something came from or went, a state change, or cause and effect. "Looks nice" is not a reason. Nothing appears out of the blue: a moved item travels to its new place.
3. **Which register?**
   - **Operate, Monitor, Reference, Flow:** functional motion only.
   - **Persuade, Showcase:** one orchestrated moment (400–1200ms) and scroll-linked motion that carries the idea.
   - **Converse:** streaming is the motion.
   - **Native:** the platform's own transitions.

## Specs
- **Durations,** with exits about 20–30% faster than entrances:
  | Element | Duration |
  |---|---|
  | Press | 100–160ms |
  | Tooltip, small popover | 125–200ms |
  | Dropdown | 150–250ms |
  | Drawer, dialog | 200–300ms |
  - Feedback never goes over 500ms.
- **Easing:**
  | Use | Curve |
  |---|---|
  | Enter, exit | `cubic-bezier(0.23, 1, 0.32, 1)` |
  | On-screen move | `cubic-bezier(0.77, 0, 0.175, 1)` |
  | Drawer | `cubic-bezier(0.32, 0.72, 0, 1)` |
  | Colour, hover | `ease` |
  - Defaults after Emil Kowalski. Never `ease-in` on UI, and no bounce or elastic.
- **Physical:**
  - Start from `scale(0.95–0.98)` plus opacity, never `scale(0)`. Popovers grow from their trigger.
  - Sheets have give: drag resistance and a momentum close.
  - No press scale on rows or cards.
- **Interruptible:**
  - Use transitions, not keyframes, for anything triggered repeatedly; `@starting-style` for entry.
  - Abort on interrupt and never lock clicks while animating.
  - Never rely on `animationend` to set the final state.
- **Implementation:**
  - Animate `transform` and `opacity` only, never `transition: all`.
  - Height via `grid-template-rows: 0fr → 1fr`, or FLIP.
  - One shared set of motion tokens.
  - Gate hover motion behind `(hover: hover) and (pointer: fine)`.
- **Reduced motion:** spatial moves become a crossfade of ≤150ms. Autoplay longer than 5 seconds needs pause.

## Never
- Stagger or bubble-in on every block.
- Chart grow-ins.
- Cursor-following tooltips.
- Perpetual pulse or ping loops.
- Confetti.
- Shake on error.
- Scroll hijacking.
- Fade-up on every section.
