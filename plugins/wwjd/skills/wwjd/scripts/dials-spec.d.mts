export type DialSpec = {
  key: string
  name: string
  ends: string[]
  default: number | string
  values?: string[]
  stops: [string, string][]
}
export const DIALS: DialSpec[]
export function stopOf(dial: DialSpec, value: unknown): number
export function valueOf(dial: DialSpec, stop: number): number | string
export function isDefault(dial: DialSpec, stop: number): boolean
