# Hero patterns

Examples loaded live 2026-10-16 (headless Chromium, 1440×900 + 390×844). Godly now redirects to recent.design; Saaspo/Lapa Ninja bot-walled, skipped.
**D** = 1440, **P** = 390 (composed on its own), **Act** = where the one action lives.

## Phone rule first
- EU consent sheets covered **50–60% of the 390 viewport** (A24, Airbnb, Uber, Wise, Wolt, Topaz). Phone action sits in the **top ~45%**.

## 1. Tool-as-hero: the core input works on screen one
- Fits: delivery, rides, travel, domains, file tools: first step is an input. Avoid: no single first input.
- D: short claim over the input, real results under it. P: input right under the nav, claim 3–5 words.
- Act: submit **inside** the widget ("See prices", "Upload image"). No separate CTA button.
- Motion: none (caret already in the field).
- Ex: uber.com (city auto-detected, "Change city", pickup/dropoff → See prices) · remove.bg ("Upload image" + "No image? Try one of these") · domains.squarespace.com
- Tells: the input is a fake link to signup. No sample data, so nothing shows before upload.

## 2. Local answer: "where are you?" returns the decisive fact
- Fits: place or time changes the answer (delivery, stock, availability, hours). Avoid: a guess you cannot correct.
- D: detected place as editable text ("Stockholm · change"), answer beside it. P: place + answer on one line.
- Act: the answer is the button ("Safeway · 25 min" opens the store).
- Motion: none; swap instantly on change.
- Ex: instacart.com (store row: "Safeway 25 min", "Costco 1 hr", "Delivery by 10:45am") · airbnb.com ("Available in Sälen this weekend") · wolt.com (address field in hero, Stockholm detected)
- Tells: location detected but not shown. A country modal first (nothing.tech).

## 3. Headline-as-query: the H1 is a search the visitor can run
- Fits: discovery products. Avoid: single-purpose tools.
- D: centred H1 ending in a rotating noun plus an inline object image, field below. P: same, CTA switches to "Download app".
- Act: the field. Cosmos: "Find your next lamp with character" → "…go-to outfit".
- Motion: one, the noun swap. **Freezes under reduced motion** (checked).
- Ex: cosmos.so
- Tells: the rotating words are not real results. Rotation is faster than reading speed.

## 4. Live product: the real UI running, not a mockup
- Fits: SaaS, devtools, editors. Avoid: when the UI is generic or empty.
- D: claim top-left, full-width app window bleeding off the bottom. P: a cropped corner at real scale (Linear), never the whole window shrunk.
- Act: Download/Sign up beside the claim. The demo is proof, not the action.
- Motion: one loop of real work. Linear freezes under reduced motion; Cursor, Granola, Cal, Superhuman kept moving (headless diff, may be non-hero motion).
- Ex: linear.app · cursor.com · zed.dev · granola.ai
- Tells: lorem data, fake cursor, endless motion, unreadable 40%-scale window.

## 5. Prompt box: the product is a conversation
- Fits: AI builders, search, assistants.
- D: one question as H1 ("What will you build today?"), wide box, 3–5 starter chips. P: the box fills the width, chips scroll sideways.
- Act: Enter/send **in the box**. Signup comes after the first prompt.
- Motion: placeholder types one example, then stops.
- Ex: lovable.dev · bolt.new · v0.app · perplexity.ai
- Tells: looks like every AI site. Generic chips. Typing hits a signup wall.

## 6. Type-only statement
- Fits: a claim strong enough to stand alone. Avoid: generic claims ("Build faster").
- D: display H1 ≤2 lines, one subline, one action. P: H1 in 3–4 lines.
- Act: directly under the H1.
- Motion: none.
- Ex: wise.com (condensed caps fill the screen) · anthropic.com · resend.com
- Tells: big type around a weak sentence. A gradient word.

## 7. Plain document: reads like a README
- Fits: tools for thinkers, open source, anti-marketing brands. Avoid: mass consumer.
- D: narrow text column, a lettered list ("a. … b. …"), one exact live fact. P: identical, it is just text.
- Act: one small "Sign up" inline.
- Motion: none.
- Ex: are.na ("For the last **15 years and 68 days**", computed per day)
- Tells: affectation without content.

