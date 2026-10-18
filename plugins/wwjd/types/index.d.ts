export type Scope = 'person' | 'project'

/** What `gate.mjs status` prints: the Strictness dial, the grade sheet and the checks before handover. */
export type Gate = {
  strictness: number
  hasEdits: boolean
  lastFile: string | null
  sheet: { needed: boolean; file: string | null }
  checks: { key: string; label: string; done: boolean; how: string }[]
}

/** One line of .wwjd/decisions.jsonl: a design assumption or choice the agent logged, and its correction if any. */
export type Entry = {
  id: string
  at: string
  surface: string
  kind: 'assumption' | 'choice'
  text: string
  why?: string
  correction?: { note: string; scope: Scope; file: string; at: string }
}

declare module 'claude-code' {
  interface PluginState {
    wwjd: {
      scope: Scope
      project: Record<string, string | number>
      focused: string
      gate: Gate | null
      isActive: boolean
      view: 'log' | 'settings'
      editing: string
      draft: string
      noteScope: Scope
      logVersion: number
    }
  }
}
