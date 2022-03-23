import { Response } from '@hectare/platform.components.common'
import { ApiHandler } from '.'

/**
 * If an endpoint has multiple versions use this version handler to determine the correct version based on the HTTP acccept header
 * @param handler
 * @returns
 */
export class VersionHandler {
  handlers: Record<string, ApiHandler>

  constructor(handlers: Record<string, ApiHandler>) {
    this.handlers = handlers

    if (!Object.prototype.hasOwnProperty.call(this.handlers, 'default'))
      throw new Error('Version handlers must specify a default handler')
  }

  handle: ApiHandler = async (context): Promise<Response> => {
    const api_version = context.event.headers['accept-version']?.replaceAll('.', '_')

    // this logic is not sufficent, we need to find the closest version match, so if we have 3 versions of this handler
    // we would use the version closest to the correct API version
    if (api_version && Object.prototype.hasOwnProperty.call(this.handlers, api_version)) {
      return await this.handlers[api_version](context)
    }

    return await this.handlers['default'](context)
  }
}
