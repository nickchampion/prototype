/* eslint-disable @typescript-eslint/no-var-requires */
import { prepareSingleRegistrationData, prepareMultiRegistrationData } from '../data-handling'
const setup = (() => {
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
  const { url } = setup
  process.env.DVLA_VEHICLE_URL = url
  require('../constants').DVLA_VEHICLE_URL
})

it('prepares a valid reg number for processing', async () => {
  const regNumber = 'AB12 LEW'
  const prepared = prepareSingleRegistrationData(regNumber)

  expect(prepared).toBe('AB12LEW')
})

it('prepares multiple reg numbers for processing', async () => {
  const regNumber = 'AB12 LEW'
  const prepared = prepareMultiRegistrationData([regNumber])
  expect(prepared[0]).toBe('AB12LEW')
})
