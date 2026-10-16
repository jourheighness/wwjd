# harden: states, worst-case data, errors, i18n

Every component should look right all the way through, not just in the demo.

## Interactive states
Every interactive component needs all eight states, each designed: default, hover, focus-visible, active, disabled, loading, error, success. Hover without a focus state is the most common miss.

## Hidden states stay hidden
- Every element toggled with the `hidden` attribute needs a global `[hidden] { display: none !important }`; `starter.css` ships it. Without it, any class that sets `display` shows the hidden state, and the screen renders two states at once (the form and its success message together).
- One state per view: a flow's result replaces the step it completes; never stack both.

## Data states, per view
| State | Treatment |
|---|---|
| First use | Seeded example content plus one action; it may teach once |
| One item | Doesn't look broken or lonely |
| Many | Priority stays visible. Virtualise only when measured slow (it breaks find-in-page, print and screen-reader counts) |
| Longest real text | See `layout.md` |
| Empty | One line plus one action. A secondary region may collapse when empty; in a table a missing value shows '—' with accessible text 'None' |
| Filtered empty | Echo the query, offer to clear the filters, suggest the next query |
| Loading | A skeleton matching the final layout; a spinner only inside a button, keeping its label. Delay ~200ms, then show for at least ~400ms |
| Error | What happened plus retry, in place. One failing part never blocks the page |
| No permission | Why, and how to get access |
| Partial or stale | Show what exists; mark the rest quietly |
| Offline | Say so; queue what can be queued |

- **Status codes:**
  | Code | Show |
  |---|---|
  | 401 | Sign in again |
  | 403 | The permission state |
  | 404 | The not-found state |
  | 429 | A rate-limit line |
  | Timeout | Retry |
- **Responsiveness:** acknowledge in 100ms. Past ~1s show progress in place; past ~10s determinate progress when the duration is known, otherwise a live status line. Never fake progress.
- **Optimistic updates:** use them where success is likely. Reconcile with the server, and on failure roll back with an inline error.
- **Interrupted flows** resume exactly where they were. Drafts survive a reload, except payment data.

## Worst-case data
Seed realistic data. Provide a dev-only data switch (`?data=demo|worst|empty|one|many`, or workshop controls), and keep the worst-case fixture as a regression test.

- **Names:**
  - `Aleksandra Wiśniewska-Kowalczyk`, `Christopher Alexander Montgomery III`
  - `Jo`, `J`
  - `Đặng Thị Ngọc Hân`, `王秀英`, a right-to-left name
  - `👩🏽‍💻 Priya`
  - a missing name
- **Strings:**
  - `bartholomew.fitzgerald@northwind-industries-holdings.example.com`
  - a long URL, a UUID
  - `Q3 Board Deck FINAL (revised) v12 [approved by legal].pdf`
  - long compound words (`Benachrichtigungseinstellungen`)
  - 12 tags
  - a newline in a single-line field, a 2,000-character paste, `<script>`
- **Numbers:**
  - 0, 1 (watch "1 members"), 1284, 1e6
  - `12345678.9` in a currency, `-42.5`, 142%
  - null, NaN
  - 99 becoming 100 live
- **Collections:** 0, 1, a page size, a page size plus one, 1,000+, one item ten times larger than the rest, duplicate names.
- **Time:** now, 12 days ago, 11 months ago, the future, 1970-01-01, a timezone day boundary.
- **Media:** an avatar that 404s, no avatar, a 4000×200 image, a dark logo on a dark ground.
- **Environment:** the real container width, 320px and the widest; 200% zoom; dark mode; RTL; touch.

## Failure signature → fix
| Signature | Fix |
|---|---|
| Squashed avatar or icon | `flex-shrink: 0` |
| Text overflowing its box | `min-width: 0` |
| URL or email pushes siblings out | `overflow-wrap: anywhere` |
| Squashed badge | `flex-shrink: 0`; the row may wrap, never clip |
| Wrong initials | An avatar fallback, or `Intl.Segmenter` |
| Orphan "—" for a missing optional meta line | Omit the line (table cells keep '—') |
| Raw `NaN` or `1284` | `Intl.NumberFormat`, plus a null state |
| Clipped diacritics | Looser line-height; no `overflow: hidden` on text |
| Button overflows when translated | `min-width`, not `width`. Shorten first; it may wrap; never clip |

## i18n
- **Direction:** logical properties (`margin-inline-start`) so RTL works.
- **Text:** ICU plurals. `Intl.*` for dates, numbers and currency. Locale quotes.
- **Scripts:** CJK line breaking, and font fallback stacks that cover the scripts you ship.
- **Detection:** language from `navigator.languages` and the user's settings, never from IP. Brand names and code tokens get `translate="no"`.
