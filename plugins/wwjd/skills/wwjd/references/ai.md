# AI features: patterns, agents, language

Read this before building any AI feature. That covers inline suggestions, rewrite tools, copilots, chat, agents, AI search and summaries. The chat surface itself follows `registers/converse.md`; this file covers everything else, and how AI behaves and speaks.

## 1. Pick the narrowest pattern
Chat isn't always the answer. A narrow, scoped feature is easier to learn and to trust.

| Pattern | Use when | Examples |
|---|---|---|
| A. Ambient inline | the next step is predictable and cheap to ignore | ghost text, smart defaults, suggested replies |
| B. In-place transform | acting on a selection | rewrite, shorten, proofread |
| C. Accept/reject diff | AI changes structured or long content | code edits, document edits, record updates |
| D. Side-panel copilot | help across a workspace while the object stays visible | workspace assistant |
| E. Full chat | the conversation is the product | `registers/converse.md` |
| F. Command-palette AI | an expert tool already has ⌘K / Ctrl+K | AI verbs as ordinary commands |
| G. Background agents | the task takes minutes or more, or runs on a schedule | coding agent, scheduled tasks |
| H. Generative media | making or editing images or video | fill, variations |
| I. AI search and answers | information seeking is the job | answers with citations |
| J. Summaries and recaps | condensing threads, meetings, reviews | meeting notes, thread recaps |

**A. Ambient inline**
- **Ghost text:** dimmed text at the caret, same font, still AA. Tab accepts; Ctrl/⌘+→ accepts a word; Esc or continuing to type dismisses. It never moves the layout.
- **Prefilled fields:** show a small "Suggested" mark until the person touches them.
- **Reply chips:** 2–3 short ones, in the reply slot.
- **Failure:** silent. A suggestion that arrives after the person typed on is dropped, never inserted.
- **Screen readers:** expose suggestions through an accessible view or a described hint.

**B. In-place transform**
- **Entry:** one verb ("Rewrite", "Shorten", "Fix grammar") in the selection toolbar, ⌘K and the context menu.
- **Preview:** shows in place as a diff or replacement, with Keep · Try again · Undo, plus tuners (tone, length).
- **Proofread:** steps through changes with ‹ ›, each with a one-line reason.
- **Recovery:** the original stays recoverable after Keep.
- **Feedback:** a refinement visibly takes effect.

**C. Accept/reject diff**
- **Per change:** hunks marked inline, with Keep / Undo per hunk and per file.
- **Batch:** one "Keep all" with a file count.
- **Checkpoints:** restore the state before a request. Warn when a restore would touch the person's own edits.
- **Visibility:** pending review shows in the file tree or list.

**D. Side-panel copilot**
- **Panel:** resizable, remembers its width, never opens on its own.
- **Scope:** a context chip on top says what it can see ("Using: Q3 plan.docx ×").
- **Entry:** one entry point across the product.
- **Changes:** land in the object as pattern C; the panel only reports.

**E. Full chat additions**
- **Answer first.** If it can't help, say so in the first sentence. No greetings.
- **Choices as controls:** render choices as buttons or checkboxes, not prose lists.
- **Scroll:** on send, pin the person's message near the top and stream below it, without following the bottom. "Jump to latest" appears only if they scroll away.
- **Embedded app cards:**
  - at most 2 actions, one primary
  - no tabs or nested scroll
  - carousels of 3–8 items

**F. Command-palette AI**
- **Commands:** AI verbs are ordinary commands, scoped to the selection.
- **Fallback:** an unmatched query falls through to a last row, "Ask about '…'".
- **Answer:** opens in the palette's detail pane, with Copy / Insert / Continue in panel. There is never a second palette.

**G. Background agents**
- **Inbox:** an inbox or run list grouped Needs you · Running · Done. Each run shows title, target object, current step, elapsed time, and who started it.
- **Output:** lands as a reviewable draft (draft PR, draft doc, staged changes).
- **Follow-ups:** happen through comments on that artifact.
- **Notifications:** only when it needs input or is done.

