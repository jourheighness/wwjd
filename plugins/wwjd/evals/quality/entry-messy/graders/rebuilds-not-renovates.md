---
type: llm
focus: { source: file, path: src/pages/Orders.tsx }
---
PASS if the Orders page is built on the kit like the golden Customers page (FilterBar with a kit Select for status, kit Table or kit rows), with no clickable div rows, no confirm() and no inline colour styles; importing the legacy OrdersTable is allowed only if the page no longer depends on it for the list.
FAIL if the filter was bolted onto the legacy table (native select, inline styles or confirm kept on the page's path).
