# prioritize: actions, affordance, disclosure

Use when a region has too many actions, the hierarchy is unclear, or things don't look clickable, or don't look like they aren't.

## Action hierarchy, per region
**Region** means a card, a row, a toolbar, a dialog, a page header or a pane.
- **Primary:** the next step. It is the only filled button in the region.
- **Secondary:** a quiet button.
- **Tertiary:** a text button, only when it is needed and you can say why.
- **Everything else** goes behind ⋯ (one shared row-actions menu), a hover toolbar (also shown on focus and after a tap), or the detail view.
- **Placement:**
  - The primary sits first or last, never in the middle.
  - Actions live in one place per pattern, the same in every instance.
  - In headers, actions sit at the end, in a fixed order.
- **Frequency decides visibility.** Something used daily is visible. Something rare goes in ⋯. Never give an entry point more space than its use earns.
- **No duplicate paths:** one place to answer, one to copy a link, one to approve.
- **Choices:** about 3 visible options per group. Clear options beat few options: merge or rename overlapping ones before cutting.

## Affordance
- **The whole row or card is the target,** with hover and keyboard focus. No nested button does the same job; inner actions are icon buttons.
- **Pressable looks pressable:** a filled or bordered button, or a row with a hover fill and a chevron.
- **Not pressable never looks pressable:** status is a dot or muted text, not a pill. Status labels are `<span>`s, not buttons.
- **Links navigate and buttons act:** `<a>` and `<button>`, never a clickable `<div>`.
- **Icons do exactly what they show,** and each one has a tooltip.
- **Disabled means "not yet":** give the reason in a tooltip or inline. Hide what can never apply. Read-only looks different from disabled.
- **Hover is never the only path.** Touch has none.

## Disclosure layers
| Layer | What goes there |
|---|---|
| L1 | What about 80% of people need, always visible |
| L2 | One click away |
| L3 | Behind ⋯ or ⌘K |
| L4 | Shortcuts and configuration |

- **Test:** the core task can be done entirely at L1.
- **Reveal in context:** export appears after something exists; bulk actions after a selection.
- **Hidden, not buried:** critical information and needs-you signals never live only in a tooltip.
- **Container by job:**
  | Container | Use for |
  |---|---|
  | Tooltip | Brief info, no interaction |
  | Popover | A small interaction at the point of action |
  | Drawer | Secondary content that needs space |
  | Tabs | Parallel views |
  | Modal | Only after inline and drawer are ruled out |
- **In Operate and Monitor, disclosure never moves the layout.** In Persuade, Reference and Transact, accordions are the right pattern for FAQs, details and specs.
- **Never double trays:** don't open a panel to open another panel.

## Decisions and undo
- **Default instead of asking.** Enter does the obvious thing; Esc steps back one level and never destroys work.
- **Undo, not "are you sure".** Remove `confirm()` and "Are you sure?" dialogs.
  - If the data layer has no undo yet, hide the item at once and show an undo toast. Commit the delete when the toast expires (about 5 seconds) or the person navigates away.
  - Irreversible actions that reach other people, money or legal state get a review sheet with real choices ("Send to 12 suppliers" / "Save draft").
