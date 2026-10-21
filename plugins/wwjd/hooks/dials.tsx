// The Settings view of the wwjd sidebar (sidebar.tsx): a Hooks card (on, quiet, off) and one card per dial, for you
// (the plugin options) or for this project (.wwjd.json "hooks" and "dials"). A card names the dial and what its current stop does, then the five stops as a row of
// buttons (native on the desktop, [ ] on the terminal), the picked one primary, so Tab, Enter and the pointer all work.
// The stops and what each does come from skills/ux/scripts/dials-spec.mjs. Scripts read WWJD_DIALS, then .wwjd.json.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, RenderInput } from 'claude-code'

import { DIALS, isDefault, stopOf, valueOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Scope } from '../types'

type Dial = (typeof DIALS)[number]
export const PANE = 'wwjd'

const scope = atom({ plugin: 'wwjd', key: 'scope' } as const, 'person')
const project = atom({ plugin: 'wwjd', key: 'project' } as const, {})
const projectHooks = atom({ plugin: 'wwjd', key: 'projectHooks' } as const, '')

// The Hooks setting (skills/ux/scripts/paths.mjs hooksMode): on, quiet (never blocks) or off.
const HOOKS = [
  ['on', 'On', 'Routes UI prompts to the skills, lints each UI edit and holds the handover until the checks ran.'],
  ['quiet', 'Quiet', 'Routes and lints, never blocks: no start question, grade sheet or handover checks.'],
  ['off', 'Off', 'No wwjd hooks run. The skills still work when you call them.'],
] as const
const hooksOf = (v: unknown) => (HOOKS.some(([k]) => k === v) ? (v as string) : '')

const dialOf = (key: string) => DIALS.find(d => d.key === key) as Dial | undefined
const mine = (options: PluginOptions, dial: Dial) => stopOf(dial, options[dial.key] ?? dial.default)

// The project's .wwjd.json: the nearest one up from the working directory, else a new one there.
async function projectFile($: EngineInterface): Promise<string> {
  const cwd = await $.session.cwd()
  for (let d = cwd; ; ) {
    if (await $.fs.exists(`${d}/.wwjd.json`)) return `${d}/.wwjd.json`
    const up = d.replace(/\/[^/]+$/, '')
    if (!up || up === d) return `${cwd}/.wwjd.json`
    d = up
  }
}
// A missing file is an empty project; one that can't be read or isn't a JSON object is an error, never {}, so a
// pick can't overwrite what is in it.
type Project = { file: string; json: Record<string, unknown>; error?: undefined } | { file: string; json?: undefined; error: string }
async function readProject($: EngineInterface): Promise<Project> {
  const file = await projectFile($)
  if (!(await $.fs.exists(file))) return { file, json: {} }
  let text: string
  try {
    text = await $.fs.read(file)
  } catch (err) {
    return { file, error: `can't read it (${err instanceof Error ? err.message : String(err)})` }
  }
  try {
    const json = JSON.parse(text) as unknown
    if (json && typeof json === 'object' && !Array.isArray(json)) return { file, json: json as Record<string, unknown> }
    return { file, error: 'it is not a JSON object' }
  } catch (err) {
    return { file, error: `it is not valid JSON (${err instanceof Error ? err.message : String(err)})` }
  }
}

// WWJD_DIALS for every Bash child from now on (hooks/session.sh sets it only at session start).
export async function exportDials($: EngineInterface, options: PluginOptions) {
  const set = DIALS.filter(d => !isDefault(d, mine(options, d))).map(d => `${d.key}=${valueOf(d, mine(options, d))}`)
  await $.env.set('WWJD_DIALS', set.join(' '))
}

// A pick: the plugin option for you, .wwjd.json for the project; stop -1 hands a project dial back to yours.
async function pick($: EngineInterface, key: string, stop: number) {
  const dial = dialOf(key)
  if (!dial) return
  if ((await read($, scope)) === 'person') {
    const { deny } = await $.config.set({ key: `wwjd.${key}`, value: valueOf(dial, stop) })
    if (deny) $.ui.toast(`Not saved: ${deny}`)
    return
  }
  const { file, json, error } = await readProject($)
  if (error !== undefined) {
    $.ui.toast(`Not saved: ${file.split('/').slice(-2).join('/')}: ${error}. Fix it, then pick again.`)
    return
  }
  const dials = { ...((json.dials as Record<string, string | number>) || {}) }
  if (stop < 0) delete dials[key]
  else dials[key] = valueOf(dial, stop)
  const next: Record<string, unknown> = { ...json, dials }
  if (!Object.keys(dials).length) delete next.dials
  await $.fs.write(file, JSON.stringify(next, null, 2) + '\n')
  await update($, project, () => dials)
}

/** The project's dials and Hooks setting into state, before the sidebar opens. */
export async function loadProjectDials($: EngineInterface) {
  const { json = {} } = await readProject($)
  await update($, project, () => (json.dials && typeof json.dials === 'object' ? (json.dials as Record<string, string | number>) : {}))
  await update($, projectHooks, () => hooksOf(json.hooks))
}

