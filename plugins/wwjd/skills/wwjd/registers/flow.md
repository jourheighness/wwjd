# Flow: signup, onboarding, auth, wizards, long forms, checkout forms

Success: the person finishes the sequence without thinking about the form.

## Ask less
- **Only ask what only the person knows.** Derive the rest: postcode gives the city, the email domain gives SSO.
- **Never ask twice** for data already given (WCAG 2.2, 3.3.7).
- **Optional fields** go behind "+ Add details". Nothing optional sits on the critical path.
- **Default** whenever the answer is predictable.
- **No reassurance in hints:** never "You can change it later" or "We'll set sensible defaults". If a choice is changeable, make it easy to change; don't say so.

## Shape
- **One column,** one task per step. On the web, labels sit above fields; native apps follow the platform (Material text fields may float). A field's width signals the expected length.
- **Narrow layouts:** a narrow auth form may be the page's one centred column. Text inside it stays start-aligned.
- **Progress:** steps are named and the done ones are marked. Use names, not "Step 3 of 5"; "Question 3 of 7" is acceptable in long public-service forms.
- **Counts that are decision inputs stay** (remaining characters on a limited field).
- **Back keeps the data.** Long flows save and resume.

## Input
- **Attributes:** `autocomplete` on every field (WCAG 1.3.5), the right `type` and `inputmode`. Paste and password managers always work.
- **Mobile:** inputs at least 16px so iOS doesn't zoom. Native date and select pickers are fine on touch.
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
