---
type: regex
target: { source: file, path: card.html }
pattern: '(transition|animation)\s*:\s*(?!none)'
match: not_contains
flags: i
---
