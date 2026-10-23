# Landing pages: tasteful motion

Register Persuade or Showcase: the motion shows the product. Budget: **one orchestrated moment, one scroll-built idea, one live demo;** everything else static. A piece told in shots (story hero, product demo built in code, pinned scroll story) is `wwjd:motion-design`; this page covers the motion around it.

## What the good ones do
- **One hero moment on load, 400–1200ms:** headline, then the product frame settles in (opacity + 8–16px, `--ease-out`). Text readable from the first frame; the CTA never waits; plays once, never on scroll back.
- **The real interface, moving:** a short loop of the actual product (recorded video, or the live component with seeded data) doing one job start to finish. Paused off-screen, poster on reduced motion, pause control past 5s.
- **One scroll-built idea:** a diagram assembling, a product rotating, a before/after. Scroll drives the animation, never the reverse.
- **Numbers change because the visitor changed something:** a pricing toggle rolls the digits; a calculator updates live. Real numbers only.
- **Logo marquee, if any:** ≥40s a loop, pauses on hover and focus, static on reduced motion, duplicates `aria-hidden`.
- **Navigation:** a sticky bar condenses with a transform, not a layout change; cross-page crossfade via `@view-transition`.
- **Reduced motion handled:** decorative motion off, content complete (9 of 10 sampled SaaS homepages do).
- **Stack:** plain CSS or Motion (React); WebGL only for a brand-owned hero.

## Tells
Every row of `bans.md` applies; landing pages are where most of them show up.

## Spec cheatsheet
- Hero: total ≤1200ms, each element ≤400ms, steps 60–100ms apart, at most 3 steps.
- Reveal: `animation-range: entry 0% entry 60%`, travel ≤16px, opacity from 0, ≤ 2 `.reveal` a page, serving the one idea.
- Demo loop: 6–15s, starts on view, stops off-view, muted, `playsinline`, poster frame.
- Theme: `springy` or `smooth`; the app behind the CTA keeps its own.
- Dependencies: CSS covers this page; GSAP or Motion only for a real timeline or gesture.
