# prioritize: actions, affordance, disclosure

Use when a region has too many actions, the hierarchy is unclear, or things don't look clickable, or don't look like they aren't.

## Action hierarchy, per region
**Region** means a card, a row, a toolbar, a dialog, a page header or a pane.
- **Primary:** the next step. It is the only filled button in the region and visibly heavier than everything beside it. Two buttons of equal weight in one region (Edit and Share as twin outlines) means no primary was chosen: pick one, from the spec or the region's main job.
- **Secondary:** a quiet button.
- **Tertiary:** a text button, only when it is needed and you can say why.
- **Everything else** goes behind ⋯ (one shared row-actions menu), a hover toolbar (rules in `fit.md` §5: shortcuts only, also in ⋯, visible on focus and on touch, no reflow), or the detail view.
- **Placement:**
  - The primary sits first or last, never in the middle.
  - Actions live in one place per pattern, the same in every instance.
  - In headers, actions sit at the end, in a fixed order.
- **Frequency decides visibility.** Something used daily is visible. Something rare goes in ⋯. Never give an entry point more space than its use earns.
- **No duplicate paths:** one place to answer, one to copy a link, one to approve.
- **Choice sets** of 2–4 options are segmented button radios (one row of connected buttons, the selected one filled), placed under their label rather than beside it. Every label fits on one line at the narrowest size; if it doesn't, cut options or use a menu.
- **Choices:** about 3 visible options per group. Clear options beat few options: merge or rename overlapping ones before cutting.

## Affordance
- **The whole row or card is the target:** its title is a link or button stretched over it, with hover and keyboard focus; inner actions sit above it as icon buttons. Never an `onClick` on the container. No nested button does the same job.
- **Pressable looks pressable:** a filled or bordered button, or a row with a hover fill and a chevron. Icon-only buttons (theme toggle, new chat, close) have a resting container: a subtle fill or outline, never a bare glyph.
- **Not pressable never looks pressable:** status is a dot or muted text, not a pill. Status labels are `<span>`s, not buttons.
- **Links navigate and buttons act:** `<a>` and `<button>`, never a clickable `<div>`.
- **Icons do exactly what they show,** and each one has a tooltip.
- **Disabled means "not yet":** give the reason in a tooltip (with `aria-disabled`, still focusable) or inline. Hide what can never apply. Read-only looks different from disabled.
- **Hover is never the only path.** Touch has none.

## Disclosure layers
| Layer | What goes there |
|---|---|
| L1 | What about 80% of people need, always visible |
| L2 | One click away |
| L3 | Behind ⋯ or ⌘K / Ctrl+K |
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
- **In Operate and Monitor, disclosure never moves the layout,** except trees and rows the person expands.
- **Accordions** are right for Transact specs and Reference. In Persuade answer objections in the argument; a FAQ you keep uses `<details>` (with `hidden=until-found` where supported).
- **Never open a panel from a panel.**

## Decisions and undo
- **Default instead of asking.** Enter does the obvious thing; Esc steps back one level and never destroys work.
- **Undo, not "are you sure".** Remove `confirm()` and "Are you sure?" dialogs.
  - Undo stays available until the next action (not a 5-second race), is announced (`role=status`) and is reachable by keyboard.
  - If the data layer has no undo, never keep the confirm: put an undo adapter in front (SKILL.md section 3), hide at once, undo through the adapter, commit when the undo expires or the person moves on, and flag the missing API in the handover.
  - Money, legal commitments, account deletion and anything sent to other people get a review sheet with real choices ("Send to 12 suppliers" / "Save draft").
