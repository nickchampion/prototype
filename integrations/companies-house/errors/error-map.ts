import { ImplementationError } from './api-implementation.ch.error'
import { ForbiddenError } from './forbidden.ch.error'
import { ServiceOutage } from './service-down.ch.error'
import { TooManyRequests } from './too-many-requests.ch.error'
import { ResourceNotFoundError } from './resource-not-found.ch.error'

export const error_map = {
  400: ImplementationError,
  403: ForbiddenError,
  404: ResourceNotFoundError,
  429: TooManyRequests,
  502: ServiceOutage,
  504: ServiceOutage
}
