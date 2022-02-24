import axios from 'axios'
import { encodeBase64 } from 'bcryptjs'
import { stringify } from 'qs'
import { StatusEnum } from '../../enumerations'
import { QuoteStatusSortingMap } from '../../models'
import { Lookup, LookupTypes, LookupFields, LookupDoc } from '../../models/lookup'
import { logger } from '../../utils'

export interface MapBoxLookupResponseInterface {
  line_1?: string
  code?: string
  locality?: string
  region?: string
  nation?: string
}

export const mapBoxLookup = async (longitude, latitude) => {
  const request_data = {
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
    params: {
      access_token: 'pk.eyJ1IjoiaGVjdGFyZSIsImEiOiJja2xmYjR0Y2cwbXRsMm5wMDB0aDl0N2c0In0.tmFwXvOHidBPTF8LDic25w'
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  const lookup = await Lookup.findOne({ type: LookupTypes.map_box, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response
  }

  const map_box_res = await axios.get(request_data.url, { params: request_data.params })

  const map_box_data = map_box_res.data.features.reduce((return_obj, field) => {
    const field_name = field.id.split('.')[0]
    return_obj[field_name] = field.text
    return return_obj
  }, {})

  const response_fields = {
    line_1: map_box_data?.text,
    // chain other types here
    code: map_box_data?.postcode,
    locality: map_box_data?.place,
    region: map_box_data?.district,
    nation: map_box_data?.region
  }

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.map_box,
    request: { url: request_full_path },
    response: response_fields
  }

  const new_lookup_record: LookupDoc = new Lookup(lookup_data)
  await new_lookup_record.save()

  return new_lookup_record.response
}

export enum MapboxProfileTypes {
  driving = 'driving',
  driving_traffic = 'driving-traffic'
}

export interface DirectionParamFields {
  steps?: boolean
  geometries?: string
  max_height?: number
  max_width?: number
}

export interface DistanceParamFields {
  annotations?: string
  sources?: number
  destinations?: string
}

const MAPBOX_TRAFFIC_MAX_COORDS = 3
const ZERO_BASED = 1

export const mapBoxDirections = async (profile, coordinates, params) => {
  // Traffic is only supported for 3 or less location coords
  if (
    coordinates.length + ZERO_BASED > MAPBOX_TRAFFIC_MAX_COORDS &&
    profile === MapboxProfileTypes.driving_traffic
  ) {
    profile = MapboxProfileTypes.driving
  }

  const request_data = {
    url: `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}`,
    params: {
      access_token: 'pk.eyJ1IjoiaGVjdGFyZSIsImEiOiJja2xmYjR0Y2cwbXRsMm5wMDB0aDl0N2c0In0.tmFwXvOHidBPTF8LDic25w',
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

  const lookup = await Lookup.findOne({ type: LookupTypes.map_box, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response
  }

  const mapbox_res = await axios.get(request_data.url, {
    params: request_data.params
  })

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.map_box,
    request: { url: request_full_path },
    response: mapbox_res.data
  }

  const new_lookup_record: LookupDoc = new Lookup(lookup_data)
  await new_lookup_record.save()

  return mapbox_res.data
}

export const mapBoxDistances = async (
  profile: MapboxProfileTypes,
  coordinates: string,
  params: DistanceParamFields
): Promise<Record<string, unknown>> => {
  // Traffic is only supported for 3 or less location coords
  if (
    coordinates.length + ZERO_BASED > MAPBOX_TRAFFIC_MAX_COORDS &&
    profile === MapboxProfileTypes.driving_traffic
  ) {
    profile = MapboxProfileTypes.driving
  }

  const request_data = {
    url: `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coordinates}`,
    params: {
      access_token: 'pk.eyJ1IjoiaGVjdGFyZSIsImEiOiJja2xmYjR0Y2cwbXRsMm5wMDB0aDl0N2c0In0.tmFwXvOHidBPTF8LDic25w',
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

  const lookup = await Lookup.findOne({ type: LookupTypes.map_box, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response
  }

  const mapbox_res = await axios.get(request_data.url, {
    params: request_data.params
  })

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.map_box,
    request: { url: request_full_path },
    response: mapbox_res.data
  }

  const new_lookup_record: LookupDoc = new Lookup(lookup_data)
  await new_lookup_record.save()

  return mapbox_res.data
}

export const mapBoxStaticImage = async (style, overlay, params, size) => {
  const request_data = {
    url: `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${encodeURIComponent(
      overlay
    )}/${params}/${size}`,
    params: {
      access_token: 'pk.eyJ1IjoiaGVjdGFyZSIsImEiOiJja2xmYjR0Y2cwbXRsMm5wMDB0aDl0N2c0In0.tmFwXvOHidBPTF8LDic25w',
      logo: false,
      attribution: false
    }
  }

  const request_full_path = axios.getUri({
    url: request_data.url,
    params: request_data.params,
    paramsSerializer: params => {
      return stringify(params)
    }
  })

  const lookup = await Lookup.findOne({ type: LookupTypes.map_box, 'request.url': request_full_path })
  if (lookup) {
    return lookup.response
  }

  const mapbox_res = await axios.get(request_data.url, {
    responseType: 'arraybuffer',
    params: request_data.params
  })

  const image = Buffer.from(mapbox_res.data).toString('base64')
  const type = mapbox_res.headers['content-type']

  const lookup_data: LookupFields = {
    status: StatusEnum.live,
    type: LookupTypes.map_box,
    request: { url: request_full_path },
    response: { type, image }
  }

  const new_lookup_record: LookupDoc = new Lookup(lookup_data)
  await new_lookup_record.save()

  return { type, image }
}
