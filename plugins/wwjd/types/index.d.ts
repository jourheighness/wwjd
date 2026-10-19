export type Scope = 'person' | 'project'

/** What `gate.mjs status` prints: the Strictness dial, the grade sheet and the checks before handover. */
export type Gate = {
  strictness: number
  hasEdits: boolean
  lastFile: string | null
  /** due: the pre gate refused a new UI file this session and no sheet was written since. */
  sheet: { needed: boolean; file: string | null; due: boolean }
  checks: { key: string; label: string; done: boolean; how: string }[]
}

/** One line of .wwjd/decisions.jsonl: a design assumption or choice the agent logged, and how the person settled it:
 *  kept as it is, or changed (the correction). Settled entries leave the open list for Handled. */
export type Entry = {
  id: string
  at: string
  surface: string
  kind: 'assumption' | 'choice'
  text: string
  why?: string
  correction?: { note: string; scope: Scope; file: string; at: string }
  kept?: { at: string }
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
      showHandled: boolean
    }
  }
}
