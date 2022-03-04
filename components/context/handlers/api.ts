import middy from '@middy/core'
import { DocumentStore } from 'ravendb'
import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  Context as AwsContext
} from 'aws-lambda'
import { OpenAPIBackend } from 'openapi-backend'
import { context_middleware } from '..'

/**
 * Generic handler for lambdas invoked from by the API gateway. Handlers are responsible for initialising the context
 * which provides access to the request context and database session
 * @param api
 * @param event
 * @param context
 * @returns result of the API call
 */
export const api_handler = async (
  event: APIGatewayProxyEvent,
  aws_context: AwsContext,
  apis: Record<string, OpenAPIBackend>,
  store: DocumentStore,
  middleware?: middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult>[]
): Promise<APIGatewayProxyResult> => {
  // pick up the first part of the URI and use this to indicate which API to use
  // this gives us flexibility over service granularity as we can now easily group
  // modules into services by importing their manifests above and mapping the request
  const api = apis[event.path.split('/')[0].toLowerCase()]

  // base handler which invokes the OpenAPIBackend API, by this point the before middleware components
  // have run, the context_middleware will add the hectare Context to the aws context which we extract below
  const base: APIGatewayProxyHandler = async (event, context) => {
    return await api.handleRequest(
      {
        method: event.requestContext.httpMethod,
        path: event.requestContext.path,
        headers: event.headers,
        query: event.queryStringParameters,
        body: event.body
      },
      context['context']
    )
  }

  // set up the middleware
  const handler = middy(base).use(context_middleware(store))

  if (middleware && middleware.length) {
    middleware.forEach(m => {
      handler.use(m)
    })
  }

  // run the handler
  return handler(event, aws_context)
}