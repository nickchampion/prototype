import { FilterQuery } from 'mongoose'
export interface PaginationRequestOptions {
  page?: number
  limit?: number
  sort?: Record<string, unknown>
  filter_fields?: Record<string, unknown>
  select?: string[]
  search?: string
}
