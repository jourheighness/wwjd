---
name: wwjd
description: What Would Johannes Do. Opinionated UI/UX rules and workflow. Use before building, changing, simplifying or reviewing any user-facing screen, panel, component, layout, styling or UI copy (landing, docs, apps, dashboards, chat, commerce, forms, onboarding, mobile), and to set up or clean up a UI baseline (DESIGN.md, PRODUCT.md, kit).
---

# What Would Johannes Do
Opinions backed by use. If a rule would hurt this case, say so, propose the exception, apply once agreed.

## 0. Entry (once per session)
1. Run `node <skill>/scripts/wwjd.mjs status`; it also prints the dials (`references/dials.md`), which tune effort and boldness, never the Floor.
2. Read what it lists: PRODUCT.md; DESIGN.md prose (Named rules, Do's/Don'ts in full); RATCHET.md Gotchas, Tells, `[design]`; decision-log lines naming the surface; 1-2 golden files; the user profile. Never imitate `legacy`.
3. Create a missing file only when needed, short, vetoable defaults: PRODUCT.md if register or product type would be guessed; RATCHET.md to park a finding; no DESIGN.md: `wwjd-look` quick mode picks a subject-grounded look before the first build. Never block showing work on a question.
4. Name the register ("Register: Operate, settings"), read `registers/<name>.md`, and route:

| Situation | Do (`commands/<verb>.md`) |
|---|---|
| `scratch`, "make me a...", no DESIGN.md | `start`, `wwjd-look` (quick mode), then explore or build |
| add a component or screen; messy screen in scope | `build` (golden first; messy: rebuild from a spec) |
| "busy", "simplify", "clean up" | `simplify` (remove *and* reorder) |
| "review", "what's wrong", screenshot | `review` |
| "options", "show me", new flow | `explore` |
| `messy` + broad ask, debt | `audit` |
| palette, fonts, shape, brand, refs | `wwjd-look` skill |
| motion, transitions, motion theme | `wwjd-animation` skill |
| small change | rules + loop only |

## 1. Precedence
Floor > project DESIGN.md + decision log > dials > wwjd (more specific file wins) > user profile (workflow, locale only). Old UI breaking rules: fix in scope, flag the rest.

## 2. Floor
- **Access:** AA contrast; visible focus ring >=3:1; zoom never disabled; targets >=24px web, 44pt iOS, 48dp Android; colour never alone; links in running text underlined; reduced motion respected; nothing clips at 200% zoom or text-spacing overrides; tooltips work on focus and tap, never hold essentials; explained disabled controls are `aria-disabled`, focusable; every drag has a non-drag path; scrollable regions focusable and labelled.
- **Stability:** nothing shifts, jumps, re-sorts or reflows unless the person caused it.
- **Honesty:** no fake urgency or scarcity, pre-ticked add-ons, confirmshaming, hidden costs, invented proof, people or numbers. Legal, consent, pricing, safety text and legal links stay. Leaving takes no more steps than joining.
- **Reversibility:** money, legal commitments, account deletion, anything sent to others: a review step. All else undoable: undo lasts until the next action, announced (`role=status`), keyboard-reachable; no API undo: hide now, commit on expiry.
- **Data:** judge UI only with realistic data.

## 3. Rules (how: `rules/<paragraph>.md`, copy: `rules/copy.md`)
**Remove before adding.** Every element earns its place. No explaining or reassuring text; needing a caption means redesign. Nothing twice. **Grade every fact:** decides, delights, or nothing (cut it); the one that settles or delights gets its own moment; unequal facts never equal weight. **Surface budgets** (`references/budgets.md`): each surface has a min–max; overflow is thrown away or moved one step away, and the handover says where. Status shows `decider: on`: `grade.mjs` once per over-budget surface, before building it. Counts: small-set progress yes; big or zero counts become a dot or nothing; decision inputs stay. Labels: verb + target, sentence case, product words. Build what was asked; every state is part of it. **Intended flow first:** the backend never shrinks it; a named adapter marked `// TODO(api): ...`, never the worse pattern.

