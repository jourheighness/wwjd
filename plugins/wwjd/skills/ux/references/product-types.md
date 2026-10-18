# Product types

Contents: Across all types · 1 Admin · 2 CRM · 3 Projects · 4 Calendar · 5 E-commerce admin · 6 AI workspace · 7 Settings · 8 KPI reporting · 9 Billing · 10 Helpdesk · 11 Team chat · 12 CMS · 13 Docs/wiki · 14 Accounting · 15 Forms · 16 LMS · 17 HR · 18 Marketplace · 19 Analytics · 20 Issues · 21 Ops monitoring · 22 Banking · 23 Files · 24 Healthcare · 25 Field service · 26 Email · 27 Canvas.

Grep `### <n>. <type>` and read only that block. Keys: **Obj** core objects · **Jobs** what people come to do · **First** the first screen · **Struct** structure and register · **Sig** signature patterns of the category's best · **Do** / **Don't** (never this → instead) · **#** numbers that matter | vanity numbers. Picking the type and its layout from the prompt: `registers/operate.md`.

## Across all types
- **The first screen is the work queue** (needs-you items, oldest first), not KPI cards.
- **One query, many views:** list ⇄ board ⇄ calendar ⇄ timeline, saved as views in the URL.
- **Record page:** header facts, an activity timeline (the audit log), related records.
- **Capture automatically** (sync, enrichment, OCR, defaults); manual entry kills adoption.
- **Keyboard:** ⌘K and keyboard everywhere in expert tools; quick add from anywhere.
- **Statuses** split into independent dimensions (payment vs fulfilment), one marker vocabulary.
- **Money, health, people data, anything sent to others:** review steps, an audit log, append-only corrections; archive, never delete.
- **Field, mobile or offline users:** the native overlay plus offline sync.
- **Prices, fees and dates exact and up front;** timezones labelled.
- **AI drafts and fills inside the object; the human commits.** No paths only AI can use.
- **Every number has a comparison or a threshold;** never cumulative vanity totals.

---

### 1. Admin / back-office internal tool
- **Obj:** Entity records (User, Account, Order) → event or audit log; Role → Permission; Queues (flagged, pending review)
- **Jobs:** support or ops finds a record and fixes it; an ops lead bulk-edits; an admin grants access.
- **First:** a global lookup, plus the queues that need someone (pending review, flagged, failed). Never "Total users: 12,403".
- **Struct:** Operate; list → detail in a drawer, so the list stays visible; ⌘K lookup by any identifier; saved views as tabs, kept in the URL.
- **Sig:** Stripe Dashboard: object pages with an event timeline, related objects linked by ID, click to copy IDs; Shopify resource index: filter tabs, plus a bulk bar that replaces the filters while rows are selected.
- **Do:** look up by ID, email or phone from anywhere; every record shows who changed what, and when; refund, delete and impersonate go through a review sheet with a logged reason; navigation grouped by job (Queues, Customers, Orders).
- **Don't:** one sidebar link per database table → navigation by job; count cards as home → queues; raw JSON dump → typed fields, with the raw data behind "Inspect"; edit modal over the list → inline edit or a drawer, with undo.
- **#:** queue size and age of the oldest item, SLA breaches | row totals per table.

### 2. CRM / sales pipeline
- **Obj:** Company → People; Deal (stage, value, close date, owner, next step) → Company + People; Activity (email, meeting, note, task) → any record; List: a subset of records with its own attributes
- **Jobs:** A rep works today's follow-ups and moves deals; a manager reviews pipeline and forecast; ops imports and dedupes.
- **First:** Rep: overdue follow-ups, deals with no next step, replies waiting; manager: the pipeline by stage, with sum and count; not a chart dashboard.
- **Struct:** Operate, plus Monitor for the forecast; pipeline board ⇄ table: two views of the same list; record page: header facts, activity timeline, related records in a side panel.
- **Sig:** Attio: objects plus lists, where a pipeline is just a view; records enriched from email and calendar; spreadsheet-grade inline editing; Pipedrive: a deal with no next activity gets flagged; Close / folk: smart views used as work queues.
- **Do:** capture automatically from mail, calendar and enrichment; missing next step is the needs-you signal; board columns show sum and count; moving a stage works by drag, by menu and by keyboard; imports dedupe with a merge preview.
- **Don't:** KPI home screen → today's queue; a 30-field contact form → name and email; rest is enriched or behind "+ Add details"; cards with 6 fields and buttons → name, value, owner avatar, next-step date; separate Activities page → timeline on every record.
- **#:** weighted pipeline by stage, deals with no next step, days in stage, win rate, cycle length | total contacts, emails sent.

