# Workflow: brief → story card → beat sheet → animatic → polish

Studios never animate first: message, script, look, board, timed animatic, each signed off, and only then animation (School of Motion, Buck, Kurzgesagt). Lago ran this pipeline for AI-made launch films with a validated storyboard and two human sign-offs, and feedback rounds fell from about 12 to 1. An animatic is the cheapest place to find out a beat is too fast.

## 1. Brief (5 lines, in chat)
```
Who:     marketing visitors deciding whether to read on
Where:   the hero at /, under the static headline, edge to edge, desktop and phone
Length:  about 15 s, plays once, rests with Replay
Sound:   none
After:   "Book a demo"
```

## 2. Story card (◆ the owner approves)
```
Message:   Publish once, every distributor gets their format.          (≤ 15 words)
And:       Suppliers send product data as PDFs and sheets.
But:       Every distributor wants it in their own format.
Therefore: Publish once and each gets it their way.
Contract:  because the person publishes once (X), the app converts every value (Y), giving each distributor a filled row (Z).
Carried:   the product card
Last frame: the card with every distributor's row filled and checked, nothing moving.
```
Write the last frame before anything else (Pixar #7). It is also the poster and the reduced-motion frame.

## 3. Beat sheet: `motion.beats.json` (◆)
One row per shot, every time in seconds from the start, absolute. `beats.mjs init` writes a starter; `check` runs the rules; `table` prints what the owner reads.

```json
{
  "v": 1,
  "title": "Stream hero",
  "message": "Publish once, every distributor gets their format",
  "abt": { "and": "…", "but": "…", "therefore": "…" },
  "contract": "because … , … , giving …",
  "carry": "the product card",
  "end": "the card with every row filled, nothing moving",
  "plays": "once",            // once | loop | scroll | video
  "pause": true,              // a visible Pause exists (required over 5 s of motion)
  "shots": [
    {
      "id": "publish", "at": 4, "end": 8.5,
      "beat": "therefore",     // hook | and | but | therefore | result | payoff
      "subject": "the product card",
      "action": "the hand presses Publish",
      "change": "draft → published",
      "carries": true,         // the carried object is in this shot
      "big": false,            // one of the ≤ 2 big moments
      "text": "Publish once", "textAt": 4.2, "textOut": 6.4,
      "camera": "hold",        // hold | push | pull | pan | follow
      "out": { "kind": "camera", "why": "the camera follows the data" },
      "moves": [
        { "what": "card", "kind": "enter", "at": 4.1, "dur": 0.8 },
        { "what": "publish", "kind": "change", "at": 6.6, "dur": 0.4 },
        { "what": "camera", "kind": "camera", "follow": true, "at": 7, "dur": 1.6 }
      ]
    }
  ]
}
```
- **`moves[].kind`:** `enter`, `exit`, `move` (travels on screen), `camera`, `change` (in place: a fill, a roll, a status flip; never counts as travelling), `hold` (a beat meant to be seen; not dead time).
- **`follow: true`** on a camera move: it rides with the one thing it follows (data in flight), so the two count as one mover.
- **`textAt` / `textOut`:** when the line starts entering and when it starts leaving. Reading counts from `textAt + 0.3`.
- What `check` enforces, by rule id: `message`, `abt`, `end`, `carry`, `hook` (S) · `shot-length`, `subject`, `change`, `transition`, `big`, `pace`, `rhythm` (ST) · `one-mover`, `camera-and-subject`, `quiet-after-cut`, `beat-gap` (O, T4) · `text-hold`, `text-words`, `text-under-move` (T3, O5) · `move-short`, `move-long`, `exit-long`, `dead-time`, `final-hold` (T) · `pause`, `loop-length` (E).
- The file is the plan and stays true: the code reads its times from it (or from one table in the scene) and a timing change edits the sheet first.

## 4. Style frames (alongside 3)
2-3 stills of key shots in the project's real tokens, kit and fonts (`wwjd:look`), and the move vocabulary: 3-5 named moves with one duration each, from one scale, two easings (enter: ease out; leave: ease in; travel: ease in-out). Anything outside the vocabulary needs a written reason. Real product assets only: no stock, no generic 3D.

## 5. Animatic in code (◆ timing is locked here)
Grey boxes in the final positions, real text, the final camera, the final times from the sheet. No polish, no textures, no easing tweaks.
- The scene runs from one clock and can be seeked: expose `window.wwjdSeek(seconds)` (and `window.wwjdDuration`), or a `?t=` parameter.
- Show the owner `render.mjs frames <url> --every 0.25` (the contact sheet) plus the page itself. They approve timing on this, muted.

## 6. Blocking, then polish
Key poses as stepped holds first, played at speed; only then the easing, from the vocabulary. Then: the loop seam or the final hold, reduced motion (rests on the last frame), the Pause control, the poster, phone framing.

## 7. Ship check (◆)
- The contact sheet at rest and mid-move for every shot, desktop and phone.
- The frames at 1, 3 and 5 s: is the subject there by 1 s, the message readable by 3 s?
- A reduced-motion shot: the story is complete in the still.
- `beats.mjs check` clean; `render.mjs fit` and `runtime` on the page around it.

## Feedback goes back to its step
| The owner says | Go back to |
|---|---|
| "it says the wrong thing", "what is this about" | 2, story card |
| "too fast", "rushed", "dead time", "muddy", "too much at once" | 3 and 5: the beat sheet, then the animatic |
| "too bouncy", "stiff", "cheap" | 6: the vocabulary |
| one shot reported twice | the check that passed it looked at a still: sample it with frames, mid-move |
