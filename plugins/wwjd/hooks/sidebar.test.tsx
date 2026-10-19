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

  await ui.press({ key: `correct:${d1}` })
  await ui.input({ key: `note:${d1}`, text: 'Keep comments as a quiet count', kind: 'change' })
  await ui.press({ key: `save:${d1}` })
  expect(files['/p/DESIGN.md']).toMatch(/## Decisions\n- \d{4}-\d\d-\d\d · Task card: Keep comments as a quiet count \(was: Dropped the comment count\)/)
  expect(appended.at(-1)).toMatch(/Keep comments as a quiet count/)

  await ui.press({ key: `correct:${d2}` })
  await ui.press({ key: `scope:${d2}:person` })
  await ui.input({ key: `note:${d2}`, text: 'Columns by owner', kind: 'submit' })
  expect(files['/home/j/.config/wwjd/taste.md']).toMatch(/^# Taste[\s\S]*Board: Columns by owner/)
  expect(JSON.parse(files['/p/.wwjd/decisions.jsonl']?.trim().split('\n')[1] ?? '{}').correction.scope).toBe('person')
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