### 3. Project & task management
- **Obj:** Workspace → Project (lead, status update, health) → Task (status, assignee, due, priority) → Subtask / Comment; Labels; Milestone / Cycle
- **Jobs:** an individual sees their own work and updates it; a lead plans, assigns and unblocks; a stakeholder checks project health.
- **First:** "My work" grouped by due date (Overdue, Today, This week, Later), or the team's project list.
- **Struct:** Operate; a list by default; board, timeline and calendar are views of the same saved query; task detail opens in a side panel; the inbox holds only what is addressed to you.
- **Sig:** Linear: My issues, Inbox, ⌘K, keyboard everything, optimistic sync, project updates rated on track / at risk / off track; Things: Today / Upcoming / Someday, quick entry; Asana: My Tasks sections.
- **Do:** quick add from anywhere, with natural-language dates; small, fixed status workflow per team; project status is a written update with a health rating, not "% done".
- **Don't:** completion rings as home → list; Gantt chart by default → list, with the timeline as a view; required fields on create → title only; notification per change → mentions and assignments only.
- **#:** my overdue items, blocked items, scope added mid-cycle | tasks completed all-time, "productivity score".

### 4. Calendar / scheduling / booking
- **Obj:** Host or resource → availability (timezone, hours, overrides) → event type (duration, buffers, notice, location, questions) → booking (attendee, slot, status, payment) → reminders
- **Jobs:** the booker picks a time and confirms; the host sets availability once and handles reschedules; the front desk runs the day.
- **First:** Booker: the slot picker itself (month grid plus slot list), with nothing in front of it; host: the agenda; businesses that book resources (rooms, staff): a day view with one column per resource.
- **Struct:** The booker gets Flow and Transact; the host gets Operate, with a calendar (week grid, drag to create).
- **Sig:** Cal.com / Calendly: event-type links, slots beside the month grid, timezone auto-detected and switchable, buffers, minimum notice; Fresha: resource columns, deposits; Baymard on accommodation booking: people arrive with dates in mind, so show availability and price on the dates themselves.
- **Do:** show only bookable slots, in the booker's timezone, labelled; mark unavailable dates in the picker instead of failing after the pick; confirmation gives date, time, timezone, location or link, add-to-calendar, and reschedule and cancel links; hold the slot during checkout.
- **Don't:** free date and time inputs → slot picker; form before the slot → slot first, then name and email (prefilled when known); cancelling harder than booking → same number of steps; "3–5 days" → date.
- **#:** utilisation, no-show rate, lead time, reschedule and cancel rate | booking-page views.

### 5. E-commerce admin (orders, inventory)
- **Obj:** Order → line items → variant → inventory per location; Customer → orders; Payment status and fulfilment status, kept as separate dimensions; Return / refund
- **Jobs:** fulfil today's orders; edit products and stock; handle returns.
- **First:** a task list (orders to fulfil, payments to capture, low stock, pending returns), with a small sales summary below it.
- **Struct:** Operate, plus a little Monitor; resource index → detail, with a timeline and internal comments; a product editor with a variant grid.
- **Sig:** Shopify admin: saved filter tabs, a bulk bar, a bulk-edit spreadsheet; Separate payment and fulfilment badges; contextual save bar.
- **Do:** bulk fulfil and print labels; variant matrix for editing; stock per location; refund sheet shows the amount, a restock toggle, a notify toggle, and a review step.
- **Don't:** revenue charts as home → task list; one merged status → payment and fulfilment as separate statuses; deleting a product → archiving it; long form with Save at the bottom → sections plus a sticky contextual save bar.
- **#:** unfulfilled orders and the oldest one's age, low stock, return rate, conversion, average order value | visitors, all-time sales.

