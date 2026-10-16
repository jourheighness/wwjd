# Flow: signup, onboarding, auth, wizards, long forms, checkout forms

Success: the person finishes the sequence without thinking about the form.

## Ask less
- **Only ask what only the person knows.** Derive the rest: postcode gives the city, the email domain gives SSO.
- **Never ask twice** for data already given (WCAG 2.2, 3.3.7).
- **Optional fields** go behind "+ Add details". Nothing optional sits on the critical path.
- **Default** whenever the answer is predictable.

## Shape
- **One column,** labels above the fields, one task per step. A field's width signals the expected length.
- **Narrow layouts:** a narrow auth form may be the page's one centred column. Text inside it stays start-aligned.
- **Progress:** steps are named and the done ones are marked. Use names, not "Step 3 of 5".
- **Back keeps the data.** Long flows save and resume.

## Input
- **Attributes:** `autocomplete` on every field (WCAG 1.3.5), the right `type` and `inputmode`. Paste and password managers always work.
- **Mobile:** inputs at least 16px so iOS doesn't zoom. Native date and select pickers are fine on touch.
- **Validation:**
  - Validate on blur. The error sits at the field and says how to fix it.
  - Long forms get an error summary on submit that links to each field.
  - Never disable submit until the form is valid.
- **Helper text** only where it prevents an error (a format, why a sensitive field is asked). Legal and consent text always stays.

## Auth
- **Passkeys first.** No cognitive tests (WCAG 2.2, 3.3.8). Show password rules before the first attempt, not after it fails.

## Onboarding
- **Land on first value** with seeded example content. Skippable.
- **No tours.** Teach once, in empty states and placeholders, then step aside.
- **No completion meters** or "You're 60% done" pressure.

## Mobile
- **The primary action** sits sticky at the bottom, above the keyboard.

## Tells to avoid
- Multi-column forms.
- Floating or placeholder-only labels.
- Password rules revealed after failure.
- Confetti on signup.
- An "Are you sure you want to leave?" trap.
