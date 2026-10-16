# Operate: product apps, editors, admin, settings

Success: the person completes the task and gets back to work. This is where the rules in SKILL.md bite hardest; this file adds what is specific to apps.

## The bar
- **Benchmark:** the best product in this category, named (for a B2B work tool, think Linear, Figma, Things). Never the domain's dated look.
- **Brand** enters only through type, palette, density and one signature move. Navigation and controls stay standard.
- **Desktop-first** at 1440 for work tools, but the narrow width must still work.

## Structure
- **Global vs local:**
  - Global: the shell, navigation, header anatomy, panes, spacing scale and density.
  - Local: a screen arranges what is inside its panes.
  - Each pane gets its own surface. Drawers and sidebars resize and remember their width.
- **One question per view:** what is this, and what do I do now? Lead with what needs the person.
- **⌘K / Ctrl+K** is the one door to search, navigation and actions. Every view, tab, filter and selection lives in the URL, so everything deep-links.

## Density and type
- **Density is a token** (compact or comfortable). Text 13–14px is right for dense work tools; nothing meant to be read goes under 12px.
- **One family** (the kit's), about 5 roles. `tabular-nums` wherever numbers align or change.
- **One line per list item.** Markers sit at the end; reasons go in tooltips.

## Behaviour
- **Disclosure never moves the layout,** except trees and rows the person expands. Use a popover, menu or drawer, not a fold-out that pushes content down. An inline form the person opened may also replace its row.
- **No confirm dialogs.** Act at once with undo in place; the floor's exceptions get a review sheet with real choices, never yes/no.
- **Autosave everywhere.** An unsent input is a draft that survives reload; publish is the action.
- **The person decides.** Manual choices persist per person. The system never auto-opens panels, auto-forwards, re-sorts under the pointer or picks "recents" for them.
- **Bulk actions** appear after a selection. Show presence and permission states.

## People and status
- **People:** names show where the person matters (assignee, owner, author on a detail view); stacked avatars only for groups, with names in a tooltip that also works on focus and tap.
- **Status** is a dot or a shape plus a word, one marker vocabulary in one size everywhere. Status is never a button-looking pill.

## AI inside the product
- **The assistant does the work:** no "Start AI" buttons, no "AI is analysing…" receipts.
- **Changes land where they apply,** marked, with keep, change and undo on the spot. The product stays complete with AI off.

## Tells to avoid
- "Owner: Sara Lind" as grey label text in a list row, where an avatar and name chip in the owner column belongs.
- Tabs that look like plain links.
- A status zoo of 9 colours.
- Settings that are one long form.
- Every action as a visible button.
- "N of M" counters everywhere.
- Raw OS-styled controls next to the kit's controls.
- Centred forms in a work tool.
