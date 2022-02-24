import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

//TODO: add logging from logger api
// const { debug: logDebugLevel, error: logLevelError } = require('../../analytics/index')

// 404, Not Found the vehicle format and request is okay but the vehicle requested doesn't exist
export class VehicleNotFoundError extends CustomError {
  constructor(private regNumber: string) {
    super('DVLA: VehicleNotFoundError')

    // Allow to work with JS error
    Object.setPrototypeOf(this, VehicleNotFoundError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    // logLevelError(`DVLA: Vehicle was not found by the DVLA ${this.regNumber}`)
    return [{ message: 'DVLA: VehicleNotFoundError', field: this.regNumber }]
  }
}
