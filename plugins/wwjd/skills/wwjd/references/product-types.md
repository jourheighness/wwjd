# Product types

Look up the product you're building, then read only that block. Each block covers:

| Key | Meaning |
|---|---|
| **Obj** | Core objects |
| **Jobs** | The main jobs people come to do |
| **First** | What the first screen shows |
| **Struct** | Structure and register |
| **Sig** | Signature patterns of the best products in the category |
| **Do** / **Don't** | Rules; each Don't is "never this → do this instead" |
| **#** | Numbers that matter \| vanity numbers |

## Pick the type
1. Find the **noun the user works on** (deal, ticket, order, booking, patient, issue). That noun is the core object, and it picks the type, whatever the product is called.
2. Find the **verb**:

   | Verb | Pattern | Types |
   |---|---|---|
   | track, move | board or list | 2, 3, 20 |
   | answer, reply | inbox | 10, 11, 26 |
   | book, schedule | calendar | 4 |
   | write | editor | 12, 13 |
   | draw | canvas | 27 |
   | watch, report | Monitor | 8, 19, 21 |
   | pay, buy | Transact | 9, 18, 22 |
3. "Dashboard for X" means **X's work queue first**. A real dashboard is right only for 8, 19 and 21.
4. **Two audiences mean two surfaces,** each in its own register: booking, marketplace, LMS, forms, helpdesk plus help centre.
5. Money, health, people data, or anything sent to others: add review steps, an audit log, and append-only corrections.
6. Field, mobile or offline users: add the native overlay and offline sync.
7. "AI-powered X" is still type X; the AI works inside X's objects. Type 6 applies only when the conversation is the product.
8. "Admin panel" over existing data is type 1, unless the data clearly matches another type.
9. Several types in one prompt: the dominant object picks the shell; the rest become views or tabs, not separate apps.
10. Unsure? Ask one question: "Who opens this first thing in the morning, and what do they do?"

## Rules across all types
- **The first screen is the work queue** (needs-you items, oldest first), not KPI cards.
- **One query, many views:** list ⇄ board ⇄ calendar ⇄ timeline, saved as views in the URL.
- **Record page:** header facts, an activity timeline, related records. The timeline is the audit log.
- **Capture automatically** (sync, enrichment, OCR, defaults). Manual entry kills adoption.
- **Keyboard:** ⌘K / Ctrl+K and keyboard everywhere in expert tools; quick add from anywhere.
- **Statuses:** split them into independent dimensions (payment vs fulfilment), all using one marker vocabulary.
- **Append-only** for money, health and legal data: corrections are new entries. Archive, never delete.
- **Review step** for anything sent to others or charged; undo for everything else.
- **Prices, fees and dates exact and up front.** Timezones labelled.
- **Leaving is as easy as joining:** cancel, unsubscribe, reschedule.
- **Bulk actions** appear after selection; the action bar replaces the filters.
- **AI drafts and fills inside the object; the human commits.** No paths that only AI can use.
- **Decision numbers only,** never cumulative vanity totals. Every number has a comparison or a threshold.

---

### 1. Admin / back-office internal tool
- **Obj:**
  - Entity records (User, Account, Order) → event or audit log
  - Role → Permission
  - Queues (flagged, pending review)
- **Jobs:**
  - Support or ops finds a record and fixes it.
  - An ops lead bulk-edits.
  - An admin grants access.
- **First:** a global lookup, plus the queues that need someone (pending review, flagged, failed). Never "Total users: 12,403".
- **Struct:** Operate.
  - List → detail in a drawer, so the list stays visible.
  - ⌘K lookup by any identifier.
  - Saved views as tabs, kept in the URL.
- **Sig:**
  - Stripe Dashboard: object pages with an event timeline, related objects linked by ID, click to copy IDs.
  - Shopify resource index: filter tabs, plus a bulk bar that replaces the filters while rows are selected.
- **Do:**
  - Look up by ID, email or phone from anywhere.
  - Every record shows who changed what, and when.
  - Refund, delete and impersonate go through a review sheet with a logged reason.
  - Navigation grouped by job (Queues, Customers, Orders).
- **Don't:**
  - One sidebar link per database table → navigation by job.
  - Count cards on the home screen → the queues.
  - A raw JSON dump → typed fields, with the raw data behind "Inspect".
  - An edit modal over the list → inline edit or a drawer, with undo.
- **#:** queue size and age of the oldest item, SLA breaches | row totals per table.

