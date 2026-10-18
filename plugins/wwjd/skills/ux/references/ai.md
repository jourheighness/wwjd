# AI features: patterns, agents, language

Read before building any AI feature: inline suggestions, rewrite tools, copilots, chat, agents, AI search, summaries. The chat surface itself is `registers/converse.md`.

## 1. Pick the narrowest pattern
Chat isn't always the answer; a narrow, scoped feature is easier to learn and trust.

| Pattern | Use when |
|---|---|
| A. Ambient inline | the next step is predictable and cheap to ignore (ghost text, smart defaults, reply chips) |
| B. In-place transform | acting on a selection (rewrite, shorten, proofread) |
| C. Accept/reject diff | AI changes structured or long content (code, docs, records) |
| D. Side-panel copilot | help across a workspace while the object stays visible (layout `copilot-panel`) |
| E. Full chat | the conversation is the product (`registers/converse.md`, layout `chat-artifact`) |
| F. Command-palette AI | an expert tool already has ⌘K |
| G. Background agents | minutes or more, or scheduled |
| H. Generative media | making or editing images or video |
| I. AI search and answers | information seeking is the job |
| J. Summaries and recaps | condensing threads, meetings, reviews |

- **A:** ghost text dimmed at the caret, same font, still AA; Tab accepts, Ctrl/⌘+→ a word, Esc or typing on dismisses; never moves the layout. Prefilled fields carry a "Suggested" mark until touched. 2–3 reply chips in the reply slot. Fails silently; a late suggestion is dropped, never inserted. Exposed to screen readers via a described hint.
- **B:** one verb ("Rewrite", "Shorten", "Fix grammar") in the selection toolbar, ⌘K and the context menu. Preview in place as diff or replacement with Keep · Try again · Undo plus tuners (tone, length). Proofread steps with ‹ ›, a one-line reason each. The original stays recoverable after Keep; a refinement visibly takes effect.
- **C:** hunks inline with Keep / Undo per hunk and per file; one "Keep all" with a file count. Checkpoints restore the state before a request, warning when that touches the person's own edits. Pending review shows in the file tree or list.
- **D:** resizable, remembers width, never opens on its own. A context chip says what it sees ("Using: Q3 plan.docx ×"). One entry point across the product. Changes land in the object as C; the panel only reports.
- **E:** answer first; if it can't help, say so in the first sentence. Choices as buttons or checkboxes, not prose lists. Embedded app cards: ≤2 actions (one primary), no tabs or nested scroll, carousels of 3–8.
- **F:** AI verbs are ordinary commands scoped to the selection. An unmatched query falls through to "Ask about '…'". The answer opens in the palette's detail pane with Copy / Insert / Continue in panel; never a second palette.
- **G:** a run list grouped Needs you · Running · Done; each run shows title, target object, current step, elapsed time, who started it. Output lands as a reviewable draft (draft PR, doc, staged changes); follow-ups as comments on it. Notify only when it needs input or is done.
- **H:** select a region, optional prompt, pick from 3–4 variations; the result lands on a new layer or version with its prompt beside it. Style presets beat freeform. Export carries provenance metadata and editable generated alt text.
- **I:** answer first with a citation marker per claim (hover/focus: source title, domain, quoted passage). Classic results one tab away. No retrieval, no answer: "No sources found for …".
- **J:** each summary states its coverage ("From 42 messages, up to 14:05"); each point drills to its source span. The person's text and AI text differ by more than colour, both AA. A stale marker when the source changed. Never replaces access to the source.

