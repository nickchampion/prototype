/* eslint-disable @typescript-eslint/no-var-requires */
import { LibraryImplementationError } from '../errors'
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
})

it('should lookup one reg number and return the mocked data', async () => {
  const { url, mockDvlaResponse } = setup_env
  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const { dvlaLookupOne } = require('../index')

  const result = await dvlaLookupOne('rg12lls')

  expect(result).toBeDefined()
  expect(result.colour).toBe('BLUE')
})

it('should lookup multiple reg numbers and return the mocked data', async () => {
  const { url, mockDvlaResponse } = setup_env
  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const { dvlaLookupMany } = require('../index')

  const result = await dvlaLookupMany(['rg12lls', 'll12lls'])

  expect(result.length).toBe(2)
  expect(result[0].colour).toBe('BLUE')
})

it('should throw a library implementation error when wrong data is passed', async () => {
  const { url, mockDvlaResponse } = setup_env
  global.apiResponseMocker.post({ url, response_data: mockDvlaResponse })
  const { dvlaLookupMany } = require('../index')

  try {
    await dvlaLookupMany([1212])
  } catch (e) {
    expect(e).toBeInstanceOf(LibraryImplementationError)
    return
  }
  throw new Error('test failed to throw on incorrect data')
})
