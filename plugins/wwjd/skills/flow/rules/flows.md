# Flows: how the app works, screen to screen

The how behind wwjd:flow. A flow is the app's structure as data (`wwjd.flow.json`): screens, the ways between them, the journeys people take. `flow.mjs check` enforces what it can; the rest is here. Each screen's states: `../../ux/rules/states.md`; forms, auth and onboarding inside a step: `../../ux/registers/flow.md`. Sources: `../references/sources.md`.

## Modelling it
- **Start from jobs, not screens:** the 3–5 things people come to do (PRODUCT.md, `../../ux/references/product-types.md` **Jobs**), each one journey with a goal in their words ("A member", "Refund sent"). Screens fall out of the journeys.
- **One job per screen,** written as the person's verb ("Pick the card that fits"), never the screen's noun ("Pricing"). Two jobs on one screen: split it, or one is secondary and goes one step away.
- **Every way out of a screen is an edge:** primary action, back, cancel, undo, error, the link in the email. A control with no edge is a dead button; an edge with no control is a lie.
- **States live on their screen,** not as screens: empty, loading, error, no permission. A state that changes the job (a confirmation, a review) is its own screen.
- **Entries are real arrival points:** the home page, a deep link, an email, a notification, a shared URL. Each lands on a screen that works cold, and its back or Up leads to the screen's parent, never out of the app (Android navigation principles).
- **Mark modals** (`"modal": true`): one short task, an obvious Cancel or Close, one modal at a time; a multi-step modal is one screen (Apple HIG Modality).
- **Name edges by the control's label** ("Choose a card", "Keep my card"): the flow reads as the UI will.

## Do
- **A to B, then B to done:** every journey ends on its result (a confirmation, the record, the sent message). The end is what people remember (peak-end): it says what happened, what happens next and when, gives a reference to keep, and offers the next sensible step (GOV.UK confirmation pages).
- **Shortest path for the frequent job;** the rare and the destructive may take a step more, never the reverse.
- **Steps by frequency:** a task people repeat sits on one screen; a rare, unfamiliar or public one goes one thing per page (NN/g wizards, GOV.UK form structure). A form finished over several sittings: a task list, any order where it can be (GOV.UK).
- **Let people out early:** eligibility and blockers first, then the common path; branch so each person sees only their questions (GOV.UK form structure).
- **Back keeps the data;** leaving mid-journey keeps a draft, coming back resumes the step. After a one-time action (pay, send) back never repeats it (GOV.UK question pages).
- **Destructive, money, legal, sent to others:** one review step that states the consequence in plain words (what, when, what it costs), then the action, then Undo where the system allows (`../../ux/SKILL.md` Floor: Reversibility; WCAG 3.3.4).
- **A review lets people correct:** each answer links to its step, and saving a change returns to the review, not through the rest; Cancel keeps things as they were (GOV.UK check answers).
- **Leaving takes no more steps than joining,** counted from where people arrive: cancel ≤ sign up, unsubscribe ≤ subscribe, delete account ≤ create account, withdraw consent ≤ give it, in the channel they joined through (Floor: Honesty; GDPR 7(3); DSA Art. 25). Model the pair with `undoes`.
- **Errors route somewhere useful:** a failed payment returns to the payment step with the data kept and the reason shown; never to the start (NN/g heuristic 9).
- **Value before the wall:** browse, try, configure before sign in; the account is asked for at the step that needs it and returns the person to where they were (NN/g login walls). A guest's account offer comes on the confirmation, prefilled, password only (Baymard).
- **Permission and plan limits are paths:** a locked action explains why and links to the way in (ask an admin, upgrade), never a silent disabled button. Device permissions are asked when the feature first needs them (Apple HIG).
- **Many ways to find, one way to do:** navigation, search and links may all reach a screen (WCAG 2.4.5); the job itself happens in one place, and the others link to it.
- **Same place on every screen:** navigation and help (contact, FAQ, chat) keep their position and order through the app and its flows (WCAG 3.2.3, 3.2.6).
- **Top level visible:** desktop never hides it behind a menu; mobile shows up to 5 in a tab bar that keeps each tab's place and never disables a tab (NN/g hamburger study, Apple tab bars).
- **The whole service can fail:** an unavailable screen says when it is back, what happened to answers, and another way to get it done (GOV.UK service unavailable).

## Don't (never this → instead)
- **Dead end** (a screen with no way on or back) → a next step, or back to where the person came from.
- **Trap** (screens you can enter but never leave: a modal chain, a forced tour, a paywall loop) → an exit on every screen of it.
- **Modal on a modal** → finish or close the first, or make the task a page (Apple HIG).
- **Interrupting modal** for an upsell, a newsletter or inside checkout → inline, or after the result (NN/g modals).
- **Confirm dialog for a reversible change** → do it, then Undo in a toast.
- **"Are you sure?" with no facts** → a review that names the item and what happens, buttons named by outcome ("Delete file", "Keep file") (NN/g confirmation dialogs).
- **Login wall on the first screen** → value first, account at the step that needs it.
- **A wizard for a frequent or three-field task** → one screen.
- **Hidden exit** (cancel buried in settings or a policy page, behind chat, by phone only) → the same depth as joining, in the account area.
- **Back button that loses input** → keep the step's data; warn only when data would truly be lost.
- **Redirect to home after an action** → stay on the result, or on the list with the changed item in view.
- **Dark-pattern loops** (retention offers on every cancel step, pre-ticked add-ons, forced continuity) → at most one honest offer with Cancel beside it, then the action (California auto-renewal law).
- **Fake progress** to hurry people (goal-gradient tricks) → real steps, named; progress only when the total is known (GOV.UK question pages).

## Checking it
- `flow.mjs check` must report no errors before building; a warning stays only with a reason in the handover.
- **Walk each journey aloud** against the screens: what does the person see, what do they press, where do they land. A step you can't say in one sentence is two steps or a bad screen.
- **Test the worst entry:** each journey started from a deep link, a stale email, a bookmarked confirmation, with no permission, offline, after the session expired.
- **Count steps** for the top job and for its undo, from where people arrive; write both in the handover when they differ.
