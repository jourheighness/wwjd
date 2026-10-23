# Copy: labels, numbers, time, voice, messages

Product UI copy is labels, values and one-line states. Persuade and Editorial need full content: draft it in the register's voice and flag anything unconfirmed.

## Labels
- **Verb + target:** "Send invite to Anna", "Delete 5 items". The verb carries through: "Publish" → "Published". Never OK, Submit, Yes/No, Click here, Learn more, Get started (lint `banned-label`).
- **List items are names,** so lists scan and compare: ≤ ~5 words ("Guest seats", not "Free guest seats for clients who see shared projects"). A tail stays only when it is the difference ("5,000 runs a month"); other tails are explainers: cut, or move to a tooltip or comparison table.
- **Remove** takes it out of here (it exists elsewhere); **delete** destroys it.
- **Labels ≤ ~4 words;** legally required wording (the EU order button) is never shortened.
- **One term per concept,** from the product's glossary; no system words (status, event, tenant, entity). Codes and IDs as quiet secondary text. Settings describe the outcome, not the implementation.
- **Case:** sentence case; no uppercase labels; periods on sentences, not labels. "…" (the character) only on items that open further input.
- **Headings and links lead with the keyword,** never "Welcome to…"; screen titles name the thing, not "Overview" everywhere. **`<title>`** unique per route: "Object · Section · Product" (middle dots: a dash in a UI string reads as AI copy).

## Numbers and time
- **Progress:** a muted 11–12px label with the count, end-aligned above its bar.
- **Never:** pressure counts ("You're 60% done"), counts repeating a bar or list.
- **Format:** `Intl.*` in the app locale, never ad-hoc `toFixed`/`toLocaleString()` (lint `locale-format`); i18n plurals; round to the precision the decision needs; units joined with a non-breaking space ("30&nbsp;s").
- **Time:** relative for about the last week ("Today", "Fri"), absolute after; always absolute in logs, audits, anything sorted or compared, and on Editorial and Reference pages. Full timestamp with timezone in a tooltip.

## Voice
- Plain and direct; say each thing once. Warmth comes from PRODUCT.md's voice line (playful consumer, terse developer tool); the rules below hold in every voice.
- **AI tells, never:** em/en dashes in English UI strings (lint `ai-dash`); tricolons, signposting, hype; "not just X, but Y" and "X, not Y" tails; aphoristic fragments ("No setup. Just results.").
- **Buzzwords, never:** seamless, leverage, elevate, streamline, empower, supercharge, unlock, cutting-edge, robust, effortless, delve (lint `buzzword`).
- **Claims are checkable:** "3 rooms at this rate, updated 14:14"; never "Only 1 left!".
- **Localised UI is written natively** to the locale's style guide, never word for word.

## Messages
- **Errors:** what happened and how to fix it, at the field: "Enter a date as YYYY-MM-DD", not "Invalid date". No blame, "Oops", "Sorry", "please" or "!" (lint `oops`); codes and traces in details.
- **Success** is silent when the effect is visible, still announced (`role=status`); shown only for effects out of sight (autosave's quiet "Saved", add to cart, a toast for something elsewhere). Undo toasts: `rules/actions.md` § Defaults and undo. Error toasts never auto-dismiss.
- **AI** says in one sentence what it did and where.
- **Never cut** accessibility text (alt, `aria-label`, error announcements) or Floor text (SKILL.md § Floor, Honesty). Alt stands alone ("Revenue up 40% in Q4", not "Chart").
