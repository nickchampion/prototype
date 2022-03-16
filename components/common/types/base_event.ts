export class BaseEvent {
  'detail-type'?: string // incoming aws format
  detail_type: string
  detail: {
    event_id?: string
    OCC_version: number
    history_id?: string
    previous_event?: Omit<BaseEvent, 'detail.previous_event'>
  }
}
