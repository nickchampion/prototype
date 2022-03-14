import { configuration } from '@hectare/platform.components.configuration'

const build = (stage, environmentKey) => {
  const env = JSON.parse(process.env[environmentKey])
  const config = configuration.build(env.key, stage)

  return {
    environment: process.env[environmentKey],
    event_bridge_bus: config.aws.eventbridge.connection,
    event_bridge_source: config.aws.eventbridge.source
  }
}

module.exports.dev = () => build('dev', 'HECTARE_DEV')
module.exports.uat = () => build('uat', 'HECTARE_UAT')
module.exports.sandbox = () => build('sandbox', 'HECTARE_SANDBOX')
module.exports.prod = () => build('prod', 'HECTARE_PROD')
