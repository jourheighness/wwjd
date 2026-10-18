// The wwjd dials: one source for the Settings view of /wwjd (hooks/dials.tsx), wwjd.mjs and references/dials.md.
// Each dial runs between two named ends; stop 3 is wwjd's default (the product type decides).
// `does` is what the agent does at that stop: concrete, checkable, one line.

export const DIALS = [
  { key: "creativity", name: "Look", ends: ["plain", "expressive"], default: 3, stops: [
    ["Plain", "Neutrals and one accent hue (the brand's, else one picked for the subject; never the kit default), used for the one primary thing; no tinted chips or fills; status and priority in text or a neutral mark; the system face; flat, a 1px border at most; the plainest hero that fits."],
    ["Restrained", "Plain plus one quiet custom touch (a tinted neutral, a refined face or one semantic colour); nothing loud."],
    ["Balanced", "One loud axis; a display face on marketing, editorial and consumer screens."],
    ["Bold", "Two loud axes, a display face on every screen, one signature moment per page."],
    ["Expressive", "Art-directed: two loud axes plus one distinct visual idea per page, an unusual layout, a far-end hero."],
  ] },
  { key: "budget", name: "Content", ends: ["lean", "rich"], default: 3, stops: [
    ["Minimal", "Every surface shows 2 fewer facts (min 1); cut before moving."],
    ["Lean", "Every surface shows 1 fewer fact."],
    ["Balanced", "Surface budgets as written."],
    ["Full", "Every surface shows 1 more fact."],
    ["Rich", "Every surface shows 2 more facts; overflow still moves one step away."],
  ] },
  { key: "density", name: "Spacing", ends: ["roomy", "compact"], default: 3, stops: [
    ["Roomy", "data-density=\"comfortable\": tall rows, generous gaps, fewer things per screen."],
    ["Airy", "One step roomier than the product type."],
    ["By product", "The product type decides: consumer roomy, work tools compact."],
    ["Snug", "One step denser than the product type."],
    ["Compact", "data-density=\"compact\": 32px rows, tight gaps, more per screen."],
  ] },
  { key: "motion", name: "Motion", ends: ["still", "lively"], default: 3, stops: [
    ["Still", "data-motion=\"instant\": state changes only, nothing moves."],
    ["Crisp", "One step calmer than the product's motion theme (instant, crisp, smooth, springy); no flourish."],
    ["By product", "The product type's motion theme."],
    ["Smooth", "One step livelier than the product's motion theme; softer, slightly longer transitions."],
    ["Lively", "data-motion=\"springy\" and one delight moment per flow; Operate, Monitor, Flow and Transact cap at smooth."],
  ] },
  { key: "voice", name: "Copy", ends: ["terse", "warm"], default: 3, stops: [
    ["Terse", "Labels and values only; sentences only in errors."],
    ["Brief", "Plain and shorter than usual."],
    ["Plain", "Plain language in the product's own words."],
    ["Friendly", "Plain, plus spoken dates and counts (\"Due Thursday\", \"3 left\") and one human line in empty and success states."],
    ["Warm", "A human voice wherever there are words: spoken dates, counts and states (\"Due Thursday\", \"3 to go\", \"Almost there\"), one friendly line in empty, success and onboarding; never in errors, money or safety."],
  ] },
  { key: "strictness", name: "Strictness", ends: ["fast", "strict"], default: 3, stops: [
    ["Fast", "Over-budget surfaces graded in your head; after: lint only."],
    ["Light", "Over-budget surfaces graded in your head; after: lint and one desktop screenshot."],
    ["Standard", "A written grade sheet per over-budget surface before it is built; after: lint, screenshots at desktop and phone width and a clean fit check."],
    ["Careful", "Grade sheets; after: adds dark mode, the key states and render.mjs runtime checks."],
    ["Strict", "Grade sheets; after: adds the critic agent, and explore's variants before building."],
  ] },
];

/** The stored value as a stop index (0-based), or the default's. */
export function stopOf(dial, value) {
  const n = Math.round(Number(value));
  return (n >= 1 && n <= 5 ? n : dial.default) - 1;
}
/** Whether over-budget surfaces get a written grade sheet before they are built (Strictness 3 and up). */
export const isGated = (strictness) => Number(strictness) >= 3;
/** The value stored for a stop index. */
export const valueOf = (_dial, stop) => stop + 1;
export const isDefault = (dial, stop) => stop === stopOf(dial, dial.default);
