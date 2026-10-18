# Dials

Seven dials tune how wwjd works, never what is correct. Set them per person with `/plugin configure wwjd@wwjd` (or `/config`); override per project with `"dials"` in `.wwjd.json`; nudge one request with words (the prompt hook names the nudge). `wwjd.mjs dials` prints the effective set; only non-default dials are shown.

**Precedence:** Floor > DESIGN.md and the decision log > dials > wwjd defaults. A dial never breaks contrast, targets, states or the budgets' overflow rules; a DESIGN.md that owns the look outranks `creativity`.

| Dial | 1 | 3 (default) | 5 | Nudge words |
|---|---|---|---|---|
| **creativity** | Close to the kit: brand hue only, no display face, the plainest fitting hero | One loud axis; a display face for Persuade, Showcase, Editorial, consumer (`wwjd-look` quick mode) | Art-directed: one distinct visual idea per page, an unusual layout (`layouts.md`), a hero from the far end of `heroes.md`, motion one step livelier | bolder, surprise me / safer, tamer |
| **budget** | Every surface budget −2 (min 1); throw away before moving | `budgets.md` as written | Every budget +2; overflow rules still apply | show more, richer / leaner, less busy |
| **density** | Roomy (`data-density="comfortable"`, consumer heights) | By register | Compact (`data-density="compact"`) | denser, tighter / airier, roomier |
| **motion** | – | `auto`: the register's motion theme | – | (set a theme: `instant`, `crisp`, `smooth`, `springy`) |
| **voice** | Terse: labels and values, sentences only in errors | Plain (`rules/copy.md`) | Warm: a light personality in empty, success and onboarding; never in errors, money or safety | warmer / terser |
| **rigor** | One shot, lint only | Lint + one screenshot per handover | Critic agent, `render.mjs fit` and `runtime`, 2–3 variants before building | thorough, polish / quick, rough |
| **decider** (default `off`) | `off`: grade yourself | `assist`: `grade.mjs` grades over-budget surfaces; you decide the unsure ones | `strict`: its cuts stand; bring an item back only by swapping | – |

- **2 and 4** sit between their neighbours (`wwjd.mjs dials` says what each means).
- **A nudge moves one dial one stop for that request only**, and the handover names it ("creativity 4 for this page").
- **The decider is experimental and off by default** (blind tests: a coin flip against grading yourself). Grading itself is not optional, only who answers.
- **The decider needs a key:** `decider_key` in the plugin options (secure store; exported to scripts as `WWJD_DECIDER_KEY`) or `OPENROUTER_API_KEY`. Without one, `decider` behaves as `off`.
