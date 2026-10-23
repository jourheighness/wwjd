# Staging: what is on screen at once, and where the eye goes

Staging is "the presentation of any idea so that it is completely and unmistakably clear" (Thomas & Johnston). Movement is the first thing that draws the eye (Block), so every extra mover competes with the subject.

## Attention
- **Motion beats colour:** in the periphery motion was found in ~1 s with < 2% misses; colour took 2.3-4.6 s with up to 25% misses. Motion that travels distracts more than motion anchored in place; pop-ins come next (Bartram, Ware & Calvert 2001).
- **Tracking depends on speed:** up to ~8 slow objects, ~4 typical, **1 fast one** (Alvarez & Franconeri 2007).
- **Gaze follows motion and flicker** above everything else; after a cut it snaps to centre (Mital, Smith et al. 2011).
- **What isn't attended isn't seen:** 46% missed the gorilla (Simons & Chabris 1999); a change during a move or a flicker goes unseen (Rensink 1997). Anything important happens where the eye already is, while nothing else moves.
- **Mayer's multimedia principles** (Cambridge Handbook 2014): coherence (cut extras, d 0.86), signalling (point at what matters, d 0.41), redundancy (don't put narration on screen too, d 0.86), spatial contiguity (label beside its thing, d 1.10), temporal contiguity (word and picture together, d 1.22).

## One mover
- **One thing travels at a time.** Others hold or change in place (scale, fade, fill), a few px at most. At most 3 things change at all, 1 if anything is fast.
- **Never move the camera and the subject fast at the same time.** A still camera on a still subject is the calmest, both moving the most intense (Block's ladder); spend that intensity once. The exception is a camera locked to what it follows, moving with it.
- **Quiet after a cut:** for 0.5 s only the new subject moves; keep other motion out for ~2.5 s, while bottom-up pull is strongest.
- **Hide a cut inside motion:** the incoming subject is already moving on the cut frame (edit blindness rises from 25% to 33% on motion onset after the cut; Smith & Henderson 2008).
- **Stop ambient loops while something is being read.**

## Where things go
- **Land the next subject where the eye already is** (within ~10% of the frame from the last focal point), or at centre after a hard cut. Mad Max: Fury Road framed nearly every shot centre so 2,700 cuts stayed readable.
- **Make room before something enters,** and give a mover lead room ahead of it. It arrives from its cause: a press, a parent, off frame. Something that appears out of nowhere creates a new focal point (Material choreography).
- **One screen direction means forward;** reversing means back (the 180° rule in motion graphics).
- **Paths never cross;** a group moves as one container; stagger in reading order (Material).
- **Clean edges:** neighbours fully out of frame or fully in and still; nothing moves in the outer 7%.
- **Safe areas** (SMPTE ST 2046-1): action safe 93%, title safe 90% of the frame. On the web, the stage is the screen minus the chrome, inset 3.5% of its short side (8-32 px); a smaller screen gives up the frame's room before it shrinks the subject; text stays ≥ 0.8 of full size (13 px card text) or the stage runs on below the fold (owner's scenes).

## Camera
- **The camera moves only when something carries it:** a hand dragging, data flying, a pull-back that makes room, a turn to the next subject. Otherwise dead still: no drift, no nudges.
- **Push-in means "this matters"** (once a beat, at a named target); **pull-out means "the bigger picture"** (result, payoff).
- **Pan and zoom are one move:** interpolate the view (scale and offset together, zoom in log space about one fixed point; van Wijk & Nuij 2003), never x, y and zoom separately.
- **It follows, never leads:** it starts a beat after what it follows (~0.15 s), never overshoots, stops as its subject lands, and never moves during a reading hold.
- **Parallax is seasoning:** ≤ 2-3 layers, off under reduced motion (WCAG 2.3.3: parallax can trigger nausea and migraine).

## Text on screen
- **Never over anything that moves.** A line is read over a still frame; it lands before the shot it names plays and leaves before the camera moves.
- **Beside what it names, at the same moment** (spatial and temporal contiguity); styled like the object it names (a chip's colour on the chip's word).
- **One line at a time,** the next enters after the last has started leaving.
- **Slides and fades, word by word if it moves.** No typing (late message, screen readers read fragments), no spring, scale, wobble or bounce (owner, 2026-10-21). Retention doesn't drop between 40 and 120 wpm of kinetic type; 90 wpm rated best (Dolić et al. 2024).
- **Don't duplicate narration on screen** (redundancy).

## Showing a product
- **Simplify before showing:** only the controls the beat needs; dim or remove the rest; zoom in on the part that matters; real content, never lorem.
- **Windows only where the person works,** sized to what they hold; the UI fills them flush, never a card inside a card.
- **The pointer is a character:** large enough to read, enters from off frame in one decelerating move (0.4-0.9 s, on a capped reach), its press causes the next change on the same frame with a small press dip, it never fades out on screen, and it leaves after the drop so it never covers the result. It clicks and drags; nothing else.
- **Planned from the beats:** the beat says when a press lands; the pointer leaves early enough from wherever it last was. No beat waits on how far apart two things sit.

## Crowding: the usual mistakes
Several things entering together · the camera drifting while a line is read · a neighbour peeking into the frame · secondary motion that travels · text over a moving band · a pop-in with no cause · a looping background under the payoff · showing a full real UI where a simplified one would read · every shot with a caption.
