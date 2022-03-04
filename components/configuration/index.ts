import { pbkdf2Sync, createDecipheriv } from 'crypto'
import { config as json } from './config'
import { IConfiguration } from './configuration'

let config = null

const settings = {
  default: 'default',
  encrypted: 'encrypted',
  encryptionKey: process.env.HECTARE_KEY,
  environment: process.env.HECTARE_ENV,
  overrides: process.env.HECTARE_OVERRIDES,
  salt: process.env.HECTARE_SALT,
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

const getEnvironmentValues = (value: unknown) => {
  const environments = {}

  Object.keys(value).forEach(prop => {
    environments[prop] = value[prop]
  })

  return environments
}

const overrideProperty = (
  configuration: unknown,
  pathParts: Array<string>,
  index: number,
  replacement: string,
  local: unknown,
  path: string
) => {
  if (typeof configuration[pathParts[index]] === 'object')
    return overrideProperty(configuration[pathParts[index]], pathParts, index + 1, replacement, local, path)

  configuration[pathParts[index]] = replacement
  return configuration[pathParts[index]]
}

const assignProperty = (parent: unknown, name: string, value: unknown) => {
  if (Array.isArray(value)) {
    parent[name] = value
  } else if (typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, settings.default)) {
    const encrypted = Object.prototype.hasOwnProperty.call(value, settings.encrypted)
      ? value[settings.encrypted]
      : false
    const environmentValues = getEnvironmentValues(value)
    const extracted = Object.prototype.hasOwnProperty.call(environmentValues, settings.environment)
      ? environmentValues[settings.environment]
      : environmentValues[settings.default]

    parent[name] =
      encrypted && extracted !== null && extracted !== '' ? decrypt(extracted, settings.encryptionKey) : extracted
  } else if (typeof value === 'object') {
    // if its an object but has no key named default then we're interested in its children so recursively call assignProperty
    parent[name] = {}
    Object.keys(value).forEach(prop => {
      assignProperty(parent[name], prop, value[prop])
    })
  } else if (value === '.env') {
    // if the value is .env this indicates we'll read the value from the .env file
    parent[name] = process.env[name.toUpperCase()]
  } else if (value === '.keys') {
    // if the value is .keys this indicates we'll read the value keys collection above
    parent[name] = settings[name]
  } else {
    // if the property is not an object just take its value, means its the same value in all environments
    parent[name] = value
  }
}

export const build = (encryptionKey?: string, environment?: string): IConfiguration => {
  const defaultEncryptionKey = settings.encryptionKey
  const defaultEnvironment = settings.environment

  if (encryptionKey) {
    settings.encryptionKey = encryptionKey
    settings.environment = environment
  }

  // for local development look for a configuration.local.json file which will contain configuration variable overrides
  const local =
    settings.environment === 'dev' && settings.overrides ? tryGet(() => require(settings.overrides), {}) : {}

  // config object we'll build
  const configBuilder = {
    environment
  }

  // extract properties and locate the correct environment value for it
  Object.keys(json).forEach(prop => {
    assignProperty(configBuilder, prop, json[prop])
  })

  // apply any local overrides to the config values
  Object.keys(local).forEach(path => {
    overrideProperty(configBuilder, path.split('.'), 0, local[path], local, path)
  })

  if (encryptionKey) {
    settings.encryptionKey = defaultEncryptionKey
    settings.environment = defaultEnvironment
  }

  return configBuilder as IConfiguration
}

const cached = (): IConfiguration => {
  if (config !== null) return config
  config = build()
  return config
}

export const configuration = cached()
