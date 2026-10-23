# Product types

27 types. Grep `### <n>.` or the type name and read only that block; list them with `grep '^### '`. Keys: **Obj** core objects · **Jobs** what people come to do · **First** the first screen · **Struct** register and structure · **Do** · **Don't** (never this → instead) · **#** numbers that matter | vanity numbers. Picking the type and layout from the prompt: `registers/operate.md`.

## Across all types
- **A work tool opens on its work queue** (needs-you items, oldest first), not KPI cards: people open it to act. Watching and reporting (8, 19, 21, status pages, personal progress) pick a dashboard model (`registers/monitor.md` §2).
- **One query, many views:** list ⇄ board ⇄ calendar ⇄ timeline, saved as views in the URL.
- **Record page:** header facts, activity timeline (the audit log), related records (layout `record-page`).
- **Capture automatically** (sync, enrichment, OCR, defaults); manual entry kills adoption.
- **Keyboard:** ⌘K and shortcuts throughout expert tools; quick add from anywhere.
- **Statuses** split into independent dimensions (payment vs fulfilment), one mark vocabulary.
- **Money, health, people data, anything sent to others:** review step, audit log, append-only corrections; archive, never delete.
- **Field, mobile or offline users:** the native register plus offline sync.
- **Prices, fees and dates exact and up front;** timezones labelled.
- **AI drafts and fills inside the object; the human commits.** No path only AI can use.
- **Every number has a comparison or a threshold;** no cumulative vanity totals.

---

### 1. Admin / back-office internal tool
- **Obj:** entity records (User, Account, Order) → event/audit log; Role → Permission; queues (flagged, pending review)
- **Jobs:** support finds and fixes a record; ops bulk-edits; an admin grants access.
- **First:** global lookup plus the queues that need someone (pending, flagged, failed). Never "Total users: 12,403".
- **Struct:** Operate; list → detail drawer so the list stays visible; ⌘K lookup by any identifier; saved views as tabs in the URL.
- **Do:** look up by ID, email or phone from anywhere; refund, delete and impersonate through a review sheet with a logged reason; click-to-copy IDs; a bulk bar replaces the filters while rows are selected.
- **Don't:** one nav link per database table → nav by job (Queues, Customers, Orders); raw JSON → typed fields, raw behind "Inspect"; edit modal over the list → inline edit or drawer, with undo.
- **#:** queue size, oldest item's age, SLA breaches | row totals per table.

### 2. CRM / sales pipeline
- **Obj:** Company → People; Deal (stage, value, close date, owner, next step) → Company + People; Activity (email, meeting, note, task) → any record; List (a subset with its own attributes)
- **Jobs:** a rep works today's follow-ups and moves deals; a manager reviews pipeline and forecast; ops imports and dedupes.
- **First:** rep: overdue follow-ups, deals with no next step, replies waiting; manager: pipeline by stage with sum and count, not a chart dashboard.
- **Struct:** Operate, plus Monitor for the forecast; board ⇄ table as two views of one list; record page with timeline and related records in a side panel.
- **Do:** capture from mail, calendar and enrichment; a missing next step is the needs-you signal; board columns show sum and count; stage moves by drag, menu and keyboard; imports dedupe with a merge preview; spreadsheet-grade inline edit.
- **Don't:** 30-field contact form → name and email, the rest enriched or behind "+ Add details"; cards with 6 fields and buttons → name, value, owner avatar, next-step date; separate Activities page → timeline on every record.
- **#:** weighted pipeline by stage, deals with no next step, days in stage, win rate, cycle length | total contacts, emails sent.

