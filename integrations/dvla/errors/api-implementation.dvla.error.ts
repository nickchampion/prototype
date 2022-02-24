import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

//TODO: add logging from logger api
// const { debug: logDebugLevel, error: logLevelError } = require('../../analytics/index')

// 400, something was wrong with the way our library logic talks to the api
export class APIImplementationError extends CustomError {
  constructor() {
    super('DVLA: Implementation-Error')

    // Allow to work with JS error
    Object.setPrototypeOf(this, APIImplementationError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    if (process.env.STAGE === 'production') {
      // misconfiguration in production log error with high priotity
      // logLevelError('DVLA Lib: Error with implementation of DVLA library, has API changed unexpectedly?', this)
    }

    const error_response: CommonErrorResponse[] = [{ message: 'DVLA: Implementation Error' }]
    return error_response
  }
}
