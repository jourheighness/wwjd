# Native and mobile overlay

Profile: `data-profile="consumer"` (touch heights), primary width 390. Colour: the platform's own colour roles and materials.

On top of the register whenever the surface is mobile web or a native iOS/Android app. Platform conventions win over web ones.

- **Navigation:** iOS = tab bar ≤5, large titles, sheets with detents, swipe back. Android = Material 3 navigation bar or rail, predictive back. Layouts: `mobile-tabs-stack`, `mobile-master-detail`, `bottom-sheet`, `fullscreen-flow`, `fab`.
- **Controls, materials, type:** native controls and pickers are correct here (the only place OS pickers are). The platform's materials (iOS 26 Liquid Glass: don't fake or fight it), system fonts or a brand font that scales; capitalisation per platform.
- **Touch:** primary actions in the thumb zone, sticky above the keyboard; hit areas expanded with padding or a pseudo-element. Every hover affordance (⋯, toolbars, previews) gets a visible control; long-press only as a shortcut. Every gesture has a visible alternative.
- **Web on touch:** inputs ≥16px so iOS doesn't zoom; selects and date pickers still come from the component system; `100dvh`.
- **Safe areas:** insets, home indicator and keyboard respected.
- **Text scaling:** Dynamic Type / font scaling to the largest accessibility size (~310% iOS) reflows without clipping. Test there.
- **Offline** and poor-network states designed; pull to refresh where content updates.
- **Permissions** asked in context with a clear purpose string; an optional explainer only leads into the system prompt.
- **Haptics** only with a state change. **Motion:** the platform's own transitions.
- **VoiceOver / TalkBack** labels on every control.