### 6. AI assistant / agent workspace
- **Obj:** Thread → messages → tool calls → artifacts; Project → files, context, memory; Agent run → steps → approvals → output (diff, document, PR)
- **Jobs:** ask a question and get a trustworthy answer; delegate a task and review the result; reuse context across sessions.
- **First:** Chat: the composer, 3–4 specific suggestions, recent threads; agents: runs listed by status (needs you, running, done).
- **Struct:** Converse for the thread, Operate for artifacts and runs; a thread column beside an artifact pane; an inbox for background runs.
- **Sig:** Artifacts and canvases beside the chat; Accept or reject per hunk; result lands inline in the record it changes; Task list → PR; Inline citations.
- **Do:** chat surface per `registers/converse.md`; agents, approvals and runs per `references/ai.md`.
- **Don't:** chat as the only way to edit structured data → artifact pane or an inline diff.
- **#:** acceptance rate, edits after acceptance, time to first token, cost per run | message and token counts.

### 7. Settings / account / billing area (any SaaS)
- **Obj:** User → profile, security (passkeys, sessions), notifications; Workspace → members and roles, integrations, API keys; Subscription → plan, seats, payment method, invoices
- **Jobs:** change one setting; manage members; change plan or payment, and fetch invoices.
- **First:** grouped section navigation (Account / Workspace / Billing) plus the first section. Settings search once there are more than about 8 sections.
- **Struct:** Operate, Flow for plan changes, Transact for upgrades.
- **Sig:** GitHub / Vercel / Linear: a sectioned left nav, rows grouped in cards, the danger zone last; Stripe's customer portal: a proration preview, self-serve cancel; Slack / Notion: a members table with an inline role select.
- **Do:** toggles apply at once; plan change shows the exact price difference and when it's charged; cancel says "Access ends <date>. No further charges."; API keys are named, shown once with a copy button, show when last used, and can be revoked.
- **Don't:** cancel via "contact us" → self-serve cancel; retention offer in the brand accent → neutral styling.
- **#:** seats used of seats available, next charge (date and amount), usage against limit | none.

### 8. Business KPI / exec reporting
- **Obj:** Metric (definition, owner, target) → time series → segments; Report / board; Annotations (launches, price changes)
- **Jobs:** an exec checks whether things are on track; the metric owner explains a variance; an analyst ships the weekly report.
- **First:** a dashboard is right here. A scorecard of 4–8 metrics, each against target and a named prior period, with variance flagged.
- **Struct:** Monitor (exec blueprint), plus Editorial for owner commentary; a scorecard table: metric, actual, target, change, sparkline, owner; each metric opens a detail view with its segment breakdown.
- **Sig:** Weekly business review format: trailing 6 weeks plus 12 months, year over year; Plan vs actual; Metric definitions in a tooltip.
- **Do:** show each metric's definition in a tooltip; flag only variances beyond a threshold; put event annotations on the line; keep written commentary next to the number; offer scheduled email and export.
- **Don't:** green-arrow cards with no comparison → value, change against a named period, and target; 20 metrics → only those tied to decisions.
- **#:** actual vs target, trend, the north-star metric and its inputs | cumulative totals that only go up.

### 9. Billing / subscriptions / spend management
- **Obj:** Customer → subscription → price → invoice → payment → refund or dispute; Usage records; Spend: card → transaction → receipt → approval → policy
- **Jobs:** finance recovers failed payments and answers disputes; support changes plans and issues refunds; the controller closes the month.
- **First:** the exceptions (failed payments, disputes with deadlines, past-due invoices, missing receipts, pending approvals), then a small MRR summary.
- **Struct:** Operate plus Monitor; list → detail, with an immutable event timeline; an approvals inbox.
- **Sig:** Stripe: every object linked by ID, an event log, an invoice preview before any change, an unmissable test mode; Ramp: a review queue with policy flags on top, receipts auto-matched.
- **Do:** money is append-only: corrections are credit notes or refunds; store amounts as integer minor units; always show the currency; use `tabular-nums`; preview every money action; record who did what, and when, on every change.
- **Don't:** editing a sent invoice → void or credit it, then reissue; MRR chart as home → exceptions queue; deleting a customer → archiving them; lump-sum fee → itemised charges.
- **#:** MRR movements (new, expansion, contraction, churn), failed-payment recovery, net revenue retention, days sales outstanding, outstanding receipts | all-time gross volume.

