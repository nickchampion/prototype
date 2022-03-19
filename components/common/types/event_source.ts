import { Response } from './response'
import { QuerySettings } from './query_settings'

const ignored_fields = ['limit', 'offset', 'sort', 'sort_desc']

export enum EventSourceType {
  Http,
  Event
}

/**
 * Representation of an event that triggered whatever code is currently executing
 */
export class EventSource {
  public path: string
  public payload?: unknown
  public query?: Record<string, string | number | boolean>
  public params?: Record<string, string | string[]>
  public method?: string
  public headers?: Record<string, string>
  public response?: Response
  public type: EventSourceType

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

  public get_query_settings(limit = 25): QuerySettings {
    const filters = Object.keys(this.query || {})
      .filter(k => !ignored_fields.includes(k))
      .reduce((obj, key) => {
        obj[key] = this.query[key]
        return obj
      }, {})

    return new QuerySettings({
      limit: (this.query?.limit as number) || limit,
      offset: (this.query?.offset as number) || 0,
      sort: this.query?.sort as string,
      sort_desc: this.query?.sort_desc as boolean,
      filters: filters
    })
  }
}
