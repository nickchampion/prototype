import {
  EventHandler,
  EventUnhandledError,
  GeoEvents,
  BaseEvent,
  connectToMongoose,
  wrapWithSentry
} from '@hectare/core'
import { changeLocationOwner } from './change-locations-registered-owner'

// event handler table
const event_handlers = {
  [GeoEvents.geo_location_registered_owner_changed]: changeLocationOwner
}

const eventHandler = async (event: BaseEvent): Promise<void> => {
  const detail_type = event['detail-type']
  if (!detail_type) throw new EventUnhandledError('no detail type detected')
  if (event_handlers[detail_type]) {
    await connectToMongoose()
    await event_handlers[detail_type](event)
  } else throw new EventUnhandledError(detail_type)
  return Promise.resolve()
}

export const handler = wrapWithSentry(eventHandler)
class AuthSubscriber extends EventHandler<BaseEvent> {
  async handle_event(event: BaseEvent): Promise<void> {
    return await handler(event)
  }
}

const subscriber = new AuthSubscriber()
export const process_event = subscriber.createEventProcessor()
