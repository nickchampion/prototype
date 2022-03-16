import { Response } from './response'

const ignored_fields = ['limit', 'offset', 'sort', 'sort_desc']

export class EventSource {
  public path: string
  public payload?: unknown
  public query?: Record<string, string | number>
  public params?: Record<string, string | string[]>
  public method?: string
  public headers?: Record<string, string>
  public response?: Response

  constructor(fields?: Partial<EventSource>) {
    Object.assign(this, fields)
    this.response = new Response()
  }

  public id(): string {
    return (
      (this.params?.id as string) ||
      (this.query?.id as string) ||
      (this.payload ? (this.payload['id'] as string) : null)
    )
  }

  public parse_query(): Record<string, string | number> {
    return Object.keys(this.query)
      .filter(k => !ignored_fields.includes(k))
      .reduce((obj, key) => {
        obj[key] = this.query[key]
        return obj
      }, {})
  }

  public limit(def = 25): number {
    return (this.query?.limit as number) || def
  }

  public offset(): number {
    return (this.query?.offset as number) || 0
  }
}
