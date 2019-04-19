import get from 'lodash/get'

const HOST = process.env.HOST || 'localhost'

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: get(process.env, 'PROVIDER_URL', `http://${HOST}:8545`),
  providerWS: get(process.env, 'PROVIDER_WS_URL', `ws://${HOST}:8545`),
  ipfsGateway: get(process.env, 'IPFS_GATEWAY_URL', `http://${HOST}:9999`),
  ipfsRPC: get(process.env, 'IPFS_API_URL', `http://${HOST}:9999`),
  bridge: `http://${HOST}:5000`,
  growth: `http://${HOST}:4001`,
  discovery: `http://${HOST}:4000/graphql`,
  automine: 2000,
  messaging: {
    messagingNamespace: 'origin:docker',
    globalKeyServer: `http://${HOST}:6647`
  },

  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  IdentityEvents: addresses.IdentityEvents,
  DaiExchange: addresses.UniswapDaiExchange,
  tokens: []
}

if (addresses.DAI) {
  config.tokens.push({
    id: addresses.DAI,
    type: 'Standard',
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    decimals: '18'
  })
}

export default config
