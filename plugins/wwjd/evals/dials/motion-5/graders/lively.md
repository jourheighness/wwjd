---
type: regex
target: { source: file, path: card.html }
pattern: '@keyframes|transition\s*:\s*(?!none)'
match: contains
flags: i
---
