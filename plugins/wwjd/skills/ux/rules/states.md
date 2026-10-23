# States: interactive, data, worst case, failure, i18n

The how behind SKILL.md's States and flow rule.

## Interactive states
- **Eight:** default, hover, focus-visible, active (pressed within 100ms), disabled, loading, error, success. Hover without focus is the common miss.
- **One box per state:** a step, tab, row or chip keeps its element, padding, font and height through done, active, selected and clickable. If one state is interactive, render all as that element (never a `<span>` swapped for a `<button>`), `aria-disabled` until it applies.
- **Steps, tabs, chips and rows are never underlined;** affordance is hover fill and focus ring (lint `underlined-control`).
- **One home per state:** one control and one mark per state, so no copy can disagree. Dependents show the state in place, never a second control (an "Enable" in a header duplicating the switch above); at most a link that focuses the one control. A setting still keeps its row on the person's settings page, opening that same control.
- **A change touches only what changed:** a click or selection never hides or swaps neighbouring meta; patch the element in place, never re-render the list (rebuilt rows flash).
- **All states side by side** in the workshop; a state that moves or restyles a neighbour is a defect.
- **Hidden stays hidden:** `kit/base.css` ships `[hidden] { display: none !important }` (lint `hidden-guard`). One state per view: a result replaces the step it completes.

## Value displays
- **Check 0, partial and max in the render** (stars, bars, meters, progress, sparklines, gauges): correct code proves nothing until the fill is seen.
- **Fills need a real box:** clip, mask or % width only on a block or inline-block with an explicit size (lint `fill-on-inline`, runtime `value-fill-empty`); prefer `<meter>`, `<progress>`. The accessible name carries the value ("4.6 out of 5").

## Data states
| State | Treatment |
|---|---|
| First use | Seeded example content plus one action; may teach once |
| One item | Doesn't look broken or lonely |
| Many | Priority stays visible. Virtualise only when measured slow (it breaks find-in-page, print, screen-reader counts) |
| Empty | One line plus one action, in the region's own box: it never collapses, hides or changes height (Stability). Table cells "—" with accessible text "None" |
| Filtered empty | Echo the query, offer to clear filters, suggest the next query |
| Loading | Skeleton matching the final layout; spinner only inside a button, keeping its label. Skeleton only past 400ms (`wwjd:motion` owns the timing), time out into error + retry |
| Refetch, poll | Stale data stays with a quiet refresh mark; never back to a skeleton |
| Error | What happened + retry, in place; a failing region is isolated |
| No permission | Why, and how to get access |
| Partial, stale | Show what exists; mark the rest quietly |
| Offline | Say so; queue what can be queued |
| 401 / 403 / 404 / 429 / timeout | Sign in again / permission state / not-found state / rate-limit line / retry |

- **Response:** acknowledged in 100ms; past ~1s progress in place; past ~10s determinate progress when the duration is known, else a live status line. Never fake or stalling progress.
- **Optimistic updates** where success is likely; on failure roll back with an inline error. Autosave never fails silently.
- **Optional platform APIs fail soft:** storage, history, clipboard and share are wrapped in try/catch, and the page renders without them (embeds, sandboxes, private windows).
- **Live updates merge in place:** scroll, selection and open rows survive. Server and client render the same date, theme and auth (no hydration flip).
- **Interrupted flows resume exactly:** drafts survive reload (not payment data); a session timeout warns, extends and keeps the draft.

## Worst-case data
A dev-only switch (`?data=demo|worst|empty|one|many` or workshop controls); the worst-case fixture stays as a regression test.
- **Names:** very long and double-barrelled (`Aleksandra Wiśniewska-Kowalczyk`), 1–2 letters, Vietnamese diacritics, CJK, RTL, a leading emoji, missing.
- **Strings:** a 60-character email, a long URL, a UUID, `Q3 Board Deck FINAL (revised) v12 [approved by legal].pdf`, a German compound (`Benachrichtigungseinstellungen`), 12 tags, a newline in a single-line field, a 2,000-character paste, `<script>`.
- **Numbers:** 0, 1 ("1 members"), 1284, 1e6, `12345678.9` as currency, `-42.5`, 142%, null, NaN, 99 → 100 live.
- **Collections:** 0, 1, a page, a page + 1, 1,000+, one item ten times larger, duplicate names.
- **Time:** now, 12 days ago, 11 months ago, future, 1970-01-01, a timezone day boundary.
- **Media:** 404 avatar, no avatar, a 4000×200 image, a dark logo on a dark ground.
- **Environment:** real container width, 320px and the widest, 200% zoom, dark, RTL, touch.

## Failure signature → fix
- Squashed, overflowing or pushed-out content: `rules/layout.md` § Wrapping and truncation.
- Wrong initials: avatar fallback, or `Intl.Segmenter`. Raw `NaN` or `1284`: `Intl.NumberFormat` plus a null state. Clipped diacritics: looser line-height, no `overflow: hidden` on text.

## i18n
- Logical properties; `dir="auto"` on user text; directional icons mirrored in RTL.
- ICU MessageFormat for plurals and interpolation, never concatenation or `n === 1`. `Intl.*` for dates, numbers, currency, sorting (`Intl.Collator`), week start, 12/24h; locale quotes.
- CJK line breaking; font stacks covering every shipped script.
- Language from the person's setting, else `navigator.languages`, never IP; remembered. Pickers list names in their own language ("Svenska"), never flags. `translate="no"` on brand names and code. No text in images.
