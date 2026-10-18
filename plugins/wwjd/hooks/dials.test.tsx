import { expect, test } from 'claude-code/testing'

const opened = { value: { isPlaced: true } } as never
const PANE = { component: 'Pane', requestId: 'wwjd-dials' } as const
const props = { title: 'wwjd dials', isFocused: true, bodyColumns: 60, placement: 'dock' } as never

test('project picks land in .wwjd.json dials; inherit removes them', async ($, on) => {
  const files: Record<string, string> = { '/p/.wwjd.json': '{\n  "register": "operate"\n}\n' }
  on('session.cwd', () => ({ value: '/p' }))
  on('fs.exists', (_$, e) => ({ value: e.path in files }))
  on('fs.read', (_$, e) => {
    const text = files[e.path]
    if (text === undefined) throw new Error('missing')
    return { value: text }
  })
  on('fs.write', (_$, e) => {
    files[e.path] = e.text
    return { value: undefined }
  })
  on('ui.open', () => opened)
  await $.command.run({ command: 'wwjd-dials' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'wwjd', surface, ...PANE, props })
    await ui.select({ key: 'scope', value: 'project' })
    await ui.select({ key: 'creativity', value: '5' })
    await ui.select({ key: 'grade', value: 'light' })
    const json = JSON.parse(files['/p/.wwjd.json'] ?? '{}')
    expect(json.register).toBe('operate')
    expect(json.dials).toEqual({ creativity: 5, grade: 'light' })
    await ui.select({ key: 'creativity', value: 'inherit' })
    await ui.select({ key: 'grade', value: 'inherit' })
    expect(JSON.parse(files['/p/.wwjd.json'] ?? '{}').dials).toBeUndefined()
    await ui.select({ key: 'scope', value: 'person' })
    await ui.unmount()
  }
})

test('person picks go to the plugin options', async ($, on) => {
  const sets: unknown[] = []
  on('config.set', (_$, e) => {
    sets.push([e.key, e.value])
    return { value: e.value }
  })
  on('session.cwd', () => ({ value: '/p' }))
  on('fs.exists', () => ({ value: false }))
  on('fs.read', () => { throw new Error('missing') })
  on('ui.open', () => opened)
  await $.command.run({ command: 'wwjd-dials' })
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  await ui.select({ key: 'budget', value: '2' })
  await ui.select({ key: 'motion', value: 'crisp' })
  expect(sets).toEqual([['wwjd.budget', 2], ['wwjd.motion', 'crisp']])
})
