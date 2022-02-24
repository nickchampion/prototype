import { GeoPointsFields } from '../../../models'
import { GeoLocationFields } from '../../../models/geo/geo-locations'
interface CreateGeoPoint {
  type: GeoPointsFields['type']
  coordinates: GeoPointsFields['coordinates']
}
export type GeoCreateLocationInterface =
  | GeoCreateLocationWithAddressInterface
  | GeoCreateLocationWithCoordinatesInterface
  | GeoCreateLocationWithWhatThreeWordsInterface

export interface GeoCreateLocationWithWhatThreeWordsInterface {
  name: GeoLocationFields['name']
  what_3_words: GeoLocationFields['what_3_words']
  geo_points: CreateGeoPoint[]
  type: GeoLocationFields['type']
  country_code: GeoLocationFields['country_code']

  legal_id?: GeoLocationFields['legal_id']
  building_name?: GeoLocationFields['building_name']
  line_1?: GeoLocationFields['line_1']
  line_2?: GeoLocationFields['line_2']
  code?: GeoLocationFields['code']
  locality?: GeoLocationFields['locality']
  region?: GeoLocationFields['region']
  nation?: GeoLocationFields['nation']
  facilities?: GeoLocationFields['facilities']
  flags?: GeoLocationFields['flags']

  contact_number?: string
  email?: string
}

export interface GeoCreateLocationWithCoordinatesInterface {
  name: GeoLocationFields['name']
  geo_points: CreateGeoPoint[]
  type: GeoLocationFields['type']

  country_code?: GeoLocationFields['country_code']
  what_3_words?: GeoLocationFields['what_3_words']
  legal_id?: GeoLocationFields['legal_id']
  building_name?: GeoLocationFields['building_name']
  line_1?: GeoLocationFields['line_1']
  line_2?: GeoLocationFields['line_2']
  code?: GeoLocationFields['code']
  locality?: GeoLocationFields['locality']
  region?: GeoLocationFields['region']
  nation?: GeoLocationFields['nation']
  facilities?: GeoLocationFields['facilities']
  flags?: GeoLocationFields['flags']

  contact_number?: string
  email?: string
}

export interface GeoCreateLocationWithAddressInterface {
  name: GeoLocationFields['name']
  geo_points: CreateGeoPoint[]
  type: GeoLocationFields['type']
  country_code: GeoLocationFields['country_code']

  what_3_words?: GeoLocationFields['what_3_words']
  legal_id?: GeoLocationFields['legal_id']
  building_name?: GeoLocationFields['building_name']
  line_1?: GeoLocationFields['line_1']
  line_2?: GeoLocationFields['line_2']
  code?: GeoLocationFields['code']
  locality?: GeoLocationFields['locality']
  region?: GeoLocationFields['region']
  nation?: GeoLocationFields['nation']
  facilities?: GeoLocationFields['facilities']
  flags?: GeoLocationFields['flags']

  contact_number?: string
  email?: string
}

export const isCoordinateInterface = (body): body is GeoCreateLocationWithCoordinatesInterface => {
  return body.name && body.geo_points.length > 0 && body.type && !body.country_code
}

export const isWhatThreeWordsInterface = (body): body is GeoCreateLocationWithWhatThreeWordsInterface => {
  return body.name && body.geo_points.length > 0 && body.type && body.what_3_words && body.country_code
}
