import { BaseEvent } from '../base-event'
import { Types } from 'mongoose'
import { GeoEvents } from '../../../enumerations'

export interface GeoRegisteredOwnerChanged extends BaseEvent {
  detail_type: GeoEvents.geo_location_registered_owner_changed
  detail: {
    OCC_version: number
    profile_application_ids: Types.ObjectId[]
    profile_id: Types.ObjectId
    history_id: Types.ObjectId
  }
}
