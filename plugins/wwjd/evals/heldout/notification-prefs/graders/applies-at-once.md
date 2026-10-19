---
type: llm
focus: { source: file, path: notifications.html }
---
PASS if changing a preference applies at once, with no Save button and no toast or Undo button per change (an announced `role=status` region or a brief quiet status is fine). FAIL if changes need a Save click, or each change pops a toast or shows an Undo button.
