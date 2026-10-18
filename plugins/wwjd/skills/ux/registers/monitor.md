# Monitor: dashboards, analytics, metrics, ops views

Profile: `data-profile="app"`. Colour: attention only; status colour only on what isn't OK, accent under ~5% of the view.

Success: in 5 seconds the person knows whether anything needs them, and where to click. The prompt's nouns are an inventory to triage, not a list of widgets.

## 1. Triage before layout (required; record it with the design decisions)
1. **Role and questions:** the role, the context (device, time pressure), the top 3 questions with budgets of 5s, 30s, 2min. The 5s question is almost always "does anything need me?", and it decides the first screen.
2. **Inventory:** every candidate datum, including everything you're tempted to add. The urge to show everything is spent here, on paper.
3. **Classify each,** with a one-word reason:

   | Level | Meaning | Shown as |
   |---|---|---|
   | L0 needs action | Firing alerts, open incidents, breached thresholds, items awaiting you | A list of objects with owner or ack state and a link; when empty, one quiet line |
   | L1 at a glance | Answers the 5s/30s question: symptoms, SLIs, the headline trend | Compact, always with context (target, comparison) |
   | L2 drill-down | Causes, breakdowns, per-entity detail, budget maths, history | Detail page, drawer or expansion, reached from the L0/L1 element it explains |
   | L3 cut | Answers none of the 3: vanity totals, averages, uptime %, "requests today", raw log streams | Deleted, not hidden |

   Symptoms up, causes down: symptoms per entity in one table, causes on the detail page. Never a KPI-card row first ("Uptime 99.98% ▲"): L0 leads; headline numbers only where they answer the 5s question. Show the derived measure (variance %), not its inputs. A signal feeding neither a question nor an alert is cut.
4. **First-screen budgets** (1280×800; L0 and L1 fit without scrolling). **Over budget = demote to L2, never shrink to fit.**

   | Budget | Max |
   |---|---|
   | Top-level regions | 5 |
   | Charts with axes | 4 |
   | Headline numbers | 4, one visibly leading |
   | L0 rows | 5, then "+N more" |
   | Colours beyond neutrals | accent, 2 status, 1 highlight |
   | Series per chart | 1 highlighted + grey context; past 5, small multiples |
   | Sentences with a number beside a chart | 0 |
   | Significant digits | 2–3 ($3.8M, 0.15%) |

## 2. Blueprints (layout: `dashboard`; public: `status-page`)
- **Ops / on-call:** header line = scope, range with timezone, freshness ("Live, 12s ago"), who's on call. Regions: (1) needs you: incidents and unacked alerts, full width; (2) services table, worst first: status, error-rate and p99 sparklines against the SLO band, burn rate; healthy ones collapse into "N healthy"; (3) trend: error rate and p99 stacked on a shared x-axis, SLO line, deploy markers, incident span; (4) the last 5 deploys, the same events as the markers. Drill: incident → service (symptoms, causes, dependencies) → traces and logs. Never first: CPU/memory, per-endpoint data, the 30-day budget gauge, a log stream, MTTR.
- **Product analytics:** one large switchable trend (click a headline metric to swap it in); ranked bar lists (sources, pages, events); one global range, a named comparison period, one filter bar. Clicking a row filters the page, shown as chips. Never first: funnels, cohorts, a world map, ten equal KPI tiles.
- **Business / exec:** 3–4 KPIs against target (bullet or variance), one trend against plan, the 3 biggest movers. Drill: KPI → segment small multiples → table with export. Never gauges or raw counts without a target.
- **SaaS home:** the person's own queue by urgency, then one state summary against last period, then recents; each item opens its object. Never first: "Welcome back", account-wide analytics, a finished onboarding checklist, upsells.
- **Admin overview:** an L0 strip (failed jobs, pending approvals, quota or billing breaches, security events), system state as a status list, recent admin activity. Never first: growth charts, total-user counts.

## 3. Charts
- **Form follows the job:** trend → line; comparison → bar; part of a whole → bars (a single pie only for 2–3 parts elsewhere; never donuts or gauges here). One value against a threshold → a bullet bar. A number beats a chart when the trend doesn't change the decision.
- **Series differ by more than hue:** dashed, dotted, marker shape; a colour-blind-safe categorical palette. Movement = a diverging pair plus a direction glyph. Dark theme: recolour, never invert.
- **Annotate, never narrate:** no "error rate peaked at 0.15% at 08:30…", no "Insights" panels. A dot on the peak with its value; the nearest preceding event highlighted. Label directly, not with a legend that restates. Low-contrast gridlines, no big axis labels.
- **Events on the time axis:** a deploy or config change is a thin dashed line labelled service + version, linking to the diff; an incident is a faint shaded span; overlapping events merge into one marker with a count.
- **"Compared to what?"** always answered: a dashed previous-period overlay, a labelled target/SLO line, a light normal-range band. Breaches flagged modestly, never a traffic-light wall.
- **Small multiples** (shared scale) or sparkline rows over one crowded chart. **No dual y-axes:** stack on a shared x-axis.
- **Sparklines:** word-sized, latest value as a number at the end, a dot on the last point; rows share a scale or say they don't.
- **Time range:** the default fits the question (on-call 6h, product 30d, exec quarter to date). Linked charts zoom together. Refresh no faster than the data changes. One global range control, never duplicate panels per range.
- **Units and stats:** units once, in title or axis. Latency in percentiles, never means, and only the percentile that matters (distribution at L2). Normalise to % when entities differ in size. Minute resolution, not 08:30:17.
- **Missing data:** the partial current bucket is dashed, never a fake drop; gaps stay gaps; "No data" differs from 0.
- **Shape:** lines edge to edge at a fixed aspect ratio; nothing stretches with the grid or escapes its container; no chart lonely in dead space. Regions resize; empty space is allowed, never filler widgets. The same form for the same job across panels.
- **Integrity (any failure fails the chart):** bars start at zero; compared series share a scale; the full relevant period; percentages have their denominator; no 3D, no area scaling; never correlation as cause.
- **Access:** one tab stop per chart with arrow keys between points, plus a table alternative. One tooltip system across all charts. No gradient fill under lines, no entrance animation.

## 4. States and data
- **Calm is quiet:** one muted line; no green "All systems operational" banner, no ticks everywhere.
- **Distinct states:** no data, zero, partial, error and loading each look different. Freshness shows: live or stale, "last updated".
- **Seed the bad day:** an active sev-2, one breached service, a deploy 4 minutes before the spike, one stale source. Never an all-healthy demo.
- **Filters** show what they scope; cross-filtering is visible and easy to clear.
- **Tables:** 12–14px, sticky header, locked first column, `tabular-nums`, end-aligned numbers, drill into a row with a breadcrumb back, column widths locked on refresh.

## 5. Before handing over
- **Map it:** every first-screen element names the triage question it answers; "none" = cut. Count against the budgets.
- **5-second test** on the incident state: a fresh viewer names the L0 item and where to click; on the calm state, "nothing".
- **Blur test:** the heaviest blob is L0 when something's wrong; nothing stands out when calm.
- **Event test:** the deploy before the spike is visible without hovering.
- **Drill test:** every L1 element leads to its detail and back.
