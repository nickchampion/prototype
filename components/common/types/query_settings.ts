export enum SearchOperator {
  And,
  Or
}
export class QuerySettings {
  limit: number
  offset: number
  sort: string
  sort_desc: boolean
  operator = SearchOperator.And
  filters: Record<string, unknown>

  constructor(fields: Partial<QuerySettings>) {
    Object.assign(this, fields)
  }
}
