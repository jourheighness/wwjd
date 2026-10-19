// The wwjd sidebar (/wwjd): the design decisions and assumptions the agent logged, grouped by surface. Each open one
// is kept as it is or changed with a note for you (~/.config/wwjd/taste.md) or for this project (its decision log);
// either way it leaves the open list for Handled, with a toast saying what happened. The dials sit
// behind Settings (dials.tsx). The agent logs through the `log` tool registered here (mcp__wwjd__log); entries
// live in .wwjd/decisions.jsonl at the project root.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Entry, Scope } from '../types'
import { PANE, exportDials, loadProjectDials, settingsView } from './dials'

const view = atom({ plugin: 'wwjd', key: 'view' } as const, 'log')
const editing = atom({ plugin: 'wwjd', key: 'editing' } as const, '')
const draft = atom({ plugin: 'wwjd', key: 'draft' } as const, '')
const noteScope = atom({ plugin: 'wwjd', key: 'noteScope' } as const, 'project')
const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const logVersion = atom({ plugin: 'wwjd', key: 'logVersion' } as const, 0)
const showHandled = atom({ plugin: 'wwjd', key: 'showHandled' } as const, false)

const TOOL = 'mcp__wwjd__log'
const SHOWN = 60

// Same root as skills/ux/scripts/paths.mjs artifactRoot(): the nearest ancestor of cwd with .wwjd.json or .wwjd/
// (never the home folder), else the session's root; so the gate and the sidebar read one log.
async function artifactRoot($: EngineInterface): Promise<string> {
  const home = await $.env.get('HOME')
  for (let dir = await $.session.cwd(); dir && dir !== home; ) {
    if ((await $.fs.exists(`${dir}/.wwjd.json`)) || (await $.fs.exists(`${dir}/.wwjd`))) return dir
    const up = dir.replace(/\/[^/]+$/, '')
    if (!up || up === dir) break
    dir = up
  }
  return $.session.root()
}
const logFile = async ($: EngineInterface) => `${await artifactRoot($)}/.wwjd/decisions.jsonl`

async function readLog($: EngineInterface): Promise<Entry[]> {
  try {
    return (await $.fs.read(await logFile($))).split('\n').filter(Boolean).flatMap(line => {
      try { return [JSON.parse(line) as Entry] } catch { return [] }
    })
  } catch {
    return []
  }
}
const writeLog = async ($: EngineInterface, entries: Entry[]) =>
  $.fs.write(await logFile($), entries.map(x => JSON.stringify(x)).join('\n') + '\n')

// Every read-modify-write of the log runs one at a time: parallel `log` calls would otherwise read the same
// entries and the last write would drop the others.
let queue: Promise<unknown> = Promise.resolve()
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn)
  queue = run.catch(() => undefined)
  return run
}
// Ids: the time plus a counter, so two entries never share one (also across sessions writing the same log).
let seq = 0
const newId = (now: number, taken: Set<string>) => {
  let id = ''
  do id = `d${now.toString(36)}${(seq++).toString(36)}`
  while (taken.has(id))
  return id
}

const today = async ($: EngineInterface) => new Date(await $.clock.now()).toISOString().slice(0, 10)

// Where a correction is kept: your taste file, or the project's decision log (docs/decisions/, else DESIGN.md).
async function target($: EngineInterface, where: Scope): Promise<{ file: string; head: string }> {
  if (where === 'person') {
    const taste = (await $.env.get('WWJD_TASTE')) || `${await $.env.get('HOME')}/.config/wwjd/taste.md`
    return { file: taste, head: '# Taste\n\nDesign rules for every project. A project\'s DESIGN.md and decision log outrank them.\n\n' }
  }
  const root = await $.session.root()
  if (await $.fs.exists(`${root}/docs/decisions`)) return { file: `${root}/docs/decisions/design.md`, head: '# Design decisions\n\n' }
  return { file: `${root}/DESIGN.md`, head: '# Design\n' }
}