### 2. CRM / sales pipeline
- **Obj:**
  - Company → People
  - Deal (stage, value, close date, owner, next step) → Company + People
  - Activity (email, meeting, note, task) → any record
  - List: a subset of records with its own attributes
- **Jobs:**
  - A rep works today's follow-ups and moves deals.
  - A manager reviews pipeline and forecast.
  - Ops imports and dedupes.
- **First:**
  - Rep: overdue follow-ups, deals with no next step, replies waiting.
  - Manager: the pipeline by stage, with sum and count.
  - Not a chart dashboard.
- **Struct:** Operate, plus Monitor for the forecast.
  - Pipeline board ⇄ table: two views of the same list.
  - Record page: header facts, activity timeline, related records in a side panel.
- **Sig:**
  - Attio: objects plus lists, where a pipeline is just a view; records enriched from email and calendar; spreadsheet-grade inline editing.
  - Pipedrive: a deal with no next activity gets flagged.
  - Close / folk: smart views used as work queues.
- **Do:**
  - Capture automatically from mail, calendar and enrichment.
  - A missing next step is the needs-you signal.
  - Board columns show sum and count.
  - Moving a stage works by drag, by menu and by keyboard.
  - Imports dedupe with a merge preview.
- **Don't:**
  - A KPI home screen → today's queue.
  - A 30-field contact form → name and email; the rest is enriched or behind "+ Add details".
  - Cards with 6 fields and buttons → name, value, owner avatar, next-step date.
  - A separate Activities page → a timeline on every record.
- **#:** weighted pipeline by stage, deals with no next step, days in stage, win rate, cycle length | total contacts, emails sent.

### 3. Project & task management
- **Obj:**
  - Workspace → Project (lead, status update, health) → Task (status, assignee, due, priority) → Subtask / Comment
  - Labels
  - Milestone / Cycle
- **Jobs:**
  - An individual sees their own work and updates it.
  - A lead plans, assigns and unblocks.
  - A stakeholder checks project health.
- **First:** "My work" grouped by due date (Overdue, Today, This week, Later), or the team's project list.
- **Struct:** Operate (`references/saas.md`).
  - A list by default; board, timeline and calendar are views of the same saved query.
  - Task detail opens in a side panel.
  - The inbox holds only what is addressed to you.
- **Sig:**
  - Linear: My issues, Inbox, ⌘K, keyboard everything, optimistic sync, project updates rated on track / at risk / off track.
  - Things: Today / Upcoming / Someday, quick entry.
  - Asana: My Tasks sections.
- **Do:**
  - Quick add from anywhere, with natural-language dates.
  - A small, fixed status workflow per team.
  - Project status is a written update with a health rating, not "% done".
  - Drag reorder has a keyboard alternative.
- **Don't:**
  - Completion rings on the home screen → the list.
  - A Gantt chart by default → a list, with the timeline as a view.
  - Nine status colours plus five priority colours → one marker vocabulary.
  - Required fields on create → title only.
  - A notification per change → mentions and assignments only.
- **#:** my overdue items, blocked items, scope added mid-cycle | tasks completed all-time, "productivity score".

### 4. Calendar / scheduling / booking
- **Obj:**
  - Host or resource → availability (timezone, hours, overrides) → event type (duration, buffers, notice, location, questions) → booking (attendee, slot, status, payment) → reminders
- **Jobs:**
  - The booker picks a time and confirms.
  - The host sets availability once and handles reschedules.
  - The front desk runs the day.
- **First:**
  - Booker: the slot picker itself (month grid plus slot list), with nothing in front of it.
  - Host: the agenda.
  - Businesses that book resources (rooms, staff): a day view with one column per resource.
- **Struct:**
  - The booker gets Flow and Transact.
  - The host gets Operate, with a calendar (week grid, drag to create).
- **Sig:**
  - Cal.com / Calendly: event-type links, slots beside the month grid, timezone auto-detected and switchable, buffers, minimum notice.
  - Fresha: resource columns, deposits.
  - Baymard on accommodation booking: people arrive with dates in mind, so show availability and price on the dates themselves.
- **Do:**
  - Show only bookable slots, in the booker's timezone, labelled.
  - Mark unavailable dates in the picker instead of failing after the pick.
  - Confirmation gives date, time, timezone, location or link, add-to-calendar, and reschedule and cancel links.
  - Hold the slot during checkout.
- **Don't:**
  - Free date and time inputs → a slot picker.
  - A form before the slot → slot first, then name and email (prefilled when known).
  - Cancelling harder than booking → the same number of steps.
  - "3–5 days" → a date.
