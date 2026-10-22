import { expect, mock, test } from 'claude-code/testing'

const PANE = { component: 'Pane', requestId: 'wwjd' } as const
const props = { title: 'wwjd', isFocused: true, bodyColumns: 70, placement: 'dock' } as never

// unreadable: files that exist but whose read fails (no permission, over 4 MiB).
function disk(on: (...a: never[]) => unknown, files: Record<string, string>, unreadable: string[] = []) {
  const o = on as unknown as (ev: string, fn: (...a: never[]) => unknown) => void
  o('session.cwd', () => ({ value: '/p' }))
  o('clock.now', () => ({ value: Date.parse('2026-10-18T12:00:00Z') }))
  o('session.root', () => ({ value: '/p' }))
  o('env.get', ((_$: unknown, e: { name: string }) => ({ value: e.name === 'HOME' ? '/home/j' : undefined })) as never)
  o('fs.exists', ((_$: unknown, e: { path: string }) => ({ value: e.path in files })) as never)
  o('fs.read', ((_$: unknown, e: { path: string }) => {
    const t = files[e.path]
    if (unreadable.includes(e.path)) throw new Error('EACCES: permission denied')
    if (t === undefined) throw new Error('missing')
    return { value: t }
  }) as never)
  o('fs.write', ((_$: unknown, e: { path: string; text: string }) => { files[e.path] = e.text; return { value: undefined } }) as never)
}

const ids = (files: Record<string, string>) =>
  (files['/p/.wwjd/decisions.jsonl'] ?? '').trim().split('\n').map(l => (JSON.parse(l) as { id: string }).id)

test('the agent logs through the tool; the sidebar groups entries by surface', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = {}
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  const first = await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Task card', kind: 'choice', text: 'Dropped the comment count', why: 'over the card budget' } as never)
  // The host validates an MCP tool's result as text or content blocks; an object fails every call.
  expect(typeof (first as { result?: unknown }).result).toBe('string')
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Task card', kind: 'assumption', text: 'A work tool, so compact spacing' } as never)
  expect(files['/p/.wwjd/decisions.jsonl']?.trim().split('\n')).toHaveLength(2)
  const refused = await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Card', kind: 'maybe', text: 'x' } as never)
  expect((refused as { deny?: string }).deny).toMatch(/kind/)

  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  // A decision is one line; pressing it opens why, proof and the actions
  const [d1] = ids(files)
  expect(await ui.find({ type: 'Button', text: 'Dropped the comment count' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Why: over the card budget' })).toBeUndefined()
  await ui.press({ key: `row:${d1}` })
  expect(await ui.find({ type: 'Text', text: 'Why: over the card budget' })).toBeDefined()
  // The desktop draws the marks as icons; the terminal keeps text marks
  expect((await ui.findAll({ type: 'Svg' })).length).toBeGreaterThan(0)
  const term = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  expect(await term.find({ type: 'Svg' })).toBeUndefined()
  expect(await term.find({ type: 'Button', text: 'Dropped the comment count' })).toBeDefined()
})

test('a correction goes to the project decision log or your taste file, and back to the agent', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = { '/p/DESIGN.md': '# Design\n\nCalm.\n' }
  const appended: string[] = []
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('session.append', ((_$: unknown, e: { message: { content: { text: string }[] } }, next: (x: unknown) => unknown) => {
    appended.push(e.message.content[0]?.text ?? '')
    return next(e)
  }) as never)
  on('ui.toast', () => ({ value: undefined }) as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Task card', kind: 'choice', text: 'Dropped the comment count' } as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Board', kind: 'assumption', text: 'Columns by status' } as never)
  const [d1, d2] = ids(files)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })

  await ui.press({ key: `row:${d1}` })
  await ui.press({ key: `change:${d1}` })
  await ui.press({ key: `scope:${d1}:project` })
  await ui.input({ key: `note:${d1}`, text: 'Keep comments as a quiet count', kind: 'change' })
  await ui.press({ key: `save:${d1}` })
  expect(files['/p/DESIGN.md']).toMatch(/## Decisions\n- \d{4}-\d\d-\d\d · Task card: Keep comments as a quiet count \(was: Dropped the comment count\)/)
  expect(appended.at(-1)).toMatch(/Keep comments as a quiet count/)

  await ui.press({ key: `row:${d2}` })
  await ui.press({ key: `change:${d2}` })
  await ui.press({ key: `scope:${d2}:person` })
  await ui.input({ key: `note:${d2}`, text: 'Columns by owner', kind: 'submit' })
  expect(files['/home/j/.config/wwjd/taste.md']).toMatch(/^# Taste[\s\S]*Board: Columns by owner/)
  expect(JSON.parse(files['/p/.wwjd/decisions.jsonl']?.trim().split('\n')[1] ?? '{}').correction.scope).toBe('person')
})

