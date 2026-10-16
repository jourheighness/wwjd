---
type: regex
target: { source: file, path: src/TaskRow.tsx }
pattern: 'confirm[(]|are you sure'
match: not_contains
flags: i
---
