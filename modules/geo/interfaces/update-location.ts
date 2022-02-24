import { GeoPointsFields } from '../../../models'
import { GeoLocationFields } from '../../../models/geo/geo-locations'

interface CreateGeoPoint {
  type: GeoPointsFields['type']
  coordinates: GeoPointsFields['coordinates']
}

export interface GeoUpdateLocationInterface {
  name?: GeoLocationFields['name']
  geo_point?: CreateGeoPoint | string
  type?: GeoLocationFields['type']
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

  contact_number?: string
  email?: string
}