- **#:** utilisation, no-show rate, lead time, reschedule and cancel rate | booking-page views.

### 5. E-commerce admin (orders, inventory)
- **Obj:**
  - Order → line items → variant → inventory per location
  - Customer → orders
  - Payment status and fulfilment status, kept as separate dimensions
  - Return / refund
- **Jobs:**
  - Fulfil today's orders.
  - Edit products and stock.
  - Handle returns.
- **First:** a task list (orders to fulfil, payments to capture, low stock, pending returns), with a small sales summary below it.
- **Struct:** Operate, plus a little Monitor.
  - Resource index → detail, with a timeline and internal comments.
  - A product editor with a variant grid.
- **Sig:**
  - Shopify admin: saved filter tabs, a bulk bar, a bulk-edit spreadsheet.
  - Separate payment and fulfilment badges.
  - A contextual save bar.
- **Do:**
  - Bulk fulfil and print labels.
  - A variant matrix for editing.
  - Stock per location.
  - The refund sheet shows the amount, a restock toggle, a notify toggle, and a review step.
- **Don't:**
  - Revenue charts on the home screen → the task list.
  - One merged status → payment and fulfilment as separate statuses.
  - Deleting a product → archiving it.
  - A long form with Save at the bottom → sections plus a sticky contextual save bar.
- **#:** unfulfilled orders and the oldest one's age, low stock, return rate, conversion, average order value | visitors, all-time sales.

### 6. AI assistant / agent workspace
- **Obj:**
  - Thread → messages → tool calls → artifacts
  - Project → files, context, memory
  - Agent run → steps → approvals → output (diff, document, PR)
- **Jobs:**
  - Ask a question and get a trustworthy answer.
  - Delegate a task and review the result.
  - Reuse context across sessions.
- **First:**
  - Chat: the composer, 3–4 specific suggestions, recent threads.
  - Agents: runs listed by status (needs you, running, done).
- **Struct:**
  - Converse for the thread, Operate for artifacts and runs.
  - A thread column beside an artifact pane.
  - An inbox for background runs.
- **Sig:**
  - Artifacts and canvases beside the chat.
  - Accept or reject per hunk.
  - The result lands inline in the record it changes.
  - Task list → PR.
  - Inline citations.
- **Do:**
  - Stop replaces Send while a reply streams.
  - Each tool step is one collapsed line.
  - Reads run freely; writes are gated, and the approval says exactly what will happen.
  - Results land where they apply, with keep and undo.
  - Background runs notify only when they need input or are done.
- **Don't:**
  - A welcome essay with sparkles → specific suggestions.
  - Output in chat bubbles → document-style text.
  - Raw chain-of-thought → one live status line.
  - An "AI generated" badge on every message → disclose once.
  - Chat as the only way to edit structured data → an artifact pane or an inline diff.
- **#:** acceptance rate, edits after acceptance, time to first token, cost per run | message and token counts.

### 7. Settings / account / billing area (any SaaS)
- **Obj:**
  - User → profile, security (passkeys, sessions), notifications
  - Workspace → members and roles, integrations, API keys
  - Subscription → plan, seats, payment method, invoices
- **Jobs:**
  - Change one setting.
  - Manage members.
  - Change plan or payment, and fetch invoices.
- **First:** grouped section navigation (Account / Workspace / Billing) plus the first section. Settings search once there are more than about 8 sections.
- **Struct:** Operate, Flow for plan changes, Transact for upgrades (`references/saas.md` §2).
- **Sig:**
  - GitHub / Vercel / Linear: a sectioned left nav, rows grouped in cards, the danger zone last.
  - Stripe's customer portal: a proration preview, self-serve cancel.
  - Slack / Notion: a members table with an inline role select.
- **Do:**
  - Toggles apply at once.
  - A plan change shows the exact price difference and when it's charged.
  - Cancelling takes no more steps than signing up, and says "Access ends <date>. No further charges."
  - API keys are named, shown once with a copy button, show when last used, and can be revoked.
- **Don't:**
  - One long form with Save at the bottom → sections.
  - Cancel via "contact us" → self-serve cancel.
  - A retention offer in the brand accent → neutral styling.
  - "Are you sure?" on toggles → instant change plus undo.
- **#:** seats used of seats available, next charge (date and amount), usage against limit | none.

### 8. Business KPI / exec reporting
- **Obj:**
  - Metric (definition, owner, target) → time series → segments
  - Report / board
  - Annotations (launches, price changes)
