import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

//TODO: add logging from logger api
// const { debug: logDebugLevel, error: logLevelError } = require('../../analytics/index')

// 403, our API token is misconfigured or expired.
export class ForbiddenError extends CustomError {
  constructor() {
    super('DVLA: Forbidden-Error')
    // Allow to work with JS error
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    if (process.env.STAGE === 'production') {
      // misconfiguration in production log error with high priotity
      // logLevelError('DVLA Lib: Error with DVLA configuration check API key', this)
    }
    return [{ message: 'DVLA: Forbidden-Error' }]
  }
}
