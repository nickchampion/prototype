import { BaseEvent } from '../base-event'
import { Types } from 'mongoose'
import { GeoEvents } from '../../../enumerations'
import { GeoDirectionsDoc } from '../../../models'

export interface GeoDirectionsCreatedEvent extends BaseEvent {
  detail_type: GeoEvents.geo_directions_created
  detail: {
    OCC_version: number
    geo_directions: GeoDirectionsDoc
    history_id: Types.ObjectId
    previous_event: BaseEvent['detail']['previous_event']
  }
}
