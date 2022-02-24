import { queryManyMongo, queryDvlaApi } from './querying'
import { LibraryImplementationError } from './errors'

/*
  Prepare single reg number
*/
export const prepareSingleRegistrationData = (registrationData: string): string => {
  if (typeof registrationData !== 'string') {
    throw new LibraryImplementationError(`Invalid format, recieved:${typeof registrationData}. expected string `)
  }

  const valid_registration_number = /([A-Z]){2}([0-9]){2}(\s)?([A-Z]){3}/i

  if (typeof registrationData !== 'string' || !valid_registration_number.test(registrationData)) {
    throw new LibraryImplementationError(
      `invalid Registration number provided recieved: ${registrationData} expected string matching format "AB12 CDE"`
    )
  }

  return registrationData.replace(/\s/, '')
}

/*
  Prepare multiple reg numbers
*/
export const prepareMultiRegistrationData = (registrationData: string[]): string[] => {
  if (!Array.isArray(registrationData)) {
    throw new LibraryImplementationError(`Invalid format, recieved:${typeof registrationData}. expected [string]`)
  }

  const registration_data_formatted = registrationData.map(regNumber => {
    return prepareSingleRegistrationData(regNumber)
  })

  return registration_data_formatted
}

/*
  Aggregate multi lookup data.
*/
export const gatherData = async (regNumbers: string[]): Promise<Record<string, unknown>[]> => {
  let vehicle_data_array = []

  const persisted_registration_data = await queryManyMongo(regNumbers)

  vehicle_data_array = [...persisted_registration_data]

  // gather all the numbers missing from mongo
  if (persisted_registration_data.length !== regNumbers.length) {
    const outstanding_registration_numbers = regNumbers.filter(regNumber => {
      // check persisted data does not contain any matching reg numbers
      return !persisted_registration_data.some(existingRegistration => {
        return existingRegistration?.registrationNumber === regNumber
      })
    })

    const outstanding_registration_data = await Promise.all(
      outstanding_registration_numbers.map(async regNumber => {
        return queryDvlaApi(regNumber)
      })
    )
    vehicle_data_array = [...persisted_registration_data, ...outstanding_registration_data]
  }

  return vehicle_data_array
}
