// wwjd while it works: a status-line entry with the dials that are off default, and the gate state the sidebar shows
// as the checks Strictness still wants before handover. Both come from skills/ux/scripts/gate.mjs status, the same
// state the gate hooks enforce. Quiet until wwjd is in use this session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import { DIALS, isDefault, stopOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Gate } from '../types'

const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const isActive = atom({ plugin: 'wwjd', key: 'isActive' } as const, false)

// What can change the gate's state: UI edits, the critic, a board write, and the Bash runs of render.mjs and grade.mjs.
const EDITS = new Set(['Write', 'Edit', 'MultiEdit'])
const UI = /\.(tsx|jsx|vue|svelte|astro|html|mdx|css|scss)$/
const changesGate = (e: { tool: string; command?: unknown; file_path?: unknown }) =>
  (EDITS.has(e.tool) && UI.test(String(e.file_path ?? ''))) || e.tool === 'Agent' || e.tool === 'Task' ||
  e.tool === 'ArtifactData' || (e.tool === 'Bash' && /\b(render|grade)\.mjs\b/.test(String(e.command ?? '')))

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

// What the gate can't read without the transcript: when a wwjd-critic ran and when each board was written (by id).
const seen: { critic: number; board: Record<string, number> } = { critic: 0, board: {} }
async function note($: EngineInterface, e: { tool: string; subagent_type?: unknown; action?: unknown; url?: unknown }) {
  if ((e.tool === 'Agent' || e.tool === 'Task') && /wwjd-critic/.test(String(e.subagent_type ?? ''))) seen.critic = await $.clock.now()
  const id = /artifact\/([\w-]+)/.exec(String(e.url ?? ''))?.[1]
  if (e.tool === 'ArtifactData' && id && ['set', 'update', 'batch', 'delete', 'str_replace'].includes(String(e.action))) seen.board[id] = await $.clock.now()
}

async function refresh($: EngineInterface, options: PluginOptions) {
  const d = await dials($, options)
  const env = { WWJD_DIALS: Object.entries(d).map(([k, v]) => `${k}=${v}`).join(' '),
    WWJD_HOOKS: String(options.hookmode ?? 'on'), WWJD_BOARD: String(options.boardmode ?? 'on') }
  const stdin = JSON.stringify({ session_id: await $.session.id(), cwd: await $.session.cwd(), seen })
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
    await note($, e as { tool: string })
    const skill = e.tool === 'Skill' ? String((e as { skill?: unknown }).skill ?? '') : ''
    if (/^wwjd(:|$)/.test(skill)) {
      await update($, isActive, () => true)
      await refresh($, options)
    } else if ((await read($, isActive)) && changesGate(e as { tool: string; command?: unknown; file_path?: unknown })) {
      await refresh($, options)
    }
    return result
  }).catch(($, e, next) => next(e))
}
