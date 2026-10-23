---
name: motion-design
description: 'Art-directed motion (wwjd): story animations made to be watched, such as a hero animation that tells the product story, a scroll-told story, an explainer, a launch film or product demo built in code, a title sequence, a marketing loop. Story, shots, timing, what is on screen at once, camera and text, written as a beat sheet and checked before any code. Not for UI motion (hover, transitions, loading, micro-interactions: wwjd:motion) or for video editing.'
when_to_use: '"hero animation", "animate the story", "explainer", "launch video", "product demo animation", "scroll story", "scrollytelling", "title sequence", "storyboard", "animatic", "scene", "shot", "make the hero tell…", a beat or scene that feels rushed, muddy or too busy.'
compatibility: scripts need Node 20.10+, no dependencies; frames needs Playwright (wwjd:ux render.mjs).
---

# wwjd:motion-design
A piece people watch, not a UI people use. It fails on story, timing and crowding long before it fails on easing. So the story, the shots and their timing are written and agreed **before** any animation code; code is the last step.

Not this skill: anything that answers a click or a state change (wwjd:motion). A product demo inside a page is this skill; the page around it is wwjd:ux. The Floor still holds: reduced motion, pause, nothing essential only in motion.

## 1. Work in this order (owner approves at ◆)
1. **Brief, 5 lines:** who watches, where it plays (hero, section, video, scroll), length, sound or none, the one action after it.
2. ◆ **Story card:** the message in ≤ 15 words; And / But / Therefore, one sentence each; the contract "because the person does X, the product changes Y, giving Z"; the object carried through; **the last frame, described as a still.** (`references/story.md`)
3. ◆ **Beat sheet:** `motion.beats.json`, one row per shot (`references/workflow.md`). Run `node <skill>/scripts/beats.mjs check`; fix every error in the story or the timing, not the file. Show the owner `beats.mjs table`, not the JSON.
4. **Style frames,** alongside 3: 2-3 stills in the real tokens and kit, plus the move vocabulary (3-5 named moves).
5. ◆ **Animatic in code:** grey boxes and real text, final timing and camera, no polish. Show a contact sheet (`render.mjs frames`). **Timing is locked here.**
6. **Blocking, then polish:** easing from the named moves only; the loop seam or the final hold; reduced motion; pause; poster.
7. ◆ **Ship check:** contact sheet at rest and mid-move, the frames at 1, 3 and 5 s, a reduced-motion shot, a clean `beats.mjs check`.

Feedback goes back to its step: story ("it says the wrong thing") → 2; timing ("too fast", "muddy", "dead time") → 3 and 5; feel ("too bouncy") → 6. **Never fix timing by tweaking easing.**

## 2. Story (S)
- **S1 One message.** Every shot serves it; a shot that serves none of X, Y, Z is cut.
- **S2 And → But → Therefore → Result.** Never "and then": each beat is caused by the last.
- **S3 Show the problem as a state you can see** (a pile, red counts, a mess), never a caption about it. The solution is one action and what it sets off; the payoff is the result.
- **S4 One object carries through** most shots, from problem to payoff; things change in place rather than being replaced.
- **S5 The ending first.** The last frame reads with no motion and no sound; a hero rests on it.
- **S6 Hook:** the subject is on screen by 1 s; a hero's message is readable by 3 s, from the first paint as text.

## 3. Shots (ST)
- **ST1 One shot: one subject, one action, one change.** Name its before and after; no change, no shot.
- **ST2 3-6 s a shot** for story pieces (15 s ≈ 3 beats, 30 s ≈ 6). Live-action ad pace (1-2 s) is too fast for UI.
- **ST3 One subject in frame at rest;** neighbours fully out, nothing peeking at the edge.
- **ST4 Every transition has a reason:** same object (morph, match cut), next step (one axis, one direction), the camera following something, or unrelated (fade). Forward keeps one screen direction.
- **ST5 At most 2 big moments** per piece, never back to back.

