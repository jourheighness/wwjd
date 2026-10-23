# explore: options for something new

For anything that doesn't exist yet, "show me options", or a redesign (§5); small fixes skip it. Structure only: the look comes from `wwjd:look`. Count: what the person chose (`start.md` §0), else ~5 structure variants; a whole new product: ~3 directions, each with its own look. A pair asked for by feel ("one calm, one bold") is the brief, and its looks may differ beyond the Look dial.

## 1. Research before drawing
- **The best current examples of this exact job:** a few named real products at the top of this register and category, each with the move to take; verified facts kept apart from inference.
- **A mature package first:** before hand-building an editor, picker, chart or date input, name the package rejected and why.
- **Workaround features** (glossary) in the current product name the area to research first.
- **Layout candidates:** `references/layouts.md` index; the verb → layout table in `registers/operate.md`.

## 2. Plan before pixels
| Register | Plan | Variants differ in | Render first |
|---|---|---|---|
| Persuade | inventory → argument → idea sentence → copy deck | composition, type, colour proportions | hero at 1440 and 390 + the hardest section |
| Showcase | asset inventory | framing: index model, sequence, scale | first viewport + one case study |
| Editorial | text face, display face, measure, grid, furniture | type specimen on a real article | table, footnote, figure, pull quote, on a phone |
| Reference | page-type map, nav tree, search model | navigation model, density | the hardest page (API ref with code tabs) |
| Operate | flow map A → B, kit inventory | nav model, pane split, what leads, density | key screen with worst-case data |
| Monitor | the questions each view answers, data inventory | which question leads, chart forms, density | the state its model leads with (the incident for alerting) and the empty state |
| Converse | storyboard: empty → answer → stream → tool step → approval → error → long thread | placement (page, side panel, inline, command bar), how agent work shows | the storyboard, clickable |
| Transact | buy path: listing → product → cart → checkout | gallery model, buy box | product page at 390 |
| Flow | step map (one question per step), fields the system can derive | chunking: one page, stepper, progressive | longest step in its error state at 390 |

- Check every flow for dead ends and circles before drawing it (`wwjd:flow` while the Flow setting is on).
- **Must-requirements first,** one per concern, written down before any variant.

## 3. Variants
- **Lettered A, B, C…,** different in structure, never in tint. Persuade and Showcase: each pushes further than the last; Operate, Monitor, Reference: organisation changes, no decoration.
- **Interaction concepts ship clickable** (edit in place, pickers, drag) before asking "which one"; static mocks only for layout and look questions.
- **The intended flow, not today's API** (SKILL.md § 3); note what needs backend support.
- **Real material:** the project's tokens and kit, worst-case data (`rules/states.md` § Worst-case data), in place at real size beside its neighbours; light and dark when visual.
- **One comparison page** (HTML file, Artifact, story or sandbox): a letter and short name per variant, no prose on the page (reasoning goes in the message), a neutral dark surround. Cluttered: a fresh page with only the live candidates. List each variant in `.wwjd/directions.json` (`[{ "name": "A · Calm", "url": "<link>", "board": "<its frame, on a canvas>" }]`) so the `/wwjd` sidebar opens it.
- **Each variant meets every must-requirement and surface budget** (`references/budgets.md`), or it's cut; a requirement no variant meets is the brief for a new one.
- **Before sharing:** `wwjd.mjs check` on each variant's source. A Design canvas is lint only (no shots); the full checks wait for the build.

## 4. Picking
- **By letter:** "A and D", "B everywhere". Merge exactly what was named, keeping what they liked; refine until approved.
- **Record the approval** with date and comparison-page link in the decision log. That page is now the spec for `build`.

## 5. Redesign: an existing screen, from the job
"Redesign", "start over", "from scratch", "rethink": the person wants a different answer, not a tidier one; the old screen with cards moved is a miss (`references/bans.md` Tame).
- **Keeps:** the Floor; the real content and data (cut, merge, reorder, rewrite, never invent); the brand marks (name, logo, brand colours, faces); PRODUCT.md principles.
- **Sets aside:** today's layout, information architecture, navigation, components and section order. DESIGN.md tokens stay; its layouts, golden files and layout decisions are evidence, never the template.
- **Start from the job,** not the screen: the 3 things a person comes to do, in order; grade every fact from zero (`budgets.md` § Grade gate); name 3 real products that do this job best and the move taken from each.
- **3 directions, A–C,** different in what leads, how it is grouped and how you move through it: one the calmest honest version, one unrecognisable to a person who knows the old screen. Each a complete screen at 1440 and 390 with real content, never a wireframe.
- **Recommend one in a line;** the others stay on the comparison page. In a repo, compose the existing kit first; a new component is named, built in the kit and marked not yet approved.
