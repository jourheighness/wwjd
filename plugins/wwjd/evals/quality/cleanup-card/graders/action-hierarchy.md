---
type: llm
focus: { source: file, path: src/ProjectCard.tsx }
---
PASS if all hold: at most two visible action buttons, and exactly one of them is styled as the primary (visibly heavier: filled or a distinct variant) while the other is quieter; the remaining actions (duplicate, archive, delete) sit behind one overflow/more menu or are removed; the card text is start-aligned (no text-center).
FAIL if two visible buttons have the same weight/styling, four or more actions are visible, or the card text is still centred.
