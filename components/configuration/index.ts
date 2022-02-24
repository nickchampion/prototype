/*
Purpose of this component is to build a configuration object based on current environment using the 
baseline config found in the configuration.json file in the root of the project

You can have your own local overrides of this config, just create a file called configurationlocal.json 
also in the root (this will be ignored by git).

The config system can handle encrypted properties and anything sensitive should be encrypted,the properties 
will be decrypted when we initialise the config system.

Your local overrides file should look like this where the property name is a path to the config value you 
want to replace and the property value is the replacement value

{
  "cache.prefix": "nick",
  "database.connection": "postgres://zesttee:admin@postgres:5432/zesttee"
}
*/

import { pbkdf2Sync, createDecipheriv } from 'crypto'
import * as json from './configuration.json'

let config = null

const env = JSON.parse(process.env.HECTARE)

const settings = {
  default: 'default',
  encrypted: 'encrypted',
  encryptionKey: env.key,
  environment: env.stage,
  overrides: env.overrides,
  salt: env.salt,
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

const build = (encryptionKey?: string, environment?: string) => {
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

  return configBuilder
}

const cached = () => {
  if (config !== null) return config
  config = build()
  return config
}

module.exports.config = cached()
module.exports.build = build
