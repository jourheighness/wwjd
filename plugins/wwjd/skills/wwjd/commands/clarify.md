# clarify: labels, UI copy, errors, empty states

A product interface carries labels, values and one-line states. Product narrative is written by people, in Persuade and Editorial (see those registers).

## Labels
- **Actions are a verb plus their target:**
  - "Send invite to Anna", not "Submit".
  - "Delete 5 items", not "Delete selected".
  - Delete means permanent; Remove means recoverable.
  - Keep the verb through the flow: "Publish" becomes "Published".
- **Never use:** OK, Submit, Yes/No, Click here, Learn more, Get started.
- **Short:** 1–3 words. If a label wraps to two lines, shorten it.
- **Vocabulary:**
  - One term per concept across the product, from the product's own glossary.
  - No system words (status, event, run, signal, notification).
  - Plain words first, with codes and identifiers as quiet secondary text.
- **Case:** sentence case, unless the platform says otherwise. No uppercase labels. Periods on sentences, not on labels.

## Numbers and time
- **Numbers:**
  - A number earns its place by changing a decision.
  - Format with `Intl.*` in the right locale. Pluralise with i18n, never with string tricks.
  - Use `tabular-nums` wherever numbers align or change.
- **Time:**
  - In apps, use relative time ("Today", "3 months ago") via `Intl.RelativeTimeFormat`, with the full date in a tooltip.
  - In editorial and reference pages, use absolute dates.

## Voice
- **Plain, direct, informed once.** Trust the reader.
- **No tells of AI writing:**
  - em or en dashes in UI strings (prose is different)
  - tricolons, signposting, hype
  - "not just X, but Y", "X, not Y" tails
  - aphoristic fragments ("No setup. Just results.")
- **Never these buzzwords:** seamless, leverage, elevate, streamline, empower, supercharge, unlock, cutting-edge, robust, effortless, delve.
- **Localised UI is written natively.** Follow the locale's own style guide; never translate word for word.

## Errors and states
- **Errors:** say what happened and how to fix it, at the field, without blame or apology. "Enter a date as YYYY-MM-DD", not "Invalid date". No "Oops", no exclamation marks.
- **Empty states:** one line plus one action. A placeholder may teach a feature the first few times, then steps aside.
- **Success** is silent when the effect is visible. Feedback is only for effects the person can't see: a quiet "Saved" mark for autosave, an add-to-cart confirmation, a toast for something that happened elsewhere. Error toasts never auto-dismiss.
- **AI:** says in one sentence what it did, where it did it.

## Never cut
Legal, consent, pricing, safety and accessibility text: alt text, `aria-label`, error announcements. Alt text stands on its own ("Revenue up 40% in Q4", not "Chart").
