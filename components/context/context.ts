import { IDocumentStore } from 'ravendb'
import { Session } from '@hectare/platform.components.ravendb'
import { Profiler } from './profiler'
import { IEventType, IContext, ISession, IEventContext } from '@hectare/platform.components.common'

export class Context implements IContext {
  session: ISession
  event: IEventContext
  profiler: Profiler

  public constructor(store: IDocumentStore) {
    this.session = new Session(this, store)
    this.profiler = new Profiler()
  }
}

export class EventContext implements IEventContext {
  private _ignored_query_fields = ['limit', 'offset', 'sort', 'sort_desc']

  query?: Record<string, string | number>
  params?: Record<string, string | number>
  payload?: unknown
  path?: string
  method?: string
  headers: Record<string, string>
  type: IEventType

  constructor(fields?: Partial<EventContext>) {
    Object.assign(this, fields)
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
