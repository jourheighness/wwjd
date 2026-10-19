# Copy: labels, numbers, time, voice, messages

Product UI copy is labels, values and one-line states. Persuade and Editorial need full content: draft it in the register's voice and flag anything unconfirmed.

## Labels
- **Verb + target:** "Send invite to Anna", "Delete 5 items". The verb carries through: "Publish" → "Published". Never OK, Submit, Yes/No, Click here, Learn more, Get started (lint `banned-label`).
- **List items are names.** Feature, plan and setting lists name the thing in ≤ ~5 words ("Guest seats", not "Free guest seats, for clients who see only the projects you share"). A tail stays only when it is the difference ("5,000 runs a month"); any other tail is an explainer: cut it or move it to a tooltip or the comparison table. Owner, 2026-10-16: a better-looking pricing card lost on this alone.
- **Remove** takes it out of here (it exists elsewhere); **delete** destroys it.
- **≤ ~4 words.** Legally required wording (the EU order button) is never shortened.
- **One term per concept,** from the product's glossary; no system words (status, event, run, signal, tenant, entity). Codes and IDs as quiet secondary text. Settings describe the outcome, not the implementation.
- **Case:** sentence case; no uppercase labels; periods on sentences, not labels. "…" (the character) only on items that open further input.
- **Headings and links lead with the keyword,** never "Welcome to…"; screen titles name the thing, not "Overview" everywhere. **`<title>`** unique per route: "Object – Section – Product".

## Numbers and time
- **Progress label format:** label → number → bar: muted 11–12px label with the count, end-aligned above its bar.
- **Never:** pressure counts ("You're 60% done"), counts repeating a bar or list.
- **Format:** `Intl.*` in the app locale, never ad-hoc `toFixed`/`toLocaleString()` (lint `locale-format`); i18n plurals; `tabular-nums` where numbers align or change; round to the precision the decision needs; units joined with a non-breaking space ("30&nbsp;s").
- **Time:** relative for about the last week ("Today", "Fri"), absolute after; always absolute in logs, audits, anything sorted or compared, and on Editorial and Reference pages. Full timestamp with timezone in a tooltip.

## Voice
- Plain, direct, informed once.
- **AI tells, never:** em/en dashes in English UI strings (lint `ai-dash`); tricolons, signposting, hype; "not just X, but Y" and "X, not Y" tails; aphoristic fragments ("No setup. Just results.").
- **Buzzwords, never:** seamless, leverage, elevate, streamline, empower, supercharge, unlock, cutting-edge, robust, effortless, delve (lint `buzzword`).
- **Claims are checkable:** "3 rooms at this rate, updated 14:14"; never "Only 1 left!".
- **Localised UI is written natively** to the locale's style guide, never word for word.

## Messages
- **Errors:** what happened and how to fix it, at the field: "Enter a date as YYYY-MM-DD", not "Invalid date". No blame, "Oops", "Sorry", "please" or "!" (lint `oops`).
- **Empty:** one line plus one action; seeded examples may teach the first few times, then step aside.
- **Success** is silent when the effect is visible, still announced (`role=status`). Visible only for effects the person can't see: a quiet "Saved"/"Saving…" near the title for autosave (never a toast), add-to-cart confirmation, a toast for something elsewhere, the Undo toast after an edit in a work tool (`actions.md` Defaults and undo). Error toasts never auto-dismiss.
- **AI** says in one sentence what it did and where.
- **Never cut** accessibility text (alt, `aria-label`, error announcements); legal, consent, pricing and safety: SKILL.md Floor. Alt stands alone ("Revenue up 40% in Q4", not "Chart").
