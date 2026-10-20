import { expect, mock, test } from 'claude-code/testing'

const PANE = { component: 'Pane', requestId: 'wwjd' } as const
const props = { title: 'wwjd', isFocused: true, bodyColumns: 70, placement: 'dock' } as never

function disk(on: (...a: never[]) => unknown, files: Record<string, string>) {
  const o = on as unknown as (ev: string, fn: (...a: never[]) => unknown) => void
  o('session.cwd', () => ({ value: '/p' }))
  o('clock.now', () => ({ value: Date.parse('2026-10-18T12:00:00Z') }))
  o('session.root', () => ({ value: '/p' }))
  o('env.get', ((_$: unknown, e: { name: string }) => ({ value: e.name === 'HOME' ? '/home/j' : undefined })) as never)
  o('fs.exists', ((_$: unknown, e: { path: string }) => ({ value: e.path in files })) as never)
  o('fs.read', ((_$: unknown, e: { path: string }) => {
    const t = files[e.path]
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
  expect(await ui.find({ type: 'Text', text: 'Task card' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Dropped the comment count' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'over the card budget' })).toBeDefined()
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

  await ui.press({ key: `change:${d1}` })
  await ui.input({ key: `note:${d1}`, text: 'Keep comments as a quiet count', kind: 'change' })
  await ui.press({ key: `save:${d1}` })
  expect(files['/p/DESIGN.md']).toMatch(/## Decisions\n- \d{4}-\d\d-\d\d · Task card: Keep comments as a quiet count \(was: Dropped the comment count\)/)
  expect(appended.at(-1)).toMatch(/Keep comments as a quiet count/)

  await ui.press({ key: `change:${d2}` })
  await ui.press({ key: `scope:${d2}:person` })
  await ui.input({ key: `note:${d2}`, text: 'Columns by owner', kind: 'submit' })
  expect(files['/home/j/.config/wwjd/taste.md']).toMatch(/^# Taste[\s\S]*Board: Columns by owner/)
  expect(JSON.parse(files['/p/.wwjd/decisions.jsonl']?.trim().split('\n')[1] ?? '{}').correction.scope).toBe('person')
})

test('keep and change settle an entry: it leaves the open list for Handled with a toast; a kept one reopens', async ($, on) => {
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

  await ui.press({ key: `keep:${d1}` })
  expect(toasts.at(-1)).toBe('Kept · Task card')
  expect(await ui.find({ key: `keep:${d1}` })).toBeUndefined()
  await ui.press({ key: `change:${d2}` })
  await ui.input({ key: `note:${d2}`, text: 'Columns by owner', kind: 'submit' })
  expect(toasts.at(-1)).toMatch(/^Changed · Board · saved to/)
  expect(await ui.find({ type: 'Text', text: 'Nothing open.' })).toBeDefined()

  await ui.press({ key: 'handled' })
  await ui.press({ key: `reopen:${d1}` })
  expect(toasts.at(-1)).toBe('Reopened · Task card')
  expect(await ui.find({ key: `keep:${d1}` })).toBeDefined()
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
  expect(await ui.find({ type: 'Text', text: 'Named by path' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'In the session folder' })).toBeUndefined()
})

test('cards group by task with a surface label inside; proof shows as links; the board link comes from .wwjd.json', async ($, on) => {
  mock.store(on)
  const files: Record<string, string> = { '/p/.wwjd.json': JSON.stringify({ board: 'https://claude.ai/artifact/abc' }) }
  disk(on as never, files)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', task: 'Signup flow', surface: 'Email step', kind: 'assumption', text: 'Work email only',
    proof: ['http://localhost:5173/signup?step=email', '.wwjd/shots/signup-390-light.png', 'src/Signup.tsx:42'] } as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', task: 'Signup flow', surface: 'Password step', kind: 'choice', text: 'Rules shown before typing' } as never)
  await $.tool.call({ tool: 'mcp__wwjd__log', surface: 'Board', kind: 'choice', text: 'Columns by status' } as never)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  expect(await ui.find({ type: 'Text', text: 'Signup flow' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Email step' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Board' })).toBeDefined()
  expect(await ui.find({ type: 'Link', label: '▶ Try /signup?step=email' })).toBeDefined()
  expect(await ui.find({ type: 'Link', label: '◩ signup-390-light', href: 'file:///p/.wwjd/shots/signup-390-light.png' })).toBeDefined()
  expect(await ui.find({ type: 'Link', label: '‹› Signup.tsx:42' })).toBeDefined()
  expect(await ui.find({ type: 'Link', label: '↗ Board', href: 'https://claude.ai/artifact/abc' })).toBeDefined()
  // The mark sits top left on the first line, never centred against a wrapped text; actions hang under the text.
  const [first] = ids(files)
  const lead = await ui.find({ key: `lead:${first}` }) as unknown as { props: { alignItems?: string } } | undefined
  expect(lead?.props.alignItems).toBe('flex-start')
  expect(await ui.find({ key: `actions:${first}` })).toBeDefined()
})
