import { beforeAll, beforeEach, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { setupServer, SetupServerApi } from 'msw/node'
import mongoose from 'mongoose'
import { SimpleResponseDecorator } from '@hectare/core/testing/testing-utils/api-mocking/msw-api-mocker.decorator'

let apiMocker: SetupServerApi
// initialise in memory DB
let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = new MongoMemoryServer({ instance: { port: 5999, dbName: 'test' } })
  const mongoUri = await mongo.getUri()
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })

  // initialize api for mocking outbound api requests
  apiMocker = setupServer()
  const decorated_server = new SimpleResponseDecorator(apiMocker)
  global.apiResponseMocker = decorated_server
  await decorated_server.listen()
})

beforeEach(async () => {
  // clear any mocks made by the previous test
  await apiMocker.resetHandlers()
})

afterAll(async () => {
  // Clean up
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await apiMocker.close()
  await mongo.stop()
})

/// handle adding items to global scope (this only applies to test global scope)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      apiResponseMocker: SimpleResponseDecorator
    }
  }
}
