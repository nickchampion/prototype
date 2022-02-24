import { error_map } from './error-map'
import { AxiosError } from 'axios'

export const errorHandler = (err: AxiosError, field?: unknown): void => {
  if (err?.response?.status in error_map) {
    throw new error_map[err.response.status](field)
  }
}
