// The Settings view of the wwjd sidebar (sidebar.tsx): Hooks (on, quiet, off), Project board (on, off) and one card per
// dial, for you (the plugin options) or for this project (.wwjd.json "hooks", "boardMode" and "dials"). A card names the dial and what its current stop does, then the five stops as a row of
// buttons (native on the desktop, [ ] on the terminal), the picked one primary, so Tab, Enter and the pointer all work.
// The stops and what each does come from skills/ux/scripts/dials-spec.mjs. Scripts read WWJD_DIALS, then .wwjd.json.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, RenderInput } from 'claude-code'

import { DIALS, isDefault, stopOf, valueOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Scope } from '../types'
import { tracked } from './press'

type Dial = (typeof DIALS)[number]
export const PANE = 'wwjd'

const scope = atom({ plugin: 'wwjd', key: 'scope' } as const, 'person')
const project = atom({ plugin: 'wwjd', key: 'project' } as const, {})
const projectHooks = atom({ plugin: 'wwjd', key: 'projectHooks' } as const, '')
const projectBoard = atom({ plugin: 'wwjd', key: 'projectBoard' } as const, '')

// The Project board setting (skills/ux/scripts/paths.mjs boardMode): on or off.
const BOARD = [
  ['on', 'On', 'A new project offers a shareable board, and each handover adds its decisions, screenshots and checks to it.'],
  ['off', 'Off', 'No board. Everything stays in this panel.'],
] as const
const boardOf = (v: unknown) => (BOARD.some(([k]) => k === v) ? (v as string) : '')

// The Hooks setting (skills/ux/scripts/paths.mjs hooksMode): on, quiet (never blocks) or off.
const HOOKS = [
  ['on', 'On', 'wwjd joins in on UI work, checks each change, and makes sure the checks ran before Claude says it is done.'],
  ['quiet', 'Quiet', 'wwjd joins in and checks each change, but never stops Claude to ask for more.'],
  ['off', 'Off', 'No wwjd hooks run. The skills still work when you call them.'],
] as const
const hooksOf = (v: unknown) => (HOOKS.some(([k]) => k === v) ? (v as string) : '')

const dialOf = (key: string) => DIALS.find(d => d.key === key) as Dial | undefined
const mine = (options: PluginOptions, dial: Dial) => stopOf(dial, options[dial.key] ?? dial.default)

// The project's .wwjd.json: the nearest one up from the working directory, else a new one there.
// The project's root comes from the sidebar (the project being edited, the same one the log and board read).
let projectRoot = ''
export function setProjectRoot(root: string) { projectRoot = root }
async function projectFile($: EngineInterface): Promise<string> {
  const start = projectRoot || (await $.session.cwd())
  for (let d = start; ; ) {
    if (await $.fs.exists(`${d}/.wwjd.json`)) return `${d}/.wwjd.json`
    const up = d.replace(/\/[^/]+$/, '')
    if (!up || up === d) return `${start}/.wwjd.json`
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

/** The project's dials, Hooks and Project board settings into state, before Settings shows. */
export async function loadProjectDials($: EngineInterface) {
  const { json = {} } = await readProject($)
  await update($, project, () => (json.dials && typeof json.dials === 'object' ? (json.dials as Record<string, string | number>) : {}))
  await update($, projectHooks, () => hooksOf(json.hooks))
  await update($, projectBoard, () => boardOf(json.boardMode))
}

// A Hooks or Project board pick: the plugin option for you (plus the env the scripts read this session), the project's
// .wwjd.json key for the project; '' hands the project back to yours.
const SETTINGS = {
  hooks: { option: 'wwjd.hookmode', json: 'hooks' },
  board: { option: 'wwjd.boardmode', json: 'boardMode' },
} as const
async function pickSetting($: EngineInterface, which: keyof typeof SETTINGS, value: string) {
  const { option, json: key } = SETTINGS[which]
  if ((await read($, scope)) === 'person') {
    const { deny } = await $.config.set({ key: option, value })
    if (deny) $.ui.toast(`Not saved: ${deny}`)
    else if (which === 'hooks') await $.env.set('WWJD_HOOKS', value) // the engine lists env names, so each is literal
    else await $.env.set('WWJD_BOARD', value)
    return
  }
  const { file, json, error } = await readProject($)
  if (error !== undefined) {
    $.ui.toast(`Not saved: ${file.split('/').slice(-2).join('/')}: ${error}. Fix it, then pick again.`)
    return
  }
  const next: Record<string, unknown> = { ...json }
  if (value) next[key] = value
  else delete next[key]
  await $.fs.write(file, JSON.stringify(next, null, 2) + '\n')
  if (which === 'hooks') await update($, projectHooks, () => value)
  else await update($, projectBoard, () => value)
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
  const ui = tracked($.ui.resolve(e))
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
  // The pane's quiet card line on the desktop (sidebar.tsx LINE); the terminal's theme grey elsewhere
  const line = e.surface === 'desktop' ? 'rgba(127, 127, 127, 0.28)' : 'subtle'
  const dialCard = (key: string, name: string, right: JSX.Element | null, does: string, stops: JSX.Element[]) => card(ui, key, (
    <Box flexDirection="column" gap="sm">
      <Box flexDirection="column" gap="xs">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text weight="semibold">{name}</Text>
          {right}
        </Box>
        <Text size="footnote" wrap="wrap" dimColor>{does}</Text>
      </Box>
      <Box flexDirection="row" flexWrap="wrap" gap="xs">{stops}</Box>
    </Box>
  ), line)

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
    hooksOwn ? <Button key="hooks:reset" plain dimColor label="Use mine" onPress={() => pickSetting($, 'hooks', '')} />
      : where === 'project' ? <Text dimColor>Same as yours</Text> : null,
    HOOKS.find(([k]) => k === hooksAt)?.[2] ?? '',
    HOOKS.map(([k, label]) => stop(`hooks:${k}`, label, k === hooksAt && !(where === 'project' && !hooksOwn), () => pickSetting($, 'hooks', k))))

  // Project board: the same card shape, two stops
  const projBoard = (await read($, projectBoard)) as string
  const myBoard = boardOf(options.boardmode) || 'on'
  const boardOwn = where === 'project' && projBoard !== ''
  const boardAt = boardOwn ? projBoard : myBoard
  const boardCard = dialCard('card-board', 'Project board',
    boardOwn ? <Button key="board:reset" plain dimColor label="Use mine" onPress={() => pickSetting($, 'board', '')} />
      : where === 'project' ? <Text dimColor>Same as yours</Text> : null,
    BOARD.find(([k]) => k === boardAt)?.[2] ?? '',
    BOARD.map(([k, label]) => stop(`board:${k}`, label, k === boardAt && !(where === 'project' && !boardOwn), () => pickSetting($, 'board', k))))

  const dialCards = DIALS.map(dial => {
    const { at, isOwn, isInherited } = state(dial)
    const right = isOwn
      ? <Button key={`${dial.key}:reset`} plain dimColor label="Use mine" onPress={() => pick($, dial.key, -1)} />
      : isInherited ? <Text dimColor>Same as yours</Text> : null
    return dialCard(`card-${dial.key}`, dial.name, right, dial.stops[at]?.[1] ?? '',
      dial.stops.map(([name], i) => stop(`${dial.key}:${i}`, name, i === at && !isInherited, () => pick($, dial.key, i))))
  })

  return (
    <Box flexDirection="column" gap="sm">
      {scopeCard}
      {hooksCard}
      {boardCard}
      {dialCards}
    </Box>
  )
}
