import axios from 'axios'
import { stringify } from 'qs'
import snakecaseKeys from 'snakecase-keys'
import { StatusEnum } from '../../enumerations'
import { Lookup, LookupTypes, LookupFields } from '../../models/lookup'
import { toSnake, logger } from '../../utils'

export const loqateCountryLookup = async (longitude: number, latitude: number): Promise<unknown> => {
  const request_data = {
    url: 'https://api.addressy.com/Geocoding/International/PositionToCountry/v1/json3.ws',
    params: {
      Key: 'DR39-WC29-ZC99-NY61',
      Longitude: longitude,
      Latitude: latitude
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  logger.debug({ message: 'loqateCountryLookup: request_full_path', request_full_path })

  const lookup = await Lookup.findOne({ type: LookupTypes.loqate, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response?.CountryIso3 || {}
  }

  const loqate_res = await axios.get(request_full_path)

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.loqate,
    request: { url: request_full_path },
    response: loqate_res.data.Items[0] || {}
  }

  const new_lookup_record = new Lookup(lookup_data)
  await new_lookup_record.save()

  // LOQUATE has iso 2 and 3 mixed up
  return new_lookup_record.response.CountryIso3
}

export const loqateAddressLookup = async (longitude: number, latitude: number): Promise<unknown> => {
  const request_data = {
    url: 'https://api.addressy.com/Geocoding/International/ReverseGeocode/v2/json3.ws',
    params: {
      Key: 'DR39-WC29-ZC99-NY61',
      Longitude: longitude,
      Latitude: latitude
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  logger.debug({ message: 'loqateAddressLookup: request_full_path', request_full_path })

  const lookup = await Lookup.findOne({ type: LookupTypes.loqate, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response
  }

  const loqate_res = await axios.get(request_full_path)

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.loqate,
    request: { url: request_full_path },
    response: loqate_res.data.Items[0] || {}
  }

  const new_lookup_record = new Lookup(lookup_data)
  await new_lookup_record.save()

  // LOQUATE has iso 2 and 3 mixed up
  return new_lookup_record.response
}

export const loqateAddressSearch = async (
  params: Record<string, unknown> = {
    Countries: 'GBR',
    Limit: 25,
    Language: 'en-gb',
    Container: ''
  }
): Promise<unknown> => {
  const request_data = {
    url: 'https://api.addressy.com/Capture/Interactive/Find/v1.1/json3.ws',
    params: {
      Key: 'DR39-WC29-ZC99-NY61',
      IsMiddleware: true,
      ...params
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  logger.debug({ message: 'loqateAddressSearch: request_full_path', request_full_path })

  const response = await axios.get(request_full_path)

  // convert loqate camelCase to snake_case
  const parsed = snakecaseKeys(response.data, { deep: true })
  return parsed
}

export const loqateAddressRetrieve = async (params: Record<string, unknown>): Promise<unknown> => {
  const request_data = {
    url: 'https://api.addressy.com/Capture/Interactive/Retrieve/v1/json3.ws?Field1Format={Latitude}&Field2Format={Longitude}',
    params: {
      Key: 'DR39-WC29-ZC99-NY61',
      ...params
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  logger.debug({ message: 'loqateAddressRetrieve: request_full_path', request_full_path })

  const lookup = await Lookup.findOne({ type: LookupTypes.loqate, 'request.url': request_full_path })
  if (lookup) {
    logger.debug({
      message: 'found_lookup',
      lookup_response: lookup.response
    })
    return lookup.response
  }

  const response = await axios.get(request_full_path)

  // TODO error checking
  // convert loqate camelCase to snake_case
  const parse_response = snakecaseKeys(response.data, { deep: true })
  const fields = parse_response['items'][0]

  // store coordinates and remove temp fields
  fields.location = {
    type: 'Point',
    coordinates: [Number(fields.field2), Number(fields.field1)]
  }
  delete fields.field1
  delete fields.field2

  // normalise data
  fields.region = fields.province_name
  fields.region_code = fields.province_code
  fields.locality = fields.city

  // extract remove container id from fields
  const { id, ...reduced_fields } = fields
  // save container id for response
  let response_fields = null
  response_fields = { id }
  for (const key of Object.keys(reduced_fields)) {
    const snake_key = toSnake(key, { handle_numbers: true })
    if (reduced_fields[key] !== '') response_fields[snake_key] = fields[key]
  }

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.loqate,
    request: { url: request_full_path },
    response: response_fields
  }

  const new_lookup_record = new Lookup(lookup_data)
  await new_lookup_record.save()

  logger.debug({
    message: 'response_fields',
    response_fields
  })

  // LOQUATE has iso 2 and 3 mixed up
  return response_fields
}

export const loqateEmailLookup = async (email: string): Promise<unknown> => {
  const request_data = {
    url: 'https://api.addressy.com/EmailValidation/Interactive/Validate/v2.00/json3.ws',
    params: {
      Key: 'DR39-WC29-ZC99-NY61',
      Email: email
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  logger.debug({ message: 'loqateEmailLookup: request_full_path', request_full_path })

  const lookup = await Lookup.findOne({ type: LookupTypes.loqate, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response
  }

  const new_lookup = await axios.get(request_full_path)

  const response = {
    identifier: new_lookup.data.Items[0].UserAccount,
    domain: new_lookup.data.Items[0].Domain,
    disposable: new_lookup.data.Items[0].IsDisposableOrTemporary,
    fraudulent: new_lookup.data.Items[0].IsComplainerOrFraudRisk,
    valid: new_lookup.data.Items[0].ResponseCode === 'Valid'
  }

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.loqate,
    request: { url: request_full_path },
    response: response
  }

  const new_lookup_record = new Lookup(lookup_data)
  await new_lookup_record.save()

  return response
}
