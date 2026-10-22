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
  agents/wwjd-critic.md   cold review, on request or at Strictness 5
  hooks/                  route.mjs (points UI prompts at wwjd:ux, plus look or motion) · check.sh (one process per UI edit: notes it
                          for the gate, lints it) · gate.mjs via hooks.json (a new project asks how to begin; from Strictness 4 a grade
                          sheet before a new UI file; checks before the turn ends) ·
                          main.tsx (the /wwjd sidebar: decisions, corrections, Settings; a status line and a band naming the checks still due)
  evals/                  trigger, quality and dial evals for `claude plugin eval` (`--tag dials`: one card per dial end)
docs/research/            archived research (faux-pas catalogue, layouts, look); not shipped in the skill
```

## How it runs
1. **Entry, once per session:** `wwjd.mjs status` prints the stage (`scratch`, `kit`, `messy`), the baseline files, the kit, Storybook, golden and legacy files, the dials and whether over-budget surfaces get a grade sheet. The agent reads what it lists.
2. **Route:** six verbs. `start` asks a new project how to begin (variants in an Artifact, or build) and sets up a baseline, `build` builds or rebuilds, `simplify` removes and reorders, `review` returns a verdict and ranked findings, `explore` shows ~5 structure variants (a redesign of an existing screen: 3 directions from the job, today's layout set aside), `audit` maps the debt.
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
- **`/wwjd` → Settings:** one row of stops per dial, for you or for this project (writes `.wwjd.json`). The line below says what the focused stop does.
- **Also:** `/plugin configure wwjd@wwjd`, the wwjd rows in `/config`, or `"dials": { "creativity": 4 }` in `.wwjd.json`.
- **Per request:** words like "bolder", "leaner", "airier", "calmer" or "thorough" move one dial one stop; the prompt hook names the nudge.

## Per project
- **`.wwjd.json`** (committed, repo-relative paths only):
  ```json
  { "start": "variants", "canvas": "https://claude.ai/artifact/…", "hooks": "on", "flowMode": "on", "canvasMode": "on", "register": "operate", "locale": ["sv", "en"],
    "kitDirs": ["packages/ui"], "dials": { "creativity": 4 },
    "golden": ["src/pages/Orders.tsx"], "legacy": ["src/old/**"],
    "storybook": "pnpm storybook", "rules": { "gradient": "off" } }
  ```
  Never preview URLs or hosts: use the `WWJD_PREVIEW` env var or an untracked `AGENTS.local.md`.
  A new project (a repo or package with no `.wwjd.json` and no UI yet) asks first how to begin: variants in an Artifact, or build. The pre hook holds its first UI file until the project has a `.wwjd.json`.
- **Flow:** `wwjd:flow` writes how the app works (screens, the ways between them, journeys) to `wwjd.flow.json` at the project root and checks it for dead ends and traps before building; the gate asks for a clean check after UI edits. On or off under `/wwjd` → Settings → Flow (the `flowmode` option, or `"flowMode"` in `.wwjd.json`).
- **Project canvas:** one Figma-like Design Artifact per project (linked as `"canvas"` in `.wwjd.json`) with every screen per journey, the flow, and the decisions as sticky notes; each handover updates it (`skills/flow/references/canvas.md`). On or off under `/wwjd` → Settings → Canvas (the `canvasmode` option, or `"canvasMode"` in `.wwjd.json`).
- **`.wwjd-baseline.json`** (committed): `wwjd.mjs check --baseline` writes it. The hook and `check --new` then report only errors and new warnings, and re-running `--baseline` only lowers counts. Delete it to accept new debt on purpose.
- **`.wwjd/`** (gitignored): screenshots, references, look.json.
- **One-off exceptions:** a trailing `wwjd-ignore: <reason>` comment on the line.
- **Hooks on, quiet or off:** `/wwjd` → Settings → Hooks, for you (the `hookmode` plugin option) or for this project (`"hooks": "quiet"` in `.wwjd.json`, which wins). On routes, lints and gates; quiet routes and lints but never blocks; off runs no wwjd hooks (the skills still work when called).
- **Lint hook off for a project:** `WWJD_HOOK_CHECK=0` (the Strictness gate still sees the edit).

## Decisions and corrections
`/wwjd` opens the sidebar (it then reopens every session until you close it, and opens by itself on the first logged decision): every design assumption and choice the agent made without being told, grouped by component, screen or layout (the agent logs them with the `mcp__wwjd__log` tool into `.wwjd/decisions.jsonl` of the project being edited: the file the call names, else the last edited file's project, else the session's folder). **Correct** one with a note for **This project** (its decision log: `docs/decisions/design.md`, else a Decisions section in `DESIGN.md`) or **You, every project** (your taste file); the note also goes straight to the agent. The dials sit behind **Settings**.

## Your taste and profile
- **`~/.config/wwjd/taste.md`** (or `$WWJD_TASTE`): your design rules for every project, written by sidebar corrections or by hand.
- **`~/.config/wwjd/profile.md`** (or `$WWJD_PROFILE`): workflow and locale only.

**Precedence:** the floor › the project's DESIGN.md and decision log › your taste file › dials › wwjd (the more specific file wins) › your profile.

## Scripts
```bash
node plugins/wwjd/skills/ux/scripts/wwjd.mjs status [paths]   # PRODUCT.md / DESIGN.md: the nearest up from paths (or cwd), nested ones listed
node plugins/wwjd/skills/ux/scripts/wwjd.mjs check [paths] [--register operate] [--new] [--baseline] [--json]
node plugins/wwjd/skills/ux/scripts/wwjd.mjs audit
node plugins/wwjd/skills/ux/scripts/render.mjs shoot <url|file> [--one]
node plugins/wwjd/skills/ux/scripts/render.mjs fit <url> [--selector css]
node plugins/wwjd/skills/ux/scripts/render.mjs runtime <url>
node plugins/wwjd/skills/ux/scripts/grade.mjs spec.json [--surface row]   # prints the grade sheet for one surface
```
`wwjd.mjs` needs Node 20.10+ and nothing else. `render.mjs` needs Playwright: in the project (`npm i -D playwright`), or once for every project with `node plugins/wwjd/skills/ux/scripts/render.mjs setup` (playwright-core into `~/.cache/wwjd`); it also finds a global or npx-cached install. The browser is `PW_EXE`, else Playwright's Chromium, else an installed Chrome. Without Playwright, `shoot` drives an installed Chrome directly, and `fit` and `runtime` say they can't run. Dark shots also set a theme the app keeps in localStorage; a page that still stays light gets no dark shot and the run says `dark not applied`.

## Evals
```bash
cd plugins/wwjd
claude plugin eval . --case 'pos-*' --case 'neg-*'          # triggers on UI work, and only there
claude plugin eval . --tag quality --scaffold --allow-tools Write Edit Bash   # changes the output
claude plugin eval . --tag dials --scaffold --allow-tools Write Edit Bash     # each dial moves the output the way its stops say
```
