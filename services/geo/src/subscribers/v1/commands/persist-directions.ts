import {
  GeoDirections,
  TRCreatedEvent,
  HistoryStatus,
  History,
  HistoryFields,
  GeoPersistedDirectionsEvent,
  GeoEvents,
  Event
} from '@hectare/core'
import { logger } from '@hectare/core'

// When a tr is made and directions exist on it flag tp persist the directions else clean them up after 24 hours
export const persist_direction = async (event: TRCreatedEvent): Promise<void> => {
  try {
    logger.info('Persisting directions :>>')

    if (!event.detail.transport_directions_id) return
    const geo_direction = await GeoDirections.findById(event.detail.transport_directions_id)

    // check if they have the flag, if there registered skip here
    if (!geo_direction) return

    const history_data: HistoryFields = {
      type: HistoryStatus.updated,
      data: { event }
    }

    const history = new History(history_data)
    await history.save()

    geo_direction.flags.persist = true
    await geo_direction.save()

    const new_event = new Event<GeoPersistedDirectionsEvent>()
    await new_event.publish([
      {
        detail_type: GeoEvents.geo_persisted_directions,
        detail: {
          OCC_version: geo_direction.__v,
          geo_direction_id: geo_direction.id,
          history_id: history.id,
          previous_event: event
        }
      }
    ])

    logger.info('Directions persisted :>>')
  } catch (e) {
    logger.error(e)
  }
}
