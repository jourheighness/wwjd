---
name: wwjd
description: What Would Johannes Do. An opinionated UI/UX rule set and design workflow that designs, builds, reviews and polishes interfaces, covering landing pages, editorial and docs, product apps, dashboards, chat and AI assistant panels, commerce, forms, onboarding and mobile. Use before adding or changing any user-facing screen, panel, component, layout, styling or UI copy, and for mockups, DESIGN.md or UI review.
compatibility: Scripts need Node 20.10+ and bash; screenshots need Playwright (npx). Works in any agent that can read files; hooks and the critic agent are Claude Code extras.
---

# What Would Johannes Do

Johannes's rules for building interfaces. The aim is that a decision made once stays made: nobody has to come back and undo your choices. Most rules here began as a correction he had to give more than once.

The rules are opinions backed by use, not physics. If a rule would make a specific case worse for the person using the product, say so, propose the exception, and apply it only once it is agreed. Never apply a rule silently against its own purpose.

## 1. Start here, every time

1. **Load context:**
   - Read the user profile at `$WWJD_PROFILE`, or `~/.config/wwjd/profile.md` if that is unset (workflow and locale). Then read the project's own files: `DESIGN.md`, `PRODUCT.md`, the decision log (`docs/decisions/` or similar), and the UI sections of `AGENTS.md` or `CLAUDE.md`.
   - Find the kit: the shared component package, its tokens, and its workshop (Storybook or similar). Recorded decisions must survive this session.
2. **Pick the register** from the table in section 4, using the surface you are working on, not the product as a whole. State it in one line ("Register: Persuade, pricing page"). For a hybrid, the outer register owns the frame and the inner one owns its region.
3. **Pick the command** from the table in section 5 and read its file before acting.
4. **Precedence**, highest first:
   1. **The floor** (section 2). Nothing overrides it.
   2. **The project's recorded decisions and `DESIGN.md`.** Follow its brand (colour, type, radius, density, voice) and its dated decisions.
   3. **The wwjd rules.** The more specific file wins: register and command files refine this file for their scope.
   4. **The user profile**, for workflow and locale only. It never overrides a design rule.

   Where the project's existing UI breaks these rules, apply the rules inside the scope you are touching. Flag everything else and fix it only when asked. Name every conflict; never resolve one silently.

## 2. The floor

- **Access:**
  - Contrast meets WCAG AA. Focus is visible, with a ring of at least 3:1.
  - Zoom is never disabled. Targets are at least 24px on desktop, 44pt on iOS and 48dp on Android.
  - Colour never carries meaning alone. Links inside running text are underlined.
  - Reduced motion is respected.
  - Text may wrap or the UI may grow; nothing clips at 200% zoom or with text-spacing overrides.
  - Anything shown in a tooltip is reachable on focus and tap; a disabled control that explains itself uses `aria-disabled` and stays focusable. Essential information never lives only in a tooltip.
  - Every drag has a non-drag alternative (keyboard on resize separators, a close button on sheets).
  - Scrollable regions (code blocks, wide tables) are focusable and labelled.
- **Stability:** nothing shifts, jumps, re-sorts or reflows unless the person caused it.
- **Honesty:** no dark patterns. That means no fake urgency or scarcity, no pre-ticked add-ons, no confirmshaming, no hidden costs. No invented proof, people or numbers. Legal, consent, pricing and safety text always stays. Legal links (imprint, privacy, cookie settings, accessibility statement) always stay.
- **Reversibility:** money, legal commitments, account deletion and anything sent to other people get an explicit review step. Everything else is undoable. Undo stays available until the next action (not a 5-second race), is announced (`role=status`) and is reachable by keyboard; if the data layer has no undo, hide at once and commit when the undo expires or the person moves on.
- **Data:** judge UI only with realistic data, never with broken or placeholder data.

## 3. The rules

**Remove before adding**
- Every element earns its place where it sits. Removing makes a screen better more often than adding does.
- No text that explains, narrates or reassures the interface ("This page shows…", "Nothing is ever lost", "Click here to start…"). If the UI needs a caption, redesign it. One sentence at most where text is truly needed.
- Nothing twice: no two controls for one job, no repeated status, no duplicate path to the same place.
- Every number must change a decision. Otherwise use a dot, a progress mark, or nothing. No "3 of 13", no zero counts, no pressure counts. Proof numbers on a landing page and prices in commerce do change decisions. Counts that are decision inputs stay: search results, remaining characters, cart items, unread.
- Labels are short: a verb plus its target. Use sentence case and the product's words, never system words.
- Build what was asked for. Designing every state is part of the job, not an addition.
- **The intended flow comes first; the backend never shrinks it.** Design and build every step, state and transition of the right experience, even where the API or data layer can't do it yet (undo, a field, an endpoint, presence, a bulk action): build against a small named adapter with a local stub, fixture or optimistic implementation, marked `// TODO(api): …`. Never fall back to the worse pattern (keeping `confirm()` because there is no undo). Real wiring waits, or ask "build now or later?".

**One system**
- Use the project's kit and tokens. A missing look becomes a variant in the kit, never a one-off on the page.
- The same job gets the same component, everywhere. A better pattern replaces the old one across the scope, never sits next to it.
- Decide what is global (shell, navigation, header anatomy, grid, spacing) before laying out what is local. Related components mirror each other's slots and order.
- Use the established pattern or mature package before inventing one. Fix the pattern, not the one instance in front of you.
- Use the user's words for surfaces literally (see the glossary): a drawer is not a rail.

