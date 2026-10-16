# Converse: chat, assistants, agent panels, copilots

Success: the person gets work done through dialogue and trusts what came back.

## States (design every one)
| State | Behaviour |
|---|---|
| Empty | 3–4 specific starting suggestions; no welcome essay |
| Submitted | Acknowledged within 100ms |
| Streaming | Stop replaces Send |
| Ready | Actions available |
| Error | Inline retry; the person's input is kept |
| Aborted | The partial answer is kept and marked as stopped |

## Layout
- **A reading column:** the thread is a column at a readable max width, centred in its pane.
- **Messages:**
  - The assistant's output is a document, not a bubble. Use reading type (about 16px, about 70ch) and the code-block rules from `reference.md`.
  - The person's turns are compact and distinct.
  - Messages arrive in order, one at a time, never two or three at once.
- **Scroll:** while streaming, follow the bottom only if the person is already there. Otherwise show "jump to latest". Never yank the scroll.
- **Streaming without jank:** no per-token fades, and tables and code blocks don't reflow mid-stream.

## Composer
- **Size:** autogrows to about 8 lines, never more than ~40% of the viewport, then scrolls inside.
- **Keys:** on desktop Enter sends and Shift+Enter adds a line; on mobile Enter adds a line.
- **Drafts and attachments:** the draft survives reload. Attachments show as chips.
- **Context:** shown as one line at the top of the composer, only when present ("Replying to …"), with an × to clear it.
- **Model and mode pickers** stay quiet.
- **Focus** stays in the composer after sending.

## Agent work
- **Tool and agent steps:** one collapsed line each, expandable. Never a raw dump of chain-of-thought.
- **Approvals** are real choices that say what will happen.
- **Results land where they apply,** in the document, the code or the record, marked there with keep and undo. The chat says in one sentence what was done.
- **Hide the machinery:**
  - While work runs, one live status line ("Reading the March audit…") builds trust and perceived speed. It collapses or disappears once the result is in.
  - No step counters or lasting receipts unless the person opens them.

## Message actions
- **The set:** copy, regenerate, and edit to branch, on hover or focus. On touch, a visible control (⋯); long-press only as a shortcut.
- **Regenerated versions:** step through them with arrows; the "2 / 3" count sits in a tooltip.
- **One shared menu** for every assistant message.

## Trust
- **Cite** sources inline, linked.
- **Disclose AI** once, not on every message.
- **Memory** is visible and editable.
- **Never present guesses as facts.** Uncertainty is stated in the answer's own words.

## Accessibility
- Announce the finished message with `aria-live="polite"`, never each token.

## Tells to avoid
- Sparkle avatars.
- Purple AI glow.
- A blinking typewriter cursor.
- Endless bouncing dots.
- "As an AI…" banners.
- Every answer as a stack of cards with headers.
- Tooltips covering the message they describe.
