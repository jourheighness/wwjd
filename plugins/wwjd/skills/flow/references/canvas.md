# The project canvas

One claude.ai Artifact per project, made from the Design canvas type: the flow diagram at the top, one row of real screenshots per journey, and at the end of each row a short "Why it looks like this" card: Johannes stepped in, what Claude decided (UX or UI, one line why), its guesses to check. wwjd keeps it current; the person moves things, draws and comments on it.

## The setting
**Canvas**, on (default) or off: for you (the `canvasMode` plugin option) or for this project (`"canvasMode": "off"` in `.wwjd.json`, which wins). Off: never make or update a canvas. The canvas link lives in `.wwjd.json` as `"canvas"`.

## Make it (once per project)
- Artifact publish with `type_url: "https://claude.ai/artifact/QKN21svewxgyPb6SYRqWnd"` (the Design type), a `title` (the project name) and `auto_open: "after_first_write"`. No files.
- Put the returned `url` in `.wwjd.json` as `"canvas"`. Then do a round.

## Keep it current (every round)
1. Read the live canvas: Artifact read with `url` and `path: "project/canvas.json"`; note where it was saved. (A brand-new canvas has none: skip `--current`.)
2. `node <skill>/scripts/canvas.mjs uploads` prints `{upload: [paths]}`: shots not uploaded yet, or retaken.
3. Upload them in one Artifact call: `url`, `asset: true`, `file_paths`. Keep each result's `url`.
4. `node <skill>/scripts/canvas.mjs assets <path>=<url> …`, one pair per upload.
5. `node <skill>/scripts/canvas.mjs build --current <saved canvas.json>` prints `{root, file_path, files, removed, missing}`.
6. One Artifact publish: `url`, `root`, `file_path`, `files` as printed, plus each `removed` path as `null`. Done.

- `missing` lists screens with no screenshot yet: take them, then the next round places them.
- A publish failed? Fix the cause, then `build --all` resends every artboard.
- Refused because a file changed on the canvas (the person edited it, or the editor touched it on a click)? Read that file (Artifact read with its `path`) and look: an edit to a screen's artboard means the person changed it, so keep their version (leave it out of `files`) and say so; an editor-only change (a style the editor added) can be replaced. Never pass `overwrite_unread` for files you have not read.
- Never hand-edit the generated files (`.wwjd/canvas/`). Change the flow, the shots or the decisions and build again.
- The person's own boards and notes, and where they moved things, survive every build. Only `w-` notes and wwjd's boards are rewritten.

## Comments
- People comment anywhere on the canvas. Send to Claude wakes the session: read it with `ArtifactComments`.
- Fix what the comment asks, rebuild and publish, then reply with what changed and resolve the thread.
- Claude never starts a thread; the Why cards (from the decisions log) carry its reasons.
- To comment on part of a screen: press C (comment mode), click the spot or the element, write, then Send to Claude. Escape leaves comment mode.

## Rules
- Never verify the canvas by rendering it. The files follow the Design canvas rules; the tests check them.
- Never invent a screenshot: a screen without one stays in `missing` and on the diagram only.
