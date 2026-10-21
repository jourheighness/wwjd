export type Scope = 'person' | 'project'

/** What `gate.mjs status` prints: the Strictness dial, the grade sheet and the checks before handover. */
export type Gate = {
  strictness: number
  /** The Hooks setting when it is not "on": quiet or off; the gate then reports nothing due. */
  hooks?: string
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
  /** The task it belongs to ("Signup flow"); the sidebar groups by it, else by surface. */
  task?: string
  /** What it is about: screenshot or file paths (a file may end in :line), live dev-server URLs, artifact links. */
  proof?: string[]
  correction?: { note: string; scope: Scope; file: string; at: string }
  kept?: { at: string }
}

declare module 'claude-code' {
  interface PluginState {
    wwjd: {
      scope: Scope
      project: Record<string, string | number>
      /** The project's .wwjd.json "hooks" (on, quiet, off), '' when it has none. */
      projectHooks: string
      gate: Gate | null
      isActive: boolean
      view: 'log' | 'settings'
      editing: string
      draft: string
      noteScope: Scope
      logVersion: number
      showHandled: boolean
      /** The last file the session wrote or edited: names the project whose log the agent writes. */
      lastEdited: string
      /** The root whose .wwjd/decisions.jsonl the log tool last wrote; the sidebar reads it. */
      logRoot: string
      detail: string
    }
  }
}
