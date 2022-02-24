import { APIImplementationError } from './api-implementation.dvla.error'
import { ForbiddenError } from './forbidden.dvla.error'
import { DvlaServiceOutage } from './service-down.dvla.error'
import { TooManyRequests } from './too-many-requests.dvla.error'
import { VehicleNotFoundError } from './vehicle-not-found.dvla.error'

export const error_map = {
  400: APIImplementationError,
  403: ForbiddenError,
  404: VehicleNotFoundError,
  429: TooManyRequests,
  502: DvlaServiceOutage,
  504: DvlaServiceOutage
}
