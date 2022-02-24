/* eslint-disable @typescript-eslint/no-var-requires */
import axios from 'axios'

const setup_env = (() => {
  const url = 'https://www.fakeDVLA.com'

  process.env.DVLA_VEHICLE_KEY = '123'

  const mockDvlaResponse = {
    artEndDate: '2025-02-28',
    co2Emissions: 135,
    colour: 'BLUE',
    engineCapacity: 2494,
    fuelType: 'PETROL',
    make: 'ROVER',
    markedForExport: false,
    monthOfFirstRegistration: '2004-12',
    motStatus: 'No details held by DVLA',
    registrationNumber: 'ABC1234',
    revenueWeight: 1640,
    taxDueDate: '2007-01-01',
    taxStatus: 'Untaxed',
    typeApproval: 'N1',
    wheelplan: 'NON STANDARD',
    yearOfManufacture: 2004,
    euroStatus: 'EURO 6 AD',
    realDrivingEmissions: '1',
    dateOfLastV5CIssued: '2016-12-25'
  }
  process.env.DVLA_VEHICLE_URL = url

  return { url, mockDvlaResponse }
})()

beforeAll(() => {
  const { url } = setup_env
  process.env.DVLA_VEHICLE_URL = url

  require('../constants').DVLA_VEHICLE_URL
  require('../querying').queryDvlaApi
})

it('querys api with correct headers, env url and data ', async () => {
  const { url, mockDvlaResponse } = setup_env

  const queryDvlaApi = require('../querying').queryDvlaApi
  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const spy = jest.spyOn(axios, 'post')

  let queryUrl
  let queryHeader
  let queryBody

  spy.mockImplementationOnce((url, data) => {
    queryUrl = url
    queryBody = data
    queryHeader = spy.mock.calls[0][2].headers

    return axios.post(url, data)
  })

  const regNumber = 'AB12LEW'
  await queryDvlaApi(regNumber)

  expect(queryUrl).toBe(url)
  expect(queryBody.registrationNumber).toBe(regNumber)
  expect(queryHeader['x-api-key']).toBeDefined()
})
