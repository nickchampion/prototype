import {
  HistoryStatus,
  History,
  HistoryFields,
  GeoEvents,
  Event,
  GeoCreateDirectionsEvent,
  GeoDirectionsCreatedEvent
} from '@hectare/core'
import { logger, GeoDirectionsFields, GeoDirectionsDoc } from '@hectare/core'
import { gatherAndStoreRouteDirections } from '../../../api/v1/geo-routing/get'

// When a tr is made and directions exist on it flag tp persist the directions else clean them up after 24 hours
export const create_directions = async (event: GeoCreateDirectionsEvent): Promise<void> => {
  try {
    logger.info('Creating directions :>>')
    const directions = await gatherAndStoreRouteDirections({ ...event.detail.geo_direction_data, persist: true })

    /// remove legs and geometry duo to massive data payload
    directions.routes.forEach(route => {
      delete route.geometry
      delete route.legs
    })

    const history_data: HistoryFields = {
      type: HistoryStatus.updated,
      data: { directions }
    }

    const history = new History(history_data)
    await history.save()

    const new_event = new Event<GeoDirectionsCreatedEvent>()
    await new_event.publish([
      {
        detail_type: GeoEvents.geo_directions_created,
        detail: {
          OCC_version: directions.__v,
          geo_directions: directions,
          history_id: history.id,
          previous_event: event
        }
      }
    ])

    logger.info('Directions Created :>>')
  } catch (e) {
    logger.error(e)
  }
}
