import { expect, test } from 'claude-code/testing'

const BAND = { component: 'AbovePrompt', requestId: 'band' } as const
const props = { hasSurvey: false } as never

function gateJson(over: object) {
  return JSON.stringify({ strictness: 3, hasEdits: true, lastFile: '/p/card.html', sheet: { needed: true, file: null },
    checks: [{ key: 'shots', label: 'Shots at 2 widths', done: false, how: '' }], ...over })
}

test('quiet until wwjd is used; then the status line and the band list what Strictness still wants', async ($, on) => {
  let out = gateJson({})
  const statuses: unknown[] = []
  on('session.cwd', () => ({ value: '/p' }))
  on('session.id', () => ({ value: 's1' }))
  on('fs.exists', () => ({ value: false }))
  on('process.run', () => ({ value: { exitCode: 0, stdout: out, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }))
  on('ui.status', (_$, e) => { statuses.push(e.text); return { value: undefined } })
  on('tool.call', () => ({ result: {} }) as never)
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)

  const band = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...BAND, props })
  expect(await band.find({ type: 'Text', text: /Strictness/ })).toBeUndefined()

  await $.tool.call({ tool: 'Skill', skill: 'wwjd:ux' } as never)
  expect(statuses.at(-1)).toBe('wwjd · Strictness 3')
  expect(await band.find({ type: 'Text', text: 'Grade sheet · Shots at 2 widths' })).toBeDefined()

  out = gateJson({ sheet: { needed: true, file: 'card.md' }, checks: [{ key: 'shots', label: 'Shots at 2 widths', done: true, how: '' }] })
  await $.tool.call({ tool: 'Bash', command: 'node render.mjs shoot card.html' } as never)
  expect(await band.find({ type: 'Text', text: /wants/ })).toBeUndefined()
})
