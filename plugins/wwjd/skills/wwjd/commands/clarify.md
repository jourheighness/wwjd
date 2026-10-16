# clarify: labels, UI copy, errors, empty states

In product UI, copy is labels, values and one-line states. Persuade and Editorial need full written content; draft it in the register's voice and flag anything unconfirmed.

## Labels
- **Actions are a verb plus their target:**
  - "Send invite to Anna", not "Submit".
  - "Delete 5 items", not "Delete selected".
  - Remove takes it out of here and it still exists elsewhere. Delete destroys it: offer undo, or a review step when it truly can't be undone.
  - Keep the verb through the flow: "Publish" becomes "Published".
- **Never use:** OK, Submit, Yes/No, Click here, Learn more, Get started.
- **Short:** usually up to 4 words; legally required wording (e.g. the EU order button) is never shortened. Shorten first; it may wrap; never clip.
- **Vocabulary:**
  - One term per concept across the product, from the product's own glossary.
  - No system words (status, event, run, signal).
  - Plain words first, with codes and identifiers as quiet secondary text.
- **Case:** sentence case, unless the platform says otherwise. No uppercase labels. Periods on sentences, not on labels.

## Numbers and time
- **Numbers:**
  - A number earns its place by telling the person something they act on.
  - **Progress of a small set** ("3 of 8 tasks done") is information. Show it as label → number → bar: a muted, small (11–12px) label with the count, end-aligned above a progress bar. At tight sizes the label drops and the bar stays (`fit.md`).
  - **Big aggregate counts** ("388 unread notifications", "1,204 events") are noise: a needs-you dot, or nothing. Past a handful, a count stops changing what anyone does.
  - **Never** zero counts, pressure counts ("You're 60% done"), or counts that repeat what a bar or list already shows.
  - Format with `Intl.*` in the right locale. Pluralise with i18n, never with string tricks.
  - Use `tabular-nums` wherever numbers align or change.
- **Time:**
  - Relative for about the last week ("Today", "Fri"); absolute after that; absolute always in logs, audits and anything people sort or compare. Full timestamp in a tooltip.
  - In editorial and reference pages, use absolute dates.

## Voice
- **Plain, direct, informed once.** Trust the reader.
- **No tells of AI writing:**
  - em or en dashes in English UI strings (prose and other locales' conventions are different)
  - tricolons, signposting, hype
  - "not just X, but Y", "X, not Y" tails
  - aphoristic fragments ("No setup. Just results.")
- **Never these buzzwords:** seamless, leverage, elevate, streamline, empower, supercharge, unlock, cutting-edge, robust, effortless, delve.
- **Claims about the world are checkable:** specific, falsifiable, and verifiable by the person ("3 rooms at this rate, updated 14:14"; "Access ends Tue 6 May. No further charges."). Never vague pressure ("Only 1 left!").
- **Localised UI is written natively.** Follow the locale's own style guide; never translate word for word.

## Errors and states
- **Errors:** say what happened and how to fix it, at the field, without blame or apology. "Enter a date as YYYY-MM-DD", not "Invalid date". No "Oops", no exclamation marks.
- **Empty states:** one line plus one action. Seeded example content may teach a feature the first few times, then steps aside.
- **Success** is visually silent when the effect is visible, and still announced to assistive tech (`role=status`). Visible feedback is only for effects the person can't see: a quiet "Saved" mark for autosave, an add-to-cart confirmation, a toast for something that happened elsewhere. Error toasts never auto-dismiss.
- **AI:** says in one sentence what it did, where it did it.

## Never cut
Legal, consent, pricing, safety and accessibility text: alt text, `aria-label`, error announcements. Alt text stands on its own ("Revenue up 40% in Q4", not "Chart").
