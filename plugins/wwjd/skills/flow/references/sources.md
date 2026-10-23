# Sources behind the flow rules

What `../rules/flows.md`, `patterns.md` and the checker rest on, checked October 2026: source, link, what was taken.

## Heuristics and research
- **NN/g, 10 usability heuristics:** https://www.nngroup.com/articles/ten-usability-heuristics/ (status, emergency exit and undo, prevent high-cost errors, recover in plain words; `trap`, `modal-no-dismiss`, `no-failure-path`, `error-restarts`)
- **NN/g, wizards:** https://www.nngroup.com/articles/wizards/ (wizards for rare or novice tasks, never frequent ones; steps named; save and resume)
- **NN/g, progressive disclosure:** https://www.nngroup.com/articles/progressive-disclosure/ (two levels at most; staged steps only when they barely depend on each other)
- **NN/g, login walls:** https://www.nngroup.com/articles/login-walls/ (content first; account at the step that needs it; guest checkout; account offer after purchase)
- **NN/g, confirmation dialogs:** https://www.nngroup.com/articles/confirmation-dialog/ (only for serious consequences; name the item; buttons named by outcome; undo alongside)
- **NN/g, modal and nonmodal dialogs:** https://www.nngroup.com/articles/modal-nonmodal-dialog/ (no modals for inline errors, upsells or inside checkout)
- **NN/g, cancel vs close:** https://www.nngroup.com/articles/cancel-vs-close/ ("when in doubt, save, then out"; label Cancel, Close, Apply)
- **NN/g, hamburger menus (179 participants):** https://www.nngroup.com/articles/hamburger-menus/ (hidden nav used about half as often on desktop; desktop never hidden; mobile up to 4 visible)
- **NN/g, breadcrumbs:** https://www.nngroup.com/articles/breadcrumbs/ (location in the hierarchy, not history; for deep arrivals)
- **NN/g, empty states:** https://www.nngroup.com/articles/empty-state-interface-design/ (never "No records" while loading; direct path to fill it)
- **NN/g, mobile onboarding:** https://www.nngroup.com/articles/mobile-app-onboarding/ (skip it when possible; card tutorials don't help; teach in context)

## Checkout and accounts (Baymard)
- **Cart abandonment (2025 data):** https://baymard.com/lists/cart-abandonment-rate (70% average; extra costs 40%, forced account 18%, declined card 10%)
- **Checkout length:** https://baymard.com/blog/checkout-flow-average-form-fields (5.1 steps average; fields matter more than steps; 84% of sites fail to delay account creation)
- **Delayed account creation:** https://baymard.com/blog/delayed-account-creation (account offer on the confirmation page, prefilled, password only)
- **Guest checkout prominent:** https://baymard.com/blog/make-guest-checkout-prominent (a guest option people miss is no guest option)
- **Travel accommodations:** https://baymard.com/research/travel-accommodations (people arrive with dates; show availability and total price on the dates)

## Public services (GOV.UK)
- **Form structure:** https://www.gov.uk/service-manual/design/form-structure (question protocol; eligibility first; branching; start with one thing per page)
- **Question pages:** https://design-system.service.gov.uk/patterns/question-pages/ (back link; browser back works; one-time actions not repeatable; progress only when the total is reliable)
- **Check answers:** https://design-system.service.gov.uk/patterns/check-answers/ (Change links return to the review; `review-no-change`)
- **Confirmation pages:** https://design-system.service.gov.uk/patterns/confirmation-pages/ (reference, what happens next and when, next links, bookmark return; `end-no-next`)
- **Start using a service:** https://design-system.service.gov.uk/patterns/start-using-a-service/ (cost, time, what you'll need, other ways; button to the first question)
- **Complete multiple tasks:** https://design-system.service.gov.uk/patterns/complete-multiple-tasks/ (task list for multi-session forms; any order; few statuses)
- **GOV.UK One Login, save progress:** https://sign-in.service.gov.uk/documentation/design-recommendations/save-progress ("Save and come back later" under the primary action; email with the resume link)
- **Service unavailable:** https://design-system.service.gov.uk/patterns/service-unavailable-pages/ (when it's back, what happened to answers, another way)

