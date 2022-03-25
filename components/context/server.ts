/* eslint-disable @typescript-eslint/no-empty-function */
import Hapi from '@hapi/hapi'
import * as ctx from '@hectare/platform.components.context'
import { APIGatewayProxyEvent, Context as AwsContext } from 'aws-lambda'
import OpenAPIBackend from 'openapi-backend'
import { DocumentStore } from 'ravendb'
import { configuration } from '@hectare/platform.components.configuration'

export class Server {
  config: unknown
  apis: Record<string, OpenAPIBackend>
  store: DocumentStore

  constructor(config: unknown, apis: Record<string, OpenAPIBackend>, store: DocumentStore) {
    this.config = config
    this.apis = apis
    this.store = store
  }

  async start() {
    // create new server instance
    const server = new Hapi.Server(this.config)

    const handler = async (req: unknown, reply: any): Promise<unknown> => {
      // execute the handler
      const result = await ctx.api_handler(get_aws_event(req), get_aws_context(), this.apis, this.store)

      // map the response to the Hapi response
      const response = reply.response(result.body).code(result.statusCode)

      if (result.headers) {
        Object.assign(response.headers, result.headers)
      }

      if (!response.headers['content-type']) response.headers['content-type'] = 'application/json'

      return response
    }

    server.route({
      method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      path: '/{path*}',
      config: {
        handler: handler,
        auth: false
      }
    })

    async function start() {
      await server.start()
      return server
    }

    start()
      .then(s => {
        console.log(`Server listening on ${s.info.uri}`)
      })
      .catch(e => {
        console.log(e)
        process.exit(1)
      })
  }
}

//#region Mock AWS entities

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get_aws_context = (): AwsContext => {
  return {
    callbackWaitsForEmptyEventLoop: null,
    functionName: null,
    functionVersion: null,
    invokedFunctionArn: null,
    memoryLimitInMB: null,
    awsRequestId: null,
    logGroupName: null,
    logStreamName: null,
    getRemainingTimeInMillis() {
      return 1
    },
    done() {},
    fail() {},
    succeed() {}
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get_aws_event = (req: any): APIGatewayProxyEvent => {
  return {
    body: req.payload,
    headers: req.headers,
    multiValueHeaders: {},
    httpMethod: req.method,
    isBase64Encoded: false,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    multiValueQueryStringParameters: {},
    stageVariables: {},
    requestContext: {
      accountId: null,
      apiId: null,
      authorizer: null,
      protocol: req.protocol,
      httpMethod: req.method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: null,
        user: null,
        userAgent: null,
        userArn: null
      },
      path: req.path,
      stage: null,
      requestId: null,
      requestTimeEpoch: 1,
      resourceId: null,
      resourcePath: null
    },
    resource: null
  }
}
//#endregion
