// Reference DVLA Documentation:  https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/v1.1.0-vehicle-enquiry-service.html
import { DVLA_VEHICLE_KEY, DVLA_VEHICLE_URL } from './constants'
import { prepareMultiRegistrationData, prepareSingleRegistrationData, gatherData } from './data-handling'
import { queryOneMongo, queryDvlaApi } from './querying'
import { LibraryImplementationError, errorHandler } from './errors'
import { DvlaVehicleData } from './interfaces/v1/dvla-vehicle-data.interface'

export const dvlaLookupMany = async (registrationData: string[]): Promise<DvlaVehicleData[]> => {
  try {
    if (!DVLA_VEHICLE_URL || !DVLA_VEHICLE_KEY) {
      throw new LibraryImplementationError('Missing DVLA environment variables')
    }

    const prepared_registration_data = prepareMultiRegistrationData(registrationData)
    const vehicle_data_array = await gatherData(prepared_registration_data)

    return Promise.resolve(vehicle_data_array)
  } catch (e) {
    errorHandler(e)
  }
}

/*
  Query a single registration number
*/
export const dvlaLookupOne = async (registrationData: string): Promise<DvlaVehicleData> => {
  try {
    if (!DVLA_VEHICLE_URL || !DVLA_VEHICLE_KEY) {
      throw new LibraryImplementationError('Missing DVLA environment variables')
    }

    const prepared_registration_number = prepareSingleRegistrationData(registrationData)

    const existing_registration = await queryOneMongo(prepared_registration_number)
    if (existing_registration) {
      return existing_registration
    }
    return queryDvlaApi(registrationData)
  } catch (e) {
    errorHandler(e)
  }
}
