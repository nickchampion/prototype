import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

//TODO: add logging from logger api
// const { debug: logDebugLevel, error: logLevelError } = require('../../analytics/index')

// 429, Too many requests we may be at our quota
export class TooManyRequests extends CustomError {
  constructor() {
    super('DVLA: Too-Many-Requests')
    // Allow to work with JS error
    Object.setPrototypeOf(this, TooManyRequests.prototype)
  }

  generateError(): CommonErrorResponse[] {
    if (process.env.STAGE === 'production') {
      // DVLA API is throttling either due to hitting out throttling limit or
      // total traffic is overwhelming server
      // logLevelError(
      //   'DVLA Lib: Too many requests to DVLA API, check allowances & response time from DVLA server',
      //   this
      // )
    }
    return [{ message: 'DVLA: Too-Many-Requests' }]
  }
}
