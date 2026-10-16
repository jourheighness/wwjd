# Faux pas: the catalogue of UX mistakes

Mistakes both agents and people make, by category. Each line reads: **name**: symptom → why it hurts (evidence) → instead → detection [registers]. Items marked ★ are what AI agents produce by default.

Don't read this whole file. Jump to the categories for the work in hand. For a review, scan the ★ items in each category you touched.

## The 25 highest-impact ★ items
1. **Low-contrast grey text**: WebAIM26: 83.9% of pages, the #1 failure.
2. **Icon-only or empty buttons and links with no accessible name**: WebAIM26: 30.6% empty buttons, 46.3% empty links.
3. **Placeholder labels, or floating labels on the web, instead of real labels**: WebAIM26: 51% of pages missing labels.
4. **`div onClick` and hand-rolled controls instead of native/APG primitives.**
5. **Explainer, reassurance and narration copy.**
6. **Five actions per card, two filled primaries per region.**
7. **Centred everything, many left edges.**
8. **Template look**: purple accent, gradients, glass, glow, accent stripe.
9. **Identical icon-topped card grids and the stock section stack.**
10. **Invented proof**: stats, testimonials, logos.
11. **Generic "Invalid input" errors and premature as-you-type validation**: BAY: 98% lack adaptive errors.
12. **Submit disabled until the form is valid.**
13. **Hover-only actions unreachable on touch.**
14. **Missing or wrong `type`/`inputmode`/`autocomplete`.**
15. **Centred page spinner and spinner flash instead of skeletons.**
16. **Celebration toasts, plus auto-dismissing error toasts.**
17. **Layout shift**: images without dimensions, hover reflow, late banners.
18. **Content hidden until JS fade-up; fade-up on every section.**
19. **Keyboard covering inputs, `100vh` on mobile.**
20. **Chat: no Stop, auto-scroll yanking the reader, streaming markdown jumps.**
21. **Chat: blank composer or generic suggestion chips.**
22. **Chat: walls of reasoning/process text and over-formatted answers.**
23. **Chat: uncited claims plus a global "AI can make mistakes" disclaimer as the only safeguard.**
24. **Chat: a separate "✨ Ask AI" button instead of in-context work with keep/undo.**
25. **Pattern drift**: the same job built two ways in one app, one-off overrides at the call site.

**Legend**
- **Detection tags:**
  - `[static]` greppable in source
  - `[runtime]` checkable in a headless browser
  - `[visual]` needs screenshot judgement
  - `[review]` needs human or LLM reasoning
- **Registers:**
  - L Persuade
  - E Editorial
  - Doc Reference
  - P Operate
  - D Monitor
  - C Converse
  - S Transact
  - F Flow
  - M Native and mobile
  - \* all
- **Source shorthand:**
  - NNg = Nielsen Norman Group; BAY = Baymard (2025 checkout benchmark unless stated); WebAIM26 = WebAIM Million 2026
  - GOVUK = GOV.UK Design System; DD = deceptive.design; BUT = Butterick, Practical Typography
  - Krebs26 = adriankrebs.ch design-slop audit of 1,590 Show HN sites; AFD = Anthropic frontend-design
  - HM = impeccable anti-pattern registry; VWG = Vercel web-interface-guidelines
  - CWV = Core Web Vitals; APG = WAI-ARIA Authoring Practices Guide; conv = convention or expert consensus, no study
  - LukeW = Luke Wroblewski (form research); taste-skill = the taste-skill design rules; shapeof = shapeof.ai AI UX patterns; AI Elements = Vercel AI Elements
  - HIG = Apple Human Interface Guidelines; M3 = Material 3
  - wwjd = this skill's own rule, from design reviews; no external study

---

Sections: grep `^## ` and read only the ones you need.

## 1. Copy & content
- ★ **Explainer intro line**: "This page shows your projects" above the list → users read ~20–28% of words (NNg); the prose is skipped and pushes content down (wwjd) → delete it; let the heading and content carry it → [review] [P D L]
- ★ **Reassurance copy**: "Don't worry, nothing is lost / everything is private" → signals risk, adds reading (wwjd) → make the behaviour trustworthy, e.g. a quiet "Saved" mark → [static] [P C F]
- ★ **Vague CTA or link text**: "Learn more", "Get started", "Submit", "Click here" → no information scent; WCAG 2.4.4 link purpose → verb + object ("Download invoice") → [static] [*]
- ★ **Promotional buzzwords**: seamless, unlock, elevate, supercharge → NNg 1997: objective copy +27% usability, concise +58%, scannable +47%, all three +124% → concrete noun + number → [static] [L E]
- **System or internal vocabulary**: "tenant", "entity", "webhook config", org names in labels → breaks match with the real world (NNg heuristic 2) → users' words ("notifications", AFD) → [review] [P D]
- ★ **One concept, many words**: Delete/Remove/Trash, Sign in/Log in mixed → inconsistency is NNg app mistake #2 → glossary, one term → [static] [*]
- ★ **Title Case or ALL CAPS labels**: caps read slower; BUT allows caps only for under one line → sentence case → [static] [*]
- **"Please", "Sorry", "Oops", exclamation marks in errors**: GOVUK bans all of these; "please" implies choice → plain fact + fix → [static] [F P]
- **Blame or legal wording in errors**: "You forgot…", "illegal", "forbidden", "invalid" → GOVUK words to avoid → neutral instruction ("Enter…") → [static] [F]
- ★ **Em/en dashes and "X, not Y" tails in UI strings**: AFD names 'WORD — fragment' as a template tell (wwjd) → comma, full stop or rewrite → [static] [*]
- ★ **Aphoristic tagline fragments**: "No setup. Just results." → generated tell that says nothing (AFD) → one concrete sentence of what it does → [static] [L]
- **Filler-first headings and links**: "Welcome to…", "Information about…" → scanners read the first 2 words (NNg F-pattern) → keyword first → [review] [*]
- **Wall-of-text paragraphs in UI**: NNg: scannable copy +47% → chunk, ≤1 sentence per description → [visual] [Doc E P]
- **Ambiguous dates**: "03/04/26", no timezone → US/EU misread → relative for about the last week, absolute after that and always in logs, audits and anything sorted or compared; full timestamp with timezone in a tooltip → [static] [D P]
- ★ **Placeholder content shipped**: lorem, Jane Doe, Acme, "Coming soon" → App Store 2.1 rejects placeholder content; the layout can't be judged → realistic seeded data; hide unfinished sections → [static] [*]
- ★ **Invented proof**: made-up stats, testimonials, logos → FTC fake-reviews rule (in force Oct 2024) covers AI-written testimonials → real data, or drop the slot → [review] [L S]
- **Branded or clever feature names**: "Think carefully", "Magic" → NNg prompt-controls study: users can't predict the function → name by what it does ("Text to video") → [review] [C P]
- **Same status said twice**: "Draft" badge plus "Unpublished" text → noise (wwjd) → one marker → [visual] [P]
- **Three periods instead of "…", or missing "…" on items that open a dialog**: BUT; Apple/VWG convention → "…" character, only where more input follows → [static] [P]
- **Straight quotes in rendered prose**: BUT → curly quotes; straight marks only for feet/inches → [static] [E L]
- **Unit-less values**: "Size 12", "Timeout 30" → ambiguous → unit with a non-breaking space ("30&nbsp;s") → [static] [D P]
- **False precision**: "34.56789%" → slower reading, implied accuracy → round to the precision the decision needs → [static] [D]
- **Generic `<title>`**: "React App", or the same title on every route → WCAG 2.4.2; tabs and history can't be told apart → "Object – Section – Product" → [static] [*]
- **Generic page headings**: "Overview", "Dashboard" on every screen → weak scent, wayfinding fails → specific noun → [review] [P D]

