export type DialSpec = {
  key: string
  name: string
  ends: string[]
  default: number
  stops: [string, string][]
}
export const DIALS: DialSpec[]
export function stopOf(dial: DialSpec, value: unknown): number
export function valueOf(dial: DialSpec, stop: number): number
export function isDefault(dial: DialSpec, stop: number): boolean
export function isGated(strictness: unknown): boolean
