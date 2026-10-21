// One-click buttons in the wwjd pane on the desktop app, around an open engine bug (anthropics/claude-code#99395,
// #100948, #103030): a click that moves the focus ring raises `ui.focus` at once, then redraws the pane, and the press
// that follows carries the old drawing's handle and is dropped, so every button needs a second click.
// `tracked(ui)` notes each drawn Button's onPress by key; `onFocus` answers the ring move:
// - pane without the keyboard: only a click reaches it, so the focus is the press. The click's own press, if it ever
//   lands, is swallowed by `onPress` below.
// - pane with the keyboard: the ring stays put. No redraw, so the click's own press lands. Tab no longer walks the
//   pane's buttons on the desktop; the terminal is untouched.
// Inputs and Selects take the ring as usual. Remove this file once the bug is fixed.
import type { EngineInterface, UiFocusInput, UiFocusResult, UiPressArgument, UiPressResult } from 'claude-code'

const presses = new Map<string, () => unknown>()
let desktop = { drawn: false, isFocused: false }
let pressed: { key: string; at: number } | null = null

/** The surface table with Button wrapped, so a press can be run from `ui.focus`. */
export function tracked<U extends { Button: unknown }>(ui: U): U {
  const Button = ui.Button as (p: { key: string; onPress?: () => unknown }) => unknown
  return { ...ui, Button: (p: { key: string; onPress?: () => unknown }) => { if (p.onPress) presses.set(p.key, p.onPress); return Button(p) } } as U
}

/** Each desktop drawing of the pane says whether it holds the keyboard. */
export function drawn(surface: string, isFocused: boolean) {
  if (surface === 'desktop') desktop = { drawn: true, isFocused }
}

export async function onFocus($: EngineInterface, e: UiFocusInput, next: (e: UiFocusInput) => Promise<UiFocusResult>) {
  const press = e.element ? presses.get(e.element) : undefined
  if (!desktop.drawn || e.origin.kind !== 'person' || !e.element || !press) return next(e)
  if (desktop.isFocused) return {}
  pressed = { key: e.element, at: await $.clock.now().catch(() => 0) }
  void Promise.resolve().then(press)
  return next(e)
}

export async function onPress($: EngineInterface, e: UiPressArgument, next: (e: UiPressArgument) => Promise<UiPressResult>) {
  if (pressed?.key === e.element && (await $.clock.now().catch(() => Infinity)) - pressed.at < 1500) { pressed = null; return { element: e.element } }
  return next(e)
}
