// The wwjd sidebar (/wwjd), in plain words for someone who never read the skill. Two sections, each saying what it
// holds: "Not done yet" (what Claude still does before calling the work finished, from the Strictness gate: Run it or
// Skip) and "Claude decided" (choices and guesses already in the work, grouped by task: the ✕ dismisses it as fine,
// Edit or Correct sends Claude the change, just this time or saved as a rule for this project or every project).
// Every button says what it does and every toast says what happened. Proof opens inside the desktop app where it can:
// an Artifact in its pane, a page in the built-in browser, a file in the Files pane; else as a link. The dials sit behind Settings (dials.tsx). The agent logs through the `log` tool registered here
// (mcp__wwjd__log); entries live in .wwjd/decisions.jsonl at the root of the project being edited (artifactRoot below).
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Entry, NoteScope, Scope } from '../types'
import { PANE, card, exportDials, loadProjectDials, setProjectRoot, settingsView } from './dials'

const view = atom({ plugin: 'wwjd', key: 'view' } as const, 'log')
const editing = atom({ plugin: 'wwjd', key: 'editing' } as const, '')
// The correction being typed: kept out of state, so a keystroke never redraws the pane (a redraw mid-typing drops keys).
let draftText = ''
const noteScope = atom({ plugin: 'wwjd', key: 'noteScope' } as const, 'once')
const gate = atom({ plugin: 'wwjd', key: 'gate' } as const, null)
const logVersion = atom({ plugin: 'wwjd', key: 'logVersion' } as const, 0)
const showHandled = atom({ plugin: 'wwjd', key: 'showHandled' } as const, false)

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
// The pane's last read of disk (see the render), at a log version; a file edit clears it.
let snap: { ver: number; root: string; board: string | null; dirs: Direction[]; all: Entry[] } | null = null

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
  const note = draftText.trim()
  if (!note) { $.ui.toast('Write what it should be first'); return }
  const where = (await read($, noteScope)) as NoteScope
  const root = await shownRoot($)
  const { file, head } = where === 'once' ? { file: '', head: '' } : await target($, where, root)
  const day = await today($)
  const entry = await serial(async () => {
    const entries = await readLog($, root)
    const entry = entries.find(x => x.id === id)
    if (!entry || entry.correction) return null
    if (where !== 'once') {
      const line = `- ${day} · ${entry.surface}: ${note} (was: ${entry.text})\n`
      let text = (await $.fs.exists(file)) ? await $.fs.read(file) : head
      if (where === 'project' && file.endsWith('DESIGN.md') && !/^## Decisions$/m.test(text)) text = `${text.trimEnd()}\n\n## Decisions\n`
      await $.fs.write(file, `${text.trimEnd()}\n${line}`)
    }
    entry.correction = { note, scope: where, file, at: day }
    await writeLog($, root, entries)
    return entry
  })
  if (!entry) return
  await update($, editing, () => '')
  draftText = ''
  await update($, logVersion, n => (n ?? 0) + 1)
  await $.session.append({ message: { type: 'user', content: [{ type: 'text', text:
    `Design correction from the wwjd sidebar (${where === 'once' ? 'just this time, not saved as a rule' : `${where === 'person' ? 'every project' : 'this project'}; saved to ${file}`}): ` +
    `${entry.surface}: "${note}". It replaces "${entry.text}". Apply it to the work in progress.` }] } })
  $.ui.toast(where === 'once' ? `Sent to Claude · ${entry.surface} · just this time` : `Sent to Claude · ${entry.surface} · saved as a rule in ${file.split('/').slice(-2).join('/')}`)
}

const settled = (x: Entry) => Boolean(x.correction || x.kept)

