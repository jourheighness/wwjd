# start: a project's UI baseline

For `scratch`, or UI without baseline files. An existing design system wins: read it and fill only the gaps the person agrees to.

## 0. Ask first (a new project: no `"start"` in `.wwjd.json`, no UI yet; before any code)
A new product never starts as code by default. One AskUserQuestion batch, each with a default:
- **How to begin:** lettered variants in an Artifact first (default; `explore.md`), or straight to build; ask how many (default 3).
- **The look:** a board of options (`wwjd:look` §2, default for Look 4–5) or quick mode.
- **A project canvas** (only while the Canvas setting is on): one Artifact with every screen per journey, the flow and the decisions (`../flow/references/canvas.md`); default yes.
- **Anything the brief leaves open** that would change the variants: register, the one job of the first screen, the benchmark product.

Record the answer in `.wwjd.json` (`"start": "variants"` or `"build"`, `"register"`, later `"canvas"`); the pre hook holds a new project's first UI file until `"start"` exists. Nobody to ask (unattended run, subagent): take each default and log it as an assumption. Steps 1–5 are skippable; showing work never waits on them.

## 1. PRODUCT.md (short; infer, then ask the rest in one batch, each with a default)
- **Product type** (`references/product-types.md`): core objects, top 3 jobs.
- **Users:** who, doing what, on which device, under what time pressure, how often.
- **Registers** per surface: Persuade site, Operate app, Flow signup.
- **Bar:** 2–3 named products in the category to match. **Anti-references:** what it must not resemble.
- **Locale(s) and voice:** one line each.

## 2. Look: hand to `wwjd:look`
- It picks palette, face, shape, depth and density and writes `DESIGN.md` (the google-labs-code spec's 8 sections; Do's and Don'ts as named one-line rules) plus tokens under the `kit/tokens.css` names.
- No `wwjd:look`, or the person skips it: `kit/tokens.css` as is (the baseline preset) and a short DESIGN.md that says so.

## 3. Kit skeleton
- **CSS:** copy `kit/tokens.css`, `kit/base.css`, `kit/layouts.css` in that order, plus `kit/table-scroll.js` once a table can outgrow its pane; set `<html data-profile>` from the register file's Profile line.
- **Components:** no kit yet: Base UI primitives (or the stack's equivalent, `references/baseline.md`) wrapped as the project's own components, styled with base.css classes; what the first screen needs goes in the kit, never inline.
- **Workshop:** Storybook or Ladle, with a tokens story and a contrast matrix story (glossary).
- **`.wwjd.json`** (committed, repo-relative only): `start`, `canvas`, `flowMode`, `canvasMode`, `hooks`, `dials`, `register`, `locale`, `kitDirs`, `golden`, `legacy`, `storybook`, `tags`, `rules`. Never preview URLs or hosts: those come from `WWJD_PREVIEW` or an untracked local file (`AGENTS.local.md`).
- **`.gitignore`:** `.wwjd/` (shots, refs, look.json).
- **Existing UI:** `wwjd.mjs check --baseline` (`audit.md` § 2 Ratchet).

## 4. Decision log and RATCHET.md
- **Decision log** (glossary): every later rule goes there, dated, the person's words quoted.
- **RATCHET.md** may be shared with other tools. wwjd writes only: Backlog items tagged `[design]` or `[eng]` (the suspicion, not the target), Gotchas, Tells; never Config or Scheduler. Create it with the first finding to park.

## 5. Hand over
Links to the project canvas, PRODUCT.md, DESIGN.md and the tokens story; every choice made for the person, one line why, vetoable before anything builds on it.