- **Jobs:**
  - An exec checks whether things are on track.
  - The metric owner explains a variance.
  - An analyst ships the weekly report.
- **First:** a dashboard is right here. A scorecard of 4–8 metrics, each against target and a named prior period, with variance flagged.
- **Struct:** Monitor (`registers/monitor.md`, the exec blueprint), plus Editorial for owner commentary.
  - A scorecard table: metric, actual, target, change, sparkline, owner.
  - Each metric opens a detail view with its segment breakdown.
- **Sig:**
  - Weekly business review format: trailing 6 weeks plus 12 months, year over year.
  - Plan vs actual.
  - Metric definitions available on hover.
- **Do:**
  - Show each metric's definition on hover.
  - Flag only variances beyond a threshold.
  - Put event annotations on the line.
  - Keep written commentary next to the number.
  - Offer scheduled email and export.
- **Don't:**
  - Green-arrow cards with no comparison → value, change against a named period, and target.
  - Gauges and donuts → bullet, bar or line charts.
  - 20 metrics → only the metrics tied to decisions.
- **#:** actual vs target, trend, the north-star metric and its inputs | cumulative totals that only go up.

### 9. Billing / subscriptions / spend management
- **Obj:**
  - Customer → subscription → price → invoice → payment → refund or dispute
  - Usage records
  - Spend: card → transaction → receipt → approval → policy
- **Jobs:**
  - Finance recovers failed payments and answers disputes.
  - Support changes plans and issues refunds.
  - The controller closes the month.
- **First:** the exceptions (failed payments, disputes with deadlines, past-due invoices, missing receipts, pending approvals), then a small MRR summary.
- **Struct:** Operate plus Monitor.
  - List → detail, with an immutable event timeline.
  - An approvals inbox.
- **Sig:**
  - Stripe: every object linked by ID, an event log, an invoice preview before any change, an unmissable test mode.
  - Ramp: a review queue with policy flags on top, receipts auto-matched.
- **Do:**
  - Money is append-only: corrections are credit notes or refunds.
  - Store amounts as integer minor units; always show the currency; use `tabular-nums`.
  - Preview every money action.
  - Record who did what, and when, on every change.
- **Don't:**
  - Editing a sent invoice → void or credit it, then reissue.
  - An MRR chart as the home screen → the exceptions queue.
  - Deleting a customer → archiving them.
  - A lump-sum fee → itemised charges.
- **#:** MRR movements (new, expansion, contraction, churn), failed-payment recovery, net revenue retention, days sales outstanding, outstanding receipts | all-time gross volume.

### 10. Helpdesk / support inbox
- **Obj:**
  - Conversation (status, assignee, priority, SLA) → messages, where a public reply and an internal note are different things
  - Customer → account
  - Macros, help articles, bot handoff
- **Jobs:**
  - An agent clears their queue.
  - A lead balances workload and SLAs.
  - The customer gets an answer.
- **First:** the agent's queue (Mine / Unassigned / team views), with the top conversation open.
- **Struct:** Operate, as a three-pane inbox: views | conversation list | thread plus customer panel.
- **Sig:**
  - Front: live collision detection and shared drafts.
  - Intercom: the bot answers first and hands off with a summary; drafts come from the knowledge base.
  - Zendesk: macros and SLA policies.
- **Do:**
  - An internal note looks unmistakably different from a reply, by colour and label. Mixing them up is the costliest error in this category.
  - Show who else is viewing or replying.
  - Snooze until a set time or until the customer replies.
  - Show the SLA timer only as a breach nears.
  - The customer panel shows plan, recent orders and past tickets.
  - AI drafts; a person sends.
- **Don't:**
  - A 12-column ticket table → name, subject, snippet, age.
  - A confirm dialog on close → close with undo, then advance to the next conversation.
  - Unread counts on every view → a count on Mine only.
- **#:** first response time, resolution time, backlog age, SLA breaches, reopen rate | tickets closed per agent.

### 11. Team chat
- **Obj:**
  - Workspace → channel → message → thread, reactions, files
  - DMs, presence, mentions
- **Jobs:**
  - Catch up on what matters.
  - Discuss.
  - Find a past decision.
- **First:** the last channel, opened at the first unread message under a "New" divider.
- **Struct:** Converse plus Operate: sidebar | stream | thread pane.
- **Sig:**
  - Slack: an Activity view for mentions, sidebar sections, recaps.
  - Zulip / Twist: topics first.
