# Converse: chat, assistants, agent panels, copilots

Profile: `data-profile="app"`, primary width 390 if consumer, else 1440. Colour: neutral; the content leads.

Success: the person gets work done through dialogue and trusts what came back. This file is the chat surface; agent work, approvals, trust, memory and AI language: `references/ai.md`.

## States (design every one)
`references/ai.md` States, plus:
- **Empty:** 3–4 specific starters (overrides the `budgets.md` `empty` row); no welcome essay.
- **Streaming:** Stop replaces Send. **Aborted:** the partial answer stays, marked stopped.

## Thread
- **A reading column** (~70ch) centred in its pane.
- **Assistant output is a document, not a bubble:** reading type (~16px), code blocks as in `registers/reference.md`. The person's turns are compact and distinct.
- **One message at a time:** each appears after the previous one finishes, never two or three at once.
- **Scroll:** on send, pin the person's message near the top and stream below without following the bottom. "Jump to latest" only if they scroll away. Never move the view while they read.
- **Stable stream:** no per-token fades; tables and code don't reflow mid-stream.

## Composer
- Autogrows to ~8 lines, never past ~40% of the viewport, then scrolls inside.
- Desktop: Enter sends, Shift+Enter adds a line. Mobile: Enter adds a line.
- The draft survives reload; attachments are chips; focus stays after sending.
- Context is one line on top only when present ("Replying to …" ×). Model and mode pickers stay small and muted.

## Message actions
- Copy, regenerate, edit-to-branch on hover or focus (`rules/layout.md` Hover-revealed actions).
- Regenerated versions step with arrows; "2 / 3" sits in a tooltip.
- One shared menu for every assistant message.

## Tells to avoid
- Purple AI glow, a blinking typewriter cursor, endless bouncing dots (more in `references/ai.md`).
- "As an AI…" banners; every answer as a stack of carded headers.
