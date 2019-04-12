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
  googleAuthUrl: async () => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return { success: false }
    }
    const url = `${bridgeServer}/api/attestations/google/auth-url`
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' }
    })

    const data = await response.json()
    return data.url
  },
  originGraphQLVersion: () => {
    return ORIGIN_GQL_VERSION
  }
}
