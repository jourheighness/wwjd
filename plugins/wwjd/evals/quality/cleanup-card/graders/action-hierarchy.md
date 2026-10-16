---
type: llm
focus: { source: file, path: src/ProjectCard.tsx }
---
PASS if the card shows at most two visible action buttons and the remaining actions (duplicate, archive, delete) sit behind one overflow/more menu or are clearly removed, and the text is start-aligned (no text-center on the card).
FAIL if four or more actions are still visible buttons, or the card text is still centred.
