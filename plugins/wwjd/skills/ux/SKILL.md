---
name: ux
description: 'UI/UX design rules and workflow (What Would Johannes Do). ALWAYS use before building, changing, simplifying or reviewing any user-facing UI: screens, pages, panels, components, layouts, settings, tables, forms, dashboards, landing pages, docs sites, chat panels, checkout, dark mode, styling, UI copy, empty and error states, in any stack. Also sets up a UI baseline (DESIGN.md, PRODUCT.md, kit). Not for build config, CSS tooling errors, API docs, schemas, migrations or data analysis.'
when_to_use: '"redesign this", "clean up the settings page", "this looks busy", "make it bolder", "review this screen", "build a dashboard", "add a component", "fix the layout on mobile", a UI screenshot.'
---

# What Would Johannes Do
If a rule would hurt this case, say so, propose the exception, apply once agreed.

## Gotchas
- Settings graded as a `drawer`: name the job first; configure and review are expose surfaces.
- Essentials in tooltips (Floor: never).
- Static mocks for an interaction concept: make them clickable.
- Inline Undo after one visible own edit (Floor: Reversibility).
- "Checked" with no shot of focus, hover, both themes.
- One home read as deleting the setting: it keeps its row.

## 0. Entry (once per session)
1. Run `node <skill>/scripts/wwjd.mjs status`; it prints the dials (`references/dials.md`; never the Floor).
2. Read what it lists: PRODUCT.md; DESIGN.md prose in full; RATCHET.md Gotchas, Tells, `[design]`; decision-log lines naming the surface; 1-2 golden files; your taste file and profile. Never imitate `legacy`.
3. Create a missing file only when needed, short, vetoable: PRODUCT.md if register or type would be guessed; RATCHET.md to park a finding; no DESIGN.md: `wwjd:look` quick mode first. Never block showing work on a question.
4. Name the register ("Register: Operate, settings"), read `registers/<name>.md`, and route:

| Situation | Do (`commands/<verb>.md`) |
|---|---|
| `scratch`, "make me a...", no DESIGN.md | `start`, `wwjd:look` (quick mode), then explore or build |
| add a component or screen; messy screen in scope | `build` |
| "busy", "simplify", "clean up" | `simplify` |
| "review", "what's wrong", screenshot | `review` |
| "options", "show me", new flow | `explore` |
| `messy` + broad ask, debt | `audit` |
| small change | rules + loop only |

## 1. Precedence
Floor > project DESIGN.md + decision log > taste file (yours) > dials > wwjd (more specific file wins) > user profile (workflow, locale only). Old UI breaking rules: fix in scope, flag the rest.

## 2. Floor
- **Access:** AA contrast; visible focus ring >=3:1; zoom never disabled; targets >=24px web, 44pt iOS, 48dp Android; colour never alone; links in running text underlined; reduced motion respected; nothing clips at 200% zoom or text-spacing overrides; tooltips work on focus and tap, never hold essentials; explained disabled controls are `aria-disabled`, focusable; every drag has a non-drag path; scrollable regions focusable and labelled.
- **Stability:** nothing shifts, jumps, re-sorts or reflows unless the person caused it.
- **Honesty:** no fake urgency or scarcity, pre-ticked add-ons, confirmshaming, hidden costs, invented proof, people or numbers. Legal, consent, pricing, safety text and legal links stay. Leaving takes no more steps than joining.
- **Reversibility:** money, legal commitments, account deletion, anything sent to others: a review step. All else undoable: undo lasts until the next action, announced (`role=status`), keyboard-reachable; no API undo: hide now, commit on expiry. A visible single-field edit of the person's own data saves silently (announced); undo: Esc, then Cmd/Ctrl+Z; visible Undo only for deletes, bulk changes and what others see.
- **Data:** judge UI only with realistic data.

## 3. Rules (how: `rules/*.md`)
**Remove before adding.** No explaining or reassuring text; needing a caption means redesign. Nothing twice. **Grade every fact:** decides, delights, or nothing (cut it); unequal facts never equal weight. **Surface budgets** (`references/budgets.md`, grade gate there): overflow on a budget surface is thrown away or moved one step away, and the handover says where. **Expose by job:** configure, review, compare, bulk edit, audit and inspect show everything the job needs, organised by sections, anchors, search and frozen headers; disclose only the rare, destructive or dependent. Build what was asked; every state is part of it. **Intended flow first:** the backend never shrinks it; a named adapter marked `// TODO(api): ...`, never the worse pattern.

**One system.** Kit and tokens (`commands/build.md`). Same job, same component; a better pattern replaces the old across the scope. Before hand-building an editor, picker, chart or date input, name the package rejected and why. The user's surface words literally (glossary).

**Layout.** Content on column edges; surface and padding hang in the gutter. Start-aligned, one left edge. No cards in cards. **The identifier never disappears:** wraps, never ellipsis.

**Actions.** One primary + one secondary per region, the rest in ⋯, a hover toolbar or detail. **Action stays with its context.** **One target, one behaviour.** Only pressable looks pressable. **One home per state:** one control and one mark; elsewhere shows it, never repeats it. Default, not asking; undo, not "are you sure".

**Stable under the hand.** State changes only on intent, and touch only what changed: same box and height. Scroll and focus move only on action; overlays never cover the work.

**Visual.** Colour means attention; needs-you findable at a glance. Ink text; contrast steps before borders or shadows; flat. Handover names 1 benchmark product and the move taken from it. **Calm is not bare:** fewer elements, each designed. Long-familiar surfaces: behaviour before looks; a 50ms glance must read "better", not "different".

**States and flow.** First use, one, many, longest, empty, error, loading, no permission. A to B, obvious next step, no dead ends or circles, ends on the result.

## 4. Registers (`registers/<name>.md`)
Persuade: landing, hero, pricing · Showcase: portfolio, case study · Editorial: article, blog, report · Reference: docs, API, help · Operate: app, admin, settings · Monitor: dashboard, ops · Converse: chat, agent panel · Transact: store, checkout · Flow: signup, wizard. Mobile/native: plus `native.md`. Hybrid: outer register frames, inner owns its region; never a journey in one page.

## 5. Loop
- **Show** the smallest renderable slice, realistic data; hand over link + what changed at once, never after a review. Owner live: say where to look; no hot-reload mid-test.
- **Log as you go:** each assumption and each choice nobody asked for: one `mcp__wwjd__log` call. No tool: one line `{"surface","kind","text","why"}` in `.wwjd/decisions.jsonl`.
- **Checks** per the Strictness dial (`references/dials.md`); hooks enforce them. Every new state (focus, hover, editing, open popover) is shot zoomed in both themes before any "checked" claim; a check that could not run is reported as not run. Handover lists each `TODO(api)`.
- **React:** change only what was named, keep what they liked; pick by letter. Same correction twice: 3 structurally different options or one question with a default. No scores.

## 6. Corrections become rules
"rule", "always", "never" or a repeated correction: write it that turn, dated, quoted. This project: decision log or DESIGN.md; every project: your taste file (`~/.config/wwjd/taste.md`); work: RATCHET.md Backlog `[design]`. The person corrects logged decisions in the `/wwjd` sidebar. Newest wins; mark the old superseded. Cross-project: propose a wwjd change, a principle plus one example.

## 7. Lookups
`references/`, one at a time; `layouts.md` index then one `### id`, `product-types.md` one block.
