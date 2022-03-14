import { IDocumentStore } from 'ravendb'
import { Context, EventContext } from '@hectare/platform.components.context'
import { EventBridgeEvent } from 'aws-lambda'
import { event_parser } from '../parsers/event'

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

  // parse the event bridge event
  context.event = event_parser(event)

  // find the handler to run based on the event-detail
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
