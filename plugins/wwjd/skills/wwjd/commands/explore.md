# explore: new screens, flows and pages

Use explore for anything that doesn't exist yet, or when the user asks to see options. Small fixes skip it.

## 1. Research before drawing
- **Find the best current examples of this exact job:** real products and sites people use, at the top of this register and category. Not the domain's dated look.
- **Look for a mature package** (component, editor, picker, chart, docs framework) before inventing one.
- **Workaround features in the current product are evidence** (`critique.md`): each names a failing area to research first.
- **Report a few named references,** each with the move to steal. Keep verified facts separate from inference.

## 2. Plan before pixels (what you plan depends on the register)

| Register | Plan | Variants differ in | Render first |
|---|---|---|---|
| Persuade | inventory → argument → idea sentence → copy deck | art direction: composition, type system, colour proportions | hero at 1440 and 390, plus the hardest section |
| Showcase | asset inventory | how the work is framed: index model, sequence, scale | first viewport plus one case study |
| Editorial | typographic system: text face, display face, measure, grid, furniture | type specimen on a real article | a page with a table, footnote, figure and pull quote, on a phone |
| Reference | page-type map and nav tree; search model | navigation model and density | the hardest page: an API reference with code tabs |
| Operate | flow map A → B; kit inventory | organisation: nav model, pane split, what leads, density | the key screen with worst-case data |
| Monitor | the questions each view answers, and a data inventory | which question leads; chart forms; density | the incident state and the empty state |
| Converse | storyboard: empty → first answer → stream → tool step → approval → error → long thread | placement (full page, side panel, inline, command bar); how agent work shows | the storyboard as clickable frames |
| Transact | buy path: listing → product page → cart → checkout | gallery model and buy box | the product page at 390 |
| Flow | step map (each step's single question); a list of fields the system can derive | chunking: one page, stepper, progressive | the longest step in its error state, at 390 |

Check every flow for dead ends and circular paths before drawing it.

**Must-requirements before variants:** write them down, one per concern, before drawing anything.

## 3. Variants
- **How many:** about 5, labelled A–E, and genuinely different in structure, not in tint.
  - **Persuade and Showcase:** each variant pushes further than the last, never cleaner.
  - **Operate, Monitor and Reference:** variants change the organisation; they don't add decoration.
- **The intended flow, not the current limits:** prototypes show every step, state and transition of the right experience, whatever the API can do today. Note what would need backend support.
- **Real material:** the project's tokens and type, real component shapes, realistic messy data (long names, one item, many, empty).
- **Context:** show each variant where it lives, at the sizes it appears, next to its neighbours.
- **States:** light and dark when the work is visual; interactive when the feel matters.
- **One comparison page:**
  - It can be a shareable prototype (an HTML file, a hosted HTML page (e.g. a Claude Artifact), a Storybook story, a sandbox).
  - A letter and a short name per variant, with no explanatory prose on the page; reasoning goes in the message.
  - Show screens on a neutral dark surround so the page's white doesn't distract.
- **Test every variant against every must-requirement.** A variant that fails one is cut. A requirement no variant meets becomes the brief for a new variant.
- **Before sharing:** run the handover check in SKILL.md on every variant. When a comparison page gets cluttered, start a fresh one with only the live candidates.

## 4. Picking
- **The user picks and remixes by letter** ("A and D", "B everywhere"). Merge exactly what they named, and keep what they liked while consolidating.
- **Refine until approved.** The chosen variant approves its components.
- **Record the approval** with its date and a link to the comparison page in the decision log. That page is now the spec for `build`.