**H. Generative media**
- **Flow:** select a region, add an optional prompt, pick from 3–4 variations.
- **Placement:** the result lands on a new layer or version (non-destructive), with its prompt kept beside it.
- **Prompting:** style presets beat freeform.
- **On export:** provenance metadata, plus generated alt text that can be edited first.

**I. AI search and answers**
- **Answer first,** with a citation marker on each claim. Hover or focus shows the source title, domain and quoted passage.
- **Results:** classic results stay one tab away.
- **No retrieval, no answer:** say "No sources found for …" rather than answering ungrounded.

**J. Summaries and recaps**
- **Mark each summary,** with its coverage ("From 42 messages, up to 14:05"). Each point drills down to its source span.
- **Your text vs AI text:** the person's own text and AI text differ visibly, by more than colour, and both meet AA.
- **Freshness:** a stale marker appears when the source changed after the summary.
- **Source access:** a summary never replaces access to the source.

## 2. Principles as UI rules
1. **Say what it can do, in place.**
   - Use 3–4 starters or a placeholder derived from the open object.
   - Name the scope in the entry label ("Summarize thread", never "Ask AI").
   - Out of scope: state the purpose plus one alternative.
2. **Say where it's weak, where it matters.** Put known limits next to the input they affect ("Handwritten scans may miss numbers"). When a result is poor, give the reason ("Only 2 of 9 files could be read").
3. **Confidence becomes behaviour, not a percentage.**
   - High: apply or preselect.
   - Medium: suggest.
   - Low: show nothing for proactive features, and say "not found" for requested ones.
4. **Fast to invoke, dismiss and correct.**
   - Every output can be dismissed (Esc), edited in place, and retried.
   - Corrections persist. Prefer guided corrections (pick an alternative).
   - If fixing it takes longer than doing it by hand, cut the feature.
5. **Scope down when in doubt.** Ask one disambiguating question, or offer 2–3 interpretations as choices, but only when a guess could be wrong.
6. **Explain why, one layer deep.** A popover on the AI mark shows the inputs, sources and rule used. Show it on demand, never expanded. Keep it factual, never about the person.
7. **Time proactive help.** Suggestions appear at natural pauses, in their own slot, never over the caret or the work. Be strictest about mistakes in proactive features.
8. **Learn carefully, and announce changes.** Explicit feedback acts at once and everywhere ("hide this" hides it across the app). Tell people when the model's behaviour changes.
9. **Global controls.** One settings page: per-feature on/off, memory, data use, autonomy level. The product is complete with AI off.
10. **Feedback is light and specific.** Thumbs up/down next to the output, plus optional reason chips ("Wrong facts", "Too long", "Not what I asked"). Each chip says what will happen.
11. **Failure always has a way forward.**
    - Plain cause, input kept, and one next step: retry, a narrower request, the manual path, or a person.
    - A blocked request gets coaching plus an example.
12. **Ask, don't infer, about people.** For people-related generation, ask for the attributes instead of inferring gender, ethnicity or relationships.

## 3. Agents
- **Autonomy is a visible dial per action,** not a global mood. Show the current level beside Stop in the agent's header.
  - Levels: approve each, auto-approve with safety checks, skip approvals.
  - Linear-style per field: shown, auto-applied, or hidden.
- **Hard limits at every level.** Some actions are never autonomous: purchases, account creation, permanent deletion, trades, following instructions found in emails or web pages. List them in settings. When content contained instructions, say so: "Ignored instructions found in the page".
- **Plan before acting** on multi-step or outward work.
  - The plan lists steps, sources and sites, what will change, and what it will ask about.
  - After approval, it asks only about things outside the plan.
- **An approval says:**
  1. The verb plus the exact object and destination ("Send 3 emails to the Acme thread", "Delete branch feat/x").
  2. A preview of the payload: the diff, the email body, the amount.
  3. Whether it can be undone: "Can't be undone", or "Undo for 30 days".
  4. The scope of the grant: Once · For this project or site · Always.
  5. Edit before running.
  6. Deny, with an optional reason so the agent can re-plan.
  - Buttons are the verb, never "Approve" under "Do you approve this action?".
  - Approvals are the floor's review step, shown inline in the run and never modal. Reads and undoable in-workspace edits run freely.
