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
- **Targets** of at least 44pt on iOS and 48dp on Android. Primary actions sit in the thumb zone, sticky above the keyboard.
- **Hover doesn't exist.** Every hover affordance needs a visible or long-press equivalent.
- **Gestures** always have a visible alternative.

## Layout
- **Safe areas:** respect them, the home indicator, and the keyboard.
- **Text scaling:** Dynamic Type and font scaling up to 200% reflow the layout without clipping.
- **Compose the narrow width on its own;** don't just stack the desktop layout.

## Behaviour
- **Offline:** offline and poor-network states are designed. Pull to refresh where content updates.
- **Permissions:** a priming screen before each prompt that says what it is for.
- **Haptics** only paired with a state change.
- **Motion:** the platform's own transitions (push and pop, sheets, critically damped springs).

## Accessibility
- VoiceOver and TalkBack labels on every control. Test at the largest text size.
