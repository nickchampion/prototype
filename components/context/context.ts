import { IDocumentStore } from 'ravendb'
import { Session } from '@hectare/platform.components.ravendb'
import { EventSource, IContext, IProfiler } from '@hectare/platform.components.common'
import { configuration, IConfiguration } from '@hectare/platform.components.configuration'
import { Profiler } from './profiler'

export class Context implements IContext {
  private _store: IDocumentStore
  session: Session
  event: EventSource
  profiler: IProfiler
  configuration: IConfiguration

  public constructor(store: IDocumentStore) {
    this._store = store
    this.profiler = new Profiler()
    this.session = new Session(store, this.profiler)
    this.configuration = configuration
  }
}
