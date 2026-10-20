// The wwjd sidebar (/wwjd): what Strictness still wants before handover, as Blocking cards under Needs you, then the
// design decisions and assumptions the agent logged, as cards grouped by task (else surface). A card's mark sits top
// left; its actions are a row of buttons under the text: a problem's fix first, a decision's Keep and Change. A change is a note for you (~/.config/wwjd/taste.md)
// or for this project (its decision log); either way it leaves the open list for Handled, with a toast saying what
// happened. The dials sit behind Settings (dials.tsx). The agent logs through the `log` tool registered here
// (mcp__wwjd__log); entries live in .wwjd/decisions.jsonl at the root of the project being edited (artifactRoot below).
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Entry, Scope } from '../types'
import { PANE, card, exportDials, loadProjectDials, settingsView } from './dials'

const view = atom({ plugin: 'wwjd', key: 'view' } as const, 'log')
const editing = atom({ plugin: 'wwjd', key: 'editing' } as const, '')
const draft = atom({ plugin: 'wwjd', key: 'draft' } as const, '')
const noteScope = atom({ plugin: 'wwjd', key: 'noteScope' } as const, 'project')
const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const logVersion = atom({ plugin: 'wwjd', key: 'logVersion' } as const, 0)
const showHandled = atom({ plugin: 'wwjd', key: 'showHandled' } as const, false)
const detail = atom({ plugin: 'wwjd', key: 'detail' } as const, '')

const TOOL = 'mcp__wwjd__log'
const SHOWN = 60

// Same root as skills/ux/scripts/paths.mjs artifactRoot(): the nearest ancestor with .wwjd.json or .wwjd/ (never the
// home folder), else the git root; so the gate and the sidebar read one log. It starts from the project being edited,
// not the session's: the file the log call names, else the last file the session edited (a session in repo A that
// edits repo B or a worktree logs to B), else the session's cwd. The sidebar reads the root it last wrote to.
const lastEdited = atom({ plugin: 'wwjd', key: 'lastEdited' } as const, '')
const logRoot = atom({ plugin: 'wwjd', key: 'logRoot' } as const, '')
const EDITS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])
const parent = (p: string) => p.replace(/\/[^/]+\/?$/, '')

async function rootOf($: EngineInterface, start: string): Promise<string | null> {
  const home = await $.env.get('HOME')
  let git: string | null = null
  for (let dir = start; dir; ) {
    if ((await $.fs.exists(`${dir}/.wwjd.json`)) || (dir !== home && (await $.fs.exists(`${dir}/.wwjd`)))) return dir
    if (!git && (await $.fs.exists(`${dir}/.git`))) git = dir
    const up = parent(dir)
    if (!up || up === dir) break
    dir = up
  }
  return git
}
async function artifactRoot($: EngineInterface, file?: string): Promise<string> {
  const cwd = await $.session.cwd()
  const from = file ? (file.startsWith('/') ? file : `${cwd}/${file}`) : await read($, lastEdited)
  if (from) {
    const root = await rootOf($, parent(from))
    if (root) return root
  }
  for (let dir = cwd, home = await $.env.get('HOME'); dir && dir !== home; ) {
    if ((await $.fs.exists(`${dir}/.wwjd.json`)) || (await $.fs.exists(`${dir}/.wwjd`))) return dir
    const up = parent(dir)
    if (!up || up === dir) break
    dir = up
  }
  return $.session.root()
}
// Where the sidebar reads, keeps and changes: the root the log tool last wrote to, else the one it would write to now.
const shownRoot = async ($: EngineInterface) => (await read($, logRoot)) || artifactRoot($)
const logFile = (root: string) => `${root}/.wwjd/decisions.jsonl`

