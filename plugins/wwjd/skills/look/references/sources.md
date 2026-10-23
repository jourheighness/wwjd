# Sources

Galleries find references; follow their "Visit" link and capture the live site.

## Per register (best first)
| Register | Sources |
|---|---|
| Persuade (landing, pricing) | Lapa Ninja · Saaspo · Land-book · One Page Love |
| Operate (product app) | Refero (MCP if installed) · SaaSframe · the category's best real products (public surfaces) · Nicelydone |
| Monitor (dashboards) | SaaSframe · Refero · real products' public demo dashboards |
| Reference (docs) | the leading products' docs (Stripe, Vercel and the like) · Nicelydone |
| Editorial | Siteinspire (typographic) · The Pudding, NYT and Guardian graphics as live sites |
| Transact | Shopify theme demo stores · Siteinspire (e-commerce) · Baymard product-page examples |
| Native (mobile) | Refero (iOS) · Apple Design Awards · Mobbin (see Rules) |
| Mood only | Dribbble · Behance · Pinterest · Cosmos · Are.na · Collect UI · Muzli: type, colour and imagery only, never layout or density |
| Direct | Web search `best <category> software|app <current year>`, `<category> alternatives`, G2 categories, Product Hunt topics; shortlist 5–8 leaders or design-led products |

- Public surfaces only: home, `/pricing`, `/changelog`, `/docs`, demos, template galleries. App screens behind a login come from gallery captures.

## Rules
- **Bot walls:** never log in, solve, bypass or evade a challenge, captcha or login wall; if blocked, skip the source.
- **Mobbin:** its terms forbid bot access: only through its paid MCP on the person's own account.
- Respect robots.txt and rate limits: one page at a time, no crawling.
- **Screenshots** go in `.wwjd/refs/` (gitignored), for internal comparison only. Never publish the board.
- **Take axis values only:** never assets, copy text, code, logos, icon sets, illustrations, trademarks or licensed fonts. Map a licensed font to the open preset with the same job (Söhne → grotesk).

## Capture
- 1440×900 above the fold, plus the full page; add 390×844 when the product is mobile-first.
- Capture light and dark if the site offers both. `waitUntil: networkidle`; dismiss cookie banners.

## Resemblance score (0–5; keep ≥3)
- register match (2)
- layout or structure match (1)
- product-type match (1)
- look matches the stated mood (1)
- Mood-board sources score at most 3.

## Reference card (`.wwjd/refs/<letter>.yaml`)
```yaml
id: B
name: Linear
url: https://linear.app              # live public surface only
source: gallery                      # gallery | direct | mood
score: 5                             # resemblance, 0-5
captured: {date: 2026-10-16, viewports: [1440, 390], mode: dark}
register: operate
product_type: issue tracker
identity: "A dark, quiet, dense tool where structure comes from tone steps and hairlines."
sampled:                             # approximate; never the product's accent
  ground: {hex: "#08090A"}
  accent: {hex: "#5E6AD2"}
  fonts: [Inter, Inter Display]
axes:                                # value + confidence 0-1; under .5 falls back to baseline
  type: {v: grotesk, c: .9}
  neutral: {v: cool/achromatic, c: .8}
  accent: {v: quiet, c: .8}
  surface: {v: tonal, c: .8}
  shape: {v: crisp, c: .6}
  density: {v: compact, c: .9}
  contrast: {v: standard, c: .7}
  elevation: {v: hairline, c: .7}
  motion: {v: instant, c: .5}
  imagery: {v: ui, c: .9}
signature: "Inter Display headings over a near-black tonal stack"
structure: "sidebar + list + detail"  # informs layout talk; never copied
do_not_take: [logo, illustrations, copy, icon set, product names]
```
- One `key: {v: …, c: …}` per line under `axes:`, since look.mjs reads that shape.
- Text-ink chroma above .03 (Stripe's navy) is noted under `signature`; `inkChroma` needs the person's OK.
