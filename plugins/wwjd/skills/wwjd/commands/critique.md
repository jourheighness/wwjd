# critique: design and UX review

Review the way an experienced designer does: in one glance, by cutting. Find what they would cut before they have to.

## Look in this order
1. **Clutter and text volume:** what can go?
2. **Duplication:** two controls for one job, the same information twice.
3. **Edges and spacing:** stepped margins, cramped elements, clipped outlines, misaligned starts.
4. **Movement:** jumps, re-sorts, unwanted animation.
5. **The glance test:** does the view answer its question in about 3 seconds, at its primary width, with real data?
6. **Foreign parts:** anything that doesn't feel like the rest of the product, or looks broken even though it works.
7. **Signals:** too faint to notice, or a list with no priority.

## Procedure
1. **Context:** the project files and decision log (SKILL.md step 1), the register, and the spec if there is one.
2. **Render:**
   - widths: desktop and narrow
   - themes: light and dark
   - data: populated, empty and worst case (see `harden.md`)
3. **Score** each dimension 0–10, weighted for the register. For anything under 8, say what a 10 would look like here.
   - **Removal:** nothing explains, repeats or counts without a reason.
   - **Hierarchy:** one primary per region, attention first, disclosure in layers.
   - **System:** the kit is used; the same job has the same shape; nothing hand-rolled.
   - **Layout:** grid edges, alignment, wrapping, the spacing scale.
   - **Stability:** zero shift, state changes only on intent, predictable scroll and focus.
   - **Visual:** colour as attention, surfaces, both themes, contrast.
   - **Flow:** A → B is clear, no dead ends, every state designed.
   - **Craft:** at the register's bar; not tame, not slop (`references/bans.md`).
   - Weight by register: Operate weights stability and system. Monitor weights the 5-second answer and signal. Reference weights findability. Editorial weights reading. Converse weights state coverage. Transact weights decision clarity and trust. Flow weights completion and errors. Persuade weights idea and composition. Showcase weights the work leading.
4. **Run the UX laws pass** below.
5. **Findings, ranked.** Each one:
   - names the element
   - says where it was seen (screen, or `file:line`)
   - cites the rule it breaks
   - gives one concrete fix
   - Merge instances into the pattern they share. Cross-screen findings rank first. No praise padding.
6. **Verify** each finding in the render or the code before reporting it.

## UX laws pass
1. Attention, memory, clarity: obvious where to look first; nothing must be remembered that could be shown; a stranger gets it in 5 seconds.
2. Squint: blur the screenshot, and only the primary element and the needs-you signals survive.
3. Grouping: at most about 7 ungrouped items per section, and the groups match the real logic.
4. Same function looks the same; different function looks different.
5. Options are distinct (five clear beat three vague), and the frequent choice is the default.
6. The primary sits first or last, never mid-set. One focal element per view.
7. Wayfinding: where am I, how did I get here, how do I get back? The active state shows by more than colour.
8. Layers: the core task can be finished at the first layer, and options appear only once they can apply.
9. Nothing used daily is buried in ⋯, and nothing critical lives only in a tooltip.
10. No step asks for what the system knows. Input is accepted generously.
11. Response: acknowledged in 100ms. Past ~1s progress in place; past ~10s determinate progress when the duration is known, otherwise a live status line. Never fake progress.
12. The action sits next to its object.
13. The flow map has no orphans, duplicate routes, dead ends or circular paths.
14. An interrupted flow resumes exactly.
15. The flow ends on the result, and error recovery is designed too.
16. No pressure counts, receipts or reassurance anywhere in the flow.

## Expert and persona reviews (for larger work, or on request)
- **Expert lenses:** UI (visual and system), UX (flow and disclosure), and interaction (stability and affordance). Each reviews separately, then the findings merge.
- **Personas** get only a role and a goal, no prior knowledge. Examples: a first-time admin, a busy specialist, a non-technical buyer, a keyboard-only user. They click through and report where they hesitated, misread or got stuck.
- **Gates follow the phase:** heavy in rebuilds, light in polish. Don't add gates the user didn't ask for.
- **Background, never blocking:** expert and persona reviews run after the work is shown; their findings arrive as a follow-up.