### 3. Project & task management
- **Obj:** Workspace → Project (lead, status update, health) → Task → Subtask / Comment; Labels; Milestone / Cycle
- **Jobs:** an individual sees and updates their work; a lead plans, assigns and unblocks; a stakeholder checks project health.
- **First:** "My work" grouped by due (Overdue, Today, This week, Later), or the team's project list.
- **Struct:** Operate; list by default, board, timeline and calendar as views of the same saved query; task detail in a side panel; the inbox holds only what is addressed to the person.
- **Do:** quick add from anywhere with natural-language dates; a small fixed status workflow per team; project status is a written update with a health rating (on track / at risk / off track), not "% done".
- **Don't:** Gantt by default → list, timeline as a view; required fields on create → title only; a notification per change → mentions and assignments only.
- **#:** my overdue items, blocked items, scope added mid-cycle | tasks completed all-time, "productivity score".

### 4. Calendar / scheduling / booking
- **Obj:** Host or resource → availability (timezone, hours, overrides) → event type (duration, buffers, notice, location, questions) → booking (attendee, slot, status, payment) → reminders
- **Jobs:** the booker picks a time and confirms; the host sets availability once and handles reschedules; the front desk runs the day.
- **First:** booker: the slot picker (month grid plus slot list), nothing in front of it; host: the agenda; resource businesses (rooms, staff): a day view, one column per resource.
- **Struct:** booker: Flow and Transact; host: Operate with a week grid, drag to create.
- **Do:** only bookable slots, in the booker's labelled timezone; mark unavailable dates in the picker, never fail after the pick; confirmation gives date, time, timezone, place or link, add-to-calendar, reschedule and cancel; hold the slot during checkout; availability and price on the dates themselves.
- **Don't:** free date and time inputs → slot picker; form before the slot → slot first, then name and email (prefilled when known); cancelling harder than booking → same step count; "3–5 days" → a date.
- **#:** utilisation, no-show rate, lead time, reschedule and cancel rate | booking-page views.

### 5. E-commerce admin (orders, inventory)
- **Obj:** Order → line items → variant → inventory per location; Customer → orders; payment and fulfilment status as separate dimensions; Return / refund
- **Jobs:** fulfil today's orders; edit products and stock; handle returns.
- **First:** a task list (to fulfil, payments to capture, low stock, pending returns), a small sales summary below.
- **Struct:** Operate, a little Monitor; resource index → detail with timeline and internal comments; product editor with a variant grid.
- **Do:** bulk fulfil and print labels; variant matrix; stock per location; refund sheet with amount, restock and notify toggles, and a review step; a bulk-edit spreadsheet.
- **Don't:** one merged status → payment and fulfilment separate; long form with Save at the bottom → sections plus a sticky contextual save bar.
- **#:** unfulfilled orders and the oldest one's age, low stock, return rate, conversion, average order value | visitors, all-time sales.

### 6. AI assistant / agent workspace
- **Obj:** Thread → messages → tool calls → artifacts; Project → files, context, memory; Agent run → steps → approvals → output (diff, document, PR)
- **Jobs:** ask and get a trustworthy answer; delegate a task and review the result; reuse context across sessions.
- **First:** chat: composer, 3–4 specific suggestions, recent threads; agents: runs by status (needs you, running, done).
- **Struct:** Converse for the thread, Operate for artifacts and runs; thread column beside an artifact pane; an inbox for background runs.
- **Do:** chat per `registers/converse.md`; agents, approvals and runs per `references/ai.md`.
- **Don't:** chat as the only way to edit structured data → artifact pane or inline diff.
- **#:** acceptance rate, edits after acceptance, time to first token, cost per run | message and token counts.

### 7. Settings / account / billing area (any SaaS)
- **Obj:** User → profile, security (passkeys, sessions), notifications; Workspace → members and roles, integrations, API keys; Subscription → plan, seats, payment method, invoices
- **Jobs:** change one setting; manage members; change plan or payment, fetch invoices.
- **First:** grouped section nav (Account / Workspace / Billing) plus the first section; search from 8 sections or 40 settings (`budgets.md`).
- **Struct:** Operate; Flow for plan changes, Transact for upgrades.
- **Do:** plan change shows the exact price difference and charge date; cancel says "Access ends <date>. No further charges."; API keys named, shown once with copy, last-used date, revocable; members table with an inline role select.
- **Don't:** cancel via "contact us" → self-serve; retention offer in the brand accent → neutral styling.
- **#:** seats used of available, next charge (date, amount), usage against limit | none.

