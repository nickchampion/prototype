import { Types } from 'mongoose'

export interface BaseEvent {
  'detail-type'?: string // incoming aws format
  detail_type: string
  detail: {
    event_id?: string
    OCC_version: number
    /// these two need to be required in v2
    history_id?: Types.ObjectId
    previous_event?: Omit<BaseEvent, 'detail.previous_event'>
  }
}
