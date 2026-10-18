// The wwjd dials pane (/wwjd-dials): one picker per dial, for you (the plugin options) or for this project
// (.wwjd.json "dials"). Meanings: skills/wwjd/references/dials.md. Scripts read WWJD_DIALS, then .wwjd.json.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import type { Scope } from '../types'

const PANE = 'wwjd-dials'
const KEYS = ['creativity', 'budget', 'density', 'motion', 'voice', 'rigor', 'grade'] as const
type Key = (typeof KEYS)[number]
const DEFAULTS: Record<Key, string> = { creativity: '3', budget: '3', density: '3', motion: 'auto', voice: '3', rigor: '3', grade: 'gate' }
const DIALS: Record<Key, { label: string; options: [string, string][] }> = {
  creativity: { label: 'Creativity', options: [['1', 'close to the kit'], ['2', 'quiet'], ['3', 'one loud axis'], ['4', 'bold'], ['5', 'art-directed']] },
  budget: { label: 'Budget', options: [['1', 'every budget −2'], ['2', '−1'], ['3', 'as written'], ['4', '+1'], ['5', '+2']] },
  density: { label: 'Density', options: [['1', 'roomy'], ['2', 'airier'], ['3', 'by register'], ['4', 'denser'], ['5', 'compact']] },
  motion: { label: 'Motion', options: [['auto', 'by register'], ['instant', 'instant'], ['crisp', 'crisp'], ['smooth', 'smooth'], ['springy', 'springy']] },
  voice: { label: 'Voice', options: [['1', 'terse'], ['2', 'plain, shorter'], ['3', 'plain'], ['4', 'warmer'], ['5', 'warm']] },
  rigor: { label: 'Rigor', options: [['1', 'lint only'], ['2', 'lint + screenshot'], ['3', 'default'], ['4', 'two widths + runtime'], ['5', 'critic + variants']] },
  grade: { label: 'Grade', options: [['gate', 'gate: a sheet per over-budget surface'], ['light', 'light: in your head']] },
}
const INHERIT = 'inherit'

const scope = atom({ plugin: 'wwjd', key: 'scope' } as const, 'person')
const project = atom({ plugin: 'wwjd', key: 'project' } as const, {})

const mine = (options: PluginOptions, k: Key) => (options[k] === undefined || options[k] === '' ? DEFAULTS[k] : String(options[k]))
const words = (k: Key, v: string) => DIALS[k].options.find(([value]) => value === v)?.[1] ?? v

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
  const set = KEYS.filter(k => mine(options, k) !== DEFAULTS[k]).map(k => `${k}=${mine(options, k)}`)
  await $.env.set('WWJD_DIALS', set.join(' '))
}

async function pick($: EngineInterface, k: Key, v: string) {
  if ((await read($, scope)) === 'person') {
    const value = k === 'motion' || k === 'grade' ? v : Number(v)
    const { deny } = await $.config.set({ key: `wwjd.${k}`, value })
    if (deny) $.ui.toast(`Not saved: ${deny}`)
    return
  }
  const file = await projectFile($)
  const json = await readProject($)
  const dials = { ...((json.dials as Record<string, string | number>) || {}) }
  if (v === INHERIT) delete dials[k]
  else dials[k] = k === 'motion' || k === 'grade' ? v : Number(v)
  const next = { ...json, dials }
  if (!Object.keys(dials).length) delete (next as Record<string, unknown>).dials
  await $.fs.write(file, JSON.stringify(next, null, 2) + '\n')
  await update($, project, () => dials)
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'wwjd-dials', description: 'Set the wwjd dials for you or for this project' })
    await exportDials($, options)
    return next(e)
  })

  on('command.run', { command: 'wwjd-dials' }, async $ => {
    const json = await readProject($)
    await update($, project, () => (json.dials && typeof json.dials === 'object' ? (json.dials as Record<string, string | number>) : {}))
    await $.ui.open({ id: PANE, title: 'wwjd dials', focus: true, closeOnEscape: true })
    return { text: 'Dials open. DESIGN.md and the floor still win over any dial.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    if (!('Select' in ui)) return <Text>Set the dials with /plugin configure wwjd@wwjd on a computer.</Text>
    const { Select } = ui
    const where = await read($, scope)
    const proj = (await read($, project)) as Record<string, string | number>
    const own = (k: Key) => (proj[k] === undefined ? undefined : String(proj[k]))

    return (
      <Box flexDirection="column">
        <Select
          key="scope"
          label="Applies to "
          value={where}
          options={[{ value: 'person', label: 'you, every project' }, { value: 'project', label: 'this project (.wwjd.json)' }]}
          onSelect={v => update($, scope, () => v as Scope)}
          autoFocus
        />
        <Text> </Text>
        {KEYS.map(k => {
          const yours = mine(options, k)
          const value = where === 'person' ? yours : own(k) ?? INHERIT
          const opts = DIALS[k].options.map(([v, w]) => ({ value: v, label: `${v === DEFAULTS[k] ? '· ' : ''}${w}` }))
          return (
            <Select
              key={k}
              label={`${DIALS[k].label.padEnd(11)}`}
              value={value}
              options={where === 'person' ? opts : [{ value: INHERIT, label: `yours (${words(k, yours)})` }, ...opts]}
              onSelect={v => pick($, k, v)}
            />
          )
        })}
        <Text> </Text>
        <Text dimColor>
          {where === 'person'
            ? 'Saved to your wwjd plugin options. A project .wwjd.json overrides them.'
            : 'Saved to .wwjd.json "dials". Commit it to share the project\'s dials.'}
        </Text>
        <Text dimColor>· marks the default. Esc closes.</Text>
      </Box>
    )
  })
}
