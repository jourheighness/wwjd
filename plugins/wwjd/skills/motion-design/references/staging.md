# Staging: what is on screen at once, and where the eye goes

Staging makes an idea "completely and unmistakably clear" (Thomas & Johnston). Movement draws the eye first (Block), so every extra mover competes with the subject.

## Attention
- **Motion outranks colour** in the periphery (found in ~1 s vs 2.3-4.6 s); travelling motion distracts most, then pop-ins (Bartram, Ware & Calvert 2001). People track ~4 objects, **1 if fast** (Alvarez & Franconeri 2007).
- **Unattended means unseen** (Simons & Chabris 1999; Rensink 1997): put anything important where the eye already is, while nothing else moves.
- **Mayer's principles** (2014): cut extras (d 0.86), no narration duplicated on screen (d 0.86), label beside its thing (d 1.10), word and picture together (d 1.22).

## One mover
- Others hold or change in place (scale, fade, fill), a few px at most. At most 3 things change at all, 1 if anything is fast.
- **Camera and subject both moving is the most intense** (Block's ladder); spend it once. Exception: a camera locked to what it follows (`follow: true`).
- **After a cut** keep other motion out for ~2.5 s, while bottom-up pull is strongest.
- **Hide a cut inside motion:** the incoming subject is already moving on the cut frame (Smith & Henderson 2008).
- **Stop ambient loops while something is read.**

## Where things go
- **Land within ~10% of the frame from the last focal point,** or at centre after a hard cut (Fury Road framed centre so 2,700 cuts stayed readable).
- **Make room before something enters** and give a mover lead room. Something from nowhere creates a new focal point (Material choreography).
- **One screen direction means forward;** reverse means back (180° rule).
- **Paths never cross;** a group moves as one container; stagger in reading order.
- **Clean edges:** nothing moves in the outer 7%.
- **Safe areas** (SMPTE ST 2046-1): action 93%, title 90%. On the web the stage is the screen minus chrome, inset 3.5% of its short side (8-32 px). A smaller screen gives up margin before it shrinks the subject; text never drops below 0.8 of full size, and past that the stage runs below the fold (tested on production scenes).

## Camera
- **It moves only when carried:** a hand dragging, something in flight, a pull-back that makes room, a turn to the next subject. Otherwise no drift, no nudges.
- **Push-in = "this matters"** (once a beat, at a named target); **pull-out = "the bigger picture"** (payoff).
- **Pan and zoom are one move:** interpolate scale and offset together, zoom in log space about one point (van Wijk & Nuij 2003).
- **It follows, never leads:** starts ~0.15 s after its subject, never overshoots, stops as the subject lands.
- **Parallax is seasoning:** ≤ 2-3 layers, off under reduced motion (WCAG 2.3.3).

## Text on screen
- A line lands before the shot it names plays and leaves before the camera moves.
- **Beside what it names, at the same moment;** styled like the object it names.
- **One line at a time:** the next enters after the last starts leaving.
- **No typing** (late message, screen readers read fragments). Kinetic type retention holds from 40 to 120 wpm; 90 rated best (Dolić et al. 2024).

## Showing a product
- **Simplify:** only the controls the beat needs, the rest dimmed or removed; zoom to the part that matters; real content, never lorem.
- **Windows only where the person works,** sized to what they hold; the UI fills them flush, never a card in a card.
- **A pointer is a character:** large enough to read; enters from off frame in one decelerating move (0.4-0.9 s); its press causes the next change on the same frame with a small press dip; never fades out on screen; leaves once its action lands, so it never covers the result.
- **Time the pointer from the beats:** the beat fixes when the press lands and the pointer starts early enough to get there; never stretch a beat to fit its travel.
