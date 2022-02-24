/* eslint-disable @typescript-eslint/no-var-requires */
import { Lookup } from '../../../models/lookup'

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

it('gathers data for reg numbers', async () => {
  const { url, mockDvlaResponse } = setup_env

  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const gatherData = require('../data-handling').gatherData

  const reg_number = 'AB12 LEW'
  const gatheredData = await gatherData([reg_number, reg_number])

  expect(gatheredData.length).toBe(2)
  expect(gatheredData[0].colour).toBe(mockDvlaResponse.colour)
})

it('persists data in mongo from the lookup', async () => {
  const { url, mockDvlaResponse } = setup_env

  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const gatherData = require('../data-handling').gatherData

  const reg_number = 'AB12LEW'
  await gatherData([reg_number, reg_number])

  const foundData = await Lookup.findOne({ 'request.reg_number': reg_number })

  expect(foundData).not.toBeNull()
  expect(foundData.response['vehicle_data']['colour']).toBe(mockDvlaResponse.colour)
})

it('should use mongo db to lookup the data on the second attempt', async () => {
  const { url, mockDvlaResponse } = setup_env

  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const gatherData = require('../data-handling').gatherData

  const reg_number = 'AB12LEW'
  await gatherData([reg_number])

  const spy = jest.spyOn(Lookup, 'find')
  let result_of_second_gather
  spy.mockImplementationOnce(args => {
    result_of_second_gather = Lookup.find(args)
    return result_of_second_gather
  })
  const second_gather = await gatherData([reg_number])

  const completed_gather_promise = await result_of_second_gather

  expect(completed_gather_promise[0].response.vehicle_data.colour).toBe('BLUE')
  expect(second_gather[0]).toBeDefined()
})
