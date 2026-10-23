---
name: flow
description: 'How an app works as a whole (wwjd): screens, the ways between them and journeys, written in wwjd.flow.json and checked for dead ends, traps and missing states. Use before a new app, a new or changed screen, or navigation work.'
when_to_use: '"user flow", "journey", "navigation", "sitemap", "what happens after…", "add a screen", a new app.'
compatibility: scripts need Node 20.10+, no dependencies.
---

# Flow
Screens built one at a time leave gaps between them: write the structure first, let the checker find flow bugs, then build.

## When
On with the Flow setting (default on): `/wwjd` → Settings, for you (the `flowmode` option) or this project. `"flowMode": "off"` in `.wwjd.json` wins. Off: skip this skill.

## Before building or changing screens
1. Name the product type, grep `### <type>` in `references/patterns.md` and read that block only (plus `### Across all types`).
2. Read `rules/flows.md` before writing or changing `wwjd.flow.json`.
3. Write or update `wwjd.flow.json` at the project root (committed; `node <skill>/scripts/flow.mjs init` starts one): every screen with its job, every way between screens, the journeys with their goals.
4. Run `node <skill>/scripts/flow.mjs check`. Fix every error in the design, not the file, or say why it stands. Warnings: fix or name them in the handover.

## After a build
- Set each built screen's `shot` (project-relative path) and re-run `check`.
- Log decisions with the screen id: `screen` on `mcp__wwjd__log` (or the `screen` field in `.wwjd/decisions.jsonl`).

## Lookups
- Full schema and every rule with its source: `references/model.md`.
- The research behind the rules and patterns: `references/sources.md`.
- Keeping the project canvas current: `references/canvas.md`, when the Canvas setting is on.