test('dismiss and change settle an entry: it leaves the open list for Handled with a toast; a kept one reopens', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = { '/p/DESIGN.md': '# Design\n' }
  const toasts: string[] = []
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('session.append', ((_$: unknown, e: unknown, next: (x: unknown) => unknown) => next(e)) as never)
  on('ui.toast', ((_$: unknown, e: { text: string }) => { toasts.push(e.text); return { value: undefined } }) as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Task card', kind: 'choice', text: 'Dropped the comment count' } as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Board', kind: 'assumption', text: 'Columns by status' } as never)
  const [d1, d2] = ids(files)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })

  await ui.press({ key: `row:${d1}` })
  await ui.press({ key: `dismiss:${d1}` })
  expect(toasts.at(-1)).toBe('Dismissed · Task card · nothing changes')
  expect(await ui.find({ key: `row:${d1}` })).toBeUndefined()
  await ui.press({ key: `row:${d2}` })
  await ui.press({ key: `change:${d2}` })
  await ui.input({ key: `note:${d2}`, text: 'Columns by owner', kind: 'submit' })
  expect(toasts.at(-1)).toBe('Sent to Claude · Board · just this time')
  expect(files['/p/DESIGN.md']).toBe('# Design\n')
  expect(JSON.parse(files['/p/.wwjd/decisions.jsonl']?.trim().split('\n')[1] ?? '{}').correction.scope).toBe('once')
  expect(await ui.find({ type: 'Text', text: 'Nothing open.' })).toBeDefined()

  await ui.press({ key: 'fold:handled' })
  await ui.press({ key: `reopen:${d1}` })
  expect(toasts.at(-1)).toBe('Reopened · Task card')
  expect(await ui.find({ key: `row:${d1}` })).toBeDefined()
  expect(await ui.find({ key: `reopen:${d2}` })).toBeUndefined()
})

