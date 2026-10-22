// wwjd while it works: a status-line entry with the dials that are off default, and the gate state the sidebar shows
// as the checks Strictness still wants before handover. Both come from skills/ux/scripts/gate.mjs status, the same
// state the gate hooks enforce. Quiet until wwjd is in use this session.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, PluginOptions, Register } from 'claude-code'

import { DIALS, isDefault, stopOf } from '../skills/ux/scripts/dials-spec.mjs'
import type { Gate } from '../types'

const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const isActive = atom({ plugin: 'wwjd', key: 'isActive' } as const, false)

// What can change the gate's state: UI, wwjd.flow.json, .wwjd.json and grade sheet (.wwjd/grade/*.md) edits, the
// critic, an Artifact publish (the canvas), and the Bash runs of render.mjs, grade.mjs and flow.mjs. A logged decision
// too, through gateMayHaveChanged below.
const EDITS = new Set(['Write', 'Edit', 'MultiEdit'])
const UI = /(\.(tsx|jsx|vue|svelte|astro|html|mdx|css|scss)|(^|\/)wwjd\.flow\.json|(^|\/)\.wwjd\.json|(^|\/)\.wwjd\/grade\/[^/]+\.md)$/
const changesGate = (e: { tool: string; command?: unknown; file_path?: unknown }) =>
  (EDITS.has(e.tool) && UI.test(String(e.file_path ?? ''))) || e.tool === 'Agent' || e.tool === 'Task' ||
  e.tool === 'Artifact' || (e.tool === 'Bash' && /\b(render|grade|flow)\.mjs\b/.test(String(e.command ?? '')))

// The dials as the plugin options hold them. The gate applies the edited project's .wwjd.json itself (paths.mjs
// dialsFor), as the Stop hook does; folding the cwd's file in here would make the two disagree.
function dials(options: PluginOptions): Record<string, number> {
  const out: Record<string, number> = {}
  for (const d of DIALS) out[d.key] = stopOf(d, options[d.key] ?? d.default) + 1
  return out
}

// What the gate can't read without the transcript: when a wwjd-critic ran and when each Artifact was published (by id;
// the gate's canvas check). A read, open, pin or asset upload is not a publish.
const seen: { critic: number; artifact: Record<string, number> } = { critic: 0, artifact: {} }
async function note($: EngineInterface, e: { tool: string; subagent_type?: unknown; action?: unknown; url?: unknown; asset?: unknown }) {
  if ((e.tool === 'Agent' || e.tool === 'Task') && /wwjd-critic/.test(String(e.subagent_type ?? ''))) seen.critic = await $.clock.now()
  const id = /artifact\/([\w-]+)/.exec(String(e.url ?? ''))?.[1]
  if (e.tool === 'Artifact' && id && (e.action === undefined || e.action === 'publish') && !e.asset) seen.artifact[id] = await $.clock.now()
}

async function refresh($: EngineInterface, options: PluginOptions) {
  const d = dials(options)
  const env = { WWJD_DIALS: Object.entries(d).map(([k, v]) => `${k}=${v}`).join(' '),
    WWJD_HOOKS: String(options.hookmode ?? 'on'),
    WWJD_FLOW: String(options.flowmode ?? 'on'), WWJD_CANVAS: String(options.canvasmode ?? 'on') }
  const stdin = JSON.stringify({ session_id: await $.session.id(), cwd: await $.session.cwd(), seen })
  const run = await $.process.run(['node', `${$.plugin.root}/skills/ux/scripts/gate.mjs`, 'status'], { stdin, env, timeoutMs: 5000 })
  let next: Gate | null = null
  try { next = JSON.parse(run.stdout) as Gate } catch { /* node missing or the script failed: keep quiet */ }
  // Redraw only on a real change: a refresh after every tool call would otherwise redraw the pane while the person
  // clicks, and a press that lands mid-redraw can miss.
  const prev = await read($, gate)
  if (JSON.stringify(prev) !== JSON.stringify(next)) await update($, gate, () => next)
  const off = DIALS.filter(x => x.key !== 'strictness' && !isDefault(x, stopOf(x, d[x.key]))).map(x => `${x.name} ${x.stops[stopOf(x, d[x.key])]?.[0]}`)
  // Strictness as the gate read it for the edited project (its .wwjd.json wins), else yours.
  $.ui.status(['wwjd', `Strictness ${next && next.strictness > 0 ? next.strictness : d.strictness ?? 3}`, ...off].join(' · '))
}

// The refresh runs beside the tool call, never in front of its result: one at a time, and a call that asks while one
// runs gets one more run after it (that one reads the newest state). A failure stays quiet.
let running = false
let isAgain = false
function kick($: EngineInterface, options: PluginOptions) {
  if (running) { isAgain = true; return }
  running = true
  void (async () => {
    try {
      do {
        isAgain = false
        await refresh($, options).catch(() => undefined)
      } while (isAgain)
    } finally {
      running = false
    }
  })()
}

/** A gate refresh from outside this module's tool.call hook: the log tool (sidebar.tsx) answers its own calls, so this
 *  hook, nested beneath it, never sees them. Waits for nothing. */
export async function gateMayHaveChanged($: EngineInterface, options: PluginOptions) {
  if (await read($, isActive)) kick($, options)
}

export const register: Register = (on, options) => {
  // Nothing runs until a wwjd skill is used this session; after that, only calls that can change the gate refresh it.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    await note($, e as { tool: string })
    const skill = e.tool === 'Skill' ? String((e as { skill?: unknown }).skill ?? '') : ''
    if (/^wwjd(:|$)/.test(skill)) {
      await update($, isActive, () => true)
      kick($, options)
    } else if ((await read($, isActive)) && changesGate(e as { tool: string; command?: unknown; file_path?: unknown })) {
      kick($, options)
    }
    return result
  }).catch(($, e, next) => next(e))
}
