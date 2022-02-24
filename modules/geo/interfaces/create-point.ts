import { GeoPointsFields } from '../../../models/geo/geo-points'

export interface GeoCreateGeoPointInterface {
  name: GeoPointsFields['name']
  parent?: GeoPointsFields['parent']
  coordinates: GeoPointsFields['coordinates']
  what_3_words?: GeoPointsFields['what_3_words']
  country_code: GeoPointsFields['country_code']
  type: GeoPointsFields['type']
}