// A Hooks pick: the plugin option for you, .wwjd.json "hooks" for the project; '' hands the project back to yours.
async function pickHooks($: EngineInterface, value: string) {
  if ((await read($, scope)) === 'person') {
    const { deny } = await $.config.set({ key: 'wwjd.hookmode', value })
    if (deny) $.ui.toast(`Not saved: ${deny}`)
    return
  }
  const { file, json, error } = await readProject($)
  if (error !== undefined) {
    $.ui.toast(`Not saved: ${file.split('/').slice(-2).join('/')}: ${error}. Fix it, then pick again.`)
    return
  }
  const next: Record<string, unknown> = { ...json }
  if (value) next.hooks = value
  else delete next.hooks
  await $.fs.write(file, JSON.stringify(next, null, 2) + '\n')
  await update($, projectHooks, () => value)
}

/** The sidebar's one card: a rounded border around its content (sidebar.tsx draws decisions with it). A desktop button
 *  is native and sized to its label, so actions sit in a row under the text rather than in cells. */
export function card(ui: ReturnType<EngineInterface['ui']['resolve']>, key: string, content: JSX.Element, borderColor = 'subtle') {
  const { Box } = ui
  return (
    <Box key={key} flexDirection="column" borderStyle="round" borderColor={borderColor} paddingX="md" paddingY="sm">
      {content}
    </Box>
  )
}

/** The dial cards, the sidebar's Settings view. */
export async function settingsView($: EngineInterface, e: RenderInput, options: PluginOptions) {
  const ui = $.ui.resolve(e)
  const { Box, Text, Button } = ui
  const where = await read($, scope)
  const proj = (await read($, project)) as Record<string, string | number>

  // Where each dial stands in the scope being edited; a project dial with no value of its own shows yours.
  const state = (dial: Dial) => {
    const isOwn = where === 'project' && proj[dial.key] !== undefined
    const at = isOwn ? stopOf(dial, proj[dial.key]) : mine(options, dial)
    return { at, isOwn, isInherited: where === 'project' && !isOwn }
  }
  // One stop: the picked one is the primary button, the rest dim.
  const stop = (key: string, label: string, isPicked: boolean, onPress: () => void) =>
    <Button key={key} label={label} variant={isPicked ? 'primary' : undefined} dimColor={!isPicked} onPress={onPress} />
  const dialCard = (key: string, name: string, right: JSX.Element | null, does: string, stops: JSX.Element[]) => card(ui, key, (
    <Box flexDirection="column" gap="sm">
      <Box flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text bold>{name}</Text>
          {right}
        </Box>
        <Text wrap="wrap" dimColor>{does}</Text>
      </Box>
      <Box flexDirection="row" flexWrap="wrap" gap="xs">{stops}</Box>
    </Box>
  ))

  const scopeCard = dialCard('card-scope', 'Applies to', null, where === 'person'
      ? "Your plugin options. A project's .wwjd.json overrides them."
      : "This project's .wwjd.json; commit it to share. Unset dials use yours.",
    (['You, every project', 'This project'] as const).map((label, i) =>
      stop(`scope:${i}`, label, (where === 'person' ? 0 : 1) === i, () => update($, scope, () => (i === 0 ? 'person' : 'project') as Scope))))

  // Hooks: the same card shape as a dial, three stops
  const projHooks = (await read($, projectHooks)) as string
  const myHooks = hooksOf(options.hookmode) || 'on'
  const hooksOwn = where === 'project' && projHooks !== ''
  const hooksAt = hooksOwn ? projHooks : myHooks
  const hooksCard = dialCard('card-hooks', 'Hooks',
    hooksOwn ? <Button key="hooks:reset" plain dimColor label="Use mine" onPress={() => pickHooks($, '')} />
      : where === 'project' ? <Text dimColor>yours</Text> : null,
    HOOKS.find(([k]) => k === hooksAt)?.[2] ?? '',
    HOOKS.map(([k, label]) => stop(`hooks:${k}`, label, k === hooksAt && !(where === 'project' && !hooksOwn), () => pickHooks($, k))))

  const dialCards = DIALS.map(dial => {
    const { at, isOwn, isInherited } = state(dial)
    const right = isOwn
      ? <Button key={`${dial.key}:reset`} plain dimColor label="Use mine" onPress={() => pick($, dial.key, -1)} />
      : isInherited ? <Text dimColor>yours</Text> : null
    return dialCard(`card-${dial.key}`, dial.name, right, dial.stops[at]?.[1] ?? '',
      dial.stops.map(([name], i) => stop(`${dial.key}:${i}`, name, i === at && !isInherited, () => pick($, dial.key, i))))
  })

  return (
    <Box flexDirection="column" gap="sm">
      {scopeCard}
      {hooksCard}
      {dialCards}
    </Box>
  )
}
