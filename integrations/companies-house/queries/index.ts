import axios from 'axios'
import snakeCaseKeys from 'snakecase-keys'
import { Lookup, LookupTypes } from '../../../models/lookup'
import { errorHandler, LibraryImplementationError } from '../errors'

const API_URL = process.env.COMPANIES_HOUSE_URL
const API_KEY = process.env.COMPANIES_HOUSE_KEY

const headers = {
  authorization: `Basic ${API_KEY}`
}

const checkEnv = () => {
  if (!API_URL || !API_KEY) {
    throw new LibraryImplementationError('Missing COMPANIES HOUSE environment variables')
  }
}

const loadFromPersistStore = async (
  company_number: string,
  resource: string
): Promise<Record<string, unknown>> => {
  try {
    const result = await Lookup.findOne({
      type: LookupTypes.companies_house,
      'request.company_number': company_number,
      'request.resource': resource
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
      type: LookupTypes.companies_house,
      request,
      response: snakeCaseKeys(response, { deep: true })
    })
  } catch (error) {
    return undefined
  }
}

const fetchFromAPI = async (company_number: string, resource: string): Promise<Record<string, unknown>> => {
  try {
    let url = `${API_URL}/company/${company_number}`
    if (resource !== 'profile') {
      url = `${API_URL}/company/${company_number}/${resource}`
    }
    const response = await axios.get(`${url}`, { headers })
    return response.data
  } catch (error) {
    errorHandler(error, resource)
    return undefined
  }
}

export const fetchResource = async (
  company_number: string,
  resource: string
): Promise<Record<string, unknown>> => {
  checkEnv()
  let result = await loadFromPersistStore(company_number, resource)
  if (!result) {
    result = await fetchFromAPI(company_number, resource)
    if (!result) {
      await saveToPersistStore({ company_number, resource }, result)
    }
  }
  return result
}

export const fetchResourceList = async (
  company_number: string,
  resource: string,
  params?: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  checkEnv()
  try {
    if (params)
      return (await axios.get(`${API_URL}/company/${company_number}/${resource}`, { headers, params })).data
    return (await axios.get(`${API_URL}/company/${company_number}/${resource}`, { headers })).data
  } catch (error) {
    errorHandler(error, resource)
    return undefined
  }
}

export const search = async (
  term: string,
  options?: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  checkEnv()
  let params = {
    q: term
  }
  if (options) {
    params = { ...params, ...options }
  }
  try {
    return (
      await axios.get(`${API_URL}/search/companies`, {
        headers,
        params
      })
    ).data
  } catch (error) {
    errorHandler(error, 'search')
    return undefined
  }
}
