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
      live: null
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
