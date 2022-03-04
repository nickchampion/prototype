import { ISession } from './session'
import { IEventContext } from './event'
import { IProfiler } from './profiler'

export interface IContext {
  session: ISession
  event: IEventContext
  profiler: IProfiler
}
