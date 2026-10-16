# wwjd: What Would Johannes Do

Johannes Carlsten's design rules for coding agents. It is one skill that tells an agent how Johannes would design, build and review an interface. It covers landing pages, editorial and docs, product apps, dashboards, chat and AI, commerce, forms and onboarding, and mobile.

Most of the rules began as a correction he had to give an agent more than once. The aim is that a design decision made once stays made.

## What's inside

```
plugins/wwjd/
  skills/wwjd/
    SKILL.md          the floor, the rules, the register and command routers, the handover check
    registers/        persuade · showcase · editorial · reference · operate · monitor ·
                      converse · transact · flow · native (platform overlay)
    commands/         explore · build · critique · audit · polish · distill · prioritize ·
                      clarify · layout · typeset · colour · animate · harden · adapt
    references/       bans (never this, do that instead) · faux-pas catalogue ·
                      before/after examples · glossary
    scripts/          ui-check.mjs (static lint) · shoot.sh (screenshots)
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

## Sources

The rules come from Johannes's own design reviews. Where they overlap with published work, they were checked against:
- impeccable, taste-skill, Anthropic's frontend-design, Hallmark
- Vercel's web interface guidelines, Emil Kowalski's motion work, gstack
- interface-design, the Laws of UX
- NN/g, Baymard, GOV.UK, WebAIM, deceptive.design
- Butterick's Practical Typography
- the Apple and Material guidelines

Where Johannes's taste conflicted with accessibility, the rule was rewritten so both hold.
