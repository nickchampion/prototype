import { BaseEvent } from '../base-event'
import { Types } from 'mongoose'
import { GeoEvents } from '../../../enumerations'
import { CreateGeoDirectionInterface } from '../interfaces/create-directions'

export interface GeoCreateDirectionsEvent extends BaseEvent {
  detail_type: GeoEvents.geo_create_directions
  detail: {
    OCC_version: number
    geo_direction_data: CreateGeoDirectionInterface
    history_id: Types.ObjectId
    previous_event: BaseEvent['detail']['previous_event']
  }
}