async function readLog($: EngineInterface, root: string): Promise<Entry[]> {
  try {
    return (await $.fs.read(logFile(root))).split('\n').filter(Boolean).flatMap(line => {
      try { return [JSON.parse(line) as Entry] } catch { return [] }
    })
  } catch {
    return []
  }
}
const writeLog = async ($: EngineInterface, root: string, entries: Entry[]) =>
  $.fs.write(logFile(root), entries.map(x => JSON.stringify(x)).join('\n') + '\n')

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
async function target($: EngineInterface, where: Scope, root: string): Promise<{ file: string; head: string }> {
  if (where === 'person') {
    const taste = (await $.env.get('WWJD_TASTE')) || `${await $.env.get('HOME')}/.config/wwjd/taste.md`
    return { file: taste, head: '# Taste\n\nDesign rules for every project. A project\'s DESIGN.md and decision log outrank them.\n\n' }
  }
  if (await $.fs.exists(`${root}/docs/decisions`)) return { file: `${root}/docs/decisions/design.md`, head: '# Design decisions\n\n' }
  return { file: `${root}/DESIGN.md`, head: '# Design\n' }
}

async function correct($: EngineInterface, id: string) {
  const note = (await read($, draft)).trim()
  if (!note) return
  const where = await read($, noteScope)
  const root = await shownRoot($)
  const { file, head } = await target($, where, root)
  const day = await today($)
  const entry = await serial(async () => {
    const entries = await readLog($, root)
    const entry = entries.find(x => x.id === id)
    if (!entry || entry.correction) return null
    const line = `- ${day} · ${entry.surface}: ${note} (was: ${entry.text})\n`
    let text = (await $.fs.exists(file)) ? await $.fs.read(file) : head
    if (where === 'project' && file.endsWith('DESIGN.md') && !/^## Decisions$/m.test(text)) text = `${text.trimEnd()}\n\n## Decisions\n`
    await $.fs.write(file, `${text.trimEnd()}\n${line}`)
    entry.correction = { note, scope: where, file, at: day }
    await writeLog($, root, entries)
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

// The project's board artifact, when .wwjd.json names one ("board"): the same link every session.
async function boardUrl($: EngineInterface): Promise<string | null> {
  const f = `${await shownRoot($)}/.wwjd.json`
  try {
    const url = (JSON.parse(await $.fs.read(f)) as { board?: unknown }).board
    return typeof url === 'string' && /^https:\/\//.test(url) ? url : null
  } catch {
    return null
  }
}

// A proof as a link: a live dev-server URL is a way to try the state, an image a screenshot, anything else a file or
// a page. Paths resolve from the project root; a file's :line stays in the label.
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|[^/]+\.localhost|[^/]+\.test)(:\d+)?(\/|$)/
export function proofLink(p: string, root: string): { href: string; label: string } {
  if (/^https?:\/\//.test(p)) {
    if (LOCAL.test(p)) return { href: p, label: `▶ Try ${p.replace(/^https?:\/\/[^/]+/, '') || '/'}` }
    if (/claude\.ai\/(code\/)?artifact\//.test(p)) return { href: p, label: '↗ Artifact' }
    return { href: p, label: `↗ ${p.replace(/^https?:\/\//, '').split('/')[0]}` }
  }
  const [path = p, line] = p.split(/:(?=\d+$)/)
  const abs = path.startsWith('/') ? path : `${root}/${path}`
  const name = abs.split('/').pop() ?? abs
  if (/\.(png|jpe?g|webp|gif)$/i.test(name)) return { href: `file://${abs}`, label: `◩ ${name.replace(/\.\w+$/, '')}` }
  return { href: `file://${abs}`, label: `‹› ${name}${line ? `:${line}` : ''}` }
}

// A problem's fix: one message to the agent, nothing run behind the person's back.
async function sendFix($: EngineInterface, label: string, ask: string) {
  await $.session.append({ message: { type: 'user', content: [{ type: 'text', text: `From the wwjd sidebar: ${ask}` }] } })
  $.ui.toast(`Sent · ${label}`)
}

// Keep: the decision stands. It leaves the open list; Reopen in Handled brings it back. The host's toast holds text
// only, so the way back lives in Handled rather than an Undo in the toast.
async function setKept($: EngineInterface, id: string, isKept: boolean) {
  const day = await today($)
  const root = await shownRoot($)
  const entry = await serial(async () => {
    const entries = await readLog($, root)
    const entry = entries.find(x => x.id === id)
    if (!entry || entry.correction || Boolean(entry.kept) === isKept) return null
    if (isKept) entry.kept = { at: day }
    else delete entry.kept
    await writeLog($, root, entries)
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
          path: { type: 'string', description: 'A file this is about, when the project being edited is not the session\'s folder; the entry goes to that project\'s log' },
          task: { type: 'string', description: 'The task this belongs to, the same words for every entry of it ("Signup flow", "Sidebar log")' },
          proof: { type: 'array', items: { type: 'string' }, description: 'What it is about: a screenshot or file path (file:line), the dev-server URL that shows the state, an artifact link' },
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
    const x = e as unknown as { surface?: unknown; kind?: unknown; text?: unknown; why?: unknown; path?: unknown; task?: unknown; proof?: unknown }
    if (typeof x.surface !== 'string' || typeof x.text !== 'string' || (x.kind !== 'assumption' && x.kind !== 'choice')) {
      return { deny: 'Needs surface, kind (assumption or choice) and text.' }
    }
    const proof = Array.isArray(x.proof) ? x.proof.filter((p): p is string => typeof p === 'string' && p.trim() !== '' && p.length <= 2048).map(p => p.trim()).slice(0, 6) : []
    const entry = {
      surface: x.surface.trim(), kind: x.kind as Entry['kind'], text: x.text.trim(),
      ...(typeof x.why === 'string' && x.why.trim() ? { why: x.why.trim() } : {}),
      ...(typeof x.task === 'string' && x.task.trim() ? { task: x.task.trim() } : {}),
      ...(proof.length ? { proof } : {}),
    }
    const now = await $.clock.now()
    const root = await artifactRoot($, typeof x.path === 'string' && x.path.trim() ? x.path.trim() : undefined)
    const id = await serial(async () => {
      const entries = await readLog($, root)
      const id = newId(now, new Set(entries.map(y => y.id)))
      entries.push({ id, at: new Date(now).toISOString(), ...entry })
      await writeLog($, root, entries)
      return id
    })
    await update($, logRoot, () => root)
    await update($, logVersion, n => (n ?? 0) + 1)
    // The log is the sidebar's reason to exist: it opens on the first entry (an open pane is left as it is).
    await $.ui.open({ id: PANE, title: 'wwjd' }).catch(() => undefined)
    // An MCP tool answers with text (or content blocks); an object fails the host's output schema.
    return { result: `Logged ${id}.` }
  })

  // The last file the session edited names the project being worked on (see artifactRoot).
  // One matched hook per edit tool: the module's one unmatched tool.call hook is status.tsx's.
  for (const tool of EDITS) {
    on('tool.call', { tool: tool as 'Edit' }, async ($, e, next) => {
      const result = await next(e)
      const x = e as unknown as { file_path?: unknown; notebook_path?: unknown }
      const fp = typeof x.file_path === 'string' ? x.file_path : typeof x.notebook_path === 'string' ? x.notebook_path : ''
      if (fp) {
        const cwd = await $.session.cwd()
        await update($, lastEdited, () => (fp.startsWith('/') ? fp : `${cwd}/${fp}`))
      }
      return result
    }).catch(($, e, next) => next(e))
  }

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
    const Link = ui.Link
    const isHandledShown = await read($, showHandled)
    const shownDetail = await read($, detail)
    const root = await shownRoot($).catch(() => '')
    const board = await boardUrl($).catch(() => null)
    // What Strictness still wants after the last UI edit, from the same gate state the hooks enforce: Blocking cards.
    const g = await read($, gate)
    const due = g?.hasEdits
      ? [
          ...(g.sheet.due ? [{ key: 'sheet', text: 'Grade sheet due', fix: 'Write sheet', ask: `write the grade sheet before building${g.sheet.file ? ` ${g.sheet.file}` : ''} (references/budgets.md, Grade gate).`, how: g.sheet.file ?? '' }] : []),
          ...g.checks.filter(c => !c.done).map(c => ({ key: c.key, text: c.label.charAt(0).toUpperCase() + c.label.slice(1), fix: 'Run', ask: `run this check before handover: ${c.label}. ${c.how}`, how: c.how })),
        ]
      : []
    const all = await shownRoot($).then(root => readLog($, root), () => [] as Entry[])
    const entries = all.filter(x => !settled(x)).slice(-SHOWN)
    const handled = all.filter(settled).slice(-SHOWN).reverse()
    const open = await read($, editing)
    const where = await read($, noteScope)
    const note = await read($, draft)
    const Input = 'Input' in ui ? ui.Input : null

    // Tasks (else surfaces) in order of their latest entry, newest first; entries in each oldest first.
    const groupOf = (x: Entry) => x.task ?? x.surface
    const byGroup = new Map<string, Entry[]>()
    for (const x of entries) byGroup.set(groupOf(x), [...(byGroup.get(groupOf(x)) ?? []), x])
    const groups = [...byGroup.entries()].sort((a, b) => (b[1].at(-1)?.at ?? '').localeCompare(a[1].at(-1)?.at ?? ''))

    // A card action: a native button on the desktop, [ ] on the terminal; the one primary per card, the rest plain.
    const action = (key: string, label: string, onPress: () => unknown, kind: 'primary' | 'plain' | 'dim' = 'plain') =>
      <Button key={key} label={label} variant={kind === 'primary' ? 'primary' : undefined} dimColor={kind === 'dim'} onPress={() => { void onPress() }} />
    const actions = (key: string, list: JSX.Element[]) =>
      <Box key={`actions:${key}`} flexDirection="row" flexWrap="wrap" gap="xs" marginTop="xs">{list}</Box>
    const proofs = (key: string, list: string[] | undefined) => list?.length ? (
      <Box key={`proof:${key}`} flexDirection="row" flexWrap="wrap" gap="sm">
        {list.map((p, i) => { const l = proofLink(p, root); return <Text key={`proof:${key}:${i}`}><Link href={l.href} label={l.label} /></Text> })}
      </Box>
    ) : null
    const mark = (kind: Entry['kind'] | 'blocking') => kind === 'blocking'
      ? <Text color="error" bold>✕</Text>
      : kind === 'assumption' ? <Text color="suggestion" bold>?</Text> : <Text dimColor bold>·</Text>
    // The mark sits on the first line at the top left; everything else, the actions included, hangs on the text's edge.
    const lead = (key: string, kind: Entry['kind'] | 'blocking', text: string, why: string | undefined, below: (JSX.Element | null)[]) => (
      <Box key={`lead:${key}`} flexDirection="row" gap={1} alignItems="flex-start">
        {mark(kind)}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} gap="xs">
          <Box flexDirection="column">
            <Text wrap="wrap">{text}</Text>
            {why ? <Text wrap="wrap" dimColor>{why}</Text> : null}
          </Box>
          {below}
        </Box>
      </Box>
    )

    const blockingCard = (d: (typeof due)[number]) => {
      const isOpen = shownDetail === `due:${d.key}`
      return card(ui, `due-card:${d.key}`, lead(d.key, 'blocking', d.text, 'Before handover', [
        isOpen ? <Text key={`how:${d.key}`} wrap="wrap" dimColor>{d.how}</Text> : null,
        actions(d.key, [
          action(`fix:${d.key}`, d.fix, () => sendFix($, `${d.fix} · ${d.text}`, d.ask), 'primary'),
          ...(d.how ? [action(`detail:${d.key}`, isOpen ? 'Hide details' : 'Details', () => update($, detail, v => (v === `due:${d.key}` ? '' : `due:${d.key}`)), 'dim')] : []),
        ]),
      ]), 'error')
    }

    const decisionCard = (x: Entry) => {
      if (open === x.id) {
        return card(ui, `card:${x.id}`, lead(x.id, x.kind, x.text, x.why, [
          Input ? (
            <Input key={`note:${x.id}`} placeholder="What it should be" value={note} autoFocus
              onInput={v => update($, draft, () => v)} onSubmit={v => update($, draft, () => v).then(() => correct($, x.id))} />
          ) : null,
          <Box key={`scope:${x.id}`} flexDirection="row" flexWrap="wrap" gap="xs" alignItems="center">
            <Text dimColor>Save for</Text>
            {(['project', 'person'] as const).map(sc => (
              <Button key={`scope:${x.id}:${sc}`} label={sc === 'project' ? 'This project' : 'Every project'}
                dimColor={where !== sc} onPress={() => update($, noteScope, () => sc)} />
            ))}
          </Box>,
          actions(x.id, [
            action(`save:${x.id}`, 'Save', () => correct($, x.id), 'primary'),
            action(`cancel:${x.id}`, 'Cancel', () => update($, editing, () => ''), 'dim'),
          ]),
        ]))
      }
      return card(ui, `card:${x.id}`, lead(x.id, x.kind, x.text, x.why, [
        proofs(x.id, x.proof),
        actions(x.id, [
          action(`keep:${x.id}`, 'Keep', () => setKept($, x.id, true)),
          action(`change:${x.id}`, 'Change', () => update($, draft, () => '').then(() => update($, editing, () => x.id))),
        ]),
      ]))
    }

    const handledRow = (x: Entry) => (
      <Box key={`handled:${x.id}`} flexDirection="row" gap={1} alignItems="flex-start">
        {mark(x.kind)}
        <Box flexDirection="column" flexGrow={1} flexShrink={1}>
          <Text wrap="wrap" dimColor><Text dimColor>{x.task ?? x.surface} · </Text>{x.text}</Text>
          {x.correction
            ? <Text wrap="wrap">→ {x.correction.note} <Text dimColor>· {x.correction.scope === 'person' ? 'yours' : 'project'}</Text></Text>
            : <Text dimColor>Kept</Text>}
        </Box>
        {x.kept ? <Button key={`reopen:${x.id}`} plain dimColor label="Reopen" onPress={() => setKept($, x.id, false)} /> : null}
      </Box>
    )

    return (
      <Box flexDirection="column" padding="md" gap="md">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box flexGrow={1}><Text bold>Decisions</Text></Box>
          {board ? <Text><Link href={board} label="↗ Board" /></Text> : null}
          <Button key="to-settings" plain dimColor label="Settings" onPress={() => update($, view, () => 'settings')} />
        </Box>
        {due.length ? (
          <Box key="needs" flexDirection="column" gap="sm">
            <Text bold color="error">Needs you <Text dimColor>{String(due.length)}</Text></Text>
            {due.map(blockingCard)}
          </Box>
        ) : null}
        {groups.length
          ? groups.map(([name, xs]) => {
            const surfaces = [...new Set(xs.map(x => x.surface))]
            const isTask = xs.some(x => x.task)
            return (
              <Box key={`group:${name}`} flexDirection="column" gap="sm">
                <Text bold>{name}</Text>
                {isTask && surfaces.length > 1
                  ? surfaces.map(sf => (
                    <Box key={`sub:${name}:${sf}`} flexDirection="column" gap="sm">
                      <Text dimColor>{sf}</Text>
                      {xs.filter(x => x.surface === sf).map(decisionCard)}
                    </Box>
                  ))
                  : xs.map(decisionCard)}
              </Box>
            )
          })
          : due.length ? null : <Text dimColor>{handled.length ? 'Nothing open.' : 'No decisions logged in this project yet.'}</Text>}
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
