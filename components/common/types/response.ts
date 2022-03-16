export class Response {
  headers: Record<string, string>
  body: unknown
  statusCode: number

  constructor() {
    this.headers = {}
  }

  ok(body: unknown): Response {
    this.statusCode = 200
    this.body = body
    return this
  }

  not_found(): Response {
    this.statusCode = 404
    return this
  }

  bad_request(body?: unknown): Response {
    this.statusCode = 400
    this.body = body
    return this
  }

  unauthorised(): Response {
    this.statusCode = 401
    return this
  }

  error(body?: unknown): Response {
    this.statusCode = 500
    this.body = body
    return this
  }
}
