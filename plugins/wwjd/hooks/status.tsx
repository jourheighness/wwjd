// wwjd while it works: a status-line entry with the dials that are off default, and the gate state the sidebar shows
// as the checks Strictness still wants before handover. Both come from skills/ux/scripts/gate.mjs status, the same
// state the gate hooks enforce. Quiet until wwjd is in use this session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import { DIALS, isDefault, stopOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Gate } from '../types'

const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const isActive = atom({ plugin: 'wwjd', key: 'isActive' } as const, false)

// What can change the gate's state: UI edits, the critic, and the Bash runs of render.mjs and grade.mjs.
const WATCHED = new Set(['Write', 'Edit', 'MultiEdit', 'Agent', 'Task'])
const changesGate = (e: { tool: string; command?: unknown }) =>
  WATCHED.has(e.tool) || (e.tool === 'Bash' && /\b(render|grade)\.mjs\b/.test(String(e.command ?? '')))

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
  // Redraw only on a real change: a refresh after every tool call would otherwise redraw the pane while the person
  // clicks, and a press that lands mid-redraw can miss.
  const prev = await read($, gate)
  if (JSON.stringify(prev) !== JSON.stringify(next)) await update($, gate, () => next)
  const off = DIALS.filter(x => x.key !== 'strictness' && !isDefault(x, stopOf(x, d[x.key]))).map(x => `${x.name} ${x.stops[stopOf(x, d[x.key])]?.[0]}`)
  $.ui.status(['wwjd', `Strictness ${d.strictness ?? 3}`, ...off].join(' · '))
}

export const register: Register = (on, options) => {
  // Nothing runs until a wwjd skill is used this session; after that, only calls that can change the gate refresh it.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    const skill = e.tool === 'Skill' ? String((e as { skill?: unknown }).skill ?? '') : ''
    if (/^wwjd(:|$)/.test(skill)) {
      await update($, isActive, () => true)
      await refresh($, options)
    } else if ((await read($, isActive)) && changesGate(e as { tool: string; command?: unknown })) {
      await refresh($, options)
    }
    return result
  }).catch(($, e, next) => next(e))
}
