/* eslint-disable max-len */
export const config = {
  production: {
    default: false,
    prod: true
  },
  dev: {
    default: false,
    dev: true
  },
  node_path: '.:/opt/node_modules',
  courier: {
    api_key: {
      encrypted: true,
      default: 'pk_prod_N5ZHFFRTAZMY1ZQ56BZM568P001G',
      uat: '',
      sandbox: '',
      prod: ''
    }
  },
  redocly: {
    api_key: {
      encrypted: true,
      default: 'orgsk_XgVvrhU5LmAWhej9PkEm4rZ1XyY=_ZxbvqXwjtfMTL24k45/m7Vs/JQ9y6cq3hVBxwVlZICQ=',
      uat: '',
      sandbox: '',
      prod: ''
    }
  },
  twilio: {
    token: {
      encrypted: true,
      default: 'f544ee3907b04feb94465a7125e97192',
      uat: '',
      sandbox: '',
      prod: ''
    },
    sid: 'AC82b3bc8f5233aa41652faccbeda4e8f4'
  },
  slack: {
    user: {
      default: 'Hectare Bot (Test)',
      live: 'Hectare Bot'
    },
    webHook: {
      encrypted: true,
      default:
        'W0rUfjd6Yx8gs1vtispaL9SbUzX81j9c6a0gqNFgVw82Dlq7iaDVd7fWkwg7TPGZJvjmvunzvY+YiJ6V87kQxrcHhc/Oz9L6ZIhpAeLJh5DzPC/pcMoA8zciBw==',
      live: 'Br2rgqYizpmEDXa/VGGFQ9uHAVI9LtMbDqyczMv/hF49Is89WP63OFILofnI0jcMyjszYtux0Qa6z9OyiNhUKJ9H3Z5wa/2BlhSvM85bmZ6lAf4lX8JJ3qVxcQ=='
    }
  },
  ravendb: {
    nodes: {
      default: ['A'],
      live: ['A', 'B', 'C']
    },
    database_name: 'Hectare',
    endpoints: {
      default: ['https://a.uat-dev.livecommerce.ravendb.cloud'],
      live: [
        'https://a.live.livecommerce.ravendb.cloud/',
        'https://b.live.livecommerce.ravendb.cloud/',
        'https://c.live.livecommerce.ravendb.cloud/'
      ]
    },
    certificate: {
      encrypted: true,
      default:
        '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',
      live: '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'
    }
  },
  aws: {
    eventbridge: {
      connection: {
        default: 'arn:aws:events:eu-west-2:974611314441:event-bus/dev-eu-west-2.EVENT_BUS',
        uat: 'arn:aws:events:eu-west-2:974611314441:event-bus/uat-eu-west-2.EVENT_BUS',
        sandbox: 'arn:aws:events:eu-west-2:974611314441:event-bus/sandbox-eu-west-2.EVENT_BUS',
        prod: 'arn:aws:events:eu-west-2:974611314441:event-bus/prod-eu-west-2.EVENT_BUS'
      },
      region: 'eu-west-2',
      port: 8006,
      bus: 'platform-saas-events',
      source: {
        default: 'dev.general.events.v1',
        uat: '',
        sandbox: '',
        prod: ''
      }
    }
  },
  mongodb: {
    host: {
      default: 'mongodb+srv://dev.skmdx.mongodb.net/platform?retryWrites=true&w=majority',
      uat: '',
      sandbox: '',
      prod: ''
    },
    name: 'platform',
    username: {
      default: 'dev-eu-west-2',
      uat: '',
      sandbox: 'sandbox-eu-west-2',
      prod: ''
    },
    password: {
      encrypted: true,
      default: 'IZN6jLcJmBNe3J2e',
      uat: 'IFxyQMrRsPYquAmD',
      sandbox: 'IFxyQMrRsPYquAmD',
      prod: 'Npp74Xpp2Smb'
    },
    auto_index: {
      default: false,
      dev: true
    }
  }
}
