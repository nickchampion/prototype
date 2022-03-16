import { IEventType, EventContext } from '@hectare/platform.components.common'
import { APIGatewayProxyEvent } from 'aws-lambda'

export const api_parser = (request: APIGatewayProxyEvent): EventContext => {
  return new EventContext({
    query: request.queryStringParameters,
    params: request.pathParameters,
    payload: request.body,
    path: request.path,
    method: request.httpMethod.toLowerCase(),
    headers: request.headers,
    type: IEventType.api
  })
}