### 10. Helpdesk / support inbox
- **Obj:** Conversation (status, assignee, priority, SLA) → messages, where a public reply and an internal note are different things; Customer → account; Macros, help articles, bot handoff
- **Jobs:** an agent clears their queue; a lead balances workload and SLAs; the customer gets an answer.
- **First:** the agent's queue (Mine / Unassigned / team views), with the top conversation open.
- **Struct:** Operate, as a three-pane inbox: views | conversation list | thread plus customer panel.
- **Sig:** Front: live collision detection and shared drafts; Intercom: the bot answers first and hands off with a summary; drafts come from the knowledge base; Zendesk: macros and SLA policies.
- **Do:** internal note looks unmistakably different from a reply, by colour and label. Mixing them up is the costliest error in this category; show who else is viewing or replying; snooze until a set time or until the customer replies; show the SLA timer only as a breach nears; customer panel shows plan, recent orders and past tickets; AI drafts; person sends.
- **Don't:** A 12-column ticket table → name, subject, snippet, age; close advances to the next conversation; unread counts on every view → count on Mine only.
- **#:** first response time, resolution time, backlog age, SLA breaches, reopen rate | tickets closed per agent.

### 11. Team chat
- **Obj:** Workspace → channel → message → thread, reactions, files; DMs, presence, mentions
- **Jobs:** catch up on what matters; discuss; find a past decision.
- **First:** the last channel, opened at the first unread message under a "New" divider.
- **Struct:** Converse plus Operate: sidebar | stream | thread pane.
- **Sig:** Slack: an Activity view for mentions, sidebar sections, recaps; Zulip / Twist: topics first.
- **Do:** mentions and DMs get count badges; other channel activity is shown in bold only; threads open in a side pane; each channel keeps its own draft; search supports operators.
- **Don't:** counts on every channel → bold; auto-scrolling while someone is reading → "New messages" pill; bubbles for group work chat → flat list that groups consecutive messages.
- **#:** unanswered mentions | messages sent.

### 12. CMS / content publishing
- **Obj:** Content type (schema) → entry (draft, published or scheduled versions) → fields and blocks → assets; Locales, authors and reviewers
- **Jobs:** A writer drafts and publishes; an editor reviews and schedules; a developer models content types.
- **First:** the content list, filtered to my drafts and items in review, with New as the primary action.
- **Struct:** Operate for editing, Editorial for preview. The editor sits beside a live preview on the real templates.
- **Sig:** Click-to-edit preview; calm editor; publish menu with schedule and newsletter options; Typed schemas.
- **Do:** "Changes not published" is always visible; schedule with a timezone; keep revisions with restore; derive the slug and SEO fields, but let them be edited.
- **Don't:** A 30-button toolbar → slash menu plus a selection toolbar; Save button → autosaved drafts, with Publish as the action; delete → unpublish or archive.
- **#:** items awaiting review, scheduled items, stale content | total posts.

### 13. Document editor / knowledge base / wiki
- **Obj:** Workspace → page tree → page → blocks → comments and mentions; Database pages, permissions, versions
- **Jobs:** write together; find the answer; keep documents true.
- **First:** Editors: the last page, or recents plus search; knowledge-base readers: search.
- **Struct:** Operate for editing, Reference or Editorial for reading: a tree sidebar, the page, ⌘K, comments in the margin.
- **Sig:** Blocks and the slash command; Suggestion mode; Verification (an owner plus a "verified until" date); Backlinks.
- **Do:** slash commands and markdown shortcuts; presence cursors; comments anchored to the text; version restore; reading width of about 70 characters; stale-page flag in knowledge bases.
- **Don't:** fixed, heavy toolbar → contextual tools; deep tree as the only navigation → search and links; blank page on a permission error → "Request access".
- **#:** searches with no results, stale pages | page count.

