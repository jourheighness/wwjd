# Flow: signup, onboarding, auth, wizards, long forms, checkout forms

Profile: `data-profile="consumer"`, primary width 390. Colour: neutral; the accent marks only the primary action.

Success: the person finishes the sequence without thinking about the form. Layouts: `wizard`, `auth-card`, `fullscreen-flow`, `empty-first-run`.

## Ask less
- **Only ask what only the person knows.** Derive the rest (postcode → city, email domain → SSO). Never ask twice for given data (WCAG 3.3.7).
- **Optional fields** go behind "+ Add details"; nothing optional on the critical path. Default whenever the answer is predictable.
- **No login wall before value:** browse and guest first; the account comes after the first value.
- **No reassurance in hints** ("You can change it later"): make it easy to change instead.

## Shape
- **One column, one task per step.** Web labels sit above fields; native follows the platform.
- **Stacked fields share one width,** the column's full width, lined up on both edges. Only short fixed-format fields (postcode, CVC, expiry, one-time code, year) go narrower, together on their own row.
- **Choice sets:** >4 options or labels that won't fit one line: cut or merge first ("Just me / 2–50 / 51–500 / 500+"), else a select (`rules/actions.md` Choice sets). Never a multi-row grid of option buttons.
- **Narrow auth form** may be the page's one centred column; text inside stays start-aligned.
- **Progress:** named steps, done ones marked. The stepper is one row that never wraps on desktop (collapses to "Step name · 2 of 4" only when it can't fit). Every step is the same element with the same box in every state; a revisitable done step is a button styled like the others, never an underlined link. Names, not "Step 3 of 5"; "Question 3 of 7" is fine in long public-service forms.
- **Back keeps the data.** Long flows save and resume.

## Action bar and exits
- **Back sits at the top,** never beside the primary: a quiet "‹ Previous step name" above the heading, or the stepper.
- **One action-bar anatomy on every step,** aligned to the column edges: start = the summary (total, item count) in the same slot every step; end = the primary. Only the primary's label changes ("Continue" → "Review" → "Place order and pay"). The total never moves into the button.
- **Always a way out:** the wordmark links home and a quiet "Back to <site>" (or Cancel) leaves with the draft kept; coming back restores the step and data.

## Input
- `autocomplete` on every field (WCAG 1.3.5), the right `type` and `inputmode`. Paste and password managers always work.
- **Validation:** format errors on blur once there's input; required errors on submit. The error sits at the field and says how to fix it. Long forms get a linked error summary. Never disable submit until valid.
- **Helper text** only where it prevents an error: format hints and "why we ask".
- **Mobile:** the primary sticks at the bottom, above the keyboard.

## Auth
- **Passkeys first.** No cognitive tests (WCAG 3.3.8).
- **Password rules appear as the person types** and tick off live; never permanent helper text, never revealed after a failure.
- **Show password** is an eye icon inside the field once there's input, with `aria-pressed` and an accessible name; not a "Show" text button.

## Onboarding
- **Land on first value** with seeded example content; skippable.
- **No tours:** teach once, in empty states and example content, then step aside.
- **No completion meters** or "You're 60% done" pressure.

## Tells to avoid
- Multi-column forms; placeholder-only labels; floating labels on the web.
- Confetti on signup; "Are you sure you want to leave?" when nothing would be lost.
