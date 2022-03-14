import { ApiHandler } from '@hectare/platform.components.common'
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

const assets_get: ApiHandler = async (context): Promise<http.Response> => {
  const asset = await assets.get(context)
  if (asset) return http.status.ok(asset)
  return http.status.not_found()
}

const assets_search: ApiHandler = async (context): Promise<http.Response> => {
  const results = await assets.search(context)
  if (results) return http.status.ok(results)
  return http.status.not_found()
}

const assets_create: ApiHandler = async (context): Promise<http.Response> => {
  const asset = await assets.create(context)
  return http.status.ok(asset)
}

export const api_handlers: Record<string, ApiHandler> = {
  assets_get,
  assets_search,
  assets_create
}
