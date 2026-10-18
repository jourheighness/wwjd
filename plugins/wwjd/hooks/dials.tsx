// The wwjd dials pane (/wwjd-dials): one row per dial, for you (the plugin options) or for this project
// (.wwjd.json "dials"). Each dial is a segmented control of its named stops: native buttons on the desktop, [ ] on
// the terminal, so Tab, Enter and the pointer all work. The stops and what each does come from
// skills/ux/scripts/dials-spec.mjs. Scripts read WWJD_DIALS, then .wwjd.json.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import { DIALS, isDefault, stopOf, valueOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Scope } from '../types'

type Dial = (typeof DIALS)[number]
const PANE = 'wwjd-dials'

const scope = atom({ plugin: 'wwjd', key: 'scope' } as const, 'person')
const project = atom({ plugin: 'wwjd', key: 'project' } as const, {})
const focused = atom({ plugin: 'wwjd', key: 'focused' } as const, '')

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
async function readProject($: EngineInterface): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await $.fs.read(await projectFile($)))
  } catch {
    return {}
  }
}

// WWJD_DIALS for every Bash child from now on (hooks/session.sh sets it only at session start).
async function exportDials($: EngineInterface, options: PluginOptions) {
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
  const file = await projectFile($)
  const json = await readProject($)
  const dials = { ...((json.dials as Record<string, string | number>) || {}) }
  if (stop < 0) delete dials[key]
  else dials[key] = valueOf(dial, stop)
  const next: Record<string, unknown> = { ...json, dials }
  if (!Object.keys(dials).length) delete next.dials
  await $.fs.write(file, JSON.stringify(next, null, 2) + '\n')
  await update($, project, () => dials)
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'wwjd-dials', description: 'Set how wwjd designs: look, content, spacing, motion, copy, strictness' })
    await exportDials($, options)
    return next(e)
  })

  on('command.run', { command: 'wwjd-dials' }, async $ => {
    const json = await readProject($)
    await update($, project, () => (json.dials && typeof json.dials === 'object' ? (json.dials as Record<string, string | number>) : {}))
    await $.ui.open({ id: PANE, title: 'wwjd dials', focus: true, closeOnEscape: true })
    return { text: 'Dials open. DESIGN.md and the floor still win over any dial.' }
  })

  // The detail line follows the focus ring and the last pick, so a stop explains itself before it is set.
  on('ui.focus', { requestId: PANE }, async ($, e, next) => {
    await update($, focused, () => e.element ?? '').catch(() => undefined)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const where = await read($, scope)
    const proj = (await read($, project)) as Record<string, string | number>
    const [fKey = '', fWhat = ''] = (await read($, focused)).split(':')
    const labelW = Math.max('Applies to'.length, ...DIALS.map(d => d.name.length)) + 3

    // Where each dial stands in the scope being edited; a project dial with no value of its own shows yours.
    const state = (dial: Dial) => {
      const isOwn = where === 'project' && proj[dial.key] !== undefined
      const at = isOwn ? stopOf(dial, proj[dial.key]) : mine(options, dial)
      return { at, isOwn, isInherited: where === 'project' && !isOwn }
    }
    const set = async (key: string, i: number) => {
      await pick($, key, i)
      await update($, focused, () => `${key}:${i}`)
    }

    // One row of the grid: a fixed label column, then the control.
    const row = (id: string, label: string, control: JSX.Element, isStrong = false) => (
      <Box key={`row-${id}`} flexDirection="row" alignItems="center">
        <Box width={labelW} flexShrink={0}>
          <Text bold={isStrong}>{label}</Text>
        </Box>
        {control}
      </Box>
    )
    const segment = (id: string, labels: string[], at: number, isInherited: boolean, onSet: (i: number) => void) => (
      <Box flexDirection="row" flexWrap="wrap" gap="xs">
        {labels.map((label, i) => (
          <Button
            key={`${id}:${i}`}
            label={label}
            variant={i === at && !isInherited ? 'primary' : undefined}
            dimColor={i !== at}
            onPress={() => onSet(i)}
            autoFocus={id === 'scope' && i === at ? true : undefined}
          />
        ))}
      </Box>
    )

    const dialRows = DIALS.map(dial => {
      const { at, isOwn, isInherited } = state(dial)
      const control = (
        <Box flexDirection="row" alignItems="center" gap="md">
          {segment(dial.key, dial.stops.map(([n]) => n), at, isInherited, i => set(dial.key, i))}
          {isOwn && <Button key={`${dial.key}:reset`} plain dimColor label="Use mine" onPress={() => pick($, dial.key, -1)} />}
        </Box>
      )
      return row(dial.key, dial.name, control, !isInherited && !isDefault(dial, at))
    })

    // The detail: the focused or last-set stop; a focus off the stops shows the dial as it stands.
    const fDial = dialOf(fKey)
    const fStop = fDial ? (/^\d+$/.test(fWhat) && fDial.stops[Number(fWhat)] ? Number(fWhat) : state(fDial).at) : -1
    const [title, does] =
      fKey === 'scope'
        ? fWhat === '1'
          ? ['This project', 'Saved to .wwjd.json "dials"; commit it to share. A dial left unset uses yours.']
          : ['You, every project', 'Saved to your wwjd plugin options. A project .wwjd.json overrides them.']
        : fDial && fWhat === 'reset'
          ? [`${fDial.name} · Use mine`, "Drop this project's value and use yours."]
          : fDial
            ? [`${fDial.name} · ${fDial.stops[fStop]?.[0]}${isDefault(fDial, fStop) ? ' (default)' : ''}`, fDial.stops[fStop]?.[1] ?? '']
            : ['', '']

    return (
      <Box flexDirection="column" padding="md" gap="md">
        {row('scope', 'Applies to', segment('scope', ['You, every project', 'This project'], where === 'person' ? 0 : 1, false, i => update($, scope, () => (i === 0 ? 'person' : 'project') as Scope)))}
        <Box flexDirection="column" gap="sm">{dialRows}</Box>
        <Box flexDirection="column" minHeight={3}>
          <Text bold>{title}</Text>
          <Text wrap="wrap" dimColor>{does}</Text>
        </Box>
      </Box>
    )
  })
}
