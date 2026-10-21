# The project board

One Artifact per project where everything wwjd produced is collected: the directions explored, the decisions Claude made without asking, the screenshots it looked at, and what each handover checked or skipped. It is the shareable twin of the `/wwjd` sidebar: anyone the person shares the link with reads it without the app, and a comment on a decision reaches Claude.

## The setting
**Project board**, on (default) or off: `/wwjd` → Settings, for you (the `boardmode` plugin option) or for this project (`"boardMode": "off"` in `.wwjd.json`, which wins). `wwjd.mjs status` prints it. Off: never create, seed or update a board, and don't offer one at start. On, with a `board` in `.wwjd.json`: the stop hook asks once per run of edits to add the round; any `ArtifactData` write to the board clears it; Hooks quiet or off never asks.

## Make it (once per project)
- `node <skill>/scripts/board.mjs page --title "<project name>"` writes `.wwjd/board.html`, the kit page titled "<project name> board" (the gallery name). Publish it as a new Artifact with `capabilities: {db: {rules: [{path: "", read: "view", write: "admin"}]}, assets: {}, comments: {composer_only: true}}` and icon `board`. Viewers read; only editors (and Claude) write.
- Put its link in `.wwjd.json` as `"board"`: the sidebar's Open board button and every session after this one find it there.

## Keep it current (every handover is one round: one command, one batch)
A round is one handover: what changed since the last time Claude said the work was done. Not a session: a session can hand over several times.
1. Upload this round's screenshots (Artifact tool, `asset: true`, `file_paths` for several); keep each result's `url`.
2. Run `node <skill>/scripts/board.mjs round --title "<what was handed over>"`, with one `--check "<label>=done|skipped|not run[: note]"` per check (the sidebar's plain names; a skipped check says who asked) and one `--shot <screen>-<width>-<theme>.png=<url>` per upload. The first round also takes `--summary "<one line>"`.
3. Pass each printed batch to `ArtifactData` `batch` as `writes`, as printed. Then delete each printed `deleteAssets` id (Artifact `delete` with `url` and `path`): the screenshots this round replaced.
4. A batch failed? Fix the cause, then the same command with `--again`.

The script reads what the sidebar already holds: new entries in `.wwjd/decisions.jsonl`, entries settled there since (dismissed or changed), and `.wwjd/directions.json` (`[{name, url, board, note}]`, written when directions are explored; the sidebar's Directions row reads it too). Every write creates a document, so no write needs a version: a settled decision is a new `settled/<id>-<round>` document, and screenshots and direction lists carry their round in their id. What was sent lives in `.wwjd/board.json`.

## Keep it small
- **Screenshots are current, never stacked:** the page shows the newest per screen, width and theme, and each replaced image is deleted (step 3).
- **Rounds:** the page shows the newest 13 handovers and says how many older ones it leaves out. Documents are a few hundred bytes each; images are what grow, and those are replaced.
- **Directions are replaced** when a new exploration writes a new `.wwjd/directions.json`; the old canvas stays reachable from its round's decisions.

## Rules
- Plain words everywhere, as in the sidebar: no commands, paths only where a person can use them.
- Never invent a screenshot or a check: an empty section says so (the page has its own empty states).
- A comment on a decision is the person's correction: apply it, and correct the entry in the sidebar (or its log line's `correction`), so the next round marks it changed.