### 14. Accounting / invoicing
- **Obj:** Contact (customer or vendor) → invoice or bill (lines, tax, due date) → payment → bank transaction → reconciliation match → ledger account
- **Jobs:** send invoices and get paid; reconcile the bank feed; report and file.
- **First:** what you're owed and what you owe: overdue invoices, bills due, unreconciled bank lines, cash balance.
- **Struct:** Operate plus Monitor; status lists: draft, awaiting payment, overdue, paid; the invoice editor beside the live document; reconciliation as a matching queue.
- **Sig:** Xero: the bank line and its suggested match side by side, confirmed with one key; payment link on the invoice; Receipt capture.
- **Do:** editor shows the document exactly as it will be sent; numbering is automatic; tax is set per line; totals update live; preview the email before sending; sent invoice is locked; corrections are credit notes.
- **Don't:** charts as home → AR ageing buckets; editing a sent invoice → credit note; reconciliation grid → matching queue.
- **#:** AR ageing, overdue total, days sales outstanding, cash runway, unreconciled count | invoices created.

### 15. Forms / survey builder
- **Obj:** Form → questions (type, validation, logic) → responses → integrations; Theme
- **Jobs:** build and publish a form; respondents fill it in; owners analyse and export.
- **First:** the form list, then an editor that looks like what respondents will see.
- **Struct:** Builder: Operate; respondent: Flow; results: Monitor, with a per-question summary and a responses table.
- **Sig:** doc-like editor where "/" adds a question; One question per screen; Logic and integrations.
- **Do:** build inside the respondent view; show logic inline on the question; show drop-off per question; offer CSV export and webhooks.
- **Don't:** settings modal per question → inline settings; multi-column respondent forms → one column; asterisks everywhere → mark the optional fields instead.
- **#:** completion rate, drop-off per question, median time | views.

### 16. LMS / course platform
- **Obj:** Course → module → lesson (video, text, quiz) → learner progress; Cohort; Assignment → submission → grade; Certificate
- **Jobs:** A learner continues where they left off; an instructor builds courses and grades; an admin assigns and tracks required training.
- **First:** Learner: Continue, at the exact spot they left off; instructor: submissions to grade; admin: overdue required training.
- **Struct:** Flow for the sequence, Editorial for lessons, Operate for authoring and grading; layout: an outline sidebar | the lesson | a Next button.
- **Sig:** learning path; rubric beside the submission when grading, with next and previous; Mastery.
- **Do:** resume exactly where the learner stopped; done marks in the outline; "3 of 8 lessons" is legitimate here; captions and transcripts.
- **Don't:** streak pressure → honest progress; stat cards for learners → Continue; autoplaying the next video → explicit Next.
- **#:** completion, drop-off by lesson, scores | enrolment counts.

### 17. HR / people / recruiting (ATS)
- **Obj:** Recruiting: Job → stages → application → candidate; interview → scorecard; offer; HR: Employee → role, team, manager → time off, compensation, documents
- **Jobs:** A recruiter moves candidates through stages; an interviewer submits feedback; an employee helps themselves.
- **First:** Recruiter: candidates who need action; interviewer: my interviews and the scorecards I owe; employee: my balance, and Request time off.
- **Struct:** Operate; the pipeline is a table grouped by stage; a board only for small requisitions; the candidate profile has a timeline; self-service tasks follow Flow.
- **Sig:** Scheduling automation; scorecard per stage; Employee self-service.
- **Do:** hide others' feedback until mine is submitted, to avoid bias; show how long each candidate has been in their stage; bulk reject through a reviewed email template; compensation and ID numbers are gated by permission and masked.
- **Don't:** board with 100 cards per column → grouped table; rejecting without previewing the email → review step, since it reaches people.
- **#:** time in stage, pass-through rates, time to hire, offer acceptance, feedback latency | applicant totals.

### 18. Marketplace (two-sided)
- **Obj:** Listing → availability and price → booking or order → payment → payout; Buyer and seller profiles → reviews; Messages, disputes
- **Jobs:** the buyer finds what they want and books with confidence; the seller lists and handles orders; ops moderates for trust.
- **First:** Buyer: a search by intent (where, when, what); seller: requests to accept, messages, today.
- **Struct:** Buyer: Transact; seller: Operate, as a separate mode; messages: Converse, tied to the booking; results: a list beside a map.
- **Sig:** total price, fees included, shown up front; Double-blind reviews; host calendar; Live status.
- **Do:** show the total price including fees from the start; use real trust signals (verified status, rating with its count); show the cancellation policy before payment.
- **Don't:** one UI for both sides → two modes; fees revealed at the last step → fees shown in search.
- **#:** liquidity (search → booking, fill rate), time to first sale for new supply, repeat rate | raw GMV, listing count.

