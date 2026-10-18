# review: verdict and ranked findings

Review like an experienced designer: in one glance, by cutting. No scores. The owner reads a verdict and ranked fixes.

## Look in this order
1. **Clutter and text volume:** what can go?
2. **Duplication:** two controls for one job, the same information twice.
3. **Edges and spacing:** stepped margins, cramped parts, clipped outlines, misaligned starts.
4. **Movement:** jumps, re-sorts, unwanted animation.
5. **Glance test:** does the view answer its question in ~3 seconds at its primary width with real data?
6. **Foreign parts:** anything that doesn't feel like the product, or looks broken though it works.
7. **Signals:** too faint to notice, or a list with no priority.
8. **Workaround features:** a "classic view" toggle, "Recently visited" promoted to main nav, a mobile skin for a desktop problem, a half-finished migration. Each names a failing area.

## Procedure
1. **Context:** the entry reads (SKILL.md), the register, the spec if any.
2. **Render:** `render.mjs shoot` at both widths × light/dark; populated, empty, worst case (`rules/states.md`). `wwjd.mjs check` on the files.
3. **What works, first,** in a few lines (calibration, not padding). Each deviation from the rules is intentional (applied consistently: note it), accidental (a finding) or unclear (ask).
4. **Budgets and grades:** every surface against `references/budgets.md`; each fact decides, delights or nothing (grade gate: a `grade.mjs` sheet per over-budget surface). Over budget is a finding, with where the overflow goes.
5. **UX laws pass** (below).
6. **Findings, ranked** by severity (**blocks** the task · **major**, incl. any floor failure · **minor**). Each one: the element, where (`file:line` or screen), the rule it breaks, one concrete fix, stated as a count where possible ("Remind me later" ×4; 8 widgets at equal weight). Merge instances into their pattern; cross-screen patterns rank first.
7. **Fault in the kit?** Say so: the fix goes to the component and its story, not each call site.
8. **Verify** every finding in the render or the code; drop what you can't point at.

## Reply
- **Line 1:** the verdict (ship, or fix first), naming the worst issue.
- **Then** the ranked findings as bullets. A clean pass is a valid result; never invent defects.
- **Fix order** when asked to fix: honesty first (never polish a surface with an open dark-pattern finding), then flow, remove (`simplify`), hierarchy, layout, visual, states, copy.
- **Mocks:** one line listing each `TODO(api)` and what the backend must provide.

## UX laws pass
1. Obvious where to look first; nothing to remember that could be shown; a stranger gets it in 5 seconds.
2. Squint: only the primary and the needs-you signals survive the blur.
3. ≤ ~7 ungrouped items per section; groups match the real logic.
4. Same function looks the same; different function looks different.
5. Options are distinct (five clear beat three vague); the frequent choice is the default.
6. Primary first or last, never mid-set; one focal element per view.
7. Wayfinding: where am I, how did I get here, how do I get back; the active state shows by more than colour.
8. The core task finishes at the first layer; options appear once they can apply.
9. Nothing used daily is buried in ⋯; nothing critical lives only in a tooltip.
10. No step asks for what the system knows; input is accepted generously.
11. Response times: `rules/states.md`. Never fake progress.
12. The action sits next to its object, and stays with the widget that informed it.
13. The flow map has no orphans, duplicate routes, dead ends or circles.
14. An interrupted flow resumes exactly.
15. The flow ends on the result; error recovery is designed too.
16. No pressure counts, receipts or reassurance anywhere in the flow.
17. Path count: every decision from landing to result, compared with the category's best.

## On request only
- **Cold review:** the `wwjd-critic` agent, in the background after handover.
- **Expert lenses** (UI, UX, interaction, reviewed separately, then merged) and **personas** (a role and a goal, no prior knowledge: first-time admin, busy specialist, keyboard-only user) clicking through and reporting where they hesitated. Heavy in rebuilds, light in polish; never a gate the user didn't ask for.