async function correct($: EngineInterface, id: string) {
  const note = (await read($, draft)).trim()
  if (!note) return
  const where = await read($, noteScope)
  const { file, head } = await target($, where)
  const day = await today($)
  const entry = await serial(async () => {
    const entries = await readLog($)
    const entry = entries.find(x => x.id === id)
    if (!entry || entry.correction) return null
    const line = `- ${day} · ${entry.surface}: ${note} (was: ${entry.text})\n`
    let text = (await $.fs.exists(file)) ? await $.fs.read(file) : head
    if (where === 'project' && file.endsWith('DESIGN.md') && !/^## Decisions$/m.test(text)) text = `${text.trimEnd()}\n\n## Decisions\n`
    await $.fs.write(file, `${text.trimEnd()}\n${line}`)
    entry.correction = { note, scope: where, file, at: day }
    await writeLog($, entries)
    return entry
  })
  if (!entry) return
  await update($, editing, () => '')
  await update($, draft, () => '')
  await update($, logVersion, n => (n ?? 0) + 1)
  await $.session.append({ message: { type: 'user', content: [{ type: 'text', text:
    `Design correction from the wwjd sidebar (${where === 'person' ? 'yours, every project' : 'this project'}; saved to ${file}): ` +
    `${entry.surface}: "${note}". It replaces "${entry.text}". Apply it to the work in progress.` }] } })
  $.ui.toast(`Changed · ${entry.surface} · saved to ${file.split('/').slice(-2).join('/')}`)
}

const settled = (x: Entry) => Boolean(x.correction || x.kept)

// Keep: the decision stands. It leaves the open list; Reopen in Handled brings it back. The host's toast holds text
// only, so the way back lives in Handled rather than an Undo in the toast.
async function setKept($: EngineInterface, id: string, isKept: boolean) {
  const day = await today($)
  const entry = await serial(async () => {
    const entries = await readLog($)
    const entry = entries.find(x => x.id === id)
    if (!entry || entry.correction || Boolean(entry.kept) === isKept) return null
    if (isKept) entry.kept = { at: day }
    else delete entry.kept
    await writeLog($, entries)
    return entry
  })
  if (!entry) return
  await update($, logVersion, n => (n ?? 0) + 1)
  $.ui.toast(isKept ? `Kept · ${entry.surface}` : `Reopened · ${entry.surface}`)
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    await exportDials($, options)
    await $.command.register({ name: 'wwjd', description: 'Design decisions and assumptions to keep or change; dials under Settings' })
    await $.tool.register({
      name: 'log',
      description: 'Log one design assumption or choice the person did not ask for (wwjd). One call per item, as it is made.',
      isDeferred: false,
      inputSchema: {
        type: 'object',
        required: ['surface', 'kind', 'text'],
        properties: {
          surface: { type: 'string', description: 'The component, screen or layout it is about, in product words ("Task card", "Settings page")' },
          kind: { type: 'string', enum: ['assumption', 'choice'], description: 'assumption: a guess about product, data or intent; choice: a design call nobody asked for' },
          text: { type: 'string', description: 'One line, what was assumed or chosen ("Dropped the comment count")' },
          why: { type: 'string', description: 'One short reason ("over the card budget")' },
        },
      },
    })
    // Opened once, it comes back every session until the person closes it.
    if ((await $.store.get('isPinned')) === true) await $.ui.open({ id: PANE, title: 'wwjd' }).catch(() => undefined)
    return next(e)
  })

  on('ui.close', { id: PANE }, async ($, e, next) => {
    if (e.origin.kind === 'person') await $.store.set('isPinned', false)
    return next(e)
  })

  on('tool.call', { tool: TOOL }, async ($, e) => {
    const x = e as unknown as { surface?: unknown; kind?: unknown; text?: unknown; why?: unknown }
    if (typeof x.surface !== 'string' || typeof x.text !== 'string' || (x.kind !== 'assumption' && x.kind !== 'choice')) {
      return { deny: 'Needs surface, kind (assumption or choice) and text.' }
    }
    const entry = { surface: x.surface.trim(), kind: x.kind as Entry['kind'], text: x.text.trim(), ...(typeof x.why === 'string' && x.why.trim() ? { why: x.why.trim() } : {}) }
    const now = await $.clock.now()
    const id = await serial(async () => {
      const entries = await readLog($)
      const id = newId(now, new Set(entries.map(y => y.id)))
      entries.push({ id, at: new Date(now).toISOString(), ...entry })
      await writeLog($, entries)
      return id
    })
    await update($, logVersion, n => (n ?? 0) + 1)
    // The log is the sidebar's reason to exist: it opens on the first entry (an open pane is left as it is).
    await $.ui.open({ id: PANE, title: 'wwjd' }).catch(() => undefined)
    // An MCP tool answers with text (or content blocks); an object fails the host's output schema.
    return { result: `Logged ${id}.` }
  })

  on('command.run', { command: 'wwjd' }, async $ => {
    await $.store.set('isPinned', true)
    await loadProjectDials($)
    await $.ui.open({ id: PANE, title: 'wwjd', focus: true, closeOnEscape: true })
    return { text: 'wwjd sidebar open.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const shown = await read($, view)
    const header = (title: string, action: JSX.Element) => (
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text bold>{title}</Text>
        {action}
      </Box>
    )

    if (shown === 'settings') {
      return (
        <Box flexDirection="column" padding="md" gap="md">
          {header('Settings', <Button key="to-log" plain dimColor label="‹ Decisions" onPress={() => update($, view, () => 'log')} />)}
          {await settingsView($, e, options)}
        </Box>
      )
    }

    await read($, logVersion)
    const isHandledShown = await read($, showHandled)
    // What Strictness still wants after the last UI edit, from the same gate state the hooks enforce.
    const g = await read($, gate)
    const due = g?.hasEdits ? [...(g.sheet.due ? ['Grade sheet'] : []), ...g.checks.filter(c => !c.done).map(c => c.label)] : []
    const all = await readLog($)
    const entries = all.filter(x => !settled(x)).slice(-SHOWN)
    const handled = all.filter(settled).slice(-SHOWN).reverse()
    const open = await read($, editing)
    const where = await read($, noteScope)
    const note = await read($, draft)
    const Input = 'Input' in ui ? ui.Input : null

    // Surfaces in order of their latest entry, newest first; entries in each oldest first.
    const bySurface = new Map<string, Entry[]>()
    for (const x of entries) bySurface.set(x.surface, [...(bySurface.get(x.surface) ?? []), x])
    const groups = [...bySurface.entries()].sort((a, b) => (b[1].at(-1)?.at ?? '').localeCompare(a[1].at(-1)?.at ?? ''))

    const editor = (x: Entry) => (
      <Box flexDirection="column" gap="sm" marginLeft={2}>
        {Input ? (
          <Input key={`note:${x.id}`} placeholder="What it should be" value={note} autoFocus
            onInput={v => update($, draft, () => v)} onSubmit={v => update($, draft, () => v).then(() => correct($, x.id))} />
        ) : null}
        <Box flexDirection="row" flexWrap="wrap" gap="xs" alignItems="center">
          {(['project', 'person'] as const).map(s => (
            <Button key={`scope:${x.id}:${s}`} label={s === 'project' ? 'This project' : 'You, every project'}
              variant={where === s ? 'primary' : undefined} dimColor={where !== s} onPress={() => update($, noteScope, () => s)} />
          ))}
          <Button key={`save:${x.id}`} label="Save" variant="primary" onPress={() => correct($, x.id)} />
          <Button key={`cancel:${x.id}`} plain dimColor label="Cancel" onPress={() => update($, editing, () => '')} />
        </Box>
      </Box>
    )

    const mark = (x: Entry) =>
      <Text color={x.kind === 'assumption' ? 'warning' : undefined} dimColor={x.kind === 'choice'}>{x.kind === 'assumption' ? '?' : '·'}</Text>

    const row = (x: Entry) => (
      <Box key={`entry:${x.id}`} flexDirection="column">
        <Box flexDirection="row" gap={1}>
          {mark(x)}
          <Box flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text wrap="wrap">{x.text}</Text>
            {x.why ? <Text wrap="wrap" dimColor>{x.why}</Text> : null}
          </Box>
          {open !== x.id ? (
            <Box flexDirection="row" gap="xs">
              <Button key={`keep:${x.id}`} plain dimColor label="Keep" onPress={() => setKept($, x.id, true)} />
              <Button key={`change:${x.id}`} plain dimColor label="Change" onPress={() => update($, draft, () => '').then(() => update($, editing, () => x.id))} />
            </Box>
          ) : null}
        </Box>
        {open === x.id ? editor(x) : null}
      </Box>
    )

    const handledRow = (x: Entry) => (
      <Box key={`handled:${x.id}`} flexDirection="row" gap={1}>
        {mark(x)}
        <Box flexDirection="column" flexGrow={1} flexShrink={1}>
          <Text wrap="wrap" dimColor><Text dimColor>{x.surface} · </Text>{x.text}</Text>
          {x.correction
            ? <Text wrap="wrap">→ {x.correction.note} <Text dimColor>· {x.correction.scope === 'person' ? 'yours' : 'project'}</Text></Text>
            : <Text dimColor>Kept</Text>}
        </Box>
        {x.kept ? <Button key={`reopen:${x.id}`} plain dimColor label="Reopen" onPress={() => setKept($, x.id, false)} /> : null}
      </Box>
    )

    return (
      <Box flexDirection="column" padding="md" gap="md">
        {header('Decisions', <Button key="to-settings" plain dimColor label="Settings" onPress={() => update($, view, () => 'settings')} />)}
        {due.length ? <Text color="warning" wrap="wrap">Before handover: {due.join(' · ')}</Text> : null}
        {groups.length
          ? groups.map(([surface, xs]) => (
            <Box key={`surface:${surface}`} flexDirection="column" gap="xs">
              <Text bold>{surface}</Text>
              {xs.map(row)}
            </Box>
          ))
          : <Text dimColor>{handled.length ? 'Nothing open.' : 'No decisions logged in this project yet.'}</Text>}
        {handled.length ? (
          <Box flexDirection="column" gap="xs">
            <Button key="handled" plain dimColor label={`${isHandledShown ? '▾' : '▸'} Handled · ${handled.length}`}
              onPress={() => update($, showHandled, v => !v)} />
            {isHandledShown ? handled.map(handledRow) : null}
          </Box>
        ) : null}
      </Box>
    )
  })
}
