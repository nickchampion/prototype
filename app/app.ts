import * as ctx from '@hectare/platform.components.context'
import { create_document_store } from '@hectare/platform.components.ravendb'
import { APIGatewayProxyEvent, Context as AwsContext } from 'aws-lambda'
import * as assets from '@hectare/platform.modules.inventory.assets'

/**
 * App is our local web server so we can run all APIs at the same time locally
 * To include module APIs just import the manifest and add to the apis and models objects below
 */
const apis = {
  assets: assets.manifest.api
}

const models = {
  ...assets.manifest.models
}

const store = create_document_store(models)

export const handler = async (req: unknown, reply: any): Promise<unknown> => {
  const result = await ctx.api_handler(get_aws_event(req), get_aws_context(), apis, store)
  console.log(result)

  // map the response to the Hapi response
  const response = reply.response(result.body).code(result.statusCode)

  if (result.headers) {
    Object.assign(response.headers, result.headers)
  }

  if (!response.headers['content-type']) response.headers['content-type'] = 'application/json'

  return response
}

//#region Mock AWS entities

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