### 19. Product analytics
- **Obj:** Event → properties; User or group → cohort; Insight (trend, funnel, retention, paths) → dashboard; Experiment, feature flag
- **Jobs:** A PM answers "did X work?"; growth watches funnels; engineering instruments events.
- **First:** saved dashboards of pinned insights, plus "New insight". A dashboard is right when each tile is a saved, editable question.
- **Struct:** Monitor (analytics blueprint) plus Operate, with the query builder on the left and the chart on the right.
- **Sig:** Funnels that lead to session replays; Flags and experiments in the same tool; SQL escape hatch.
- **Do:** every chart opens to its query; funnel drop-off links to the people who dropped; experiments show sample size and confidence; keep an event catalog with definitions.
- **Don't:** fixed charts you can't drill into → editable insights; pageviews as the headline → activation and retention; silently mixing units → label whether it counts users or sessions.
- **#:** activation, retention, funnel conversion, feature adoption | pageviews, signups that never activate.

### 20. Issue tracking / dev tools
- **Obj:** Issue (status, priority, assignee, estimate) → project or cycle → branch, PR, checks; Triage queue; Error groups
- **Jobs:** an engineer picks the next issue and ships it; a lead triages and plans; a reviewer reviews PRs.
- **First:** My issues and the Inbox, plus the triage queue for whoever is on rotation.
- **Struct:** Operate, keyboard-first: a list grouped by status, and a detail view with activity.
- **Sig:** triage queue with rotation and suggested fields; Cycles; Copy branch name; Status moves when the PR merges; First-seen and last-seen times on errors.
- **Do:** link git activity automatically; support markdown with code blocks; `?` shows the keyboard shortcuts; every triage queue has an owner.
- **Don't:** required fields everywhere → title only; burndown chart as home → my issues.
- **#:** cycle time, open bugs by priority, triage age, PR review wait | issues closed, velocity.

### 21. Ops monitoring / observability
- **Obj:** Service → metrics, logs, traces; Alert rule → incident → on-call; Deploys, SLOs
- **Jobs:** on-call knows whether anything is broken, and why; an engineer debugs; the team reviews SLOs.
- **First:** what's firing, plus service health with rate, errors and duration (ops blueprint).
- **Struct:** Monitor, plus Operate for the incident timeline. Drill-down: service list → service → traces → logs, keeping the time range at every step.
- **Sig:** RED metrics for services, USE metrics for resources; Alert on symptoms; service map; incident timeline and status page.
- **Do:** one global time range, with the timezone shown; deploy markers on charts; seed the incident state.
- **Don't:** CPU gauges as home → RED metrics per service; alerts on causes → alerts on symptoms.
- **#:** error rate, p99, saturation, SLO burn rate, time to acknowledge and resolve | aggregate "99.99% uptime", number of dashboards.

### 22. Banking / personal finance
- **Obj:** Account → balance → transactions (merchant, category, pending or posted) → card; Payee → transfer; Budget or goal; Statement
- **Jobs:** check balance and recent activity; pay or transfer; understand spending.
- **First:** balances and recent transactions (pending ones marked), with Send / Pay as the primary action.
- **Struct:** Operate, plus Flow for payments. Mobile-first, with the native overlay.
- **Sig:** Instant notifications; Clean merchant names with logos; Pots; transactions review inbox.
- **Do:** send flow: payee → amount → review (fee, exchange rate, arrival date) → authenticate; one tap freezes the card; transactions are searchable; amounts are never truncated.
- **Don't:** yes/no payment modal → review screen; hidden exchange margins → rate and the fee shown; "financial health score" → upcoming bills against the balance.
- **#:** available balance, upcoming bills, spend against budget | scores, badges.