- **Do:**
  - Mentions and DMs get count badges; other channel activity is shown in bold only.
  - Threads open in a side pane.
  - Each channel keeps its own draft.
  - Search supports operators.
- **Don't:**
  - Counts on every channel → bold.
  - Auto-scrolling while someone is reading → a "New messages" pill.
  - Bubbles for group work chat → a flat list that groups consecutive messages.
- **#:** unanswered mentions | messages sent.

### 12. CMS / content publishing
- **Obj:**
  - Content type (schema) → entry (draft, published or scheduled versions) → fields and blocks → assets
  - Locales, authors and reviewers
- **Jobs:**
  - A writer drafts and publishes.
  - An editor reviews and schedules.
  - A developer models content types.
- **First:** the content list, filtered to my drafts and items in review, with New as the primary action.
- **Struct:** Operate for editing, Editorial for preview. The editor sits beside a live preview on the real templates.
- **Sig:**
  - Click-to-edit preview.
  - A calm editor.
  - A publish menu with schedule and newsletter options.
  - Typed schemas.
- **Do:**
  - "Changes not published" is always visible.
  - Schedule with a timezone.
  - Keep revisions with restore.
  - Derive the slug and SEO fields, but let them be edited.
- **Don't:**
  - A 30-button toolbar → a slash menu plus a selection toolbar.
  - A Save button → autosaved drafts, with Publish as the action.
  - Publishing blind → preview first.
  - Delete → unpublish or archive.
- **#:** items awaiting review, scheduled items, stale content | total posts.

### 13. Document editor / knowledge base / wiki
- **Obj:**
  - Workspace → page tree → page → blocks → comments and mentions
  - Database pages, permissions, versions
- **Jobs:**
  - Write together.
  - Find the answer.
  - Keep documents true.
- **First:**
  - Editors: the last page, or recents plus search.
  - Knowledge-base readers: search.
- **Struct:** Operate for editing, Reference or Editorial for reading: a tree sidebar, the page, ⌘K, comments in the margin.
- **Sig:**
  - Blocks and the slash command.
  - Suggestion mode.
  - Verification (an owner plus a "verified until" date).
  - Backlinks.
- **Do:**
  - Slash commands and markdown shortcuts.
  - Presence cursors.
  - Comments anchored to the text.
  - Version restore.
  - A reading width of about 70 characters.
  - A stale-page flag in knowledge bases.
- **Don't:**
  - A fixed, heavy toolbar → contextual tools.
  - A deep tree as the only navigation → search and links.
  - A blank page on a permission error → "Request access".
- **#:** searches with no results, stale pages | page count.

### 14. Accounting / invoicing
- **Obj:**
  - Contact (customer or vendor) → invoice or bill (lines, tax, due date) → payment → bank transaction → reconciliation match → ledger account
- **Jobs:**
  - Send invoices and get paid.
  - Reconcile the bank feed.
  - Report and file.
- **First:** what you're owed and what you owe: overdue invoices, bills due, unreconciled bank lines, cash balance.
- **Struct:** Operate plus Monitor.
  - Status lists: draft, awaiting payment, overdue, paid.
  - The invoice editor beside the live document.
  - Reconciliation as a matching queue.
- **Sig:**
  - Xero: the bank line and its suggested match side by side, confirmed with one key.
  - A payment link on the invoice.
  - Receipt capture.
- **Do:**
  - The editor shows the document exactly as it will be sent.
  - Numbering is automatic; tax is set per line; totals update live.
  - Preview the email before sending.
  - A sent invoice is locked; corrections are credit notes.
- **Don't:**
  - Charts on the home screen → AR ageing buckets.
  - Editing a sent invoice → a credit note.
  - A reconciliation grid → a matching queue.
- **#:** AR ageing, overdue total, days sales outstanding, cash runway, unreconciled count | invoices created.

### 15. Forms / survey builder
- **Obj:**
  - Form → questions (type, validation, logic) → responses → integrations
  - Theme
- **Jobs:**
  - Build and publish a form.
  - Respondents fill it in.
  - Owners analyse and export.
- **First:** the form list, then an editor that looks like what respondents will see.
- **Struct:**
  - Builder: Operate.
  - Respondent: Flow.
  - Results: Monitor, with a per-question summary and a responses table.
- **Sig:**
  - A doc-like editor where "/" adds a question.
  - One question per screen.
  - Logic and integrations.