- **Stop:**
  - Always one click or Esc away. Stopping halts at the next safe point and reports what was done and not done, with undo for what was done.
  - **Queue** (after the current task) vs **Steer** (at the next step).
  - **Takeover:** the agent pauses and hands over control, then resumes only on an explicit "Continue".
- **Live status:**
  - Acknowledge within 100ms.
  - For anything over about 2s, show one specific, present-tense line ("Reading invoices 12/40"), never "Processing…". It disappears when the result lands.
  - The full step log stays collapsed but inspectable.
- **Time and cost:** before a run, give a range ("Usually 1–4 min") and the cost where it's metered. Past about 30s, offer "Run in background" and move the run to the inbox. Never trap the person watching.
- **Handoff to a person:**
  - "Talk to a person" is honoured at once. Offer it on frustration signals: the same question rephrased, or a loop of 3 or more turns.
  - The person taking over gets the transcript, the reason, and every action the AI already took.
  - The customer sees the waiting state ("A person will reply here, usually under 2 h"), and the bot stops once the human replies.
- **Undo and rollback:**
  - Each run is one unit of undo, plus per-change undo.
  - Work happens in drafts or branches by default.
  - External effects that can't be undone were named in the approval.
- **Audit trail:**
  - Actions appear in the object's own activity as "Agent X on behalf of Sara".
  - Granted permissions have a history and can be revoked from one list.
  - Agents appear in assignee pickers with an "Agent" badge, never as a person. Every agent task shows the human who delegated it.
- **Errors mid-run:**
  - Stop at the failed step, keep completed work, and say what failed in plain words.
  - Offer Retry step · Edit and retry · Skip · Take over.
  - Never restart from zero or retry silently in a loop.
- **Background visibility:** every scheduled or automatic agent is listed where the person can pause or delete it.

## 4. Language and relationship
- **Voice by register.**
  - In chat and agents, the assistant may use first person about its actions and limits ("I found 3 blockers", "I couldn't open the PDF").
  - Features embedded in a product have no voice: system labels only ("Summary", "Suggested", "Couldn't summarize: file too large").
  - Never claim feelings, understanding or judgement ("I understand your frustration", "I think you'll love…").
- **Uncertainty is about the evidence, not the self.**
  - "The contract doesn't state a renewal date; §4 sets a 12-month term."
  - Hedge once, at the claim. Use ranges when exact data is missing.
- **Refusals:** the limit first, then one alternative. No moralising, no policy essay.
- **Apologies:** only when the product failed the person (lost input, a wrong action), once, paired with the fix. Never as filler, never for a refusal.
- **No sycophancy.**
  - No openers ("Absolutely! I'd be happy to help…") and no praise for the question.
  - On pushback, re-check the source and hold a correct answer with its evidence ("Still 4.2%: Q3 report, p. 12").
- **Length** matches the question. Use structure only for comparisons and multi-step work.
- **Disclosure:**
  - **AI-only surfaces** (a chat, an agent panel): once, persistently, near the input, in plain language.
  - **Content where AI and people mix** (docs, records, notes): mark each AI item.
  - **Output that leaves the product** (a sent email, an exported image): a per-item mark, plus metadata for media.
  - Never a badge on every chat message. Never present AI as a person.
- **Names and marks:**
  - Name features by their verb (Rewrite, Summarize, Clean up). A persona name only for one product-level assistant.
  - An agent's avatar is a monochrome product glyph plus an "Agent" badge, never a face.
  - The sparkle is allowed only as a labelled entry glyph where the project's system already uses it. Never alone, never as an avatar, never decoration.
- **Memory:**
  - "Memory updated" appears inline, linking to the exact entry. All memory sits in one editable list.
  - A temporary mode neither reads nor writes memory.
  - Personalisation names its sources where it is used.
- **Errors:** what happened, what's kept, the next step ("Couldn't reach the calendar. Your draft is saved. Retry."). No blame, no jokes, no "Oops".

