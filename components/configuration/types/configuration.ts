export interface IConfiguration {
  environment: string
  production: boolean
  dev: boolean
  node_path: string
  courier: ICourier
  redocly: IRedocly
  twilio: ITwilio
  slack: ISlack
  aws: IAws
  mongo: IMongoDB
  ravendb: IRavenDB
  modules: Record<string, unknown>
  defaults: IDefaults
  features: Record<string, boolean>
}

export interface IDefaults {
  page_size: number
}

export interface IRavenDB {
  nodes: string[]
  database_name: string
  endpoints: string[]
  certificate: string
}

export interface IEventBridge {
  connection: string
  port: number
  bus: string
  region: string
  source: string
}

export interface ICourier {
  api_key: string
}

export interface IRedocly {
  api_key: string
}

export interface ITwilio {
  token: string
  sid: string
}

export interface ISlack {
  user: string
  webhook: string
}

export interface IAws {
  eventbridge: IEventBridge
}

export interface IMongoDB {
  host: string
  name: string
  username: string
  password: string
  auto_index: boolean
}
