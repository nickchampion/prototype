import { Context as ApiBackendContext } from 'openapi-backend'
import { Context } from '@hectare/platform.components.context'
import * as http from '@hectare/platform.components.http'
import * as assets from '@hectare/platform.modules.inventory.assets'

/**
 * Naming convetion for API handlers is module name (assets in this case) followed by _[operation_name]
 * These handler names must match the operationId field in the paths.yml for the matching route
 */
export const api_handlers = {
  assets_get: async (request: ApiBackendContext, context: Context): Promise<http.Response> => {
    const asset = await assets.get(context)
    if (asset) return http.status.ok(asset)
    return http.status.not_found()
  },
  assets_search: async (request: ApiBackendContext, context: Context): Promise<http.Response> => {
    const results = await assets.search(context)
    if (results) return http.status.ok(results)
    return http.status.not_found()
  },
  assets_create: async (request: ApiBackendContext, context: Context): Promise<http.Response> => {
    const asset = await assets.create(context)
    return http.status.ok(asset)
  }
}
