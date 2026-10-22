// The wwjd sidebar (/wwjd), drawn as Claude's own sidebar is: quiet rounded cards that fold, rows of an icon and a short
// title: Johannes stepped in (saves: a wwjd rule changed what Claude was about to do), Claude decided (choices and guesses
// already in the work; a row opens to why, proof, Edit and Dismiss), Directions, Handled, and Project (canvas, Settings). The checks the
// Strictness gate asks Claude for never show here: they are between the gate and Claude.
// Icons are Svg on the desktop (icons.ts), text marks on the terminal. Proof opens inside the desktop app where it can.
// The agent logs through the `log` tool registered here (mcp__wwjd__log); entries live in .wwjd/decisions.jsonl at the
// root of the project being edited (artifactRoot below).
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Entry, NoteScope, Scope } from '../types'
import { PANE, exportDials, loadProjectDials, setProjectRoot, settingsView } from './dials'
import { TONE, iconSource } from './icons'
import type { IconName } from './icons'
import { drawn, onFocus, onPress, tracked } from './press'
import { gateMayHaveChanged } from './status'

const view = atom({ plugin: 'wwjd', key: 'view' } as const, 'log')
const editing = atom({ plugin: 'wwjd', key: 'editing' } as const, '')
// The correction being typed: kept out of state, so a keystroke never redraws the pane (a redraw mid-typing drops keys).
let draftText = ''
const noteScope = atom({ plugin: 'wwjd', key: 'noteScope' } as const, 'once')
const logVersion = atom({ plugin: 'wwjd', key: 'logVersion' } as const, 0)
const foldsAtom = atom({ plugin: 'wwjd', key: 'folds' } as const, {})
const openRow = atom({ plugin: 'wwjd', key: 'openRow' } as const, '')
// Card borders on the desktop: a quiet line that holds on light and dark panes.
const LINE = 'rgba(127, 127, 127, 0.28)'
const showSaves = atom({ plugin: 'wwjd', key: 'showSaves' } as const, false)

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

// paths.mjs strayRoot(): a .wwjd/ in the home folder or above it, in a temp root, or in a folder directly in a shared
// temp root (/tmp/<user>) belongs to no project.
const TMP = /^(\/private)?\/(tmp|var\/tmp)(\/[^/]+)?$|^(\/private)?\/var\/folders\/[^/]+\/[^/]+\/T$/
const stray = (dir: string, home: string | undefined) =>
  dir === home || (home ?? '').startsWith(`${dir}/`) || dir === '' || TMP.test(dir)

