# Native and mobile overlay

Apply this on top of the register whenever the surface is a mobile web view or a native iOS or Android app.

## Platform rules win
- **Navigation:**
  - iOS: a tab bar with at most 5 items, large titles, sheets with detents, swipe back.
  - Android: a Material 3 navigation bar or rail, and predictive back.
- **Controls:** native controls are correct here; don't rebuild them in a web kit's style.
- **Materials and type:** use the platform's own (on iOS 26, Liquid Glass is the native material, so don't fake it or fight it). System fonts, or a brand font that scales.
- **Capitalisation** follows the platform's guidance.

## Touch
- **Targets:** the floor's touch sizes. Primary actions sit in the thumb zone, sticky above the keyboard.
- **Hover doesn't exist.** On touch, a visible control (⋯); long-press only as a shortcut.
- **Gestures** always have a visible alternative.

## Layout
- **Safe areas:** respect them, the home indicator, and the keyboard.
- **Text scaling:** Dynamic Type and font scaling up to the platform's largest accessibility size (~310% on iOS) reflow the layout without clipping. The web equivalent is 200%.
- **Compose the narrow width on its own;** don't just stack the desktop layout.

## Behaviour
- **Offline:** offline and poor-network states are designed. Pull to refresh where content updates.
- **Permissions:** ask in context, with a clear purpose string. An explainer screen is optional and only leads into the system prompt.
- **Haptics** only paired with a state change.
- **Motion:** the platform's own transitions (push and pop, sheets, critically damped springs).

## Accessibility
- VoiceOver and TalkBack labels on every control. Test at the largest text size.
