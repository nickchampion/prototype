import middy from '@middy/core'
import { DocumentStore } from 'ravendb'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Context } from '@hectare/platform.components.context'
import { EventSource } from '@hectare/platform.components.common'

export const context_middleware = (
  store: DocumentStore
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    // create our own context for this invocation and parse the request
    const context = new Context(store)

    // create internal event source instance from the API gateway event
    context.event = new EventSource({
      query: request.event.queryStringParameters,
      params: request.event.pathParameters,
      payload: request.event.body,
      path: request.event.path,
      method: request.event.httpMethod.toLowerCase(),
      headers: request.event.headers
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
    if (context) await context.session.abort()
  }

  const after: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    const context = request.context['context'] as Context

    // dont commit the session if there was an error
    if (!context || request.error) return

    const header = () => (context.event.response.headers['x-profiler'] = context.profiler.summary())

    // dont commit the transaction if we're handling an http get request, we should not be changing data on a get
    // but allow an override via commit_on_get on the session for exceptional circumstances
    if (context.event.method && context.event.method === 'get' && !context.session.commit_on_get) {
      header()
      return
    }

    // atomic commit of the session
    await context.session.commit()

    // write the profiler summary to a response header
    header()
  }

  return {
    before,
    after,
    onError: error
  }
}
