#!/usr/bin/env node
// look.mjs: a look (10 axes) → contrast-solved tokens.css + DESIGN.md + .wwjd/look.json (project root). No deps, Node 20.10+.
//   node look.mjs --look look.json [--out .] [--tokens <file>] [--design DESIGN.md] [--force] [--verbose]
//   node look.mjs --look look.json --variants 3 [--sweep neutral,surface,type]   → .wwjd/variants/A….{json,css}
//   node look.mjs --card .wwjd/refs/B.yaml [--brand "#5E6AD2"] [--register operate]   → look.json on stdout
//   node look.mjs --pick 5 .wwjd/refs/*.yaml                                          → relevant, mutually distant refs
// --look also takes a DESIGN.md this script wrote (reads its <!-- wwjd:look … --> line).
// Exit 1: a clash or ban rejected the look, or a contrast floor failed. Exit 2: usage.
import fs from 'node:fs';
import path from 'node:path';

// ── Colour math: OKLCH, gamut fit by chroma bisection, WCAG on XYZ Y, APCA as a warning ──
const D = Math.PI / 180, WHITE = [1, 0, 0];
const mul = (M, v) => M.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const lms = ([L, C, h]) => { const a = C * Math.cos(h * D), b = C * Math.sin(h * D);
  return [(L + .3963377774 * a + .2158037573 * b) ** 3, (L - .1055613458 * a - .0638541728 * b) ** 3, (L - .0894841775 * a - 1.291485548 * b) ** 3]; };
const SRGB = [[4.0767416621, -3.3077115913, .2309699292], [-1.2684380046, 2.6097574011, -.3413193965], [-.0041960863, -.7034186147, 1.707614701]];
const XYZ = [[1.2270138511, -.5577999807, .281256149], [-.0405801784, 1.1122568696, -.0716766787], [-.0763812845, -.4214819784, 1.5861632204]];
const P3 = [[2.4934969119, -.9313836179, -.4027107845], [-.8294889696, 1.7626640603, .0236246858], [.0358458302, -.0761723893, .956884524]]
  .map(r => [0, 1, 2].map(j => r[0] * XYZ[0][j] + r[1] * XYZ[1][j] + r[2] * XYZ[2][j]));
const inG = (c, M) => mul(M, lms(c)).every(v => v > -1e-4 && v < 1 + 1e-4);
const fit = (c, M = SRGB) => { if (inG(c, M)) return c; let lo = 0, hi = c[1];
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; inG([c[0], m, c[2]], M) ? lo = m : hi = m; } return [c[0], lo, c[2]]; };
const Y = (c, M) => Math.max(0, mul([XYZ[1]], lms(fit(c, M)))[0]);
const cr = (a, b, M = SRGB) => { const y = Y(a, M), z = Y(b, M); return (Math.max(y, z) + .05) / (Math.min(y, z) + .05); };
const solve1 = (bg, C, h, t, dir, M) => { let lo = dir < 0 ? 0 : bg[0], hi = dir < 0 ? bg[0] : 1;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2, ok = cr([m, C, h], bg, M) >= t; dir < 0 ? (ok ? lo = m : hi = m) : (ok ? hi = m : lo = m); }
  return dir < 0 ? lo : hi; };
