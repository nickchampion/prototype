export enum IEventType {
  api,
  event
}

export interface IBaseEvent {
  'detail-type'?: string // incoming aws format
  detail_type: string
  detail: {
    event_id?: string
    OCC_version: number
    history_id?: string
    previous_event?: Omit<IBaseEvent, 'detail.previous_event'>
  }
}

export interface IEventContext {
  query?: Record<string, string | number>
  params?: Record<string, string | number>
  payload?: unknown
  path?: string
  method?: string
  headers: Record<string, string>
  response: IResponse
  type: IEventType
  id(): string
  parse_query(): Record<string, string | number>
}

export interface IResponse {
  headers: Record<string, string>
  body: unknown
  statusCode: number
  ok(body?: unknown): IResponse
  not_found(): IResponse
}
