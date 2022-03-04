import { EventBridgeEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as ctx from '@hectare/platform.components.context'
import * as assets from '@hectare/platform.modules.inventory.assets'

/**
 * Service entry point is responsible for configuraing which modules are exposed by this service
 * APIs are pulled from a modules manifest and can be combined to expose multiple modules APIs
 * via a single service. The name of the field in the api object below must match the first parameter
 * in the URL path, i.e. assets for the /assets api
 */

/**
 * APIs this service exposes
 */
const apis = {
  assets: assets.manifest.api
}

/**
 * Events this service handles
 */
const events = {
  ...assets.manifest.events
}

/**
 * we need to know which models this service deals with and initialise the RavenDb document store with these models.
 * This allows RavenDB to track these entiies within a session
 */
const models = {
  ...assets.manifest.models
}

// boostrap the service and get the document store used for opening sessions to RavenDB
const store = ctx.create_document_store(models)

/**
 * Handler for all api endpoints, routes are defined in the openapi documents in each module
 * Any custom middleware required by this module can be passed to the api_handler
 */
export const api_handler: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  return await ctx.api_handler(event, context, apis, store)
}

/**
 * Handler for all events related to assets, event handlers are published in each modules manifest
 * @param event
 */
export const event_handler = async (event: EventBridgeEvent<string, string>): Promise<void> => {
  await ctx.event_handler(event, events, store)
}