// The project's board artifact, when .wwjd.json names one ("board"): the same link every session.
// The directions explored, from .wwjd/directions.json (written with the board; local, never committed):
// [{ name, url, board?, note? }]. Directions that share one canvas open it with one button.
type Direction = { name: string; url: string; board?: string }
async function directions($: EngineInterface, root: string): Promise<Direction[]> {
  try {
    const raw = JSON.parse(await $.fs.read(`${root}/.wwjd/directions.json`)) as unknown
    return (Array.isArray(raw) ? raw : []).flatMap((d): Direction[] => {
      const o = (d ?? {}) as Record<string, unknown>
      return typeof o.name === 'string' && typeof o.url === 'string' && /^https:\/\//.test(o.url)
        ? [{ name: o.name, url: o.url, ...(typeof o.board === 'string' ? { board: o.board } : {}) }] : []
    }).slice(0, 12)
  } catch {
    return []
  }
}

async function boardUrl($: EngineInterface, root: string): Promise<string | null> {
  const f = `${root}/.wwjd.json`
  try {
    const url = (JSON.parse(await $.fs.read(f)) as { board?: unknown }).board
    return typeof url === 'string' && /^https:\/\//.test(url) ? url : null
  } catch {
    return null
  }
}

// A proof: what shows a decision, typed so the button says what it opens and opens it in the right place.
//   variant     one design of several on a board (an Artifact canvas): opens the board, the toast names the variant
//   artifact    an Artifact of its own: opens in the Artifact pane
//   page        a running page (a dev server): opens in the built-in browser
//   screenshot  an image: opens in the Files pane
//   file        a source file, optionally at a line: opens in the Files pane there
//   link        any other web page: the built-in browser
// The log takes these as objects ({ kind, name, url | path, board, line }) or as strings ("Name | target"), whose kind is
// read from the target. Paths resolve from the project root.
type ProofKind = 'variant' | 'artifact' | 'page' | 'screenshot' | 'file' | 'link'
type Proof = { kind: ProofKind; target: string; name?: string; board?: string; line?: number }
const KINDS: ProofKind[] = ['variant', 'artifact', 'page', 'screenshot', 'file', 'link']
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|[^/]+\.localhost|[^/]+\.test)(:\d+)?(\/|$)/
const ARTIFACT = /claude\.ai\/(code\/)?artifact\//
const IMAGE = /\.(png|jpe?g|webp|gif|avif)$/i
const abs = (path: string, root: string) => (path.startsWith('/') ? path : `${root}/${path}`)

function toProof(raw: unknown, root: string): Proof | null {
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    const target = [o.url, o.path, o.target].find((v): v is string => typeof v === 'string' && v.trim() !== '')
    if (!target) return null
    const guessed = toProof(target, root)
    const kind = KINDS.includes(o.kind as ProofKind) ? (o.kind as ProofKind) : guessed?.kind ?? 'link'
    return { kind, target: guessed?.target ?? target, ...(typeof o.name === 'string' && o.name ? { name: o.name } : {}),
      ...(typeof o.board === 'string' && o.board ? { board: o.board } : {}),
      ...(typeof o.line === 'number' ? { line: o.line } : guessed?.line ? { line: guessed.line } : {}) }
  }
  if (typeof raw !== 'string' || !raw.trim()) return null
  const named = /^(.+?)\s+\|\s+(\S+)$/.exec(raw.trim())
  const name = named?.[1]
  const t = named?.[2] ?? raw.trim()
  const withName = (x: Proof): Proof => (name ? { ...x, name } : x)
  if (/^https?:\/\//.test(t)) return withName({ kind: ARTIFACT.test(t) ? 'artifact' : LOCAL.test(t) ? 'page' : 'link', target: t })
  const m = /^(.*?):(\d+)$/.exec(t)
  const path = abs(m ? m[1] ?? t : t, root)
  return withName({ kind: IMAGE.test(path) ? 'screenshot' : 'file', target: path, ...(m ? { line: Number(m[2]) } : {}) })
}

