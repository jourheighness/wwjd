---
type: llm
focus: { source: file, path: src/NotificationSettings.tsx }
---
PASS if all hold: the unverified-email problem is moved up so it leads the card (before the channel list) or sits next to the email channel it blocks, with a way to act on it (e.g. a verify/resend action); at most one primary action is visibly heavier and rare actions (export, test notification, reset) are behind a menu or removed; the Enabled/Disabled pills are gone (the checkbox already shows state).
FAIL if the card was only trimmed (text deleted) while the unverified-email warning stays last and quiet, or if four equal buttons remain.