## Accessibility (WCAG 2.2)
- **WCAG 2.2:** https://www.w3.org/TR/WCAG22/ (2.4.5 multiple ways; 3.2.3 consistent navigation; 3.2.6 consistent help; 3.3.4 reversible, checked or confirmed; 3.3.7 redundant entry; 2.2.5 re-authenticate without data loss)

## Platforms
- **Apple HIG, Modality:** https://developer.apple.com/design/human-interface-guidelines/modality (obvious dismiss; confirm before losing content; one modal at a time; one path inside)
- **Apple HIG, Tab bars:** https://developer.apple.com/design/human-interface-guidelines/tab-bars (navigation, not actions; always visible; keeps each tab's place; never disable a tab)
- **Apple HIG, Managing accounts:** https://developer.apple.com/design/human-interface-guidelines/managing-accounts (delay sign-in; delete, not deactivate; same length in app and web; say when it completes)
- **Apple HIG, Onboarding:** https://developer.apple.com/design/human-interface-guidelines/onboarding (optional, interactive; permission asked when the feature needs it)
- **Android, principles of navigation:** https://developer.android.com/guide/navigation/principles (fixed start; Up and Back agree; a deep link builds the back stack a person could have taken)

## Leaving, consent and deceptive design
- **Deceptive Patterns taxonomy (Brignull):** https://www.deceptive.design/types (hard to cancel, obstruction, sneaking, preselection, forced action, nagging, confirmshaming)
- **Cancellation dark patterns study (2025):** https://www.deceptive.design/articles/dark-patterns-in-subscription-service-cancellation-processes (obstructive cancel flows cut trust 28%, usability 54%)
- **GDPR Art. 7(3):** https://gdpr-info.eu/art-7-gdpr/ (withdrawing consent as easy as giving it)
- **EU DSA Art. 25:** https://eur-lex.europa.eu/eli/reg/2022/2065/oj (platforms: no manipulative interfaces; 25(3)(c) names cancelling harder than subscribing)
- **EU withdrawal button, Directive 2023/2673 (CRD Art. 11a), applies from 19 June 2026:** https://eur-lex.europa.eu/eli/dir/2023/2673/oj (online contracts: a findable two-step withdraw function through the withdrawal period)
- **EU Digital Fairness Act:** https://cms.law/en/aut/legal-updates/inside-the-eu-s-planned-digital-fairness-act-digital-design-subscription-traps-and-influencer-marketing (still a proposal in 2026; nothing taken from it as law)
- **FTC click-to-cancel:** https://www.sidley.com/en/insights/newsupdates/2026/02/us-ftc-signals-renewed-interest-in-click-to-cancel-rulemaking (2024 rule vacated July 2025; no rule in force in 2026; ROSCA enforcement goes on)
- **California auto-renewal law, AB 2863 (from July 2025):** https://dwt.com/insights/2024/10/ab-2863-updates-california-automatic-renewal-law (cancel online in the channel used to join; a retention offer only with Cancel visible beside it)

## Laws of UX (used as checks, not tricks)
- **Hick's law:** https://lawsofux.com/hicks-law/ (few top-level choices, a recommended one)
- **Peak-end rule:** https://lawsofux.com/peak-end-rule/ (the end is remembered: the confirmation carries the result, not decoration)
- **Goal-gradient:** https://lawsofux.com/goal-gradient-effect/ (real progress shown; its "artificial progress" advice rejected: Floor, never fake progress)
- **Zeigarnik effect:** https://lawsofux.com/zeigarnik-effect/ (disputed, 2025 meta-analysis doi:10.1057/s41599-025-05000-w: only a tendency to resume; we take resume-where-left)
