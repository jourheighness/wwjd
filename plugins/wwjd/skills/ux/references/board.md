# The project board

One Artifact per project where everything wwjd produced is collected: the directions explored, the decisions Claude made without asking, the screenshots it looked at, and what each handover checked or skipped. It is the shareable twin of the `/wwjd` sidebar: anyone the person shares the link with reads it without the app, and a comment on a decision reaches Claude.

## Make it (once per project)
- Publish `kit/board.html` as a new Artifact with `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}]}, assets: {}, comments: {composer_only: true}}` and icon `board`. Viewers read; only editors (and Claude) write.
- Put its link in `.wwjd.json` as `"board"`: the sidebar's Open board button and every session after this one find it there.
- Seed `meta/project` (title, summary, updatedAt) and the directions you already have.

## Keep it current (every handover is one round, one batch)
A round is one handover: what changed since the last time Claude said the work was done. Not a session: a session can hand over several times. One `ArtifactData` batch per round, so the person approves once:
- `handovers/<round id>`: `{at, title (what was handed over), checks: [{label (the sidebar's plain name), status ("done" | "skipped" | "not run"), note}]}`. A skipped check says who asked to skip it.
- `decisions/<id>`: `{at, round (its handover id), task, surface, kind ("choice" | "assumption"), text (past tense, plain), why, status ("open" | "dismissed" | "changed"), change?, proofs: [{kind, name, url | path}]}`. Same entries as the sidebar log; a decision settled in the sidebar updates its `status` here at the next round.
- `directions/<id>`: `{order, name ("A · Deck"), note (one line), url, board (its .dc.html, when it lives on a canvas)}`. Write the same list to `.wwjd/directions.json` (`[{name, url, board}]`, local) so the sidebar's Directions row opens them in the session.
- `meta/project.updatedAt`.

## Keep it small
The page reads capped queries (13 rounds, 400 decisions, 120 screenshots); the store stays within them:
- **Screenshots are current, never stacked:** one document per screen, width and theme, id `<screen>-<width>-<theme>` (`signup-390-light`). Each round uploads the new image (Artifact tool, `asset: true`; `file_paths` for several), overwrites that document with `{at, screen, width, theme, url (the upload's url, as given)}`, then deletes the replaced asset (`action: "delete"`, its id). A screen that no longer exists loses its documents and assets.
- **Twelve rounds of history:** when a thirteenth arrives, delete the oldest handover and its settled decisions (open ones stay until settled), and add 1 to `meta/project.archivedRounds`; the page says how many were removed.
- **Directions are replaced, not appended,** when a new exploration starts; the old canvas stays reachable from its round's decisions.

## Rules
- Plain words everywhere, as in the sidebar: no commands, paths only where a person can use them.
- Never invent a screenshot or a check: an empty section says so (the page has its own empty states).
- A comment on a decision is the person's correction: apply it, then set that decision's `status` to `changed` with `change`.
