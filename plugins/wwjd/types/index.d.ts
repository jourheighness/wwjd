export type Scope = 'person' | 'project'

declare module 'claude-code' {
  interface PluginState {
    wwjd: { scope: Scope; project: Record<string, string | number>; focused: string }
  }
}
