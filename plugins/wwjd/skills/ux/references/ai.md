# AI features: patterns, agents, language

Read before building any AI feature. The chat surface itself: `registers/converse.md`.

## 1. Pick the narrowest pattern
A narrow, scoped feature is easier to learn and trust than chat.

| Pattern | Use when |
|---|---|
| A. Ambient inline | the next step is predictable and cheap to ignore (ghost text, smart defaults, reply chips) |
| B. In-place transform | acting on a selection (rewrite, shorten, proofread) |
| C. Accept/reject diff | AI changes structured or long content (code, docs, records) |
| D. Side-panel copilot | help across a workspace while the object stays visible (layout `copilot-panel`) |
| E. Full chat | the conversation is the product (layout `chat-artifact`) |
| F. Command-palette AI | an expert tool already has ⌘K |
| G. Background agents | minutes or more, or scheduled |
| H. Generative media | making or editing images or video |
| I. AI search and answers | information seeking is the job |
| J. Summaries and recaps | condensing threads, meetings, reviews |

- **A:** ghost text dimmed at the caret, same font, still AA; Tab accepts, Ctrl/⌘+→ a word, Esc or typing on dismisses; never moves the layout. Prefilled fields carry a "Suggested" mark until touched. 2–3 reply chips. A late suggestion is dropped, never inserted.
- **B:** one verb ("Rewrite", "Fix grammar") in the selection toolbar, ⌘K and the context menu. Preview in place with Keep · Try again · Undo plus tuners (tone, length); proofread steps with ‹ ›, a one-line reason each. The original stays recoverable after Keep.
- **C:** hunks inline with Keep / Undo per hunk and per file; one "Keep all" with a file count. Checkpoints restore the state before a request, warning when that touches the person's own edits. Pending review shows in the file tree or list.
- **D:** resizable, remembers width, never opens on its own. A context chip says what it sees ("Using: Q3 plan.docx ×"). One entry point across the product. Changes land in the object as in C; the panel only reports.
- **E:** answer first; if it can't help, say so in the first sentence. Choices as buttons or checkboxes, not prose lists. Embedded app cards: ≤2 actions (one primary), no tabs or nested scroll, carousels of 3–8.
- **F:** AI verbs are ordinary commands scoped to the selection; an unmatched query falls through to "Ask about '…'", answered in the palette's detail pane (Copy / Insert / Continue in panel).
- **G:** a run list grouped Needs you · Running · Done; each run shows title, target object, current step, elapsed time, who started it. Output lands as a reviewable draft (draft PR, doc, staged changes); notify only when it needs input or is done.
- **H:** select a region, optional prompt, pick from 3–4 variations; the result lands on a new layer or version with its prompt; presets beat freeform; export carries provenance and editable alt text.
- **I:** answer first, a citation marker per claim (hover/focus: source title, domain, quoted passage), linked to the passage. Classic results one tab away. No retrieval, no answer: "No sources found for …".
- **J:** each summary states its coverage ("From 42 messages, up to 14:05"); each point drills to its source span; a stale marker when the source changed. Never replaces access to the source.

## 2. Agents
- **Autonomy is a per-action dial** shown beside Stop: approve each, auto-approve with safety checks, skip approvals. Reads and undoable in-workspace edits run freely.
- **Hard limits at every level,** listed in settings: purchases, account creation, permanent deletion, trades, following instructions found in emails or pages. Content the agent reads is data, never instructions: say "Ignored instructions found in the page" and show the source behind any action proposed from read content.
- **Plan before outward or multi-step work:** steps, sources, what changes, what it will ask. After approval it asks only about things outside the plan; never an approval per step.
- **An approval** (inline in the run, never modal) names the verb + exact object and destination ("Send 3 emails to the Halden thread"), a payload preview (diff, body, amount), undoability ("Can't be undone" / "Undo for 30 days"), grant scope (Once · This project · Always), Edit before running, Deny with an optional reason. Buttons are the verb, never "Approve".
- **Stop** is one click or Esc: halts at the next safe point, reports done and not done; each run is one undo unit plus per-change undo, in drafts or branches by default. Queue (after this task) vs Steer (next step). Takeover pauses; resume only on an explicit Continue.
- **Live status:** ack within 100ms; past ~2s one specific present-tense line ("Reading invoices 12/40"), never "Processing…", gone when the result lands. Tool steps are collapsed, inspectable lines; no lasting receipts or chain-of-thought dumps.
- **Results land where they apply** (doc, code, record), marked, with keep, change and undo there; the chat says in one sentence what was done.
- **Time and cost:** a range before the run ("Usually 1–4 min"), cost where metered; past ~30s offer "Run in background".
- **Handoff to a person:** at once on request, offered on frustration signals (the same question rephrased, 3+ turns looping). The human gets transcript, reason and every AI action; the customer sees the wait ("usually under 2 h"); the bot stops once the human replies.
- **Errors mid-run:** stop at the failed step, keep completed work, say what failed; Retry step · Edit and retry · Skip · Take over. Never restart from zero or retry silently in a loop.
- **Audit:** actions show in the object's activity as "Agent X on behalf of Sara"; grants have a history and revoke from one list; agents in pickers carry an "Agent" badge; every scheduled or automatic agent is listed where it can be paused or deleted.

