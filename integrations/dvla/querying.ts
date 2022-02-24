import axios from 'axios'
import { Lookup, LookupDoc, LookupTypes } from '../../models/lookup'
import { DVLA_VEHICLE_KEY, DVLA_VEHICLE_URL } from './constants'
import { errorHandler } from './errors/error-handler'
import { DvlaVehicleData } from './interfaces/v1/dvla-vehicle-data.interface'
import snakeCaseKeys from 'snakecase-keys'
/*
  Query Dvla API for a single reg number, persist result
*/
export const queryDvlaApi = async (reg_number: string): Promise<DvlaVehicleData> => {
  const data = {
    registrationNumber: reg_number
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': DVLA_VEHICLE_KEY
  }

  // header breaks postman mock server.
  // if (process.env.STAGE === 'local' && !process.env.DVLA_VEHICLE_KEY) {
  //   delete headers['x-api-key']
  // }

  let vehicle_data: DvlaVehicleData
  try {
    const response = await axios.post(DVLA_VEHICLE_URL, data, {
      headers: { ...headers }
    })
    vehicle_data = response.data
  } catch (e) {
    // add reg_number incase of DVLA 404 (does not include requested reg)
    errorHandler(e, reg_number)
  }

  // Persist new data
  const lookupData = {
    type: LookupTypes.dvla,
    request: {
      reg_number
    },
    response: {
      vehicle_data: snakeCaseKeys(vehicle_data, { deep: true })
    }
  }

  // persist data, update if already exists for some reason.
  await Lookup.findOneAndUpdate(
    { type: lookupData.type, 'request.reg_number': lookupData.request.reg_number },
    lookupData,
    { upsert: true }
  )
  return vehicle_data
}

/*
    Query Mongoose for a single reg number
  */
export const queryOneMongo = async (reg_number: string): Promise<DvlaVehicleData> => {
  // find subdocument that contains reg number;
  const lookup = await Lookup.findOne({ type: LookupTypes.dvla, 'request.reg_number': reg_number }).lean()
  if (!lookup) {
    return null
  }
  return lookup.response.vehicle_data
}

// Add extra field to returned mongo doc from projection
export interface ProjectedLookup extends LookupDoc {
  vehicle_data: DvlaVehicleData
}

/*
  Optimised Query mongoose for multiple records
*/
export const queryManyMongo = async (reg_numbers: string[]): Promise<DvlaVehicleData[]> => {
  const lookups: ProjectedLookup[] = await Lookup.find({
    type: LookupTypes.dvla,
    'request.reg_number': reg_numbers
  }).lean()

  // TODO: issue with aggregation pipeline, will revisit
  //     { vehicle_data: '$response.vehicle_data', _id: 0 }

  return lookups.map(lookup => {
    return lookup.response.vehicle_data
  })
}
