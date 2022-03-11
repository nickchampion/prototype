import { IDocumentStore } from 'ravendb'
import { Session } from '@hectare/platform.components.ravendb'
import { Profiler } from '@hectare/platform.components.utils'
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
  query?: { [name: string]: string | number }
  params?: { [name: string]: string | number }
  payload?: unknown
  path?: string
  method?: string
  headers: { [name: string]: string }
  args: { [name: string]: unknown }
  type: IEventType

  constructor(fields?: Partial<EventContext>) {
    Object.assign(this, fields)
  }

  payload_as<T>(): T {
    return this.payload as T
  }

  id(): string {
    return (this.params?.id as string) || (this.query?.id as string)
  }
}
