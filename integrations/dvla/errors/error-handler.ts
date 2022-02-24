import { error_map } from './error-map'
import { AxiosError } from 'axios'
import { CustomError } from '../../../error-handling'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: AxiosError, field?: unknown): CustomError | AxiosError => {
  if (err?.response?.status in error_map) {
    throw new error_map[err.response.status](field)
  }

  // any unexpected error hits our error handler as normal
  throw err
}
