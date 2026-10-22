# Flow patterns per product type

Grep `### <type>` and read only that block. Keys: **Journeys** the core journeys (goal in brackets) · **Entries** where people arrive · **Must** what the flow needs · **Don't** (never this → instead). Types match `../../ux/references/product-types.md`; the general rules: `../rules/flows.md`.

### Across all types
- **Journeys:** the top job (shortest path), its undo, first use, recovery (lost password, failed payment, no permission).
- **Must:** every record reachable from a list and a search; every notification and email lands on the thing it names; settings reachable from everywhere, returning to where you were.

### Admin / back-office
- **Journeys:** find a record → fix it [record correct, logged]; bulk edit [n changed, undoable]; grant access [person can sign in].
- **Entries:** lookup by ID from anywhere; queue links from alerts.
- **Must:** list → detail keeps the list in view; refund, delete and impersonate pass a review with a reason.
- **Don't:** edit modal stacked on a modal → a drawer over the list.

### CRM / sales pipeline
- **Journeys:** work today's follow-ups [next step set]; move a deal [new stage, next step]; import contacts [deduped, merged].
- **Entries:** the follow-up queue; links in reminder emails; the record from a calendar event.
- **Must:** every deal ends a step with a next step; import has a merge preview before it writes.
- **Don't:** stage change that forgets the next step → ask for it in place.

### Project and task management
- **Journeys:** capture a task [in the right list]; work my tasks [done]; plan a cycle [scoped, assigned].
- **Entries:** quick add from anywhere; mention notifications; shared links.
- **Must:** a task opens in place over its list; done is one action with Undo.
- **Don't:** a separate create page → inline add in the list it belongs to.

### Calendar / scheduling / booking
- **Journeys:** book a slot [confirmed, in calendar]; reschedule [new time, old freed]; cancel [freed, notified].
- **Entries:** booking link; the invite email; the reminder.
- **Must:** time zone shown before the pick; reschedule and cancel from the confirmation and the reminder, each no deeper than booking.
- **Don't:** account before choosing a time → pick first, details after.

### E-commerce storefront and checkout
- **Journeys:** find → product → cart → pay [order confirmed]; return [refund started]; track [where it is].
- **Entries:** search, category, campaign links, the order email.
- **Must:** guest checkout; total with shipping and fees before the pay step; failed payment returns to payment with the cart kept; return starts from the order, not from support.
- **Don't:** account wall before pay → guest, offer an account after; surprise fees at the last step → shown at the cart.

### Subscriptions and billing
- **Journeys:** choose a plan [paying]; change plan [prorated, confirmed]; cancel [ends on date, Undo]; update card [charged].
- **Entries:** pricing page; billing settings; the failed-payment email.
- **Must:** cancel as shallow as subscribe, with a review stating the last day and refunds; one honest retention offer at most; failed payment links straight to the card form.
- **Don't:** cancel by chat or phone only → the same self-serve depth as joining.

### AI assistant / agent workspace
- **Journeys:** ask → answer [used]; delegate a task → review → apply [applied, undoable]; recover from a wrong turn [edited, retried].
- **Entries:** new chat; a shared thread; a file or selection sent to the assistant.
- **Must:** every agent action that changes things outside the chat shows a review with what will change; stop is always one action away.
- **Don't:** agent writes without review → propose, then the person commits.

### Settings / account
- **Journeys:** change a setting [applied]; manage members [invited, role set]; delete account [gone after review].
- **Entries:** the avatar menu; deep links from a feature ("Turn on in settings").
- **Must:** a setting applies at once and returns the person to where they came from; delete account no deeper than sign up.
- **Don't:** Save button for toggles → apply immediately.

### Helpdesk / support inbox
- **Journeys:** answer a ticket [resolved]; escalate [assigned]; find a past ticket [read].
- **Entries:** the queue; the ticket from a notification; a customer's history from any ticket.
- **Must:** after resolve, the next ticket opens (no detour to the list); a merged ticket links to where it went.
- **Don't:** reply that closes the ticket silently → status changes visible and undoable.

### Team chat / messaging
- **Journeys:** read and reply [caught up]; start a conversation [message sent]; find a message [in context].
- **Entries:** a notification lands on the message in its thread; shared links.
- **Must:** search results open the message in context, scrolled to it; unread state survives switching.
- **Don't:** notification that opens the channel top → open the message.

### CMS / publishing
- **Journeys:** draft → preview → publish [live, URL]; edit live content [republished]; unpublish [hidden, restorable].
- **Must:** preview is exactly what will publish; publish shows the live URL; scheduled posts editable until they go out.
- **Don't:** publish without preview on the first post → preview step, skippable after.

### Document editor / wiki
- **Journeys:** write [saved]; share [person can open]; find a page [read].
- **Entries:** a shared link (works without the sidebar context); search; mentions.
- **Must:** autosave, no Save step; sharing states who can see it before sending.
- **Don't:** share dialog that sends before the access level is visible → access first, then send.

### Forms and surveys (respondent side)
- **Journeys:** answer [submitted, receipt]; come back later [resumed].
- **Must:** progress named, back keeps answers, a review before submit when answers matter.
- **Don't:** one question per page for short forms → group by topic.

### Marketplace (two-sided)
- **Journeys:** buyer: find → contact or buy [deal]; seller: list → sell → get paid [paid out]; dispute [resolved].
- **Must:** both sides' journeys modelled; messaging lands on the listing and the order; payout status visible to the seller at every step.
- **Don't:** contact info required before browsing → browse, then account at contact.

### Banking / personal finance
- **Journeys:** pay or transfer → review → confirm [sent, receipt]; see what happened [transaction found]; freeze a card [frozen, undoable].
- **Must:** every money movement has a review with amount, recipient and date; freeze is one tap and reversible.
- **Don't:** confirm without the recipient's name shown → name and amount on the review.

### Healthcare / care records
- **Journeys:** book care [booked]; read results [understood, next step]; share records [consented].
- **Must:** consent is an explicit step with what is shared and with whom; every result screen states the next step.
- **Don't:** results without context → value, range and what to do.

### Landing page → sign up (Persuade)
- **Journeys:** understand → try or sign up [first value]; see pricing → choose [checkout].
- **Entries:** ads and campaigns land on the matching section, not the top.
- **Must:** one primary path per page; sign up returns the person to what they were about to do.
- **Don't:** a sign-up wall before the product shows anything → a demo, sample or free tier first.

### Onboarding / first run
- **Journeys:** first use → first value [the thing made, sent or seen]; invite others [joined].
- **Must:** skippable, resumable; the empty states teach the next step instead of a forced tour.
- **Don't:** a tour that blocks the UI → seeded examples and one action per empty state.
