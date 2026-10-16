['message']
**Result: the look engine is workable as a fixed 10-axis space. Neutral lightness is locked per role, and only the accent is solved for contrast, so every combination passes WCAG by construction.** Each variant is anchored on a real reference, and output goes to DESIGN.md (hex in frontmatter) plus a sidecar.

- **Verified in a prototype:** at neutral chroma ≤ .02 (OKLCH), the lightness needed for 4.5:1 or 3:1 does not depend on hue or chroma. All 4 neutral presets solved to the same values (text-3 ≤ L .523 on fill .935; dark text-3 ≥ .649; control edge ≤ .670 light, ≥ .528 dark).
- **Accent fill rule:** a solid fill with white text needs L ≤ .55–.59 depending on hue. Black text needs L ≥ ~.56. Brand colours that sit in between get moved.
- **The existing baseline passes:** `starter.css` text-2/3 measured 7.34 and 5.21 on surface-2, control borders 3.25 (light) and 3.50 (dark).
- **Gallery shifts:**
  - Godly now redirects to **recent.design**.
  - Screenlane now redirects to Page Flows; UI Sources to ScreensDesign.
  - documentation.page is dead.
  - Mobbin and Savee search need a login.
  - **Mobbin's terms forbid bot access**: use it only through its paid MCP.

---

## 1. The axes (10)
Light and dark are always generated, so they are not an axis.