## 2. Information architecture & navigation
- **Hidden primary navigation (hamburger) on desktop or mobile**: NNg: combo nav used 89% vs hidden 44% on mobile; desktop discoverability roughly halved → visible top nav on desktop, tab bar on mobile → [runtime] [L P M]
- ★ **Junk-drawer "More"/⋯ holding daily features**: NNg app mistake #9 → frequent actions visible, rare ones in ⋯ → [review] [P]
- **Org-chart IA**: menus mirror internal teams → users search by task (NNg) → task-based IA, validated by card sort or tree test → [review] [L P Doc]
- **Active location not shown, or colour-only**: WCAG 1.4.1; no wayfinding → weight + indicator + `aria-current` → [static] [*]
- **Broken Back button**: SPA steps, modals and filters missing from history → historically NNg's #1 web mistake → URL state, pushState per step → [runtime] [P S]
- **Links forced into new tabs**: `target=_blank` everywhere → breaks Back, disorients (NNg) → same tab; new tab only for help mid-form, with an icon and a label → [static] [*]
- **Unlabelled file links**: PDF or download looks like a page → NNg: PDFs unfit for screen reading → "(PDF, 2 MB)" in the link → [static] [Doc E]
- **Mega menu without hover intent**: opens on pass-through, closes on diagonal moves → NNg: ~0.3–0.5 s hover delay, safe triangle → hover intent + click to open → [runtime] [L S]
- **Logo not linking home**: breaks Jakob's law → logo = home → [static] [L S E]
- **Search hidden behind an icon on content-heavy sites**: NNg: users scan for an open box; ~27 characters wide → open field on desktop → [visual] [S Doc E]
- **Sticky header eating the viewport**: over ~15% of mobile height → hide on scroll down, show on scroll up; keep it slim → [runtime] [M E L]
- **Infinite scroll on goal-oriented lists**: footer unreachable, position lost on Back (NNg) → "Load more" or pagination, position restored → [runtime] [S E D]
- **Multi-row or wrapping tabs, tabs used as unrelated pages**: NNg tabs guidance → one row; overflow to "More"; tabs only for peer views → [visual] [P]
- **Breadcrumbs showing history instead of hierarchy**: NNg → hierarchy only; not the sole navigation → [review] [S Doc]
- **Login wall before any value**: BAY: 18% abandon over required accounts → browse and guest first, account after value → [runtime] [S L P]
- **Entry interstitials**: app-install or newsletter modal on arrival → Google penalises intrusive interstitials; NNg names popups the most-hated pattern → inline or small banner, after engagement → [runtime] [L E S M]
- ★ **Pattern switched mid-app**: two header anatomies, two drawer behaviours, two tooltips (wwjd) → one pattern per job; replace everywhere at once → [review] [*]
- **Orphan screens, dead ends, circular paths**: (wwjd) → flow map per goal → [review] [*]

## 3. Actions & affordance
- ★ **Five actions on a card**: (wwjd) → primary, secondary, ⋯ → [visual] [P D]
- ★ **Two or more filled primaries in a region**: no focal point (Von Restorff) → one filled button per region → [visual] [*]
- ★ **Ghost or outline button as the main CTA**: NNg: weak signifiers cost 22% more time and 25% more fixations → filled primary → [visual] [L P]
- **Clickable text with no signifier**: body links not underlined, colour-only → NNg flat-UI study; WCAG 1.4.1 → underline links in prose → [runtime] [E Doc]
- ★ **Status and metadata styled as pills or buttons**: invites dead clicks (wwjd) → dot + muted text → [visual] [P D]
- ★ **`div onClick` or span buttons**: no keyboard or semantics; WebAIM26 empty buttons 30.6% → `<button>`/`<a>` → [static] [*]
- ★ **Icon-only controls with no name or tooltip**: NNg app mistake #5; WebAIM26 empty links 46.3%, empty buttons 30.6% → `aria-label` + tooltip; labels on primary nav icons → [static] [P M C]
- **Destructive action beside confirm**: "Delete" next to "Save" → NNg app mistake #10 → separate spatially and by style; undo → [visual] [P F]
- ★ **Submit disabled until the form is valid**: users can't tell what is missing (VWG) → keep enabled; validate on submit and focus the first error → [runtime] [F]
- ★ **Hover-only actions**: ⋯ appears only on hover, so touch has none → visible on focus-within and after tap → [runtime] [P M]
- **Adjacent targets under 8 px apart on touch**: mis-taps; M3 spacing → gap ≥ 8 dp → [runtime] [M]
- **Dialog button order differs across dialogs**: platform conventions differ (macOS confirm-right) → follow the platform, keep it consistent → [visual] [P]
- **Double-click or long-press as the only path**: undiscoverable; WCAG 2.5.1 → single tap/click alternative → [review] [M P]
- **Drag-only reorder or resize**: WCAG 2.5.7 Dragging Movements (AA, new in 2.2) → menu or move buttons + keyboard → [review] [P D]
- **Slider for precise values**: NNg; GOVUK says avoid → number input (with stepper) or slider + input → [static] [F S]
- **Toggle that needs a separate Save**: NNg: toggles take effect immediately → checkbox + Save, or instant toggle → [review] [P]
- **Ambiguous toggle state label**: does "Off" describe the state or the action? → label the setting; state shown by position + text → [visual] [P]
- **Checkbox or radio label not clickable**: dead zones (VWG) → `<label for>` wraps the whole row → [static] [F]
- **Dropdown for 2–5 options**: options hidden, extra clicks → visible radios or a segmented control → [static] [F]
- **Bulk-select ambiguity across pages**: "Select all" selects only the page → banner "All 50 on this page selected · Select all 1,284" → [review] [D P]
- **Right-click-only context actions**: undiscoverable → mirror them in ⋯ → [review] [P]
- **Single-key shortcuts with no off switch**: WCAG 2.1.4 → modifier, or allow remapping/disabling → [static] [P]

