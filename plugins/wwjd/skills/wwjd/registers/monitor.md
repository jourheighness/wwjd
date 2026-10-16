# Monitor: dashboards, analytics, metrics, ops views

Success: in 5 seconds the person knows whether anything needs them, and where to click. A dashboard is not a place to show all the data. The prompt's nouns are an inventory to triage, not a list of widgets.

## 1. Triage before layout (required)
Write this down before drawing anything, and record it with the design decisions. No triage, no layout.

1. **Role and questions.** One line with:
   - the role
   - the context (device, time pressure)
   - the top 3 questions, with time budgets of 5s, 30s and 2min

   The 5-second question is almost always "does anything need me?", and it decides the first screen.
2. **Inventory.** List every candidate datum: everything the prompt names, plus everything you're tempted to add. The urge to show everything gets spent here, on paper.
3. **Classify each datum,** with a one-word reason:

   | Level | Meaning | Shown as |
   |---|---|---|
   | L0 needs action | Someone must act now: firing alerts, open incidents, breached thresholds, items awaiting you | A list of objects, each with owner or ack state and a link; when empty, one quiet line |
   | L1 at a glance | Answers the 5s or 30s question: symptoms, SLIs, the headline trend | Compact, always with context (target, comparison) |
   | L2 drill-down | Diagnoses or explains: causes, breakdowns, per-entity detail, budget maths, history | On the detail page, drawer or expansion, reached by clicking the L0/L1 element it explains |
   | L3 cut | Answers none of the 3 questions: vanity totals, averages, uptime %, "requests today", raw log streams | Deleted, not hidden |

   **Tie-breakers:**
   - Symptoms go up, causes go down a level.
   - Show the derived measure (variance %), not its inputs.
   - A signal that feeds neither a question nor an alert is cut.
4. **Budgets for the first screen** (1280×800; L0 and L1 fit without scrolling):

   | Budget | Max |
   |---|---|
   | Top-level regions | 5 |
   | Charts with axes | 4 |
   | Headline numbers | 4, one visibly leading |
   | L0 rows | 5, then "+N more" |
   | Colours beyond neutrals | accent, 2 status colours, 1 highlight |
   | Series per chart | 1 highlighted plus grey context; past 5, use small multiples |
   | Sentences containing a number beside a chart | 0 |
   | Significant digits | 2–3 ($3.8M, 0.15%) |

   **Over budget means demote to L2. Never shrink things to fit.**

## 2. Blueprints

### Ops / on-call
- **Header line:** scope, time range with timezone, freshness ("Live, 12s ago"), who is on call.
- **Regions:**
  1. Needs you: incidents and unacked alerts, full width.
  2. Services table: one row per service, worst first, with status, error-rate and p99 sparklines against the SLO band, and burn rate. Healthy services collapse into "N healthy".
  3. Trend: error rate and p99 stacked on a shared x-axis, with an SLO line, deploy markers and an incident span.
  4. Recent deploys: the last 5, the same events as the chart markers.
- **Drill path:** incident → service page (symptoms, then causes, then dependencies) → traces and logs.
- **Never first:** CPU and memory, per-endpoint data, the 30-day budget gauge, a log stream, MTTR.

### Product analytics
- **First screen:**
  - one large switchable trend (click a headline metric to swap it in)
  - ranked bar lists: sources, pages, events
  - one global range, a named comparison period, one filter bar
- **Filtering:** clicking any row filters the page, shown as chips.
- **Never first:** funnels, cohorts, a world map, ten equal KPI tiles.

### Business / exec
- **First screen:** 3–4 KPIs against target (bullet or variance form), one trend against plan, the 3 biggest movers.
- **Drill path:** KPI → segment small multiples → table with export.
- **Never:** gauges, raw counts without a target.

### Home screen in a SaaS app
- **First screen:** the person's own queue (what awaits them, by urgency), then one state summary against last period, then recents. Each item opens its object.
- **Never first:** "Welcome back", account-wide analytics, a finished onboarding checklist, upsells.

### Admin overview
- **First screen:**
  1. an L0 strip: failed jobs, pending approvals, quota or billing breaches, security events
  2. system state as a status list
  3. recent admin activity
- **Never first:** growth charts, total-user counts.

