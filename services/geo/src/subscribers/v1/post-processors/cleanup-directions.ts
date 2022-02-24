import { GeoDirections } from '@hectare/core'
import { EventHandler, GeoPersistedDirectionsEvent, logger } from '@hectare/core'
import dayjs from 'dayjs'

// When a tr is made and directions exist on it flag tp persist the directions else clean them up after 24 hours
const cleanup_directions = async (): Promise<void> => {
  try {
    logger.info('Removing old directions :>>')

    const end_of_today = dayjs().endOf('day').toISOString()

    await GeoDirections.deleteMany({
      'flags.persist': false,
      lte: { created_at: end_of_today }
    })

    logger.info('Directions removed :>>')
  } catch (e) {
    logger.error(e)
  }
}

class Listener extends EventHandler<any> {
  async handle_event(event: any): Promise<void> {
    return await cleanup_directions()
  }
}

const listener = new Listener()

export const process_event = listener.createEventProcessor()
