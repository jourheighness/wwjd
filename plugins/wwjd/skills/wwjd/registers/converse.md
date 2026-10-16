# Converse: chat, assistants, agent panels, copilots

Profile: `data-profile="app"`. Colour: neutral; the content leads.

Success: the person gets work done through dialogue and trusts what came back. This file is the chat surface; agent work, approvals, trust, disclosure, memory and AI language live in `references/ai.md`.

## States (design every one)
| State | Behaviour |
|---|---|
| Empty | 3–4 specific starters; no welcome essay |
| Submitted | Acknowledged within 100ms |
| Streaming | Stop replaces Send |
| Ready | Actions available |
| Error | Inline retry; input kept |
| Aborted | Partial answer kept, marked stopped |

## Thread
- **A reading column** at a readable max width, centred in its pane.
- **Assistant output is a document, not a bubble:** reading type (~16px, ~70ch), code blocks as in `registers/reference.md`. The person's turns are compact and distinct.
- **Order:** messages arrive one at a time, never two or three at once.
- **Scroll:** on send, pin the person's message near the top and stream below without following the bottom. "Jump to latest" only if they scroll away. Never yank.
- **No jank:** no per-token fades; tables and code don't reflow mid-stream.
- **Announce** the finished message with `aria-live="polite"`, never each token.

## Composer
- Autogrows to ~8 lines, never past ~40% of the viewport, then scrolls inside.
- Desktop: Enter sends, Shift+Enter adds a line. Mobile: Enter adds a line.
- The draft survives reload; attachments are chips; focus stays after sending.
- Context is one line on top only when present ("Replying to …" ×). Model and mode pickers stay quiet.

## Message actions
- Copy, regenerate, edit-to-branch on hover or focus; on touch a visible ⋯.
- Regenerated versions step with arrows; "2 / 3" sits in a tooltip.
- One shared menu for every assistant message.

## Tells to avoid
- Sparkle avatars, purple AI glow, a blinking typewriter cursor, endless bouncing dots.
- "As an AI…" banners; every answer as a stack of carded headers.
- Tooltips covering the message they describe.
