# wwjd: What Would Johannes Do

A design skill for coding agents. When an agent designs, builds or reviews an interface, wwjd tells it how Johannes would do it: what to cut, where actions go, how layouts align and resize, which numbers to show, and how to check the result before handing it over.

It covers landing pages, editorial and docs, product apps, dashboards, chat and AI interfaces, commerce, forms and onboarding, and mobile. It works in Claude Code, Codex and any agent that reads skill files.

## What it does

- **Picks the rules for the job.** A landing page, a dashboard and a checkout follow different rules; the agent chooses by the surface it is working on.
- **Runs one focused command at a time:** explore, build, critique, audit, polish, distill, prioritize, clarify, layout, fit, typeset, colour, animate, harden, adapt.
- **Holds a floor nothing overrides:** accessibility, layout stability, no dark patterns, real data.
- **Checks its own work:** a static lint (`ui-check.mjs`), screenshots at desktop and phone (`shoot.sh`), and a resize check (`fit-check.mjs`).
- **Respects the project:** the repo's design system and recorded decisions come first, and corrections you give become rules in the project.

## What's inside

```
plugins/wwjd/
  skills/wwjd/
    SKILL.md          the floor, the rules, the register and command routers, the handover check
    registers/        persuade · showcase · editorial · reference · operate · monitor ·
                      converse · transact · flow · native (platform overlay)
    commands/         explore · build · critique · audit · polish · distill · prioritize ·
                      clarify · layout · fit · typeset · colour · animate · harden · adapt
    references/       bans (never this, do that instead) · faux-pas catalogue ·
                      before/after examples · glossary
    scripts/          ui-check.mjs (static lint) · shoot.sh (screenshots) · fit-check.mjs (resize check)
  agents/wwjd-critic.md   cold, read-only design review (Claude Code)
  hooks/                  prompt hook that routes UI work to the skill (Claude Code)
  evals/                  trigger and quality evals for `claude plugin eval`
```

- **Registers:** the agent picks the rules for the kind of job a surface does. A dev tool's landing page follows Persuade, while its app follows Operate.
- **Commands:** each loads one focused file, so the agent reads only what the task needs.

## Install

**Claude Code** (skill, critic agent and routing hook):
```bash
claude plugin marketplace add <this repo's git URL or local path>
claude plugin install wwjd@wwjd
```

**Codex, Cursor and other agents:** copy or symlink `plugins/wwjd/skills/wwjd` into the agent's skills folder: `~/.agents/skills/wwjd` for Codex, or `.agents/skills/wwjd` inside a repo. Agents can skip skills, so add this to your `AGENTS.md` as a backstop:

```markdown
## UI work
Before designing, building or reviewing any interface, read the wwjd skill
(`~/.agents/skills/wwjd/SKILL.md` or `.agents/skills/wwjd/SKILL.md`) and follow it.
```

## Make it yours: the profile

The skill reads `~/.config/wwjd/profile.md` (or `$WWJD_PROFILE`) when it exists. It covers workflow and locale only:
- your locale and copy conventions
- your preview and review workflow

Design rules don't go in the profile. Project rules go in the project's decision log or `DESIGN.md`; a rule that should hold across projects is proposed as a change to this skill.

**Precedence:**
1. The floor (accessibility, honesty, stability).
2. The project's own decisions and `DESIGN.md`.
3. The wwjd rules; the more specific file wins (register and command files refine `SKILL.md` for their scope).
4. Your profile, for workflow and locale only; it never overrides a design rule.

## ui-check

```bash
node plugins/wwjd/skills/wwjd/scripts/ui-check.mjs [paths] --register operate [--json]
```
- **Default scope:** with no paths, it scans files changed against HEAD.
- **Severity per project:** set it in `.wwjd.json`:
  ```json
  { "register": "persuade", "locale": ["sv", "en"], "rules": { "gradient": "off", "eyebrow": "error" } }
  ```
- **Locale:** English-only copy rules (the dash rule) run only when every listed locale is English (default `["en"]`).
- **One-off exceptions:** ignore a single line with `ui-check-ignore: <reason>`.

## Evals

```bash
cd plugins/wwjd
claude plugin eval . --case 'pos-*' --case 'neg-*'      # does the skill trigger, and only on UI work
claude plugin eval . --case 'cleanup-card' --scaffold   # does it change the output
```
