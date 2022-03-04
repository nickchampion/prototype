/* eslint-disable @typescript-eslint/no-empty-function */
import * as ctx from '@hectare/platform.components.context'
import { APIGatewayProxyEvent, Context as AwsContext } from 'aws-lambda'
import * as assets from '@hectare/platform.modules.inventory.assets'

const apis = {
  assets: assets.manifest.api
}

const models = {
  ...assets.manifest.models
}

const store = ctx.create_document_store(models)

const handler = async (req: unknown): Promise<unknown> => {
  return await ctx.api_handler(get_aws_event(req), get_aws_context(), apis, store)
}

export const routes = [
  {
    method: 'GET',
    path: '/{path*}',
    config: {
      description: 'Default route for get requests',
      handler,
      auth: false
    }
  },
  {
    method: 'PUT',
    path: '/{path*}',
    config: {
      description: 'Default route for put requests',
      handler,
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/{path*}',
    config: {
      description: 'Default route for post requests',
      handler,
      auth: false
    }
  },
  {
    method: 'DELETE',
    path: '/{path*}',
    config: {
      description: 'Default route for delete requests',
      handler,
      auth: false
    }
  }
]

//#region Dummy AWS entities

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const get_aws_context = (): AwsContext => {
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
const get_aws_event = (req: any): APIGatewayProxyEvent => {
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
