# The project board

One Artifact per project where everything wwjd produced is collected: the directions explored, the decisions Claude made without asking, the screenshots it looked at, and what each handover checked or skipped. It is the shareable twin of the `/wwjd` sidebar: anyone the person shares the link with reads it without the app, and a comment on a decision reaches Claude.

## Make it (once per project)
- Publish `kit/board.html` as a new Artifact with `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}]}, assets: {}, comments: {composer_only: true}}` and icon `board`. Viewers read; only editors (and Claude) write.
- Put its link in `.wwjd.json` as `"board"`: the sidebar's Open board button and every session after this one find it there.
- Seed `meta/project` (title, summary, updatedAt) and the directions you already have.

## Keep it current (every handover, one batch)
One `ArtifactData` batch per handover, so the person approves once:
- `directions/<id>`: `{order, name ("A · Deck"), note (one line), url, board (its .dc.html, when it lives on a canvas)}`
- `decisions/<id>`: `{at, task, surface, kind ("choice" | "assumption"), text (past tense, plain), why, status ("open" | "dismissed" | "changed"), change?, proofs: [{kind, name, url | path}]}`. Same entries as the sidebar log; a decision settled in the sidebar updates its `status` here.
- `shots/<id>`: upload each new `.wwjd/shots/*.png` with the Artifact tool (`asset: true`, `file_paths` for several), then `{at, screen, width, theme, url (the upload's url, as given), caption?}`.
- `handovers/<id>`: `{at, title (what was handed over), checks: [{label (the sidebar's plain name), status ("done" | "skipped" | "not run"), note}]}`. A skipped check says who asked to skip it.
- `meta/project.updatedAt`.

## Rules
- Plain words everywhere, as in the sidebar: no commands, paths only where a person can use them.
- Never invent a screenshot or a check: an empty section says so (the page has its own empty states).
- A comment on a decision is the person's correction: apply it, then set that decision's `status` to `changed` with `change`.
