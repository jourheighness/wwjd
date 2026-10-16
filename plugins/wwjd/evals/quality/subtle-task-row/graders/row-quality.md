---
type: llm
focus: { source: file, path: src/TaskRow.tsx }
---
PASS if all hold: the whole row (not just the title span) is the click target via a button/link or keyboard-accessible element; delete is not a visible button with a confirm dialog (it is in a menu and/or uses undo); the comment count is removed or reduced to a quiet indicator; the updated time is relative or compact rather than a full toLocaleString timestamp.
FAIL if any of these is missing.
