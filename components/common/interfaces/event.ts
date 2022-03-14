import { IContext } from './context'

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
  query?: { [name: string]: unknown }
  params?: { [name: string]: unknown }
  payload?: unknown
  path?: string
  method?: string
  headers: { [name: string]: string }
  args: { [name: string]: unknown }
  type: IEventType
  id(): string
}

export type EventHandler = (context: IContext) => Promise<void>
