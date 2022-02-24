import { BaseEvent } from '../base-event'
import { GeoEvents } from '../../../enumerations'
import { ObjectId } from 'mongoose'

export interface GeoLiveTrackingCreatedEvent extends BaseEvent {
  detail_type: GeoEvents.geo_live_tracking_created
  detail: {
    OCC_version: number
    location_id: ObjectId
  }
}

export interface GeoLiveTrackingStaleEvent extends BaseEvent {
  detail_type: GeoEvents.geo_live_tracking_stale
  detail: {
    OCC_version: number
    location_id: ObjectId
  }
}

export interface GeoLocationDebugLogCreatedEvent extends BaseEvent {
  detail_type: GeoEvents.geo_location_debug_log_created
  detail: {
    OCC_version: number
    log_id: ObjectId
  }
}
