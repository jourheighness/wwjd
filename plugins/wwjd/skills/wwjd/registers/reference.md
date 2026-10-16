# Reference: docs, API reference, changelog, help centre

Success: the reader finds the answer and leaves. Use a mature docs framework (Starlight, Fumadocs, Nextra, Docusaurus) before hand-rolling one.

## Page types
Each page type has its own shape (Diátaxis). Don't mix them on one page.

| Type | Shape |
|---|---|
| Tutorial | Learning by doing |
| How-to | A task, step by step |
| Reference | Facts, complete |
| Explanation | Understanding why |

## Layout
- **Three panes:** a nav tree, a content column of 65–80ch, an on-page contents list. That is a column width that includes code; prose inside it keeps the measure from `commands/typeset.md`, and code may break out wider.
- **Body text** 16–17px. Use mono only for code and identifiers.
- **Wayfinding on every page:** breadcrumbs, previous and next, a version switcher where versions exist, a last-updated date, and "edit this page".

## Search is the front door
- **Opens with ⌘K / Ctrl+K or `/`.** A single-key shortcut like `/` can be turned off or remapped. Results show section breadcrumbs.
- **Zero results** suggest the nearest page and keep the query in the field.
- **Headings** have stable slugs with copy-link on hover. Renames get redirects so deep links survive.

## Code
- **Code blocks:**
  - Highlighting tuned for both themes.
  - A copy button, and a filename or language tab.
  - Line highlights and diffs.
  - They scroll horizontally inside the block, never the page, and the block is focusable and labelled.
- **Synced tabs** (language, package manager) remember the choice across pages.
- **API tables:** name, type, required, default, description, with every row present.

## Callouts
- **At most 4 kinds** (note, tip, warning, danger), each an icon plus a word. No emoji callouts.
- **A page that is mostly callouts** needs rewriting.

## Tells to avoid
- A marketing hero on the docs home.
- Empty "Introduction" pages.
- Gradient headers.
- A chatbot bubble covering the content.
- Version-less code samples.
