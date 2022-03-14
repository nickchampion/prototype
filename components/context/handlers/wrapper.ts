import { Context as OpenAPIContext } from 'openapi-backend'
import { ApiHandler } from '@hectare/platform.components.common'
import { Context } from '../context'

export type OpenApiHandler = (c: OpenAPIContext, context: Context) => Promise<unknown>

/**
 * This is used to decorate all handlers, take what we need from the OpenAPIBackEnd request and only pass our own context object
 * down to the api handlers in our modules. This keeps a consistent API and abstracts any infrastructure setup from our modules
 * @param handler
 * @returns
 */
const decorator = (handler: ApiHandler) => (c: OpenAPIContext, context: Context) => {
  context.event.params = c.request.params
  return handler(context)
}

export const wrap_handlers = (handlers: Record<string, ApiHandler>): Record<string, OpenApiHandler> => {
  const r = {}
  Object.keys(handlers).forEach(key => {
    r[key] = decorator(handlers[key])
  })
  return r
}