### 8. Business KPI / exec reporting
- **Obj:** Metric (definition, owner, target) → time series → segments; Report / board; Annotations (launches, price changes)
- **Jobs:** an exec checks if things are on track; the metric owner explains a variance; an analyst ships the weekly report.
- **First:** a dashboard fits here: a scorecard of 4–8 metrics, each against target and a named prior period, variance flagged.
- **Struct:** Monitor (scorecard model) plus Editorial for owner commentary; scorecard table: metric, actual, target, change, sparkline, owner; each metric opens its segment breakdown.
- **Do:** metric definitions in a tooltip; flag only variances past a threshold; event annotations on the line; commentary beside the number; scheduled email and export; weekly review: trailing 6 weeks plus 12 months, year over year.
- **Don't:** green-arrow cards with no comparison → value, change against a named period, target; 20 metrics → only those tied to decisions.
- **#:** actual vs target, trend, the north-star metric and its inputs | cumulative totals that only go up.

### 9. Billing / subscriptions / spend management
- **Obj:** Customer → subscription → price → invoice → payment → refund or dispute; usage records; spend: card → transaction → receipt → approval → policy
- **Jobs:** finance recovers failed payments and answers disputes; support changes plans and refunds; the controller closes the month.
- **First:** exceptions (failed payments, disputes with deadlines, past-due invoices, missing receipts, pending approvals), then a small MRR summary.
- **Struct:** Operate plus Monitor; list → detail with an immutable event timeline; an approvals inbox.
- **Do:** money is append-only (corrections are credit notes or refunds); amounts in integer minor units, currency always shown, `tabular-nums`; preview every money action; an unmissable test mode; approvals carry policy flags, receipts auto-matched.
- **Don't:** editing a sent invoice → void or credit, then reissue; lump-sum fee → itemised.
- **#:** MRR movements (new, expansion, contraction, churn), failed-payment recovery, net revenue retention, outstanding receipts | all-time gross volume.

### 10. Helpdesk / support inbox
- **Obj:** Conversation (status, assignee, priority, SLA) → messages (public reply and internal note are distinct); Customer → account; macros, help articles, bot handoff
- **Jobs:** an agent clears their queue; a lead balances workload and SLAs; the customer gets an answer.
- **First:** the agent's queue (Mine / Unassigned / team views), top conversation open.
- **Struct:** Operate, three-pane inbox: views | conversation list | thread plus customer panel.
- **Do:** internal note unmistakably different from a reply, by colour and label (the costliest mix-up here); show who else is viewing or replying; snooze until a time or a reply; SLA timer only near a breach; customer panel: plan, recent orders, past tickets; close advances to the next conversation; the bot hands off with a summary.
- **Don't:** 12-column ticket table → name, subject, snippet, age; unread counts on every view → count on Mine only.
- **#:** first response time, resolution time, backlog age, SLA breaches, reopen rate | tickets closed per agent.

### 11. Team chat
- **Obj:** Workspace → channel → message → thread; DMs, presence, mentions
- **Jobs:** catch up on what matters; discuss; find a past decision.
- **First:** the last channel, at the first unread under a "New" divider.
- **Struct:** Converse plus Operate: sidebar | stream | thread pane.
- **Do:** count badges only for mentions and DMs, other channel activity in bold, never counts; threads in a side pane; a draft per channel; search with operators; an Activity view for mentions.
- **Don't:** auto-scroll while reading → "New messages" pill; bubbles for group work chat → flat list grouping consecutive messages.
- **#:** unanswered mentions | messages sent.

