import middy from '@middy/core'
import { DocumentStore } from 'ravendb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Context, EventContext } from '@hectare/platform.components.context'
import { IEventType } from '@hectare/platform.components.common'

export const context_middleware = (
  store: DocumentStore
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    // create our own context for this invocation and parse the request
    const context = new Context(store)

    context.event = new EventContext({
      query: request.event.queryStringParameters,
      params: request.event.pathParameters,
      payload: request.event.body,
      path: request.event.requestContext.path,
      method: request.event.requestContext.httpMethod.toLowerCase(),
      headers: request.event.headers,
      args: {
        event: request.event,
        context: request.context
      },
      type: IEventType.api
    })

    // assign our internal context to the Lambda context so we can use it in the handler
    Object.assign(request.context, {
      context
    })
  }

  const error: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    const context = request.context['context'] as Context
    if (!context) return
    await context.session.abort()
  }

  const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    const context = request.context['context'] as Context
    if (!context) return

    // dont commit the transaction if its a get request, we should not be changing data on a get
    // but allow an override via commit_on_get on the session for exceptional circumstances
    if (context.event.method && context.event.method === 'get' && !context.session.commit_on_get) return

    // commit the session, any database changes should be commited in within a transaction and all succeed or fail
    await context.session.commit()

    // write the profiler summary to a response header
    request.response.headers['x-profiler'] = context.profiler.summary()
  }

  return {
    before,
    after,
    onError: error
  }
}
