import { Response } from './response'

export enum IEventType {
  api,
  event
}

export class EventContext {
  private _ignored_query_fields = ['limit', 'offset', 'sort', 'sort_desc']

  query?: Record<string, string | number>
  params?: Record<string, string | string[]>
  payload?: unknown
  path?: string
  method?: string
  headers: Record<string, string>
  type: IEventType
  response: Response

  constructor(fields?: Partial<EventContext>) {
    Object.assign(this, fields)
    this.response = new Response()
  }

  id(): string {
    return (this.params?.id as string) || (this.query?.id as string)
  }

  parse_query(): Record<string, string | number> {
    const q = {}
    Object.keys(this.query)
      .filter(k => !this._ignored_query_fields.includes(k))
      .forEach(k => {
        q[k] = this.query[k]
      })
    return q
  }
}
