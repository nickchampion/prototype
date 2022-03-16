import { IDocumentStore } from 'ravendb'
import { Session } from '@hectare/platform.components.ravendb'
import { Profiler } from './profiler'
import { IContext, ISession, EventContext } from '@hectare/platform.components.common'

export class Context implements IContext {
  session: ISession
  event: EventContext
  profiler: Profiler

  public constructor(store: IDocumentStore) {
    this.session = new Session(this, store)
    this.profiler = new Profiler()
  }
}