## 4. Forms & input
- ★ **Placeholder as the only label**: NNg "placeholders are harmful"; WebAIM26 missing labels 51% → visible label above → [static] [F]
- ★ **Floating labels on the web**: label shrinks to tiny, low-contrast text and clips → static label above; native apps follow the platform (wwjd) → [static] [F]
- **Labels left-aligned far from the field**: eye-tracking (Penzo/LukeW): top-aligned labels are fastest → top-aligned → [visual] [F]
- **Multi-column forms**: fields get skipped (BAY) → one column; only short related pairs (postcode + city) share a row → [visual] [F S]
- **Only required fields marked, asterisk without a key**: BAY: 61% don't mark both; GOVUK: "(optional)" and no asterisks → mark optional, or mark both → [static] [F]
- ★ **Validation while typing the first characters**: premature errors (LukeW/Etre) → validate on blur, then live once the field is in error → [runtime] [F]
- **No inline validation at all**: BAY: 31% lack it; LukeW: +22% success, −42% completion time → per-field on blur → [runtime] [F]
- ★ **Generic error messages**: "Invalid input" → BAY: 98% lack adaptive errors; GOVUK → one message per failure type, worded from the label → [static] [F]
- **Error shown only by colour or only at the top**: WCAG 1.4.1, 3.3.1 → text at the field + summary list + icon → [runtime] [F]
- **Paste blocked**: password, email confirm, OTP → WCAG 3.3.8; NIST 800-63B-4 (2025) → allow paste and password managers → [static] [F]
- **"Confirm email/password" double fields**: WCAG 3.3.7 Redundant Entry; BAY extra fields → single field + show-password → [static] [F]
- **Password composition rules**: BAY: 65% of sites; NIST 800-63B-4 drops composition rules and periodic resets → length minimum + breached-list check + strength meter → [static] [F S]
- **Password rules shown only after failure**: forces a retry → rules visible before typing, ticked live → [runtime] [F]
- **`type=number` on IDs, cards, postcodes**: strips leading zeros, adds spinners, scroll changes the value → `inputmode="numeric"` + `type=text` → [static] [F]
- **Missing or wrong keyboard and autocomplete**: BAY: 54% of mobile sites miss optimised keyboards (older data); WCAG 1.3.5 → `type`, `inputmode`, `autocomplete` (`one-time-code`, `cc-number`, `street-address`) → [static] [F M S]
- **Split fields for phone, card, OTP or date**: paste and auto-advance break → one field with display formatting → [static] [F]
- **Calendar picker for a memorable date (birthdate)**: decades of scrolling → GOVUK: three text fields → [review] [F]
- **Rigid formats**: rejects spaces or dashes in phone and card numbers → Postel → accept, then normalise → [runtime] [F]
- **Mandatory first/last name split**: fails many naming cultures (W3C) → one "Full name" field unless needed → [static] [F]
- **US-shaped addresses**: required State/ZIP → country first, adaptive fields, lookup with manual fallback → [review] [F S]
- **Unexplained data requests**: phone with no reason → BAY: 49% don't explain → drop the field, or say why inline → [review] [F S]
- **Reset/Clear button next to Submit**: NNg: almost never wanted; destroys work → remove it → [static] [F]
- **Hidden character limits**: hard-truncated paste → GOVUK character count: show remaining, allow over-typing then error → [runtime] [F]
- **Textarea sized one line for long answers**: size signals expected length (GOVUK) → rows match the expected length; auto-grow → [visual] [F C]
- **200-country select with no type-ahead and no locale default**: → combobox with search; default from locale → [runtime] [F S]
- **CAPTCHA puzzles**: WCAG 3.3.8 bans cognitive tests (AA) → invisible risk scoring, passkeys, email link → [runtime] [F]
- **Two-step login without a username field**: password managers break → keep a field with `autocomplete=username` (hidden is fine) → [static] [F]
- **Visual order ≠ DOM order**: CSS `order`, grid placement → WCAG 2.4.3/1.3.2 → DOM order = reading order → [static] [*]
- **Autofocus on mobile**: keyboard pops and hides context (VWG) → autofocus only on desktop single-input views → [runtime] [M F]
- **Auto-dismissing or far-away validation toast**: NNg prompt-controls study: users retried blindly → persistent message next to the control → [runtime] [F C]
- **File limits revealed after upload**: NNg (Ernie, 10 MB case) → state type and size up front, validate client-side, per-file error and progress → [runtime] [F C]
- **Multi-step form loses data on Back or reload**: → persist every step; Back keeps answers → [runtime] [F]
- **Per-field "Apply" buttons**: BAY: 22% of sites → apply on change or blur → [static] [F S]
- **Wrong control for optional input**: BAY: 32% of sites → text field, or a collapsed "+ Add" → [review] [F]
- **Autocapitalise/autocorrect on email, username, code**: VWG → `autocapitalize="none"`, `spellcheck=false` → [static] [F M]

## 5. Feedback, states & errors
- **No pressed or active state**: click feels dead within 100 ms (NNg response limits) → visible pressed state ≤100 ms → [runtime] [*]
- ★ **Centred page spinner**: (wwjd) → skeleton that matches the final layout → [static] [P D]
- **Spinner flash under 200 ms**: HM → delay ~150–200 ms, then show for ≥300–400 ms → [runtime] [*]
- ★ **Success toast for a visible effect**: noise (wwjd) → silent success; toast only when the effect isn't visible → [static] [P]
- **Error toast auto-dismisses in 3 s**: unreadable; WCAG 2.2.1 → persistent until dismissed, inline where possible → [runtime] [P C]
- **Raw technical errors**: "TypeError…", "500", bare codes → NNg app mistake #3 → human sentence + action; code in details → [runtime] [*]
- **Silent failure of optimistic or autosave writes**: work lost, trust gone → rollback + inline error + retry → [runtime] [P]
- **No offline or slow-network state**: frozen UI → offline banner, queued writes, retry → [runtime] [M P C]
- **Refetch replaces content with a skeleton**: flashes on every poll → keep stale data, show a quiet refresh mark → [runtime] [D P]
- **Autosave with no status at all**: users can't tell it's saved (NNg heuristic 1) → quiet persistent "Saved"/"Saving…" near the title; never a toast → [runtime] [P]
- **Session timeout eats input**: WCAG 2.2.1 → warn, extend, preserve the draft → [runtime] [F P]
- **Status messages not announced**: WCAG 4.1.3 → `role="status"`, one phrase → [static] [*]
- **Skeleton forever on error**: no timeout → error + retry after a timeout → [runtime] [*]
- **Fake or stalling progress bar**: sits at 99%, jumps back → trust loss → honest determinate progress, named steps → [runtime] [P C]
- **One widget failure blocks the page**: → isolated error boundary per region → [runtime] [D P]

## 6. Layout & alignment
- ★ **Centre-aligned everything**: zig-zag reading (wwjd) → left-align; centre one moment → [visual] [*]
- ★ **Many left edges**: elements placed one at a time → 2–3 edges per page → [visual] [*]
- ★ **Cards in cards**: (HM; wwjd) → one containment level → [visual] [P D L]
- ★ **3- or 6-up identical icon cards**: Krebs26 "identical icon-topped cards" → rows, list or composed section → [visual] [L P]
- ★ **100vh centred hero**: HM; the mobile URL bar clips it → content-height hero, `dvh` → [static] [L]
- ★ **Same padding on every section**: monotone rhythm (HM) → vary by content; inter-section gaps larger than intra-section → [visual] [L]
- **Unbounded measure on wide screens**: lines over 90 ch (BUT 45–90) → `max-width` in ch; tables may go wide → [runtime] [E Doc P]
- **Horizontal scroll at 320 px or 400% zoom**: WCAG 1.4.10 Reflow → fluid layout → [runtime] [*]
- **Fixed-height boxes clip under text-spacing override**: WCAG 1.4.12 (line 1.5, letter 0.12em, word 0.16em) → min-heights, not heights → [runtime] [*]
- **Modal taller than the viewport, actions pushed off-screen**: → internal scroll body, sticky footer actions → [runtime] [P M]
- **Three fixed-width panes crush the main column at 1280**: → collapsible, resizable panes; container queries → [runtime] [P D]
- **Misaligned CTAs across sibling cards**: → subgrid, CTA pinned to the bottom → [visual] [L S]
- **Reserved empty slots ("—" for absent optional meta)**: (wwjd) → collapse, run text left; table cells keep "—" with accessible text "None" → [visual] [P D]
- **Avoidance aesthetic**: a stripped grey wireframe → fewer elements, stronger hierarchy → [visual] [*]
- **One-off component or className override at the call site**: (wwjd) → add a kit variant → [static] [P]