test('parallel log calls each keep their entry under its own id', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = {}
  disk(on as never, files)
  await Promise.all(['One', 'Two', 'Three', 'Four'].map(text =>
    $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Board', kind: 'choice', text } as never)))
  const logged = ids(files)
  expect(logged).toHaveLength(4)
  expect(new Set(logged).size).toBe(4)
})

test('the log lands in the project being edited, not the session folder; the sidebar reads it there', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = { '/q/.git': 'gitdir: /p/.git/worktrees/q\n', '/r/.wwjd.json': '{}' }
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('tool.call', { tool: 'Edit' }, () => ({ result: 'edited' }) as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Board', kind: 'choice', text: 'In the session folder' } as never)
  expect(files['/p/.wwjd/decisions.jsonl']).toMatch(/In the session folder/)

  await $.tool.call({ tool: 'Edit', file_path: '/q/src/Board.tsx', old_string: 'a', new_string: 'b' } as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Board', kind: 'choice', text: 'Columns by owner' } as never)
  expect(files['/q/.wwjd/decisions.jsonl']).toMatch(/Columns by owner/)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Card', kind: 'choice', text: 'Named by path', path: '/r/src/Card.tsx' } as never)
  expect(files['/r/.wwjd/decisions.jsonl']).toMatch(/Named by path/)
  expect(files['/p/.wwjd/decisions.jsonl']).not.toMatch(/Columns by owner|Named by path/)

  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  expect(await ui.find({ type: 'Button', text: 'Named by path' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'In the session folder' })).toBeUndefined()
})

test('typed proofs: each kind says what it opens and opens in its place; variants on the canvas merge; a refusal says so; screen and aspect are kept', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = { '/p/.wwjd.json': JSON.stringify({ canvas: 'https://claude.ai/artifact/abc' }) }
  const opened: unknown[] = []
  const toasts: string[] = []
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('ui.toast', ((_$: unknown, e: { text: string }) => { toasts.push(e.text); return { value: undefined } }) as never)
  on('tool.call', { tool: 'Artifact' }, ((_$: unknown, e: { url: string }) => { opened.push(['Artifact', e.url]); return { result: {} } }) as never)
  on('tool.call', { tool: 'mcp__ccd_view__show_pane' }, ((_$: unknown, e: { pane: string; path: string; line?: number }) => { opened.push(e.pane === 'artifact' ? ['pane', 'artifact'] : ['file', e.path, e.line]); return { result: {} } }) as never)
  on('tool.call', { tool: 'mcp__Claude_Browser__navigate' }, (() => ({ deny: 'not allowed here' })) as never)
  on('process.run', () => ({ value: { exitCode: 1, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }) as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', task: 'Signup flow', surface: 'Email step', kind: 'assumption', text: 'Assumed a work email', screen: 'signup-email', aspect: 'ux',
    proof: [
      { kind: 'variant', name: 'A · Deck', url: 'https://claude.ai/artifact/abc', board: 'Main.dc.html' },
      { kind: 'variant', name: 'C · Park times', url: 'https://claude.ai/artifact/abc' },
      { kind: 'artifact', name: 'Copy deck', url: 'https://claude.ai/artifact/xyz' },
      { kind: 'page', url: 'http://localhost:5173/signup?step=email' },
      '.wwjd/shots/signup-390-light.png',
      'src/Signup.tsx:42',
    ] } as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', task: 'Signup flow', surface: 'Password step', kind: 'choice', text: 'Showed the rules before typing', aspect: 'vibes' } as never)
  const [logged, other] = (files['/p/.wwjd/decisions.jsonl'] ?? '').split('\n').filter(Boolean).map(l => JSON.parse(l) as { screen?: string; aspect?: string })
  expect([logged?.screen, logged?.aspect]).toEqual(['signup-email', 'ux'])
  expect(other?.aspect).toBeUndefined()
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  const [id] = ids(files)
  await ui.press({ key: `row:${id}` })
  expect(await ui.find({ type: 'Button', text: 'Open canvas: A · Deck, C · Park times' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Open Copy deck' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Try it: /signup?step=email' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Screenshot: signup-390-light' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'File: Signup.tsx:42' })).toBeDefined()
  await ui.press({ key: `proof:${id}:0` })
  expect(opened.slice(-2)).toEqual([['Artifact', 'https://claude.ai/artifact/abc'], ['pane', 'artifact']])
  expect(toasts.at(-1)).toBe('Opened the board · look for A · Deck, C · Park times')
  await ui.press({ key: `proof:${id}:4` })
  expect(opened.at(-1)).toEqual(['file', '/p/src/Signup.tsx', 42])
  await ui.press({ key: `proof:${id}:2` })
  expect(toasts.at(-1)).toBe("Couldn't open Try it: /signup?step=email: not allowed here")
  await ui.press({ key: 'canvas' })
  expect(opened.slice(-2)).toEqual([['Artifact', 'https://claude.ai/artifact/abc'], ['pane', 'artifact']])
  const term = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  expect(await term.find({ type: 'Link', text: 'Screenshot: signup-390-light' })).toBeDefined()
  expect(await term.find({ type: 'Link', text: 'Canvas' })).toBeDefined()
  // The mark sits top left on the first line, never centred against a wrapped text; actions hang under the text.
  const lead = await ui.find({ key: `item:${id}` }) as unknown as { props: { alignItems?: string } } | undefined
  expect(lead?.props.alignItems).toBe('flex-start')
  expect(await ui.find({ key: `actions:${id}` })).toBeDefined()
})

test('directions from .wwjd/directions.json: several on one canvas share one Open canvas button that opens in the app', async ($, on) => {
  mock.store(on)
  const url = 'https://claude.ai/artifact/canvas'
  const files: Record<string, string> = { '/p/.wwjd/directions.json': JSON.stringify([
    { name: 'A · Deck', url, board: 'Main.dc.html' }, { name: 'B · Nearby', url, board: 'B.dc.html' },
    { name: 'Copy deck', url: 'https://claude.ai/artifact/other' }, { name: 'Bad', url: 'javascript:alert(1)' },
  ]) }
  const opened: unknown[] = []
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('ui.toast', () => ({ value: undefined }) as never)
  on('tool.call', { tool: 'Artifact' }, ((_$: unknown, e: { url: string }) => { opened.push(e.url); return { result: {} } }) as never)
  on('tool.call', { tool: 'mcp__ccd_view__show_pane' }, (() => ({ result: {} })) as never)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  await ui.press({ key: 'fold:directions' })
  expect(await ui.find({ type: 'Button', text: 'Canvas: A · Deck, B · Nearby' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Copy deck' })).toBeDefined()
  expect(await ui.find({ key: 'dir:2:open' })).toBeUndefined() // the javascript: link is dropped, so only two places
  await ui.press({ key: 'dir:0:open' })
  expect(opened.at(-1)).toBe(url)
})

test('a save logs as "Johannes kept Claude from …": its own section, never a decision to settle', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = {}
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Price', kind: 'save', text: 'Kept Claude from putting the price in a tooltip; it sits under the name now', rule: 'Floor: tooltips' } as never)
  const saved = JSON.parse((files['/p/.wwjd/decisions.jsonl'] ?? '').trim()) as { text: string; rule: string }
  expect(saved.text).toBe('putting the price in a tooltip')
  expect((saved as { why?: string }).why).toBe('It sits under the name now')
  expect(saved.rule).toBe('Floor: tooltips')
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  // The hero card: a save with no proof is a plain line; one with proof opens it
  expect(await ui.find({ type: 'Button', text: 'Johannes stepped in' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Kept Claude from putting the price in a tooltip' })).toBeDefined()
  expect(await ui.find({ type: 'Button', text: 'Claude decided' })).toBeUndefined()
})

test('a decision log that exists but cannot be read is never overwritten: the log call says so and writes nothing', async ($, on) => {
  mock.store(on)
  const old = JSON.stringify({ id: 'd1', at: '2026-10-01T00:00:00Z', surface: 'Board', kind: 'choice', text: 'Kept' }) + '\n'
  const files: Record<string, string> = { '/p/.wwjd/decisions.jsonl': old }
  disk(on as never, files, ['/p/.wwjd/decisions.jsonl'])
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  const r = await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Card', kind: 'choice', text: 'New one' } as never)
  expect((r as { deny?: string }).deny).toBe('Could not read the decision log; nothing was written.')
  expect(files['/p/.wwjd/decisions.jsonl']).toBe(old)
})
