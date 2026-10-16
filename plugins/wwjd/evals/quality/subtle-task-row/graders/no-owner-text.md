---
type: regex
target: { source: file, path: src/TaskRow.tsx }
pattern: '>[^<{]*Owner:'
match: not_contains
flags: i
---