## 3. Charts here
- **Never narrate what a chart shows.**
  - No "error rate peaked at 0.15% at 08:30, coinciding with…".
  - No "Insights" or "Summary" prose panels.
  - Annotate the chart instead: a dot on the peak with its value, and the nearest preceding event highlighted.
- **Events live on the time axis:**
  - A deploy or config change is a thin dashed line labelled with service and version, linking to the diff.
  - An incident is a faint shaded span.
  - Overlapping events merge into one marker with a count.
- **Targets and normal ranges:** a labelled line or band for the target or SLO, and a light band for the normal range. Breaches are flagged modestly, never as a traffic-light wall.
- **Always answer "compared to what?":** a dashed previous-period overlay or a target line, not a bare delta.
- **Small multiples over one crowded chart:** per-entity comparisons are shared-scale multiples or sparkline rows. One big chart is for one series plus its context.
- **A number beats a chart** when the trend doesn't matter to the decision, or for one value against a threshold (a bullet bar, never a gauge).
- **No dual y-axes:** stack charts on a shared x-axis instead.
- **Sparklines:** word-sized, with the latest value as a number at the end and a dot on the last point. Rows share a scale or say they don't.
- **Time range:**
  - The default fits the question: on-call 6h, product 30d, exec quarter to date.
  - Linked charts zoom together.
  - Refresh no faster than the data changes.
- **Units and statistics:** units once, in the title or axis. Latency in percentiles, never means. Normalise to % when entities differ in size.
- **Missing data:**
  - The partial current bucket is dashed, never a fake drop.
  - Gaps stay gaps.
  - "No data" looks different from 0.
- **Layout:**
  - Lines run edge to edge at a fixed aspect ratio, and nothing stretches vertically with the grid.
  - No chart sits lonely in dead space.
- **Also:** the general rules in `commands/colour.md` (Charts) and the integrity rules in `references/faux-pas.md`. Each chart has a table alternative for screen readers.

## 4. States, signals and data
- **Signals:**
  - Calm is quiet: one muted line, no green "All systems operational" banner, no ticks everywhere.
  - Status colour only on what isn't OK, always paired with a shape or a word.
  - A needs-you signal too faint to find at a glance is as wrong as a christmas tree.
- **Distinct states:** no data, zero, partial, error and loading each look different. Show freshness: live or stale, with "last updated".
- **Seed the realistic bad day:** an active sev-2, one breached service, a deploy 4 minutes before the spike, one stale source. Not an all-healthy demo.
- **Filters** show what they scope. Cross-filtering is visible and easy to clear.
- **Tables:**
  - 12–14px text, a sticky header, a locked first column, `tabular-nums`, right-aligned numbers.
  - Drill into a row, with a breadcrumb back.
  - Column widths stay locked on refresh.

## 5. Bans: never this, do that instead

| Never | Instead |
|---|---|
| One widget per noun in the prompt | Nouns are inventory; "deploys" becomes chart markers plus a 5-row list |
| A KPI-card row as the first row ("Uptime 99.98% ▲") | The L0 list first; headline numbers only where they answer the 5s question |
| Narration or "Insights" prose beside charts | Annotations on the chart; a real problem becomes an L0 item |
| Every metric for every entity | Symptoms per entity in one table; causes on the detail page |
| Averages or p50 next to p99 | The percentile that matters; the distribution at L2 |
| Gauges, radial progress, donuts | A number, a bullet bar against target, or a bar chart |
| A different chart type per panel "for variety" | The same form for the same job |
| Filler widgets to close grid holes | Regions resize; empty space is allowed |
| Invented precision (0.1534%, 08:30:17) | 2–3 significant digits, minute resolution |
| Duplicate panels per time range | One global range control |
| A gradient fill under every line, grow-in animations, legends that restate the axis | A plain line, no entrance motion, direct labels |
| "Welcome back, John" | The person's queue |

## 6. Before handing over
- **Map it:** every first-screen element maps to a question from the triage. Name the question each one answers; "none" means cut.
- **Count against the budgets:** regions, charts, headline numbers, colours.
- **5-second test** on the incident state: a fresh viewer names the L0 item and where to click. On the calm state the answer is "nothing".
- **Blur test:** the heaviest blob is the L0 region when something is wrong; nothing stands out when calm.
- **Event test:** the deploy that preceded the spike is visible on the chart without hovering.
- **Drill test:** every L1 element leads to its detail, with a way back.
