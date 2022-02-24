import request from 'supertest'
import {
  APIImplementationError,
  VehicleNotFoundError,
  TooManyRequests,
  DvlaServiceOutage,
  ForbiddenError
} from '../errors'
import { Api } from '../../../utils/api'

const setup = (() => {
  const api = new Api()
  const app = api.app

  const endpoint_url_error_implementation = '/error/Implementation'
  // register a route to force an error from
  api.router.get(endpoint_url_error_implementation, async () => {
    throw new APIImplementationError()
  })
  const endpoint_url_error_vehicle_not_found = '/error/vehicle_not_found'
  // register a route to force an error from
  api.router.post(endpoint_url_error_vehicle_not_found, async req => {
    const { regNumber } = req.body
    throw new VehicleNotFoundError(regNumber)
  })
  const endpoint_url_error_too_many_requests = '/error/too_many_requests'
  // register a route to force an error from
  api.router.get(endpoint_url_error_too_many_requests, async () => {
    throw new TooManyRequests()
  })
  const endpoint_url_error_service_outage = '/error/service_outage'
  // register a route to force an error from
  api.router.get(endpoint_url_error_service_outage, async () => {
    throw new DvlaServiceOutage()
  })
  const endpoint_url_error_forbidden = '/error/forbidden'
  // register a route to force an error from
  api.router.get(endpoint_url_error_forbidden, async () => {
    throw new ForbiddenError()
  })

  return {
    api,
    app,
    endpoint_url_error_implementation,
    endpoint_url_error_vehicle_not_found,
    endpoint_url_error_too_many_requests,
    endpoint_url_error_service_outage,
    endpoint_url_error_forbidden
  }
})()

it('should throw a implementation error which returns a 500', async () => {
  const { app, endpoint_url_error_implementation } = setup
  const response = await request(app)
    .get(endpoint_url_error_implementation)
    .set('x-platform-key', process.env.PLATFORM_KEY)
    .send()
    .expect(500)

  const errors = response.body.errors

  expect(response.body.status).toBe('error')
  expect(errors.length).toBe(1)
  expect(errors[0].message).toBe('Something went wrong')
})

it('should throw a VehicleNotFoundError error which returns a 500', async () => {
  const { app, endpoint_url_error_vehicle_not_found } = setup
  const response = await request(app)
    .post(endpoint_url_error_vehicle_not_found)
    .set('x-platform-key', process.env.PLATFORM_KEY)
    .send({ regNumber: 'AC12LLE' })
    .expect(500)

  const errors = response.body.errors

  expect(response.body.status).toBe('error')
  expect(errors.length).toBe(1)
  expect(errors[0].message).toBe('Something went wrong')
})

it('should throw a TooManyRequests error which returns a 500', async () => {
  const { app, endpoint_url_error_too_many_requests } = setup
  const response = await request(app)
    .get(endpoint_url_error_too_many_requests)
    .set('x-platform-key', process.env.PLATFORM_KEY)
    .send()
    .expect(500)

  const errors = response.body.errors

  expect(response.body.status).toBe('error')
  expect(errors.length).toBe(1)
  expect(errors[0].message).toBe('Something went wrong')
})

it('should throw a ServiceOutage error which returns a 500', async () => {
  const { app, endpoint_url_error_service_outage } = setup
  const response = await request(app)
    .get(endpoint_url_error_service_outage)
    .set('x-platform-key', process.env.PLATFORM_KEY)
    .send()
    .expect(500)

  const errors = response.body.errors

  expect(response.body.status).toBe('error')
  expect(errors.length).toBe(1)
  expect(errors[0].message).toBe('Something went wrong')
})

it('should throw a Forbidden error which returns a 500', async () => {
  const { app, endpoint_url_error_forbidden } = setup
  const response = await request(app)
    .get(endpoint_url_error_forbidden)
    .set('x-platform-key', process.env.PLATFORM_KEY)
    .send()
    .expect(500)

  const errors = response.body.errors

  expect(response.body.status).toBe('error')
  expect(errors.length).toBe(1)
  expect(errors[0].message).toBe('Something went wrong')
})
