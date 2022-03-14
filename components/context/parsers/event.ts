import { EventContext } from '@hectare/platform.components.context'
import { IEventType } from '@hectare/platform.components.common'
import { EventBridgeEvent } from 'aws-lambda'

export const event_parser = (event: EventBridgeEvent<string, unknown>): EventContext => {
  return new EventContext({
    payload: event.detail,
    path: event['detail-type'],
    type: IEventType.event
  })
}