## 8. Full-bleed scene
- Fits: vehicles, film, places, hospitality. Avoid: SaaS stock desk photos.
- D: edge-to-edge photo/video, action in its quiet zone. P: a portrait re-crop, not a centred landscape crop.
- Act: one field or button on the image (Mercury puts the email field in the scene).
- Motion: one slow video loop, pausable. Poster frame under reduced motion.
- Ex: a24films.com · rivian.com · mercury.com · teenage.engineering (store at night)
- Tells: text on a busy area, a carousel of heroes, autoplay sound.

## 9. Product object
- Fits: hardware, packshots, physical goods. Avoid: software.
- D: object large on a quiet ground; name, claim, price + Buy. P: object, then the Buy row.
- Act: price and Buy **next to the object** (AirPods: "$249 Buy").
- Motion: one turn or reveal on load. Static under reduced motion.
- Ex: apple.com/airpods-pro · play.date
- Tells: floating render, no scale cue, hidden price.

## 10. Toy: the first screen is something to play with
- Fits: taste-led brands, creative tools, music, games. Avoid: B2B buyers on a deadline.
- D: one interactive object, one-line caption. P: tap version, or a still saying "play on desktop".
- Act: playing **is** the action, with a quiet way out to Get/Download.
- Motion: user-driven only.
- Ex: poolsuite.net (a one-screen retro desktop with a playing video window) · tldraw.com (the canvas is the homepage) · bruno-simon.com (drivable car, portfolio)
- Tells: nothing says what it is. Blank without WebGL (igloo.inc rendered empty headless).

## 11. Before → after
- Fits: enhancement, cleanup, audio, editing, renovation. Avoid: when the difference is subtle at 390.
- D: one large frame, drag divider, before left. P: full-width frame with a tap toggle, not a fiddly drag.
- Act: "Try with your image" **on the frame**.
- Motion: one auto-sweep on load, then the user drives.
- Ex: letsenhance.io (comparator starts y≈804, just below the fold) · topazlabs.com (Before/After at y≈1528)
- Tells: cherry-picked miracle, mismatched crops. **Even enhancement brands keep it below the fold: open territory.**

## 12. Editorial cover
- Fits: media, publishers, books. Avoid: transactional products.
- D: one story as cover (headline, dek, Read now). P: image top, headline overlapping its bottom edge.
- Act: "Read now" under the dek.
- Motion: none, or one image treatment.
- Ex: every.to ("How Codex Happened") · press.stripe.com (books as objects)
- Tells: a grid of 9 equal stories means no cover.

## 13. Number as the claim
- Fits: only when the number **is** the pitch (odds, rates, scale).
- D: one number at display size, unit + source, claim as caption. P: number first.
- Act: next to the number ("See markets", "Open account").
- Motion: a live tick only if the data is live.
- Ex: stripe.com ("Global GDP running on Stripe: 1.73…%", live counter, static under reduced motion) · polymarket.com (odds are the product) · are.na (day count)
- Tells: round numbers ("10k+"). A row of 3 stats. Count-up on a static figure.

## 14. Split with a reason: the product has two sides
- Fits: translators, converters, schedulers, code↔render.
- D: the halves map to the product's own two panes. P: stacked in usage order (input above output).
- Act: inside the working half.
- Motion: none, or the widget's own state change.
- Ex: deepl.com/translator (Type to translate | output) · cal.com (claim | real booking widget) · tailwindcss.com (class list → rendered card)
- Tells: you could swap the right half for any picture and nothing changes.

