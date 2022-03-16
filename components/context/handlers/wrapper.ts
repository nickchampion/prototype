import { Context as OpenAPIContext } from 'openapi-backend'
import { Context } from '../context'
import { ApiHandler } from '../handlers'

export type OpenApiHandler = (c: OpenAPIContext, context: Context) => Promise<unknown>

/**
 * This is used to decorate all handlers, take what we need from the OpenAPIBackEnd request and only pass our own context object
 * down to the api handlers in our modules. This keeps a consistent API and abstracts any infrastructure detail from our modules
 * @param handler
 * @returns
 */
const decorate = (handler: ApiHandler) => (c: OpenAPIContext, context: Context) => {
  context.event.params = c.request.params
  return handler(context)
}

export const wrap_handlers = (handlers: Record<string, ApiHandler>): Record<string, OpenApiHandler> => {
  const r = {}
  Object.keys(handlers).forEach(key => {
    r[key] = decorate(handlers[key])
  })
  return r
}
