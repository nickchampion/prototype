import { EventHandler } from '@hectare/platform.components.context'
import { AssetCreatedEvent } from '../events'

export const asset_created: EventHandler = async (context): Promise<void> => {
  const event = context.event.payload as AssetCreatedEvent
  console.log(event)
}

/**
 * All event handlers exported by the assets module
 */
export const event_handlers = {
  asset_created
}
