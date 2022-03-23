import Hapi from '@hapi/hapi'
import { handler } from './app'

// create new server instance
const server = new Hapi.Server({
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
})

server.route({
  method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  path: '/{path*}',
  config: {
    handler,
    auth: false
  }
})

async function start() {
  await server.start()
  return server
}

start()
  .then(s => {
    console.log(`Server listening on ${s.info.uri}`)
  })
  .catch(e => {
    console.log(e)
    process.exit(1)
  })
