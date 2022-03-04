import { Context, Document } from 'openapi-backend'

export const status = {
  ok: (body?: unknown, headers?: { [name: string]: string }): Response => ({
    statusCode: 200,
    body: body,
    headers
  }),
  not_found: (): Response => ({
    statusCode: 404,
    body: 'Not found'
  }),
  not_modified: (): Response => ({
    statusCode: 304
  }),
  bad_request: (message?: unknown): Response => ({
    statusCode: 404,
    body: message
  })
}

export const handlers = {
  notFound: (c: Context<Document>): Response => {
    if (c.request.method === 'options') {
      return status.ok()
    }

    return status.not_found()
  },
  validationFail: (): Response => {
    return status.bad_request()
  },
  ping: (): Response => {
    return status.ok()
  }
}

export interface Response {
  statusCode: number
  body?: unknown
  headers?: { [name: string]: unknown }
}
