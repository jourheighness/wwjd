# Motion bans: the tell → instead

Each ban names its replacement. Extends wwjd's `references/bans.md`; that file wins on conflict.

| Tell | Instead |
|---|---|
| Fade-up or stagger on every section | Content is there on load; one `.reveal` on the one idea that builds |
| Scroll hijack, scroll snapping the whole page, smooth-scroll libraries | Native scroll; scroll-linked motion that follows it, never drives it |
| Parallax layers on everything | Static; one depth layer only if it carries the idea, off on reduced motion |
| Bouncing scroll chevron, pulsing CTA, ping dots | Nothing; a clear next section edge above the fold |
| Custom cursor, cursor followers, magnetic buttons | The system cursor |
| Typing effect on a headline | The headline, set |
| Count-up on page load | The number, set; animate only when it changes |
| Chart bars or lines growing in | Chart drawn; new data points crossfade in place |
| `scale(0)` entrance, bounce or elastic easing | Opacity + `scale(.95–.98)`, ease-out; `springy` ≤2% overshoot on transform |
| Slide-in from off-screen for a dialog | Fade + scale at centre |
| Shake on error | Message in place, field marked, focus moved |
| Confetti, celebration toast | Silent success; a rare milestone gets one ≤600ms moment |
| Spinner in the middle | Skeleton matching the layout (static); progress past 1s |
| Animated gradient, mesh or aurora background | Flat ground; the brand asset, if it owns one, static |
| Auto-advancing carousel or testimonial slider | All items visible, or manual control |
| Hover lift + shadow-grow on cards | Border or background tone step |
| Motion on keyboard actions, palette, context menu | Instant |
| Theme switch transitions (colours fading on every element) | Instant switch; at most a root view-transition crossfade |
| `transition: all` | Name the properties |
| Animating width, height, top, left, margin, padding | `transform`; height via grid rows, `<details>` or FLIP |
| Durations over 500ms on UI feedback | ≤300ms typical; exits faster |
| `ease-in` on an entrance, `linear` on UI | `--ease-out`; `linear` only for progress and scroll-linked |
| Lottie or video loops that never stop | Pause off-screen, on reduced motion, and give a pause control past 5s |
| Locking clicks until an animation ends, `animationend` setting final state | Transitions that reverse; state set first, motion follows |

## Lint ideas (static check)
- `transition: all` or `transition-property: all`.
- `transition`/`animation` naming `width|height|top|left|right|bottom|margin*|padding*|inset` (allow `grid-template-rows`, `block-size` on `::details-content`).
- Any `@keyframes`/`transition` with `transform` and no `prefers-reduced-motion` rule in the same stylesheet or project.
- Durations > 500ms outside `.reveal`, hero or `[data-motion-hero]` selectors.
- `scale(0)` or `scale(0.[0-8])` in keyframes or starting styles.
- `ease-in` (not `ease-in-out`) on any transition.
- `cubic-bezier` with y1 or y2 outside 0–1 (overshoot) when the theme is not `springy`.
- `animation-iteration-count: infinite` outside spinners, progress or skeleton classes.
- `animation-timeline` without an `@supports` guard; `.reveal` count per page > 2.
- `will-change` set in a static rule on more than a few elements.
- Libraries known for hijack (`locomotive-scroll`, `fullpage.js`) or cursor effects in dependencies.
