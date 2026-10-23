# Flow: signup, onboarding, auth, wizards, long forms, checkout forms

Profile: `data-profile="consumer"`, primary width 390. Colour: neutral; the accent marks only the primary action.

Success: the person finishes the sequence without thinking about the form. Layouts: `wizard`, `auth-card`, `fullscreen-flow`, `empty-first-run`.

## Ask less
- **Only ask what only the person knows.** Derive the rest (postcode → city, email domain → SSO). Never ask twice for given data (WCAG 3.3.7).
- **Optional fields** go behind "+ Add details"; nothing optional on the critical path. Prefill a default whenever most people give the same answer.
- **No login wall before value:** browse and guest first; the account comes after the first value, unless that value is private data (banking, health, a work account).

## Shape
- **One column, one task per step.** Web labels sit above fields; native follows the platform.
- **Stacked fields share the column's full width,** lined up on both edges. Only short fixed-format fields (postcode, CVC, expiry, one-time code, year) go narrower, together on their own row.
- **Choice sets** (`rules/actions.md`): cut or merge first ("Just me / 2–50 / 51–500 / 500+"), then a radio list, else a select. Never a multi-row grid of option buttons.
- **Narrow auth form** may be the page's one centred column; text inside stays start-aligned.
- **Progress:** named steps (not "Step 3 of 5"; "Question 3 of 7" is fine in long public-service forms), done ones marked. The stepper is one row, never wrapped on desktop; it collapses to "Step name · 2 of 4" only when it can't fit. Steps keep one element in every state (`rules/states.md` One box per state).
- **Back keeps the data;** long flows save and resume.

## Action bar and exits
- **Back sits at the top,** never beside the primary: a quiet "‹ Previous step name" above the heading, or the stepper.
- **One action-bar anatomy on every step,** aligned to the column edges: start = the summary (total, item count) in the same slot every step; end = the primary. Only the primary's label changes ("Continue" → "Review" → "Place order and pay"). The total never moves into the button.
- **Always a way out:** the wordmark links home and a quiet "Back to <site>" (or Cancel) leaves with the draft kept; coming back restores the step and data.

## Input
- `autocomplete` on every field (WCAG 1.3.5), the right `type` and `inputmode`. Paste and password managers always work.
- **Validation:** format errors on blur once there's input; required errors on submit, at the field (`rules/copy.md` Messages). Long forms get a linked error summary. Never disable submit until valid.
- **Helper text** only where it prevents an error: format hints and "why we ask".
- **Mobile:** the primary sticks to the bottom, above the keyboard.

## Auth
- **The audience's easiest strong sign-in first:** passkeys for consumers, SSO for work accounts. No cognitive tests (WCAG 3.3.8).
- **Password rules appear as the person types** and tick off live; never permanent, never only after a failure.
- **Show password:** one toggle once there's input (an eye icon in the field, or a "Show" button), `aria-pressed`, an accessible name.

## Onboarding
- **Land on first value** with seeded example content; skippable.
- **No tours:** teach once, in empty states and example content, then step aside.
- **No completion meters** (`rules/copy.md` Numbers and time).

## Tells to avoid
- Multi-column forms; placeholder-only labels; floating labels on the web.
- Confetti on signup; "Are you sure you want to leave?" when nothing would be lost.
