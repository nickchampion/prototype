import * as openapi from 'openapi-backend'
import { Context } from '@hectare/platform.components.context'
import * as http from '@hectare/platform.components.http'
import * as assets from '@hectare/platform.modules.inventory.assets'

/**
 * API Handlers are a simple mapping layer between our business modules and HTTP.
 * We should only pass our own context object down to the modules and map the response 
 * back to the http response in our handlers
 * 
 * Naming convention for API handlers is module name (assets in this case) followed by _[operation_name]
 * These handler names must match the operationId field in the paths.yml for the matching route
 */
export const api_handlers = {
  assets_get: async (c: openapi.Context, context: Context): Promise<http.Response> => {
    // hack, waiting on a PR to be merged to allow us to register a pre handler with open API backend
    // which will allow us to extract the path params rather than havng to do it on all handlers. This would already be done
    // with AWSLambda but not when we run locally using Hapi
    context.event.params = c.request.params;

    const asset = await assets.get(context)
    if (asset) return http.status.ok(asset)
    return http.status.not_found()
  },
  assets_search: async (c: openapi.Context, context: Context): Promise<http.Response> => {
    const results = await assets.search(context)
    if (results) return http.status.ok(results)
    return http.status.not_found()
  },
  assets_create: async (c: openapi.Context, context: Context): Promise<http.Response> => {
    const asset = await assets.create(context)
    return http.status.ok(asset)
  }
}