## 7. Visual hierarchy & colour
- ★ **No focal point, flat hierarchy**: squint test fails (conv) → one dominant element per view → [visual] [*]
- ★ **Default indigo/violet accent**: Krebs26 "VibeCode purple", traced to Tailwind's indigo-500 default → project accent → [static] [*]
- ★ **Gradient text, buttons or backgrounds**: Krebs26/HM top tell → flat colour, emphasis by weight → [static] [*]
- ★ **Coloured glow shadows**: Krebs26 → no resting shadow; elevation by surface step → [static] [*]
- ★ **Glassmorphism panels**: Krebs26 (frosted sticky nav excepted) → opaque surface step → [static] [*]
- ★ **Left/top accent stripe on cards**: Krebs26 → glyph + word, or a tone step → [static] [*]
- ★ **Low-contrast grey body text**: WebAIM26: 83.9% of home pages, the #1 failure; Krebs26 perma-dark grey → 4.5:1 minimum, 7:1 for running text → [runtime] [*]
- **Colour-only status**: ~8% of men have colour-vision deficiency; WCAG 1.4.1 → shape or glyph + word → [visual] [*]
- **Brand colour too light for text-bearing buttons**: white on yellow, orange or mint → WebAIM26 contrast → darker shade for text uses → [runtime] [L S]
- **Error red reused as brand or CTA red**: semantic collision → reserve red for needs-action → [review] [*]
- **Christmas tree**: every state coloured → (wwjd) → no signal, no colour → [visual] [D P]
- ★ **Untinted #000/#fff grounds by reflex**: (wwjd preference) → prefer tinted neutrals; pure white is allowed when the brand needs it → [static] [*]
- ★ **Perma-dark by default, ignoring `prefers-color-scheme`**: Krebs26 tell → follow the system setting when both themes ship; dark-only is a deliberate decision recorded in `DESIGN.md` → [runtime] [L P]
- **Theme flash on load**: wrong theme painted first → set theme and `color-scheme` before first paint → [runtime] [*]
- **`color-scheme` missing in dark**: native scrollbars and inputs stay white (VWG) → `color-scheme: dark` → [static] [*]
- ★ **Mixed icon libraries or stroke weights**: (HM) → one library, one weight → [static] [*]
- ★ **Emoji as icons or nav prefixes**: Krebs26 sidebar-emoji → one icon library or none → [static] [P D L]
- ★ **Hairlines plus border plus shadow on every card**: → space or one tone step → [static] [P]
- **Text over busy imagery with no scrim**: WCAG 1.4.3 → scrim, or text off the image → [visual] [L E]
- ★ **Focus ring removed, invisible or animated in**: WCAG 2.4.7; 2.4.13 (AAA) → one soft 2 px ring that appears instantly → [static] [*]

## 8. Typography
- ★ **Template fonts**: Inter everywhere, or Space Grotesk/Instrument Serif/Geist by default → Krebs26 font tells → the kit font, or a font chosen for the brief → [static] [L]
- ★ **Italic or coloured accent word in a headline**: Krebs26 "hero font mix"; AFD → one face, one colour → [static] [L]
- ★ **Uppercase tracked eyebrows over every heading**: AFD/Krebs26 → none, or fold into the heading → [static] [L P]
- ★ **Monospace for non-code labels**: AFD → text face + `tabular-nums` → [static] [*]
- **Body under 16 px on reading pages**: BUT: 15–25 px on the web → 16–20 px (dense product UI may use 13–14) → [static] [E L Doc]
- **Size mud**: 14/15/16 px used as hierarchy → ~5 roles with clear steps → [static] [*]
- **FOIT or font-swap shift**: invisible text, then layout jump → `font-display: swap` + metric-matched fallback (`size-adjust`) → [runtime] [*]
- **Faux bold/italic**: the weight was never loaded, so the browser synthesises it → load the real weights; `font-synthesis: none` → [static] [E L]
- **Justified text without hyphenation**: rivers of space (BUT) → ragged-right by default; justify only with hyphenation and a correct `lang` → [static] [E]
- **Underline used for emphasis**: reads as a link (BUT) → italic or weight → [static] [E Doc]
- **Bold + italic together, or bold whole paragraphs**: BUT → one emphasis, used sparingly → [static] [E]
- **Tracked lowercase, untracked caps**: BUT: 5–12% tracking on caps only → [static] [*]
- **Paragraph indent and paragraph spacing together**: BUT → pick one → [static] [E]
- **Headings skipped or faked**: `div.text-2xl` → WCAG 1.3.1; screen-reader navigation fails → real `h1`–`h6` in order → [static] [*]
- **Hard `<br>` in headlines**: breaks wrongly at other widths → `text-wrap: balance` → [static] [L]
- **vw-only font sizes, px root size**: WCAG 1.4.4; ignores the user's font setting → `clamp()` with `rem` → [static] [*]
- **Double spaces, "--", "..."**: (BUT; HM) → single space, real dash, "…" → [static] [E]

## 9. Motion
- ★ **Fade-up on every section**: Krebs26/AFD/HM tell → one orchestrated moment, or none → [static] [L]
- ★ **Bounce or elastic easing**: dated (HM) → ease-out curves → [static] [*]
- ★ **`transition: all`**: animates focus and layout (VWG) → list properties → [static] [*]
- ★ **`hover:scale-105` on every card**: (HM) → one hover signal (fill or colour) → [static] [L P]
- **Ignoring `prefers-reduced-motion`**: vestibular disorders; WCAG 2.3.3 → crossfade ≤150 ms → [static] [*]
- **Scroll-jacking or forced parallax**: NNg scrolljacking → native scroll → [runtime] [L E]
- **Auto-rotating carousel**: WCAG 2.2.2; Notre Dame data: ~1% click, 84% of those on slide 1 → static hero, or manual with pause → [runtime] [L S]
- ★ **Content invisible until JS animates it**: initial `opacity:0`; script fails, page is blank; delays LCP (taste-skill) → visible by default; enhance progressively → [static] [L]
- **Flashing more than 3 times per second**: WCAG 2.3.1 seizure risk → none → [runtime] [*]
- ★ **Count-up stat animations**: delays reading; screenshots show wrong values → render the final value → [static] [L D]
- ★ **Typewriter or rotating-word hero**: delays the message; screen readers repeat it → static text → [static] [L]
- **Animating width/height/top**: jank (VWG) → transform/opacity, FLIP → [static] [*]
- **Frequent UI animated over 300 ms, or keyboard actions animated**: → none or under 200 ms → [static] [P]
- **Perpetual pulse or ping loops**: attention theft → static marker → [static] [*]
- **Lottie or Three.js for a static effect**: heavy bundle (HM) → CSS/SVG → [static] [L]

## 10. Stability & performance perception
- ★ **Images and embeds without dimensions**: CLS; CWV threshold CLS ≤0.1 → width/height or `aspect-ratio` → [static] [*]
- **Late banners pushing content**: cookie bar, promo bar, ads → CLS and mis-taps → overlay, or a reserved slot → [runtime] [L E S]
- **Target moves under the pointer as content loads**: wrong click → reserve space; no insertion above the viewport → [runtime] [*]
- ★ **Lazy-loaded LCP hero**: HM: p75 720 ms vs 364 ms preloaded → `fetchpriority="high"`, no lazy above the fold → [static] [L]
- **Heavy hero video or 3D blocking LCP**: CWV LCP ≤2.5 s; Google: 53% of mobile visits abandon after 3 s → poster image, defer the media → [runtime] [L]
- **Slow interactions**: INP over 200 ms (CWV since Mar 2024) → break up long tasks, cheap controlled inputs → [runtime] [*]
- **Lists re-sorting under the pointer**: (wwjd) → sort only on explicit action → [runtime] [P D]
- **Hover changing border width or font weight**: reflow → colour/opacity only; reserve bold width → [static] [*]
- **Auto-refresh resets scroll, selection or open rows**: → merge updates in place → [runtime] [D]
- **Hydration flicker**: dates, theme or auth state flip after load (VWG) → render on the server consistently, or skeleton that region → [runtime] [*]
- **Live numbers jitter**: no tabular figures → `tabular-nums` → [static] [D]
- **Full navigation for a small change**: scroll and context lost → partial update, URL state → [runtime] [P]
- **No optimistic UI on frequent toggles**: round-trip lag → optimistic update + rollback → [runtime] [P]

