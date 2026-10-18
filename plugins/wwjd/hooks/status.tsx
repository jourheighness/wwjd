// wwjd while it works: a status-line entry with the dials that are off default, and a band above the prompt
// that lists the checks Strictness still wants before handover (gone once they are done). Both come from
// skills/ux/scripts/gate.mjs status, the same state the gate hooks enforce. Quiet until wwjd is in use this session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import { DIALS, isDefault, stopOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Gate } from '../types'

const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const isActive = atom({ plugin: 'wwjd', key: 'isActive' } as const, false)

const WATCHED = new Set(['Skill', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Agent', 'Task'])

// The dials as the scripts see them: the plugin options, then the nearest .wwjd.json.
async function dials($: EngineInterface, options: PluginOptions): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  for (const d of DIALS) out[d.key] = stopOf(d, options[d.key] ?? d.default) + 1
  const cwd = await $.session.cwd()
  for (let dir = cwd; ; ) {
    const f = `${dir}/.wwjd.json`
    if (await $.fs.exists(f)) {
      try {
        const json = JSON.parse(await $.fs.read(f)) as { dials?: Record<string, number> }
        for (const [k, v] of Object.entries(json.dials ?? {})) out[k] = Number(v)
      } catch { /* a bad file: the options stand */ }
      break
    }
    const up = dir.replace(/\/[^/]+$/, '')
    if (!up || up === dir) break
    dir = up
  }
  return out
}

async function refresh($: EngineInterface, options: PluginOptions) {
  const d = await dials($, options)
  const env = { WWJD_DIALS: Object.entries(d).map(([k, v]) => `${k}=${v}`).join(' ') }
  const stdin = JSON.stringify({ session_id: await $.session.id(), cwd: await $.session.cwd() })
  const run = await $.process.run(['node', `${$.plugin.root}/skills/ux/scripts/gate.mjs`, 'status'], { stdin, env, timeoutMs: 5000 })
  let next: Gate | null = null
  try { next = JSON.parse(run.stdout) as Gate } catch { /* node missing or the script failed: keep quiet */ }
  await update($, gate, () => next)
  const off = DIALS.filter(x => x.key !== 'strictness' && !isDefault(x, stopOf(x, d[x.key]))).map(x => `${x.name} ${x.stops[stopOf(x, d[x.key])]?.[0]}`)
  $.ui.status(['wwjd', `Strictness ${d.strictness ?? 3}`, ...off].join(' · '))
}

export const register: Register = (on, options) => {
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if (!WATCHED.has(e.tool)) return result
    const skill = e.tool === 'Skill' ? String((e as { skill?: unknown }).skill ?? '') : ''
    if (/^wwjd(:|$)/.test(skill)) await update($, isActive, () => true)
    const wasActive = await read($, isActive)
    if (wasActive || e.tool !== 'Skill') {
      await refresh($, options)
      const g = await read($, gate)
      if (!wasActive && g?.hasEdits) await update($, isActive, () => true)
    }
    if (!(await read($, isActive))) $.ui.status(undefined)
    return result
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const g = await read($, gate)
    if (e.props.hasSurvey || !(await read($, isActive)) || !g?.hasEdits) return next(e)
    const sheetDue = g.sheet.needed && !g.sheet.file
    const due = g.checks.filter(c => !c.done)
    if (!sheetDue && !due.length) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const items = [...(sheetDue ? ['Grade sheet'] : []), ...due.map(c => c.label)]
    return (
      <Box flexDirection="row" gap={1}>
        <Text dimColor>wwjd · Strictness {g.strictness} wants</Text>
        <Text color="warning">{items.join(' · ')}</Text>
      </Box>
    )
  })
}
