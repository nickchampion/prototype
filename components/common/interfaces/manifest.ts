import { OpenAPIBackend } from 'openapi-backend'
import { IContext } from './context'
import { ObjectTypeDescriptor } from 'ravendb'
import { Response } from '../types'

export type EventHandler = (context: IContext) => Promise<void>
export type ApiHandler = (context: IContext) => Promise<Response>

/**
 * A manifest interface is used to specify the events, apis, models and indexes a given module exposes for services to consume
 */
export interface IManifest {
  api: OpenAPIBackend
  events: { [name: string]: EventHandler }
  models: { [name: string]: ObjectTypeDescriptor }
  indexes: { [name: string]: ObjectTypeDescriptor }
}
