# Landing pages: tasteful motion

Register Persuade or Showcase. The page sells the product, so the motion shows the product. Budget: **one orchestrated moment, one scroll-built idea, one live demo.** Everything else is static. A hero or section that tells a story in shots (a scene-led hero, a product demo built in code, a scroll story) is planned and timed with `wwjd:motion-design`; this page covers the motion around it.

## What the good ones do
- **One hero moment on load, 400–1200ms:** headline, then the product frame settles in (opacity + 8–16px, `--ease-out`). Text readable from the first frame; the CTA never waits on the animation. Plays once; never replays on scroll back.
- **The real interface, moving:** a short loop of the actual product (recorded video, or the live component with seeded data), showing one job done start to finish. Paused off-screen, poster frame on reduced motion, pause control if it runs past 5s.
- **Scroll-linked storytelling, sparingly:** one section where scroll builds an idea (a diagram assembling, a product rotating, a before/after). Scroll drives the animation; the animation never drives scroll. Apple's product pages are the model and the ceiling.
- **Numbers that change because the visitor changed something:** pricing toggle monthly↔yearly rolls the digits; a calculator updates live. Real numbers only.
- **Logo marquee, if any:** slow (≥40s per loop), pauses on hover and focus, static on reduced motion, duplicated items `aria-hidden`.
- **Section entry:** most sections need nothing. If something reveals, it's the one idea that builds, via `.reveal`.
- **Navigation:** sticky bar condenses with a transform, not a layout change; cross-page crossfade via `@view-transition`.
- **Ships reduced-motion handling:** 9 of 10 leading SaaS homepages checked in 2026-10 do. Decorative motion off, content complete.
- **Stack they use:** Motion (React) or plain CSS; WebGL only for a brand-owned hero; none of the 10 shipped GSAP.

## The tells (cut on sight)
| Tell | Why it fails |
|---|---|
| Fade-up on every block | Movement for its own sake; content late on fast scroll; reads as a template |
| Scroll hijack / scrolljacking | Disorients, feels broken, worst on mobile (NN/g) |
| Parallax soup | Slow, unreadable moving text, nausea; most people don't care (NN/g) |
| Bouncing chevron, pulsing CTA | Begging; the fold edge does the job |
| Custom cursor, magnetic buttons | Breaks the system cursor's meaning and the person's size and contrast settings |
| Typing headline | Late message; screen readers read fragments |
| Count-up stats | Fake drama around numbers that may be fake |
| Animated mesh or aurora background | Decoration that costs battery and contrast; flat by default |
| Staggered word-by-word headline reveal | Slows the one line that must land in a second |
| Auto-advancing testimonial carousel | Moves while being read; 2.2.2 |

## Spec cheatsheet
- Hero: total ≤1200ms, each element ≤400ms, steps 60–100ms apart, at most 3 steps.
- Reveal: `animation-range: entry 0% entry 60%`, travel ≤16px, opacity from 0, at most 1–2 per page.
- Demo loop: 6–15s, starts on view, stops off-view, muted, `playsinline`, poster frame.
- Theme: `springy` or `smooth`; the app behind the CTA keeps its own theme.
- Dependencies: CSS covers this page. GSAP or Motion only for a real timeline or gesture.
