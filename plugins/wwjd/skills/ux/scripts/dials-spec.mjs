// The wwjd dials: one source for the /wwjd-dials pane (hooks/dials.tsx), wwjd.mjs and references/dials.md.
// Each dial runs between two named ends; stop 3 is wwjd's default (the product type decides).
// `does` is what the agent does at that stop: concrete, checkable, one line.

export const DIALS = [
  { key: "creativity", name: "Look", ends: ["plain", "expressive"], default: 3, stops: [
    ["Plain", "Close to the kit: brand hue only, the system face, the plainest hero that fits."],
    ["Restrained", "One quiet custom touch (a tinted neutral or a refined face); nothing loud."],
    ["Balanced", "One loud axis; a display face on marketing, editorial and consumer screens."],
    ["Bold", "Two loud axes, a display face on every screen, one signature moment per page."],
    ["Expressive", "Art-directed: one distinct visual idea per page, an unusual layout, a far-end hero."],
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
    ["Airy", "A step roomier than the product type."],
    ["By product", "The product type decides: consumer roomy, work tools compact."],
    ["Snug", "A step denser than the product type."],
    ["Compact", "data-density=\"compact\": 32px rows, tight gaps, more per screen."],
  ] },
  { key: "motion", name: "Motion", ends: ["still", "lively"], default: 3, stops: [
    ["Still", "data-motion=\"instant\": state changes only, nothing moves."],
    ["Crisp", "data-motion=\"crisp\": short, quick transitions, no flourish."],
    ["By product", "The product type's motion theme."],
    ["Smooth", "data-motion=\"smooth\": softer, slightly longer transitions."],
    ["Lively", "data-motion=\"springy\": springy motion and one delight moment per flow."],
  ] },
  { key: "voice", name: "Copy", ends: ["terse", "warm"], default: 3, stops: [
    ["Terse", "Labels and values only; sentences only in errors."],
    ["Brief", "Plain and shorter than usual."],
    ["Plain", "Plain language in the product's own words."],
    ["Friendly", "One human line in empty and success states."],
    ["Warm", "A light personality in empty, success and onboarding; never in errors, money or safety."],
  ] },
  { key: "rigor", name: "Checking", ends: ["quick", "thorough"], default: 3, stops: [
    ["Quick", "Lint only."],
    ["Light", "Lint and one desktop screenshot."],
    ["Standard", "Lint and screenshots at desktop and phone width."],
    ["Careful", "Adds dark mode, the key states and render.mjs runtime checks."],
    ["Thorough", "Adds the critic agent and 2–3 variants before building."],
  ] },
  { key: "grade", name: "Grading", ends: [], default: "gate", values: ["gate", "light"], stops: [
    ["Written", "A grade sheet for each over-budget surface before it is built."],
    ["In your head", "Over-budget surfaces graded without a sheet; the handover lists what moved."],
  ] },
];

// Older motion values (theme names) map onto the stops.
const MOTION_NAMES = { instant: 1, crisp: 2, auto: 3, smooth: 4, springy: 5 };

/** The stored value as a stop index (0-based), or the default's. */
export function stopOf(dial, value) {
  if (dial.values) { const i = dial.values.indexOf(String(value)); return i < 0 ? dial.values.indexOf(dial.default) : i; }
  const n = dial.key === "motion" && String(value) in MOTION_NAMES ? MOTION_NAMES[value] : Math.round(Number(value));
  return (n >= 1 && n <= 5 ? n : dial.default) - 1;
}
/** The value stored for a stop index. */
export const valueOf = (dial, stop) => (dial.values ? dial.values[stop] : stop + 1);
export const isDefault = (dial, stop) => stop === stopOf(dial, dial.default);
