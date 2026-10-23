# Platform: CSS first, then a library only when it earns it

Support as of 2026-10 (MDN BCD); re-check before relying on it. Every recipe degrades to an instant change.

## CSS features
| Feature | Support | Use | Fallback |
|---|---|---|---|
| `@starting-style` | Baseline 2024 | Entry for popovers, dialogs, inserted nodes | Appears instantly |
| `transition-behavior: allow-discrete` (`display`, `overlay`) | Chrome; Safari no `overlay`; Firefox can't transition `display` | Exit for native popover/dialog | Exit is instant |
| `linear()` easing | Baseline widely (2026-06) | Spring curves as tokens (`--ease-spring`) | n/a |
| View transitions, same document | Baseline 2025-10 (Chrome 111, Safari 18, Firefox 144) | List insert/remove/reorder, tabs content, shared element | `startViewTransition` missing → call the update directly |
| `view-transition-class`, `match-element` | Chrome 137, Safari 18.4, Firefox 144 | Style many items with one rule; auto names | Same |
| VT types (`types`, `:active-view-transition-type()`) | Chrome, Safari 18.2, Firefox 147 | Forward/back direction | Plain crossfade |
| Cross-document VT `@view-transition { navigation: auto }` | Chrome 126, Safari 18.2; not Firefox | MPA page crossfade, shared element across pages | Normal navigation |
| Scroll-driven (`animation-timeline: view()/scroll()`) | Chrome 115, Safari 26; Firefox behind a flag | `.reveal`, progress bars, scroll-linked story | Guard with `@supports`; content shown static |
| `interpolate-size`, `calc-size()` | Chrome 129 only | `details.disclosure` height | Opens instantly |
| `::details-content` | Baseline 2025-09 | Style the disclosure panel | n/a |
| `prefers-reduced-motion` | Baseline widely | Drop transforms, keep short fades | n/a |
- Not yet: scroll-triggered `animation-trigger` (Chrome 146 only), element-scoped VT (Chrome 147, experimental), `prefers-reduced-transparency` (Chrome only; wwjd is opaque by default).

## Recipes and gotchas
- **Entry/exit:** the open state carries the entry, the closed state the faster exit (`motion.css`).
- **Same-document VT:** `document.startViewTransition(() => update())`, one element group; `::view-transition { pointer-events: none }` so clicks reach the page.
- **React:** `<ViewTransition>` is stable in React 19.3; it fires only from `startTransition`, Suspense reveals or `useDeferredValue`. Next.js App Router needs no config; `<Link transitionTypes={['nav-forward']}>`.
- **Names:** unique among rendered elements; lists use `match-element` + `view-transition-class`.
- **Springs in CSS:** `linear()` springs lose velocity when interrupted; gesture-driven or often-interrupted springs go in JS (Motion) or drop the overshoot.
- **Scroll-driven:** put `animation-timeline` after the `animation` shorthand (the shorthand resets it); `animation-range: entry 0% entry 60%` finishes before the reader arrives.
- **Reduced motion:** a VT under reduce: `::view-transition-group(*) { animation: none }`, crossfade ≤120ms. JS: `matchMedia('(prefers-reduced-motion: reduce)')` before any WAAPI/library call; Motion has `MotionConfig reducedMotion="user"`.
- **WCAG:** 2.2.2 auto-motion over 5s needs pause; 2.3.3 interaction motion can be turned off; 2.3.1 ≤ 3 flashes a second.

## Libraries: when each earns the dependency
| Need | Use | Cost |
|---|---|---|
| Enter, exit, hover, height, list changes, page transitions | CSS + `motion.css` + view transitions | 0 KB |
| JS-triggered sequence, sampled values | Web Animations API (`el.animate`) | 0 KB |
| React exits, layout/shared layout, drag with momentum, interruptible springs | Motion v14 (`m` + `LazyMotion` ≈5 KB, + `domAnimation` 24 KB / `domMax` 38 KB); `animate()` mini 3.2 KB vanilla | MIT |
| One-line list add/remove/move in a prototype | AutoAnimate ≈3.3 KB | MIT |
| Timeline-heavy landing orchestration, pinning, SplitText | GSAP 3.15, free incl. commercial (own license, not MIT); core ≈28 KB + ScrollTrigger ≈18 KB | Persuade/Showcase only |
| Interactive illustration with states (mascot, onboarding art) | Rive (runtime 222–648 KB WASM; exports need a paid plan) | Showcase, playful only |
| Designer After Effects loops | Lottie (`lottie-web` light ≈47 KB, or dotLottie WASM ≈500 KB) | Pause off-screen and on reduce |
| Rolling numbers | NumberFlow, or digits in CSS | Small |
- Prefer CSS transitions → CSS animations → WAAPI → a library. Never a library for what a transition does; never two motion libraries.
- Native: SwiftUI springs (`.smooth`, `.snappy`, `.bouncy`, default `duration: 0.5`); Compose Material 3 motion scheme (spatial vs effects springs).
