import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class ServiceOutage extends CustomError {
  constructor() {
    super('Companies House: Service-Outage')
    Object.setPrototypeOf(this, ServiceOutage.prototype)
  }

  generateError(): CommonErrorResponse[] {
    return [{ message: 'Companies House: Service-Outage' }]
  }
}
