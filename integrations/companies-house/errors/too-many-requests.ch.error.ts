import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class TooManyRequests extends CustomError {
  constructor() {
    super('Companies House: Too-Many-Requests')
    Object.setPrototypeOf(this, TooManyRequests.prototype)
  }

  generateError(): CommonErrorResponse[] {
    return [{ message: 'Companies House: Too-Many-Requests' }]
  }
}
