import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

export class ResourceNotFoundError extends CustomError {
  constructor(private regNumber: string) {
    super('Companies House: VehicleNotFoundError')
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    return [{ message: 'Companies House: VehicleNotFoundError', field: this.regNumber }]
  }
}
