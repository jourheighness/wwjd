---
type: regex
target: { source: file, path: src/TaskRow.tsx }
pattern: 'of [{]task[.]total[}]'
match: not_contains
flags: i
---
