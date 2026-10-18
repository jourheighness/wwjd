---
type: llm
focus: { source: file, path: rules.html }
---
PASS if a single-cell edit does not show a 'Saved' toast or an inline 'Undo' button after every change (silent save, or a quiet status). FAIL if each cell edit triggers an Undo or Saved toast.