## 11. Accessibility
- ★ **Missing alt text**: WebAIM26: 53.1% of pages → meaningful alt; `alt=""` for decoration → [static] [*]
- ★ **Missing form labels**: WebAIM26: 51% → `<label>` bound to each input → [static] [F]
- ★ **Empty links**: icon or logo links → WebAIM26: 46.3% → accessible name → [static] [*]
- ★ **Empty buttons**: WebAIM26: 30.6% → `aria-label` matching the tooltip → [static] [*]
- **Missing `lang`**: WebAIM26: 13.5%; inline phrases in another language unmarked → `<html lang>` plus `lang` on phrases → [static] [*]
- ★ **ARIA instead of native elements**: WebAIM26: pages with ARIA average 59.1 errors vs 42 without; 22% of `role=menu` uses broken → native first; no `role=menu` for site nav → [static] [*]
- ★ **Hand-rolled select, combobox, dialog or tabs**: no arrows, Esc or focus return (APG) → headless accessible primitive or kit component → [runtime] [P]
- **Focus hidden under sticky header or cookie bar**: WCAG 2.4.11 (AA, 2.2) → `scroll-padding-top`, non-overlapping chrome → [runtime] [*]
- **Modal focus not trapped or returned**: APG → `<dialog>`/`inert`, return focus to the trigger → [runtime] [P]
- **No skip link**: WCAG 2.4.1 → "Skip to content" → [static] [*]
- **Keyboard traps**: editors or embeds capture Tab → WCAG 2.1.2 → Esc releases focus → [runtime] [P Doc]
- **Hover/focus content not dismissible or hoverable**: tooltip vanishes when the pointer moves into it, no Esc → WCAG 1.4.13 → persistent while hovered; Esc closes → [runtime] [*]
- **Accessible name ≠ visible label**: `aria-label="btn-1"` on a "Send" button → WCAG 2.5.3; voice control fails → the name contains the visible text → [static] [*]
- **Orientation locked**: WCAG 1.3.4 → both orientations → [runtime] [M]
- **Video without captions, audio without transcript**: WCAG 1.2.2 → captions → [static] [L E]
- **Data table built from divs**: no `th`/`scope`, no `aria-sort` → semantic `<table>` → [static] [D]
- **Chart with no text alternative**: WCAG 1.1.1 → one-line summary + data table → [static] [D]
- **Help in a different place per page**: WCAG 3.2.6 Consistent Help (A) → fixed location → [review] [P S]
- **Image and title link to the same URL**: two tab stops, duplicate announcements → one link wrapping both, or `tabindex=-1` on the image → [static] [S E]
- **Accessibility overlay widgets**: don't fix the source; FTC fined accessiBe $1M (2025) for deceptive claims → fix the markup → [static] [*]
- **Legal floor ignored**: European Accessibility Act enforceable since 28 Jun 2025 for EU e-commerce and services (EN 301 549 / WCAG AA) → AA as the release gate → [review] [S P]

## 12. Trust, privacy & dark patterns
- **Drip pricing, hidden costs**: BAY: 40% abandon over extra costs; FTC junk-fees rule (May 2025, tickets and lodging); DD → all-in price early, shipping estimator → [review] [S]
- **Sneaking into basket**: add-ons pre-added → DD; EU CRD Art. 22 bans pre-ticked paid extras → opt-in only → [runtime] [S]
- **Pre-ticked consent**: marketing or data sharing → CJEU Planet49 (2019): invalid consent → unchecked by default → [static] [F S]
- **Hard to cancel ("roach motel")**: FTC v. Amazon (Prime "Iliad" flow): $2.5B, Sep 2025; ROSCA; DE cancel button (2022) → cancel online in as few steps as sign-up → [review] [P S M]
- **Hidden subscription or silent trial conversion**: DD; ROSCA → terms at sign-up, reminder before the charge → [review] [P S]
- ★ **Confirmshaming**: "No thanks, I hate saving money" → DD → neutral "No thanks" → [static] [L S]
- **Trick wording, double negatives**: "Uncheck to not receive" → DD → positive opt-in wording → [static] [F]
- **Asymmetric consent banner**: bright Accept, reject buried on layer two → Nouwens 2020: only 11.8% of consent tools met the GDPR minimum; removing first-page reject raised consent 22–23 pp; CNIL fined Google €150M/Facebook €60M (2022) → equal-weight Accept/Reject on layer one → [visual] [*]
- **Fake urgency timers that reset**: DD; EU 2022 sweep: 148 of 399 shops manipulative → real deadlines only → [runtime] [S L]
- **Fake scarcity or activity**: "Only 2 left", "14 viewing" → Mathur 2019: 1,818 dark-pattern instances on 11.1% of 11K shops → real stock data only → [review] [S]
- **Fake social proof**: fabricated or AI-written reviews and testimonials → FTC rule (2024) → real, attributed → [review] [L S]
- **Nagging**: repeat prompts, permission re-asks → DD; Mozilla: ~99% of notification prompts not accepted → ask once, in context → [runtime] [*]
- **Forced action**: account, contacts or app install demanded first → BAY: 18% abandon → guest path → [review] [S M]
- **Obstruction of export or deletion**: App Store 5.1.1(v) requires in-app deletion; GDPR Art. 17/20 → self-serve in settings → [review] [P M]
- **Disguised ads**: sponsored results unlabelled → DSA Art. 26; FTC native-ad guidance → visible "Sponsored" → [visual] [E S]
- **Comparison prevention**: tiers in non-comparable units → DD → comparison table, unit prices → [review] [S L]
- **Addictive loops**: autoplay feed, streak guilt → DSA Art. 25/28 (minors); EU Digital Fairness Act proposal expected late 2026 → natural stopping points → [review] [M E]
- **Currency confusion**: credits or gems hide the real price → DD; EU CPC principles on in-game currency (2024) → show real money → [review] [M]
- **Bait-and-switch close**: "×" that triggers the action → DD → close only closes → [runtime] [*]
- **Permission prompts at launch**: camera, location, push → Mozilla: <3% accept; Apple purpose strings → just-in-time, after intent, with a reason → [runtime] [M P]
- **Over-collection at sign-up**: GDPR data minimisation → ask only what's used now → [review] [F]
- **Privacy-hostile defaults**: data sharing ON → GDPR Art. 25 (privacy by default) → OFF by default → [review] [P]
- **Card fields not visually set apart**: BAY: 19% abandon over distrust of the site with card data; encapsulated fields read as secure → distinct card fieldset → [visual] [S]
- **No real company identity**: Stanford credibility guidelines (Fogg) → address, people, contact → [review] [L S]
- **Stock or AI images passed off as the client's own**: taste-skill; EU AI Act Art. 50 labelling (from Aug 2026) → real, or disclosed → [review] [L S]