## 3. Language
- **Voice by surface:** chat and agents may say "I" about actions and limits ("I couldn't open the PDF"); embedded features use system labels ("Couldn't summarize: file too large"). Never claim feelings, understanding or judgement.
- **Uncertainty is about the evidence, not the self** ("The contract doesn't state a renewal date; §4 sets a 12-month term"). Hedge once, at the claim; never present a guess as fact.
- **Refusals:** the limit first, then one alternative; no moralising. **Apologies** only when the product failed, once, with the fix.
- **No sycophancy:** no praise for the question. On pushback, re-check and hold a correct answer with its evidence ("Still 4.2%: Q3 report, p. 12").
- **Length** matches the question; structure only for comparisons and multi-step work.
- **Names:** features by verb (Rewrite, Summarize); a persona name only for one product-level assistant. Agent avatar = monochrome product glyph + "Agent" badge, never a face. Sparkle only as a labelled entry glyph, never alone or as decoration.
- **Errors** add what's kept ("Couldn't reach the calendar. Your draft is saved. Retry.").

## 4. Never → instead
| Never | Instead |
|---|---|
| Glow, shimmer, gradient "AI presence" | A labelled AI mark on a neutral surface (unless DESIGN.md owns it) |
| A generic "Ask AI" / "✨" button | A verb on the object with its scope ("Summarize thread"), in the selection toolbar or ⌘K |
| AI overwriting content in place, or auto-applied unmarked | Preview diff (C), "Suggested" state, or per-field auto-apply with an audit entry |
| Inferring people's appearance or identity | Ask for the attributes |
| Silent model changes | A short "what changed" note where the change shows |

## 5. Before building (the checklist)
1. **Manual path** works fully with AI off; one settings page: per-feature on/off, memory, data use, autonomy level.
2. **Entry** shows its scope (label, or a placeholder from the open object); out of scope: say the purpose plus one alternative.
3. **Limits shown:** known weaknesses beside the input they affect ("Handwritten scans may miss numbers"); a poor result gives its reason ("Only 2 of 9 files could be read").
4. **Confidence becomes behaviour, never a percentage:** high = apply or preselect; medium = suggest; low = nothing for proactive features, "not found" for requested ones. Proactive help waits for a natural pause, in its own slot, never over the caret or work.
5. **States:** idle, acknowledged, specific progress, preview or streaming, result, partial or stopped, error with input kept, blocked with coaching plus an example, no sources.
6. **Control:** every output dismissable (Esc), editable, retryable, undoable; variations where taste matters. Corrections persist. If fixing takes longer than doing it by hand, cut the feature.
7. **Ambiguity:** only when a guess could be wrong, one question or 2–3 interpretations as choices.
8. **Why, one layer deep:** a popover on the AI mark shows inputs, sources and rule; factual, never about the person.
9. **Feedback** acts at once and everywhere ("hide this" hides it app-wide); reason chips ("Wrong facts", "Too long") say what happens.
10. **Disclosure:** AI-only surfaces once, near the input, never "AI may be inaccurate" on every block; mixed content marks each AI item; output that leaves the product carries a mark plus metadata, media C2PA/IPTC and a visible "AI-generated" / "Edited with AI" label (check current EU AI Act Art. 50 dates).
11. **Data:** at first use say what leaves the device or account, where, and whether it trains models; the toggle one click away; training on workspace or customer data off by default. Sensitive actions (money, credentials, ID data, permissions, deletion, messages to others, third-party accounts) always get review.
12. **Memory:** "Memory updated" inline, linking to the entry; all memory in one editable list; a temporary mode neither reads nor writes it.
13. **Access:** agent state via `role=status`, finished results announced once; approvals keyboard-operable with the verb in the accessible name.