### 12. CMS / content publishing
- **Obj:** Content type (schema) → entry (draft, published, scheduled versions) → fields and blocks → assets; locales, authors, reviewers
- **Jobs:** a writer drafts and publishes; an editor reviews and schedules; a developer models types.
- **First:** content list filtered to my drafts and items in review; New as primary.
- **Struct:** Operate for editing, Editorial for preview; editor beside a live preview on the real templates.
- **Do:** "Changes not published" always visible; schedule with a timezone; revisions with restore; slug and SEO fields derived but editable; click-to-edit preview.
- **Don't:** 30-button toolbar → slash menu plus selection toolbar; Save button → autosaved drafts, Publish as the action; delete → unpublish or archive.
- **#:** items awaiting review, scheduled items, stale content | total posts.

### 13. Document editor / knowledge base / wiki
- **Obj:** Workspace → page tree → page → blocks → comments and mentions; database pages, permissions, versions
- **Jobs:** write together; find the answer; keep documents true.
- **First:** editors: the last page, or recents plus search; readers: search.
- **Struct:** Operate for editing, Reference or Editorial for reading: tree sidebar, page, ⌘K, comments in the margin.
- **Do:** markdown shortcuts; presence cursors; comments anchored to text; version restore; ~70ch reading width; stale-page flag; slash commands; suggestion mode; verification (owner plus "verified until" date); backlinks.
- **Don't:** fixed heavy toolbar → contextual tools; deep tree as the only nav → search and links; blank page on a permission error → "Request access".
- **#:** searches with no results, stale pages | page count.

### 14. Accounting / invoicing
- **Obj:** Contact (customer or vendor) → invoice or bill (lines, tax, due date) → payment → bank transaction → reconciliation match → ledger account
- **Jobs:** send invoices and get paid; reconcile the bank feed; report and file.
- **First:** owed and owing: overdue invoices, bills due, unreconciled bank lines, cash balance.
- **Struct:** Operate plus Monitor; status lists (draft, awaiting payment, overdue, paid); invoice editor beside the live document; reconciliation as a matching queue.
- **Do:** the editor shows the document exactly as sent; automatic numbering; tax per line; live totals; email preview before sending; a sent invoice is locked, corrections are credit notes; suggested match beside the bank line, confirmed with one key; payment link on the invoice.
- **Don't:** reconciliation grid → matching queue.
- **#:** AR ageing, overdue total, days sales outstanding, cash runway, unreconciled count | invoices created.

### 15. Forms / survey builder
- **Obj:** Form → questions (type, validation, logic) → responses → integrations; theme
- **Jobs:** build and publish a form; respondents fill it in; owners analyse and export.
- **First:** the form list, then an editor that looks like what respondents see.
- **Struct:** builder: Operate; respondent: Flow; results: Monitor, per-question summary plus responses table.
- **Do:** build inside the respondent view; logic shown inline on the question; drop-off per question; CSV export and webhooks; "/" adds a question; one question per screen.
- **Don't:** settings modal per question → inline; multi-column respondent forms → one column; asterisks everywhere → mark optional fields.
- **#:** completion rate, drop-off per question, median time | views.

### 16. LMS / course platform
- **Obj:** Course → module → lesson (video, text, quiz) → learner progress; cohort; assignment → submission → grade; certificate
- **Jobs:** a learner continues; an instructor builds courses and grades; an admin assigns and tracks required training.
- **First:** learner: Continue at the exact spot; instructor: submissions to grade; admin: overdue required training.
- **Struct:** Flow for the sequence, Editorial for lessons, Operate for authoring and grading; outline sidebar | lesson | Next.
- **Do:** resume at the exact spot; done marks in the outline; "3 of 8 lessons" is legitimate here; captions and transcripts; grading puts the rubric beside the submission, with next/previous.
- **Don't:** streak pressure → honest progress; stat cards for learners → Continue; autoplay next video → explicit Next.
- **#:** completion, drop-off by lesson, scores | enrolment counts.

