# Glossary

The owner's words, used literally. A drawer is not a rail.

| Term | Meaning |
|---|---|
| Register | The job a surface does (Persuade, Operate…), chosen per surface, not per product |
| Surface | A page, screen or pane being worked on |
| Region | A unit with its own action hierarchy: card, row, toolbar, dialog, page header, pane |
| Kit | The project's shared components and tokens |
| Workshop | Where components show in isolation with their states (Storybook, Ladle) |
| Spec | The approved design being built: mockup, Figma frame, comparison page, recorded decision |
| Decision log | Where the project records dated design decisions (`docs/decisions/`, DESIGN.md named rules) |
| User profile | `$WWJD_PROFILE` or `~/.config/wwjd/profile.md`: workflow and locale only. Not `data-profile` (the type/rhythm preset in `kit/base.css`) |
| Contrast matrix | Every text token against every background it's declared on, each AA |
| Scrim | A neutral shade between an image and the text on it |
| Golden file | A screen the project names as the one to imitate |
| Chrome | A container's visible surface: background, border, padding |
| Bleed / hang | Chrome extending into the gutter so the content keeps the column edge |
| Ground / ink / accent | Base background, text colour, the one emphasis colour |
| Tone step | A small lightness difference between surfaces, instead of a border or shadow |
| Act / attend / calm | Do something now / keep an eye on it / needs no one, no signal colour |
| Mark | A small sign of state on the item itself (dot, glyph, strike, faded swatch); one per state |
| Needs-you signal | A mark that something needs you (often a dot, not a count); findable at a glance |
| Fact grade | Decides (changes what the person does next) / delights (true, specific, builds trust or joy; never copy about the interface) / nothing (cut). Home: `budgets.md` |
| Budget | A surface's min–max of facts and actions (`budgets.md`) |
| Decider | The optional fast decision model behind `scripts/grade.mjs`; `wwjd.mjs status` says on or off |
| Stretched target | A row's or card's title link whose `::after` covers the whole container; one target, one behaviour |
| Hover toolbar | A row's shortcuts, shown on hover, keyboard focus inside or an open menu; each also in ⋯ or the detail view |
| Christmas tree | Colour on everything, so nothing stands out |
| Status zoo | Too many statuses; boil down to the ones a person acts on |
| Machinery receipts | UI reporting the process ("read 14 files") instead of the result |
| Tame | A minimal bolt-on onto the old design where a redesign was needed |
| Long-familiar surface | A high-trust surface used daily for years; behaviour changes before looks |
| Near-miss | A value close to a token without matching it (ΔE2000 < 6, 1–2px off scale); snap it |
| Workaround feature | A feature routing around a failing area: a "classic view" toggle, a promoted "Recently visited" |
| Must-requirement | A pass/fail condition every explore variant must meet |
| Path count | Decisions from landing to result |
| Drawer | An overlay anchored to an edge, opened on demand |
| Rail | A narrow, persistent column of navigation icons |
| Panel / pane | A docked, often resizable layout region |
| Sheet | A modal surface sliding from the bottom or an edge (detents: its snap heights) |
| Tray | A temporary strip holding queued or pending items |
| Popover | A small floating surface anchored to its trigger |
| Review sheet | The step before money, legal commitments, account deletion or sending to others: real choices, never yes/no |
| Signature move | The one memorable element a design spends its boldness on |
| Tell / slop | A detail that gives away generated UI / the generic generated look (`bans.md`) |
| Drift lane | Where generated UI goes after its first default is banned |
| Avoidance aesthetic | Everything removed, nothing designed: a thin grey wireframe |