**Layout**
- Work on a grid. Content aligns to the column edges, and a container's surface and padding bleed into the gutter, so a card's text lines up with the text above it.
- Left-align by default, with one left edge per column and no zig-zag reading. The register files name the few centred moments.
- Never reserve a slot for something that is absent. Design for the longest real string: wrapping, truncation and translation must not break alignment.
- Spacing comes from the scale only. No cards inside cards.

**Actions and disclosure**
- Each region gets one primary action and one secondary. A tertiary is allowed only when you can say why. Everything else goes behind ⋯, a hover toolbar or the detail view. Never five actions on one card.
- Show the next action, not every action. Details, reasons and history go one step away: tooltip, popover, drawer or drill-in.
- The whole row or card is the click target. What is pressable looks pressable; what is not, never does.
- Default instead of asking. Undo instead of "are you sure": remove `confirm()`. The floor sets how undo behaves and names the exceptions.

**Stable under the hand**
- State changes only on intent. Looking, hovering and scrolling change nothing.
- Scroll and focus move only when the person acts. Overlays never cover the thing being worked on.
- Motion explains a change, or it goes, and it is interruptible. Animate transform and opacity; colour on hover and `grid-template-rows` for height are the allowed exceptions. Never width, height, top, left, margin or padding.

**Visual**
- Colour means attention: no signal, no colour. A needs-you signal must still be findable at a glance.
- Text stays ink. Surfaces separate by a step in contrast before borders or shadows. Flat by default: no decorative gradients, glass or glow.
- When both light and dark ship, each gets real care.
- Reach the bar of the best product in this register and category. Production-grade, never "tame": a minimal bolt-on onto the old thing.

**States and flow**
- Design every state: first use, one item, many, the longest real text, empty, error, loading (a skeleton), no permission.
- Every flow gets from A to B with an obvious next step. No dead ends, no dead clicks, no circular paths. It ends on the result.

## 4. Registers

| Register | The visitor… | Signals | Read |
|---|---|---|---|
| Persuade | decides and acts | landing, hero, pricing, waitlist, campaign | `registers/persuade.md` |
| Showcase | experiences the work | portfolio, case study, gallery | `registers/showcase.md` |
| Editorial | reads to the end | article, essay, blog, report, newsletter | `registers/editorial.md` |
| Reference | finds the answer | docs, API reference, changelog, help | `registers/reference.md` |
| Operate | completes a task | app screens, editor, admin, settings, CRUD | `registers/operate.md` |
| Monitor | knows the state in 5 seconds | dashboard, analytics, metrics, ops | `registers/monitor.md` |
| Converse | works through dialogue | chat, assistant, agent panel, copilot | `registers/converse.md` |
| Transact | buys with confidence | store, product page, cart, checkout | `registers/transact.md` |
| Flow | finishes a sequence | signup, onboarding, auth, wizard, long form | `registers/flow.md` |

**Platform overlay:** for mobile or native apps, also read `registers/native.md`.

## 5. Commands

| Command | When | Read |
|---|---|---|
| explore | new screen, flow or page; "show me options" | `commands/explore.md` |
| build | implement an approved mockup, Figma frame or decision | `commands/build.md` |
| critique | "review", "what's wrong", UX review, persona test | `commands/critique.md` |
| audit | accessibility, performance, responsive, lint | `commands/audit.md` |
| polish | final pass before handing over | `commands/polish.md` |
| distill | "too busy", "simplify", "clean up", removal pass | `commands/distill.md` |
| prioritize | too many actions, unclear hierarchy, affordance | `commands/prioritize.md` |
| clarify | labels, UI copy, errors, empty states | `commands/clarify.md` |
| layout | alignment, grid, spacing, wrapping | `commands/layout.md` |
| typeset | type scale, rhythm, measure, numbers | `commands/typeset.md` |
| colour | palette, themes, contrast, status colour | `commands/colour.md` |
| animate | motion and transitions | `commands/animate.md` |
| harden | states, worst-case data, errors, i18n | `commands/harden.md` |
| adapt | responsive, mobile, native, platform | `commands/adapt.md` |

A small change in existing UI needs no command file. Apply the rules, then run the handover check (section 6).

**References:**
- `references/bans.md`: bans and what to do instead
- `references/faux-pas.md`: the full catalogue of UX mistakes, by category
- `references/examples.md`: before and after
- `references/glossary.md`: terms used here

## 6. Handover check

1. Re-check section 3 against the screen: strings, numbers, actions, edges, sameness, stability, colour.
2. Check light and dark, the narrow width, the empty state and the longest real text.
3. Run `scripts/ui-check.mjs --register <register>` (in this skill's folder) on the changed files. Fix each finding or justify it.
4. Look at the actual render yourself: `scripts/shoot.sh` or any screenshot tool. Another agent's report is not evidence.
5. List every mocked API (`TODO(api)`) with what the backend must provide, and ask "build now or later?".

**Show first, review after.** Never make the user wait on a review to see the work: hand over the link, screenshots and what changed right away, and let any critic or long verification run in the background and report after. Cold critics and long gates are for big autonomous loops; with the user actively working, skip them unless asked.

## 7. Corrections become rules

- When the user says "rule", "always", "never", or gives the same correction twice, write it down the same turn: dated, with their words quoted.
- Project rules go in the project's decision log or `DESIGN.md`. A correction that should hold across projects is proposed as a change to the wwjd skill, never stored in the profile.
- If it conflicts with an earlier rule, the newest wins: mark the old one superseded. Help phrase it when the user is reaching for the words.
