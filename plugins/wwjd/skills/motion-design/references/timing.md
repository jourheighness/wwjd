# Timing: the numbers

Duration is meaning, not decoration: the same two poses read as ten different actions depending only on how many in-betweens they get (Thomas & Johnston; Lasseter 1987). "Far more common for animations to be too long than too short" holds for UI (NN/g); story pieces fail the other way, rushed, because the author already knows what comes next.

## Reading
| What | Number | Source |
|---|---|---|
| Line hold, from when it stops moving | 0.5 s + 0.3 s a word, ≥ 1.5 s | owner's scenes (2026-10); ≈ Brysbaert 238 wpm read slower while the eye also tracks the picture |
| Words on one line | ≤ 8 (kinetic text works at 3-7 a frame) | owner's scenes; practitioner guides |
| Characters per second | ≤ 17-20 | Netflix (adults 20, children 17) |
| Shortest event / longest | 0.83 s / 7 s | Netflix |
| Gap between two lines | < 0.1 s or ≥ 0.5 s | Netflix (2 frames or ≥ 0.5 s, never between) |
| The read-twice check | the author can read it twice in the slot | SSW, UC Davis video guides |
- **Reading starts when the text stops moving,** not when it starts entering. A change in the middle of a big move goes unnoticed: it comes before or after the move (Lasseter, quoting Thomas & Johnston).

## Seeing
| What | Number | Source |
|---|---|---|
| Shortest readable accent or hold | 250 ms (6 frames at 24) | Williams, *The Animator's Survival Kit* |
| Key pose held to be absorbed | 333-667 ms (8-16 frames) | Thomas & Johnston |
| A static frame dies after | ~1.7 s (40 frames): hold, but let it breathe | Thomas & Johnston |
| A second important event missed if | 200-500 ms after the first (attentional blink) | Raymond, Shapiro & Arnell 1992 |
| The eye needs to land on a new thing | ~0.5 s (saccade 175-200 ms + 150 ms+ fixation) | Rayner 2009 |
| Gaze clusters after a cut | snaps to centre at ~333 ms, tight for ~533 ms; bottom-up pull fades over ~2.5 s | Mital, Smith et al. 2011; Carmi & Itti |

## Durations for story moves
| Move | Duration | Note |
|---|---|---|
| UI press, state flip | 100-160 ms | wwjd:motion; flips ≤ 150 ms colour fade |
| Small element enters | 0.4-0.6 s | under 0.4 s a story move reads as a glitch |
| Hero element enters | 0.5-0.9 s | |
| Scene change | 0.7-1.2 s | |
| Camera move | 1.2-2 s (≤ 4 s for a long glide) | slower than its subject; never under 0.8 s |
| Data in flight, a band | 1.6-2.2 s | heavier reads slower; snappy data reads as a glitch (owner, 2026-10-20) |
| Exit | ~2/3 of the entrance | NN/g; Material |
- **Match speed, not duration:** a longer way gets more time, so everything moves at one felt speed (Val Head). Heavier, larger things take longer to start and stop (Lasseter).
- **Material 3's longest UI token is 1 s,** IBM Carbon's 700 ms: story moves sit at and above the top of UI scales. GSAP's default 0.5 s `power1.out` is a UI default, not a story timing.
- **A fast move needs anticipation:** a 3-4 frame zip reads only because the wind-up before it is long (Lasseter on Wally B). Hit hard, then cushion: about 3 frames to the accent, a 6-8 frame settle, then hold (Williams).

## Overlap and sequence
- **Never bring one action to a full stop before the next starts** within a phrase: the next begins in the last 10-30% of the one before. A move that slows to do something glides through at a crawl and picks up again, never ease-to-rest, hold, ease-out (owner, 2026-10-20).
- **Parts of one gesture trail by 40-170 ms** (children 20-50 ms behind their parent), varied, never all equal.
- **Stagger a group 30-80 ms an item, the whole spread ≤ 0.4 s:** inside that window it reads as one event (Material: ≤ 20 ms steps for UI).
- **One idea on screen at a time** ("look at this, now look at this"): the next beat starts after the eye has landed.

## Rhythm
- **Contrast drives interest:** fast reads as fast only next to slow (Deitch); no more than 3 beats of the same length in a row.
- **Beats tighten toward the climax; the payoff gets the longest hold,** ≥ 2 s and ≥ 1.5× the median hold.
- **To music:** frames per beat = fps × 60 ÷ bpm (120 bpm at 24 fps = 12 frames). The visual accent lands 0-125 ms **before** the beat; never late (Williams; Disney's 3 frames ahead failed on some tempos, so shift by eye).
- Viewers blink together at the ends of actions (Nakano 2009): that is where a cut or a rest can go.

## Lengths
- Hero loop or play-once: 6-15 s; story-led heroes up to 34 s when each line needs time. WCAG 2.2.2: over 5 s of auto-moving content needs Pause. Brand guides cap hero video at 10-20 s.
- Explainer scenes 3-4 s, narration ≤ 2.5 words a second (≈ 150 wpm).
- Launch films (Linear) about 20 s, one action at a time.

## Working method
- **Block in stepped holds, play at speed, then ease** (Disney's pose test: 4-24 frames a pose before any in-betweens). Smoothing too early eats half of every hold.
- **Watch at 1×, at 0.5×, scrubbed.** A spot you rewind is too fast; a spot where attention wanders is too long. Mayer's segmenting effect (paced chunks beat one stream): d ≈ 0.8-1.0.
- **When in doubt: longer holds, shorter moves.**
