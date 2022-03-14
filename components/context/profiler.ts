import { IProfiler } from '@hectare/platform.components.common'

/**
 * Basic util to measure some code execution and return a summary to be writter to API response header
 */
export class Profiler implements IProfiler {
  // eslint-disable-next-line @typescript-eslint/ban-types
  snapshots: {}
  results: string[]
  start: number

  public constructor() {
    this.start = new Date().valueOf()
    this.snapshots = {}
    this.results = []
  }

  elapsed(): number {
    return new Date().valueOf() - this.start
  }

  snapshot(key: string): void {
    this.snapshots[key] = new Date().valueOf()
  }

  capture(key: string): void {
    this.results.push(`${key}:${new Date().valueOf() - this.snapshots[key]}ms`)
    delete this.snapshots[key]
  }

  async measure(key: string, fn: { (): unknown }): Promise<unknown> {
    this.snapshot(key)
    const r = await fn()
    this.capture(key)
    return r
  }

  summary(): string {
    return `t:${this.elapsed()}ms > ${this.results.join(' > ')}`
  }
}
