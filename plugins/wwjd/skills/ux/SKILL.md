---
name: ux
description: 'UI/UX design rules and workflow (What Would Johannes Do). ALWAYS use before building, changing, simplifying or reviewing any user-facing UI: screens, pages, panels, components, layouts, settings, tables, forms, dashboards, landing pages, docs sites, chat panels, checkout, dark mode, styling, UI copy, empty and error states, in any stack. Also sets up a UI baseline (DESIGN.md, PRODUCT.md, kit). Not for build config, CSS tooling errors, API docs, schemas, migrations or data analysis.'
when_to_use: '"redesign this", "clean up the settings page", "this looks busy", "make it bolder", "review this screen", a UI screenshot.'
compatibility: scripts need Node 20.10+, no dependencies; render.mjs needs Playwright.
---

# What Would Johannes Do
wwjd owns the design side: how a product looks, flows and reads is decided here, with the person, before code. If a rule would hurt this case, say so, propose the exception, apply once agreed.

## Gotchas
- Settings graded as a `drawer`: name the job first; configure and review are expose surfaces.
- Essentials in tooltips (Floor: never).
- Static mocks for an interaction concept: make them clickable.
- Inline Undo in a row or field: undo lives in the toast. A settings toggle gets neither; it just applies.
- One home read as deleting the setting: it keeps its row.
- A mock for a renderer with limits (a mod sidebar, PDF, email, native): use only parts that renderer can draw, checked before any variant is shown.
- An interrupt is a new direction, not a stop: take it, no recap of what was cut off.
- A fresh ask beats an older project decision: name the clash in one line, do the ask, mark the old one superseded.

## 0. Entry (once per session)
1. Run `node <skill>/scripts/wwjd.mjs status`; it prints the dials (`references/dials.md`; never the Floor).
2. Read what it lists: PRODUCT.md; DESIGN.md prose in full; RATCHET.md Gotchas, Tells, `[design]`; decision-log lines naming the surface; 1-2 golden files; your taste file and profile. Never imitate `legacy`.
3. Missing file: create only when needed, short, vetoable (PRODUCT.md if register or type would be guessed; RATCHET.md to park a finding; no DESIGN.md: `wwjd:look` quick mode). Never block on a question.
4. Name the register ("Register: Operate, settings"), read `registers/<name>.md`, and route:

| Situation | Do (`commands/<verb>.md`) |
|---|---|
| `scratch`, "make me a...", a new project | `start` (§0 asks how to begin first), then what they chose |
| add a component or screen; messy screen in scope | `build` |
| "busy", "simplify", "clean up" | `simplify` |
| "review", "what's wrong", screenshot | `review` |
| "options", "show me", new flow; "redesign", "start over" | `explore` |
| `messy` + broad ask, debt | `audit` |
| small change | rules + loop only |

While the Flow setting is on (status says), new apps and new screens go through `wwjd:flow` first (writes `wwjd.flow.json` and checks it).

## 1. Precedence
Floor > project DESIGN.md + decision log > taste file (yours) > dials > wwjd (more specific file wins) > user profile (workflow, locale only). Old UI breaking rules: fix in scope, flag the rest.

## 2. Floor
- **Access:** AA contrast; visible focus ring >=3:1; zoom never disabled; targets >=24px web, 44pt iOS, 48dp Android; colour never alone; links in running text underlined; reduced motion respected; nothing clips at 200% zoom or text-spacing overrides; tooltips work on focus and tap, never hold essentials; explained disabled controls are `aria-disabled`, focusable; every drag has a non-drag path; scrollable regions focusable and labelled.
- **Stability:** nothing shifts, jumps, re-sorts or reflows unless the person caused it.
- **Honesty:** no fake urgency or scarcity, pre-ticked add-ons, confirmshaming, hidden costs, invented proof, people or numbers. Legal, consent, pricing, safety text and legal links stay. Leaving takes no more steps than joining.
- **Reversibility:** money, legal commitments, account deletion, anything sent to others: a review step. All else undoable: undo lasts until the next action, announced (`role=status`), keyboard-reachable; no API undo: hide now, commit on expiry. **Undo is a toast:** in a work tool every discrete edit, delete or bulk change gets one Undo toast (what changed, Undo), the next replacing it, never covering the work; never an inline Undo in the row or field. A setting or preference just applies, silent and announced (`role=status`). Continuous typing autosaves with a quiet status, no toast.
- **Data:** judge UI only with realistic data.

