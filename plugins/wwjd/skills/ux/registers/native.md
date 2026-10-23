# Native and mobile overlay

Profile: `data-profile="consumer"` (touch heights), primary width 390. Colour: the platform's own colour roles and materials.

Applies on top of the register for mobile web and native iOS/Android. Platform conventions win over web ones.

- **Navigation:** iOS = tab bar ≤5, large titles, sheets with detents, swipe back. Android = Material 3 navigation bar or rail, predictive back. Layouts: `mobile-tabs-stack`, `mobile-master-detail`, `bottom-sheet`, `fullscreen-flow`, `fab`.
- **Controls, materials, type:** native controls and pickers are correct here (the only place OS pickers are). The platform's current materials (e.g. iOS Liquid Glass), used as the system draws them, never faked or fought; system fonts or a brand font that scales; capitalisation per platform.
- **Touch:** primary actions in the thumb zone, sticky above the keyboard; hit areas expanded with padding or a pseudo-element. Every hover affordance gets a visible control; gestures and long-press are shortcuts only (`rules/actions.md` Affordance).
- **Web on touch:** inputs ≥16px (iOS zooms below); a native select or date picker is fine on phones unless the component system has its own.
- **Safe areas:** insets, home indicator and keyboard respected.
- **Text scaling:** test at the largest accessibility size (~310% iOS): everything reflows, nothing clips.
- **Offline** and poor-network states designed; pull to refresh where content updates.
- **Permissions** asked in context with a clear purpose string; an optional explainer only leads into the system prompt.
- **Haptics** only with a state change. **Motion:** the platform's own transitions.
- **VoiceOver / TalkBack** labels on every control.
