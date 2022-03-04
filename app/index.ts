import Hapi from '@hapi/hapi'
import { routes } from './routes'

// create new server instance
const server = new Hapi.Server({
  host: 'local-api.hectare.farm',
  port: 8001,
  routes: {
    cors: {
      origin: ['*'],
      headers: [
        'Authorization',
        'Content-Type',
        'L-Timezone-Offset',
        'L-Profile',
        'L-Impersonator',
        'L-Country',
        'L-Account',
        'L-User'
      ],
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

async function start() {
  server.route(routes)
  await server.start()
  return server
}

start()
  .then(s => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on ${s.info.uri}`)
  })
  .catch(e => {
    console.log(e)
    process.exit(1)
  })

module.exports = server
