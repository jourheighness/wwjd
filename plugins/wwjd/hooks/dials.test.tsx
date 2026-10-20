import { expect, mock, test } from 'claude-code/testing'

const opened = { value: { isPlaced: true } } as never
const PANE = { component: 'Pane', requestId: 'wwjd' } as const
const props = { title: 'wwjd', isFocused: true, bodyColumns: 60, placement: 'dock' } as never

test('project picks land in .wwjd.json dials; inherit removes them', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
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
  await $.command.run({ command: 'wwjd' } as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'wwjd', surface, ...PANE, props })
    await ui.press({ key: 'to-settings' })
    await ui.press({ key: 'scope:1' })
    await ui.press({ key: 'creativity:4' })
    await ui.press({ key: 'strictness:0' })
    const json = JSON.parse(files['/p/.wwjd.json'] ?? '{}')
    expect(json.register).toBe('operate')
    expect(json.dials).toEqual({ creativity: 5, strictness: 1 })
    await ui.press({ key: 'creativity:reset' })
    await ui.press({ key: 'strictness:reset' })
    expect(JSON.parse(files['/p/.wwjd.json'] ?? '{}').dials).toBeUndefined()
    await ui.press({ key: 'scope:0' })
    await ui.press({ key: 'to-log' })
    await ui.unmount()
  }
})

test('person picks go to the plugin options', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  const sets: unknown[] = []
  on('config.set', (_$, e) => {
    sets.push([e.key, e.value])
    return { value: e.value }
  })
  on('session.cwd', () => ({ value: '/p' }))
  on('fs.exists', () => ({ value: false }))
  on('fs.read', () => { throw new Error('missing') })
  on('ui.open', () => opened)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  await ui.press({ key: 'to-settings' })
  expect(await ui.find({ type: 'Text', text: /Content/ })).toBeDefined()
  await ui.press({ key: 'budget:1' })
  await ui.press({ key: 'motion:1' })
  expect(sets).toEqual([['wwjd.budget', 2], ['wwjd.motion', 2]])
})

test('each dial card says what its picked stop does', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  const files: Record<string, string> = {}
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
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  await ui.press({ key: 'to-settings' })
  expect(await ui.find({ type: 'Text', text: /The product type decides/ })).toBeDefined()
  await ui.press({ key: 'scope:1' })
  await ui.press({ key: 'density:4' })
  expect(await ui.find({ type: 'Text', text: 'Spacing' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /32px rows/ })).toBeDefined()
  expect(await ui.find({ key: 'density:reset' })).toBeDefined()
})

test('a .wwjd.json that does not parse is never overwritten by a pick', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  const broken = '{\n  "register": "operate",\n  // a comment\n}\n'
  const files: Record<string, string> = { '/p/.wwjd.json': broken }
  const toasts: string[] = []
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
  on('ui.toast', (_$, e) => { toasts.push(String(e.text ?? '')); return { value: undefined } })
  on('ui.open', () => opened)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'desktop', ...PANE, props })
  await ui.press({ key: 'to-settings' })
  await ui.press({ key: 'scope:1' })
  await ui.press({ key: 'creativity:4' })
  expect(files['/p/.wwjd.json']).toBe(broken)
  expect(toasts.at(-1)).toMatch(/Not saved: .*not valid JSON/)
})
