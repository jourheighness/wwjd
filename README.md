# wwjd: What Would Johannes Do

Design skills for coding agents. When an agent builds, simplifies or reviews an interface, wwjd tells it how Johannes would do it: what to cut, where actions go, how layouts align and resize, which facts to show, and how to check the result without slowing the loop.

Works in Claude Code, Codex and any agent that reads skill files.

## Three skills, one plugin
- **wwjd:ux:** structure, behaviour, copy and workflow. Opinionated. The entry skill.
- **wwjd:look:** palette, type face, shape and depth from real references; writes `DESIGN.md` and tokens under wwjd's variable names. Neutral, so impeccable, taste or Stitch can replace it.
- **wwjd:motion:** motion themes and micro-interactions; `motion.css` on the same token names.

## What's inside
```
plugins/wwjd/
  skills/ux/
    SKILL.md        entry, precedence, floor, rules, registers, the loop (always loaded, <7.5KB)
    commands/       start · build · simplify · review · explore · audit
    rules/          layout · actions · states · copy · visual (the how, read by topic)
    registers/      persuade · showcase · editorial · reference · operate · monitor ·
                    converse · transact · flow · native (platform overlay)
    references/     budgets · product-types · layouts · heroes · ai · bans · examples · baseline · glossary
    kit/            tokens.css (look) · base.css (profiles, components, fit) · layouts.css
    scripts/        wwjd.mjs (status, lint, baseline, debt map) · render.mjs (screenshots, fit, runtime) ·
                    grade.mjs (the grade gate: a sheet per over-budget surface)
  skills/look/            the look
  skills/motion/          motion
  agents/wwjd-critic.md   cold review, on request only
  hooks/                  route.sh (points UI prompts at wwjd:ux, plus look or motion) · check.sh (lints each edited UI file) ·
                          gate.mjs via hooks.json (Strictness: grade sheet before a new UI file, checks before the turn ends) ·
                          main.tsx (the /wwjd-dials pane; a status-line entry and a band naming the checks still due)
  evals/                  trigger, quality and dial evals for `claude plugin eval` (`--tag dials`: one card per dial end)
docs/research/            archived research (faux-pas catalogue, layouts, look); not shipped in the skill
```

## How it runs
1. **Entry, once per session:** `wwjd.mjs status` prints the stage (`scratch`, `kit`, `messy`), the baseline files, the kit, Storybook, golden and legacy files, the dials and whether over-budget surfaces get a grade sheet. The agent reads what it lists.
2. **Route:** six verbs. `start` sets up a baseline, `build` builds or rebuilds, `simplify` removes and reorders, `review` returns a verdict and ranked findings, `explore` shows ~5 structure variants, `audit` maps the debt.
3. **Loop:** show the work at once, react, adjust. A hook lints each edited UI file silently; one screenshot per handover; the full matrix only at milestones; the critic only when asked.

## Install
**Claude Code:**
```bash
claude plugin marketplace add <this repo's git URL or local path>
claude plugin install wwjd@wwjd
```
**Codex and other agents:** copy or symlink `ux`, `look` and `motion` from `plugins/wwjd/skills/` into the agent's skills folder (`~/.agents/skills/` or `.agents/skills/` in a repo). There are no hooks there, so the skill runs the lint itself before handover. Backstop in `AGENTS.md`:
```markdown
## UI work
Before designing, building or reviewing any interface, read the `ux` skill (wwjd) and follow it.
```

## Dials
Six dials tune how wwjd designs, never the floor: **Look** (plain ↔ expressive), **Content** (lean ↔ rich), **Spacing** (roomy ↔ compact), **Motion** (still ↔ lively), **Copy** (terse ↔ warm) and **Strictness** (fast ↔ strict: how hard the agent is on its own work). Every stop is listed in `plugins/wwjd/skills/ux/references/dials.md`.
- **`/wwjd-dials`:** a pane with one row of stops per dial, for you or for this project (writes `.wwjd.json`). The line below says what the focused stop does.
- **Also:** `/plugin configure wwjd@wwjd`, the wwjd rows in `/config`, or `"dials": { "creativity": 4 }` in `.wwjd.json`.
- **Per request:** words like "bolder", "leaner", "airier", "calmer" or "thorough" move one dial one stop; the prompt hook names the nudge.

## Per project
- **`.wwjd.json`** (committed, repo-relative paths only):
  ```json
  { "register": "operate", "locale": ["sv", "en"], "kitDirs": ["packages/ui"], "dials": { "creativity": 4 },
    "golden": ["src/pages/Orders.tsx"], "legacy": ["src/old/**"],
    "storybook": "pnpm storybook", "rules": { "gradient": "off" } }
  ```
  Never preview URLs or hosts: use the `WWJD_PREVIEW` env var or an untracked `AGENTS.local.md`.
- **`.wwjd-baseline.json`** (committed): `wwjd.mjs check --baseline` writes it. The hook and `check --new` then report only errors and new warnings, and re-running `--baseline` only lowers counts. Delete it to accept new debt on purpose.
- **`.wwjd/`** (gitignored): screenshots, references, look.json.
- **One-off exceptions:** a trailing `wwjd-ignore: <reason>` comment on the line.
- **Hook off for a project:** `WWJD_HOOK_CHECK=0`.

## Your profile
`~/.config/wwjd/profile.md` (or `$WWJD_PROFILE`): workflow and locale only, never design rules. Project rules go in the decision log or `DESIGN.md`; a rule for every project is proposed as a change to this skill.

**Precedence:** the floor › the project's DESIGN.md and decision log › wwjd (the more specific file wins) › your profile.

## Scripts
```bash
node plugins/wwjd/skills/ux/scripts/wwjd.mjs status
node plugins/wwjd/skills/ux/scripts/wwjd.mjs check [paths] [--register operate] [--new] [--baseline] [--json]
node plugins/wwjd/skills/ux/scripts/wwjd.mjs audit
node plugins/wwjd/skills/ux/scripts/render.mjs shoot <url|file> [--one]
node plugins/wwjd/skills/ux/scripts/render.mjs fit <url> [--selector css]
node plugins/wwjd/skills/ux/scripts/render.mjs runtime <url>
node plugins/wwjd/skills/ux/scripts/grade.mjs spec.json [--surface row]   # prints the grade sheet for one surface
```
`wwjd.mjs` needs Node 20.10+ and nothing else. `render.mjs` needs Playwright in the project (`npm i -D playwright`), or `PW_EXE` pointing at an existing Chromium; without either, `shoot` uses an installed Chrome (viewport shots), and `fit` and `runtime` say they can't run.

## Evals
```bash
cd plugins/wwjd
claude plugin eval . --case 'pos-*' --case 'neg-*'          # triggers on UI work, and only there
claude plugin eval . --tag quality --scaffold                # changes the output
claude plugin eval . --tag dials --scaffold                  # each dial moves the output the way its stops say
```
