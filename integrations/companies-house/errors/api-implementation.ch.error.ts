import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class ImplementationError extends CustomError {
  constructor() {
    super('Companies House: Implementation-Error')
    Object.setPrototypeOf(this, ImplementationError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    const error_response: CommonErrorResponse[] = [{ message: 'Companies House: Implementation Error' }]
    return error_response
  }
}