async function rootOf($: EngineInterface, start: string): Promise<string | null> {
  const home = await $.env.get('HOME')
  let git: string | null = null
  for (let dir = start; dir; ) {
    if ((await $.fs.exists(`${dir}/.wwjd.json`)) || (!stray(dir, home) && (await $.fs.exists(`${dir}/.wwjd`)))) return dir
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
    if ((await $.fs.exists(`${dir}/.wwjd.json`)) || (!stray(dir, home) && (await $.fs.exists(`${dir}/.wwjd`)))) return dir
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
let snap: { ver: number; root: string; canvas: string | null; dirs: Direction[]; all: Entry[] } | null = null

// [] only when there is no log yet. Any other failure (over 4 MiB, no permission, I/O) throws: a writer that took it
// for an empty log would write back only its own entry and wipe the rest.
async function readLog($: EngineInterface, root: string): Promise<Entry[]> {
  if (!(await $.fs.exists(logFile(root)))) return []
  return (await $.fs.read(logFile(root))).split('\n').filter(Boolean).flatMap(line => {
    try { return [JSON.parse(line) as Entry] } catch { return [] }
  })
}
const UNREADABLE = 'Could not read the decision log; nothing was written.'
// The log as a writer needs it: null when it can't be read, so the writer stops.
const readForWrite = ($: EngineInterface, root: string) => readLog($, root).catch(() => null)
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
  let isUnread = false
  const entry = await serial(async () => {
    const entries = await readForWrite($, root)
    if (!entries) { isUnread = true; return null }
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
  if (isUnread) { $.ui.toast(UNREADABLE); return }
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
// A row's label: the entry's title, else its text up to the first clause break, at most seven words (older entries).
const titleOf = (x: Entry) => x.title || (x.text.split(/[,;:(]|\s[—–]\s/)[0] ?? x.text).trim().split(/\s+/).slice(0, 7).join(' ')

// The project canvas artifact, when .wwjd.json names one ("canvas"): the same link every session.
// The directions explored, from .wwjd/directions.json (written when directions are explored; local, never committed):
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

async function canvasUrl($: EngineInterface, root: string): Promise<string | null> {
  const f = `${root}/.wwjd.json`
  try {
    const url = (JSON.parse(await $.fs.read(f)) as { canvas?: unknown }).canvas
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
/** What the button says. `canvas` is the project canvas link, so the canvas reads as "Open canvas". */
function proofLabel(p: Proof, canvas: string | null): string {
  switch (p.kind) {
    case 'variant': return p.name ?? p.board ?? 'Variant'
    case 'artifact': return p.target === canvas ? 'Open canvas' : `Open ${p.name ?? 'Artifact'}`
    case 'page': return `Try it: ${p.name ?? (p.target.replace(/^https?:\/\/[^/]+/, '') || '/')}`
    case 'screenshot': return `Screenshot: ${p.name ?? base(p.target).replace(/\.\w+$/, '')}`
    case 'file': return `File: ${p.name ?? base(p.target)}${p.line ? `:${p.line}` : ''}`
    case 'link': return `Open ${p.name ?? p.target.replace(/^https?:\/\//, '').split('/')[0]}`
  }
}
/** The address a link uses where the surface opens it itself (the terminal). */
const proofHref = (p: Proof) => (/^https?:\/\//.test(p.target) ? p.target : `file://${p.target}`)

// What the system opener may hand a local file to: images and text, never something that runs.
const VIEWABLE = /\.(png|jpe?g|gif|webp|svg|pdf|txt|md|json|html|css|js|ts|tsx)$/i

// Opens a proof inside the desktop app through the tool the model would call (permission check included). A refusal
// or a missing tool falls through to the system opener: a web address opens; a local file is shown in Finder on macOS,
// elsewhere opened only when it is an image or text (an opener runs a script or an app). Either way a toast says what
// happened, never silence.
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
  const isWeb = /^https?:\/\//.test(p.target)
  const isMac = !isWeb && (await $.process.run(['uname', '-s']).catch(() => null))?.stdout.trim() === 'Darwin'
  const tries: string[][] = isWeb ? [['open', p.target], ['xdg-open', p.target]]
    : isMac ? [['open', '-R', p.target]]
      : VIEWABLE.test(p.target) ? [['xdg-open', p.target]] : []
  for (const argv of tries) {
    const run = await $.process.run(argv).catch(() => null)
    if (run && run.exitCode === 0) {
      $.ui.toast(`${isMac ? `Showed ${what} in Finder` : `Opened ${what} outside the app`}${note ? ` · ${note}` : ''}`)
      return
    }
  }
  if (!tries.length) why = `${why ? `${why}; ` : ''}only images and text files open outside the app`
  $.ui.toast(`Couldn't open ${what}${why ? `: ${why.split('\n')[0]?.slice(0, 120)}` : ''}`)
}


// Dismiss: the decision stands. It leaves the open list; Reopen in Handled brings it back. The host's toast holds text
// only, so the way back lives in Handled rather than an Undo in the toast.
async function setKept($: EngineInterface, id: string, isKept: boolean) {
  const day = await today($)
  const root = await shownRoot($)
  let isUnread = false
  const entry = await serial(async () => {
    const entries = await readForWrite($, root)
    if (!entries) { isUnread = true; return null }
    const entry = entries.find(x => x.id === id)
    if (!entry || entry.correction || Boolean(entry.kept) === isKept) return null
    if (isKept) entry.kept = { at: day }
    else delete entry.kept
    await writeLog($, root, entries)
    return entry
  })
  if (isUnread) { $.ui.toast(UNREADABLE); return }
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
        required: ['surface', 'kind', 'title', 'text'],
        properties: {
          surface: { type: 'string', description: 'The component, screen or layout it is about, in product words ("Task card", "Settings page")' },
          kind: { type: 'string', enum: ['assumption', 'choice', 'save'], description: 'assumption: a guess about product, data or intent; choice: a design call nobody asked for; save: a wwjd rule changed what you were about to do (text: only what it kept you from, a short phrase as "putting the price in a tooltip"; what you did instead goes in why; rule: its name)' },
          title: { type: 'string', description: 'Two to six words, what you need to know at a glance; the sidebar row ("Decisions open on press", "Prices visible, no tooltips", "Work email assumed")' },
          text: { type: 'string', description: 'One line in the past tense, what you already did or assumed, in plain words a non-designer reads ("Dropped the comment count from the card", "Assumed people sign up with a work email")' },
          why: { type: 'string', description: 'One short reason in plain words, no jargon ("the card was too crowded to scan")' },
          rule: { type: 'string', description: 'save only: the wwjd rule that stepped in, by its name ("Floor: tooltips", "One primary action")' },
          path: { type: 'string', description: 'A file this is about, when the project being edited is not the session\'s folder; the entry goes to that project\'s log' },
          task: { type: 'string', description: 'The task this belongs to, the same words for every entry of it ("Signup flow", "Sidebar log")' },
          screen: { type: 'string', description: 'The screen this is about, by its id in wwjd.flow.json ("checkout"), when the project keeps one' },
          aspect: { type: 'string', enum: ['ux', 'ui'], description: 'ux: the reason is about how it works (flow, structure, copy); ui: about how it looks' },
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

  // One-click buttons on the desktop (press.ts).
  on('ui.focus', { component: 'Pane', requestId: PANE }, onFocus)
  on('ui.press', { plugin: 'wwjd', component: 'Pane', requestId: PANE }, onPress)

  on('ui.close', { id: PANE }, async ($, e, next) => {
    if (e.origin.kind === 'person') await $.store.set('isPinned', false)
    return next(e)
  })

  on('tool.call', { tool: TOOL }, async ($, e) => {
    const x = e as unknown as { surface?: unknown; kind?: unknown; title?: unknown; text?: unknown; why?: unknown; rule?: unknown; path?: unknown; task?: unknown; screen?: unknown; aspect?: unknown; proof?: unknown }
    if (typeof x.surface !== 'string' || typeof x.text !== 'string' || (x.kind !== 'assumption' && x.kind !== 'choice' && x.kind !== 'save')) {
      return { deny: 'Needs surface, kind (assumption, choice or save) and text.' }
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
    // A save reads "Johannes kept Claude from <text>": the text is what was avoided, without that lead-in, and only
    // that; what was done instead (after a ";" or a dash) becomes its why.
    const [said, ...instead] = x.kind === 'save' ? x.text.trim().replace(/^(johannes |wwjd )?(kept|stopped) claude from\s+/i, '').split(/;\s+|\s[—–]\s/) : [x.text.trim()]
    const text = x.kind === 'save' ? (said ?? '').replace(/^[A-Z](?=[a-z])/, c => c.toLowerCase()) : x.text.trim()
    const why = typeof x.why === 'string' && x.why.trim() ? x.why.trim() : instead.join('; ').replace(/^./, c => c.toUpperCase())
    const entry = {
      surface: x.surface.trim(), kind: x.kind as Entry['kind'], text,
      ...(typeof x.title === 'string' && x.title.trim() ? { title: x.title.trim().slice(0, 60) } : {}),
      ...(why ? { why } : {}),
      ...(x.kind === 'save' && typeof x.rule === 'string' && x.rule.trim() ? { rule: x.rule.trim() } : {}),
      ...(typeof x.task === 'string' && x.task.trim() ? { task: x.task.trim() } : {}),
      ...(typeof x.screen === 'string' && x.screen.trim() ? { screen: x.screen.trim().slice(0, 80) } : {}),
      ...(x.aspect === 'ux' || x.aspect === 'ui' ? { aspect: x.aspect as Entry['aspect'] } : {}),
      ...(proof.length ? { proof } : {}),
    }
    const now = await $.clock.now()
    const root = await artifactRoot($, typeof x.path === 'string' && x.path.trim() ? x.path.trim() : undefined)
    let first = false
    // Read right before the write, inside the queue: entries another session added since are kept.
    const id = await serial(async () => {
      const entries = await readForWrite($, root)
      if (!entries) return null
      first = entries.length === 0
      const id = newId(now, new Set(entries.map(y => y.id)))
      entries.push({ id, at: new Date(now).toISOString(), ...entry })
      await writeLog($, root, entries)
      return id
    })
    if (id === null) return { deny: UNREADABLE }
    await update($, logRoot, () => root)
    await update($, logVersion, n => (n ?? 0) + 1)
    await gateMayHaveChanged($, options)
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
    const ui = tracked($.ui.resolve(e))
    const { Box, Text, Button } = ui
    drawn(e.surface, e.props.isFocused)
    const shown = await read($, view)
    const header = (title: string, action: JSX.Element) => (
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="heading" weight="semibold">{title}</Text>
        {action}
      </Box>
    )

    if (shown === 'settings') {
      return (
        <Box flexDirection="column" padding="lg" gap="lg">
          {header('Settings', <Button key="to-log" plain dimColor label="‹ Back" onPress={() => update($, view, () => 'log')} />)}
          {await settingsView($, e, options)}
        </Box>
      )
    }

    const ver = await read($, logVersion)
    const Link = ui.Link
    // What the pane reads from disk, cached, so the redraws a click causes (press.ts) stay quick. A log write bumps the
    // version; any file edit clears it (the canvas link and directions are files Claude writes).
    if (!snap || snap.ver !== ver) {
      const root = await shownRoot($).catch(() => '')
      snap = { ver, root,
        canvas: root ? await canvasUrl($, root).catch(() => null) : null,
        dirs: root ? await directions($, root).catch(() => [] as Direction[]) : [],
        all: root ? await readLog($, root).catch(() => [] as Entry[]) : [] }
    }
    const { root, canvas, dirs } = snap
    const all = snap.all
    const entries = all.filter(x => x.kind !== 'save' && !settled(x)).slice(-SHOWN)
    const handled = all.filter(x => x.kind !== 'save' && settled(x)).slice(-SHOWN).reverse()
    // Saves, newest first: the times a wwjd rule changed what Claude was about to do. Flavor, no actions.
    const saves = all.filter(x => x.kind === 'save').reverse()
    const isAllSaves = await read($, showSaves)
    const open = await read($, editing)
    const where = await read($, noteScope)
    const Input = 'Input' in ui ? ui.Input : null
    // Icons where the surface draws Svg (icons.ts); the terminal keeps text marks.
    const Svg = 'Svg' in ui ? ui.Svg : null
    // Each icon in a box that never shrinks: an Svg beside a native button otherwise collapses to nothing.
    const icon = (name: IconName, alt: string, color?: string) => (Svg ? <Box flexShrink={0}><Svg source={iconSource(name, color)} alt={alt} width={14} height={14} /></Box> : null)
    const inApp = e.surface === 'desktop'
    const folds = (await read($, foldsAtom)) as Record<string, boolean>
    const row1 = await read($, openRow)

    // The pane is cards, as Claude's own sidebar draws them: a quiet rounded border, a title with a chevron that folds
    // it, a dim count on the right, then rows of an icon and a line. Colour only for what needs you (Not done yet).
    // Every card folds: a dim chevron right after the title, as Claude's sidebar draws it.
    const panel = (key: string, title: string, meta: string, body: (JSX.Element | null)[], opts: { isOpen?: boolean } = {}) => {
      const isOpen = folds[key] ?? opts.isOpen ?? true
      return (
        <Box key={`panel:${key}`} flexDirection="column" gap="md" borderStyle="round" borderColor={inApp ? LINE : 'subtle'} paddingX="md" paddingTop="md" paddingBottom="lg">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
            <Box flexDirection="row" alignItems="center" gap="xs" flexShrink={1}>
              <Box flexShrink={1}>
                <Button key={`fold:${key}`} plain label={Svg ? title : `${title} ${isOpen ? '▾' : '▸'}`} onPress={() => update($, foldsAtom, f => ({ ...(f as Record<string, boolean>), [key]: !isOpen }))} />
              </Box>
              {icon(isOpen ? 'down' : 'right', isOpen ? 'Fold' : 'Open', TONE.dim)}
            </Box>
            {meta ? <Text size="footnote" dimColor tabular>{meta}</Text> : null}
          </Box>
          {isOpen ? body : null}
        </Box>
      )
    }
    // One row: icon, then the line and whatever hangs under it on the line's edge.
    const row = (key: string, mark: JSX.Element | null, content: (JSX.Element | null)[]) => (
      <Box key={`item:${key}`} flexDirection="row" gap="sm" alignItems="flex-start">
        {mark}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} gap="xs">{content}</Box>
      </Box>
    )
    const note = (key: string, text: string) => <Text key={key} size="footnote" wrap="wrap" dimColor>{text}</Text>
    const action = (key: string, label: string, onPress: () => unknown, kind: 'primary' | 'plain' | 'dim' = 'plain') =>
      <Button key={key} label={label} variant={kind === 'primary' ? 'primary' : undefined} dimColor={kind === 'dim'} onPress={() => { void onPress() }} />
    const actions = (key: string, list: (JSX.Element | null)[]) =>
      <Box key={`actions:${key}`} flexDirection="row" flexWrap="wrap" gap="xs" alignItems="center">{list}</Box>
    // A line that opens what it is about: in the app on the desktop (openProof), a link elsewhere.
    const opener = (key: string, label: string, p: Proof | null, toast?: string) => !p
      ? <Text key={key} wrap="wrap">{label}</Text>
      : inApp
        ? <Button key={key} plain label={label} onPress={() => { void openProof($, p, label, toast) }} />
        : <Text key={key} wrap="wrap"><Link href={proofHref(p)} label={label} /></Text>
    // One button per place: proofs that open the same thing merge ("Open canvas: A · Deck, C · Park times").
    const proofs = (key: string, list: unknown[] | undefined) => {
      const ps = (list ?? []).map(x => toProof(x, root)).filter((x): x is Proof => x !== null)
      if (!ps.length) return null
      const groups = new Map<string, Proof[]>()
      for (const p of ps) {
        const k = `${p.kind === 'variant' ? 'artifact' : p.kind}:${p.target}:${p.line ?? ''}`
        groups.set(k, [...(groups.get(k) ?? []), p])
      }
      return (
        <Box key={`proof:${key}`} flexDirection="column" gap="xs">
          {[...groups.values()].map((g, i) => {
            const first = g[0] as Proof
            const variants = g.filter(p => p.kind === 'variant').map(p => proofLabel(p, canvas))
            const label = variants.length ? `${first.target === canvas ? 'Open canvas' : 'Open'}: ${variants.join(', ')}` : proofLabel(first, canvas)
            const kind: IconName = first.kind === 'screenshot' ? 'image' : first.kind === 'page' ? 'globe' : first.kind === 'file' ? 'file' : first.kind === 'link' ? 'link' : 'layout'
            return (
              <Box key={`proof:${key}:${i}`} flexDirection="row" alignItems="center" gap="xs">
                {icon(kind, '')}
                {opener(`proof:${key}:${i}`, label, first, variants.length ? `Opened the board · look for ${variants.join(', ')}` : undefined)}
              </Box>
            )
          })}
        </Box>
      )
    }
    const mark = (kind: Entry['kind']) => Svg
      ? (kind === 'assumption' ? icon('help', 'Claude guessed') : kind === 'save' ? icon('shield', 'Johannes stepped in') : icon('dot', 'Claude chose'))
      : kind === 'assumption' ? <Text color="suggestion" bold>?</Text> : <Text dimColor bold>·</Text>

    // Johannes stepped in: the hero. Each line opens the Artifact (or file) it happened in.
    const SAVES = 4
    const saveRows = [
      ...(isAllSaves ? saves : saves.slice(0, SAVES)).map(x => {
        const p = (x.proof ?? []).map(y => toProof(y, root)).find((y): y is Proof => y !== null) ?? null
        return row(`save:${x.id}`, mark('save'), [
          <Text key={`save-text:${x.id}`} wrap="wrap">{`Kept Claude from ${x.text}`}</Text>,
          x.rule || p ? actions(`save:${x.id}`, [x.rule ? <Text key={`rule:${x.id}`} size="footnote" dimColor>{x.rule}</Text> : null, p ? opener(`save:${x.id}`, 'Open', p) : null]) : null,
        ])
      }),
      saves.length > SAVES ? <Button key="saves-all" plain dimColor label={isAllSaves ? 'Show less' : 'Show more'} onPress={() => update($, showSaves, v => !v)} /> : null,
    ]

    // A decision is one line; pressing it opens why, what shows it, and Edit or Dismiss.
    const decisionRow = (x: Entry) => {
      const guess = x.kind === 'assumption'
      const isOpen = row1 === x.id || open === x.id
      const label = titleOf(x)
      const line = <Button key={`row:${x.id}`} plain label={label} onPress={() => update($, openRow, r => (r === x.id ? '' : x.id))} />
      const whole = label !== x.text ? <Text key={`text:${x.id}`} wrap="wrap">{x.text}</Text> : null
      if (open === x.id) {
        return row(x.id, mark(x.kind), [line, whole,
          x.why ? note(`why:${x.id}`, `Why: ${x.why}`) : null,
          Input ? (
            <Input key={`note:${x.id}`} placeholder="What should it be instead?" autoFocus
              onInput={v => { draftText = v }} onSubmit={v => { draftText = v; void correct($, x.id) }} />
          ) : null,
          actions(`scope:${x.id}`, [
            <Text key={`remember:${x.id}`} size="footnote" dimColor>Remember</Text>,
            ...(['once', 'project', 'person'] as const).map(sc => (
              <Button key={`scope:${x.id}:${sc}`} label={sc === 'once' ? 'Just this time' : sc === 'project' ? 'This project' : 'Every project'}
                variant={where === sc ? 'primary' : undefined} dimColor={where !== sc} onPress={() => update($, noteScope, () => sc)} />
            )),
          ]),
          actions(x.id, [
            action(`save:${x.id}`, 'Send to Claude', () => correct($, x.id), 'primary'),
            action(`cancel:${x.id}`, 'Cancel', () => update($, editing, () => ''), 'dim'),
          ]),
        ])
      }
      return row(x.id, mark(x.kind), [line, ...(isOpen ? [
        whole,
        x.why ? note(`why:${x.id}`, `Why: ${x.why}`) : null,
        proofs(x.id, x.proof),
        actions(x.id, [
          Input ? action(`change:${x.id}`, guess ? 'Correct…' : 'Edit…', () => { draftText = ''; return update($, noteScope, () => 'once').then(() => update($, editing, () => x.id)) }) : null,
          <Button key={`dismiss:${x.id}`} plain dimColor label="Dismiss" onPress={() => { void setKept($, x.id, true) }} />,
        ]),
      ] : [])])
    }
    // Tasks (else surfaces), newest first; a task's name only when there are several.
    const groupOf = (x: Entry) => x.task ?? x.surface
    const byGroup = new Map<string, Entry[]>()
    for (const x of entries) byGroup.set(groupOf(x), [...(byGroup.get(groupOf(x)) ?? []), x])
    const groups = [...byGroup.entries()].sort((a, b) => (b[1].at(-1)?.at ?? '').localeCompare(a[1].at(-1)?.at ?? ''))
    const decided = groups.flatMap(([name, xs]) => [groups.length > 1 ? note(`group:${name}`, name) : null, ...xs.map(decisionRow)])

    const handledRows = handled.map(x => row(`handled:${x.id}`, mark(x.kind), [
      <Text key={`handled-text:${x.id}`} size="footnote" wrap="wrap" dimColor>{titleOf(x)}</Text>,
      x.correction ? note(`changed:${x.id}`, `Changed to: ${x.correction.note}`) : null,
      x.kept ? <Button key={`reopen:${x.id}`} plain dimColor label="Reopen" onPress={() => setKept($, x.id, false)} /> : null,
    ]))

    const dirRows = [...dirs.reduce((m, d) => m.set(d.url, [...(m.get(d.url) ?? []), d]), new Map<string, Direction[]>()).entries()].map(([url, ds], i) => {
      const names = ds.map(d => d.name).join(', ')
      const label = ds.length > 1 ? `Canvas: ${names}` : ds[0]?.name ?? 'Open'
      const onCanvas = ds.length === 1 && Boolean(ds[0]?.board)
      return row(`dir:${i}`, icon('layout', ''), [opener(`dir:${i}:open`, label, { kind: onCanvas ? 'variant' : 'artifact', target: url, name: label }, onCanvas ? `Opened the canvas · look for ${names}` : undefined)])
    })

    const projectRows = [
      canvas ? row('canvas', icon('layout', ''), [opener('canvas', 'Canvas', { kind: 'artifact', target: canvas })]) : null,
      row('settings', icon('gear', ''), [<Button key="to-settings" plain label="Settings" onPress={() => { setProjectRoot(root); void update($, view, () => 'settings').then(() => loadProjectDials($)) }} />]),
    ]

    return (
      <Box flexDirection="column" padding="md" gap="md">
        {saves.length ? panel('saves', 'Johannes stepped in', String(saves.length), saveRows) : null}
        {entries.length ? panel('decided', 'Claude decided', String(entries.length), decided) : null}
        {!entries.length && !saves.length ? <Box paddingX="md" paddingY="sm"><Text dimColor>{handled.length ? 'Nothing open.' : 'Nothing logged in this project yet.'}</Text></Box> : null}
        {dirs.length ? panel('directions', 'Directions', String(dirs.length), dirRows, { isOpen: false }) : null}
        {handled.length ? panel('handled', 'Handled', String(handled.length), handledRows, { isOpen: false }) : null}
        {panel('project', 'Project', root ? root.split('/').pop() ?? '' : '', projectRows)}
      </Box>
    )
  })
}
