import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class LibraryImplementationError extends CustomError {
  constructor(public message: string) {
    super('Red Tractor: Library-Implementation-Error')
    Object.setPrototypeOf(this, LibraryImplementationError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    return [{ message: this.message || 'Red Tractor: Library-Implementation-Error' }]
  }
}
