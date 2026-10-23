# Glossary

Use these terms literally; each names one thing. A drawer is not a rail.

| Term | Meaning |
|---|---|
| Project canvas | The project's Design Artifact: every screen per journey, the flow and the decisions (`../flow/references/canvas.md`); `"canvas"` in `.wwjd.json` |
| Flow model | `wwjd.flow.json`: screens, the ways between them, journeys; written and checked by `wwjd:flow` |
| Flow (register) | Signup, wizard, long forms (`registers/flow.md`); not the Flow setting or `wwjd:flow`, which model the whole app |
| Canvas | A Design canvas file (`.dc.html`); renders only in its canvas, so no screenshots |
| Register | The job a surface does (Persuade, Operate…), chosen per surface, not per product |
| Surface | A page, screen or pane being worked on |
| Region | A unit with its own action hierarchy: card, row, toolbar, dialog, page header, pane |
| Kit | The project's shared components and tokens |
| Workshop | Components shown in isolation with their states (Storybook, Ladle) |
| Spec | The approved design being built (mockup, Figma frame, comparison page, recorded decision) |
| Decision log | `docs/decisions/` if it exists, else a "Decisions" section in DESIGN.md (`commands/start.md`) |
| Taste file | `~/.config/wwjd/taste.md`: the person's rules for every project (precedence: SKILL.md §1) |
| User profile | `$WWJD_PROFILE` or `~/.config/wwjd/profile.md`: workflow and locale only; not `data-profile` (type preset in `kit/base.css`) |
| Contrast matrix | Every text token on every background it is declared on, each AA |
| Scrim | A neutral shade between an image and the text on it |
| Golden file | A screen the project names as the one to imitate |
| Chrome | A container's visible surface: background, border, padding |
| Bleed / hang | Chrome extending into the gutter so the content keeps the column edge |
| Ground / ink / accent | Base background, text colour, the one emphasis colour |
| Tone step | A small lightness difference between surfaces, instead of a border or shadow |
| Needs-you / watch / quiet | The signal scale, only where a product has states that need people: do something now / keep an eye on it / needs no one, so no signal colour. Alerting dashboards say act / attend / calm |
| Dashboard model | How a dashboard answers its job: alerting, explore, scorecard, trend and breakdown, progress, status page, story (`registers/monitor.md` §2) |
| Mark | A small sign of state on the item itself (dot, glyph, strike, faded swatch); one per state |
| Identity mark | What says which thing a row is: an icon, logo, avatar or swatch; not a state |
| Needs-you signal | A mark that something waits on the person (often a dot, not a count); findable at a glance |
| Fact grade | Decides / delights / nothing (`budgets.md` Grades) |
| Budget | A surface's min–max of facts and actions (`budgets.md`) |
| Job | What the person does on a surface (glance, decide, configure, review, compare, bulk edit, audit, inspect, flow, persuade); it picks the surface's kind |
| Exposure surface | A surface whose job is configure, review, compare, bulk edit, audit or inspect: shows everything the job needs (`budgets.md` Expose by job) |
| Grade gate | A written `grade.mjs` sheet before building an over-budget surface (Strictness 4+, `budgets.md`) |
| Stretched target | A row's or card's title link whose `::after` covers the whole container; one target, one behaviour |
| Hover toolbar | A row's shortcuts, shown on hover, focus inside or an open menu; each also in ⋯ or the detail view |
| Christmas tree | Colour on everything, so nothing stands out |
| Status zoo | Too many statuses; reduce to the ones a person acts on |
| Machinery receipts | UI reporting the process ("read 14 files") instead of the result |
| Tame | A minimal bolt-on to the old design where a redesign was needed |
| Long-familiar surface | A high-trust surface used daily for years; change behaviour before looks |
| Near-miss | A value close to a token without matching it (ΔE2000 < 6, 1–2px off scale); snap it |
| Workaround feature | A feature routing around a failing area (a "classic view" toggle, a promoted "Recently visited") |
| Must-requirement | A pass/fail condition every explore variant must meet |
| Path count | The number of decisions from landing to result |
| Drawer | An overlay anchored to an edge, opened on demand |
| Rail | A narrow, persistent column of navigation icons |
| Panel / pane | A docked, often resizable layout region |
| Sheet | A modal surface sliding from the bottom or an edge (detents: its snap heights) |
| Tray | A temporary strip holding queued or pending items |
| Popover | A small floating surface anchored to its trigger |
| Review sheet | The Floor's review step (money, legal, account deletion, sending to others): real choices, never yes/no |
| Signature move | The one memorable element a design spends its boldness on |
| Tell / slop | A detail that gives away generated UI / the generic generated look (`bans.md`) |
| Drift lane | Where generated UI goes after its first default is banned |
| Avoidance aesthetic | Everything removed, nothing designed: a thin grey wireframe |