- **Do:**
  - Build inside the respondent view.
  - Show logic inline on the question.
  - Show drop-off per question.
  - Offer CSV export and webhooks.
  - The respondent side follows `registers/flow.md`.
- **Don't:**
  - A settings modal per question → inline settings.
  - Multi-column respondent forms → one column.
  - Asterisks everywhere → mark the optional fields instead.
- **#:** completion rate, drop-off per question, median time | views.

### 16. LMS / course platform
- **Obj:**
  - Course → module → lesson (video, text, quiz) → learner progress
  - Cohort
  - Assignment → submission → grade
  - Certificate
- **Jobs:**
  - A learner continues where they left off.
  - An instructor builds courses and grades.
  - An admin assigns and tracks required training.
- **First:**
  - Learner: Continue, at the exact spot they left off.
  - Instructor: submissions to grade.
  - Admin: overdue required training.
- **Struct:**
  - Flow for the sequence, Editorial for lessons, Operate for authoring and grading.
  - Layout: an outline sidebar | the lesson | a Next button.
- **Sig:**
  - A learning path.
  - The rubric beside the submission when grading, with next and previous.
  - Mastery.
- **Do:**
  - Resume exactly where the learner stopped.
  - Done marks in the outline.
  - "3 of 8 lessons" is legitimate here.
  - Captions and transcripts.
- **Don't:**
  - Streak pressure → honest progress.
  - Stat cards for learners → Continue.
  - Autoplaying the next video → an explicit Next.
- **#:** completion, drop-off by lesson, scores | enrolment counts.

### 17. HR / people / recruiting (ATS)
- **Obj:**
  - Recruiting: Job → stages → application → candidate; interview → scorecard; offer
  - HR: Employee → role, team, manager → time off, compensation, documents
- **Jobs:**
  - A recruiter moves candidates through stages.
  - An interviewer submits feedback.
  - An employee helps themselves.
- **First:**
  - Recruiter: candidates who need action.
  - Interviewer: my interviews and the scorecards I owe.
  - Employee: my balance, and Request time off.
- **Struct:** Operate.
  - The pipeline is a table grouped by stage; a board only for small requisitions.
  - The candidate profile has a timeline.
  - Self-service tasks follow Flow.
- **Sig:**
  - Scheduling automation.
  - A scorecard per stage.
  - Employee self-service.
- **Do:**
  - Hide others' feedback until mine is submitted, to avoid bias.
  - Show how long each candidate has been in their stage.
  - Bulk reject through a reviewed email template.
  - Compensation and ID numbers are gated by permission and masked.
- **Don't:**
  - A board with 100 cards per column → a grouped table.
  - Rejecting without previewing the email → a review step, since it reaches people.
- **#:** time in stage, pass-through rates, time to hire, offer acceptance, feedback latency | applicant totals.

### 18. Marketplace (two-sided)
- **Obj:**
  - Listing → availability and price → booking or order → payment → payout
  - Buyer and seller profiles → reviews
  - Messages, disputes
- **Jobs:**
  - The buyer finds what they want and books with confidence.
  - The seller lists and handles orders.
  - Ops moderates for trust.
- **First:**
  - Buyer: a search by intent (where, when, what).
  - Seller: requests to accept, messages, today.
- **Struct:**
  - Buyer: Transact.
  - Seller: Operate, as a separate mode.
  - Messages: Converse, tied to the booking.
  - Results: a list beside a map.
- **Sig:**
  - The total price, fees included, shown up front.
  - Double-blind reviews.
  - A host calendar.
  - Live status.
- **Do:**
  - Show the total price including fees from the start.
  - Use real trust signals (verified status, rating with its count).
  - Show the cancellation policy before payment.
- **Don't:**
  - One UI for both sides → two modes.
  - Fees revealed at the last step → fees shown in search.
  - Fake scarcity → true availability.
- **#:** liquidity (search → booking, fill rate), time to first sale for new supply, repeat rate | raw GMV, listing count.

### 19. Product analytics
- **Obj:**
  - Event → properties
  - User or group → cohort
  - Insight (trend, funnel, retention, paths) → dashboard
  - Experiment, feature flag
- **Jobs:**
  - A PM answers "did X work?"
  - Growth watches funnels.
  - Engineering instruments events.
- **First:** saved dashboards of pinned insights, plus "New insight". A dashboard is right when each tile is a saved, editable question.
- **Struct:** Monitor (`registers/monitor.md`, the analytics blueprint) plus Operate, with the query builder on the left and the chart on the right.
- **Sig:**
  - Funnels that lead to session replays.
  - Flags and experiments in the same tool.
  - An SQL escape hatch.