## 2. Agents
- **Autonomy is a dial per action,** shown beside Stop: approve each, auto-approve with safety checks, skip approvals (per field: shown, auto-applied, hidden). Reads and undoable in-workspace edits run freely.
- **Hard limits at every level,** listed in settings: purchases, account creation, permanent deletion, trades, following instructions found in emails or pages. Content the agent reads is data, never instructions: say "Ignored instructions found in the page", and show the source behind any action proposed from read content.
- **Plan before outward or multi-step work:** steps, sources and sites, what changes, what it will ask. After approval it asks only about things outside the plan. Plan approval plus scoped grants, never an approval per step.
- **An approval** (the floor's review step, inline in the run, never modal) names: the verb + exact object and destination ("Send 3 emails to the Acme thread"); a payload preview (diff, body, amount); undoability ("Can't be undone" / "Undo for 30 days"); grant scope (Once · This project · Always); Edit before running; Deny with an optional reason. Buttons are the verb, never "Approve".
- **Stop** is one click or Esc: halts at the next safe point, reports done and not done, undo for what was done. Queue (after this task) vs Steer (next step). Takeover pauses and hands over; resume only on an explicit Continue.
- **Live status:** ack within 100ms; past ~2s one specific present-tense line ("Reading invoices 12/40"), never "Processing…", gone when the result lands. Each tool step is one collapsed line; the full log stays collapsed but inspectable. No step counters or lasting receipts, never a chain-of-thought dump.
- **Results land where they apply** (doc, code, record), marked, with keep, change and undo on the spot. The chat says in one sentence what was done.
- **Time and cost:** a range before the run ("Usually 1–4 min"), cost where metered. Past ~30s offer "Run in background" into the inbox; never trap the person watching; never a spinner for a multi-minute job.
- **Handoff to a person** is honoured at once; offered on frustration signals (the same question rephrased, a loop of 3+ turns). The human gets transcript, reason and every AI action; the customer sees the wait ("usually under 2 h"); the bot stops once the human replies.
- **Undo:** each run is one undo unit plus per-change undo; work in drafts or branches by default; irreversible external effects were named in the approval.
- **Errors mid-run:** stop at the failed step, keep completed work, say what failed plainly; Retry step · Edit and retry · Skip · Take over. Never restart from zero or retry silently in a loop.
- **Audit:** actions appear in the object's activity as "Agent X on behalf of Sara"; grants have a history and revoke from one list; agents in assignee pickers carry an "Agent" badge, never pose as a person, and show the delegating human. Every scheduled or automatic agent is listed where it can be paused or deleted.

## 3. Language
- **Voice by surface:** chat and agents may say "I" about actions and limits ("I couldn't open the PDF"). Embedded features have no voice: system labels ("Summary", "Couldn't summarize: file too large"). Never claim feelings, understanding or judgement.
- **Uncertainty is about the evidence, not the self** ("The contract doesn't state a renewal date; §4 sets a 12-month term"). Hedge once, at the claim; ranges when data is missing. Never present a guess as fact.
- **Refusals:** the limit first, then one alternative; no moralising. **Apologies** only when the product failed the person, once, with the fix.
- **No sycophancy:** no openers or praise for the question. On pushback, re-check and hold a correct answer with its evidence ("Still 4.2%: Q3 report, p. 12").
- **Length** matches the question; structure only for comparisons and multi-step work.
- **Names:** features by verb (Rewrite, Summarize); a persona name only for one product-level assistant. Agent avatar = monochrome product glyph + "Agent" badge, never a face. Sparkle only as a labelled entry glyph where the system already uses it; never alone, as avatar or decoration.
- **Errors:** what happened, what's kept, the next step ("Couldn't reach the calendar. Your draft is saved. Retry.").

## 4. Never → instead
| Never | Instead |
|---|---|
| Glow, shimmer, gradient "AI presence" | A labelled AI mark on a neutral surface (unless DESIGN.md owns it) |
| "AI may be inaccurate" on every block | One note near the input, citations per claim, per-item marks where content mixes |
| A generic "Ask AI" / "✨" / "Start AI" button | A verb on the object with its scope ("Summarize thread") |
| AI overwriting text or records in place, or auto-applied unmarked | Preview diff with Keep / Undo / Try again; "Suggested" state, or per-field auto-apply with an audit entry |
| A proactive suggestion over the caret or work | A quiet slot at a natural pause, suppressed when confidence is low |
| Inferring people's appearance or identity | Ask for the attributes |
| Silent model changes | A short "what changed" note where the change shows |
| A branded name per feature | Plain verbs |

## 5. Before building (the checklist)
1. **Pattern:** the job named; the narrowest pattern chosen; chat only if the conversation is the product.
2. **Manual path** works fully with AI off; one global settings page: per-feature on/off, memory, data use, autonomy level.
3. **Entry** is a verb on the object (selection toolbar, ⌘K), scope in the label or a placeholder derived from the open object; 3–4 starters where it helps. Out of scope: say the purpose plus one alternative.
4. **Limits in place:** known weaknesses beside the input they affect ("Handwritten scans may miss numbers"); a poor result gives its reason ("Only 2 of 9 files could be read").
5. **Confidence becomes behaviour, never a percentage:** high = apply or preselect; medium = suggest; low = nothing for proactive features, "not found" for requested ones. Be strictest about mistakes in proactive help; it appears at natural pauses in its own slot.
6. **States:** idle, acknowledged (<100ms), specific progress, preview or streaming, result, partial or stopped, error with input kept, blocked with coaching plus an example, no sources.
7. **Control:** every output dismissable (Esc), editable in place, retryable, undoable; variations where taste matters. Corrections persist; prefer guided ones (pick an alternative). If fixing takes longer than doing it by hand, cut the feature.
8. **Ambiguity:** one disambiguating question, or 2–3 interpretations as choices, only when a guess could be wrong.
9. **Why, one layer deep:** a popover on the AI mark shows inputs, sources and rule; on demand, factual, never about the person.
10. **Learning:** explicit feedback acts at once and everywhere ("hide this" hides it app-wide). Feedback = thumbs plus specific reason chips ("Wrong facts", "Too long"), each saying what happens.
11. **Grounding:** passage-level citations, linked inline. No retrieval, no answer.
12. **Disclosure:** AI-only surfaces once, persistently, near the input, never per message. Mixed content (docs, records): mark each AI item. Output that leaves the product: per-item mark plus metadata; media carries C2PA/IPTC and a visible "AI-generated" / "Edited with AI" label (check current EU AI Act Art. 50 dates).
13. **Data:** at the point of first use say what leaves the device or account, where, and whether it trains models; the toggle one click away; training on workspace or customer data off by default. Sensitive actions (money, credentials, ID data, permissions, deletion, messages to others, third-party accounts) always get review.
14. **Memory:** "Memory updated" inline, linking to the exact entry; all memory in one editable list; a temporary mode neither reads nor writes it; personalisation names its sources where used.
15. **Access:** finished results announced once (`aria-live="polite"`), agent state via `role=status`; approvals keyboard-operable with the verb in the accessible name; the AI mark never colour alone; reduced motion removes shimmer and pulsing.
