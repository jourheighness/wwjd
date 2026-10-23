# The project canvas

One claude.ai Artifact per project, made from the Design canvas type: the flow diagram on top, one row of real screenshots per journey, and at each row's end a "Why it looks like this" card (where a wwjd rule stepped in, what the agent decided and why, its guesses to check). wwjd keeps it current; the person moves things, draws and comments on it.

## The setting
**Canvas**, on (default) or off, under `/wwjd` → Settings: for you (the `canvasmode` plugin option) or for this project (`"canvasMode": "off"` in `.wwjd.json`, which wins). Off: never make or update a canvas. The canvas link lives in `.wwjd.json` as `"canvas"`.

## Make it (once per project)
- Find the Design type's `type_url` (Artifact list, `scope: "types"`), then publish with it, a `title` (the project name) and `auto_open: "after_first_write"`. No files.
- Put the returned `url` in `.wwjd.json` as `"canvas"`. Then do a round.

## Keep it current (every round)
`<skill>` is the wwjd:flow folder; every `canvas.mjs` command takes `--root <project>` when the project is not the current folder.
1. Read the live canvas: Artifact read with `url` and `path: "project/canvas.json"`; note where it was saved. (A brand-new canvas has none: skip `--current`.)
2. `node <skill>/scripts/canvas.mjs uploads` prints `{upload: [paths]}`: shots not uploaded yet, or retaken.
3. Upload them in one Artifact call: `url`, `asset: true`, `file_paths`. Keep each result's `url`.
4. `node <skill>/scripts/canvas.mjs assets <path>=<url> …`, one pair per upload.
5. `node <skill>/scripts/canvas.mjs build --current <saved canvas.json>` prints `{root, file_path, files, removed, missing}`.
6. One Artifact publish: `url`, `root`, `file_path`, `files` as printed, plus each `removed` path as `null`. Done.

- `missing` lists screens with no screenshot yet: take them for the next round.
- A publish failed? Fix the cause, then `build --all` resends every artboard.
- Refused because a file changed on the canvas? Read it (Artifact read with its `path`): an edit to a screen's artboard is the person's, so keep it (leave it out of `files`) and say so; an editor-only change (an added style) can be replaced. Never pass `overwrite_unread` for files you have not read.
- Never hand-edit the generated files (`.wwjd/canvas/`). Change the flow, the shots or the decisions and build again.
- The person's boards, notes and moves survive every build; only wwjd's boards and row titles (ids starting `w-`) are rewritten.

## Comments
- A comment sent with Send to Claude wakes the session: read it with `ArtifactComments`, fix what it asks, rebuild and publish, reply with what changed, resolve the thread.
- Never start a thread; the Why cards (from the decisions log) carry the reasons.
- People comment on part of a screen with C (comment mode), a click, then Send to Claude; Escape leaves comment mode.

## Rules
- Never verify the canvas by rendering it. The files follow the Design canvas rules; the tests check them.
- Never invent a screenshot: a screen without one stays in `missing` and on the diagram only.
