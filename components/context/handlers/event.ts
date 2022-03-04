import { IDocumentStore } from 'ravendb'
import { Context, EventContext } from '@hectare/platform.components.context'
import { IEventType } from '@hectare/platform.components.common'
import { EventBridgeEvent } from 'aws-lambda'

/**
 * Generic handler for lambdas invoked from by the event bridge. Handlers are responsible for initialising the context
 * which provides access to the event and database session
 * @param context
 * @returns result of the event invocation
 */
export const event_handler = async (
  event: EventBridgeEvent<string, unknown>,
  handlers: { [name: string]: (context: Context) => Promise<void> },
  store: IDocumentStore
): Promise<void> => {
  // create our own context for this invocation and parse the request
  const context = new Context(store)

  context.event = new EventContext({
    payload: event.detail,
    path: event['detail-type'],
    args: {
      event
    },
    type: IEventType.event
  })

  // find the handler to run based on the event-detail
  const handler = handlers[context.event.path]

  if (!handler) throw new Error(`No handler found for event '${context.event.path}'`)

  try {
    await handler(context)
    await context.session.commit()
  } catch (e) {
    //TODO: logging
    await context.session.abort()
  }
}
