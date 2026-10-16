# polish: the final pass

A sweep, not a spot fix.
1. List every screen and component in scope.
2. Find what has drifted from the system.
3. Fix each finding at its source.
4. Report the changes per pattern, not per file.

## 1. Classify each drift by root cause
| Cause | Fix |
|---|---|
| Missing token | Add the token to the system |
| One-off where a shared component exists | Use the shared component |
| Flow differs from comparable features (modal vs page, autosave vs submit) | Align the flow |

## 2. Fix functional problems before cosmetic ones
Work through these in order, using the command file for each:
0. **Honesty before polish:** never polish a surface with an open honesty or dark-pattern finding. Fix that first.
1. Flow and information architecture shape, which must match neighbouring features.
2. `distill`
3. `prioritize`
4. `layout`
5. `typeset`
6. `colour`
7. States, via `harden`
8. `animate`
9. Copy, via `clarify`
10. Icons
11. Forms
12. Responsive, via `adapt`
13. Code clean-up

## 3. Finish
- **Run the handover check in SKILL.md** (it includes `scripts/ui-check.mjs --register <register>`, in this skill's folder).
- **A clean first pass is a valid result.** Don't invent defects to show iteration.
- **A score that keeps dropping stops the loop** (`critique.md`).