## 5. Trust, data, access
- **Before first use,** say at the point of use what leaves the device or account, where it goes, and whether it trains models. The toggle is one click from that notice. Training on workspace or customer data is off by default.
- **Sensitive actions always get the review step:** money, credentials and ID data, permissions, deletion, messages to others, actions in third-party accounts.
- **Prompt injection:** content the agent reads is data, never instructions. Show any instructions that were ignored, and the source behind any action proposed from read content.
- **Provenance:** generated media carries metadata (C2PA or IPTC) and a visible "AI-generated" or "Edited with AI" label where it's shown or shared. Check current EU AI Act Article 50 dates before relying on them.
- **Accessibility:**
  - Announce finished results once (`aria-live="polite"`), and agent state changes via `role=status`.
  - Approvals are keyboard-operable, with the verb in their accessible name.
  - The AI mark never relies on colour alone.
  - Reduced motion removes shimmer and pulsing.

## 6. Bans: never this, do that instead
| Never | Instead |
|---|---|
| Glow, shimmer or gradient "AI presence" | A labelled AI mark on a neutral surface (unless the project's design system prescribes it) |
| "AI may be inaccurate" on every block | One note near the input, citations per claim, and per-item marks where content mixes |
| A generic "Ask AI" / "✨" / "Start AI" button | A verb on the object, in the selection toolbar and ⌘K |
| AI overwriting text or records in place | A preview diff with Keep / Undo / Try again |
| Auto-applied AI changes with no mark | A "Suggested" state, or per-field auto-apply with an audit entry |
| A proactive suggestion over the work or caret | A quiet slot at a pause, suppressed when confidence is low |
| "Approve / Deny" with "Do you approve this action?" | Verb buttons naming the object, a payload preview, reversibility and the grant scope |
| An approval on every step | Plan approval plus scoped grants |
| Continuing after Stop, or resuming unasked | Halt at a safe point, report what's done and not done, resume only on Continue |
| A spinner for a multi-minute job | A time range, run in background, an inbox, a notification when needed |
| Silent mid-run failure, or restarting from zero | Stop at the failed step, keep the work, offer Retry / Edit / Skip / Take over |
| A bot that won't hand off | A person on request, with the full context and the AI's actions |
| "I understand how frustrating this must be" | Acknowledge the situation, then act |
| A hedging paragraph, or a buried "can't" | The limit first, then one alternative |
| AI as the only path to a task | A complete manual path |
| Factual answers without retrieval | "No sources found", or scope the request down |
| A summary with no coverage or source links | "From N items, up to <time>", drilling down to source spans |
| Inferring people's appearance or identity | Asking for the attributes |
| Silent model changes | A short "what changed" note where the change shows |
| Following instructions found in content | Treat them as data and show they were ignored |
| Invisible background automations | One list where every agent and schedule can be paused or deleted |
| A branded name per AI feature | Plain verbs; a persona only for one product-level assistant |

## 7. Before building any AI feature
1. **Pattern:** the job is named, and the narrowest pattern (§1) is chosen. Chat only if the conversation is the product.
2. **Manual path:** the feature works fully with AI off or unavailable.
3. **Entry:** a verb on the object, in the selection toolbar and ⌘K, with its scope in the label or placeholder.
4. **States:**
   - idle
   - acknowledged (under 100ms)
   - specific progress
   - preview or streaming
   - result
   - partial or stopped
   - error with input kept
   - blocked with coaching
   - no sources
5. **Control:** dismiss, edit, try again, undo, and variations where taste matters.
6. **Autonomy:** a level per action. Reads run freely. Outward or irreversible actions get a review that names the verb, the payload, whether it can be undone, and the grant's scope. Hard limits are listed.
7. **Agents:**
   - a plan, Stop, Queue or Steer, takeover
   - an inbox, a time and cost range
   - recovery per step
   - activity entries naming the human who delegated
8. **Grounding:** claims cite passage-level sources. No retrieval, no answer.
9. **Disclosure:** once per AI-only surface, and per item where content mixes or leaves the product. Provenance on media. Never posing as a person.
10. **Data:** a point-of-use notice, memory that's visible and editable, a temporary mode, a global on/off.
11. **Voice:** answer first, no openers or praise, no feelings, the limit first, apologies only for real failures.
12. **Access and feedback:** live-region announcements, keyboard approvals, an AI cue that isn't colour alone, reduced motion, specific feedback reasons.
