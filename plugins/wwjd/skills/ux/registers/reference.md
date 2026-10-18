# Reference: docs, API reference, changelog, help centre

Profile: `data-profile="docs"`. Colour: attention only; no signal, no colour.

Success: the reader finds the answer and leaves. Use a mature docs framework (Starlight, Fumadocs, Nextra, Docusaurus) before hand-rolling. Layouts: `docs`, `changelog`.

- **Page types don't mix:** tutorial (learn by doing), how-to (a task), reference (facts, complete), explanation (why).
- **Three panes:** nav tree, a 65–80ch content column (it includes code; prose keeps the reading measure, code may break out wider), on-page contents. Mono only for code and identifiers.
- **Wayfinding on every page:** breadcrumbs, previous/next, a version switcher where versions exist, last-updated date, "edit this page".
- **Search is the front door:** ⌘K / Ctrl+K or `/` (single-key shortcuts can be turned off or remapped). Results show section breadcrumbs. Zero results suggest the nearest page and keep the query.
- **Headings** have stable slugs with copy-link on hover; renames get redirects.
- **Code blocks:** highlighting tuned for both themes, a copy button, a filename or language tab, line highlights and diffs. They scroll inside the block, never the page.
- **Synced tabs** (language, package manager) remember the choice across pages.
- **API tables:** name, type, required, default, description; every row present.
- **Callouts:** ≤4 kinds (note, tip, warning, danger), icon + word, no emoji. A page that's mostly callouts needs rewriting.

## Tells to avoid
- A marketing hero on the docs home; empty "Introduction" pages; gradient headers.
- A chatbot bubble covering the content; version-less code samples.
