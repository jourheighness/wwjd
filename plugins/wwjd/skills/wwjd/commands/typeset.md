# typeset: type scale, rhythm, measure, numbers

The project's faces win. This command decides how they are used.

## Scale per register
| Register | Body | Scale | Families |
|---|---|---|---|
| Operate, Monitor | 13–14px (nothing read under 12px) | about 5 roles, ratio 1.125–1.2, fixed rem | one, from the kit |
| Reference | 16–17px | fixed | text face, plus mono for code |
| Editorial | 18–21px desktop, 17–18px phone | fluid display | text face plus display face |
| Persuade, Showcase | 17–20px | fluid `clamp()`, display ≥3× body | at most 2 |
| Converse | about 16px in answers | fixed | text face, plus mono for code |
| Native | iOS 17pt, Android 16sp | platform scale, Dynamic Type | platform or brand |

## Rules
- **Roles:** caption, secondary, body, subheading and heading are about 5 roles with clear steps. 14, 15 and 16px next to each other read as mud.
- **Weight:** at most 3–4 weights. Medium against Regular is too weak to carry hierarchy.
- **Leading:** headings 1.1–1.2; body 1.5–1.6; multi-line text never below 1.3. Light-on-dark text gets a little more leading and slightly lighter weight.
- **Measure:** 45–75ch for reading text. UI and tables may run wider.
- **Tracking:** never widen body tracking. Display type may tighten to −0.02 to −0.05em.
- **Case:** sentence case. Uppercase only for short labels the platform or publication system requires, never as decorative eyebrows.
- **Numbers:** `tabular-nums` wherever numbers align or change. Old-style figures in editorial prose.
- **Monospace** is for code, identifiers and hashes only. Never "technical voice".
- **Italic** is for emphasis inside text. Headings are roman, except as a publication's own convention.
- **Wrapping:** `text-wrap: balance` on headings and `pretty` on prose. No hard `<br>`.
- **Fonts:**
  - Preload the regular body weight.
  - Use `font-display: swap` with a metric-matched fallback (`size-adjust`), or `optional` where zero shift matters most.
  - Never set `user-scalable=no`.
- **Choosing a face** for a new project: pick by job and personality, never from a trend list. Each fashionable "use this instead" font becomes the next tell.
