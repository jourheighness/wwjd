# Monitor: dashboards, analytics, metrics, ops views

Success: the person knows the state in 5 seconds and knows where to look next.

- **One question per view.** Write the questions first ("what does an on-call engineer need in 5 seconds?"), then design. The first row is what needs someone now, not vanity KPIs.
- **KPI anatomy:** value, unit, change against a named comparison period, and a sparkline. A number earns its place only if it changes a decision; most dashboards show too many.
- **Signals:**
  - Colour only where something needs attention. Calm stays calm.
  - A problem must still be findable at a glance: a needs-you signal that is too faint is a defect, as much as a christmas tree is.
  - Status colour appears only on status, always paired with a shape or a word.
- **Time:** one global time range, with the timezone shown. Show freshness: live or stale, with a "last updated" time. Here a timestamp does change a decision.
- **Distinct states:** no data, zero, partial, error and loading each look different. Seed the incident state in design data, not only the happy one.
- **Filters** show what they scope. Cross-filtering is visible and easy to clear.
- **Tables:**
  - Text 12–14px, sticky header, locked first column, `tabular-nums`, right-aligned numbers.
  - Drill into a row, with a breadcrumb back.
  - Lock column widths so nothing jumps on sort or refresh.
- **Charts:** follow the chart rules in `commands/colour.md` and the integrity rules in `references/faux-pas.md`. Each chart has a table alternative for screen readers.
- **Layout:** balance the charts so none sits lonely in dead space. Lines run edge to edge at a fixed aspect ratio; nothing stretches vertically with the grid.

## Tells to avoid
- Four KPI cards with green arrows.
- Donuts.
- A gradient fill under every line.
- "Welcome back, John".
- A 12-chart wall with no question.
- Grow-in chart animations.
- Legends that restate the axis.
