export interface LogData extends Record<string, unknown> {
  message: string
  service?: string
  hostname?: string
  organisation?: string
  user?: string
  req?: unknown
  res?: unknown
  data?: unknown
}
