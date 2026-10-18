export type Scope = 'person' | 'project'

/** What `gate.mjs status` prints: the Strictness dial, the grade sheet and the checks before handover. */
export type Gate = {
  strictness: number
  hasEdits: boolean
  lastFile: string | null
  sheet: { needed: boolean; file: string | null }
  checks: { key: string; label: string; done: boolean; how: string }[]
}

declare module 'claude-code' {
  interface PluginState {
    wwjd: {
      scope: Scope
      project: Record<string, string | number>
      focused: string
      gate: Gate | null
      isActive: boolean
    }
  }
}
