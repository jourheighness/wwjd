# Monitor: dashboards, analytics, metrics, ops views

Profile: `data-profile="app"`, primary width 1440 (390 when the model's people are on phones: progress, status page). Colour: meaning only (`rules/visual.md` Status), accent under ~5% of the view.

Success: in 5 seconds the person has the answer to the view's first question, and knows where to click. There is no one right dashboard: name the job, then pick the model (§2). The ask's nouns are an inventory to sort, not a list of widgets.

## 1. Job before layout (required; record it in the decision log)
1. **Role and questions:** the role, its context (device, time pressure), the top 3 questions with budgets of 5s, 30s, 2min. The 5s question picks the model and the first screen.
2. **Model:** the §2 entry whose job matches. Two jobs = two views, never one blended screen.
3. **Inventory:** every candidate datum, including everything you're tempted to add.
4. **Classify each,** with a one-word reason:

   | Level | Meaning | Shown as |
   |---|---|---|
   | L0 lead | Answers the 5s question: what the model puts first (§2) | First, full width, each item linking on; nothing to show = one quiet line |
   | L1 at a glance | Answers the 30s question: the headline trend, the context that makes L0 readable | Compact, always with context (target, comparison) |
   | L2 drill-down | Causes, breakdowns, per-entity detail, history | Detail page, drawer or expansion, from the L0/L1 element it explains |
   | L3 cut | Answers none of the 3: vanity totals, inputs whose derived measure shows, raw streams | Deleted, not hidden |

   Show the derived measure (variance %), not its inputs. A KPI row only where the model leads with one and every number carries its context; never bare totals ("Users 12,403 ▲"). Cut any datum that answers no question.
5. **First-screen budgets** (1280×800; L0 and L1 fit without scrolling). **Over budget = demote to L2, never shrink to fit.**

   | Budget | Max |
   |---|---|
   | Top-level regions | 5 |
   | Charts with axes | 4 |
   | Headline numbers | 4, one visibly leading |
   | L0 rows | 5, then "+N more" |
   | Colours beyond neutrals | accent, 2 status, 1 highlight |
   | Series per chart | 1 highlighted + grey context; past 5, small multiples |
   | Sentences with a number beside a chart | 0 (story aside) |
   | Significant digits | 2–3 ($3.8M, 0.15%) |

## 2. Models (layout: `dashboard`; public: `status-page`)
Each: the job, what leads (L0), what never comes first.
- **Alerting (observe and flag):** ops, on-call, admin, a person's work queue. Job: does anything need me, and where? L0 = what needs action: firing alerts, open incidents, breached thresholds, items awaiting you, each with owner or ack state and a link. Signals run act / attend / calm (glossary); only act and attend are loud. Symptoms up, causes down: symptoms per entity in one table, causes on the detail page. Never a KPI-card row first ("Uptime 99.98% ▲"); cut any signal that feeds neither a question nor an alert.
  - **Ops / on-call:** header = scope, range with timezone, freshness ("Live, 12s ago"), who's on call. Regions: (1) incidents and unacked alerts, full width; (2) services worst first: status, error-rate and p99 sparklines against the SLO band, burn rate; healthy ones collapse into "N healthy"; (3) error rate and p99 stacked on a shared x-axis with SLO line, deploy markers, incident span; (4) the last 5 deploys. Drill: incident → service → traces and logs. Never first: CPU/memory, per-endpoint data, the 30-day budget gauge, a log stream, MTTR.
  - **Admin overview:** an L0 strip (failed jobs, pending approvals, quota or billing breaches, security events), system state as a status list, recent admin activity. Never first: growth charts, total-user counts.
  - **SaaS home:** the person's queue by urgency, one summary against last period, recents. Never first: "Welcome back", account-wide analytics, a finished checklist, upsells.
- **Explore (product analytics, BI):** what happened, and why? L0 = one large trend, swapped by clicking a headline metric (a KPI row is right here); ranked bar lists (sources, pages, events); one global range, a named comparison period, one filter bar; clicking a row filters the page as a chip; every chart opens to its query. Never first: funnels, cohorts, a world map, ten equal KPI tiles.
- **Scorecard (business, exec):** are we on target? L0 = 3–4 KPIs against target (bullet or variance), one trend against plan, the 3 biggest movers. Drill: KPI → segment small multiples → table with export. Never gauges or raw counts without a target.
- **Trend and breakdown (finance, sales, revenue):** how are we doing, and what drives it? L0 = the main measure's trend against prior period or plan, then ranked breakdowns (segment, product, region, rep) that sum to it. Never first: raw transactions, a pie of segments.
- **Progress (personal, learning, health, habits):** am I on track? L0 = the goal and where I stand today, then recent days (a streak that survives one miss) and the next step. Never first: rankings against other people, totals with no goal, missed days in alarm red.
- **Status page (outsiders):** is it down, or is it me? L0 = current state in words, affected components, latest update with time (layout `status-page`). Never first: internal metrics, an uptime-% headline.
- **Story (report, data narrative):** the reader follows an argument (layout `article`, scrollytelling variant). Text carries it, each chart titled with its takeaway; the narrate ban and sentence budget don't apply. Never a widget grid without a thread.

## 3. Charts
- **Form follows the job:** trend → line; comparison or part of a whole → bar (never pies, donuts or gauges here). One value against a threshold → a bullet bar. A number beats a chart when the trend doesn't change the decision.
- **Series differ by more than hue:** dashed, dotted, marker shape; a colour-blind-safe palette. Movement = a diverging pair plus a direction arrow.
- **Annotate, never narrate** (story aside): no "error rate peaked at 0.15% at 08:30…", no "Insights" panels. A dot on the peak with its value; the nearest preceding event highlighted. Label series directly, no legend. Low-contrast gridlines, axis labels at meta size.
- **Events on the time axis:** a change (deploy, launch, price change) is a thin dashed line labelled with what changed, linking to it; an incident a faint shaded span; overlapping events merge into one marker with a count.
- **"Compared to what?"** always answered: a dashed previous-period overlay, a labelled target/SLO line, a light normal-range band. Flag breaches with one mark, never a traffic-light wall.
- **Small multiples** (shared scale) or sparkline rows over one crowded chart. **No dual y-axes:** stack on a shared x-axis.
- **Sparklines:** word-sized, latest value as a number at the end, a dot on the last point; rows share a scale or say they don't.
- **Time range:** the default fits the question (on-call 6h, product 30d, exec quarter to date, personal this week); one global control; linked charts zoom together. Refresh no faster than the data changes.
- **Units and stats:** units once, in title or axis. Latency as the one percentile that matters, never means (distribution at L2). Normalise to % when entities differ in size. Minute resolution, not 08:30:17.
- **Missing data:** the partial current bucket is dashed, never a fake drop; gaps stay gaps; "No data" differs from 0.
- **Shape:** fixed aspect ratio, lines edge to edge; nothing stretches with the grid or escapes its container. Empty space is allowed, filler widgets never. Same job, same chart form.
- **Integrity (any failure fails the chart):** bars start at zero; compared series share a scale; the full relevant period; percentages have their denominator; no 3D, no area scaling; never correlation as cause.
- **Access:** one tab stop per chart, arrow keys between points, a table alternative. One tooltip system. No gradient fill under lines, no entrance animation.

## 4. States and data
- **All-clear is one muted line** where the model has states: no green "All systems operational" banner, no ticks everywhere.
- **Distinct states** (`rules/states.md` Data states): no data, zero, partial, error and loading each look different. Freshness shows: live or stale, "last updated".
- **Seed the telling day:** demo data holds the state the model exists for, never an all-fine demo. Alerting, the bad day: something that needs action (an open incident, a breached target), a likely cause just before a spike (a deploy minutes earlier), one stale source. Scorecard: a metric off target; progress: a missed day; explore, trend: an outlier worth a click.
- **Filters** show what they scope; cross-filtering is visible and easy to clear.
- **Tables:** 12–14px, sticky header, locked first column, row drill-in with a breadcrumb back, column widths locked on refresh.

## 5. Before handing over
- **Map it:** every first-screen element names its question; "none" = cut. Count against the budgets.
- **5-second test** on the seeded state: a fresh viewer names the L0 answer and where to click. Alerting: on the incident state, the L0 item; on the calm state, "nothing".
- **Squint test** (`references/bans.md`): the heaviest blob is L0; alerting, when calm, nothing stands out.
- **Event test:** the change before a jump (the deploy before the spike) is visible without hovering.
- **Drill test:** every L1 element leads to its detail and back.
