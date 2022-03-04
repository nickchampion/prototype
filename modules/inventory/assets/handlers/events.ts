import { EventHandler } from '@hectare/platform.components.common'

export const asset_created: EventHandler = async (context): Promise<void> => {
  console.log(context.event.payload)
}

/**
 * All event handlers exported by the assets module
 */
export const event_handlers = {
  asset_created
}