### 17. HR / people / recruiting (ATS)
- **Obj:** recruiting: Job → stages → application → candidate; interview → scorecard; offer; HR: Employee → role, team, manager → time off, compensation, documents
- **Jobs:** a recruiter moves candidates through stages; an interviewer submits feedback; an employee self-serves.
- **First:** recruiter: candidates needing action; interviewer: my interviews and owed scorecards; employee: balance and Request time off.
- **Struct:** Operate; pipeline as a table grouped by stage (board only for small requisitions); candidate profile with timeline; self-service as Flow.
- **Do:** hide others' feedback until mine is in (avoids bias); show time in stage; bulk reject through a reviewed email template; compensation and ID numbers permission-gated and masked.
- **Don't:** board with 100 cards per column → grouped table; rejecting without previewing the email → review step (it reaches people).
- **#:** time in stage, pass-through rates, time to hire, offer acceptance, feedback latency | applicant totals.

### 18. Marketplace (two-sided)
- **Obj:** Listing → availability and price → booking or order → payment → payout; buyer and seller profiles → reviews; messages, disputes
- **Jobs:** the buyer finds and books with confidence; the seller lists and handles orders; ops moderates.
- **First:** buyer: search by intent (where, when, what); seller: requests to accept, messages, today.
- **Struct:** buyer: Transact; seller: Operate, a separate mode; messages: Converse, tied to the booking; results: list beside a map (`map-list`).
- **Do:** total price including fees from the start; real trust signals (verified status, rating with count); cancellation policy before payment; double-blind reviews.
- **Don't:** one UI for both sides → two modes; fees at the last step → fees in search.
- **#:** liquidity (search → booking, fill rate), time to first sale for new supply, repeat rate | raw GMV, listing count.

### 19. Product analytics
- **Obj:** Event → properties; User → cohort; Insight (trend, funnel, retention, paths) → dashboard; experiment, flag
- **Jobs:** a PM answers "did X work?"; growth watches funnels; engineering instruments events.
- **First:** saved dashboards of pinned insights plus "New insight"; a dashboard is right when each tile is a saved, editable question.
- **Struct:** Monitor (explore model) plus Operate; query builder left, chart right.
- **Do:** every chart opens to its query; funnel drop-off links to the people who dropped; experiments show sample size and confidence; an event catalog with definitions; a SQL escape hatch.
- **Don't:** fixed charts → editable insights; pageviews as headline → activation and retention; mixed units → label users or sessions.
- **#:** activation, retention, funnel conversion, feature adoption | pageviews, signups that never activate.

### 20. Issue tracking / dev tools
- **Obj:** Issue → project or cycle → branch, PR, checks; triage queue; error groups
- **Jobs:** an engineer picks the next issue and ships it; a lead triages and plans; a reviewer reviews PRs.
- **First:** My issues and Inbox, plus the triage queue for whoever is on rotation.
- **Struct:** Operate, keyboard-first: list grouped by status, detail with activity.
- **Do:** link git activity automatically; markdown with code blocks; `?` shows shortcuts; every triage queue has an owner; status follows the PR; copy branch name.
- **Don't:** required fields everywhere → title only.
- **#:** cycle time, open bugs by priority, triage age, PR review wait | issues closed, velocity.

### 21. Ops monitoring / observability
- **Obj:** Service → metrics, logs, traces; alert rule → incident → on-call; deploys, SLOs
- **Jobs:** on-call knows whether anything is broken, and why; an engineer debugs; the team reviews SLOs.
- **First:** what's firing, plus service health by rate, errors, duration (alerting model).
- **Struct:** Monitor plus Operate for the incident timeline; drill-down service list → service → traces → logs, keeping the time range.
- **Do:** one global time range with timezone; deploy markers on charts; seed the incident state; USE metrics for resources.
- **Don't:** CPU gauges → RED per service; alerts on causes → on symptoms.
- **#:** error rate, p99, saturation, SLO burn rate, time to acknowledge and resolve | aggregate "99.99% uptime", dashboard count.

