---
name: motion-design
description: 'Art-directed motion people watch (wwjd): a story hero, explainer, launch film or product demo built in code, a scroll story, a title sequence. Story, shots, timing and staging as a checked beat sheet before any code. Not UI motion (wwjd:motion).'
when_to_use: '"hero animation", "explainer", "launch video", "scroll story", "storyboard", "animatic", a scene that feels rushed or busy.'
compatibility: scripts need Node 20.10+, no dependencies; frames needs Playwright (wwjd:ux render.mjs).
---

# wwjd:motion-design
Agree story, shots and timing **before** any animation code: a watched piece fails on those long before easing.

**Boundary:** wwjd:motion is UI motion that answers an action or a state change (press, hover, transition, loading, a single scroll reveal). wwjd:motion-design is a piece people watch that tells a story in shots (story hero, explainer, launch film, product demo built in code, pinned scroll story). The page around it is wwjd:ux, whose Floor holds: reduced motion, pause, nothing essential only in motion.

## 1. Work in this order (the person approves at ◆)
1. **Brief:** who watches, where it plays, length, sound, the action after it.
2. ◆ **Story card:** message ≤ 15 words; And / But / Therefore; the contract "because the person does X, the product changes Y, giving Z"; the carried object; **the last frame as a still.**
3. ◆ **Beat sheet** `motion.beats.json` (`references/workflow.md` §3). `node <skill>/scripts/beats.mjs check`: fix errors in the story or timing, not the file. Show the person `beats.mjs table`.
4. **Style frames** with 3: 2-3 stills in the real kit, 3-5 named moves.
5. ◆ **Animatic:** grey boxes, real text, final timing and camera; show `render.mjs frames`. **Timing locks here.**
6. **Polish:** easing from the named moves only; loop seam or final hold; reduced motion; Pause; poster.
7. ◆ **Ship check:** `references/workflow.md` §7.

Feedback goes to its step: story → 2; timing → 3 and 5; feel → 6. **Never fix timing with easing.**

## 2. Rules (ids cited by `beats.mjs`)
**Story (S)** · detail: `references/story.md`
- **S1** One message; cut any shot that serves none of X, Y, Z.
- **S2** And → But → Therefore → Result; never "and then".
- **S3** Show the problem as a visible state, never a caption; the solution is one action and its effect.
- **S4** One object carries through ≥ 60% of shots and changes in place.
- **S5** Write the ending first: a last frame that reads with no motion and no sound.
- **S6** Subject on screen by 1 s; a hero's message readable by 3 s, as page text from first paint.

**Shots (ST)** · `references/story.md` § Shots
- **ST1** One subject, one action, one change per shot; no change, no shot.
- **ST2** 3-6 s a shot.
- **ST3** At rest, neighbours are fully out of frame or fully in and still.
- **ST4** Every transition has a reason: same object, next step, the camera follows, or unrelated (fade).
- **ST5** At most 2 big moments, never back to back.

**On screen at once (O)** · `references/staging.md`
- **O1** One thing travels at a time; the rest hold or change in place.
- **O2** Camera or subject, never both fast; the camera moves only when something carries it.
- **O3** For 0.5 s after a cut only the new subject moves.
- **O4** Land the next subject where the eye already is; it arrives from its cause, never pops in.
- **O5** Nothing moves under text; the camera stays out of reading holds.
- **O6** Show only the controls the beat needs, with real content (`references/staging.md` § Showing a product).

**Timing (T)** · numbers and sources: `references/timing.md`
- **T1** Entrance 0.5-0.9 s, scene change 0.7-1.2 s, camera 1.2-2 s; a UI press 100-160 ms. Match speed, not duration.
- **T2** Exits ~2/3 of the entrance; ease out to enter, ease in to leave (story only; UI follows wwjd:motion); never linear.
- **T3** A line holds 0.5 s + 0.3 s a word (≥ 1.5 s) from when it stops moving; ≤ 8 words a line, one line at a time.
- **T4** Two beats land < 0.1 s or ≥ 0.5 s apart, never between.
- **T5** A move that slows to do something glides through at a crawl, never stops.
- **T6** No still stretch over 1.2 s except a reading beat or the final hold.
- **T7** At most 3 beats of equal length in a row; tighten toward the payoff; the payoff holds longest (≥ 2 s, all still).

**Text (X)** · `references/staging.md` § Text on screen
- **X1** Lines slide and fade, word by word if at all; never type, spring, scale, wobble or bounce. The page headline never animates in.
- **X2** A handful of lines; each names what is visible at that moment, beside it, never over a mover.
- **X3** A lone line is centred; with graphics it sits under them, same place every time.

**Endings and access (E)** · `references/story.md` § Endings
- **E1** A hero plays once and rests on a settled frame with Replay; a loop runs ≤ 34 s and fades in place.
- **E2** Over 5 s of motion needs a visible Pause that stops everything (WCAG 2.2.2).
- **E3** Reduced motion shows the final frame, which is also the poster.
- **E4** Scroll stories: pinned graphic, one change per step, scroll drives motion, reverses going up; ≤ 2 pinned sections a page.

## 3. Check
- `beats.mjs check` clean before code and after any timing change.
- `node <ux-skill>/scripts/render.mjs frames <url> --every 0.25`: read the contact sheet (it flags dead time), each shot at rest **and** mid-move, desktop and phone (seek hook: `references/workflow.md` §5).
- Watch at 1×, 0.5× and scrubbed: a spot you rewind is too fast; one where attention wanders is too long.
