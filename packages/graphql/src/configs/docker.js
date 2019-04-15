import get from 'lodash/get'

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: get(process.env, 'PROVIDER_URL', `http://services:8545`),
  providerWS: get(process.env, 'PROVIDER_WS_URL', `ws://services:8545`),
  ipfsGateway: get(process.env, 'IPFS_GATEWAY_URL', `http://ipfs-proxy:9999`),
  ipfsRPC: get(process.env, 'IPFS_API_URL', `http://ipfs-proxy:9999`),
  bridge: 'http://localhost:5000',
  growth: 'http://localhost:4001',
  discovery: 'http://localhost:4000/graphql',
  automine: 2000,
  messaging: {
    messagingNamespace: 'origin:docker',
    globalKeyServer: 'http://localhost:6647'
  },

  affiliate: addresses.Affilaite,
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
