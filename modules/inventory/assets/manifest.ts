import { OpenAPIBackend } from 'openapi-backend'
import path from 'path'
import * as models from './models'
import * as indexes from './indexes'
import { api_handlers } from './handlers/api'
import { event_handlers as events } from './handlers/events'
import { IManifest } from '@hectare/platform.components.common'
import { wrap_handlers } from '@hectare/platform.components.context'

/**
 * A modules manifest defines the API routes, event handlers, models and indexes exported by this module
 * A manifest is used to configure a service, a service can be composed of one or more manifests
 * giving flexibility over the granularity of each service
 *
 * We use OpenAPIBackend to handle routing, validtion and documentation, this allows us to define the
 * module specification in one place, a yml file.
 */

const api = new OpenAPIBackend({
  definition: path.join(__dirname, './manifest.yml'),
  handlers: wrap_handlers(api_handlers),
  quick: true
})

api.init()

export const manifest: IManifest = {
  api,
  events,
  models,
  indexes
}
