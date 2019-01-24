import contracts from '../contracts'
const ORIGIN_GQL_VERSION = require('../../package.json').version

export default {
  facebookAuthUrl: async () => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return { success: false }
    }
    const url = `${bridgeServer}/api/attestations/facebook/auth-url`
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' }
    })

    const data = await response.json()
    return data.url
  },
  originGraphQLVersion: () => {
    return ORIGIN_GQL_VERSION
  },
  affilliate: () => {
    return contracts.config.affiliate
  },
  arbitrator: () => {
    return contracts.config.arbitrator
  },
  discovery: () => {
    console.log(contracts.config)
    return contracts.config.discovery
  },
  bridge: () => {
    return contracts.config.bridge
  },
}