## 13. Onboarding & empty states
- **Swipe-through tutorial deck on first launch**: NNg: skipped and forgotten → contextual hints at the moment of use → [runtime] [M P]
- **Coach marks everywhere at once**: → one hint, in context, dismissable forever → [runtime] [P]
- **Long setup wizard before value**: delays time-to-value → defaults; ask only what only the user knows → [review] [P]
- **Persona questions that change nothing**: wasted steps → ask only if the answer branches the product → [review] [P]
- **Empty dashboard of zeros and empty axes**: → a secondary region may collapse; one line + one action (import, example content) → [visual] [D P]
- **Illustration + "Nothing here yet" with no action**: → one action → [visual] [P]
- **Email verification before any use**: friction → let them use it; verify before risky actions → [review] [P]
- **Pressure checklists**: "You're 40% set up" → (wwjd) → named steps with a done mark → [visual] [P]
- **Welcome or "What's new" modal on login**: blocks the work; nagging → inline dot or changelog link → [runtime] [P]
- **Onboarding shown again after dismissal, or per device**: → persist per person, server-side → [runtime] [P M]

## 14. Search & filtering
- **No typo, synonym or plural tolerance**: BAY 2026: 56% of sites mediocre or worse at search; older data: 31% of search-driven product-finding tasks failed → fuzzy matching, synonyms, stemming → [runtime] [S Doc P]
- **Zero-results dead end**: → echo the query, suggest a fix, keep the query in the field → [runtime] [S Doc]
- **Search field too narrow**: query truncated (NNg ~27 characters) → wide field → [visual] [S Doc]
- **Ambiguous search scope**: → default to the whole site; scope chip removable → [review] [P Doc]
- **Autocomplete highlights the typed part**: BAY → highlight the completion; ≤8–10 suggestions; no reordering while typing → [runtime] [S]
- **Every filter tap reloads and resets scroll on mobile**: BAY → batch-apply on mobile ("Show 42 results"), live on desktop → [runtime] [S D]
- **Active filters invisible, no clear-all**: (conv) → chips + clear all → [visual] [S D]
- **Facets with 0 results offered**: → hide them, or show the count → [runtime] [S]
- **Results lost on Back from detail**: (VWG) → restore query, filters and scroll → [runtime] [S D]
- **Only generic filters (price, brand)**: BAY: category-specific attributes matter → per-category facets → [review] [S]
- **Long facet lists without search**: → top ~10 + "Show all" + in-facet search → [runtime] [S]
- **No match highlighting or snippet in results**: → highlighted snippet → [visual] [Doc E]
- **Docs search missing ⌘K / Ctrl+K, headings or code**: → ⌘K / Ctrl+K or "/" (which can be turned off), index headings and code → [runtime] [Doc]
- **Search, sort and filters on short lists**: (wwjd) → none → [visual] [P]

## 15. Data display & charts
- **Truncated bar axis, dual axes, a donut or pie over 3 parts, 3D**: → integrity rules → [static] [D]
- **Rainbow/jet colormap**: perceptually non-uniform, bad for colour-blind readers (Borland & Taylor 2007) → perceptual sequential ramp → [static] [D]
- **Red/green-only diverging scale**: ~8% of men can't tell them apart → blue/orange + direction glyph → [static] [D]
- **Legend far from marks**: (conv) → direct labels → [visual] [D]
- **Numbers left-aligned or misaligned in tables**: → right-align numbers, `tabular-nums`; left-align text → [static] [D]
- **Long table without sticky header, wide table without frozen first column**: → sticky header + first column → [runtime] [D]
- **Values only in tooltips**: touch and a11y lose them → direct-label the key values → [review] [D]
- **No unit, period or timezone on the chart**: → in the title or axis → [review] [D]
- **Sparkline without scale context**: → min/max or baseline marker → [review] [D]
- **Curved interpolation implying data between points**: `curveNatural` overshoots → linear or step for discrete data → [static] [D]
- **Stacked areas for comparing upper series**: unreadable → small multiples → [review] [D]
- **Percent change without a base**: "+300%" → show the absolute value or denominator → [review] [D]
- **More than 7 categorical hues**: indistinguishable → top N + "Other" → [static] [D]
- **Sort or pagination resets on refresh; no sort indicator**: → persistent sort, `aria-sort` → [runtime] [D]
- **Chart grow-in animation**: → none; animate data transitions only → [static] [D]

## 16. Chat / AI interfaces
- ★ **Blank composer with no hints**: NNg: capabilities hidden; articulation barrier → suggestions grounded in the current context, then step aside → [visual] [C]
- ★ **Generic suggestion chips**: "Tell me a joke", "What can you do?" → no context → derive from the open object or data → [review] [C]
- ★ **No Stop, or Stop discards the partial answer**: user control (NNg heuristic 3; shapeof "Controls") → Stop replaces Send in place; keep the partial → [runtime] [C]
- ★ **Auto-scroll yanks the reader during streaming**: → stick to bottom only if already at bottom; "Jump to latest" otherwise → [runtime] [C]
- ★ **Streaming markdown jumps**: unclosed fences flicker, tables reflow → incremental renderer with a stable block layout → [runtime] [C]
- **Fake typing delay, bot posing as human**: deception; EU AI Act Art. 50 disclosure (from Aug 2026) → instant output, AI disclosed → [review] [C]
- ★ **Global "AI can make mistakes" as the only hallucination handling**: NNg: becomes clutter → caveat where it matters; first-person uncertainty ("I'm not sure") → [review] [C]
- ★ **Uncited claims, or citations that don't map to a passage**: NNg: drill-down sources, though sources can create false trust → inline citation + hover preview of the passage → [runtime] [C Doc]
- **Regenerate overwrites the previous answer**: shapeof Branches/Variations → keep versions, switch between them → [runtime] [C]
- **Editing an earlier prompt silently drops later turns**: → visible branch → [runtime] [C]
- **Code block without copy, or copy includes line numbers**: → copy button, clean payload → [runtime] [C Doc]
- ★ **Reasoning or tool logs expanded by default**: receipts (wwjd) → live one-line status while running (CHI 2026: intermediate feedback raises perceived speed and trust); collapse to an opt-in summary after → [visual] [C]
- **Agent performs irreversible or external actions without preview**: shapeof Action plan/Verification; AI Elements Confirmation → approval only for irreversible or outward actions → [review] [C]
- **Approval prompt for every read-only step**: confirmation fatigue → auto-approve reads, batch the rest → [review] [C]
- ★ **Chat as the only UI for structured tasks**: dense prose for data (NNg prompt-controls) → render tables, forms and cards inline; keep GUI controls → [review] [C D]
- ★ **Over-formatted answers**: headings and bullets for a one-line answer → length matched to the question; a "Shorter" control (NNg prompt structure) → [review] [C]
- ★ **Sycophantic openers**: "Great question!" → Stanford study (Science, 2026): users trusted sycophantic answers more and came away worse off → neutral, direct → [static] [C]
- ★ **Engagement-bait endings on every reply**: "Want me to…?" → nagging → offer a next step only when actionable → [review] [C]
- **Novel icons (wand, broom, sparkles) unlabelled**: NNg prompt-controls study → standard icons + label or tooltip → [visual] [C]
- ★ **Separate "✨ Ask AI" button instead of in-context work**: (wwjd) → AI acts where the work is; keep/undo there → [review] [C P]
- **Model picker exposing code names**: jargon → auto-routing; plain labels if a picker exists → [review] [C]
- **Mid-stream error wipes the answer**: "Something went wrong" → keep the partial; retry from there → [runtime] [C]
- **Enter/Shift+Enter inconsistent; mobile return sends**: → desktop Enter sends; mobile return = newline + send button → [runtime] [C M]
- **Composer that never grows, or grows over the thread**: → auto-grow to about 8 lines, never more than ~40% of the viewport, then scroll → [runtime] [C]
- **Context or quota hit with no warning**: shapeof cost estimates; AI Elements Context → near-limit indicator → [runtime] [C]
- **Invisible memory**: the model remembers without saying → shapeof Memory/Data ownership; GDPR → viewable, editable memory; incognito mode → [review] [C]
- **50 conversations titled "New chat"**: → auto-title from content; searchable history → [runtime] [C]
- **Thumbs-down opens a mandatory survey modal**: nagging → optional inline reason → [runtime] [C]
- **Bursty or too-fast streaming**: unreadable → smoothed token pacing → [runtime] [C]
- **Numeric confidence % on everything**: NNg: false precision, over-trust → High/Medium/Low, only where stakes are high → [review] [C]
- **Anthropomorphic persona for a tool**: name, face and feelings inflate trust (conv; shapeof Identifiers) → minimal identity → [review] [C]
- **Undisclosed training on user content**: opt-out buried → trust loss (shapeof Data ownership) → clear setting at first use → [review] [C]

