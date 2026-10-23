---
name: ux
description: 'UI/UX design rules and workflow (wwjd). Use before building, changing, simplifying or reviewing any user-facing UI in any stack: screens, components, layouts, forms, tables, settings, dashboards, landing pages, docs, chat panels, checkout, styling, UI copy, empty and error states. Not for build config, API docs, schemas or data analysis.'
when_to_use: '"redesign this", "clean up the settings page", "this looks busy", "review this screen", a UI screenshot.'
compatibility: scripts need Node 20.10+, no dependencies; render.mjs needs Playwright.
---

# wwjd
wwjd owns the design side: how a product looks, flows and reads is decided here, with the person, before code. If a rule would hurt this case, say so, propose the exception, apply it once agreed.

## Gotchas
- Settings budgeted as a `drawer`: name the job first; configure and review are exposure surfaces (`references/budgets.md`).
- A mock for a renderer with limits (email, PDF, native, a host app's panel): use only parts it can draw; check before showing any variant.
- An interrupt is a new direction, not a stop: take it, no recap of what was cut off.
- A fresh ask beats an older project decision: name the clash in one line, do the ask, mark the old decision superseded.

## 0. Entry (once per session)
1. Run `node <skill>/scripts/wwjd.mjs status`; it prints the dials (`references/dials.md`; the Floor is never a dial).
2. Read what it lists: PRODUCT.md; DESIGN.md prose; RATCHET.md Gotchas, Tells, `[design]`; decision-log lines naming the surface; 1–2 golden files; taste file and user profile. Never imitate `legacy` files.
3. Missing file: create it only when needed, short and vetoable (PRODUCT.md when register or type would be guessed; RATCHET.md to park a finding; DESIGN.md: `wwjd:look` quick mode). Never block on a question.
4. Name the register ("Register: Operate, settings"), read `registers/<name>.md`, and route:

| Situation | Do (`commands/<verb>.md`) |
|---|---|
| `scratch`, "make me a...", a new project | `start` (§0 asks how to begin first), then what they chose |
| add a component or screen; messy screen in scope | `build` |
| "busy", "simplify", "clean up" | `simplify` |
| "review", "what's wrong", screenshot | `review` |
| "options", "show me", new flow; "redesign", "start over" | `explore` |
| `messy` + broad ask, debt | `audit` |
| a piece people watch (story hero, explainer, launch film, scroll story) | `wwjd:motion-design` first, before any animation code |
| small change | rules + loop only |

Flow setting on (status says): new apps and screens go through `wwjd:flow` first.

## 1. Precedence
Floor > project DESIGN.md + decision log > taste file > dials > wwjd (more specific file wins) > user profile (workflow, locale only). Old UI breaking a rule: fix it in scope, flag the rest. A named layout, nav model, component recipe or voice is a default picked from the job: another product type, platform or DESIGN.md may pick another, named in the handover. The Floor and §3's principles hold everywhere.

## 2. Floor
- **Access:** AA contrast; visible focus ring >=3:1; zoom never disabled; targets >=24px web, 44pt iOS, 48dp Android; colour never alone; links in running text underlined; reduced motion respected; nothing clips at 200% zoom or text-spacing overrides; tooltips work on focus and tap, never hold essentials; explained disabled controls are `aria-disabled`, focusable; every drag has a non-drag path; scrollable regions focusable and labelled.
- **Stability:** nothing shifts, jumps, re-sorts or reflows unless the person caused it.
- **Honesty:** no fake urgency or scarcity, pre-ticked add-ons, confirmshaming, hidden costs, invented proof, people or numbers. Legal, consent, pricing, safety text and legal links stay. Leaving takes no more steps than joining.
- **Reversibility:** money, legal commitments, account deletion and anything sent to others get a review step. All else is undoable until the next action, announced (`role=status`), keyboard-reachable. Discrete edits in a work tool get one Undo toast, never an inline Undo; a setting just applies; typing autosaves (`rules/actions.md` § Defaults and undo).
- **Data:** judge UI only with realistic data.

## 3. Rules (the how: the file named)
- **Remove before adding** (`commands/simplify.md`): no explaining or reassuring text; nothing twice. Needing a caption means redesign.
- **Grade and budget** (`references/budgets.md`): every fact decides, delights or goes; budget surfaces move overflow one step away (the handover says where); exposure surfaces show everything the job needs, organised.
- **Intended flow first:** the backend never shrinks it; a `// TODO(api): ...` adapter, never the worse pattern.
- **One system** (`commands/build.md`): kit and tokens; same job, same component; the person's surface words, literally (`references/glossary.md`).
- **Layout** (`rules/layout.md`): content on column edges, chrome in the gutter; no cards in cards; the identifier wraps, never ellipsis.
- **Actions** (`rules/actions.md`): one primary + one secondary per region; one target, one behaviour; default, not asking; undo, not "are you sure".
- **Stable under the hand** (`rules/states.md`): change only on intent, only what changed; one home per state; overlays never cover the work.
- **Visual** (`rules/visual.md`): colour means attention; tone steps before borders; calm is fewer parts, each designed. The handover names 1 benchmark product and the move taken from it.
- **States and flow** (`rules/states.md`): first use, one, many, longest, empty, error, loading, no permission are part of every ask; no dead ends; end on the result.
- **Copy** (`rules/copy.md`): verb + target labels, the product's terms, no AI tells.

## 4. Registers (`registers/<name>.md`)
Persuade: landing, hero, pricing · Showcase: portfolio, case study · Editorial: article, blog, report · Reference: docs, API, help · Operate: app, admin, settings · Monitor: dashboard, ops · Converse: chat, agent panel · Transact: store, checkout · Flow: signup, wizard. Mobile/native: plus `native.md`. Hybrid: outer frames, inner owns its region.

## 5. Loop
- **Show** the smallest renderable slice with realistic data; hand over the link and what changed at once.
- **Log as you go:** one `mcp__wwjd__log` call per assumption or choice nobody asked for; a `save` when a wwjd rule changed what you were about to do. No tool: one JSON line per item in `.wwjd/decisions.jsonl` (`id`, `at` ISO time, `kind`, `surface`, `title` of 2–6 words, `text` in past tense, `why`, `proof`).
- **Canvas** (a `canvas` in `.wwjd.json`): each handover puts its screens and decisions on it (`../flow/references/canvas.md`).
- **Checks** per the Strictness dial (`references/dials.md`); they are owed even when Hooks is quiet or off. Hooks see Edit and Write only: change UI files with those, never through Bash or a script. Shoot every new state (focus, hover, editing, open popover) zoomed, both themes, before any "checked"; report a check that could not run as not run. A Design canvas (`.dc.html`) gets no shots or fit: say it was looked at in its canvas. The handover lists each `TODO(api)`.
- **React:** change only what was named. Same correction twice: 3 structurally different options or one question with a default. A bug reported twice: first find why the passing check missed it (a still of motion, the wrong surface, before data loaded).
- **Hand over short:** outcome first, then only what needs the person (≤ ~120 words, bullets). The rest lives in the canvas, the log or the files.

## 6. Corrections become rules
"rule", "always", "never" or a repeated correction: write the rule that turn, dated, the person's words quoted. This project: decision log or DESIGN.md; every project: the taste file (`~/.config/wwjd/taste.md`); later work: RATCHET.md Backlog `[design]`. Newest wins; mark the old superseded. Cross-project: propose a wwjd change, a principle plus one example.

## 7. Lookups
Load one file and one section at a time: `references/layouts.md` index, then one `### id`; `references/product-types.md` one block.
