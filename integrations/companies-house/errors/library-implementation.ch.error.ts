import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class LibraryImplementationError extends CustomError {
  constructor(public message: string) {
    super('Companies House: Library-Implementation-Error')
    Object.setPrototypeOf(this, LibraryImplementationError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    return [{ message: this.message || 'Companies House: Library-Implementation-Error' }]
  }
}
