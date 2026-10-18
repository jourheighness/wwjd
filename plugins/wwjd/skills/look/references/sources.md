# Sources

Prefer a gallery's "Visit" link and screenshot the live site. Galleries are for finding references, not for capturing them.

## Per register (best first)
| Register | Sources |
|---|---|
| Persuade (landing, pricing) | Lapa Ninja `/category/saas/` · Saaspo `/page-types/<type>` · Land-book `/design/pricing-page` · One Page Love `/genre/saas` |
| Operate (product app) | Refero `/search?q=` (MCP if installed) · SaaSframe `/categories/<x>` · the category's best real products (public surfaces) · Nicelydone |
| Monitor (dashboards) | SaaSframe `/categories/dashboard` · Refero · real products' public demo dashboards |
| Reference (docs) | the leading products' docs (Stripe, Vercel and the like) · Nicelydone `/pages/documentation` |
| Editorial | Siteinspire `/websites/category/typographic` · The Pudding, NYT and Guardian graphics as live sites |
| Transact | Shopify theme demo stores · Siteinspire `/websites/category/e-commerce` · Baymard product-page examples |
| Native (mobile) | Refero `/ios-apps` · Apple Design Awards · Mobbin **only through its MCP on the user's own account** |
| Mood only | Dribbble · Behance · Pinterest · Cosmos · Are.na · Collect UI · Muzli: type, colour and imagery only, never layout or density |
| Direct | WebSearch `best <category> software 2026`, `<category> alternatives`, G2 categories, Product Hunt topics. Shortlist 5–8 leaders or design-led products |

- Public surfaces only: home, `/pricing`, `/changelog`, `/docs`, demos and template galleries. App screens behind a login come from gallery captures; never log in.
- Gone or moved: Godly is now recent.design, Screenlane is now Page Flows (paid), UI Sources is now ScreensDesign (paid), and documentation.page is dead.

## Rules
- **Bot walls:** never solve, bypass or evade a challenge, captcha or login wall. If Playwright is blocked, skip the source.
- **Mobbin:** its terms forbid bot access, so no scraping. Use it only through its paid MCP, if the user has it.
- Respect robots.txt and rate limits: one page at a time, no crawling.
- **Screenshots** go in `.wwjd/refs/` (gitignored) and are for internal comparison only. Never publish the board.
- **Never copy** assets, copy text, code, logos, icon sets, illustrations, trademarks or licensed fonts. Take axis values only. Map a licensed font to the open preset with the same job (Söhne → grotesk).

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
source: gallery                      # gallery | direct | mood (mood: type, colour, imagery only)
score: 5                             # resemblance, 0-5
captured: {date: 2026-10-16, viewports: [1440, 390], mode: dark}
register: operate
product_type: issue tracker
identity: "A dark, quiet, dense tool where structure comes from tone steps and hairlines."
sampled:                             # approximate, from pixels; never used as the product's accent
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
structure: "sidebar + list + detail"  # informs layout talk with wwjd; never copied
do_not_take: [logo, illustrations, copy, icon set, product names]
```
- One `key: {v: …, c: …}` per line under `axes:`, since look.mjs reads that shape.
- Text-ink chroma above .03 (Stripe's navy) gets noted under `signature`. It needs the user's OK before `inkChroma` is set.
