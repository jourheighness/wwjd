# Timing: the numbers

Duration is meaning (Thomas & Johnston; Lasseter 1987). UI animation tends to run too long (NN/g); story pieces run rushed, because the author already knows what comes next.

"Tested on production scenes" marks a number set by watching real pieces; it wins where it differs from a source.

## Reading
| What | Number | Source |
|---|---|---|
| Line hold, from when it stops moving | 0.5 s + 0.3 s a word, ≥ 1.5 s | tested on production scenes; ≈ Brysbaert 238 wpm, slowed because the eye also tracks the picture |
| Words on one line | ≤ 8 (kinetic text works at 3-7 a frame) | tested on production scenes; practitioner guides |
| Characters per second | ≤ 17-20 | Netflix (adults 20, children 17) |
| Shortest event / longest | 0.83 s / 7 s | Netflix |
| Gap between two lines | < 0.1 s or ≥ 0.5 s | Netflix |
| Read-twice check | the author reads it twice in the slot | SSW, UC Davis |
- **Reading starts when the text stops moving.** A change during a big move goes unnoticed: put it before or after (Lasseter).

## Seeing
| What | Number | Source |
|---|---|---|
| Shortest readable accent or hold | 250 ms (6 frames at 24) | Williams, *The Animator's Survival Kit* |
| A static frame dies after | ~1.7 s: hold, but let it breathe | Thomas & Johnston |
| A second event missed if | 200-500 ms after the first (attentional blink) | Raymond, Shapiro & Arnell 1992 |
| Eye lands on a new thing | ~0.5 s (saccade + fixation) | Rayner 2009 |
| Gaze after a cut | snaps to centre at ~333 ms; bottom-up pull fades over ~2.5 s | Mital, Smith et al. 2011; Carmi & Itti |

## Durations
| Move | Duration | Note |
|---|---|---|
| UI press, state flip | 100-160 ms | wwjd:motion |
| Small element enters | 0.4-0.6 s | under 0.4 s a story move reads as a glitch |
| Hero element enters | 0.5-0.9 s | |
| Scene change | 0.7-1.2 s | |
| Camera move | 1.2-2 s (≤ 4 s for a long glide) | never under 0.8 s |
| Something carried across the frame (data in flight) | 1.6-2.2 s | heavier reads slower, fast reads as a glitch (tested on production scenes); `beats.mjs` `move-long` warns past 1.6 s, so give the reason |
| Exit | ~2/3 of the entrance | NN/g; Material |
- **Match speed, not duration:** a longer path gets more time (Val Head); heavier things start and stop slower (Lasseter).
- Story moves sit at and above the top of UI scales (Material 3 max 1 s, Carbon 700 ms); GSAP's 0.5 s default is a UI timing.
- **A fast move needs anticipation:** a 3-4 frame zip reads only after a long wind-up. Hit hard, then cushion: ~3 frames to the accent, a 6-8 frame settle, then hold (Williams).

## Overlap and sequence
- **Overlap actions within a phrase:** the next begins in the last 10-30% of the one before. A move that slows to act glides through at a crawl, never ease-to-rest-and-restart (T5; overlapping action, Thomas & Johnston).
- **Parts of one gesture trail by 40-170 ms,** varied (children 20-50 ms behind their parent).
- **Stagger a group 30-80 ms an item, total ≤ 0.4 s:** it reads as one event (UI uses ≤ 20 ms steps, Material).
- **The next beat starts after the eye has landed.**

## Rhythm
- **Contrast drives interest:** fast reads as fast only next to slow (Deitch).
- **The payoff holds ≥ 2 s and ≥ 1.5× the median hold.**
- **To music:** frames per beat = fps × 60 ÷ bpm. The visual accent lands 0-125 ms **before** the beat, never late (Williams).
- Put cuts and rests at the ends of actions, where viewers blink together (Nakano 2009).

## Lengths
- Hero loop or play-once: 6-15 s; a story-led hero up to 34 s (the E1 cap) when every line needs its hold. Brand guides cap hero video at 10-20 s.
- Explainer scenes 3-4 s, narration ≤ 2.5 words a second.
- Launch films about 20 s, one action at a time.

## Working method
- **Block in stepped holds, play at speed, then ease** (Disney pose test): smoothing early eats half of every hold.