## 15. Centred minimal
- Fits: a known app whose icon carries it. Avoid: unknown products.
- D: icon, name, one sentence, one action, then air. P: the same, it was always phone-shaped.
- Act: the one button.
- Motion: none, or the product rendering itself (Ghostty's ASCII ghost runs in a terminal window and stops under reduced motion).
- Ex: culturedcode.com/things · ghostty.org · raycast.com
- Tells: centred because it is the default.

## 16. Scroll-told
- Fits: flagship hardware, one-off launches. Use sparingly. Avoid: anything people revisit.
- D: pinned stage, scroll scrubs one sequence. P: shorter, never scroll-jacked.
- Act: Buy stays visible in a sticky bar the whole time.
- Motion: scroll-linked, with a static stack fallback under reduced motion.
- Ex: apple.com/airpods-pro (29k px page, 16 videos, a pinned stage)
- Tells: screen one says nothing until you scroll. Hijacked scroll speed.

## 17. Wall of real use
- Fits: marketplaces, communities, templates: proof that **is** the inventory.
- D: claim + action over a wall of real items. P: one swipeable row.
- Act: the claim's input (Wolt address field) or the items themselves link in.
- Motion: one slow marquee, pausable on hover/focus, stopped under reduced motion.
- Ex: wolt.com (local merchant logos under the address field) · v0.app (community templates with remix counts)
- Tells: non-customer logos. Items that link nowhere.

## 18. One field (waitlist / signup)
- Fits: pre-launch, B2B where email is step one. Avoid: when they could try instead.
- D: claim, field + button on one line, a promise under it. P: stacked, top half.
- Act: the field. Say what happens next.
- Motion: none, or one mascot moment.
- Ex: pipdot.app ("Tell me when it's ready" / "One email, the day Pip is ready, and nothing else") · ramp.com ("What's your work email?") · mercury.com
- Tells: "Join 10,000+ on the waitlist". A second CTA beside the field.

## 19. Finder: one question at a time to the right product
- Fits: considered purchases (chairs, cars, plans).
- D: question 1 and its answers are the hero. P: one card per question, thumb-reachable answers.
- Act: each answer advances; the result ends in Buy.
- Motion: a card-to-card transition only.
- Ex: findmy.vitra.com (Office Chair Finder, "Start") · rivian.com ("Find your Rivian", 3D build)
- Tells: >5 questions. An email gate before the result.

## Picker
| The idea sentence is… | Try |
|---|---|
| "Enter X, get Y" | 1 Tool, 2 Local answer, 5 Prompt |
| "The answer depends on where/when you are" | 2 Local answer, 1 Tool |
| "Browse/discover a huge catalogue" | 3 Headline-as-query, 17 Wall |
| "Our software does the work for you" | 4 Live product, 14 Split, 5 Prompt |
| "One sentence nobody else can say" | 6 Type-only, 7 Document, 15 Centred |
| "Look at this thing" | 9 Object, 16 Scroll-told, 8 Scene |
| "It changes how it looks/sounds" | 11 Before→after, 14 Split |
| "A place, a mood, a story" | 8 Scene, 12 Cover |
| "This number is the whole pitch" | 13 Number, 6 Type-only |
| "It is fun / it is ours" | 10 Toy, 15 Centred |
| "Not ready yet" | 18 One field, 6 Type-only |
| "Which one is right for me?" | 19 Finder, 1 Tool |

## Information grading
- **Decides**: it changes whether they act. Keep it, next to the action.
- **Delights**: true, small and specific. Give it **its own moment** (a line, a beat, a detail), never a bullet.
- **Nothing**: cut it from the hero.
- Coffee-to-a-flight example: flight time **decides** · arrival temperature **delights**, so it gets its own moment · distance is **nothing**.
- Live precedent: Flighty's hero notification "Mom landed in New York, 6:32am (22m early) and ☀️ 88º" puts the deciding fact first and the delight last (flighty.com).
- Test: if a competitor could say it unchanged, it is nothing.

## Bans
- Left text / right image as the default. Use 14 only with a reason.
- Eyebrow kicker over the H1. Stripe's live GDP line is a number hero misplaced as a kicker; give it its own line instead.
- A gradient word in the headline.
- Fake or uncleared logo strips.
- Round-number stat strips ("10k+ · 99.9% · 4.9★").
- Fade-up on everything. At most one moment, and it must be interruptible.
- **A CTA split away from the widget that motivates it.** The action lives inside the experience (Uber's "See prices", not a "Get started" in the nav).
- Carousel heroes, autoplay sound, blank without WebGL/JS.
- A phone hero that is the desktop stacked, or an action below the consent-sheet line.