## 17. Mobile & touch
- **Targets under 44 pt / 48 dp**: Apple HIG 44 pt; M3 48 dp; WCAG 2.5.8 24 px minimum → pad hit areas → [runtime] [M]
- **Inputs under 16 px**: iOS zooms on focus (VWG) → ≥16 px on touch → [static] [M F]
- **Zoom disabled**: `user-scalable=no`, `maximum-scale=1` → WCAG 1.4.4 → never → [static] [M]
- **Safe areas ignored**: fixed bottom bar under the home indicator, content under the notch → `viewport-fit=cover` + `env(safe-area-inset-*)` → [runtime] [M]
- ★ **Keyboard covers the focused input or CTA**: BAY: the keyboard takes ~40% of the screen → `visualViewport`/`interactive-widget=resizes-content`, scroll the field into view → [runtime] [M F C]
- ★ **`100vh` clipped by browser chrome**: → `dvh`/`svh` → [static] [M]
- **Primary actions in top corners**: Hoober: ~49% of use is one-handed → frequent actions in the bottom thumb zone → [visual] [M]
- **Swipe-only actions**: swipe to delete with no button → WCAG 2.5.1; undiscoverable → visible control; gesture as a shortcut → [review] [M]
- **Carousel swallows the system back-swipe**: → leave edge gestures alone → [runtime] [M]
- **Horizontal scroller without a peek**: no affordance → show part of the next card → [visual] [M S]
- **Body scrolls behind a sheet**: scroll chaining (VWG) → `overscroll-behavior: contain`, scroll lock → [runtime] [M]
- **Sheet without handle, swipe-down or Esc**: → drag-to-dismiss + close → [runtime] [M]
- **Pull-to-refresh hijacked or firing inside lists**: → native defaults; contain inner scrollers → [runtime] [M]
- **App-install interstitial**: Google intrusive-interstitial penalty → small smart banner → [runtime] [M]
- **Native long-press replaced (copy/select)**: NNg (ChatGLM case) → keep "Select text" → [runtime] [M C]
- **Desktop table squeezed onto a phone**: horizontal scroll with no cue → priority columns or card rows; sticky first column → [runtime] [M D]
- **Dense inline links**: mis-taps → spacing, or a list → [visual] [M E]
- **`alert()` for messages**: → kit inline message or sheet → [static] [M P]
- **Thin web-wrapper app**: App Store 4.2 minimum functionality → native value → [review] [M]
- **No in-app account deletion**: App Store 5.1.1(v), since 2022 → settings path → [review] [M]
- **Branded splash held for seconds**: Apple HIG: the launch screen should mirror the first screen → instant skeleton of the first screen → [runtime] [M]

## 18. E-commerce & checkout
- **Guest checkout not the most prominent option**: BAY: 62% of sites; 18% abandon over forced accounts → guest first, account after purchase → [visual] [S]
- **Total cost unknown until late**: BAY: 40% abandon over extra costs, 12% can't calculate the total → estimator on cart and product page → [review] [S]
- **Bloated checkout**: BAY: 23.48 form elements on average vs 12–14 ideal; 17% abandon for length → cut 20–60% of fields → [static] [S F]
- **Shipping speed instead of delivery date**: BAY: 48% → "Arrives Fri 18 Oct" → [static] [S]
- **Static cutoff time**: BAY: 83% → real countdown ("Order within 3 h for Friday") → [static] [S]
- **Quantity as a text field or dropdown only**: BAY: 97% → stepper + input → [visual] [S]
- **Missing fulfilment options at shipping selection**: BAY: 52% → pickup and delivery in one selector → [review] [S]
- **Prominent coupon field**: sends users off to hunt for codes (BAY) → collapsed "Have a code?" link → [visual] [S]
- **Billing address not defaulting to shipping**: BAY; retyping on mobile is costly → "Same as shipping" pre-checked → [runtime] [S]
- **Card-type dropdown**: BAY → auto-detect from the card number → [static] [S F]
- **Too few payment methods, no express wallets**: BAY: 9% abandon → Apple/Google Pay, local methods → [review] [S]
- **Returns policy hidden**: BAY: 13% abandon → link near price and CTA → [review] [S]
- **Too few product images, no scale reference, no zoom**: BAY: images are most users' first action on the product page → many images, in-scale shots, zoom → [visual] [S]
- **Unavailable variants not marked**: error appears after selection → cross out at selection → [runtime] [S]
- **Variants hidden in dropdowns**: unlabelled swatches → visible buttons/swatches with names → [visual] [S]
- **Add-to-cart gives no feedback, or redirects to the cart**: BAY → inline confirmation or mini-cart drawer; stay on the page → [runtime] [S]
- **EU prices shown ex-VAT; strikethrough without a real prior price**: EU Price Indication Directive Art. 6a (lowest price in prior 30 days) → VAT-inclusive, lawful reference price → [review] [S]
- **Only positive reviews; no sort by lowest**: users seek negatives (BAY) → full distribution + sort by rating → [review] [S]
- **Infinite scroll on product lists**: BAY → "Load more" hybrid → [runtime] [S]
- **Non-linear checkout**: steps jump or branch → BAY: keep checkout linear → [review] [S]
- **Upsell modal between cart and checkout**: interrupts → small inline cross-sell → [runtime] [S]
- **Thin order confirmation**: no summary, delivery date or next step → peak-end; the result screen (conv) → full summary + tracking → [review] [S]
- **Cart not persisted across sessions/devices; remove without undo**: → persist + undo → [runtime] [S]

## 19. Editorial, long-form & docs
- **Sticky share bars covering text**: → inline share at the end, or none → [runtime] [E]
- **Newsletter modal on arrival or mid-article**: NNg popups; Google interstitials → inline sign-up at the end → [runtime] [E]
- **Floating autoplay video over text**: → click-to-play inline → [runtime] [E]
- **Metered paywall sprung mid-read**: → state the meter before the article → [review] [E]
- **No byline, published or updated date**: Fogg credibility; docs staleness → visible date and author → [static] [E Doc]
- **Articles split over pages for ad views**: → single page → [runtime] [E]
- **Long text without headings or TOC**: → scannable headings; "On this page" for long docs → [review] [E Doc]
- ★ **Pull quote or intro sentence as giant display type**: AFD/taste-skill tell → body size; one real quote at most → [visual] [E L]
- **Footnotes without back-links**: → bidirectional links or sidenotes → [static] [E Doc]
- **Thin serif body in dark mode**: hairlines break up; light-on-dark reads thinner → weight up slightly, add line-height → [visual] [E]
- **No print stylesheet for long reads and docs**: → `@media print` → [static] [E Doc]
- **Docs code samples**: no language tabs, tab choice not remembered, placeholders not marked → persistent language preference; highlighted `<placeholders>` → [runtime] [Doc]
- **Anchor links land under the sticky header**: (VWG) → `scroll-margin-top` → [runtime] [Doc L]
- **Docs version mismatch hidden**: → version switcher; banner on old versions → [review] [Doc]
- **API reference with no examples**: → a request/response example per endpoint → [review] [Doc]

