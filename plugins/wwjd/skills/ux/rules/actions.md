# Actions: hierarchy, affordance, disclosure, undo

The how behind SKILL.md's Actions rules. Region: glossary.

## Hierarchy per region
| Level | Form |
|---|---|
| Primary | The only filled button, visibly heavier; never ghost or outline. Two equal buttons mean none was chosen: pick from the spec or the region's job |
| Secondary | A quiet button |
| Tertiary | A text button, with a stated reason |
| The rest | One shared ⋯ menu, a hover toolbar (`rules/layout.md` § Hover-revealed actions), or the detail view |

- **Placement:** the action sits next to its object and stays with the widget that informed it; primary first or last, never mid-set; header actions at the end in a fixed order; one place per pattern.
- **Frequency decides visibility:** daily = visible, rare = ⋯.
- **Destructive** sits apart from Save or confirm, by space and style. Dialog button order follows the platform.
- **Choice sets of 2–4:** every option shows at once, never a dropdown: segmented radios under their label in app UI, a stacked radio list in forms. Segment labels fit one line at the narrowest size; if not, cut options, else a radio list, a menu for actions, a select for values (canonical here; `registers/flow.md` follows). ~3 visible per group; merge overlapping options before cutting.
- **Precise values:** number input with stepper, or slider plus input; never a slider alone.

## Affordance
- **Row target (one target, one behaviour):** the title is a link or button stretched over the row or card; inner actions sit above it as icon buttons. Never `onClick` on the container (lint `div-click`). Links navigate, buttons act.
- **The stretched target is the top layer:** only real controls rise above it (`position: relative; z-index: 1`). Other positioned text or decoration punches a hole in it: a text cursor, the hover drops (runtime `target-hole`). Key hover fills off the container (`.card:hover`), never the link.
- **Pressable:** filled or bordered, or a row with hover fill and chevron. Icon-only buttons have a resting container (subtle fill or outline), a tooltip and an accessible name.
- **Not pressable:** status is a dot or muted text in a `<span>`, never a pill or button. The reverse too: an action icon never borrows a state's mark (an empty ring reads as "unread"); use the verb's glyph with a label.
- **Icons** do exactly what they show; one library, one stroke; no emoji icons.
- **Toggles:** icon, label, tooltip and `aria-pressed` (or name) flip together with state ("+ Zoom in" → "− Zoom out"); pressed = filled container. A settings toggle applies at once; one that waits for Save is a checkbox; one save model per page. Label the setting positively ("Notifications"), never bare On/Off.
- **In-place edit:** an editable value shows pencil + fill on hover and focus, always on touch, in a fixed slot so nothing shifts. Enter and blur save, Esc reverts; clicking another value commits this one and opens that one.
- **Disabled = "not yet":** reason in a tooltip (`aria-disabled`, focusable) or inline. Hide what can never apply. Read-only looks different from disabled.
- **State before the click:** unavailable, extra cost, needs sign-in, leaves the page, irreversible: a mark on the option itself (fade, strike, small badge), the word in tooltip and name ("Ash, sold out"). Never a second line under one peer; peers keep one baseline.
- **Consequences after the interaction:** detail for one choice appears in place once chosen, without pushing layout, and leaves when it changes.
- **Gestures are shortcuts:** double-click, long-press, right-click and swipe each have a single-tap path; context-menu items are mirrored in ⋯.
- **Same tab;** a new tab only for help mid-form, marked "opens in new tab". File links say type and size: "Price list (PDF, 2 MB)".
- **Mega menus:** hover intent (~300–500ms) plus a safe triangle; click opens too. **Single-key shortcuts** need a modifier, an off switch or remapping (WCAG 2.1.4).
- **Back works:** steps, filters, tabs and open records live in the URL; Back restores query, filters and scroll.
- **Active location:** weight + indicator + `aria-current`.

## Disclosure
- **Layers:** L1 holds what ~80% need and finishes the core task; L2 one click away; L3 ⋯ or ⌘K / Ctrl+K; L4 shortcuts and configuration.
- **Containers:** tooltip for brief info, no interaction; popover for a small interaction at the point of action; drawer for secondary content that needs space; tabs for parallel views; modal only after inline and drawer are ruled out.
- **Reveal in context:** export once something exists, bulk actions once something is selected.
- **Operate and Monitor:** disclosure never moves the layout, except trees and rows the person expands; never a panel from a panel.
- **Accordions** fit Transact specs and Reference. Persuade answers objections in the argument; a kept FAQ uses `<details>` (`hidden=until-found`).

## Defaults and undo
- **Enter** does the obvious thing; **Esc** steps back one level, never destroys work.
- **Undo is a toast.** In a work tool (tracker, admin, CRM, editor) every discrete edit, delete or bulk change gets one toast: what changed ("Discount: 25% → 27%") and Undo, also Cmd/Ctrl+Z. The next edit replaces it; it never covers the cells being edited. Never an inline Undo in the row, cell or field.
- **A setting or preference just applies:** no Save, no toast, announced `role=status`. Continuous typing autosaves with a quiet "Saved" status, no toast.
- **No API undo:** a `// TODO(api): …` adapter: hide at once, commit on expiry or when the person moves on; flag the API at handover.
- **The review step** is a sheet with real choices: "Send to 12 suppliers" / "Save draft".
