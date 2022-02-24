import { CommonErrorResponse } from '../../../error-handling'
import { CustomError } from '../../../error-handling/abstracts/custom-error.abstract'
import { logger } from '../../../utils'

//TODO: add logging from logger api
// const { debug: logDebugLevel, error: logLevelError } = require('../../analytics/index')

// 400, something was wrong with our library logic might need updating
export class LibraryImplementationError extends CustomError {
  constructor(public message: string) {
    super('DVLA: Library-Implementation-Error')
    // Allow to work with JS error
    Object.setPrototypeOf(this, LibraryImplementationError.prototype)
  }

  generateError(): CommonErrorResponse[] {
    logger.warn('Error with implementation of library check output')
    // logDebugLevel('Error with implementation of library check output')
    if (process.env.STAGE === 'production') {
      // if this makes it through to production raise as high priority
      //   logLevelError(
      //     'DVLA Lib: Error with implementation of DVLA library, the library likely received unexpected input',
      //     this
      //   )
    }

    return [{ message: this.message || 'DVLA: Library-Implementation-Error' }]
  }
}
