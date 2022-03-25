import { Server } from '@hectare/platform.components.context'
import { create_document_store } from '@hectare/platform.components.ravendb'
import * as assets from '@hectare/platform.modules.inventory.assets'

/**
 * App is our local web server so we can run all APIs at the same time locally
 * To include module APIs just import the manifest and add to the apis and models objects below
 */
const apis = {
  assets: assets.manifest.api
}

const models = {
  ...assets.manifest.models
}

const store = create_document_store(models)

const server = new Server(
  {
    host: 'local-api.hectare.farm',
    port: 8001,
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Authorization', 'Content-Type', 'accept-version'],
        credentials: true
      },
      validate: {
        failAction: async (request, h, err) => {
          console.error(err)
          throw err
        }
      }
    }
  },
  apis,
  store
)

const start = async () => {
  await server.start()
}

start()
