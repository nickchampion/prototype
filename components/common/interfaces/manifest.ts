import { OpenAPIBackend } from 'openapi-backend'
import { ObjectTypeDescriptor } from 'ravendb'
import { IContext } from './context'

/**
 * A manifest interface is used to specify the events, apis, models and indexes a given module exposes for services to consume
 */
export interface IManifest {
  api: OpenAPIBackend
  events: { [name: string]: (context: IContext) => Promise<void> }
  models: { [name: string]: ObjectTypeDescriptor }
  indexes: { [name: string]: ObjectTypeDescriptor }
}
