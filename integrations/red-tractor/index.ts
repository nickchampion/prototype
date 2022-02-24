import { createClientAsync } from 'soap'
import snakecaseKeys from 'snakecase-keys'
import { Lookup, LookupTypes } from '../../models'
import { LibraryImplementationError } from './errors'

const REF_LIVESTOCK = process.env.RT_REF_LIVESTOCK
const REF_CROPS = process.env.RT_REF_CROPS
const WSDL_LINK = process.env.RT_WSDL_LINK
// TODO need to revisit this
const USERNAME = process.env.RT_USERNAME
const PASSWORD = process.env.RT_PASSWORD

const checkEnvVariables = () => {
  if (!REF_LIVESTOCK || !REF_CROPS || !WSDL_LINK || !USERNAME || !PASSWORD) {
    throw new LibraryImplementationError('Missing Environment variable')
  }
}

const loadFromPersistStore = async (membership_id: string): Promise<Record<string, unknown>> => {
  try {
    const result = await Lookup.findOne({
      type: LookupTypes.red_tractor,
      'request.membership_id': membership_id
    }).lean()
    return result.response
  } catch (error) {
    return undefined
  }
}

const saveToPersistStore = async (
  request: Record<string, unknown>,
  response: Record<string, unknown>
): Promise<void> => {
  try {
    await Lookup.findOneAndUpdate({
      type: LookupTypes.red_tractor,
      request,
      response: snakecaseKeys(response, { deep: true })
    })
  } catch (error) {
    return undefined
  }
}

const fetchFromRedTractor = async (membership_id: string): Promise<Record<string, unknown>> => {
  try {
    const client = await createClientAsync(WSDL_LINK)
    const result = await client.getDataAsyncgetDataAsync({
      wrapper: {
        attributes: {
          id: 'silo'
        },
        authentication: {
          username: USERNAME,
          password: PASSWORD
        },
        request: [
          {
            scheme: {
              attributes: {
                ref: REF_LIVESTOCK
              }
            },
            membershipnumber: membership_id
          },
          {
            scheme: {
              attributes: {
                ref: REF_CROPS
              }
            },
            membershipnumber: membership_id
          }
        ]
      }
    })
    return result[0].wrapper.response
  } catch (error) {
    throw new LibraryImplementationError(`Failed to connect to Red Tractor API: ${error.message}`)
  }
}

/**
 * Fetches membership data based on crop and livestock reference.
 * Returns array of 2 membership if both references apply; one if only one; undefined if membership was not found or none apply.
 * @param {string} membership_id
 * @returns {array||object} membership data
 * @throws {LibraryImplementationError} on failure to connect to Red Tractor API or missing env variables
 */
export const getData = async (membership_id: string): Promise<Record<string, unknown>> => {
  checkEnvVariables()
  let result = await loadFromPersistStore(membership_id)
  if (!result) {
    result = await fetchFromRedTractor(membership_id)
    if (!result) {
      await saveToPersistStore({ membership_id }, result)
    }
  }
  return result
}
