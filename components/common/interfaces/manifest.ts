import { OpenAPIBackend } from 'openapi-backend'
import { EventHandler } from './event'
import { ObjectTypeDescriptor } from 'ravendb'

/**
 * A manifest interface is used to specify the events, apis, models and indexes a given module exposes for services to consume
 */
export interface IManifest {
  api: OpenAPIBackend
  events: { [name: string]: EventHandler }
  models: { [name: string]: ObjectTypeDescriptor }
  indexes: { [name: string]: ObjectTypeDescriptor }
}
