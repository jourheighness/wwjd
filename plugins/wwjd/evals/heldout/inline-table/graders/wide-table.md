---
type: llm
focus: { source: file, path: rules.html }
---
Judge how the table behaves when it is wider than its container (read the CSS and JS). PASS if all hold: it scrolls sideways inside its own container, not the page; the name column is sticky (position: sticky, opaque background) with an edge marker (border or shadow) at least while content scrolls under it; a visible cue (fade, shadow or similar) shows there are more columns off the edge; the scroll container is keyboard-focusable (tabindex="0") and named. FAIL if any is missing, or if the table shrinks text or hides columns with no way to reach them.
