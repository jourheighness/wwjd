# Actions: hierarchy, affordance, disclosure, undo

The how behind SKILL.md's Actions rules. A region is a card, row, toolbar, dialog, page header or pane.

## Hierarchy per region
| Level | Form |
|---|---|
| Primary | The only filled button, visibly heavier. Twin equal buttons = no primary chosen: pick from the spec or the region's job. Never ghost or outline as the main CTA |
| Secondary | A quiet button |
| Tertiary | A text button, with a stated reason |
| The rest | One shared ⋯ menu, a hover toolbar (`rules/layout.md`), or the detail view |

- **Placement:** primary first or last, never mid-set; header actions at the end in a fixed order; one place per pattern.
- **Frequency decides visibility:** daily = visible, rare = ⋯.
- **Destructive** sits apart from Save or confirm, by space and style. Dialog button order follows the platform, same in every dialog.
- **Choice sets of 2–4:** segmented radios under their label, never a dropdown; every label fits one line at the narrowest size, else cut options, then a menu for actions, a select for values (this file is canonical; `registers/flow.md` follows it). ~3 visible per group; merge overlapping options before cutting.
- **Precise values:** number input with stepper, or slider plus input; never a slider alone.

## Affordance
- **Row target (one target, one behaviour):** the title is a link or button stretched over the row or card; inner actions sit above it as icon buttons. Never `onClick` on the container (lint `div-click`); no nested button for the same job. Links navigate, buttons act.
- **The stretched target is the top layer:** only real controls rise above it (`position: relative; z-index: 1`). Positioned text or decoration inside lifts above the target: a text cursor, the hover drops (runtime `target-hole`). Hover fills key off the container (`.card:hover`), never the link. Owner, 2026-10-17 (a card's hover flickered over its text).
- **Pressable:** filled or bordered, or a row with hover fill and chevron. Icon-only buttons have a resting container (subtle fill or outline), a tooltip, and a name containing the visible text.
- **Not pressable:** status is a dot or muted text in a `<span>`, never a pill or button.
- **Actions never look like states:** an action icon never borrows a state's mark (an empty ring reads as "unread"); use the verb's glyph (check, envelope) with a label.
- **Icons** do exactly what they show; one library, one stroke; no emoji icons.
- **Toggles:** icon, label and tooltip flip with state ("+ Zoom in" → "− Zoom out"), `aria-pressed` or updated name, pressed = filled container; out of sync is a defect. A settings toggle applies at once; needing Save makes it a checkbox; one save model per page (instant + undo). Label the setting positively ("Notifications"), never bare On/Off.
- **In-place edit:** an editable value shows an affordance on hover and focus (pencil + fill), always on touch, in a fixed slot so nothing shifts. Enter saves, Esc reverts, blur saves; one click on another value commits this one and opens that one.
- **Disabled = "not yet":** reason in a tooltip (`aria-disabled`, focusable) or inline. Hide what can never apply. Read-only looks different from disabled.
- **State before the click:** unavailable, extra cost, needs sign-in, leaves the page, irreversible: a fade, mark or word on the option itself.
- **State marks differ from labels:** a mark on the item (faded swatch, strike, small badge), the word in tooltip and name ("Ash, sold out"). Never a second line under one peer; peers keep one baseline.
- **Consequences after the interaction:** detail for one choice (restock form, plan fields) appears in place once chosen or focused, without pushing layout, and leaves when the choice changes.
- **Gestures are shortcuts:** double-click, long-press, right-click, swipe each have a single-tap path; context-menu items mirrored in ⋯.
- **Same tab.** New tab only for help mid-form, with icon and "opens in new tab". File links say type and size: "Price list (PDF, 2 MB)".
- **Mega menus:** hover intent (~300–500ms) plus a safe triangle; click opens too.
- **Single-key shortcuts** need a modifier, an off switch or remapping (WCAG 2.1.4).
- **Back works:** steps, filters, tabs and open records live in the URL; Back restores query, filters and scroll.
- **Active location:** weight + indicator + `aria-current`.

## Disclosure
| Layer | Holds |
|---|---|
| L1 | What ~80% need; the core task finishes here |
| L2 | One click away |
| L3 | ⋯ or ⌘K / Ctrl+K |
| L4 | Shortcuts and configuration |

| Container | For |
|---|---|
| Tooltip | Brief info, no interaction |
| Popover | A small interaction at the point of action |
| Drawer | Secondary content that needs space |
| Tabs | Parallel views |
| Modal | Only after inline and drawer are ruled out |

- **Reveal in context:** export once something exists; bulk actions once there is a selection.
- **Operate and Monitor:** disclosure never moves the layout, except trees and rows the person expands. Never a panel from a panel.
- **Accordions** fit Transact specs and Reference. Persuade answers objections in the argument; a kept FAQ uses `<details>` (`hidden=until-found`).

## Defaults and undo
- **Enter** does the obvious thing; **Esc** steps back one level, never destroys work.
- **Undo is a toast.** In a work tool (tracker, admin, pricing, CRM, editor) every discrete edit, delete or bulk change gets one toast: what changed ("Black Friday: 25% → 27%") and Undo, also Cmd/Ctrl+Z; the next edit replaces it; it never covers the cells being edited. Never an inline Undo in the row, cell or field. A setting or preference just applies: no Save, no toast, announced `role=status`. Continuous typing in a document autosaves with a quiet "Saved" status, no toast.
- **No API undo:** an undo adapter in front (`// TODO(api): …`), hide at once, undo through it, commit on expiry or when the person moves on; flag the API at handover.
- **The review step** is a sheet with real choices: "Send to 12 suppliers" / "Save draft".