## 3. Rules (how: `rules/*.md`)
**Remove before adding.** No explaining or reassuring text; needing a caption means redesign. Nothing twice. **Grade every fact:** decides, delights, or nothing (cut it); unequal facts never equal weight. **Surface budgets** (`references/budgets.md`, grade gate there): overflow on a budget surface is thrown away or moved one step away, and the handover says where. **Expose by job:** configure, review, compare, bulk edit, audit and inspect show everything the job needs, organised by sections, anchors, search and frozen headers; disclose only the rare, destructive or dependent. **Intended flow first:** the backend never shrinks it; a named adapter marked `// TODO(api): ...`, never the worse pattern.

**One system.** Kit and tokens (`commands/build.md`). Same job, same component; a better pattern replaces the old across the scope. Before hand-building an editor, picker, chart or date input, name the package rejected and why. The user's surface words literally (glossary).

**Layout.** Content on column edges; surface and padding hang in the gutter. Start-aligned, one left edge. No cards in cards; no lone item on its own row. **The identifier never disappears:** wraps, never ellipsis.

**Actions.** One primary + one secondary per region, the rest in ⋯, a hover toolbar or detail. **Action stays with its context.** **One target, one behaviour.** Only pressable looks pressable. **One home per state:** one control and one mark; elsewhere shows it, never repeats it. Default, not asking; undo, not "are you sure".

**Stable under the hand.** State changes only on intent, and touch only what changed: same box and height. Scroll and focus move only on action; overlays never cover the work.

**Visual.** Colour means attention; needs-you findable at a glance. Ink text; contrast steps before borders or shadows; flat. Handover names 1 benchmark product and the move taken from it. **Calm is not bare:** fewer elements, each designed.

**States and flow.** Build what was asked; every state is part of it: first use, one, many, longest, empty, error, loading, no permission. A to B, no dead ends, ends on the result.

## 4. Registers (`registers/<name>.md`)
Persuade: landing, hero, pricing · Showcase: portfolio, case study · Editorial: article, blog, report · Reference: docs, API, help · Operate: app, admin, settings · Monitor: dashboard, ops · Converse: chat, agent panel · Transact: store, checkout · Flow: signup, wizard. Mobile/native: plus `native.md`. Hybrid: outer frames, inner owns its region.

## 5. Loop
- **Show** the smallest renderable slice with realistic data; hand over the link and what changed at once.
- **Log as you go:** each assumption and each choice nobody asked for: one `mcp__wwjd__log` call, a 2–6 word `title` (the sidebar row: what to know at a glance) plus the line in the past tense and plain words, with typed `proof` (kinds in the tool), plus `screen` (its id in `wwjd.flow.json`), `aspect` (`ux` how it works, `ui` how it looks) and `task` (the same words for every entry of one task) when known; `path` when the project edited is not the session's folder. When a wwjd rule changes what you were about to do, a `save`: what it kept you from ("putting the price in a tooltip") and the rule's name. No tool: one JSON line per item in `.wwjd/decisions.jsonl`, the same fields plus `id` and `at` (ISO time).
- **Canvas:** on with a `canvas` in `.wwjd.json` (status says): each handover puts its screens and decisions on it (`../flow/references/canvas.md`).
- **Checks** per the Strictness dial (`references/dials.md`); hooks enforce them unless Hooks is quiet or off; the checks are owed either way. Hooks see Edit and Write: change UI files with those, never through Bash or a script. Shoot every new state (focus, hover, editing, open popover) zoomed, both themes, before any "checked"; a check that could not run is reported as not run. A Design canvas (`.dc.html`) renders only in its canvas: no shots or fit; say it was looked at there. Handover lists each `TODO(api)`.
- **React:** change only what was named. Same correction twice: 3 structurally different options or one question with a default. A bug reported twice means the check that passed it looked at the wrong thing (a still of motion, the wrong surface, before data loaded): find that first.
- **Hand over short:** outcome first, then only what needs the person (≤ ~120 words, bullets). The rest lives in the canvas, the log or the files.

## 6. Corrections become rules
"rule", "always", "never" or a repeated correction: write it that turn, dated, quoted. This project: decision log or DESIGN.md; every project: your taste file (`~/.config/wwjd/taste.md`); work: RATCHET.md Backlog `[design]`. The person corrects logged decisions in the `/wwjd` sidebar. Newest wins; mark the old superseded. Cross-project: propose a wwjd change, a principle plus one example.

## 7. Lookups
`references/`, one at a time; `layouts.md` index then one `### id`, `product-types.md` one block.
