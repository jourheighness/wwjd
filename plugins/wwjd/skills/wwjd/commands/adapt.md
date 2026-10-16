# adapt: responsive, mobile, native, platform

Each width is its own composition. Never just stack the desktop layout.

## Primary width per register
| Register | Primary width |
|---|---|
| Operate, Monitor | Desktop 1440 first, with the narrow width still working |
| Persuade, Transact, consumer Converse | Mobile 390 first; most of the traffic is mobile |
| Editorial, Reference | Both. Measure decides, not breakpoints |
| Native | Read `registers/native.md` |

Check 320, 390, 768, 1440 and 1920. No horizontal page scroll anywhere.

## Structure
- **Query by scope:** container queries for components, viewport queries for page layout.
- **Product UI responds structurally, not with fluid type:**
  - the sidebar collapses to a rail, then to an off-canvas drawer on phones
  - tables become cards, or get column priority
  - panes stack
- **Collapsed sidebar:** labels by default and an opt-in icon rail of 56–72px. Labels stay in the DOM, with a tooltip on hover and focus.
- **Wide tables:** keep the 3 columns that carry the work and move the rest into a drill-in or a column picker. Never shrink the text to fit.
- **Phone composition:** compose 390 on its own. Order content by priority, not by the desktop's reading order.

## Touch
- **Targets:** at least 44pt (iOS) or 48dp (Android); expand hit areas with padding or a pseudo-element.
- **Placement:** primary actions in the thumb zone, sticky above the keyboard.
- **No hover:** every hover affordance (⋯, toolbars, previews) has a visible or long-press equivalent.
- **Forms:** inputs at least 16px so iOS doesn't zoom. Native pickers for date and select are right on touch.
- **Safe areas:** respect safe-area insets and the on-screen keyboard. Use `100dvh`.

## Text scaling
- Text up to 200% (Dynamic Type, font scaling, browser zoom) reflows without clipping or overlap.

## Platform
- **Native apps follow the platform's navigation, controls, materials and transitions** (`registers/native.md`). Web conventions don't override them.