- **Do:**
  - Every chart opens to its query.
  - Funnel drop-off links to the people who dropped.
  - Experiments show sample size and confidence.
  - Keep an event catalog with definitions.
- **Don't:**
  - Fixed charts you can't drill into → editable insights.
  - Pageviews as the headline → activation and retention.
  - Silently mixing units → label whether it counts users or sessions.
- **#:** activation, retention, funnel conversion, feature adoption | pageviews, signups that never activate.

### 20. Issue tracking / dev tools
- **Obj:**
  - Issue (status, priority, assignee, estimate) → project or cycle → branch, PR, checks
  - Triage queue
  - Error groups
- **Jobs:**
  - An engineer picks the next issue and ships it.
  - A lead triages and plans.
  - A reviewer reviews PRs.
- **First:** My issues and the Inbox, plus the triage queue for whoever is on rotation.
- **Struct:** Operate, keyboard-first: a list grouped by status, and a detail view with activity.
- **Sig:**
  - A triage queue with rotation and suggested fields.
  - Cycles.
  - Copy branch name.
  - Status moves when the PR merges.
  - First-seen and last-seen times on errors.
- **Do:**
  - Link git activity automatically.
  - Support markdown with code blocks.
  - `?` shows the keyboard shortcuts.
  - Every triage queue has an owner.
- **Don't:**
  - Required fields everywhere → title only.
  - A burndown chart as the home screen → my issues.
- **#:** cycle time, open bugs by priority, triage age, PR review wait | issues closed, velocity.

### 21. Ops monitoring / observability
- **Obj:**
  - Service → metrics, logs, traces
  - Alert rule → incident → on-call
  - Deploys, SLOs
- **Jobs:**
  - On-call knows whether anything is broken, and why.
  - An engineer debugs.
  - The team reviews SLOs.
- **First:** what's firing, plus service health with rate, errors and duration (`registers/monitor.md`, the ops blueprint).
- **Struct:** Monitor, plus Operate for the incident timeline. Drill-down: service list → service → traces → logs, keeping the time range at every step.
- **Sig:**
  - RED metrics for services, USE metrics for resources.
  - Alert on symptoms.
  - A service map.
  - An incident timeline and status page.
- **Do:**
  - One global time range, with the timezone shown.
  - Deploy markers on charts.
  - Percentiles, never averages.
  - A freshness indicator.
  - Include the incident state in the design data.
- **Don't:**
  - CPU gauges on the home screen → RED metrics per service.
  - Average latency → percentiles.
  - Alerts on causes → alerts on symptoms.
- **#:** error rate, p99, saturation, SLO burn rate, time to acknowledge and resolve | aggregate "99.99% uptime", number of dashboards.

### 22. Banking / personal finance
- **Obj:**
  - Account → balance → transactions (merchant, category, pending or posted) → card
  - Payee → transfer
  - Budget or goal
  - Statement
- **Jobs:**
  - Check balance and recent activity.
  - Pay or transfer.
  - Understand spending.
- **First:** balances and recent transactions (pending ones marked), with Send / Pay as the primary action.
- **Struct:** Operate, plus Flow for payments. Mobile-first, with the native overlay.
- **Sig:**
  - Instant notifications.
  - Clean merchant names with logos.
  - Pots.
  - A transactions review inbox.
- **Do:**
  - Send flow: payee → amount → review (fee, exchange rate, arrival date) → authenticate.
  - One tap freezes the card.
  - Transactions are searchable.
  - Amounts are never truncated.
- **Don't:**
  - A yes/no payment modal → a review screen.
  - Hidden exchange margins → the rate and the fee shown.
  - A "financial health score" → upcoming bills against the balance.
- **#:** available balance, upcoming bills, spend against budget | scores, badges.

### 23. File storage / asset management
- **Obj:**
  - Folder or collection → asset (versions, metadata, tags, rights expiry) → share link and permissions → comments and approvals
- **Jobs:**
  - Find a file.
  - Upload and share.
  - Manage versions and approvals.
- **First:** recent files and search, then the folder browser.
- **Struct:** Operate:
  - a grid ⇄ list toggle
  - a preview panel
  - an upload tray
- **Sig:**
  - Recents and "Shared with me".
  - Version stacks, time-coded comments, approvals.
  - Metadata facets and rights expiry.
- **Do:**
  - Drop a file anywhere to upload. The tray shows progress, with cancel and retry.
  - Preview without downloading.
  - The share dialog shows who has access and how far the link reaches.