### 22. Banking / personal finance
- **Obj:** Account → balance → transactions (merchant, category, pending or posted) → card; payee → transfer; budget or goal; statement
- **Jobs:** check balance; pay or transfer; understand spending.
- **First:** balances and recent transactions (pending marked); Send / Pay primary.
- **Struct:** Operate, Flow for payments; mobile-first with the native register.
- **Do:** send flow: payee → amount → review (fee, exchange rate, arrival date) → authenticate; one tap freezes the card; searchable transactions; amounts never truncated; clean merchant names with logos.
- **Don't:** yes/no payment modal → review screen; hidden exchange margins → rate and fee shown; "financial health score" → upcoming bills against the balance.
- **#:** available balance, upcoming bills, spend against budget | scores, badges.

### 23. File storage / asset management
- **Obj:** Folder or collection → asset (versions, metadata, tags, rights expiry) → share link and permissions → comments and approvals
- **Jobs:** find a file; upload and share; manage versions and approvals.
- **First:** recent files and search, then the folder browser.
- **Struct:** Operate: grid ⇄ list, preview panel, upload tray.
- **Do:** drop anywhere to upload, tray with progress, cancel, retry; preview without downloading; share dialog shows who has access and how far the link reaches; version stacks.
- **Don't:** permanent delete → trash with restore; blocking upload modal → tray.
- **#:** quota used, rights expiring soon, approvals pending | total file count.

### 24. Healthcare / care records (compliance-heavy)
- **Obj:** Patient → encounter → observations, problems, medications, allergies, orders, notes; care team, appointments, consent; access audit
- **Jobs:** a clinician reviews and documents; a nurse administers and charts; admin schedules and bills.
- **First:** my schedule or today's patient list, with acuity and flags.
- **Struct:** Operate, Monitor for ward boards; patient list → chart; a persistent identity banner on every screen: name, two identifiers, allergies.
- **Do:** every value has its unit and reference range; abnormal values marked H/L in text; alerts tiered, mostly passive (interruptive ones get overridden most of the time); every access logged; emergency override needs a stated reason; AI drafts notes, the clinician signs.
- **Don't:** undo as the only safety net on orders → review step (orders reach other people); ambiguous abbreviations → words spelled out; several patients open without clear identity → one patient per context, with the banner.
- **#:** unreviewed abnormal results, overdue tasks | none.

### 25. Field service / logistics / fleet
- **Obj:** Work order → location → customer → technician or driver → vehicle → route and stops → proof (photo, signature) → parts
- **Jobs:** a dispatcher assigns and reshuffles; field staff do the work, often offline; the customer tracks arrival.
- **First:** dispatcher: map, a timeline per technician, the unassigned queue; field staff: today's route, next stop on top.
- **Struct:** Operate for dispatch; the native register for field staff.
- **Do:** offline-first with a visible sync state; large targets for sunlight and gloves; "Navigate" on the next stop; capture proof of delivery; dispatch by dragging a job onto a technician's timeline; a customer ETA link.
- **Don't:** map alone → map plus list; desktop forms on a phone → job cards; live refreshes that reorder the board → stable positions.
- **#:** on-time rate, first-time fix rate, jobs per technician-day, utilisation | total miles.

### 26. Email client
- **Obj:** Account → thread → message → attachments; labels or splits, drafts
- **Jobs:** triage to zero; reply; find a message.
- **First:** the inbox (split by category), first thread selected.
- **Struct:** Operate: list | reading pane; ⌘K.
- **Do:** undo-send window; drafts autosave; mark read on open, not hover; keyboard triage (j/k/e); snooze and remind-if-no-reply.
- **Don't:** delete as the default action → archive.
- **#:** important threads unanswered | total unread.

### 27. Design / whiteboard canvas tool
- **Obj:** File → page or board → frame → layers, components → comments; library
- **Jobs:** create and arrange; collaborate live; hand off and export.
- **First:** recent files; inside a file, the canvas with minimal chrome.
- **Struct:** Operate: tool bar, layers left, properties right, contextual toolbar on selection.
- **Do:** current tool always visible; standard pan and zoom; deep undo; snapping and guides; layer list as a keyboard alternative to the canvas; single-letter tools.
- **Don't:** property dialogs → side panel; selection lost when using the panel → keep it; custom pan gestures → platform standard.
- **#:** n/a for users | object counts.
