# Workflow: brief → story card → beat sheet → animatic → polish

Studios sign off message, script, look, board and timed animatic before animating (School of Motion, Buck, Kurzgesagt); with AI-made launch films this cut feedback rounds from about 12 to 1 (Lago).

The examples below are one invented product (an expense app); `beats.mjs init` writes a different one. Use neither as a template for content.

## 1. Brief (5 lines, in chat)
```
Who:     visitors deciding whether to read on
Where:   the hero at /, under the static headline, desktop and phone
Length:  about 15 s, plays once, rests with Replay
Sound:   none
After:   "Start free"
```

## 2. Story card (◆ the person approves)
```
Message:   Snap a receipt, the report fills itself.          (≤ 15 words)
And:       Receipts pile up in wallets and inboxes.
But:       Month end means an evening of typing them in.
Therefore: Snap each one and the report writes its own lines.
Contract:  because the person snaps a receipt (X), the app reads amount and category (Y), giving a filled report (Z).
Carried:   the receipt
Last frame: the report, every line filled and Submitted, nothing moving.
```
The last frame is also the poster and the reduced-motion frame.

## 3. Beat sheet: `motion.beats.json` (◆)
One row per shot, times in absolute seconds from the start. `beats.mjs init` writes a starter, `check` runs the rules, `table` prints what the person reads.

```json
{
  "v": 1,
  "title": "Expense hero",
  "message": "Snap a receipt, the report fills itself",
  "abt": { "and": "…", "but": "…", "therefore": "…" },
  "contract": "because … , … , giving …",
  "carry": "the receipt",
  "end": "the report with every line filled, nothing moving",
  "plays": "once",            // once | loop | scroll | video
  "pause": true,              // a visible Pause exists (required over 5 s of motion)
  "shots": [
    {
      "id": "snap", "at": 4, "end": 8.5,
      "beat": "therefore",     // hook | and | but | therefore | result | payoff
      "subject": "the receipt",
      "action": "the hand taps Snap",
      "change": "paper → report line",
      "carries": true,         // the carried object is in this shot
      "big": false,            // one of the ≤ 2 big moments
      "text": "Snap it once", "textAt": 4.2, "textOut": 6.4,
      "camera": "hold",        // hold | push | pull | pan | follow
      "out": { "kind": "camera", "why": "the camera follows the line into the report" },
      "moves": [
        { "what": "receipt", "kind": "enter", "at": 4.1, "dur": 0.8 },
        { "what": "snap", "kind": "change", "at": 6.6, "dur": 0.4 },
        { "what": "camera", "kind": "camera", "follow": true, "at": 7, "dur": 1.6 }
      ]
    }
  ]
}
```
- **`moves[].kind`:** `enter`, `exit`, `move` (travels), `camera`, `change` (in place: a fill, a roll, a status flip; never travelling), `hold` (a beat meant to be seen; not dead time).
- **`follow: true`** on a camera move: it rides with the one thing it follows, so the two count as one mover.
- **`textAt` / `textOut`:** when the line starts entering and starts leaving; reading counts from `textAt + 0.3`.
- `check` rule ids: `message`, `abt`, `end`, `carry`, `hook` (S) · `shot-length`, `subject`, `change`, `transition`, `big`, `pace`, `rhythm` (ST) · `one-mover`, `camera-and-subject`, `quiet-after-cut`, `beat-gap` (O, T4) · `text-hold`, `text-words`, `text-under-move` (T3, O5) · `move-short`, `move-long`, `exit-long`, `dead-time`, `final-hold` (T) · `pause`, `loop-length` (E).
- The code reads its times from the sheet; a timing change edits the sheet first.

## 4. Style frames (alongside 3)
2-3 stills of key shots in the real tokens, kit and fonts (`wwjd:look`), plus the move vocabulary: 3-5 named moves, one duration each, three easings (enter: ease out; leave: ease in; travel: ease in-out). Anything outside it needs a written reason. Real product assets only, no stock.

## 5. Animatic in code (◆ timing locks here)
Grey boxes in final positions, real text, final camera and times from the sheet; no polish.
- One seekable clock: expose `window.wwjdSeek(seconds)` (and `window.wwjdDuration`) or a `?t=` parameter.
- Show the person `render.mjs frames <url> --every 0.25` plus the page; they approve timing on it, muted.

## 6. Blocking, then polish
Stepped key poses at speed, then easing from the vocabulary, then loop seam or final hold, reduced motion, Pause, poster, phone framing.

## 7. Ship check (◆)
- Contact sheet at rest and mid-move for every shot, desktop and phone.
- Frames at 1, 3 and 5 s: subject there by 1 s, message readable by 3 s?
- A reduced-motion shot: the story is complete in the still.
- `beats.mjs check` clean; `render.mjs fit` and `runtime` on the page around it.

## Feedback goes back to its step
| The person says | Go back to |
|---|---|
| "it says the wrong thing", "what is this about" | 2, story card |
| "too fast", "rushed", "dead time", "muddy", "too much at once" | 3 and 5: beat sheet, then animatic |
| "too bouncy", "stiff", "cheap" | 6: the vocabulary |
| one shot reported twice | the check that passed it looked at a still: sample it mid-move with frames |