// L reaching contrast t against bg, going darker (dir −1) or lighter (+1); holds in sRGB and P3
const solveL = (bg, C, h, t, dir) => (dir < 0 ? Math.min : Math.max)(solve1(bg, C, h, t, dir, SRGB), solve1(bg, C, h, t, dir, P3));
const gam = v => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055;
const rgb = c => mul(SRGB, lms(fit(c))).map(v => gam(Math.min(1, Math.max(0, v))));
const hex = c => '#' + rgb(c).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const fromHex = hx => { const n = parseInt(hx.replace('#', '').replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3'), 16);
  const li = v => (v /= 255) <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4, [r, g, b] = [n >> 16, n >> 8 & 255, n & 255].map(li);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, B = .0259040371 * l + .7827717662 * m - .808675766 * s;
  return [.2104542553 * l + .793617785 * m - .0040720468 * s, Math.hypot(A, B), (Math.atan2(B, A) / D + 360) % 360]; };
const parseCol = s => /^#/.test(s) ? fromHex(s) : String(s).match(/-?[\d.]+/g).slice(0, 3).map(Number);
const apca = (t, b) => { const ys = c => { const [r, g, bl] = rgb(c), y = .2126729 * r ** 2.4 + .7151522 * g ** 2.4 + .072175 * bl ** 2.4; return y < .022 ? y + (.022 - y) ** 1.414 : y; };
  const T = ys(t), B = ys(b), s = B > T ? (B ** .56 - T ** .57) * 1.14 : (B ** .65 - T ** .62) * 1.14;
  return Math.abs(s) < .1 ? 0 : Math.round(Math.abs(s) * 100 - 2.7); };
const hd = (p, q) => { const d = Math.abs(p - q) % 360; return Math.min(d, 360 - d); };
const f = (v, d = 3) => String(+(+v).toFixed(d)).replace(/^(-?)0\./, '$1.');

// ── Axes and presets (references/axes.md is the prose twin) ──
const AXES = ['type', 'neutral', 'accent', 'surface', 'shape', 'density', 'contrast', 'elevation', 'motion', 'imagery'];
const W = { type: 1, neutral: 1, accent: 1, surface: 1, shape: .5, density: 1, contrast: 1, elevation: .5, motion: .5, imagery: 1 };
const TEMP = { stone: 70, cool: 255, warm: 55, sage: 165, mauve: 310 }, CHROMA = { quiet: .004, achromatic: 0, tinted: .012 };
const SYS = 'system-ui, -apple-system, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const INTER = `"Inter", ui-sans-serif, ${SYS}`, MONO = 'ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace';
const GF_INTER = 'Inter:opsz,wght@14..32,400..600';
const TYPE = {
  grotesk: { sans: INTER, w: 600, tr: -.02, gf: GF_INTER, d: 'Inter for everything; optical sizing tightens display sizes' },
  native: { sans: SYS, w: 600, tr: -.01, d: 'the platform system face (SF, Segoe, Roboto), so it feels part of the OS' },
  humanist: { sans: `"Source Sans 3", "IBM Plex Sans", ${SYS}`, w: 600, tr: 0, gf: 'Source+Sans+3:wght@400..600', d: 'Source Sans 3: open, friendly letterforms for reading and forms' },
  'serif-display': { sans: INTER, disp: '"Source Serif 4", ui-serif, Georgia, "Times New Roman", serif', w: 500, tr: -.01, gf: `${GF_INTER}&family=Source+Serif+4:opsz,wght@8..60,400..600`, d: 'Source Serif 4 for display and titles over an Inter body' },
  'mono-label': { sans: INTER, mono: `"IBM Plex Mono", ${MONO}`, w: 600, tr: -.02, gf: `${GF_INTER}&family=IBM+Plex+Mono:wght@400;500`, d: 'Inter, with IBM Plex Mono for IDs, codes and data cells (never as a label voice)' } };
// Custom faces ("fonts": {"display": "\"Archivo\", sans-serif"}) load from Google Fonts; an override replaces the preset's face
// for its role, and only faces in use are loaded.
const famOf = f => (String(f || '').match(/^\s*"([^"]+)"/) || [])[1];
// Google Fonts families with one weight (400): a wght range makes Google drop the family, and a 600 heading would be faux bold.
const SINGLE = new Set(['young serif', 'dm serif display', 'dm serif text', 'abril fatface', 'alfa slab one', 'bebas neue', 'instrument serif',
  'anton', 'archivo black', 'gloock', 'calistoga', 'fjalla one', 'staatliches', 'ultra', 'shrikhand', 'titan one', 'russo one', 'bungee',
  'rubik mono one', 'righteous', 'lobster', 'pacifico', 'monoton', 'rammetto one', 'bowlby one', 'black ops one']);
const wt = (f, w) => SINGLE.has(String(famOf(f) || '').toLowerCase()) ? 400 : w;
const faces = (T, fonts = {}) => ({ sans: fonts.sans || T.sans, display: fonts.display || T.disp, mono: fonts.mono || T.mono });
const gfLink = (T, fonts = {}) => {
  const preset = T.gf ? T.gf.split('&family=') : [], plus = n => n.replace(/ /g, '+');
  return [...new Set(Object.values(faces(T, fonts)).map(famOf).filter(Boolean).map(n => preset.find(p => p.split(':')[0] == plus(n))
    || (SINGLE.has(n.toLowerCase()) ? plus(n) : `${plus(n)}:wght@400..700`)))].join('&family=');
};
const VALUES = { type: Object.keys(TYPE), neutral: Object.keys(TEMP).flatMap(t => Object.keys(CHROMA).map(c => `${t}/${c}`)),
  accent: ['quiet', 'mono', 'wash', 'vivid', 'dual'], surface: ['tonal', 'flat', 'raised', 'chrome', 'translucent'],
  shape: ['sharp', 'crisp', 'standard', 'soft', 'round'], density: ['compact', 'regular', 'comfortable', 'spacious'],
  contrast: ['soft', 'standard', 'high'], elevation: ['flat', 'hairline', 'soft', 'layered'], motion: ['instant', 'crisp', 'smooth', 'springy'],
  imagery: ['ui', 'photo', 'line-illustration', 'diagram', 'brand-shape'] };
const BASE = { type: 'grotesk', neutral: 'stone/quiet', accent: 'quiet', surface: 'tonal', shape: 'standard', density: 'regular', contrast: 'standard', elevation: 'hairline', motion: 'crisp', imagery: 'ui' };
const LOUD = new Set(['vivid', 'dual', 'round', 'springy', 'serif-display']);
const SHAPE = { sharp: [0, 2, 2, 4], crisp: [2, 4, 6, 8], standard: [4, 6, 8, 12], soft: [6, 8, 12, 16], round: [8, 10, 16, 24] };
const DENS = { // control, row, [size, line-height] for caption, body, heading, title, display
  compact: [28, 32, [[12, 16], [13, 18], [15, 20], [18, 24], [24, 30]]], regular: [32, 36, [[12, 16], [14, 20], [16, 24], [20, 28], [28, 34]]],
  comfortable: [36, 44, [[12, 16], [14, 20], [16, 24], [20, 28], [28, 34]]],
  spacious: [40, 52, [[14, 20], [16, 24], [20, 28], ['clamp(24px, 1.5vw + 18px, 32px)', 1.25], ['clamp(32px, 4vw + 16px, 56px)', 1.1]]] };
const DESC = {
  accent: { quiet: 'one accent for the primary action, links, selection and focus; under ~5% of the view', mono: 'no hue: the primary action is ink; colour appears only in status', wash: 'grays carry the accent hue; selection and hover are tinted', vivid: 'a high-chroma accent that may fill navigation and hero moments', dual: 'a second hue (+60°) marks one secondary category; the accent still leads' },
  surface: { tonal: 'ground darker than panes; layers separate by lightness steps before borders', flat: 'one surface; hairlines carry structure', raised: 'white cards on a pale ground', chrome: 'a dark sidebar/chrome over light content (--chrome-* tokens)', translucent: 'platform material (--surface-material + blur) on bars and sheets only' },
  shape: { sharp: 'square corners', crisp: 'small radii', standard: 'medium radii', soft: 'soft radii', round: 'large radii, pill buttons' },
  contrast: { soft: 'softer ink and hairlines; the floors still hold', standard: 'standard', high: 'no third text level, 4.5:1 borders, 3px focus' },
  elevation: { flat: 'no shadows; overlays get a 1px ring', hairline: 'borders on panes; shadows on overlays only', soft: 'cards get a soft shadow in light mode (--shadow-card)', layered: 'layered, neutral-tinted shadows on cards (light mode) and overlays' } };
const TREND = /space grotesk|instrument serif|fraunces|syne|bricolage|satoshi|clash/i;
const CLASH = [
  ['serif-compact', x => x.type == 'serif-display' && x.density == 'compact', 'serif display type needs room; compact density crushes it'],
  ['mono-persuade', x => x.type == 'mono-label' && /persuade|showcase/.test(x.register), 'mono type in a Persuade hero reads as "technical voice" (bans.md)'],
  ['warm-editorial', x => x.chroma == 'tinted' && /warm|stone/.test(x.temp) && x.accent != 'mono' && x.hue >= 20 && x.hue <= 75, 'a warm tinted ground with an orange/terracotta accent is the "warm editorial" generated look (bans.md lane 1)'],
  ['tint-off-hue', x => x.chroma == 'tinted' && !['mono', 'wash'].includes(x.accent) && hd(TEMP[x.temp], x.hue) > 45, 'a tinted gray must share the accent hue: use accent "wash" or a quiet neutral'],
  ['dual-tinted', x => x.accent == 'dual' && x.chroma == 'tinted', 'two hues over a tinted gray is three colours fighting'],
  ['loud-product', x => /vivid|dual/.test(x.accent) && /operate|monitor/.test(x.register), 'in a work tool colour means attention; vivid or dual accents spend it on chrome'],
  ['glass', x => x.surface == 'translucent' && x.register != 'native', 'translucent surfaces are Native-only (glass ban; one frosted sticky bar is fine)'],
  ['raised-flat', x => x.surface == 'raised' && x.elevation == 'flat', 'raised cards need a shadow or border to rise; flat elevation removes it'],
  ['chrome-wash', x => x.surface == 'chrome' && x.accent == 'wash', 'a dark chrome plus accent-tinted grays muddies both'],
  ['round-compact', x => x.shape == 'round' && x.density == 'compact', 'large radii on 28px controls turn every control into a pill'],
  ['sharp-shadow', x => x.shape == 'sharp' && /soft|layered/.test(x.elevation), 'soft shadows on square corners read as a rendering bug'],
  ['spacious-work', x => x.density == 'spacious' && /operate|monitor/.test(x.register), 'spacious density hides the data in a work tool'],
  ['compact-read', x => x.density == 'compact' && /persuade|editorial|showcase/.test(x.register), 'compact density on a page meant to be read or to sell'],
  ['soft-monitor', x => x.contrast == 'soft' && x.register == 'monitor', 'soft contrast fails long glances at a monitor'],
  ['soft-tinted', x => x.contrast == 'soft' && x.chroma == 'tinted', 'soft contrast on tinted grays goes muddy'],
  ['layered-flat', x => x.elevation == 'layered' && x.surface == 'flat', 'layered shadows over one flat surface make everything float'],
  ['springy-work', x => x.motion == 'springy' && /operate|monitor|flow|transact/.test(x.register), 'springs in a work tool or checkout slow every repeated action'],
  ['brand-shape', x => x.imagery == 'brand-shape' && !x.brandAsset, 'brand-shape imagery needs a shape the brand owns ("brandAsset": true)'],
  ['photo-mono', x => x.imagery == 'photo' && x.type == 'mono-label', 'photography plus mono data type mixes two voices'],
  ['imagery-product', x => x.imagery != 'ui' && /operate|monitor|flow|converse/.test(x.register), 'product registers show the real UI; imagery is fixed to ui'],
  ['indigo-default', x => !x.brand && x.accent != 'mono' && x.hue >= 265 && x.hue <= 320, 'an indigo/violet accent without a brand is the generated default (bans.md); give a brand hex or another hue'],
  // bans are for new choices: the project's own faces ("lock": ["fonts"]) stay whatever they are
  ['trend-font', x => !x.lock?.includes('fonts') && TREND.test(JSON.stringify(x.fonts || {})), 'a trend face (bans.md lane 5): pick by job, or keep the project font (its own faces: "lock": ["fonts"])'],
  ['ink-chroma', x => x.inkChroma > .03, 'ink chroma above the .03 cap needs a reference card and the owner\'s OK'] ];

const die = (msg, code = 2) => { console.error(msg); process.exit(code); };
const normNeutral = v => { const p = String(v).split('/'); const t = p.find(q => q in TEMP) || 'stone', c = p.find(q => q in CHROMA) || 'quiet'; return `${t}/${c}`; };
const norm = (k, v) => k == 'neutral' ? normNeutral(v ?? BASE.neutral) : (v ?? BASE[k]);
const axesOf = look => Object.fromEntries(AXES.map(k => [k, norm(k, look.axes?.[k])]));
function resolve(look) {
  const ax = axesOf(look);
  for (const k of AXES) if (!VALUES[k].includes(ax[k])) die(`unknown ${k} "${ax[k]}"; one of: ${VALUES[k].join(', ')}`);
  for (const k of Object.keys(look.axes || {})) if (!AXES.includes(k)) die(`unknown axis "${k}"; axes: ${AXES.join(', ')}`);
  const [temp, chroma] = ax.neutral.split('/'), brand = look.brand ? fromHex(look.brand) : null;
  return { ...ax, temp, chroma, brand, brandLch: brand, hue: brand ? brand[2] : (look.hue ?? 258), register: (look.register || 'operate').toLowerCase(),
    brandAsset: look.brandAsset, fonts: look.fonts, inkChroma: look.inkChroma, lock: [].concat(look.lock || []) };
}
const clashes = (x, allow = []) => CLASH.filter(([id, t]) => t(x) && !allow.includes(id)).map(([id, , m]) => `${m} [${id}]`);

// ── Build: fixed neutral L table + per-role chroma, solved accent/status, audit ──
const NROLES = ['surface-1', 'surface-2', 'surface-3', 'fill', 'fill-strong', 'border', 'border-strong', 'border-control', 'text', 'text-2', 'text-3', 'text-disabled'];
const LT = { l: [.970, .995, 1, .935, .905, .905, .860, .645, .22, .45, .53, .72], d: [.185, .210, .250, .280, .320, .300, .350, .540, .95, .77, .67, .45] };
const MULT = { l: [.75, .375, 0, 1, 1.25, 1, 1.25, 1.5, 2, 2, 1.75, 1.25], d: [.75, .75, 1, 1, 1.25, 1, 1.25, 1.5, .75, 1.25, 1.25, 1.25] };
const S3 = ['surface-1', 'surface-2', 'surface-3'];
const DMD = [['primary', 'accent'], ['on-primary', 'on-accent'], ['primary-hover', 'accent-hover'], ['link', 'accent-text'], ['secondary', 'accent-2'],
  ['neutral', 'fill'], ['surface', 'surface-1'], ['surface-2', 'surface-2'], ['surface-3', 'surface-3'], ['on-surface', 'text'], ['on-surface-variant', 'text-2'],
  ['on-surface-muted', 'text-3'], ['outline', 'border-control'], ['outline-variant', 'border'], ['error', 'danger'], ['error-solid', 'danger-solid'],
  ['warning', 'warning'], ['success', 'success'], ['info', 'info']];
const DARK = ['primary', 'on-primary', 'link', 'neutral', 'surface', 'surface-2', 'surface-3', 'on-surface', 'on-surface-variant', 'on-surface-muted', 'outline', 'outline-variant', 'error'];
const toRole = k => (DMD.find(([d]) => d == k) || [, k])[1];

function build(look, x) {
  const notes = [], R = {}, pinned = new Set(), M = ['l', 'd'];
  const n = x.accent == 'wash' ? x.hue : TEMP[x.temp], Cn = x.accent == 'wash' ? Math.max(CHROMA[x.chroma], .009) : CHROMA[x.chroma], a = x.hue;
  const lt = { l: [...LT.l], d: [...LT.d] }, set = (m, role, L) => { lt[m][NROLES.indexOf(role)] = L; };
  if (x.surface == 'flat') { set('l', 'surface-1', .995); set('d', 'surface-1', .21); }
  if (x.surface == 'raised') { set('l', 'surface-1', .955); set('l', 'surface-2', 1); set('d', 'surface-1', .165); set('d', 'surface-2', .215); set('d', 'surface-3', .255); }
  const hi = { l: { text: .18, 'text-2': .38, 'text-3': .38, border: .80, 'border-strong': .75, 'border-control': .50 }, d: { text: .97, 'text-2': .84, 'text-3': .84, border: .42, 'border-strong': .48, 'border-control': .62 } };
  if (x.contrast == 'high') for (const m of M) for (const [r, L] of Object.entries(hi[m])) set(m, r, L);
  if (x.contrast == 'soft') { set('l', 'text', .30); set('l', 'border', .93); set('l', 'border-strong', .89); set('d', 'text', .90); set('d', 'border', .27); set('d', 'border-strong', .31); }
  NROLES.forEach((r, i) => { R[r] = { v: 'n' }; for (const m of M) R[r][m] = [lt[m][i], Math.min(/^text/.test(r) ? .03 : .02, Cn * MULT[m][i]), n]; });
  if (x.inkChroma) for (const [r, k] of [['text', 1], ['text-2', .6], ['text-3', .5]]) for (const m of M) R[r][m][1] = x.inkChroma * k;
  const pin = () => { for (const [k, v] of Object.entries(look.fixed || {})) { const m = k.startsWith('dark-') ? 'd' : 'l', role = toRole(k.replace(/^dark-/, ''));
    if (R[role] && !pinned.has(m + role)) { R[role][m] = parseCol(v); R[role].v = null; pinned.add(m + role); } } };
  pin();
  const clamp = (role, bgs, t, m, dir = m == 'l' ? -1 : 1) => { if (pinned.has(m + role)) return; const c = R[role][m];
    if (bgs.every(b => cr(c, R[b][m]) >= t && cr(c, R[b][m], P3) >= t)) return;
    const lim = bgs.map(b => solveL(R[b][m], c[1], c[2], t, dir)), L = dir < 0 ? Math.min(c[0], Math.min(...lim) - .004) : Math.max(c[0], Math.max(...lim) + .004);
    if (Math.abs(L - c[0]) > .0005) { notes.push(`${m == 'l' ? 'light' : 'dark'} ${role} L ${f(c[0])}→${f(L)} (${t}:1)`); c[0] = L; } };
  for (const m of M) { clamp('text', [...S3, 'fill', 'fill-strong'], 4.5, m); clamp('text-2', [...S3, 'fill'], 4.5, m); clamp('text-3', S3, 4.5, m); clamp('border-control', S3, 3, m); }

  // Accent: solid S (white or dark text on it), hover, text; dark keeps S near the same L (never inverted)
  // A near-neutral brand has C ≈ 0, so C − .02 would go negative: CSS clamps that to 0 while the math would flip the hue.
  // Clamp derived chroma at 0 so what is solved and audited is what renders.
  const pc = v => Math.max(0, v), ac = (l, d, v = 'a') => ({ l: [l[0], pc(l[1]), l[2]], d: [d[0], pc(d[1]), d[2]], v }), C0 = x.brandLch ? x.brandLch[1] : .19;
  let on, onD;
  if (x.accent == 'mono') {
    const tl = R.text.l, td = R.text.d;
    R.accent = ac([...tl], [...td], 'n'); R['accent-hover'] = ac([tl[0] + .1, tl[1], n], [td[0] - .08, td[1], n], 'n'); R['accent-text'] = ac([...tl], [...td], 'n');
    on = WHITE; onD = [.2, Cn * .75, n];
  } else {
    const C = x.accent == 'vivid' ? Math.max(C0, fit([x.brandLch?.[0] ?? .53, .4, a], P3)[1]) : Math.min(C0, .2), wl = c => solveL(WHITE, c, a, 4.5, -1);
    let L = x.brandLch ? x.brandLch[0] : .53, dk = false;
    if (L > wl(C)) { if (L >= .70) dk = true; else if (.70 - L < L - (wl(C) - .01)) { L = .70; dk = true; } else { notes.push(`accent L ${f(L)}→${f(wl(C) - .01)} so white text passes`); L = wl(C) - .01; } }
    on = onD = dk ? [.2, .03, a] : WHITE;
    if (dk) L = Math.max(L, solveL(on, C, a, 4.5, 1) + .005);
    const Ld = dk ? L : Math.min(L + .02, wl(pc(C - .02)) - .01), Ct = Math.min(.13, C * .63), sgn = dk ? 1 : -1;
    R.accent = ac([L, C, a], [Ld, C - .02, a]); R['accent-hover'] = ac([L + .04 * sgn, C - .01, a], [Ld + .04 * sgn, C - .02, a]);
    R['accent-text'] = ac([Math.min(L - .02, ...S3.map(s => solveL(R[s].l, pc(C - .01), a, 4.5, -1) - .01)), C - .01, a],
      [Math.max(.76, ...S3.map(s => solveL(R[s].d, Ct, a, 4.5, 1) + .02)), Ct, a]);
    if (x.accent == 'dual') { const a2 = look.brand2 ? fromHex(look.brand2)[2] : (a + 60) % 360, C2 = C * .6;
      R['accent-2'] = ac([Math.min(...S3.map(s => solveL(R[s].l, C2, a2, 4.5, -1))) - .01, C2, a2], [Math.max(.74, ...S3.map(s => solveL(R[s].d, C2 * .8, a2, 4.5, 1) + .02)), C2 * .8, a2], null); }
  }
  R['on-accent'] = ac(on, onD, null); pin(); on = R['on-accent'].l; onD = R['on-accent'].d;

  // Status: fixed hues through the same solver; danger moves off an accent within 20°
  const ST = { danger: [[.55, .20, 27], [.71, .17, 25]], warning: [[.64, .145, 62], [.80, .14, 80]], success: [[.53, .13, 150], [.74, .14, 150]], info: [[.53, .13, 245], [.75, .11, 245]] };
  let dh = 27;
  if (x.accent != 'mono' && hd(a, 27) < 20) { dh = a > 27 ? 20 : 35; notes.push(`danger hue 27→${dh}: the accent (${Math.round(a)}) sits within 20° of it`); }
  for (const [k, [l, d]] of Object.entries(ST)) R[k] = { l: k == 'danger' ? [l[0], l[1], dh] : [...l], d: k == 'danger' ? [d[0], d[1], dh - 2] : [...d], v: null };
  pin();
  for (const m of M) for (const k of Object.keys(ST)) clamp(k, S3, k == 'warning' && m == 'l' ? 3 : 4.5, m);
  const solid = (o, L0, C) => o === WHITE || o[0] > .5 ? Math.min(L0, solveL(o, C, dh, 4.5, -1) - .01) : Math.max(.70, solveL(o, C, dh, 4.5, 1) + .01);
  const sl = solid(on, .54, .20), sd = solid(onD, .55, .19), dl = on[0] > .5 ? -.04 : .04, dd = onD[0] > .5 ? -.04 : .04;
  R['danger-solid'] = { l: [sl, .20, dh], d: [sd, .19, dh], v: null }; R['danger-solid-hover'] = { l: [sl + dl, .19, dh], d: [sd + dd, .18, dh], v: null };
  if (x.surface == 'chrome') { const c = Math.min(.02, Cn * 1.5);
    Object.assign(R, { 'chrome-bg': { l: [.24, c, n], d: [.155, c, n], v: 'n' }, 'chrome-text': { l: [.95, c, n], d: [.95, c, n], v: 'n' },
      'chrome-text-2': { l: [.76, c, n], d: [.74, c, n], v: 'n' }, 'chrome-border': { l: [.33, c, n], d: [.25, c, n], v: 'n' } });
    for (const m of M) clamp('chrome-text-2', ['chrome-bg'], 4.5, m, 1); }
  pin(); for (const k of Object.keys(look.fixed || {})) if (!R[toRole(k.replace(/^dark-/, ''))]) notes.push(`fixed "${k}" has no token here; ignored`);
  return { R, notes, n, a, Cn, on, onD };
}

const PAIRS = [['text', [...S3, 'fill', 'fill-strong'], 4.5], ['text-2', [...S3, 'fill'], 4.5], ['text-3', S3, 4.5], ['accent-text', S3, 4.5],
  ['on-accent', ['accent', 'accent-hover', 'danger-solid', 'danger-solid-hover'], 4.5], ['danger', S3, 4.5], ['success', S3, 4.5], ['info', S3, 4.5],
  ['warning', S3, [3, 4.5]], ['border-control', S3, 3], ['accent-2', S3, 4.5], ['chrome-text', ['chrome-bg'], 4.5], ['chrome-text-2', ['chrome-bg'], 4.5]];
const LC = { text: 75, 'text-2': 60, 'text-3': 30, 'border-control': 15 }; // APCA: body, secondary, placeholder tier, edges
function audit({ R }) {
  const fails = [], warns = []; let pairs = 0, minT = 99, minE = 99;
  for (const [mi, m] of ['l', 'd'].entries()) for (const [fg, bgs, t0] of PAIRS) { if (!R[fg]) continue;
    const t = Array.isArray(t0) ? t0[mi] : t0;
    for (const bg of bgs) { if (!R[bg]) continue; pairs++;
      const r = Math.min(cr(R[fg][m], R[bg][m], SRGB), cr(R[fg][m], R[bg][m], P3)), tag = `${m == 'l' ? 'light' : 'dark'} ${fg} on ${bg}`;
      if (t == 3) minE = Math.min(minE, r); else minT = Math.min(minT, r);
      if (r < t - .005) fails.push(`${tag} ${r.toFixed(2)} < ${t}`);
      if (LC[fg] && S3.includes(bg)) { const lc = apca(R[fg][m], R[bg][m]); if (lc < LC[fg]) warns.push(`apca ${tag} Lc ${lc} < ${LC[fg]}`); } } }
  return { fails, warns, pairs, minT: +minT.toFixed(2), minE: +minE.toFixed(2) };
}

// ── Emit tokens.css (starter.css :root names; additions only) ──
const ok = (c, v, M = SRGB) => { const [L, C, h] = fit(c, M); return `oklch(${f(L)} ${f(C, C < .01 ? 4 : 3)} ${v ? `var(--${v})` : Math.round(h)})`; };
const ld = (r, M) => { const l = ok(r.l, r.v, M), d = ok(r.d, r.v, M); return l == d ? l : `light-dark(${l}, ${d})`; };
const fam = s => s.split(',')[0].replace(/"/g, '').trim();
function css(look, x, B) {
  const { R, n, a } = B, T = TYPE[x.type], [c, row, sc] = DENS[x.density], r = SHAPE[x.shape], wash = x.accent == 'wash';
  const sh = (al, ad) => `light-dark(oklch(.2 .01 var(--n) / ${f(al)}), oklch(0 0 0 / ${f(ad)}))`;
  const SH = { flat: [`0 0 0 1px ${sh(.1, .5)}`, `0 0 0 1px ${sh(.12, .6)}`, 'none'],
    hairline: [`0 1px 2px ${sh(.06, .3)},\n              0 8px 20px -6px ${sh(.14, .5)}`, `0 2px 6px ${sh(.06, .3)},\n              0 24px 48px -12px ${sh(.22, .6)}`, 'none'] };
  SH.soft = [SH.hairline[0], SH.hairline[1], `0 1px 2px ${sh(.05, 0)}, 0 4px 12px -4px ${sh(.08, 0)}`];
  SH.layered = [`0 1px 1px ${sh(.05, .3)}, 0 2px 4px ${sh(.05, .3)},\n              0 8px 16px -4px ${sh(.1, .45)}`,
    `0 1px 2px ${sh(.05, .3)}, 0 4px 8px ${sh(.05, .3)},\n              0 16px 32px -8px ${sh(.12, .5)}, 0 32px 64px -16px ${sh(.14, .6)}`,
    `0 1px 1px ${sh(.04, 0)}, 0 2px 4px ${sh(.04, 0)}, 0 8px 16px -6px ${sh(.08, 0)}`];
  const [s1, s2, cs] = SH[x.elevation], al = R.accent.l, ad = R.accent.d, v = k => `  --${k}: ${ld(R[k])};`;
  const px = q => typeof q == 'number' ? q + 'px' : q, lh = q => typeof q == 'number' && q > 3 ? q + 'px' : q;
  const L = [`/* tokens.css: generated by wwjd:look (scripts/look.mjs). Change .wwjd/look.json and regenerate; never hand-edit a colour.`,
    `   Look: ${AXES.map(k => x[k]).join(' · ')}${look.ref ? `\n   Reference: ${look.ref.id || ''} ${look.ref.name || ''} ${look.ref.url || ''}`.trimEnd() : ''}`,
    gfLink(T, look.fonts) ? `   Font: <link href="https://fonts.googleapis.com/css2?family=${gfLink(T, look.fonts)}&display=swap" rel="stylesheet">` : '   Font: system faces, nothing to load.',
    `   Density: ${{ compact: '<html data-density="compact">', comfortable: '<html data-density="comfortable">', regular: 'default, no attribute', spacious: 'the register\'s data-profile (marketing, reading) from wwjd' }[x.density]}; kit/base.css owns the scale, the values below are its fallback.`,
    `   Motion: <html data-motion="${x.motion}"> with wwjd:motion's motion.css; the --dur/--ease values below are the crisp defaults. */`,
    `:root[data-theme="light"] { color-scheme: light; }`, `:root[data-theme="dark"] { color-scheme: dark; }`, `:root {`, `  color-scheme: light dark;`,
    `  --n: ${Math.round(n)};   /* neutral hue */`, `  --a: ${Math.round(a)};  /* accent hue */`, '',
    ...['surface-1', 'surface-2', 'surface-3', 'fill', 'fill-strong'].map(v),
    `  --hover: light-dark(oklch(.25 ${wash ? '.02 var(--a)' : '.01 var(--n)'} / .05), oklch(.98 .005 var(--n) / .06));`,
    `  --press: light-dark(oklch(.25 ${wash ? '.02 var(--a)' : '.01 var(--n)'} / .09), oklch(.98 .005 var(--n) / .10));`,
    `  --selected: light-dark(color-mix(in oklab, ${ok(al, R.accent.v)} ${wash ? 14 : 9}%, var(--surface-2)), ${wash ? `color-mix(in oklab, ${ok(ad, R.accent.v)} 24%, var(--surface-2))` : 'oklch(.98 .005 var(--n) / .09)'});`,
    ...['border', 'border-strong', 'border-control'].map(v), `  --scrim: light-dark(oklch(.22 .01 var(--n) / .35), oklch(0 0 0 / .6));`, '',
    ...['text', 'text-2', 'text-3', 'text-disabled'].map(v), '',
    ...['accent', 'accent-hover', 'accent-text', 'on-accent'].map(v), `  --focus: var(--accent-text);`, `  --focus-width: ${x.contrast == 'high' ? 3 : 2}px;`,
    ...(R['accent-2'] ? [v('accent-2')] : []), '',
    ...['danger', 'danger-solid', 'danger-solid-hover', 'warning', 'success', 'info'].map(v), '',
    ...(R['chrome-bg'] ? [...['chrome-bg', 'chrome-text', 'chrome-text-2', 'chrome-border'].map(v), '  --chrome-selected: oklch(1 0 0 / .1);', ''] : []),
    ...(x.surface == 'translucent' ? [`  --surface-material: light-dark(oklch(.995 .003 var(--n) / .78), oklch(.25 .004 var(--n) / .74)); --material-blur: 24px;`, ''] : []),
    `  --shadow-1: ${s1};`, `  --shadow-2: ${s2};`, `  --shadow-card: ${cs};`, '',
    `  --r-1: ${r[0]}px; --r-2: ${r[1]}px; --r-3: ${r[2]}px; --r-4: ${r[3]}px; --r-full: 999px; --r-button: ${x.shape == 'round' ? '999px' : 'var(--r-2)'};`,
    `  --space-0-5: 2px; --space-1: 4px; --space-1-5: 6px; --space-2: 8px; --space-3: 12px; --space-4: 16px;`,
    `  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px; --space-12: 48px; --space-16: 64px;`, '',
    `  --font-sans: ${look.fonts?.sans || T.sans};`, `  --font-mono: ${look.fonts?.mono || T.mono || MONO};`,
    `  --font-display: ${look.fonts?.display || T.disp || 'var(--font-sans)'}; --weight-heading: ${wt(look.fonts?.display || T.disp || look.fonts?.sans || T.sans, T.w)}; --tracking-display: ${T.tr}em;`,
    ...['caption', 'body', 'heading', 'title', 'display'].map((k, i) => `  --text-${k}: ${px(sc[i][0])}; --lh-${k}: ${lh(sc[i][1])};`), '',
    `  --ease-out: cubic-bezier(.23, 1, .32, 1); --ease-move: cubic-bezier(.77, 0, .175, 1); --ease-drawer: cubic-bezier(.32, .72, 0, 1);`,
    `  --dur-fast: 120ms; --dur-pop: 160ms; --dur-modal: 220ms;`, '',
    `  --control-h: ${c}px; --row-h: ${row}px;`, `  --z-sticky: 10; --z-popup: 20; --z-modal: 30; --z-toast: 40; --z-tooltip: 50;`, `}`];
  if (x.contrast != 'high') L.push(`@media (prefers-contrast: more) {`, `  :root { --text-2: ${ld({ l: [.38, R['text-2'].l[1], n], d: [.84, R['text-2'].d[1], n], v: 'n' })}; --text-3: var(--text-2);`,
    `    --border: ${ld({ l: [.80, R.border.l[1], n], d: [.42, R.border.d[1], n], v: 'n' })}; --border-control: ${ld({ l: [.50, R['border-control'].l[1], n], d: [.62, R['border-control'].d[1], n], v: 'n' })}; --focus-width: 3px; }`, `}`);
  const wide = ['accent', 'accent-hover', 'accent-text', 'accent-2'].filter(k => R[k] && ['l', 'd'].some(m => fit(R[k][m], P3)[1] - fit(R[k][m])[1] > .005));
  if (wide.length) L.push(`@media (color-gamut: p3) {`, `  :root { ${wide.map(k => `--${k}: ${ld(R[k], P3)};`).join('\n    ')} }`, `}`);
  return L.join('\n') + '\n';
}

// ── DESIGN.md (google-labs-code spec "alpha": hex in frontmatter, 8 sections, dark-* mirror) ──
function designMd(look, x, B, au) {
  const { R } = B, T = TYPE[x.type], [c, row, sc] = DENS[x.density], r = SHAPE[x.shape], q = s => JSON.stringify(s);
  const cols = DMD.filter(([, role]) => R[role]).map(([k, role]) => `  ${k}: "${hex(R[role].l)}"`)
    .concat(DARK.filter(k => R[toRole(k)]).map(k => `  dark-${k}: "${hex(R[toRole(k)].d)}"`));
  const pxv = s => typeof s == 'number' ? s : +String(s).match(/(\d+)px\)$/)[1];
  const F = faces(T, look.fonts), dS = F.display || F.sans, sans = fam(F.sans), disp = fam(dS), mono = fam(F.mono || MONO), dw = wt(dS, T.w), hw = wt(F.sans, T.w);
  // the preset's prose names its own faces; with any override, name the faces actually in use
  const td = !['sans', 'display', 'mono'].some(k => look.fonts?.[k]) ? T.d
    : (disp != sans ? `${disp} for display and titles, ${sans} for body text` : `${sans} for everything`) + (F.mono ? `; ${mono} for IDs, codes and data cells` : '');
  const ty = (k, fm, i, w, ls, lhv) => [`  ${k}:`, `    fontFamily: ${q(fm)}`, `    fontSize: ${pxv(sc[i][0])}px`, `    fontWeight: ${w}`,
    `    lineHeight: ${lhv ?? (typeof sc[i][1] == 'number' && sc[i][1] > 3 ? sc[i][1] + 'px' : sc[i][1])}`, ...(ls ? [`    letterSpacing: ${ls}em`] : [])].join('\n');
  const comp = (k, o) => `  ${k}:\n` + Object.entries(o).map(([p, v]) => `    ${p}: ${q(v)}`).join('\n');
  const fm = ['---', 'version: alpha', `name: ${q(look.name || 'Look')}`, `description: ${q(look.identity || 'Generated by wwjd:look')}`, 'colors:', ...cols, 'typography:',
    ty('display', disp, 4, dw, T.tr), ty('title', disp, 3, dw, T.tr / 2), ty('heading', sans, 2, hw), ty('body-md', sans, 1, 400), ty('body-sm', sans, 0, 400),
    ty('label-md', sans, 1, wt(F.sans, 500), 0, 1), ty('caption', sans, 0, 400), ty('mono', mono, 0, 400),
    'rounded:', `  sm: ${r[0]}px`, `  md: ${r[1]}px`, `  lg: ${r[2]}px`, `  xl: ${r[3]}px`, '  full: 9999px',
    'spacing:', '  xs: 4px', '  sm: 8px', '  md: 16px', '  lg: 24px', '  xl: 40px', `  control: ${c}px`, `  row: ${row}px`, 'components:',
    comp('button-primary', { backgroundColor: '{colors.primary}', textColor: '{colors.on-primary}', rounded: x.shape == 'round' ? '{rounded.full}' : '{rounded.md}', height: `${c}px`, padding: '0 12px' }),
    comp('button-primary-hover', { backgroundColor: '{colors.primary-hover}', textColor: '{colors.on-primary}' }),
    comp('button-secondary', { backgroundColor: '{colors.neutral}', textColor: '{colors.on-surface}', rounded: '{rounded.md}', height: `${c}px` }),
    comp('button-danger', { backgroundColor: '{colors.error-solid}', textColor: '{colors.on-primary}', rounded: '{rounded.md}' }),
    comp('input', { backgroundColor: '{colors.surface-2}', textColor: '{colors.on-surface}', rounded: '{rounded.md}', height: `${c}px` }),
    comp('card', { backgroundColor: '{colors.surface-2}', textColor: '{colors.on-surface}', rounded: '{rounded.lg}', padding: '16px' }),
    comp('popup', { backgroundColor: '{colors.surface-3}', textColor: '{colors.on-surface}', rounded: '{rounded.lg}' }),
    comp('badge', { backgroundColor: '{colors.neutral}', textColor: '{colors.on-surface-variant}', rounded: '{rounded.sm}', typography: '{typography.caption}' }),
    comp('page', { backgroundColor: '{colors.surface}', textColor: '{colors.on-surface-muted}' }), comp('link', { backgroundColor: '{colors.surface-2}', textColor: '{colors.link}' }),
    ...['error', 'success', 'info'].map(k => comp(`status-${k}`, { backgroundColor: '{colors.surface-2}', textColor: `{colors.${k}}` })),
    comp('status-warning-glyph', { backgroundColor: '{colors.warning}', size: '16px' }), comp('divider', { backgroundColor: '{colors.outline-variant}', height: '1px' }),
    comp('control-edge', { backgroundColor: '{colors.outline}', width: '1px' }), ...(R['accent-2'] ? [comp('tag-secondary', { backgroundColor: '{colors.surface-2}', textColor: '{colors.secondary}' })] : []),
    // dark mirror: the spec has no modes, so dark pairs are components of their own (the linter checks their contrast too)
    ...[['button-primary', 'primary', 'on-primary'], ['button-secondary', 'neutral', 'on-surface'], ['input', 'surface-2', 'on-surface'], ['popup', 'surface-3', 'on-surface'],
      ['page', 'surface', 'on-surface-muted'], ['card', 'surface-2', 'on-surface-variant'], ['link', 'surface-2', 'link'], ['status-error', 'surface-2', 'error']]
      .map(([k, bg, tx]) => comp(`${k}-dark`, { backgroundColor: `{colors.dark-${bg}}`, textColor: `{colors.dark-${tx}}` })),
    comp('divider-dark', { backgroundColor: '{colors.dark-outline-variant}', height: '1px' }), comp('control-edge-dark', { backgroundColor: '{colors.dark-outline}', width: '1px' }), '---'];
  const okc = role => `\`${hex(R[role].l)}\` / dark \`${hex(R[role].d)}\` (${ok(R[role].l, null)})`;
  const keep = { identity: look.identity, name: look.name, register: x.register, brand: look.brand, brand2: look.brand2, hue: look.hue, axes: Object.fromEntries(AXES.map(k => [k, x[k]])),
    lock: look.lock, allow: look.allow, ref: look.ref, fixed: look.fixed, inkChroma: look.inkChroma, brandAsset: look.brandAsset, fonts: look.fonts };
  const body = [`<!-- wwjd:look ${JSON.stringify(keep)} -->`, '', `# ${look.name || 'Design'}`, '', '## Overview', '',
    look.identity || '', '', `- Look: ${AXES.map(k => `${k} ${x[k]}`).join(' · ')}`, `- Register: ${x.register}`,
    ...(look.ref ? [`- Reference: ${[look.ref.id, look.ref.name, look.ref.url].filter(Boolean).join(' ')} (axes only; nothing copied)`] : []),
    `- Motion: \`${x.motion}\` (wwjd:motion \`motion.css\`, \`<html data-motion="${x.motion}">\`)`, `- Imagery: ${x.imagery}`,
    '- Tokens: `tokens.css` holds the canonical OKLCH; the hex here is its sRGB rendering. Regenerate with wwjd:look, never hand-edit.', '',
    '## Colors', '', `- **Strategy:** ${DESC.accent[x.accent]}.`, `- **Neutral:** ${x.neutral} (hue ${Math.round(B.n)}); ink chroma ≤ ${x.inkChroma || .03}.`,
    `- **Primary:** ${okc('accent')}; text on it ${hex(R['on-accent'].l)}.`, `- **Link / focus:** ${okc('accent-text')}.`,
    `- **Surfaces:** ground ${okc('surface-1')}, pane ${hex(R['surface-2'].l)}, popup ${hex(R['surface-3'].l)}.`,
    `- **Ink:** ${okc('text')}; secondary ${hex(R['text-2'].l)}; muted ${hex(R['text-3'].l)} (surfaces only, never on fills).`,
    `- **Status:** error ${hex(R.danger.l)}, warning ${hex(R.warning.l)} (glyph only in light), success ${hex(R.success.l)}, info ${hex(R.info.l)}; always with a glyph or word.`,
    `- **Dark:** its own lightness table, never inverted; \`dark-*\` tokens above. Audited: ${au.pairs} pairs, min text ${au.minT}:1, min edge ${au.minE}:1.`, '',
    '## Typography', '', `- ${td}.`, `- Sizes: ${['caption', 'body', 'heading', 'title', 'display'].map((k, i) => `${k} ${typeof sc[i][0] == 'number' ? sc[i][0] + 'px' : 'fluid'}`).join(', ')}.`,
    `- ${dw == hw ? `Headings weight ${hw}` : `Display and titles weight ${dw} (${disp} has one weight; never faux bold), headings ${hw}`}; display tracking ${T.tr}em; \`tabular-nums\` wherever numbers align.`, '',
    '## Layout', '', `- ${x.density}: ${c}px controls, ${row}px rows, ${typeof sc[1][0] == 'number' ? sc[1][0] : 16}px body${/compact|comfortable/.test(x.density) ? ` (\`<html data-density="${x.density}">\`)` : ''}.`, '- 4px spacing base (`--space-*`); structure follows the wwjd layout rules.', '',
    '## Elevation & Depth', '', `- Surfaces: ${DESC.surface[x.surface]}.`, `- Elevation: ${DESC.elevation[x.elevation]}.`, '- Dark mode: lighter is higher; no resting shadows.', '',
    '## Shapes', '', `- ${x.shape}: ${r.join('/')}px (\`--r-1\`…\`--r-4\`): ${DESC.shape[x.shape]}.`, '',
    '## Components', '', '- Buttons, inputs, cards, popups and badges come from the kit and read these tokens; the frontmatter lists their pairs.',
    `- One primary button per region; secondary is a quiet fill (\`--fill\`).`, '',
    "## Do's and Don'ts", '', '- Do keep every text token at 4.5:1 on every surface in both modes, and edges and focus at 3:1; `look.mjs` enforces it.',
    x.accent == 'mono' ? '- Do mark the primary action with ink; colour only for status.' : '- Do spend the accent on the primary action, links, selection and focus only.',
    /soft|layered/.test(x.elevation) ? '- Do keep card shadows to light mode.' : "- Don't put shadows on resting cards; overlays only.",
    `- Don't use radii off the ${r.join('/')} scale.`, ...(look.ref ? ["- Don't copy the reference's logo, copy, icons, illustrations or licensed fonts."] : [])];
  return fm.join('\n') + '\n\n' + body.join('\n') + '\n';
}

// Regenerating keeps every "## " section this script does not write (a "## Decisions" log the sidebar appends to,
// handwritten sections), each after the generated section it followed before, else at the end.
function keepSections(prev, next) {
  const split = t => { const body = t.replace(/^---\n[\s\S]*?\n---\n/, ''), parts = body.split(/^(?=## )/m);
    return { head: parts[0].startsWith('## ') ? '' : parts.shift(), secs: parts.map(p => ({ h: p.split('\n')[0].trim(), text: p.trimEnd() + '\n' })) }; };
  const old = split(prev).secs, mine = split(next), ours = new Set(mine.secs.map(x => x.h));
  const extra = old.filter(x => !ours.has(x.h));
  if (!extra.length) return next;
  const after = new Map(); let anchor = null;
  for (const x of old) { if (ours.has(x.h)) { anchor = x.h; continue; } if (!after.has(anchor)) after.set(anchor, []); after.get(anchor).push(x); }
  const fm = (next.match(/^---\n[\s\S]*?\n---\n/) || [''])[0], out = [...(after.get(null) || [])];
  const body = [];
  for (const x of mine.secs) { body.push(x); body.push(...(after.get(x.h) || [])); }
  return fm + mine.head + [...out, ...body].map(x => x.text).join('\n');
}

// ── Variants: identity lock, 2–3 open axes moved, pairwise distance ≥ 2, ≤ 1 loud step ──
const dist = (p, q) => AXES.reduce((s, k) => s + (p[k] != q[k] ? W[k] : 0), 0);
function alts(k, v) {
  if (k == 'neutral') { const [t, c] = v.split('/'); return [...Object.keys(TEMP).filter(q => q != t && c != 'achromatic').map(q => `${q}/${c}`), ...Object.keys(CHROMA).filter(q => q != c).map(q => `${t}/${q}`)]; }
  const L = VALUES[k], i = L.indexOf(v); return L.filter(q => q != v).sort((p, q) => Math.abs(L.indexOf(p) - i) - Math.abs(L.indexOf(q) - i));
}
function variants(look, N, sweep) {
  const base = axesOf(look), lock = new Set(look.lock || []);
  const ax = (sweep || ['neutral', 'accent', 'surface', 'type', 'shape', 'density', 'elevation']).filter(k => AXES.includes(k) && !lock.has(k)).slice(0, sweep ? 9 : 4);
  const combos = (arr, k) => k == 0 ? [[]] : arr.flatMap((v, i) => combos(arr.slice(i + 1), k - 1).map(c => [v, ...c]));
  const opts = k => alts(k, base[k]).filter(v => !(k == 'accent' && v == 'mono' && look.brand)); // a brand hue never goes mono
  const loud = c => AXES.filter(k => c[k] != base[k] && LOUD.has(c[k])).length;
  const picked = [{ axes: base, moved: [] }], tried = new Set();
  for (const size of [2, 3]) { // Latin-square: pairs first, least shared axes first; triples only when pairs run out
    const pool = [];
    for (const set of combos(ax, size)) { const go = (i, cur) => { if (i == set.length) return pool.push(cur); for (const v of opts(set[i])) go(i + 1, { ...cur, [set[i]]: v }); }; go(0, { ...base }); }
    while (picked.length < N) {
      let best = null, bs = [-1, 0];
      for (const c of pool) { if (tried.has(JSON.stringify(c)) || loud(c) > 1 || dist(c, base) < 2 || dist(c, base) > 4) continue;
        const md = Math.min(...picked.map(p => dist(c, p.axes))), ov = picked.reduce((s, p) => s + p.moved.filter(k => c[k] != base[k]).length ** 2 + 2 * p.moved.filter(k => c[k] == p.axes[k]).length, 0);
        if (md >= 2 && (md > bs[0] || (md == bs[0] && ov < bs[1]))) { best = c; bs = [md, ov]; } }
      if (!best) break; tried.add(JSON.stringify(best));
      const lk = { ...look, axes: best }, x = resolve(lk);
      if (clashes(x, look.allow).length || audit(build(lk, x)).fails.length) continue;
      picked.push({ axes: best, moved: AXES.filter(k => best[k] != base[k]) });
    }
  }
  return picked;
}

// ── Reference cards (.wwjd/refs/*.yaml; format in references/sources.md) ──
function card(file) {
  const o = { axes: {}, file }; let inAx = false;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const top = line.match(/^([\w-]+):\s*(.*)$/);
    if (top) { inAx = top[1] == 'axes'; const v = top[2].replace(/\s+#\s.*$/, '').trim().replace(/^["']|["']$/g, ''); if (!inAx && v) o[top[1]] = v; continue; }
    const m = inAx && line.match(/^\s+(\w+):\s*\{\s*v:\s*([^,}]+?)\s*,\s*c:\s*([\d.]+)/); if (m) o.axes[m[1]] = { v: m[2].trim(), c: +m[3] };
  }
  o.mood = /mood/i.test(o.source || '') || o.mood == 'true';
  return o;
}
const MOOD_AXES = ['type', 'neutral', 'accent', 'imagery'];
function cardLook(cd, args) {
  const axes = {};
  for (const k of AXES) { const a = cd.axes[k]; if (a && a.c >= .5 && (!cd.mood || MOOD_AXES.includes(k))) axes[k] = norm(k, a.v.split(/\s+/)[0]); }
  return { name: cd.name, identity: cd.identity, register: args.register || cd.register || 'operate', ...(args.brand ? { brand: args.brand } : {}),
    axes: { ...BASE, ...axes }, lock: ['register', 'contrast', ...(args.brand ? ['brand'] : [])], ref: { id: cd.id, name: cd.name, url: cd.url } };
}
function pick(N, files) {
  const cs = files.map(card).filter(c => +c.score >= 3).sort((p, q) => +q.score - +p.score), out = [];
  const d = (p, q) => AXES.filter(k => (!p.mood && !q.mood || MOOD_AXES.includes(k)) && p.axes[k] && q.axes[k] && norm(k, p.axes[k].v) != norm(k, q.axes[k].v)).length;
  while (out.length < N) {
    let best = null, bs = -1;
    for (const c of cs) { if (out.includes(c) || (c.mood && out.some(o => o.mood))) continue;
      const md = out.length ? Math.min(...out.map(o => d(c, o))) : 99; if ((out.length == 0 || md >= 3) && md > bs) { best = c; bs = md; } }
    if (!best) break; out.push(best);
  }
  const span = k => new Set(out.map(c => c.axes[k] && norm(k, c.axes[k].v).split('/')[0]).filter(Boolean)).size;
  out.forEach((c, i) => console.log(`${String.fromCharCode(65 + i)}  ${c.name || c.id}  ${c.url || ''}  score ${c.score}${c.mood ? '  (mood: type/colour/imagery only)' : ''}  ← ${path.basename(c.file)}`));
  if (out.length < N) console.log(`only ${out.length} of ${N}: add candidates that differ on ≥3 axes`);
  for (const [k, l] of [['neutral', 'neutral temperatures'], ['accent', 'accent strategies'], ['type', 'type voices']]) if (span(k) < 2) console.log(`warn: the set spans 1 of ≥2 ${l}`);
}

// ── CLI ──
const argv = process.argv.slice(2), args = { rest: [] };
for (let i = 0; i < argv.length; i++) { const k = argv[i];
  if (/^--(force|verbose)$/.test(k)) args[k.slice(2)] = true; else if (k.startsWith('--')) args[k.slice(2)] = argv[++i]; else args.rest.push(k); }
const readLook = file => { const t = fs.readFileSync(file, 'utf8'); if (!/\.md$/i.test(file)) return JSON.parse(t);
  const m = t.match(/<!-- wwjd:look (\{.*\}) -->/); if (!m) die(`${file} was not written by wwjd:look; describe its look in a look.json and pass --design ${file} to pin its colours`); return JSON.parse(m[1]); };
const designColors = file => { const fmx = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/), o = {}; if (!fmx) return o; let inC = false;
  for (const line of fmx[1].split('\n')) { if (/^\S/.test(line)) { inC = /^colors:/.test(line); continue; } const m = inC && line.match(/^\s+([\w-]+):\s*["']?([^"'\s]+)/); if (m) o[m[1]] = m[2]; }
  return o; };

if (args.card) { console.log(JSON.stringify(cardLook(card(args.card), args), null, 2)); process.exit(0); }
if (args.pick) { pick(+args.pick, args.rest); process.exit(0); }
if (!args.look) die('usage: node look.mjs --look look.json [--out .] [--tokens file] [--design DESIGN.md] [--variants N --sweep a,b] [--force]\n       node look.mjs --card refs/B.yaml [--brand #hex]  |  node look.mjs --pick N refs/*.yaml');
// Own state goes to the project root's .wwjd/, never under --out: a nested .wwjd/ would stop the decision log's root finder
// there. Root: the nearest ancestor of cwd with .wwjd.json, .wwjd/ or .git, else cwd. A look written elsewhere is .wwjd/look.<out>.json.
const rootOf = d => { for (let p = d; ; p = path.dirname(p)) { if (['.wwjd.json', '.wwjd', '.git'].some(q => fs.existsSync(path.join(p, q)))) return p; if (p == path.dirname(p)) return d; } };
const look = readLook(args.look), out = args.out || '.', root = rootOf(process.cwd()), wdir = path.join(root, '.wwjd'), rel = path.relative(root, fs.existsSync(out) ? fs.realpathSync(out) : path.resolve(out));
const state = path.join(wdir, rel ? `look.${path.basename(path.resolve(out)).replace(/[^\w.-]+/g, '-').replace(/^\.+/, '') || 'out'}.json` : 'look.json');
if (args.design) look.fixed = { ...designColors(args.design), ...(look.fixed || {}) };
const fp = look.fixed?.primary || look.fixed?.accent; if (/^#/.test(fp || '')) look.brand = fp; // a pinned primary is the brand: dark, hover and link derive from it
const x = resolve(look), bad = clashes(x, look.allow);
if (bad.length) die(`rejected: ${bad.join('; ')}. Change an axis, or add the id to "allow" once the owner agrees.`, 1);
fs.mkdirSync(wdir, { recursive: true }); fs.mkdirSync(out, { recursive: true });
if (!fs.existsSync(path.join(wdir, '.gitignore'))) fs.writeFileSync(path.join(wdir, '.gitignore'), '*\n');
const B = build(look, x), au = audit(B), line = AXES.map(k => x[k]).join(' · ');
console.log(`look: ${look.name || ''} (${x.register}) ${line}`);
for (const nt of B.notes) console.log(`  solved: ${nt}`);
if (au.fails.length) { for (const fl of au.fails) console.log(`  FAIL ${fl}`); die(`contrast floor failed (${au.fails.length}); nothing written`, 1); }
console.log(`  floor ok: ${au.pairs} pairs, both modes, sRGB + P3; min text ${au.minT}:1, min edge ${au.minE}:1; apca warnings ${au.warns.length}`);
if (args.verbose) for (const w of au.warns) console.log(`  ${w}`);

if (args.variants) {
  const N = Math.min(5, Math.max(2, +args.variants)), vs = variants(look, N, args.sweep?.split(',')), vd = path.join(wdir, 'variants');
  fs.mkdirSync(vd, { recursive: true });
  vs.forEach((v, i) => { const id = String.fromCharCode(65 + i), lk = { ...look, axes: v.axes, variant: id, moved: v.moved }, xv = resolve(lk), Bv = build(lk, xv);
    fs.writeFileSync(path.join(vd, `${id}.json`), JSON.stringify(lk, null, 2) + '\n'); fs.writeFileSync(path.join(vd, `${id}.css`), css(lk, xv, Bv));
    console.log(`${id}  ${v.moved.length ? v.moved.map(k => `${k}→${v.axes[k]}`).join(', ') : 'anchor'}  d(A)=${dist(v.axes, vs[0].axes)}`); });
  let md = 99; for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) md = Math.min(md, dist(vs[i].axes, vs[j].axes));
  console.log(`${vs.length} variants in ${vd}; min pairwise distance ${md}${vs.length < N ? `; only ${vs.length} passed the filters` : ''}`);
  process.exit(0);
}
const tokens = args.tokens || path.join(out, 'tokens.css');
let dm = path.join(out, 'DESIGN.md');
if (fs.existsSync(dm) && !/<!-- wwjd:look /.test(fs.readFileSync(dm, 'utf8')) && !args.force) {
  dm = path.join(out, 'DESIGN.look.md'); console.log('  DESIGN.md exists and wins: wrote DESIGN.look.md; merge only its open axes (or --design DESIGN.md to pin its colours, --force to replace)'); }
const ramp = m => { const S = B.R.accent[m][0], T = B.R['accent-text'][m][0], C = B.R.accent[m][1];
  const Ls = m == 'l' ? [.993, .983, .955, .925, .89, .85, .79, .71, S, S - .04, T, .30] : [.18, .21, .26, .30, .34, .38, .44, .52, S, S + .04, T, .93];
  return Ls.map((L, i) => fit([L, C * [.02, .05, .12, .2, .28, .36, .45, .6, 1, 1, .85, .5][i], B.R.accent[m][2]]).map(q => +q.toFixed(4))); };
const resolved = Object.fromEntries(Object.entries(B.R).map(([k, r]) => [k, { light: fit(r.l).map(q => +q.toFixed(4)), dark: fit(r.d).map(q => +q.toFixed(4)), hex: [hex(r.l), hex(r.d)] }]));
fs.writeFileSync(tokens, css(look, x, B));
fs.writeFileSync(dm, keepSections(fs.existsSync(dm) ? fs.readFileSync(dm, 'utf8') : '', designMd(look, x, B, au)));
fs.writeFileSync(state, JSON.stringify({ ...look, axes: Object.fromEntries(AXES.map(k => [k, x[k]])),
  resolved, ramp: { light: ramp('l'), dark: ramp('d') }, audit: { pairs: au.pairs, minText: au.minT, minEdge: au.minE, apca: au.warns, solved: B.notes } }, null, 2) + '\n');
console.log(`  wrote ${tokens}, ${dm}, ${state}`);
