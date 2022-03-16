import { IDocumentStore } from 'ravendb'
import { EventBridgeEvent } from 'aws-lambda'
import { IContext } from '@hectare/platform.components.common'
import { EventSource } from '@hectare/platform.components.common'
import { Context } from '..'

export type EventHandler = (context: Context) => Promise<void>

/**
 * Generic handler for lambdas invoked from by the event bridge. Handlers are responsible for initialising the context
 * which provides access to the event and database session
 * @param context
 * @returns result of the event invocation
 */
export const event_handler = async (
  event: EventBridgeEvent<string, unknown>,
  handlers: { [name: string]: (context: IContext) => Promise<void> },
  store: IDocumentStore
): Promise<void> => {
  // create our own context for this invocation
  const context = new Context(store)

  // create internal event source instance gtom the event bridge event
  context.event = new EventSource({
    path: event['detail-type'],
    payload: event.detail
  })

  // find the handler to run based on the event-detail which is mapped to path
  const handler = handlers[context.event.path]

  if (!handler) throw new Error(`No handler found for event '${context.event.path}'`)

  try {
    await handler(context)
    await context.session.commit()
  } catch (e) {
    //TODO: logging
    console.log(e)
    throw e
  } finally {
    await context.session.abort()
  }
}
