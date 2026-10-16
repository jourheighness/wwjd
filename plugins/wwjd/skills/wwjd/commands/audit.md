# audit: technical quality

This audit is measurable: accessibility, performance, responsiveness and lint. Run `critique` for design judgement; run this for facts.

## Steps
1. **Static:** `scripts/ui-check.mjs --register <register>` (in this skill's folder) on the changed paths. Every finding is fixed, or justified with `ui-check-ignore: <reason>`.
2. **Render** at 320, 390, 768, 1440 and 1920, in light and dark (`scripts/shoot.sh`, or any headless browser). Check 200% zoom and text-spacing overrides in a real browser; `shoot.sh` doesn't zoom.
3. **Runtime checks** in a headless browser:
   - **Horizontal overflow:** `document.documentElement.scrollWidth > innerWidth`, at every width.
   - **Clipped text:** elements with `scrollWidth > clientWidth` while `overflow` is visible.
   - **Hit targets:** below the floor's sizes.
   - **Layout shift:** CLS from a `PerformanceObserver` is 0 after hovering every row, opening every tab and toggling the theme. Diff `getBoundingClientRect()` before and after each hover.
   - **Focus:** Tab through the page. Every stop is visible, and none is hidden under sticky chrome.
   - **Reduced motion:** emulate `prefers-reduced-motion: reduce`, and no transform animation remains.
   - **Images:** every image has dimensions and loads; none is broken.
4. **Accessibility:**
   - **Contrast:** AA for text; 3:1 for UI parts, icons and focus rings.
   - **Semantics:** headings never skip a level; landmarks; labels on every control; `aria-label` on icon-only buttons.
   - **Keyboard:** every flow works. Roving focus inside tabs and menus. Esc closes overlays.
   - **Live regions:** announce status changes once, as a phrase.
5. **Performance** (Persuade, Showcase, Editorial, Reference, Transact, Flow):
   - LCP under 2.5s on a mid-range phone.
   - The LCP image is preloaded.
   - At most 2 font files above the fold, with metric-matched fallbacks.
   - Images in modern formats with set dimensions.
   - No layout shift as the page loads.
6. **Responsive:** `adapt.md` checks.

## Report
- **Score** each area 0–4: accessibility, performance, responsive, theming, anti-patterns.
- **Severity:**
  - **P0:** blocks the task.
  - **P1:** a major issue or a WCAG AA failure.
  - **P2:** a workaround exists.
  - **P3:** polish.
- **List P0 and P1 with `file:line` fixes.** A clean audit proves the absence of these defects, not quality.
