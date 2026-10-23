# wwjd: What Would Johannes Do

Design skills for coding agents. When an agent builds, simplifies or reviews an interface, wwjd tells it how Johannes would do it: what to cut, where actions go, how layouts align and resize, which facts to show, and how to check the result without slowing the loop.

Works in Claude Code, Codex and any agent that reads skill files.

## Five skills, one plugin
- **wwjd:ux:** structure, behaviour, copy and workflow. Opinionated. The entry skill.
- **wwjd:look:** palette, type face, shape and depth from real references; writes `DESIGN.md` and tokens under wwjd's variable names. Neutral, so impeccable, taste or Stitch can replace it.
- **wwjd:motion:** motion themes and micro-interactions; `motion.css` on the same token names.
- **wwjd:motion-design:** art-directed pieces people watch (a hero that tells the story, an explainer, a launch film, a scroll story): story, shots, timing and what is on screen at once, written as a beat sheet (`motion.beats.json`) and checked before any animation code; `render.mjs frames` samples the result into a contact sheet.
- **wwjd:flow:** how the app works as a whole: screens, the ways between them and journeys in `wwjd.flow.json`, checked for dead ends, traps and missing states before screens are built. Keeps the project canvas.

## What's inside
```
plugins/wwjd/
  skills/ux/
    SKILL.md        entry, precedence, floor, rules, registers, the loop (always loaded, kept short)
    commands/       start · build · simplify · review · explore · audit
    rules/          layout · actions · states · copy · visual (the how, read by topic)
    registers/      persuade · showcase · editorial · reference · operate · monitor ·
                    converse · transact · flow · native (platform overlay)
    references/     budgets · product-types · layouts · heroes · ai · bans · examples · baseline · glossary
    kit/            tokens.css (look) · base.css (profiles, components, fit) · layouts.css
    scripts/        wwjd.mjs (status, lint, baseline, debt map, dials) · render.mjs (screenshots, fit, runtime, frames) ·
                    grade.mjs (the grade gate: a sheet per over-budget surface) · gate.mjs (the hooks' gate)
  skills/look/            the look: references, axes, look.mjs (tokens.css + DESIGN.md)
  skills/motion/          motion: themes, moments, motion.css
  skills/motion-design/   art-directed motion: story, shots, timing, staging, beats.mjs (check, table, init)
  skills/flow/            the flow: rules, patterns per product type, flow.mjs (check, init), canvas.mjs (the project canvas)
  agents/wwjd-critic.md   cold review, on request or at Strictness 5
  hooks/                  session.sh (hands the settings to Bash) · route.mjs (points UI prompts at wwjd:ux, plus look, motion or motion-design) ·
                          check.sh (one process per UI edit: notes it for the gate, lints it) · gate.mjs via hooks.json (a new
                          project asks how to begin; from Strictness 4 a grade sheet before a new UI file; checks before the turn
                          ends) · main.tsx (the /wwjd sidebar: decisions, corrections, Settings; a status line and a band naming
                          the checks still due)
  evals/                  trigger, quality, dial and held-out evals for `claude plugin eval` (`--tag dials`: one card per dial end)
docs/research/            archived research (faux-pas catalogue, layouts, look); not shipped in the skill
```

