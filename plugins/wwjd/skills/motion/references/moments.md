# Moments catalogue

Each moment: **when** it earns motion, the **spec** (tokens from `motion.css`, so the theme sets the numbers), and **never**. Default to none; add a moment only when it answers section 1 of SKILL.md.

## Input feedback
| Moment | When | Spec | Never |
|---|---|---|---|
| **Press** | Buttons, icon buttons | `:active` `scale(var(--press-scale))`, `--dur-fast` `--ease-out` | On rows, cards or links; on keyboard Enter |
| **Toggle** | Switch, checkbox | Thumb `translate` `--dur-fast` `--ease-out`; tick by `clip-path` or opacity | Spring on the thumb outside `springy`; delayed state |
| **Hover** | Pointer-only affordance | Colour or background `--dur-fast` `ease`, inside `(hover: hover) and (pointer: fine)` | Lift, scale or shadow-grow on cards; motion on hover-out lag |
| **Tooltip** | Name an icon | First after 500ms, `--dur-fast` fade + `.97`; next ones 0ms while the group is warm | Cursor-following; animating every one in a toolbar sweep |

## Overlays
| Moment | When | Spec | Never |
|---|---|---|---|
| **Popover / menu / select** | Opened by click | From trigger (`--transform-origin`), opacity + `scale(var(--pop-scale))`, `--dur-pop`; exit `--dur-fast` | From centre; on a command palette opened by shortcut (instant) |
| **Dialog** | Occasional, blocking | Centre, opacity + `scale(var(--pop-scale))`, backdrop fades; exit faster | Slide from off-screen; bounce |
| **Drawer / sheet** | Detail panel, mobile sheet | Translate from its edge, `--dur-modal` `--ease-drawer`; drag follows the finger, release keeps velocity, dismiss past ~25% or a flick | Scale; snapping back with no momentum |
| **Toast** | Result of an action off-screen, or undo | From its edge, `--enter-y` + fade, `--dur-pop`; stack shifts by transform; 4–6s, pauses on hover and hidden tab; swipe to dismiss | For a change already visible; celebration toasts; stacking more than 3 |

## Layout change
| Moment | When | Spec | Never |
|---|---|---|---|
| **Tabs indicator** | Segmented control, tabs with a moving bar | One bar, `translateX` + `scaleX`, `--dur-modal` `--ease-move` (`.tabs-indicator`) | Animating panel content sideways; width/left transitions |
| **Accordion / height** | Disclosure, collapsible | `.expand` grid rows `0fr→1fr` or `details.disclosure`; content `visibility` hidden when closed | Height on large lists; JS-measured `height` |
| **List insert / remove** | Item added or deleted by the person | `document.startViewTransition(mutate)` on `.motion-list`; new item fades in, neighbours slide | On initial load or pagination; stagger |
| **Reorder** | Sort by drag or a move action | View transition or FLIP; `--ease-move` | Re-sorting live data under the cursor (floor: stability) |
| **Drag** | Reorder, sheet, slider | 1:1 with the pointer, lifted item `scale(1.02)` + shadow, drop settles with a spring | Lag behind the pointer; animating keyboard moves |

## Data and status
| Moment | When | Spec | Never |
|---|---|---|---|
| **Optimistic update** | Save, like, move | State changes in the same frame; on failure revert with a short fade + inline error | Spinners in the button for sub-second work |
| **Skeleton → content** | Load past 400ms | Static skeleton matching the layout; content crossfades `--dur-pop` | Shimmer loops on fast loads; skeleton for <300ms (flash) |
| **Progress** | Known work past 1s | Determinate bar, `linear`; indeterminate only when unknowable | Fake progress; bar that sits at 99% |
| **Copy to clipboard** | Copy button | Icon swaps to a check (crossfade + `.9→1` scale, `--dur-fast`), back after 1.5–2s | A toast for it |
| **Number change** | A value the person changed or is watching | Digits roll or crossfade `--dur-pop` with `tabular-nums`; only the digits that changed | Count-up on page load; on every live tick (update in place) |
| **Success** | Rare milestone (first project, payment done) | One check draw or springy scale, ≤600ms | Confetti; success for routine saves (silent) |
| **Error** | Validation, failed action | Message appears in place, field border colour, focus moves; no motion needed | Shake (dizzying, no information); red flash loops |

## Navigation
| Moment | When | Spec | Never |
|---|---|---|---|
| **Page / route** | Between sibling pages | View transition crossfade `--dur-pop`; forward/back as a short directional slide via VT types | Full-page slides in a work tool; animating every route |
| **Shared element** | List → detail of the same object (thumbnail → hero) | `view-transition-name` on both ends, `--dur-modal` `--ease-move` | Two named elements in view at once; names on everything |

## Converse (chat, AI)
| Moment | When | Spec | Never |
|---|---|---|---|
| **Streaming text** | Model output | Tokens append; optional ≤120ms opacity fade per chunk; scroll follows only while pinned to bottom | Typewriter replay of non-streamed text; caret blinking after the end |
| **AI thinking** | Waiting for first token or a tool | Label ("Thinking", tool name) with a slow light sweep on the text, or 3 dots; stops the instant output starts; collapsible step list | Spinning logos; fake step text; loops left running after done |

## Persuade, Showcase (`references/landing.md`)
| Moment | When | Spec | Never |
|---|---|---|---|
| **Landing hero** | Once, on load | One orchestrated sequence 400–1200ms, product first | Blocking reading; replay on scroll back |
| **Scroll reveal** | One idea that builds | `.reveal` (`animation-timeline: view()`), short range | Every section; hiding content until scrolled |
| **Product demo** | Show the real interface working | Looped real UI (video or live component), paused off-screen and on reduced motion, with a pause control | Fake dashboards of grey bars; auto-advancing carousels |