const base = (path: string) => path.split('/').pop() ?? path
/** What the button says. `board` is the project's board link, so the board reads as "Open board". */
function proofLabel(p: Proof, board: string | null): string {
  switch (p.kind) {
    case 'variant': return p.name ?? p.board ?? 'Variant'
    case 'artifact': return p.target === board ? 'Open board' : `Open ${p.name ?? 'Artifact'}`
    case 'page': return `Try it: ${p.name ?? (p.target.replace(/^https?:\/\/[^/]+/, '') || '/')}`
    case 'screenshot': return `Screenshot: ${p.name ?? base(p.target).replace(/\.\w+$/, '')}`
    case 'file': return `File: ${p.name ?? base(p.target)}${p.line ? `:${p.line}` : ''}`
    case 'link': return `Open ${p.name ?? p.target.replace(/^https?:\/\//, '').split('/')[0]}`
  }
}
/** The address a link uses where the surface opens it itself (the terminal). */
const proofHref = (p: Proof) => (/^https?:\/\//.test(p.target) ? p.target : `file://${p.target}`)

// Opens a proof inside the desktop app through the tool the model would call (permission check included). A refusal
// or a missing tool falls through to the system opener; either way a toast says what happened, never silence.
async function openProof($: EngineInterface, p: Proof, what: string, note?: string) {
  const call: Record<string, unknown> =
    p.kind === 'variant' || p.kind === 'artifact' ? { tool: 'Artifact', action: 'open', url: p.target }
      : p.kind === 'page' || p.kind === 'link' ? { tool: 'mcp__Claude_Browser__navigate', url: p.target }
        : { tool: 'mcp__ccd_view__show_pane', pane: 'file', path: p.target, ...(p.line ? { line: p.line } : {}) }
  let why = ''
  try {
    const r = (await $.tool.call(call as never)) as { deny?: string; isError?: boolean; text?: string } | undefined
    if (r && !r.deny && !r.isError) {
      // Opening an Artifact from a plugin's call loads it without bringing the pane forward: show the pane too.
      if (p.kind === 'variant' || p.kind === 'artifact') {
        await $.tool.call({ tool: 'mcp__ccd_view__show_pane', pane: 'artifact' } as never).catch(() => undefined)
      }
      if (note) $.ui.toast(note)
      return
    }
    why = r?.deny ?? r?.text ?? 'refused'
  } catch (err) {
    why = err instanceof Error ? err.message : String(err)
  }
  for (const opener of ['open', 'xdg-open']) {
    const run = await $.process.run([opener, p.target]).catch(() => null)
    if (run && run.exitCode === 0) { $.ui.toast(`Opened ${what} outside the app${note ? ` · ${note}` : ''}`); return }
  }
  $.ui.toast(`Couldn't open ${what}${why ? `: ${why.split('\n')[0]?.slice(0, 120)}` : ''}`)
}

// Skip: the gate counts the check as done until the next edit (.wwjd/skipped.json), the card leaves at once, and Claude
// is told so it says so in the handover.
async function skipCheck($: EngineInterface, root: string, key: string, text: string) {
  if (root) {
    const file = `${root}/.wwjd/skipped.json`
    let map: Record<string, number> = {}
    try { map = JSON.parse(await $.fs.read(file)) as Record<string, number> } catch { /* first skip */ }
    map[key] = await $.clock.now()
    await $.fs.write(file, JSON.stringify(map) + '\n').catch(() => undefined)
  }
  await update($, gate, g => (g ? { ...g, checks: g.checks.map(c => (c.key === key ? { ...c, done: true } : c)) } : g))
  await sendFix($, `Skipped · ${text}`, `skip "${text}" this time; don't run it, and say in your handover that I asked you to skip it.`)
}

// A problem's fix: one message to the agent, nothing run behind the person's back.
async function sendFix($: EngineInterface, label: string, ask: string) {
  await $.session.append({ message: { type: 'user', content: [{ type: 'text', text: `From the wwjd sidebar: ${ask}` }] } })
  $.ui.toast(`Sent · ${label}`)
}

// Dismiss (the card's ✕): the decision stands. It leaves the open list; Reopen in Handled brings it back. The host's toast holds text
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
  $.ui.toast(isKept ? `Dismissed · ${entry.surface} · nothing changes` : `Reopened · ${entry.surface}`)
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
          text: { type: 'string', description: 'One line in the past tense, what you already did or assumed, in plain words a non-designer reads ("Dropped the comment count from the card", "Assumed people sign up with a work email")' },
          why: { type: 'string', description: 'One short reason in plain words, no jargon ("the card was too crowded to scan")' },
          path: { type: 'string', description: 'A file this is about, when the project being edited is not the session\'s folder; the entry goes to that project\'s log' },
          task: { type: 'string', description: 'The task this belongs to, the same words for every entry of it ("Signup flow", "Sidebar log")' },
          proof: { type: 'array', description: 'What shows it, one entry per thing to open. An object { kind, name, url or path, board, line }: kind variant (one design on a board canvas: url is the board, name the variant, board its frame), artifact (an Artifact of its own), page (a running dev-server URL), screenshot (an image path), file (a source path, with line), link (other web page). Or a string "Name | target", whose kind is read from the target. Name every entry the way the person would ("Variant A · Deck")',
            items: { anyOf: [{ type: 'string' }, { type: 'object', properties: {
              kind: { type: 'string', enum: ['variant', 'artifact', 'page', 'screenshot', 'file', 'link'] }, name: { type: 'string' },
              url: { type: 'string' }, path: { type: 'string' }, board: { type: 'string' }, line: { type: 'number' } } }] } },
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
    // Strings as given; typed objects kept to their known fields. At most 8, each short.
    const ok = (v: unknown) => typeof v === 'string' && v.trim() !== '' && v.length <= 2048
    const proof = (Array.isArray(x.proof) ? x.proof : []).flatMap((p): (string | Record<string, unknown>)[] => {
      if (ok(p)) return [(p as string).trim()]
      if (!p || typeof p !== 'object') return []
      const o = p as Record<string, unknown>
      const out: Record<string, unknown> = {}
      for (const k of ['kind', 'name', 'url', 'path', 'board']) if (ok(o[k])) out[k] = (o[k] as string).trim()
      if (typeof o.line === 'number' && o.line > 0) out.line = Math.floor(o.line)
      return out.url || out.path ? [out] : []
    }).slice(0, 8)
    const entry = {
      surface: x.surface.trim(), kind: x.kind as Entry['kind'], text: x.text.trim(),
      ...(typeof x.why === 'string' && x.why.trim() ? { why: x.why.trim() } : {}),
      ...(typeof x.task === 'string' && x.task.trim() ? { task: x.task.trim() } : {}),
      ...(proof.length ? { proof } : {}),
    }
    const now = await $.clock.now()
    const root = await artifactRoot($, typeof x.path === 'string' && x.path.trim() ? x.path.trim() : undefined)
    let first = false
    const id = await serial(async () => {
      const entries = await readLog($, root)
      first = entries.length === 0
      const id = newId(now, new Set(entries.map(y => y.id)))
      entries.push({ id, at: new Date(now).toISOString(), ...entry })
      await writeLog($, root, entries)
      return id
    })
    await update($, logRoot, () => root)
    await update($, logVersion, n => (n ?? 0) + 1)
    // The log is the sidebar's reason to exist: it opens on a project's first entry, unless the person closed it.
    if (first && (await $.store.get('isPinned')) !== false) await $.ui.open({ id: PANE, title: 'wwjd' }).catch(() => undefined)
    // An MCP tool answers with text (or content blocks); an object fails the host's output schema.
    return { result: `Logged ${id}.` }
  }).catch(() => ({ deny: 'Could not save to the decision log.' }))

  // The last file the session edited names the project being worked on (see artifactRoot).
  // One matched hook per edit tool: the module's one unmatched tool.call hook is status.tsx's.
  for (const tool of EDITS) {
    on('tool.call', { tool: tool as 'Edit' }, async ($, e, next) => {
      const result = await next(e)
      const x = e as unknown as { file_path?: unknown; notebook_path?: unknown }
      const fp = typeof x.file_path === 'string' ? x.file_path : typeof x.notebook_path === 'string' ? x.notebook_path : ''
      if (fp) {
        const cwd = await $.session.cwd()
        const at = fp.startsWith('/') ? fp : `${cwd}/${fp}`
        snap = null
        if ((await read($, lastEdited)) !== at) await update($, lastEdited, () => at) // no redraw for the same file
      }
      return result
    }).catch(($, e, next) => next(e))
  }

  on('command.run', { command: 'wwjd' }, async $ => {
    await $.store.set('isPinned', true)
    setProjectRoot(await shownRoot($).catch(() => '')) // Settings' "This project" is the project being edited
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
          {header('Settings', <Button key="to-log" plain dimColor label="‹ Back" onPress={() => update($, view, () => 'log')} />)}
          {await settingsView($, e, options)}
        </Box>
      )
    }

    const ver = await read($, logVersion)
    const Link = ui.Link
    const isHandledShown = await read($, showHandled)
    // What the pane reads from disk, cached: a click first moves the focus ring, which redraws the pane, and a slow
    // redraw replaces the button under the click (the press then needs a second click). A log write bumps the version;
    // any file edit clears it (the board link and directions are files Claude writes).
    if (!snap || snap.ver !== ver) {
      const root = await shownRoot($).catch(() => '')
      snap = { ver, root,
        board: root ? await boardUrl($, root).catch(() => null) : null,
        dirs: root ? await directions($, root).catch(() => [] as Direction[]) : [],
        all: root ? await readLog($, root).catch(() => [] as Entry[]) : [] }
    }
    const { root, board, dirs } = snap
    // What Strictness still wants after the last UI edit, from the same gate state the hooks enforce: Blocking cards.
    const g = await read($, gate)
    const due = g?.hasEdits
      ? [
          ...(g.sheet.due ? [{ key: 'sheet', text: 'Plan what the screen shows', what: 'Before building, Claude decides what each screen shows and what it leaves out, and writes it down.', fix: 'Plan it', ask: `write the grade sheet before building${g.sheet.file ? ` ${g.sheet.file}` : ''} (references/budgets.md, Grade gate).` }] : []),
          ...g.checks.filter(c => !c.done).map(c => ({ key: c.key, text: c.label.charAt(0).toUpperCase() + c.label.slice(1), what: c.what ?? '', fix: 'Run it', ask: `run this check before handover: ${c.label}. ${c.how}` })),
        ]
      : []
    const all = snap.all
    const entries = all.filter(x => !settled(x)).slice(-SHOWN)
    const handled = all.filter(settled).slice(-SHOWN).reverse()
    const open = await read($, editing)
    const where = await read($, noteScope)
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
    // Desktop: buttons that open inside the app (openProof); other surfaces: links.
    const inApp = e.surface === 'desktop'
    // One button per place: proofs that open the same thing merge ("Open board: A · Deck, C · Park times"), so no two
    // buttons look different and do the same. A variant opens its board; the toast names which board to look at.
    const proofs = (key: string, list: unknown[] | undefined) => {
      const ps = (list ?? []).map(x => toProof(x, root)).filter((x): x is Proof => x !== null)
      if (!ps.length) return null
      const groups = new Map<string, Proof[]>()
      for (const p of ps) {
        const k = `${p.kind === 'variant' ? 'artifact' : p.kind}:${p.target}:${p.line ?? ''}`
        groups.set(k, [...(groups.get(k) ?? []), p])
      }
      const items = [...groups.values()].map(g => {
        const first = g[0] as Proof
        const variants = g.filter(p => p.kind === 'variant').map(p => proofLabel(p, board))
        const label = variants.length ? `${first.target === board ? 'Open board' : 'Open'}: ${variants.join(', ')}` : proofLabel(first, board)
        const note = variants.length ? `Opened the board · look for ${variants.join(', ')}` : undefined
        return { p: first, label, note }
      })
      return (
        <Box key={`proof:${key}`} flexDirection="row" flexWrap="wrap" gap="sm">
          {items.map((it, i) => inApp
            ? <Button key={`proof:${key}:${i}`} plain label={it.label} onPress={() => { void openProof($, it.p, it.label, it.note) }} />
            : <Text key={`proof:${key}:${i}`}><Link href={proofHref(it.p)} label={it.label} /></Text>)}
        </Box>
      )
    }
    const mark = (kind: Entry['kind'] | 'blocking') => kind === 'blocking'
      ? <Text color="error" bold>✕</Text>
      : kind === 'assumption' ? <Text color="suggestion" bold>?</Text> : <Text dimColor bold>·</Text>
    // The mark sits on the first line at the top left; everything else, the actions included, hangs on the text's edge.
    const lead = (key: string, kind: Entry['kind'] | 'blocking', text: string, lines: (string | undefined)[], below: (JSX.Element | null)[], corner?: JSX.Element) => (
      <Box key={`lead:${key}`} flexDirection="row" gap={1} alignItems="flex-start">
        {mark(kind)}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} gap="xs">
          <Box flexDirection="column">
            <Text wrap="wrap">{text}</Text>
            {lines.filter(Boolean).map((l, i) => <Text key={`line:${key}:${i}`} wrap="wrap" dimColor>{l}</Text>)}
          </Box>
          {below}
        </Box>
        {corner ?? null}
      </Box>
    )

    const blockingCard = (d: (typeof due)[number]) =>
      card(ui, `due-card:${d.key}`, lead(d.key, 'blocking', d.text, [d.what], [
        actions(d.key, [
          action(`fix:${d.key}`, d.fix, () => sendFix($, `${d.fix} · ${d.text}`, d.ask), 'primary'),
          ...(d.key === 'sheet' ? [] : [action(`skip:${d.key}`, 'Skip', () => skipCheck($, root, d.key, d.text))]),
        ]),
      ]), 'error')

    const decisionCard = (x: Entry) => {
      const guess = x.kind === 'assumption'
      const status = guess ? 'Claude guessed this. Check that it is right.' : 'Claude chose this without asking you.'
      const why = x.why ? `Why: ${x.why}` : undefined
      if (open === x.id) {
        return card(ui, `card:${x.id}`, lead(x.id, x.kind, x.text, [why], [
          <Text key={`ask:${x.id}`} wrap="wrap">What should it be instead? Claude redoes it in the current work.</Text>,
          Input ? (
            <Input key={`note:${x.id}`} placeholder="For example: keep the comment count, but smaller" autoFocus
              onInput={v => { draftText = v }} onSubmit={v => { draftText = v; void correct($, x.id) }} />
          ) : null,
          <Box key={`scope:${x.id}`} flexDirection="row" flexWrap="wrap" gap="xs" alignItems="center">
            <Text dimColor>Remember it</Text>
            {(['once', 'project', 'person'] as const).map(sc => (
              <Button key={`scope:${x.id}:${sc}`} label={sc === 'once' ? 'Just this time' : sc === 'project' ? 'This project' : 'Every project'}
                variant={where === sc ? 'primary' : undefined} dimColor={where !== sc} onPress={() => update($, noteScope, () => sc)} />
            ))}
          </Box>,
          actions(x.id, [
            action(`save:${x.id}`, 'Send to Claude', () => correct($, x.id), 'primary'),
            action(`cancel:${x.id}`, 'Cancel', () => update($, editing, () => ''), 'dim'),
          ]),
        ]))
      }
      // Already done: nothing to approve. The ✕ in the corner dismisses it as fine; Edit or Correct changes it.
      const dismiss = <Button key={`dismiss:${x.id}`} label="Dismiss, it's fine" plain dimColor onPress={() => { void setKept($, x.id, true) }}>✕</Button>
      return card(ui, `card:${x.id}`, lead(x.id, x.kind, x.text, [status, why], [
        proofs(x.id, x.proof),
        actions(x.id, [
          ...(Input ? [action(`change:${x.id}`, guess ? 'Correct…' : 'Edit…', () => { draftText = ''; return update($, noteScope, () => 'once').then(() => update($, editing, () => x.id)) })] : []),
        ]),
      ], dismiss))
    }

    const handledRow = (x: Entry) => (
      <Box key={`handled:${x.id}`} flexDirection="row" gap={1} alignItems="flex-start">
        {mark(x.kind)}
        <Box flexDirection="column" flexGrow={1} flexShrink={1}>
          <Text wrap="wrap" dimColor><Text dimColor>{x.task ?? x.surface} · </Text>{x.text}</Text>
          {x.correction
            ? <Text wrap="wrap">Changed → {x.correction.note} <Text dimColor>· {x.correction.scope === 'once' ? 'just this time' : x.correction.scope === 'person' ? 'every project' : 'this project'}</Text></Text>
            : <Text dimColor>Dismissed</Text>}
        </Box>
        {x.kept ? <Button key={`reopen:${x.id}`} plain dimColor label="Reopen" onPress={() => setKept($, x.id, false)} /> : null}
      </Box>
    )

    return (
      <Box flexDirection="column" padding="md" gap="md">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box flexGrow={1}><Text bold>wwjd</Text></Box>
          {board ? (inApp
            ? <Button key="board" plain label="Open board" onPress={() => { void openProof($, { kind: 'artifact', target: board }, 'the board') }} />
            : <Text><Link href={board} label="Open board" /></Text>) : null}
          <Button key="to-settings" plain dimColor label="Settings" onPress={() => { setProjectRoot(root); void loadProjectDials($).then(() => update($, view, () => 'settings')) }} />
        </Box>
        {dirs.length ? (
          <Box key="directions" flexDirection="column" gap="xs">
            <Text bold>Directions <Text dimColor>{String(dirs.length)}</Text></Text>
            {[...dirs.reduce((m, d) => m.set(d.url, [...(m.get(d.url) ?? []), d]), new Map<string, Direction[]>()).entries()].map(([url, ds], i) => {
              const names = ds.map(d => d.name).join(', ')
              const label = ds.length > 1 ? 'Open canvas' : ds[0]?.name ?? 'Open'
              const onCanvas = ds.length === 1 && Boolean(ds[0]?.board)
              const press = () => { void openProof($, { kind: onCanvas ? 'variant' : 'artifact', target: url, name: label }, label, onCanvas ? `Opened the canvas · look for ${names}` : undefined) }
              return (
                <Box key={`dir:${i}`} flexDirection="row" flexWrap="wrap" gap="sm" alignItems="center">
                  {ds.length > 1 ? <Text wrap="wrap" dimColor>{names}</Text> : null}
                  {inApp ? <Button key={`dir:${i}:open`} plain label={label} onPress={press} /> : <Text><Link href={url} label={label} /></Text>}
                </Box>
              )
            })}
          </Box>
        ) : null}
        {due.length ? (
          <Box key="needs" flexDirection="column" gap="sm">
            <Box flexDirection="column">
              <Text bold color="error">Not done yet <Text dimColor>{String(due.length)}</Text></Text>
              <Text wrap="wrap" dimColor>Claude does these before it says the work is finished. Run one now, or skip it.</Text>
            </Box>
            {due.map(blockingCard)}
          </Box>
        ) : null}
        {groups.length ? (
          <Box key="decided" flexDirection="column">
            <Text bold>Claude decided <Text dimColor>{String(entries.length)}</Text></Text>
            <Text wrap="wrap" dimColor>Already in the work. Dismiss what's fine with ✕, or edit it and Claude changes it.</Text>
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
