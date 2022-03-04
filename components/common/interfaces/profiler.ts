export interface IProfiler {
  snapshots: unknown
  results: string[]
  start: number
  elapsed(): number
  snapshot(key: string): void
  capture(key: string): void
  measure(key: string, fn: { (): unknown }): Promise<unknown>
  summary(): string
}
