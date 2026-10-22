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

test('person picks go to the plugin options, and to WWJD_DIALS so Bash sees them this session', async ($, on) => {
  mock.store(on)
  const env: Record<string, string | undefined> = { HOME: '/home/j' }
  on('env.get', (_$, e) => ({ value: env[e.name] }))
  on('env.set', (_$, e) => { env[e.name] = e.value; return { value: undefined } })
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
  expect(env.WWJD_DIALS).toMatch(/\bmotion=2\b/)
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

test('Hooks: a pick goes to the plugin option for you, to .wwjd.json "hooks" for the project, and Use mine removes it', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  const sets: unknown[] = []
  const files: Record<string, string> = { '/p/.wwjd.json': '{}\n' }
  on('config.set', (_$, e) => {
    sets.push([e.key, e.value])
    return { value: e.value }
  })
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
  on('env.set', () => ({ value: undefined }))
  on('ui.open', () => opened)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  await ui.press({ key: 'to-settings' })
  expect(await ui.find({ type: 'Text', text: 'Hooks' })).toBeDefined()
  await ui.press({ key: 'hooks:quiet' })
  expect(sets).toEqual([['wwjd.hookmode', 'quiet']])
  await ui.press({ key: 'scope:1' })
  await ui.press({ key: 'hooks:off' })
  expect(JSON.parse(files['/p/.wwjd.json'] ?? '{}').hooks).toBe('off')
  await ui.press({ key: 'hooks:reset' })
  expect(JSON.parse(files['/p/.wwjd.json'] ?? '{}').hooks).toBeUndefined()
  await ui.unmount()
})

test('Flow and Canvas: a pick goes to the plugin option (and its env) for you, to .wwjd.json "flowMode" / "canvasMode" for the project, and Use mine removes it', async ($, on) => {
  mock.store(on)
  mock.env(on, { HOME: '/home/j' })
  const sets: unknown[] = []
  const envs: unknown[] = []
  const files: Record<string, string> = { '/p/.wwjd.json': '{"canvas":"https://claude.ai/artifact/c"}\n' }
  on('config.set', (_$, e) => { sets.push([e.key, e.value]); return { value: e.value } })
  on('session.cwd', () => ({ value: '/p' }))
  on('fs.exists', (_$, e) => ({ value: e.path in files }))
  on('fs.read', (_$, e) => { const t = files[e.path]; if (t === undefined) throw new Error('missing'); return { value: t } })
  on('env.set', (_$, e) => { envs.push([e.name, e.value]); return { value: undefined } })
  on('fs.write', (_$, e) => { files[e.path] = e.text; return { value: undefined } })
  on('ui.open', () => opened)
  await $.command.run({ command: 'wwjd' } as never)
  const ui = await $.ui.mount({ plugin: 'wwjd', surface: 'terminal', ...PANE, props })
  await ui.press({ key: 'to-settings' })
  expect(await ui.find({ type: 'Text', text: 'Flow' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Canvas' })).toBeDefined()
  await ui.press({ key: 'flow:off' })
  await ui.press({ key: 'canvas:off' })
  expect(sets).toEqual([['wwjd.flowmode', 'off'], ['wwjd.canvasmode', 'off']])
  expect(envs).toEqual(expect.arrayContaining([['WWJD_FLOW', 'off'], ['WWJD_CANVAS', 'off']]))
  await ui.press({ key: 'scope:1' })
  expect(await ui.find({ type: 'Text', text: 'Same as yours' })).toBeDefined()
  await ui.press({ key: 'flow:off' })
  await ui.press({ key: 'canvas:off' })
  const json = JSON.parse(files['/p/.wwjd.json'] ?? '{}')
  expect(json.flowMode).toBe('off')
  expect(json.canvasMode).toBe('off')
  expect(json.canvas).toBe('https://claude.ai/artifact/c')
  await ui.press({ key: 'flow:reset' })
  await ui.press({ key: 'canvas:reset' })
  const after = JSON.parse(files['/p/.wwjd.json'] ?? '{}')
  expect(after.flowMode).toBeUndefined()
  expect(after.canvasMode).toBeUndefined()
  await ui.unmount()
})
