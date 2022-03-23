import { Response } from '@hectare/platform.components.common'
import { ApiHandler } from '.'

/**
 * Use this handler if we have a feature that we want to be able to toggle on and off
 * @param handler
 * @returns
 */
export class FeatureToggleHandler {
  name: string
  on_handler: ApiHandler
  off_handler: ApiHandler

  constructor(name: string, on_handler: ApiHandler, off_handler: ApiHandler) {
    this.on_handler = on_handler
    this.off_handler = off_handler
    this.name = name
  }

  handle: ApiHandler = async (context): Promise<Response> => {
    // this needs to be set as runtime editable configuration otherwise we need to deploy, either from AWS or the database
    if (
      Object.prototype.hasOwnProperty.call(context.configuration.features, this.name) &&
      context.configuration.features[this.name]
    ) {
      return await this.on_handler(context)
    }

    return await this.off_handler(context)
  }
}