- **Don't:**
  - Permanent delete → trash with restore.
  - A blocking upload modal → the tray.
  - A storage chart as the home screen → recent files.
- **#:** quota used, rights expiring soon, approvals pending | total file count.

### 24. Healthcare / care records (compliance-heavy)
- **Obj:**
  - Patient → encounter → observations, problems, medications, allergies, orders, notes
  - Care team, appointments, consent
  - Access audit
- **Jobs:**
  - A clinician reviews and documents.
  - A nurse administers and charts.
  - Admin schedules and bills.
- **First:** my schedule or today's patient list, with acuity and flags.
- **Struct:** Operate, plus Monitor for ward boards.
  - Patient list → chart.
  - A persistent identity banner on every screen: name, two identifiers, allergies.
- **Sig:**
  - The identity banner.
  - Drafted notes the clinician signs.
  - A FHIR-shaped data model.
- **Do:**
  - Every value carries its unit and reference range.
  - Abnormal values are marked H/L in text, not by colour alone.
  - Alerts are tiered and mostly passive: interruptive alerts get overridden most of the time.
  - Every access is logged; emergency override requires a stated reason.
- **Don't:**
  - Storms of popup alerts → tiered alerts, mostly inline.
  - Undo as the only safety net on orders → a review step, since orders reach other people.
  - Ambiguous abbreviations → words spelled out.
  - Several patients open at once without clear identity → one patient per context, with the banner.
- **#:** unreviewed abnormal results, overdue tasks | none.

### 25. Field service / logistics / fleet
- **Obj:**
  - Work order → location → customer → technician or driver → vehicle → route and stops → proof (photo, signature) → parts
- **Jobs:**
  - A dispatcher assigns and reshuffles work.
  - Field staff do the work, often offline.
  - The customer tracks arrival.
- **First:**
  - Dispatcher: a map, a timeline per technician, and the unassigned queue.
  - Field staff: today's route, with the next stop on top.
- **Struct:** Operate for dispatch; the native overlay for field staff.
- **Sig:**
  - Drag a job onto a technician's timeline.
  - Route optimisation.
  - A customer ETA link.
  - A live fleet map.
- **Do:**
  - Offline-first, with a visible sync state.
  - Large targets that work in sunlight and with gloves.
  - "Navigate" on the next stop.
  - Capture proof of delivery.
  - Every drag has a menu alternative.
- **Don't:**
  - A map on its own → a map plus a list.
  - Desktop forms on a phone → job cards.
  - Live refreshes that reorder the board → stable positions.
- **#:** on-time rate, first-time fix rate, jobs per technician-day, utilisation | total miles.

### 26. Email client
- **Obj:**
  - Account → thread → message → attachments
  - Labels or splits, drafts, snooze and reminders
- **Jobs:**
  - Triage to zero.
  - Reply.
  - Find a message.
- **First:** the inbox (split by category), with the first thread selected.
- **Struct:** Operate: list | reading pane; ⌘K.
- **Sig:**
  - A split inbox.
  - Keyboard triage (j/k/e).
  - Snooze, and remind-if-no-reply.
  - Undo send.
  - A screener for new senders.
- **Do:**
  - Archive is the default action, not delete.
  - An undo-send window.
  - Drafts autosave.
  - Mark as read on open, not on hover.
- **Don't:**
  - "4,382 unread" → a dot per split.
  - Delete as the primary action → archive.
- **#:** important threads still unanswered | total unread.

### 27. Design / whiteboard canvas tool
- **Obj:**
  - File → page or board → frame → layers, shapes, components → comments
  - Library, prototype links
- **Jobs:**
  - Create and arrange.
  - Collaborate live.
  - Hand off and export.
- **First:** recent files. Inside a file: the canvas, with minimal chrome.
- **Struct:** Operate:
  - the tool bar
  - layers on the left, properties on the right
  - a contextual toolbar on selection
- **Sig:**
  - Multiplayer cursors.
  - Components and variants.
  - Single-letter tools.
  - Stickies and templates.
- **Do:**
  - The current tool is always visible.
  - Standard pan and zoom.
  - Deep undo.
  - Snapping and guides.
  - The layer list as a keyboard alternative to the canvas.
- **Don't:**
  - Property dialogs → a side panel.
  - Losing the selection when using the side panel → keep the selection.
  - Custom pan gestures → the platform standard.
- **#:** n/a for users | object counts.