### 23. File storage / asset management
- **Obj:** Folder or collection → asset (versions, metadata, tags, rights expiry) → share link and permissions → comments and approvals
- **Jobs:** find a file; upload and share; manage versions and approvals.
- **First:** recent files and search, then the folder browser.
- **Struct:** Operate: a grid ⇄ list toggle; a preview panel; an upload tray
- **Sig:** Recents and "Shared with me"; Version stacks, time-coded comments, approvals; Metadata facets and rights expiry.
- **Do:** drop a file anywhere to upload. The tray shows progress, with cancel and retry; preview without downloading; share dialog shows who has access and how far the link reaches.
- **Don't:** permanent delete → trash with restore; blocking upload modal → tray; storage chart as home → recent files.
- **#:** quota used, rights expiring soon, approvals pending | total file count.

### 24. Healthcare / care records (compliance-heavy)
- **Obj:** Patient → encounter → observations, problems, medications, allergies, orders, notes; Care team, appointments, consent; Access audit
- **Jobs:** A clinician reviews and documents; a nurse administers and charts; admin schedules and bills.
- **First:** my schedule or today's patient list, with acuity and flags.
- **Struct:** Operate, plus Monitor for ward boards; patient list → chart; a persistent identity banner on every screen: name, two identifiers, allergies.
- **Sig:** identity banner; Drafted notes the clinician signs; FHIR-shaped data model.
- **Do:** every value carries its unit and reference range; abnormal values are marked H/L in text, not by colour alone; alerts are tiered and mostly passive: interruptive alerts get overridden most of the time; every access is logged; emergency override requires a stated reason.
- **Don't:** storms of popup alerts → tiered alerts, mostly inline; undo as the only safety net on orders → review step, since orders reach other people; ambiguous abbreviations → words spelled out; several patients open at once without clear identity → one patient per context, with the banner.
- **#:** unreviewed abnormal results, overdue tasks | none.

### 25. Field service / logistics / fleet
- **Obj:** Work order → location → customer → technician or driver → vehicle → route and stops → proof (photo, signature) → parts
- **Jobs:** A dispatcher assigns and reshuffles work; field staff do the work, often offline; the customer tracks arrival.
- **First:** Dispatcher: a map, a timeline per technician, and the unassigned queue; field staff: today's route, with the next stop on top.
- **Struct:** Operate for dispatch; the native overlay for field staff.
- **Sig:** Drag a job onto a technician's timeline; Route optimisation; customer ETA link; live fleet map.
- **Do:** offline-first, with a visible sync state; large targets that work in sunlight and with gloves; "Navigate" on the next stop; capture proof of delivery.
- **Don't:** map on its own → map plus a list; desktop forms on a phone → job cards; live refreshes that reorder the board → stable positions.
- **#:** on-time rate, first-time fix rate, jobs per technician-day, utilisation | total miles.

### 26. Email client
- **Obj:** Account → thread → message → attachments; Labels or splits, drafts, snooze and reminders
- **Jobs:** triage to zero; reply; find a message.
- **First:** the inbox (split by category), with the first thread selected.
- **Struct:** Operate: list | reading pane; ⌘K.
- **Sig:** split inbox; Keyboard triage (j/k/e); Snooze, and remind-if-no-reply; Undo send; screener for new senders.
- **Do:** archive is the default action, not delete; undo-send window; drafts autosave; mark as read on open, not on hover.
- **Don't:** delete as the primary action → archive.
- **#:** important threads still unanswered | total unread.

### 27. Design / whiteboard canvas tool
- **Obj:** File → page or board → frame → layers, shapes, components → comments; Library, prototype links
- **Jobs:** create and arrange; collaborate live; hand off and export.
- **First:** recent files. Inside a file: the canvas, with minimal chrome.
- **Struct:** Operate: the tool bar; layers on the left, properties on the right; a contextual toolbar on selection
- **Sig:** Multiplayer cursors; Components and variants; Single-letter tools; Stickies and templates.
- **Do:** current tool is always visible; standard pan and zoom; deep undo; snapping and guides; layer list as a keyboard alternative to the canvas.
- **Don't:** property dialogs → side panel; losing the selection when using the side panel → keep the selection; custom pan gestures → platform standard.
- **#:** n/a for users | object counts.
