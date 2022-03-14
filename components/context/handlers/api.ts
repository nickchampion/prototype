import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import { DocumentStore } from 'ravendb'
import { Context } from '@hectare/platform.components.context'
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
 *
 * The api_handler is called by services to configure the endpoints exposed by the service
 * @param event AWS event
 * @param aws_context AWS context
 * @param apis set of APIs this handler is configured to handle
 * @param RavenDB document store to initialise the context & session
 * @param middleware any middleware to attach to API handlers
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
  const api = apis[event.path.split('/')[1].toLowerCase()]

  // base handler which invokes the OpenAPIBackend API, by this point the before middleware components
  // have run, the context_middleware will add the hectare Context to the aws context which we extract below
  const base: APIGatewayProxyHandler = async (event, context) => {
    const ctx = context['context'] as Context
    if (!api) return ctx.event.response.not_found()
    return await api.handleRequest(
      {
        method: event.requestContext.httpMethod,
        path: event.requestContext.path,
        headers: event.headers,
        query: event.queryStringParameters,
        body: event.body
      },
      ctx
    )
  }

  // set up the middleware, any other global midddleware should go in here
  const handler = middy(base)
    .use(
      httpErrorHandler({
        logger: (e: unknown): void => {
          console.log(e) //TODO: proper logging
        }
      })
    )
    .use(context_middleware(store))

  // set up any middleware passed in by the service
  if (middleware && middleware.length) {
    middleware.forEach(m => {
      handler.use(m)
    })
  }

  // run the handler
  return await handler(event, aws_context)
}
