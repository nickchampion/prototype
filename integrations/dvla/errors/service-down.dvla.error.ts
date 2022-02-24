import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'

//TODO: add logging from logger api
// const { debug: logDebugLevel, error: logLevelError } = require('../../analytics/index')

// 502 && 504, Service is down, return local
export class DvlaServiceOutage extends CustomError {
  constructor() {
    super('DVLA: Service-Outage')
    // Allow to work with JS error
    Object.setPrototypeOf(this, DvlaServiceOutage.prototype)
  }

  generateError(): CommonErrorResponse[] {
    if (process.env.STAGE === 'production') {
      // DVLA service is unresponsive
      //   logLevelError('DVLA Lib: service is not responding, Check connection status of DVLA API', this)
    }
    return [{ message: 'DVLA: Service-Outage' }]
  }
}
