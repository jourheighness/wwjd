// The wwjd dials pane (/wwjd-dials): one slider per dial, for you (the plugin options) or for this project
// (.wwjd.json "dials"). Stops are buttons, so Tab, arrows, Enter and the mouse all work. The dials, their ends and
// what each stop does come from skills/wwjd/scripts/dials-spec.mjs. Scripts read WWJD_DIALS, then .wwjd.json.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import { DIALS, isDefault, stopOf, valueOf } from '../skills/wwjd/scripts/dials-spec.mjs'
import type { Scope } from '../types'

type Dial = (typeof DIALS)[number]
const PANE = 'wwjd-dials'
const HINT = 'Tab or arrows move, Enter sets, a click works too. Esc closes.'

const scope = atom({ plugin: 'wwjd', key: 'scope' } as const, 'person')
const project = atom({ plugin: 'wwjd', key: 'project' } as const, {})
const focused = atom({ plugin: 'wwjd', key: 'focused' } as const, '')

const dialOf = (key: string) => DIALS.find(d => d.key === key) as Dial | undefined
const mine = (options: PluginOptions, dial: Dial) => stopOf(dial, options[dial.key] ?? dial.default)
// What the plugin option takes: motion and grade are strings, the rest numbers.
const stored = (dial: Dial, stop: number) => (dial.key === 'motion' ? String(valueOf(dial, stop)) : valueOf(dial, stop))

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
    const { deny } = await $.config.set({ key: `wwjd.${key}`, value: stored(dial, stop) })
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
    await $.command.register({ name: 'wwjd-dials', description: 'Set how wwjd designs: look, content, spacing, motion, copy, checking, grading' })
    await exportDials($, options)
    return next(e)
  })

  on('command.run', { command: 'wwjd-dials' }, async $ => {
    const json = await readProject($)
    await update($, project, () => (json.dials && typeof json.dials === 'object' ? (json.dials as Record<string, string | number>) : {}))
    await $.ui.open({ id: PANE, title: 'wwjd dials', focus: true, closeOnEscape: true })
    return { text: 'Dials open. DESIGN.md and the floor still win over any dial.' }
  })

  // The detail line follows the focus ring, so a stop explains itself before it is picked.
  on('ui.focus', { requestId: PANE }, async ($, e, next) => {
    await update($, focused, () => e.element ?? '').catch(() => undefined)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const where = await read($, scope)
    const proj = (await read($, project)) as Record<string, string | number>
    const [fKey, fStop] = (await read($, focused)).split(':')
    const width = Math.max('Applies to'.length, ...DIALS.map(d => d.name.length)) + 2
    const endWidth = Math.max(...DIALS.flatMap(d => d.ends.map(x => x.length)))

    const track = (id: string, stops: string[], at: number, isDim: boolean, set: (i: number) => void) =>
      stops.map((label, i) => (
        <Button key={`${id}:${i}`} plain dimColor={isDim && i !== at} label={label} onPress={() => set(i)} autoFocus={id === 'scope' && i === at ? true : undefined} />
      ))

    const scopeRow = (
      <Box flexDirection="row">
        <Text>{'Applies to'.padEnd(width + endWidth + 1)}</Text>
        {track('scope', [where === 'person' ? '● you, every project' : '○ you, every project', where === 'project' ? '   ● this project' : '   ○ this project'], where === 'person' ? 0 : 1, false, i =>
          update($, scope, () => (i === 0 ? 'person' : 'project') as Scope),
        )}
      </Box>
    )

    const rows = DIALS.map(dial => {
      const yours = mine(options, dial)
      const isOwn = where === 'project' && proj[dial.key] !== undefined
      const at = where === 'person' ? yours : isOwn ? stopOf(dial, proj[dial.key]) : yours
      const isInherited = where === 'project' && !isOwn
      const set = (i: number) => pick($, dial.key, i)
      const name = dial.stops[at]?.[0] ?? ''
      if (dial.values) {
        return (
          <Box key={`row-${dial.key}`} flexDirection="row">
            <Text>{dial.name.padEnd(width + endWidth + 1)}</Text>
            {track(dial.key, dial.stops.map(([n], i) => `${i ? '   ' : ''}${i === at ? '●' : '○'} ${n}`), at, isInherited, set)}
            {isOwn && <Button key={`${dial.key}:reset`} plain dimColor label="   use mine" onPress={() => pick($, dial.key, -1)} />}
          </Box>
        )
      }
      return (
        <Box key={`row-${dial.key}`} flexDirection="row">
          <Text>{dial.name.padEnd(width)}</Text>
          <Text dimColor>{(dial.ends[0] ?? '').padStart(endWidth)} </Text>
          {dial.stops.map(([, ], i) => [
            i > 0 ? <Text dimColor>──</Text> : null,
            <Button key={`${dial.key}:${i}`} plain dimColor={isInherited && i !== at} label={i === at ? '●' : '○'} onPress={() => set(i)} />,
          ])}
          <Text dimColor> {(dial.ends[1] ?? '').padEnd(endWidth)}  </Text>
          <Text dimColor={isInherited} bold={!isInherited && !isDefault(dial, at)}>{isInherited ? `${name} (yours)` : name}</Text>
          {isOwn && <Button key={`${dial.key}:reset`} plain dimColor label="  use mine" onPress={() => pick($, dial.key, -1)} />}
        </Box>
      )
    })

    const fDial = dialOf(fKey ?? '')
    const fStep = fDial?.stops[Number(fStop)]
    const detail =
      fKey === 'scope'
        ? Number(fStop) === 0
          ? 'You: saved to your wwjd plugin options, for every project. A project .wwjd.json overrides them.'
          : 'This project: saved to .wwjd.json "dials". Commit it to share. "use mine" hands a dial back to yours.'
        : fDial && fStep
          ? `${fDial.name} · ${fStep[0]}${isDefault(fDial, Number(fStop)) ? ' (default)' : ''}: ${fStep[1]}`
          : fDial && fStop === 'reset'
            ? `${fDial.name}: drop this project's value and use yours.`
            : HINT

    return (
      <Box flexDirection="column">
        {scopeRow}
        <Text> </Text>
        {rows}
        <Text> </Text>
        <Text wrap="wrap">{detail}</Text>
        {detail !== HINT && <Text dimColor>{HINT}</Text>}
      </Box>
    )
  })
}
