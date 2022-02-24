import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class ForbiddenError extends CustomError {
  constructor() {
    super('Companies House: Forbidden-Error')
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    return [{ message: 'Companies House: Forbidden-Error' }]
  }
}