## How it runs
1. **Entry, once per session:** `wwjd.mjs status` prints the stage (`scratch`, `kit`, `messy`), the baseline files, the kit, Storybook, golden and legacy files, the dials, whether over-budget surfaces get a grade sheet, and whether Flow and Canvas are on. The agent reads what it lists.
2. **Route:** six verbs. `start` asks a new project how to begin (variants in an Artifact, or build) and sets up a baseline, `build` builds or rebuilds, `simplify` removes and reorders, `review` returns a verdict and ranked findings, `explore` shows ~5 structure variants (a redesign of an existing screen: 3 directions from the job, today's layout set aside), `audit` maps the debt.
3. **Loop:** show the work at once, react, adjust. A hook lints each edited UI file silently; the checks before each handover follow the Strictness dial (Standard: desktop and phone shots plus a fit check); the critic only when asked or at Strictness 5.

## Install
**Claude Code:**
```bash
claude plugin marketplace add jourheighness/wwjd
claude plugin install wwjd@wwjd
```
**Codex and other agents:** copy or symlink `ux`, `look`, `motion`, `motion-design` and `flow` from `plugins/wwjd/skills/` into the agent's skills folder (`~/.agents/skills/` or `.agents/skills/` in a repo), side by side: ux links to `../flow/`. There are no hooks or sidebar there, so the skill runs the lint and checks itself before handover. Backstop in `AGENTS.md`:
```markdown
## UI work
Before designing, building or reviewing any interface, read the `ux` skill (wwjd) and follow it.
```

## Dials
Six dials tune how wwjd designs, never the floor: **Look** (plain ↔ expressive), **Content** (lean ↔ rich), **Spacing** (roomy ↔ compact), **Motion** (still ↔ lively), **Copy** (terse ↔ warm) and **Strictness** (fast ↔ strict: how hard the agent is on its own work). Every stop is listed in `plugins/wwjd/skills/ux/references/dials.md`.
- **`/wwjd` → Settings:** one row of stops per dial with what the picked stop does, for you or for this project (writes `.wwjd.json`).
- **Also:** `/plugin configure wwjd@wwjd`, the wwjd rows in `/config`, or `"dials": { "creativity": 4 }` in `.wwjd.json`.
- **Per request:** words like "bolder", "leaner", "airier", "calmer" or "be thorough" move one dial one stop; the prompt hook names the nudge. "Just exploring" or "verify later" holds the handover checks until you say keep.

## Per project
- **`.wwjd.json`** (committed, repo-relative paths only):
  ```json
  { "start": "variants", "canvas": "https://claude.ai/artifact/…", "hooks": "on", "flowMode": "on", "canvasMode": "on", "register": "operate", "locale": ["sv", "en"],
    "kitDirs": ["packages/ui"], "dials": { "creativity": 4 },
    "golden": ["src/pages/Orders.tsx"], "legacy": ["src/old/**"],
    "storybook": "pnpm storybook", "rules": { "gradient": "off" } }
  ```
  Never preview URLs or hosts: use the `WWJD_PREVIEW` env var or an untracked `AGENTS.local.md`.
  A new project (a repo or package with no `"start"` in `.wwjd.json` and no UI yet) asks first how to begin: variants in an Artifact, or build. The pre hook holds its first UI file until `.wwjd.json` has `"start"`.
- **Flow:** `wwjd:flow` writes how the app works (screens, the ways between them, journeys) to `wwjd.flow.json` at the project root and checks it for dead ends and traps before building; the gate asks for a clean check after UI edits. On or off under `/wwjd` → Settings → Flow (the `flowmode` option, or `"flowMode"` in `.wwjd.json`).
- **Project canvas:** one Figma-like Design Artifact per project (linked as `"canvas"` in `.wwjd.json`) with every screen per journey, the flow, and a short "Why it looks like this" card per journey; each handover updates it (`plugins/wwjd/skills/flow/references/canvas.md`). On or off under `/wwjd` → Settings → Canvas (the `canvasmode` option, or `"canvasMode"` in `.wwjd.json`).
- **`.wwjd-baseline.json`** (committed): `wwjd.mjs check --baseline` writes it. The hook and `check --new` then report only errors and new warnings, and re-running `--baseline` only lowers counts. Delete it to accept new debt on purpose.
- **`.wwjd/`** (gitignored): screenshots, fit and runtime reports, grade sheets, references, look.json, `decisions.jsonl` (the sidebar's log), the canvas build.
- **One-off exceptions:** a trailing `wwjd-ignore: <reason>` comment on the line.
- **Hooks on, quiet or off:** `/wwjd` → Settings → Hooks, for you (the `hookmode` plugin option) or for this project (`"hooks": "quiet"` in `.wwjd.json`, which wins). On routes, lints and gates; quiet routes and lints but never blocks; off runs no wwjd hooks (the skills still work when called).
- **Lint hook off:** `WWJD_HOOK_CHECK=0` in the environment (the Strictness gate still sees the edit).

## Decisions and corrections
`/wwjd` opens the sidebar. It reopens every session until you close it, and opens by itself on a project's first logged decision.
- **Johannes stepped in:** where a wwjd rule changed what the agent was about to do.
- **Claude decided:** every design assumption and choice made without being told, grouped by task (else surface). A row opens to why and what shows it (screenshot, page, Artifact, file).
- **Correct… / Edit…** with a note, remembered **Just this time**, for **This project** (`docs/decisions/design.md` when `docs/decisions/` exists, else a Decisions section in `DESIGN.md`) or **Every project** (your taste file); **Send to Claude** passes it straight to the agent. **Dismiss** keeps the decision as it is.
- **Directions, Handled, Project:** explored directions and the project canvas open from here; Settings holds the dials, Hooks, Flow and Canvas.
- **Where the log lives:** the agent logs with the `mcp__wwjd__log` tool into `.wwjd/decisions.jsonl` of the project being edited (the file the call names, else the last edited file's project, else the session's folder).

## Your taste and profile
- **`~/.config/wwjd/taste.md`** (or `$WWJD_TASTE`): your design rules for every project, written by sidebar corrections or by hand.
- **`~/.config/wwjd/profile.md`** (or `$WWJD_PROFILE`): workflow and locale only.

**Precedence:** the floor › the project's DESIGN.md and decision log › your taste file › dials › wwjd (the more specific file wins) › your profile.

## Scripts
```bash
node plugins/wwjd/skills/ux/scripts/wwjd.mjs status [paths]   # PRODUCT.md / DESIGN.md: the nearest up from paths (or cwd), nested ones listed
node plugins/wwjd/skills/ux/scripts/wwjd.mjs check [paths] [--register operate] [--new] [--baseline] [--json]
node plugins/wwjd/skills/ux/scripts/wwjd.mjs audit
node plugins/wwjd/skills/ux/scripts/wwjd.mjs dials                    # the effective dials and what each does
node plugins/wwjd/skills/ux/scripts/render.mjs shoot <url|file> [--one] [--theme light|dark] [--root <project>]
node plugins/wwjd/skills/ux/scripts/render.mjs fit <url> [--widths 320,480,720] [--selector css]
node plugins/wwjd/skills/ux/scripts/render.mjs runtime <url>
node plugins/wwjd/skills/ux/scripts/grade.mjs spec.json [--surface row]   # prints the grade sheet for one surface
node plugins/wwjd/skills/look/scripts/look.mjs --look look.json [--out .]  # tokens.css + DESIGN.md
node plugins/wwjd/skills/flow/scripts/flow.mjs check [--json] [--root <dir>]   # init writes a starter wwjd.flow.json
node plugins/wwjd/skills/flow/scripts/canvas.mjs uploads | assets <path>=<url>… | build [--current <file>] [--all]
```
`wwjd.mjs` needs Node 20.10+ and nothing else. `render.mjs` needs Playwright: in the project (`npm i -D playwright`), or once for every project with `node plugins/wwjd/skills/ux/scripts/render.mjs setup` (playwright-core into `~/.cache/wwjd`); it also finds a global or npx-cached install. The browser is `PW_EXE`, else Playwright's Chromium, else an installed Chrome. Without Playwright, `shoot` drives an installed Chrome directly, and `fit` and `runtime` say they can't run. Dark shots also set a theme the app keeps in localStorage; a page that still stays light gets no dark shot and the run says `dark not applied`.

## Evals
```bash
cd plugins/wwjd
claude plugin eval . --case 'pos-*' --case 'neg-*'          # triggers on UI work, and only there
claude plugin eval . --tag quality --scaffold --allow-tools Write Edit Bash   # changes the output
claude plugin eval . --tag dials --scaffold --allow-tools Write Edit Bash     # each dial moves the output the way its stops say
claude plugin eval . --tag heldout --scaffold --allow-tools Write Edit Bash   # variants of past mistakes no rule names
```
