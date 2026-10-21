# explore: options for something new

For anything that doesn't exist yet, "show me options", or a redesign of what exists (§5). Small fixes skip it. Structure only: the look comes from `wwjd:look` (3 look variants); here ~5 structure variants (the count Strictness 5 means). A whole new product: ~3 directions, each one structure with its own look. Asked for a pair by feel ("one calm, one bold"): the pair is the brief, and its looks may differ beyond the Look dial.

## 1. Research before drawing
- **The best current examples of this exact job:** real products at the top of this register and category, not the domain's dated look. A few named references, each with the move to steal; verified facts apart from inference.
- **A mature package first:** before hand-building an editor, picker, chart or date input, name the package rejected and why.
- **Workaround features** in the current product (`review.md`) name the failing area to research first.
- **Layout candidates:** `references/layouts.md` index; the verb → layout table in `registers/operate.md`.

## 2. Plan before pixels
| Register | Plan | Variants differ in | Render first |
|---|---|---|---|
| Persuade | inventory → argument → idea sentence → copy deck | composition, type system, colour proportions | hero at 1440 and 390 + the hardest section |
| Showcase | asset inventory | framing: index model, sequence, scale | first viewport + one case study |
| Editorial | text face, display face, measure, grid, furniture | type specimen on a real article | table, footnote, figure, pull quote, on a phone |
| Reference | page-type map, nav tree, search model | navigation model, density | the hardest page (API ref with code tabs) |
| Operate | flow map A → B, kit inventory | nav model, pane split, what leads, density | key screen with worst-case data |
| Monitor | the questions each view answers, data inventory | which question leads, chart forms, density | incident state and empty state |
| Converse | storyboard: empty → first answer → stream → tool step → approval → error → long thread | placement (page, side panel, inline, command bar), how agent work shows | the storyboard as clickable frames |
| Transact | buy path: listing → product → cart → checkout | gallery model, buy box | product page at 390 |
| Flow | step map (one question per step), fields the system can derive | chunking: one page, stepper, progressive | longest step in its error state at 390 |

- Check every flow for dead ends and circles before drawing it.
- **Must-requirements first,** one per concern, written down before any variant.

## 3. Variants
- **About 5, A–E,** different in structure, never in tint. Persuade and Showcase: each pushes further than the last. Operate, Monitor, Reference: organisation changes, no decoration added.
- **Interaction concepts ship clickable:** a concept that changes how something is done (edit in place, pickers, drag) is shown as clickable variants before asking "which one". Static mocks only for layout and look questions.
- **The intended flow, not today's API:** every step, state and transition; note what needs backend support.
- **Real material:** the project's tokens and kit, realistic messy data (long names, one, many, empty), shown where it lives at its real sizes next to its neighbours. Light and dark when visual; interactive when the feel matters.
- **One comparison page** (an HTML file, an Artifact, a story, a sandbox): a letter and a short name per variant, no prose on the page (reasoning goes in the message), screens on a neutral dark surround. Cluttered → a fresh page with only the live candidates.
- **Each variant meets every must-requirement and the surface budgets** (`references/budgets.md`), or it's cut. A requirement no variant meets is the brief for a new one.
- **Before sharing:** `wwjd.mjs check` on each variant's source before publishing. Lint only: a Design canvas renders only on claude.ai, so it is never shot or verified; the full checks wait for the build.

## 4. Picking
- **By letter:** "A and D", "B everywhere". Merge exactly what was named; keep what they liked while consolidating. Refine until approved.
- **Record the approval** with date and comparison-page link in the decision log. That page is now the spec for `build`.

## 5. Redesign: an existing screen, from the job
"Redesign", "start over", "from scratch", "rethink": the person wants a different answer, not a tidier one. `build` keeps today's structure; this doesn't. A redesign that comes back as the old screen with cards moved is a miss (bans.md "Tame").
- **Keeps:** the Floor; the real content and data (cut, merge, reorder, rewrite, never invent); the brand marks (name, logo, brand colours, faces); PRODUCT.md principles; legal, consent and pricing text.
- **Sets aside:** today's layout, information architecture, navigation, component choices and section order. DESIGN.md tokens stay; its layouts, golden files and earlier layout decisions are evidence of what worked, never the template. The current screen is the before.
- **Start from the job,** not the screen: the 3 things a person comes to do, in order; grade every fact on the current screen from zero (the grade gate); name 3 real products that do this job best and the move taken from each.
- **3 directions, A–C,** different in what leads, how it is grouped and how you move through it. One is the calmest honest version; one a person who knows the old screen would not recognise. Each is a complete screen at 1440 and 390 with the real content, never a wireframe.
- **Pick one and say why** in a line; the others stay on the comparison page. In a repo, compose the existing kit first; a new component is named, built in the kit and marked not yet approved.
