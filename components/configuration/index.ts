import { pbkdf2Sync, createDecipheriv } from 'crypto'
import { configuration as baseline } from './configuration'
import { IConfiguration } from './types/configuration'
import * as utils from '@hectare/platform.components.utils'

let cached_configuration = null
const environment = JSON.parse(utils.base64_decode(process.env.HECTARE_DEV))

const settings = {
  default: 'default',
  encrypted: 'encrypted',
  encryption_key: environment.key,
  environment: environment.environment,
  overrides: environment.overrides,
  salt: environment.salt,
  nonce: 10,
  iv: 16
}

const tryGet = (action: { (): unknown }, defaultValue: unknown) => {
  try {
    return action()
  } catch {
    return defaultValue
  }
}

const decrypt = (text: string, key: string, salt?: string) => {
  try {
    const cryptoKey = pbkdf2Sync(key, salt || settings.salt, 10000, 32, 'sha512')
    const message = Buffer.from(text, 'base64')
    const iv = Buffer.alloc(settings.iv)
    message.copy(iv, 0, 0, settings.nonce)
    const encryptedText = message.slice(settings.nonce)
    const decipher = createDecipheriv('aes-256-ctr', cryptoKey, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (err) {
    return 'error_decrypting'
  }
}

const get_environment_values = (value: unknown) => {
  const environments = {}

  Object.keys(value).forEach(prop => {
    environments[prop] = value[prop]
  })

  return environments
}

const override_property = (
  configuration: unknown,
  pathParts: Array<string>,
  index: number,
  replacement: string,
  local: unknown,
  path: string
) => {
  if (typeof configuration[pathParts[index]] === 'object')
    return override_property(configuration[pathParts[index]], pathParts, index + 1, replacement, local, path)

  configuration[pathParts[index]] = replacement
  return configuration[pathParts[index]]
}

const assign_property = (parent: unknown, name: string, value: unknown) => {
  if (Array.isArray(value)) {
    parent[name] = value
  } else if (typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, settings.default)) {
    const encrypted = Object.prototype.hasOwnProperty.call(value, settings.encrypted)
      ? value[settings.encrypted]
      : false

    const env_values = get_environment_values(value)
    const extracted = Object.prototype.hasOwnProperty.call(env_values, settings.environment)
      ? env_values[settings.environment]
      : env_values[settings.default]

    parent[name] = encrypted && extracted ? decrypt(extracted, settings.encryption_key) : extracted
  } else if (typeof value === 'object') {
    // if its an object but has no key named default then we're interested in its children so recursively call assign_property
    parent[name] = {}
    Object.keys(value).forEach(prop => {
      assign_property(parent[name], prop, value[prop])
    })
  } else if (value === '.env') {
    // if the value is .env this indicates we'll read the value from environment variables
    parent[name] = process.env[name.toUpperCase()]
  } else if (value === '.keys') {
    // if the value is .keys this indicates we'll read the value keys collection above
    parent[name] = settings[name]
  } else {
    // if the property is not an object just take its value, means its the same value in all environments
    parent[name] = value
  }
}

export const build = (encryption_key?: string, environment?: string): IConfiguration => {
  const default_encryption_key = settings.encryption_key
  const default_environment = settings.environment

  if (encryption_key) {
    settings.encryption_key = encryption_key
    settings.environment = environment
  }

  // for local development look for an overrides file which will contain configuration variable overrides
  const local =
    settings.environment === 'dev' && settings.overrides ? tryGet(() => require(settings.overrides), {}) : {}

  // config object we'll build
  const builder = {
    environment
  }

  // extract properties and locate the correct environment value for it
  Object.keys(baseline).forEach(prop => {
    assign_property(builder, prop, baseline[prop])
  })

  // apply any local overrides to the config values
  Object.keys(local).forEach(path => {
    override_property(builder, path.split('.'), 0, local[path], local, path)
  })

  if (encryption_key) {
    settings.encryption_key = default_encryption_key
    settings.environment = default_environment
  }

  return builder as IConfiguration
}

export const cached = (): IConfiguration => {
  if (cached_configuration !== null) return cached_configuration
  cached_configuration = build()
  return cached_configuration
}

export const configuration = cached()
export { IConfiguration } from './types/configuration'