## 20. Landing & marketing
- ★ **Vague hero promise**: "The future of work" → NNg: visitors leave in 10–20 s without a clear value → what it is, for whom, in large type → [review] [L]
- ★ **Template section stack**: hero, logos, 3 features, testimonial, pricing, CTA → AFD/taste-skill tell → argument-ordered sections → [review] [L]
- ★ **Centred Inter hero with a pill badge above the H1**: Krebs26 (22% of Show HN sites carry 4+ tells) → left-anchored, no badge → [static] [L]
- ★ **Fabricated stat banner or logo strip**: Krebs26 stat-banner → real numbers or no slot → [review] [L]
- ★ **Numbered 1-2-3 "how it works" row**: Krebs26 → only for true sequences → [static] [L]
- ★ **FAQ accordion bolted on the end**: Krebs26; hidden text defeats Ctrl+F → answer objections in place; `<details>`/`hidden=until-found` if used → [static] [L]
- **Four CTAs in the hero**: "Start trial", "Book demo", "Watch video", "Docs" → one primary + one quiet secondary → [visual] [L]
- ★ **Re-drawn browser or phone chrome, fake grey-bar dashboard**: HM/AFD → real screenshot → [static] [L]
- **Self-serve pricing hidden behind "Contact sales"**: comparison prevention (DD) → public prices; enterprise line only → [review] [L]
- **Annual-only toggle by default with a monthly-equivalent price**: preselection; misleading → label "billed annually", show both → [review] [L S]
- **More than 4 tiers or a fake "Most popular"**: choice overload → 3 tiers + enterprise line; honest highlight → [review] [L]
- **Chat widget pops open after 5 s**: covers content; interruption → closed launcher → [runtime] [L S]
- **Exit-intent or scroll-triggered popups**: NNg → inline offer → [runtime] [L E]
- **Trial form asking company size, phone, role**: → email (+ password/SSO) only → [review] [L F]
- **Testimonials without name, role or photo**: credibility → attributed and real → [review] [L]
- ★ **Aurora blobs, floating orbs, decorative 3D**: HM → none; real imagery → [static] [L]
- **"Scroll to explore" bouncing chevron**: → none → [static] [L]

## 21. Dashboards & data-dense
- **KPI tile without comparison**: no period, delta or target → delta vs period + sparkline → [review] [D]
- ★ **Twelve equal KPI tiles**: no focal point, vanity metrics → 3–5 decision metrics, one lead → [visual] [D]
- **No data freshness**: "Updated 3 min ago" missing → relative timestamp per source → [static] [D]
- **Global filter or date range not visible per chart**: wrong reads → persistent filter bar; chips on affected charts → [visual] [D]
- **Dead-end tiles**: no drill-down → click through to the filtered list → [runtime] [D]
- **Raw IDs or codes as primary info**: NNg app mistake #8 → human names; IDs as quiet secondary → [review] [D P]
- **Everything red**: alert fatigue (wwjd) → act/attend bands only → [visual] [D]
- **No export on tables**: power-user dead end → CSV/clipboard export → [review] [D]
- **Inconsistent abbreviations**: 1.2K / 1,200 / 1.2k → one `Intl` compact format → [static] [D]
- **A modal for every row edit**: NNg app mistake #7, modal overuse → inline edit or drawer → [runtime] [D P]
- **Lonely chart in dead space; oversized heatmap**: (wwjd) → balanced grid → [visual] [D]

## 22. Notifications & interruptions
- **Push permission prompt on page load**: Mozilla: 1.45B prompts/month, ~99% not accepted, 48% denied; Firefox 72 requires a user gesture → ask in context, after intent → [runtime] [*]
- **Marketing pushed into the red badge**: pressure; nagging (DD) → badge or dot only for needs-you → [review] [P M]
- **Notification without a deep link**: → open the exact object → [runtime] [P M]
- **All-or-nothing notification settings**: users switch everything off → per type × channel; digest option → [review] [P M]
- **Unsubscribe needs login or several steps**: Gmail/Yahoo 2024 bulk-sender rules require one-click (RFC 8058) → one-click → [review] [*]
- **Modal surveys or NPS mid-task**: NNg modal overuse → after task completion, non-modal → [runtime] [P]
- **Same alert duplicated across email, push and in-app**: → dedupe; mark read across channels → [review] [P]
- **Marked read on view**: "looking never changes anything" (wwjd) → read on explicit open; "Mark unread" → [runtime] [P]
- **No snooze or mute per thread**: → snooze/mute → [review] [P M]
- **Toasts covering the composer or primary CTA**: → place away from the work area → [runtime] [P C]

## 23. i18n / localization
- **Concatenated strings**: `"You have " + n + " items"` → grammar breaks in other languages → ICU MessageFormat → [static] [*]
- **Plural by `n === 1`**: → `Intl.PluralRules`/i18n plural → [static] [*]
- **Hardcoded date, number or currency formats**: → `Intl.*` with locale → [static] [*]
- **Fixed-width text containers**: IBM: strings under 10 characters can grow 200–300% in translation → content-sized, min-width → [runtime] [*]
- **Flags as the language picker**: flags are countries, not languages (W3C) → language names in their own language ("Svenska") → [static] [*]
- **Geo-IP forced locale**: → suggest, never force; remember the choice → [runtime] [*]
- **Physical CSS directions**: `margin-left`, `left` → breaks RTL → logical properties, `dir="auto"` on user text → [static] [*]
- **Directional icons not mirrored in RTL**: → mirror back/next arrows → [runtime] [*]
- **Naive string sort**: Å/Ä/Ö sorted wrongly in Swedish → `Intl.Collator(locale)` → [static] [*]
- **Text baked into images**: untranslatable → live text → [static] [L]
- **Hardcoded week start or 12/24 h clock**: → from locale → [static] [D P]
- **Font missing glyphs for target scripts**: tofu, or mixed fallback faces → subset check per locale → [runtime] [*]
- **Brand names auto-translated**: (VWG) → `translate="no"` → [static] [*]
- **Phone input assuming one country**: → libphonenumber, E.164, country picker → [static] [F]
- **Machine-translated UI**: word-for-word phrasing (wwjd) → native review → [review] [*]

## 24. Settings & preferences
- **Mixed save models on one page**: some instant, some need Save → NNg toggle guidance → one model: instant + undo → [runtime] [P]
- **Preferences not persisted**: theme, density, columns, panel widths → (wwjd) → per person, server-side → [runtime] [P D]
- **Theme default ignores the system setting**: → "System" default → [runtime] [*]
- **Dangerous settings mixed with benign ones**: → separate "Danger zone"; real-choice sheet for irreversible actions → [visual] [P]
- **Endless settings scroll or 20 tabs, no search**: → grouped sections + settings search → [review] [P]
- **Labels describe implementation**: "Enable webhook retries" → describe the outcome → [review] [P]
- **Negative toggles**: "Disable notifications" ON → double negative (DD trick wording) → positive phrasing → [static] [P]
- **Change needs a reload, or shows no effect**: → apply live; preview where possible → [runtime] [P]
- **Preferences scattered**: across profile, settings and ⋯ → one settings home; ⌘K / Ctrl+K reaches each → [review] [P]
- **No reset, no marking of non-default values**: → "Reset to default" per section → [review] [P]
- **Settings modal loses edits on outside click**: → autosave, or keep the draft → [runtime] [P]

---