## 4. On screen at once (O)
- **O1 One mover.** At most one thing travels at a time; others hold or change in place. People track one fast object, about four slow ones.
- **O2 Camera or subject, never both** fast at once. The camera moves only when something carries it (a hand, data in flight, room for what comes); otherwise it holds dead still.
- **O3 Quiet after a cut:** for 0.5 s only the new subject moves.
- **O4 Land the next subject where the eye already is,** or at centre after a cut. Make room before something enters; it arrives from its cause (a press, a parent, off frame), never pops in place.
- **O5 Nothing moves under text.** A line is read over a still frame; the camera keeps out of reading holds.
- **O6 Simplify the UI you show:** only the controls the beat needs, real content, zoomed to the part that matters. The pointer, when there is one, is a character: it clicks and drags, the click causes the next change on the same frame, and it leaves after the drop.

## 5. Timing (T)
- **T1 Story moves are slow, UI is fast:** an entrance 0.5-0.9 s, a scene change 0.7-1.2 s, a camera move 1.2-2 s; a UI press 100-160 ms. Size by distance: match speed, not duration.
- **T2 Exits take ~2/3 of the entrance;** ease out to enter, ease in to leave, no linear on anything that travels.
- **T3 Text holds for 0.5 s + 0.3 s a word (at least 1.5 s), counted from when it stops moving,** ≤ 8 words a line, one line at a time.
- **T4 Two beats land together (< 0.1 s) or ≥ 0.5 s apart,** never 0.2-0.5 s: the second is missed.
- **T5 A move that slows to do something never stops:** it glides through at a crawl.
- **T6 No dead time:** nothing still for over ~1.2 s unless it is a beat meant to be read or the final hold. Hold, don't freeze: a long hold may breathe, never drift.
- **T7 Rhythm:** no more than 3 beats of the same length in a row; beats tighten toward the payoff; **the payoff gets the longest hold** (≥ 2 s, everything still).
- **When in doubt: longer holds, shorter moves.**

## 6. Text (X)
- **X1 Text slides and fades, word by word if it moves at all. It never types, springs, scales, wobbles or bounces.** Owner, 2026-10-21: "lets not do jiggle and physics on text ever".
- **X2 A handful of lines;** most shots say nothing. A line names what is visible in the same moment, beside it, never over a mover.
- **X3 Fixed places:** a line alone is centred; with graphics it sits under them, the same place every time.

## 7. Endings, loops, access (E)
- **E1 A hero plays once and rests** on a settled frame (every motion finished) with Replay; a loop runs ≤ 34 s and fades where it is, never travels home.
- **E2 Over 5 s of motion needs a visible Pause** that stops everything (WCAG 2.2.2).
- **E3 Reduced motion rests on the final frame,** which is also the poster; the story is complete in it.
- **E4 Scroll stories:** one change per scroll step, the graphic pinned, scroll drives the motion and never the reverse; it reverses on the way up. At most 2 pinned sections a page.

## 8. Check
- `beats.mjs check` clean before code, and again after any timing change.
- `node <ux-skill>/scripts/render.mjs frames <url> --every 0.25` samples the running piece into a contact sheet and flags dead time; read the sheet, not a single still. Shoot every shot at rest **and** mid-move, desktop and phone, and at the frames 1, 3, 5 s.
- Watch at 1×, 0.5× and scrubbed: a spot you rewind is too fast; a spot where attention wanders is too long.
- A scene can expose `window.wwjdSeek = (seconds) => …` so frames seeks its own clock; CSS and Web Animations seek without it.

## Lookups
`references/story.md` (structure, hooks, transitions, endings, scroll) · `references/workflow.md` (brief, story card, `motion.beats.json`, animatic, review) · `references/timing.md` (the numbers and their sources) · `references/staging.md` (attention, camera, text, the pointer) · `references/sources.md`.
