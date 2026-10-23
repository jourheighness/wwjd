# Flows: how the app works, screen to screen

A flow is the app's structure as data (`wwjd.flow.json`): screens, the ways between them, the journeys people take. `flow.mjs check` enforces what it can; the rest is here. Each screen's states: `../../ux/rules/states.md`; forms, auth and onboarding inside a step: `../../ux/registers/flow.md`. Sources: `../references/sources.md`.

## Modelling it
- **Start from jobs, not screens:** the 3–5 things people come to do (PRODUCT.md, `../../ux/references/product-types.md` **Jobs**), each one journey with a goal in their words ("A member", "Refund sent"). Screens fall out of the journeys.
- **One job per screen,** as the person's verb ("Pick the card that fits"), never the screen's noun ("Pricing"). Two jobs: split the screen, or move the secondary one a step away.
- **Every way out of a screen is an edge:** primary action, back, cancel, undo, error, the link in the email. A control with no edge is a dead button; an edge with no control is a lie.
- **States live on their screen** (empty, loading, error, no permission). A state that changes the job (a confirmation, a review) is its own screen.
- **Entries are real arrival points** (home, deep link, email, notification, shared URL). Each lands on a screen that works cold; its back or Up leads to the screen's parent, never out of the app (Android).
- **Mark modals** (`"modal": true`): one short task, an obvious Cancel or Close, one at a time; a multi-step modal is one screen (Apple HIG).
- **Name edges by the control's label** ("Choose a card", "Keep my card").

## Do
- **Every journey ends on its result** (a confirmation, the record, the sent message). The end is remembered (peak-end): say what happened, what happens next and when, give a reference, offer the next step (GOV.UK).
- **Shortest path for the frequent job;** the rare and the destructive may take a step more, never the reverse.
- **Steps by frequency:** a repeated task sits on one screen; a rare, unfamiliar or public one goes one thing per page (NN/g, GOV.UK). A form finished over several sittings: a task list, any order where possible.
- **Let people out early:** eligibility and blockers first; branch so each person sees only their questions.
- **Back keeps the data;** leaving mid-journey keeps a draft and returning resumes the step. Back never repeats a one-time action (pay, send).
- **Destructive, money, legal, sent to others:** one review step stating the consequence (what, when, what it costs), then the action, then Undo where possible (wwjd:ux Floor: Reversibility; WCAG 3.3.4).
- **A review lets people correct:** each answer links to its step; saving returns to the review; Cancel keeps things as they were.
- **Leaving takes no more steps than joining,** counted from where people arrive and in the channel they joined through: cancel ≤ sign up, unsubscribe ≤ subscribe, delete account ≤ create, withdraw consent ≤ give (Floor: Honesty; GDPR 7(3); DSA Art. 25). Model the pair with `undoes`.
- **Errors route somewhere useful:** a failed payment returns to the payment step, data kept, reason shown; never to the start.
- **Value before the wall:** browse, try, configure before sign-in; ask for the account at the step that needs it and return the person to where they were. A guest's account offer comes on the confirmation, prefilled, password only (Baymard).
- **Permission and plan limits are paths:** a locked action says why and links to the way in (ask an admin, upgrade). Ask for device permissions when the feature first needs them.
- **Many ways to find, one way to do:** navigation, search and links may reach a screen (WCAG 2.4.5); the job happens in one place.
- **Navigation and help keep their position and order** on every screen (WCAG 3.2.3, 3.2.6).
- **Top level visible:** desktop never hides it behind a menu; mobile shows them in a tab bar (≤ 4 visible, NN/g; Apple allows 5) that keeps each tab's place and never disables a tab.
- **The service can fail:** an unavailable screen says when it is back, what happened to answers, and another way (GOV.UK).

## Don't (never this → instead)
- **Dead end** (no way on or back) → a next step, or back to where the person came from.
- **Trap** (enter but never leave: a modal chain, a forced tour, a paywall loop) → an exit on every screen of it.
- **Modal on a modal** → finish or close the first, or make the task a page.
- **Interrupting modal** for an upsell, a newsletter or inside checkout → inline, or after the result.
- **Confirm dialog for a reversible change** → do it, then Undo in a toast.
- **"Are you sure?" with no facts** → a review naming the item and outcome, buttons named by outcome ("Delete file", "Keep file").
- **A wizard for a frequent or three-field task** → one screen.
- **Hidden exit** (cancel in a policy page, by chat or phone only) → the same depth as joining, in the account area.
- **Back that loses input** → keep the step's data; warn only when data would truly be lost.
- **Redirect to home after an action** → stay on the result, or the list with the changed item in view.
- **Dark-pattern loops** (retention offers on every cancel step, pre-ticked add-ons, forced continuity) → at most one honest offer with Cancel beside it.
- **Fake progress** → real, named steps; progress only when the total is known.

## Checking it
- `flow.mjs check` reports no errors before building; a warning stays only with a reason in the handover.
- **Walk each journey aloud:** what the person sees, presses, lands on. A step you can't say in one sentence is two steps or a bad screen.
- **Test the worst entry:** each journey from a deep link, a stale email, a bookmarked confirmation, with no permission, offline, after the session expired.
- **Count steps** for the top job and its undo, from where people arrive; write both in the handover when they differ.
