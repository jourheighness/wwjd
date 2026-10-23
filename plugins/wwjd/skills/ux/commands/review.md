# review: verdict and ranked findings

Review like an experienced designer: in one glance, by cutting. No scores: a verdict and ranked fixes.

## Look in this order
1. **Clutter and text volume:** what can go?
2. **Duplication:** two controls for one job, the same information twice.
3. **Edges and spacing:** stepped margins, cramped parts, clipped outlines, misaligned starts.
4. **Movement:** jumps, re-sorts, unwanted animation.
5. **Glance test:** does the view answer its question in 5 seconds at its primary width with real data?
6. **Foreign parts:** anything off-brand, or that looks broken though it works.
7. **Signals:** too faint to notice, or a list with no priority.
8. **Workaround features** (glossary): each names a failing area.

## Procedure
1. **Context:** the entry reads (SKILL.md § 0), the register, the spec if any.
2. **Render:** `render.mjs shoot` at 1440 and 390 × light/dark; populated, empty, worst case (`rules/states.md` § Worst-case data). `wwjd.mjs check` on the files.
3. **What works, first,** in a few lines. Each deviation from the rules is intentional (applied consistently: note it), accidental (a finding) or unclear (ask).
4. **Budgets and grades:** every surface against `references/budgets.md`, its job named first. Over budget is a finding, with where the overflow goes; on an exposure surface, a hidden item the job needs is the finding.
5. **UX laws pass** (below).
6. **Findings, ranked** by severity (**blocks** the task · **major**, incl. any Floor failure · **minor**). Each: the element, where (`file:line` or screen), the rule it breaks, one concrete fix, as a count where possible ("Remind me later" ×4). Merge instances into their pattern; cross-screen patterns rank first.
7. **Fault in the kit?** Say so: the fix goes to the component and its story, not each call site.
8. **Verify** every finding in the render or the code; drop what you can't point at.

## Reply
- **Line 1:** the verdict (ship, or fix first), naming the worst issue.
- **Then** the ranked findings as bullets. A clean pass is a valid result; never invent defects.
- **Fix order** when asked to fix: honesty first (never polish a surface with an open dark-pattern finding), then flow, remove (`simplify`), hierarchy, layout, visual, states, copy.
- **Mocks:** one line listing each `TODO(api)` and what the backend must provide.

## UX laws pass
1. One focal element per view; nothing to remember that could be shown.
2. Squint test (`references/bans.md` § Quick tests).
3. ≤ ~7 ungrouped items per section; groups match the real logic.
4. Same function looks the same; different function looks different.
5. Options are distinct (five clear beat three vague); the frequent choice is the default.
6. Wayfinding: where am I, how did I get here, how do I get back; the active state shows by more than colour.
7. The core task finishes at the first layer; nothing used daily is buried in ⋯; nothing critical lives only in a tooltip.
8. No step asks for what the system knows; input is accepted generously.
9. The action sits next to its object and stays with the widget that informed it.
10. Flow: no orphans, duplicate routes, dead ends or circles (`wwjd:flow`'s check, when the project keeps `wwjd.flow.json`); interrupted flows resume exactly; it ends on the result; error recovery is designed.
11. No pressure counts, receipts or reassurance anywhere in the flow.
12. Path count (glossary), compared with the category's best.

## On request only
- **Cold review:** the `wwjd-critic` agent, in the background after handover (required at Strictness 5, `references/dials.md`).
- **Expert lenses** (UI, UX, interaction, reviewed separately, then merged) and **personas** (a role and a goal, no prior knowledge: first-time admin, keyboard-only user) clicking through and reporting where they hesitated. Never a gate the person didn't ask for.
