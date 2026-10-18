import { expect, mock, test } from 'claude-code/testing'

const PANE = { component: 'Pane', requestId: 'wwjd' } as const
const props = { title: 'wwjd', isFocused: false, bodyColumns: 70, placement: 'dock' } as never

function gateJson(over: object) {
  return JSON.stringify({ strictness: 3, hasEdits: true, lastFile: '/p/card.html', sheet: { needed: true, file: null, due: true },
    checks: [{ key: 'shots', label: 'Shots at 2 widths', done: false, how: '' }], ...over })
}

test('quiet until wwjd is used; then the status line and the sidebar list what Strictness still wants', async ($, on) => {
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
  expect(await band.find({ type: 'Text', text: /Before handover/ })).toBeUndefined()

  await $.tool.call({ tool: 'Write', file_path: '/p/card.html' } as never)
  await $.tool.call({ tool: 'Bash', command: 'ls' } as never)
  expect(runs).toBe(0)

  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  expect(statuses.at(-1)).toBe('wwjd · Strictness 3')
  expect(await band.find({ type: 'Text', text: /Before handover: Grade sheet · Shots at 2 widths/ })).toBeDefined()

  out = gateJson({ sheet: { needed: true, file: 'card.md', due: false }, checks: [{ key: 'shots', label: 'Shots at 2 widths', done: true, how: '' }] })
  await $.tool.call({ tool: 'Bash', command: 'git status' } as never)
  expect(runs).toBe(1)
  await $.tool.call({ tool: 'Bash', command: 'node render.mjs shoot card.html' } as never)
  expect(runs).toBe(2)
  expect(await band.find({ type: 'Text', text: /Before handover/ })).toBeUndefined()
})

test('editing existing files shows the checks, not a grade sheet', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  on('session.cwd', () => ({ value: '/p' }))
  on('session.root', () => ({ value: '/p' }))
  on('session.id', () => ({ value: 's1' }))
  on('fs.exists', () => ({ value: false }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: gateJson({ sheet: { needed: true, file: null, due: false } }), stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.status', () => ({ value: undefined }))
  on('tool.call', () => ({ result: {} }) as never)
  const band = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  expect(await band.find({ type: 'Text', text: /Before handover: Shots at 2 widths/ })).toBeDefined()
  expect(await band.find({ type: 'Text', text: /Grade sheet/ })).toBeUndefined()
})