| # | Axis | Presets | What it changes | Clashes |
|---|---|---|---|---|
| A1 | **Type voice** | `grotesk` (Inter, Inter Display ≥24px) · `native` (system-ui) · `humanist` (Source Sans 3 / IBM Plex Sans) · `serif-display` (Source Serif 4 headings, Inter body) · `mono-label` (Inter + IBM Plex Mono for labels, IDs and data) | `--font-sans`, `--font-display`, heading weight 600/500, display tracking −.02/−.01/0 | serif-display + compact; mono-label in Persuade heroes; never a trend face (bans.md lane 5) |
| A2 | **Neutral** (temperature × chroma) | hue `cool` 255 · `stone` 70 (baseline) · `warm` 55 · `sage` 165 · `mauve` 310; chroma `achromatic` 0 · `quiet` .003–.006 · `tinted` .010–.016 | `--n`, chroma per role (surfaces ×.75, fills ×1, text ×1.6, cap .02 / text .03) | warm+tinted with orange or terracotta accent (the "warm editorial" ban); tinted gray hue ≠ accent hue; tinted dark ground + many coloured badges (Radix warns) |
| A3 | **Accent strategy** (hue is input, from the brand) | `mono` (accent = ink; M3 MONOCHROME, Geist) · `quiet` (primary button, links, focus only; baseline, ≈TonalSpot) · `wash` (gray takes the accent hue; selected/hover tinted; Radix natural pairing) · `vivid` (high-chroma fills on nav/hero; ≈M3 Vibrant) · `dual` (second hue, +60° or brand pair; ≈Expressive tertiary) | `--a`, chroma peak, which roles use accent, `--selected` | vivid or dual in Operate/Monitor; dual + tinted neutral; accent hue within ±20° of danger (move danger to 20/35) |
| A4 | **Surface strategy** | `tonal` (baseline: ground darker than panes) · `flat` (one surface, hairlines carry structure) · `raised` (white cards on a pale ground) · `chrome` (dark sidebar on light content) · `translucent` (Native only; Radix `panelBackground`, Apple materials) | ΔL between surface-1/2/3, card border vs shadow, sidebar tokens | translucent outside Native (glass ban, one sticky bar ok); raised + flat elevation; chrome + wash |
| A5 | **Shape** | `sharp` 0/2/2/4 · `crisp` 2/4/6/8 · `standard` 4/6/8/12 (baseline) · `soft` 6/8/12/16 · `round` 8/10/16/24 + pill buttons | `--r-1..4`, button radius (Radix `radius` none→full) | round + compact; sharp + soft-shadow; pills in table toolbars; `rounded-[2rem]` "premium" lane |
| A6 | **Density / scale** | `compact` 28/32, 13px, ratio 1.125 · `regular` 32/36, 14px, 1.2 · `comfortable` 36/44, 15px, 1.25 · `spacious` 40/52, 16–18px fluid 1.2→1.333 (Utopia) | control and row height, body size, type ratio, space multiplier (Radix `scaling` 90–110%) | spacious in Operate; compact in Persuade/Editorial |
| A7 | **Contrast** (Linear's third input; M3 `contrastLevel`) | `soft` (text-1 ~12:1, lighter hairlines; floor still holds) · `standard` · `high` (text-3 → text-2, borders 4.5:1, 3px focus) | L-table offsets; also always emits a `prefers-contrast: more` block | soft in Monitor (long glances); soft + tinted dark |
| A8 | **Elevation** | `flat` (tone only) · `hairline` (borders, shadows on overlays only; baseline) · `soft` (cards get shadow-1) · `layered` (2–3 layer shadows tinted with the neutral hue) | `--shadow-*`, card border | layered + flat surfaces; shadows on a dark ground beyond overlays |
| A9 | **Motion** | `instant` 80/100/160, no scale · `crisp` 120/160/220 (baseline) · `smooth` 180/240/320 drawer ease · `springy` (M3 Expressive springs; Showcase, Persuade, Native only) | `--dur-*`, `--ease-*`, press scale | springy in Operate, Flow or Transact |
| A10 | **Imagery** (Persuade/Showcase/Editorial; fixed to `ui` in product) | `ui` (real product screenshots) · `photo` · `line-illustration` · `diagram` (data, schematics) · `brand-shape` (only if the brand owns it; gradient ban) | hero/section media rules, aspect ratios, tints | brand-shape without a brand asset; photo + mono-label |

**How the axes map to the reference systems:**
- Radix covers A2, A3, A4, A5 and A6.
- M3 variants are A3 strategies; M3 contrastLevel is A7.
- Linear's three inputs are base (A2), accent (A3) and contrast (A7).
- tweakcn/shadcn cover A1, A3, A5 and A8 through `--radius` and `--shadow-*`.

## 2. Generation math (no dependencies, OKLCH)

**Neutral role L table** (independent of hue and chroma at C ≤ .02, verified):

| Role | Light (std) | Dark (std) | Floor it guarantees |
|---|---|---|---|
| surface-1 / 2 / 3 | .970 / .995 / 1.0 | .185 / .210 / .250 | ΔL ≥ .025 between steps |
| fill / fill-strong | .935 / .905 | .280 / .320 | – |
| border / border-strong | .905 / .860 | .300 / .350 | decorative |
| border-control | ≤ .645 | ≥ .540 | 3:1 on every surface (solved: ≤.670 / ≥.528) |
| text / text-2 / text-3 | .22 / .45 / .53 | .95 / .77 / .67 | 4.5:1 on all surfaces; text-2 ≥7:1 |
| disabled | .72 | .45 | exempt |

- **Contrast axis:**
  - `high`: text-2 .38/.84, text-3 = text-2, border .80/.42, control .50/.62.
  - `soft`: text .30/.90, border .93/.27.
  - Every value is re-solved and clamped back to the floors above.
- **Elevation in dark:** lighter means higher, the same as M3 (surface-container tones 6/10/12/17/22) and Linear's LCH elevation.

**Accent ramp** (Radix's 12-step semantics: 1–2 bg, 3–5 interactive, 6–8 borders, 9–10 solid, 11–12 text):
- L light `[.993 .983 .955 .925 .89 .85 .79 .71 S S−.04 T .30]`; dark `[.18 .21 .26 .30 .34 .38 .44 .52 S S+.04 T .93]`.
- C = Cpeak × `[.02 .05 .12 .2 .28 .36 .45 .6 1 1 .85 .5]`. Fit each step into the sRGB gamut by bisecting chroma; emit P3 chroma under `@media (color-gamut: p3)`.

**Solid fill S (step 9) and on-accent:**
1. Take the brand (L, C, h). If L ≤ solveL(white, 4.5): on-accent is white, keep the brand.
2. If L ≥ .70: on-accent is dark (L .20, the accent hue, C .03). Check 4.5:1. This is Radix's dark-text set: sky, mint, lime, yellow, amber.
3. In between: move L to solveL(white) − .01. Or, if the brand is about brightness, raise L to ≥ .70 and use dark text.

**accent-text:**
- Light: T = min(S, solveL(worst light surface, 4.5, ↓)) − .01, which lands at ~.52–.57.
- Dark: T = solveL(surface-3, 4.5, ↑) + .02 with C ≤ .13, which lands at ~.70–.76 and avoids neon.
- `--focus = accent-text`, so 3:1 against every surface is automatic.

**Dark mode:**
- Never invert. Use the dark L table and keep the accent solid near the same L (Radix style; the baseline's .55).
- The M3 alternative (primary tone 80 with dark on-primary) is opt-in for the `vivid` strategy.

**Status colours:**
- Fixed hues: danger 27, warning 75, success 150, info 245. Run each through the same solver.
- Warning in light mode is a glyph colour only.

**Strategy → chroma:**
- M3 source values, in HCT chroma:
  - TonalSpot: primary 36, secondary 16, tertiary 24 at h+60, neutral 6, neutral-variant 8.
  - Neutral: 12, 8, 16, 2, 2.
  - Vibrant: primary 200 (max); secondary/tertiary hue-rotated 10–35; neutral 10, neutral-variant 12.
  - Expressive: primary h+240 at C 40; neutral h+15 at C 8.
  - Fidelity/Content: primary = source chroma; secondary = max(C−32, C/2); neutral C/8; neutral-variant C/8+4.
  - Monochrome: all 0.
- Approximate conversion: OKLCH C ≈ HCT C × .0028 (calibrate).
- Mapping to A3: `mono` 0, `quiet` (peak .17–.20, neutral .003–.006), `wash` (neutral = accent hue at .008–.012), `vivid` (peak at gamut max, neutral .010), `dual` (second hue +60° at .6× chroma).

**M3 contrast curves** (contrast at levels −1 / 0 / .5 / 1), to borrow for A7:
- on_surface 4.5/7/11/21
- on_surface_variant 3/4.5/7/11
- primary 3/4.5/7/7
- outline 1.5/3/4.5/7
- outline_variant 1/1/3/4.5

**APCA as a second check** (a warning, not a failure, because WCAG 2 stays the legal floor):
- Body text Lc ≥ 75 (preferred 90).
- Secondary/meta text Lc ≥ 60.
- Placeholder and disabled Lc ≥ 30.
- Dividers and focus Lc ≥ 15.
- Use it mostly in dark mode, where WCAG over-credits light-on-dark.

**Leonardo's model is what `solveL` does:** a colour is defined by target ratios against the background. Leonardo's `contrast` multiplier is the A7 axis.

## 3. Reference card format
```yaml
id: B
name: Linear
url: https://linear.app            # live public surface only
captured: {date: 2026-10-16, viewports: [1440, 390], mode: dark}
register: operate                  # wwjd register
product_type: issue tracker
identity: "A dark, quiet, dense tool where structure comes from tone steps and hairlines; colour is almost absent."
sampled:                           # from screenshot pixels / computed style; approximate
  ground: {hex: "#08090A", oklch: [.139, .003, 246]}
  text:   {hex: "#F7F8F8", oklch: [.978, .001, 197]}
  accent: {hex: "#5E6AD2", oklch: [.567, .159, 275]}
  fonts: [Inter, Inter Display]
axes:                              # value + confidence 0-1
  type: {v: grotesk, c: .9}
  neutral: {v: cool/achromatic, c: .8}
  accent: {v: quiet, c: .8}        # "chrome contributes less" (Linear redesign post)
  surface: {v: tonal, c: .8}       # LCH-derived elevation
  shape: {v: crisp, c: .6}
  density: {v: compact, c: .9}
  contrast: {v: standard, c: .7}   # high-contrast theme offered
  elevation: {v: hairline, c: .7}
  motion: {v: instant, c: .5}
  imagery: {v: ui, c: .9}
signature: "Inter Display headings over a near-black tonal stack"
structure: "sidebar + list + detail; top bar thin"   # informs layout, never copied
do_not_take: [logo, illustrations, copy, icon set, product names]
```
**Stripe** (the same fields; sampled values are from memory, so re-sample from the screenshot):
- **Register:** persuade (marketing) and operate (dashboard).
- **Identity:** "A light, precise, finance-grade surface with navy ink, one saturated violet-blue and soft layered depth."
- **Sampled:**
  - Ground #F6F9FC (.981 .005 248)
  - Ink #0A2540 (.26 .06 251; text chroma well above the cap, which is the tell)
  - Body #425466 (.438 .037 249)
  - Accent #635BFF (.578 .235 278; white text passes just barely)
  - Font: Söhne, which is licensed, so it maps to `grotesk`.
- **Axes:**
  - type `grotesk`
  - neutral `cool/tinted`; text chroma is an exception that needs the owner's OK
  - accent `vivid` (marketing), `quiet` (dashboard)
  - surface `raised`
  - shape `standard`
  - density `regular`
  - elevation `layered` (blue-tinted shadows)
  - motion `smooth`
  - imagery `brand-shape` (their gradient: not transferable)

## 4. Variant strategy
- **Identity lock first:**
  - One identity sentence.
  - Locked axes: the register's fixed ones, the brand hue if given, the A7 floor, density if the product type dictates it.
  - Variants never touch locked axes.
- **Each variant moves 2–3 open axes.**
  - Distance = the number of axes that differ (A1–A4 weigh 1; A5, A8 and A9 weigh .5).
  - Each pair of variants: distance ≥ 2. Each variant vs the anchor: ≤ 4.
  - At most one "loud" step per variant (vivid, dual, round, springy, serif-display).
- **N:** 3 by default (A = baseline control, B, C), at most 5. Beyond 5 the variants converge or turn loud.
- **Assignment:** take the 3–4 open axes that matter most to the identity, then do a Latin-square sweep: each variant moves a different pair, so no two share the same move.
- **Reject filter** before showing anything: clash table, then `bans.md`, then the contrast lint. If any fails, drop the variant and regenerate. Never repair by hand.
- **Never varied in product UI:**
  - contrast floors and the focus ring
  - status hues and their meaning
  - control heights 28/32/36
  - the 4px space base
  - three text levels
  - icon library, size and stroke
  - primitives and behaviour
  - information architecture and layout from the brief
  - reduced-motion handling
- **No-direction mode** ("give me 5 variants"):
  - Every variant is a riff on one real reference: the brief's register and structure, plus the reference's axis vector, adapted to the content and the floor. Never invented from nothing.
  - **Picking N references, diverse but relevant:**
    1. Build a pool of 12–20 candidates from the per-register sources (§7).
    2. Score relevance (rubric in §8) and keep scores ≥ 3/5.
    3. Take the most relevant one first.
    4. Then use farthest-point sampling on the axis vectors: each next pick maximises its minimum distance to the picks so far.
  - **Diversity constraints:**
    - every pair differs on ≥ 3 axes
    - the set spans ≥ 2 neutral temperatures, ≥ 2 accent strategies and ≥ 2 type voices
    - at most 1 reference from a mood board
  - **Presentation:** a lettered board with one row per letter: the reference thumbnail (left), the variant screenshot (right), then one line: "Ref: Linear. Took: neutral, surface, density. Kept: brief layout."
  - **Mood boards are concept art:** Dribbble, Behance, Pinterest, Cosmos, Savee, Are.na, Collect UI and most of Muzli. They can supply A1, A2, A3 and A10 only, never structure, density or layout.

## 5. Interop (DESIGN.md, google-labs-code spec v "alpha")
- **Frontmatter keys:**
  - `name`, `description`
  - `colors`: `primary` (required by lint), `on-primary`, `secondary` (dual only), `neutral`, `surface`, `surface-2`, `surface-3`, `on-surface`, `on-surface-variant` (text-2), `on-surface-muted` (text-3), `outline` (border-control), `outline-variant` (border), `error`, `warning`, `success`, `info`, plus a `dark-*` mirror of the core roles
  - `typography`: `display`, `title`, `heading`, `body-md`, `body-sm`, `label-md`, `caption`, `mono`
  - `rounded`: `sm`/`md`/`lg`/`xl`/`full`
  - `spacing`: `xs`–`xl`
  - `components`: `button-primary`(`-hover`/`-active`), `button-secondary`, `input`, `card`, `popup`, `badge`
- **Spec limits:**
  - Components hold only 8 properties (bg, text, typography, rounded, padding, size, height, width).
  - The spec has no modes, so dark mode lives in the `dark-*` tokens. Unknown colour names are accepted.
- **Colour format: hex in the frontmatter.** impeccable's notes say Stitch lints sRGB hex only and OKLCH produces a warning. Canonical OKLCH lives in `look.css` and the Colors prose.
- **Body sections in spec order:** Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
  - The axis values go as one "Look:" bullet list in Overview.
  - The identity sentence opens Overview.
  - Shadows and motion go in prose plus the sidecar.
- **Sidecar `.wwjd/look.json`:** resolved axes, OKLCH ramps, reference letter and URL. This mirrors impeccable's `.impeccable/design.json` pattern.
  - Avoid a top-level `look:` key in the frontmatter until `npx @google/design.md lint` confirms it raises no `token-like-ignored` or `unknown-key` warning.
- **Verify:** `npx @google/design.md lint DESIGN.md` (its `contrast-ratio` rule checks component pairs at 4.5:1) and `export --format css-tailwind` for Tailwind v4 `@theme`.
- **Detect and defer:**
  - **Skills:** look for `impeccable/SKILL.md`, `design-taste-frontend` / `stitch-design-taste` (leonxlnx/taste-skill), and Google's `stitch-skills` (`design-md`, design-system manager) under `.claude/skills`, `~/.claude/skills`, `.agents/skills` and plugin dirs.
  - **Files:** `DESIGN.md`, `PRODUCT.md`, `.impeccable/design.json`, `.stitch/DESIGN.md`.
  - **Rules:**
    - An existing DESIGN.md wins (wwjd precedence #2). The look engine only fills axes it leaves open, never overwrites.
    - impeccable reads PRODUCT.md (register) plus DESIGN.md, so write both.
    - Upload to Stitch only through its skill or MCP, with user approval.
    - taste v1 dials map as VISUAL_DENSITY → A6 and MOTION_INTENSITY → A9; DESIGN_VARIANCE is layout, out of scope.

## 6. `look.mjs` sketch
- **Command:** `node look.mjs --look look.json [--variants 3 --sweep neutral,shape,type] [--card refs/B.yaml] --out .wwjd/`
- **Input `look.json`:**
  ```json
  {"identity":"…", "register":"operate",
   "brand":"#5E6AD2",
   "axes":{"type":"grotesk","neutral":"cool/quiet","accent":"quiet","surface":"tonal","shape":"crisp",
           "density":"compact","contrast":"standard","elevation":"hairline","motion":"crisp","imagery":"ui"},
   "lock":["register","brand","contrast"]}
  ```
- **Pipeline:**
  1. Parse: hex → OKLCH (the matrices from the prototype).
  2. Check the axes against `CLASHES` and `BANS`.
  3. Neutrals: fixed L table plus the contrast-axis offsets; chroma from the A2 preset; hue `n`.
  4. Accent: `solid()`, then `textL()`, then the ramp, then `fitChroma()` per step (bisect chroma until linear sRGB is in [0,1]).
  5. Status colours through the same solver.
  6. Radius, density, type, shadow and motion: preset lookup tables.
  7. **Contrast audit:** WCAG for every text × surface pair, both modes, plus APCA warnings. Exit 1 on any floor failure.
- **Outputs:**
  - `look.css`: `:root` with the same names as `starter.css`, so components stay untouched; `light-dark()`; `prefers-contrast` and P3 blocks.
  - `DESIGN.md` (§5) and `look.json` (resolved).
  - `audit.txt`.
  - With `--variants`: `look-B.css` etc. plus distance checks.
- **Core:**
  ```js
  const solveL=(bg,C,h,t,dir)=>{let lo=dir<0?0:bg[0],hi=dir<0?bg[0]:1;
    for(let i=0;i<30;i++){const m=(lo+hi)/2,ok=wcag([m,fit(m,C,h),h],bg)>=t;
      dir<0?(ok?lo=m:hi=m):(ok?hi=m:lo=m)}return dir<0?lo:hi};
  const solid=(L,C,h)=>L<=solveL(WHITE,C,h,4.5,-1)?{L,on:WHITE}
    :L>=.70?{L,on:[.2,.03,h]}:{L:solveL(WHITE,C,h,4.5,-1)-.01,on:WHITE};
  ```
- **Prototype:** became `skills/wwjd-look/scripts/look.mjs` (OKLCH→sRGB, gamut fit, WCAG, solveL).

## 7. Reference sources (checked 2026-10-16)
Ranked per register. All are free unless marked. **PW** = rendered in the Playwright MCP's Chromium while plain curl was blocked; pure headless mode was not tested. **Live** = links out to the real site, which is what gets screenshotted.

| Register | Ranked sources (URL filter) | Notes |
|---|---|---|
| **Landing / marketing** | 1 Lapa Ninja `/category/saas/` (PW, live) · 2 Saaspo `/page-types/saas-pricing-page-examples`, `/industry/<x>-saas-websites-inspiration` (PW) · 3 Land-book `/design/pricing-page`, `?view=mobile` (PW, live; full shots Pro) · 4 One Page Love `/genre/saas`, `?s=` (server-rendered, live) | Backups: SaaS Landing Page `/tag/devtools/` `?s=`, Landingfolio `/inspiration/landing-page/saas`, Framer `/community/gallery/categories/saas/`, Minimal Gallery `/tag/saas/`, Httpster `/style/dark/`, Curated (Pro $9), Awwwards `/websites/saas/` (skews to showpieces), recent.design (ex-Godly; category filter effect unverified) |
| **Product web app** | 1 Refero `/search?q=dashboard` (search free, Pro for full; its own captures) · 2 SaaSframe `/categories/<x>` · 3 the category's best real products directly · 4 Nicelydone (6 free previews) | App UI is behind login. Use captures, never log in |
| **Mobile** | 1 Refero `/ios-apps` · 2 Apple Design Awards (no filter) · 3 Mobbin (login; **MCP with the owner's account only**) · 4 Page Flows (paid) | ScreensDesign: login and paid |
| **Dashboards** | 1 SaaSframe `/categories/dashboard` · 2 Refero search · 3 public demo dashboards of real products · 4 Muzli `search.muz.li/search/dashboard` (look only) | dashboarddesignpatterns.github.io is a taxonomy, not a gallery |
| **Docs** | 1 the leading products' docs directly (Stripe, Vercel and similar) · 2 Nicelydone `/pages/documentation` · 3 Saaspo/SaaSframe changelog page types | No living docs gallery |
| **Editorial** | 1 Siteinspire `/websites/category/typographic` (PW, live) · 2 The Pudding, NYT and Guardian graphics as live sites · 3 recent.design `?category=editorial` (unverified) · 4 Are.na `/search/<q>` | |
| **Commerce** | 1 Shopify theme demo stores `themes.shopify.com/themes?industry[]=…` · 2 Siteinspire `/websites/category/e-commerce` · 3 Baymard `/ecommerce-design-examples/<n>-product-page` (screens free, findings Premium) · 4 Awwwards `/websites/e-commerce/` | |
| **Mood only** | Dribbble `/search/<q>` (PW) · Behance `/search/projects?search=` · Pinterest `/search/pins/?q=` (~25 pins, then a wall) · Cosmos `/search/elements/<q>` · Are.na · Collect UI · Muzli. **Savee search needs login** | Look inspiration only, never layout truth |
| **Direct** | WebSearch `best <category> software 2026`, `<category> alternatives 2026`, G2 categories, Product Hunt `/topics/<x>`; shortlist 5–8 leaders or design-led products | Screenshot public surfaces only: home, /pricing, /changelog, /docs, demos, template galleries |

- **Bot walls:** never solve or evade a challenge. If Playwright is blocked, skip the source.
- **Prefer the gallery's "Visit" link** and screenshot the live site.

## 8. Gather procedure
1. **Queries:** turn the ask into 2–3 queries of category + register + mood, e.g. "invoicing dashboard light dense", "fintech pricing page calm".
2. **Pick 6–8 candidates.** Resemblance rubric, 0–5:
   - register match (2)
   - layout or structure match (1)
   - product-type match (1)
   - look matches stated mood (1)
   - mood-board sources are capped at 3
3. **Screenshot:**
   - 1440×900 above the fold plus full page; add 390×844 when mobile-first.
   - Playwright, light and dark if offered. `waitUntil: networkidle`, dismiss cookie banners, no logins.
4. **Board:** an Artifact or local HTML. Per row: letter, name, URL, thumbnail, one line on why it fits, the implied axis vector (the card), confidence.
5. **Ethics and storage:**
   - Screenshots are for internal comparison only. Store them in a gitignored `.wwjd/refs/`.
   - Never copy assets, copy text, code, logos, icon sets, trademarks or licensed fonts. Map fonts to the open preset with the same job.
   - Respect robots.txt and rate limits. Use Mobbin and Refero only via their MCPs.
   - Never publish the board publicly.

## 9. Pick → tokens
- **One pick:** the card's axes become `look.json`, the brief's locks win over the card, then run `look.mjs` to get `look.css` + `DESIGN.md`.
  - Values with confidence < .5 fall back to the baseline preset.
  - The reference's sampled accent is never used. The product's brand hue goes into A3.
- **Mixes** ("A's type, C's density"): take axis-wise values from each card, run the clash table, and if a clash shows, say which axis loses in one line.
- **"You pick":** choose the reference with the highest relevance score that passes the clash and ban filters with no overrides. State the reason in one line, e.g. "B: same register and density as the brief; its quiet accent fits a work tool."
- **After the pick:** offer 2 sweep variants (§4) on the chosen identity.

**Open decisions:**
1. **Where does dark mode go in DESIGN.md:** `dark-*` colour tokens in the frontmatter, or only in `look.css` plus the sidecar? Default: `dark-*` tokens for the core 8 roles.
2. **Stitch's hex-only lint vs OKLCH as the source of truth:** default is hex in the frontmatter, OKLCH canonical in `look.css`.
3. **impeccable's `document.md` says DESIGN.md has 6 sections; the spec has 8** (Layout, Shapes). Default: follow the spec's 8.
4. **Allow ink-chroma above the .03 text cap** (Stripe-style navy) as an opt-in? Default: no, unless a reference card justifies it.

Sources:
- DESIGN.md: [repo](https://github.com/google-labs-code/design.md), [spec](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md)
- Radix: [Theme](https://www.radix-ui.com/themes/docs/components/theme), [Color](https://www.radix-ui.com/themes/docs/theme/color), [Composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)
- Material: [MCU dynamic_scheme.ts, color_spec_2021.ts](https://github.com/material-foundation/material-color-utilities)
- Linear: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Other systems: [Geist colors](https://vercel.com/geist/colors), [Primer color](https://primer.style/foundations/primitives/color)
- Contrast: [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html), [Leonardo API](https://leonardocolor.io/api.html)
- Skills: [taste-skill](https://github.com/leonxlnx/taste-skill), [Stitch skills (design-md)](https://vibeindex.ai/skills/google-labs-code/stitch-skills/design-md)
- Galleries: [Mobbin terms](https://mobbin.com/terms.md), [Mobbin MCP](https://mobbin.com/mcp.md), [Refero MCP](https://doc.refero.design/mcp/getting-started)

**Not verified:**
- the M3 Expressive spring values (only third-party numbers found)
- Apple's material tiers
- Refero's terms
- recent.design and Curated category filters
- pure-headless (non-MCP) screenshotting of the Cloudflare-walled galleries