**One system.** Kit and tokens; a missing look is a kit variant; a faulty kit component is fixed in the kit with its story, never at the call site. Same job, same component; a better pattern replaces the old across the scope. Global (shell, nav, grid, spacing) before local; related parts mirror. Mature package first. The user's surface words literally (a drawer is not a rail, panel or sheet).

**Layout.** Grid: content on column edges; surface and padding hang in the gutter. Start-aligned, one left edge; centre only when motivated, decided once per page kind. No slot for the absent; the longest real string. Scale spacing; no cards in cards. **The identifier never disappears:** wraps, never ellipsis; meta drops, then shortcuts fold into ⋯, then stack.

**Actions.** One primary + one secondary per region, a tertiary only with a reason, the rest in ⋯, a hover toolbar or detail. Next action shown; details one step away. **Action stays with its context:** a widget that informs a decision (picker, calculator) holds its CTA and carries its input into the flow. Whole row is the target; **one target, one behaviour:** one cursor, one hover and one click everywhere inside what looks like one thing. Only pressable looks pressable; an action never looks like a state. **One home per state:** each state has one control and one mark; everywhere else shows it, never repeats it. Default, not asking; undo, not "are you sure".

**Stable under the hand.** State changes only on intent, and a change touches only what changed: same box and height, nothing else hides, swaps or replays. Scroll and focus move only on action; overlays never cover the work. Motion explains a change or goes, interruptible, transform/opacity only.

**Visual.** Colour means attention; needs-you findable at a glance. Ink text; contrast steps before borders or shadows; flat, no decorative gradient, glass or glow. Both themes cared for. The bar is the category's best, never tame. **Calm is not bare:** fewer elements, each designed. Nouns show their identity (icon, logo, avatar), values show in their form, and a setting that makes something visible shows a preview of it. Long-familiar high-trust surfaces: behaviour before looks; a 50ms glance must read "better", not "different".

**States and flow.** First use, one, many, longest, empty, error, loading, no permission. A to B, obvious next step, no dead ends or circles, ends on the result.

## 4. Registers (`registers/<name>.md`)
| Register | Signals | Width | Profile |
|---|---|---|---|
| Persuade | landing, hero, pricing | 390 | marketing |
| Showcase | portfolio, case study | both | marketing |
| Editorial | article, blog, report | both | reading |
| Reference | docs, API, help | both | docs |
| Operate, Monitor | app, admin, settings; dashboard, ops | 1440 | app |
| Converse | chat, agent panel | 390 if consumer | app |
| Transact, Flow | store, checkout; signup, wizard | 390 | consumer |

Mobile/native: plus `native.md`. The other width works, composed on its own. Hybrid: outer register frames, inner owns its region; never a journey in one page.

## 5. Loop: show, react, adjust
- **Show** the smallest renderable slice, realistic data; hand over link + what changed at once, never after a review. Owner live: say where to look; no shot per change, no hot-reload mid-test.
- **Auto:** a hook runs `wwjd.mjs check <file> --new` per UI edit (vs `.wwjd-baseline.json`); no hook: run it before handover.
- **Each handover:** one `render.mjs shoot <url> --one`, read by you, not a report; `TODO(api)` list + what the backend must provide.
- **React:** change only what was named, keep what they liked; pick by letter. Two rounds no closer: 3 structurally different options or one question with a default. No scores.
- **Milestone** ("done", PR): both widths x light/dark; `render.mjs fit`, `runtime`; empty, longest text.
- **On request** ("cold review", unattended loops): wwjd-critic, personas.

## 6. Corrections become rules
"rule", "always", "never" or a repeated correction: write it that turn, dated, quoted. Rules: decision log or DESIGN.md; work: RATCHET.md Backlog `[design]`. Newest wins; mark the old superseded. Cross-project: propose a wwjd change as a general principle plus one example.

## 7. Lookups (`references/`, one at a time)
| Need | Read |
|---|---|
| over budget | `budgets.md` |
| layout, shell | `layouts.md` (index, then one `### id`) |
| app type | `product-types.md` (one block) |
| landing hero | `heroes.md` |
| AI feature | `ai.md` |
| generic look | `bans.md` |
| no kit yet | `baseline.md` |
| unclear rule | `examples.md` |
| a term | `glossary.md` |
| a dial or a nudge | `dials.md` |
