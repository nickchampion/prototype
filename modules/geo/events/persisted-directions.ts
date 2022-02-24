import { BaseEvent } from '../base-event'
import { Types } from 'mongoose'
import { GeoEvents } from '../../../enumerations'

export interface GeoPersistedDirectionsEvent extends BaseEvent {
  detail_type: GeoEvents.geo_persisted_directions
  detail: {
    OCC_version: number
    geo_direction_id: Types.ObjectId
    history_id: Types.ObjectId
    previous_event: BaseEvent['detail']['previous_event']
  }
}
