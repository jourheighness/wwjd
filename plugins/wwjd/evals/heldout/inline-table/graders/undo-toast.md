---
type: llm
focus: { source: file, path: rules.html }
---
PASS if all hold: a cell edit saves without a Save click or confirm dialog; each edit shows a toast naming what changed with an Undo action; a new edit replaces the toast rather than stacking; there is no inline Undo button in the row, cell or field. FAIL if an edit shows no Undo toast, needs Save or a review/publish step, toasts stack, or Undo appears inline in the table.
