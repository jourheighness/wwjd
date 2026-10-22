import { expect, mock, test } from 'claude-code/testing'

const PANE = { component: 'Pane', requestId: 'wwjd' } as const
const props = { title: 'wwjd', isFocused: false, bodyColumns: 70, placement: 'dock' } as never

// The gate refresh runs beside the tool call, not in front of its result: let it land.
const settle = () => new Promise(r => setTimeout(r, 20))

function gateJson(over: object) {
  return JSON.stringify({ strictness: 3, hasEdits: true, lastFile: '/p/card.html', sheet: { needed: true, file: null, due: true },
    checks: [{ key: 'shots', label: 'Shots at 2 widths', done: false, how: '' }], ...over })
}

test('quiet until wwjd is used; then the status line, and Blocking cards in the sidebar for what Strictness still wants', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  let out = gateJson({})
  const statuses: unknown[] = []
  on('session.cwd', () => ({ value: '/p' }))
  on('session.root', () => ({ value: '/p' }))
  on('session.id', () => ({ value: 's1' }))
  on('fs.exists', () => ({ value: false }))
  let runs = 0
  on('process.run', () => (runs++, { value: { exitCode: 0, stdout: out, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.status', (_$, e) => { statuses.push(e.text); return { value: undefined } })
  on('tool.call', () => ({ result: {} }) as never)

  const band = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  expect(await band.find({ type: 'Text', text: /Not done yet/ })).toBeUndefined()

  await $.tool.call({ tool: 'Write', file_path: '/p/card.html' } as never)
  await $.tool.call({ tool: 'Bash', command: 'ls' } as never)
  expect(runs).toBe(0)

  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  await settle()
  expect(statuses.at(-1)).toBe('wwjd · Strictness 3')
  expect(await band.find({ type: 'Text', text: 'Plan what the screen shows' })).toBeDefined()
  expect(await band.find({ type: 'Text', text: 'Shots at 2 widths' })).toBeDefined()
  expect(await band.find({ key: 'fix:shots' })).toBeDefined()

  out = gateJson({ sheet: { needed: true, file: 'card.md', due: false }, checks: [{ key: 'shots', label: 'Shots at 2 widths', done: true, how: '' }] })
  await $.tool.call({ tool: 'Bash', command: 'git status' } as never)
  await settle()
  expect(runs).toBe(1)
  await $.tool.call({ tool: 'Bash', command: 'node render.mjs shoot card.html' } as never)
  await settle()
  expect(runs).toBe(2)
  expect(await band.find({ type: 'Text', text: /Not done yet/ })).toBeUndefined()
})

test('editing existing files shows the checks, not a grade sheet', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  on('session.cwd', () => ({ value: '/p' }))
  on('session.root', () => ({ value: '/p' }))
  on('session.id', () => ({ value: 's1' }))
  on('fs.exists', () => ({ value: false }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: gateJson({ sheet: { needed: true, file: null, due: false } }), stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  const sent: string[] = []
  const toasts: string[] = []
  on('session.append', ((_$: unknown, e: { message: { content: { text: string }[] } }, next: (x: unknown) => unknown) => { sent.push(e.message.content[0]?.text ?? ''); return next(e) }) as never)
  on('ui.toast', (_$, e) => { toasts.push(String(e.text ?? '')); return { value: undefined } })
  on('ui.status', () => ({ value: undefined }))
  on('tool.call', () => ({ result: {} }) as never)
  const band = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  await settle()
  expect(await band.find({ type: 'Text', text: 'Shots at 2 widths' })).toBeDefined()
  expect(await band.find({ type: 'Text', text: /Plan what the screen/ })).toBeUndefined()

  // Run sends the agent one message and says so; nothing runs from the sidebar itself.
  await band.press({ key: 'fix:shots' })
  expect(sent.at(-1)).toMatch(/run this check before handover: Shots at 2 widths/)
  expect(toasts.at(-1)).toBe('Sent · Run it · Shots at 2 widths')
})

test('a logged decision and edits to .wwjd.json, wwjd.flow.json and a grade sheet refresh the gate; other files do not', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  on('session.cwd', () => ({ value: '/p' }))
  on('session.root', () => ({ value: '/p' }))
  on('session.id', () => ({ value: 's1' }))
  on('clock.now', () => ({ value: Date.parse('2026-10-18T12:00:00Z') }))
  on('fs.exists', () => ({ value: false }))
  on('fs.write', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  on('ui.status', () => ({ value: undefined }))
  let runs = 0
  on('process.run', () => (runs++, { value: { exitCode: 0, stdout: gateJson({}), stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('tool.call', () => ({ result: {} }) as never)
  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  await settle()
  const counted = async (call: object) => {
    const before = runs
    await $.tool.call(call as never)
    await settle()
    return runs - before
  }
  expect(await counted({ tool: 'mcp__wwjd__log', surface: 'Card', kind: 'choice', text: 'Dropped the count' })).toBe(1)
  expect(await counted({ tool: 'Write', file_path: '/p/.wwjd.json' })).toBe(1)
  expect(await counted({ tool: 'Edit', file_path: '/p/wwjd.flow.json' })).toBe(1)
  expect(await counted({ tool: 'Write', file_path: '/p/.wwjd/grade/card.md' })).toBe(1)
  expect(await counted({ tool: 'Write', file_path: '/p/notes.md' })).toBe(0)
  expect(await counted({ tool: 'Write', file_path: '/p/server.py' })).toBe(0)
})

test('the canvas check counts an Artifact publish, never an asset upload, read or open', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  on('session.cwd', () => ({ value: '/p' }))
  on('session.root', () => ({ value: '/p' }))
  on('session.id', () => ({ value: 's1' }))
  on('clock.now', () => ({ value: Date.parse('2026-10-18T12:00:00Z') }))
  on('fs.exists', () => ({ value: false }))
  on('ui.status', () => ({ value: undefined }))
  const seen: Record<string, number>[] = []
  on('process.run', (_$, e) => {
    seen.push((JSON.parse(String(e.init?.stdin ?? '{}')) as { seen: { artifact: Record<string, number> } }).seen.artifact)
    return { value: { exitCode: 0, stdout: gateJson({}), stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('tool.call', () => ({ result: {} }) as never)
  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  await settle()
  await $.tool.call({ tool: 'Artifact', url: 'https://claude.ai/artifact/up', file_path: 'shot.png', asset: true } as never)
  await $.tool.call({ tool: 'Artifact', action: 'read', url: 'https://claude.ai/artifact/rd' } as never)
  await $.tool.call({ tool: 'Artifact', action: 'open', url: 'https://claude.ai/artifact/op' } as never)
  await settle()
  expect(Object.keys(seen.at(-1) ?? {})).toEqual([])
  await $.tool.call({ tool: 'Artifact', url: 'https://claude.ai/artifact/pub', file_path: 'canvas.html' } as never)
  await settle()
  expect(Object.keys(seen.at(-1) ?? {})).toEqual(['pub'])
})
