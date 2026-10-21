export type Scope = 'person' | 'project'
/** Where a correction from the sidebar is kept: nowhere (just this time), this project, or every project. */
export type NoteScope = 'once' | Scope

/** What `gate.mjs status` prints: the Strictness dial, the grade sheet and the checks before handover. */
export type Gate = {
  strictness: number
  /** The Hooks setting when it is not "on": quiet or off; the gate then reports nothing due. */
  hooks?: string
  hasEdits: boolean
  lastFile: string | null
  /** due: the pre gate refused a new UI file this session and no sheet was written since. */
  sheet: { needed: boolean; file: string | null; due: boolean }
  /** label and what are for the person (plain words); how is the agent's command. */
  checks: { key: string; label: string; what?: string; done: boolean; how: string }[]
}

/** One line of .wwjd/decisions.jsonl: a design assumption or choice the agent logged, and how the person settled it:
 *  kept as it is, or changed (the correction). Settled entries leave the open list for Handled. A save is a wwjd rule
 *  that changed what the agent was about to do: never settled, shown as "Johannes kept Claude from <text>". */
export type Entry = {
  id: string
  at: string
  surface: string
  kind: 'assumption' | 'choice' | 'save'
  text: string
  /** 2–6 words, the row's label in the sidebar ("Decisions open on press"); the text is the whole line. */
  title?: string
  why?: string
  /** A save's rule, by its wwjd name ("Floor: tooltips"). */
  rule?: string
  /** The task it belongs to ("Signup flow"); the sidebar groups by it, else by surface. */
  task?: string
  /** What it is about: screenshot or file paths (a file may end in :line), live dev-server URLs, artifact links. */
  /** "Name | target" strings, or typed { kind, name, url | path, board, line } (hooks/sidebar.tsx Proof). */
  proof?: (string | { kind?: string; name?: string; url?: string; path?: string; board?: string; line?: number })[]
  correction?: { note: string; scope: NoteScope; file: string; at: string }
  kept?: { at: string }
}

declare module 'claude-code' {
  interface PluginState {
    wwjd: {
      scope: Scope
      project: Record<string, string | number>
      /** The project's .wwjd.json "hooks" (on, quiet, off), '' when it has none. */
      projectHooks: string
      /** The project's .wwjd.json "boardMode" (on, off), '' when it has none. */
      projectBoard: string
      gate: Gate | null
      isActive: boolean
      view: 'log' | 'settings'
      editing: string
      noteScope: NoteScope
      logVersion: number
      /** Which pane cards the person folded or opened, by key; absent keys use each card's default. */
      folds: Record<string, boolean>
      /** The decision row opened to show why, proof, Edit and Dismiss. */
      openRow: string
      showSaves: boolean
      /** The last file the session wrote or edited: names the project whose log the agent writes. */
      lastEdited: string
      /** The root whose .wwjd/decisions.jsonl the log tool last wrote; the sidebar reads it. */
      logRoot: string
    }
  }
}
