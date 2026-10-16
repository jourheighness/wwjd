# Flow: signup, onboarding, auth, wizards, long forms, checkout forms

Success: the person finishes the sequence without thinking about the form.

## Ask less
- **Only ask what only the person knows.** Derive the rest: postcode gives the city, the email domain gives SSO.
- **Never ask twice** for data already given (WCAG 2.2, 3.3.7).
- **Optional fields** go behind "+ Add details". Nothing optional sits on the critical path.
- **Default** whenever the answer is predictable.
- **No reassurance in hints:** never "You can change it later" or "We'll set sensible defaults". If a choice is changeable, make it easy to change; don't say so.

## Shape
- **One column,** one task per step. On the web, labels sit above fields; native apps follow the platform (Material text fields may float).
- **Fields in a stack share one width,** the column's full width: name, email, password and selects line up on both edges. Only short fixed-format fields get a narrower width (postcode, CVC, expiry, one-time code, year), set together on a row of their own.
- **Choice sets:** 2–4 options as segmented buttons on one row (`commands/prioritize.md`). More than 4, or labels that won't fit on one line: cut or merge the options first ("Just me / 2–50 / 51–500 / 500+"), otherwise use a select. Never a multi-row grid of option buttons.
- **Narrow layouts:** a narrow auth form may be the page's one centred column. Text inside it stays start-aligned.
- **Progress:** steps are named and the done ones are marked. The stepper is one row that never wraps on desktop (it collapses to "Step name · 2 of 4" only when it can't fit). Every step is the same element with the same box in every state; a done step that can be revisited is a button styled exactly like the others, never an underlined link. Use names, not "Step 3 of 5"; "Question 3 of 7" is acceptable in long public-service forms.
- **Counts that are decision inputs stay** (remaining characters on a limited field).
- **Back keeps the data.** Long flows save and resume.

## Action bar and exits
- **Back sits at the top,** never next to the primary. It's a quiet "‹ Previous step name" above the step heading, or the previous step in the stepper. Back and the primary action side by side read as two equal choices.
- **The action bar has one anatomy on every step,** aligned to the content column's edges:
  - Start: the summary (total, item count) in the same place on every step.
  - End: the primary.
  - Only the primary's label changes ("Continue" → "Review" → "Place order and pay").
  - The total never moves into the button. It stays in its slot, and the button sits next to it.
- **There is always a way out.** On every step the wordmark links home, and a quiet "Back to <site>" (or Cancel) leaves while the draft is kept. Coming back restores the step and its data. A flow that traps the person is a dead end.

## Input
- **Attributes:** `autocomplete` on every field (WCAG 1.3.5), the right `type` and `inputmode`. Paste and password managers always work.
- **Mobile:** inputs at least 16px so iOS doesn't zoom. Selects and date pickers come from the component system on touch too, never the OS dropdown.
- **Validation:**
  - Format errors on blur once the field has input; required-field errors on submit. The error sits at the field and says how to fix it.
  - Long forms get an error summary on submit that links to each field.
  - Never disable submit until the form is valid.
- **Helper text** only where it prevents an error: format hints and "why we ask" stay. Legal and consent text always stays.

## Auth
- **Passkeys first.** No cognitive tests (WCAG 2.2, 3.3.8).
- **Password rules appear as the person starts typing,** and tick off live. They are not permanent helper text, and never revealed only after a failed attempt.
- **Show password is an eye icon** inside the field, appearing once there is input, with `aria-pressed` and an accessible name. Not a "Show" text button.

## Onboarding
- **Land on first value** with seeded example content. Skippable.
- **No tours.** Teach once, in empty states and example content, then step aside.
- **No completion meters** or "You're 60% done" pressure.

## Mobile
- **The primary action** sits sticky at the bottom, above the keyboard.

## Tells to avoid
- Multi-column forms.
- Placeholder-only labels; floating labels on the web.
- Password rules revealed after failure.
- Confetti on signup.
- "Are you sure you want to leave?" when nothing would be lost.
