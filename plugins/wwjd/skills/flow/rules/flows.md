# Flows: how the app works, screen to screen

The how behind wwjd:flow. A flow is the app's structure as data (`wwjd.flow.json`): screens, the ways between them, the journeys people take. `flow.mjs check` enforces what it can; the rest is here.

## Modelling it
- **Start from jobs, not screens:** the 3–5 things people come to do (PRODUCT.md, `../../ux/references/product-types.md` **Jobs**), each one journey with a goal in their words ("A member", "Refund sent"). Screens fall out of the journeys.
- **One job per screen,** written as the person's verb ("Pick the card that fits"), never the screen's noun ("Pricing"). Two jobs on one screen: split it, or one is secondary and goes one step away.
- **Every way out of a screen is an edge:** primary action, back, cancel, undo, error, the link in the email. A control with no edge is a dead button; an edge with no control is a lie.
- **States live on their screen,** not as screens: empty, loading, error, no permission. A state that changes the job (a confirmation, a review) is its own screen.
- **Entries are real arrival points:** the home page, a deep link, an email, a notification, a shared URL. Each lands on a screen that works cold (no "go back" to a place the person never saw).
- **Name edges by the control's label** ("Choose a card", "Keep my card"): the flow reads as the UI will.

## Do
- **A to B, then B to done:** every journey ends on its result (a confirmation, the record, the sent message), and every terminal screen offers the next sensible step.
- **Shortest path for the frequent job;** the rare and the destructive may take a step more, never the reverse.
- **Back keeps the data;** leaving mid-journey keeps a draft, coming back resumes the step.
- **Destructive, money, legal, sent to others:** one review step that states the consequence in plain words (what, when, what it costs), then the action, then Undo where the system allows (`../../ux/SKILL.md` Floor: Reversibility).
- **Leaving takes no more steps than joining:** cancel ≤ sign up, unsubscribe ≤ subscribe, delete account ≤ create account (Floor: Honesty). Model the pair with `undoes`.
- **Errors route somewhere useful:** a failed payment returns to the payment step with the data kept and the reason shown; never to the start.
- **Value before the wall:** browse, try, configure before sign in; the account is asked for at the step that needs it, and returns the person to where they were.
- **Permission and plan limits are paths:** a locked action explains why and links to the way in (ask an admin, upgrade), never a silent disabled button.
- **One way per job:** two routes to the same result look different and confuse; pick one, link the other place to it.

## Don't (never this → instead)
- **Dead end** (a screen with no way on or back) → a next step, or back to where the person came from.
- **Trap** (screens you can enter but never leave: a modal chain, a forced tour, a paywall loop) → an exit on every screen of it.
- **Confirm dialog for a reversible change** → do it, then Undo in a toast.
- **"Are you sure?" with no facts** → a review that says what happens and when.
- **Login wall on the first screen** → value first, account at the step that needs it.
- **A wizard for a three-field form** → one screen; wizards only for long, branching or legally staged input.
- **Hidden exit** (cancel buried in settings, behind chat, by phone only) → the same depth as joining, in the account area.
- **Back button that loses input** → keep the step's data; warn only when data would truly be lost.
- **Redirect to home after an action** → stay on the result, or on the list with the changed item in view.
- **Dark-pattern loops** (retention offers on every cancel step, pre-ticked add-ons, forced continuity) → at most one honest offer, then the action.

## Checking it
- `flow.mjs check` must report no errors before building; a warning stays only with a reason in the handover.
- **Walk each journey aloud** against the screens: what does the person see, what do they press, where do they land. A step you can't say in one sentence is two steps or a bad screen.
- **Test the worst entry:** each journey started from a deep link, a stale email, with no permission, offline.
- **Count steps** for the top job and for its undo; write both in the handover when they differ.
