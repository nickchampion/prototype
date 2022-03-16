import middy from '@middy/core'
import { DocumentStore } from 'ravendb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Context } from '@hectare/platform.components.context'
import { api_parser } from '../parsers/api'

export const context_middleware = (
  store: DocumentStore
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    // create our own context for this invocation and parse the request
    const context = new Context(store)

    // parse the event using the api parser
    context.event = api_parser(request.event)

    // assign our internal context to the Lambda context so we can use it in the handler
    Object.assign(request.context, {
      context
    })
  }

  const error: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    const context = request.context['context'] as Context
    if (context) await context.session.abort()
  }

  const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    const context = request.context['context'] as Context

    // dont commit the session if there was an error
    if (!context || request.error) return

    // write the profiler summary to a response header
    context.event.response.headers['x-profiler'] = context.profiler.summary()

    // dont commit the transaction if its a get request, we should not be changing data on a get
    // but allow an override via commit_on_get on the session for exceptional circumstances
    if (context.event.method && context.event.method === 'get' && !context.session.commit_on_get) return

    // commit the session, any database changes should be commited in within a transaction and all succeed or fail
    await context.session.commit()
  }

  return {
    before,
    after,
    onError: error
  }
}
