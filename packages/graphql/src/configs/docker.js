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
  bridge: get(process.env, 'BRIDGE_SERVER_URL', `http://${HOST}:5000`),
  growth: get(process.env, 'GROWTH_SERVER_URL', `http://${HOST}:4001`),
  discovery: get(
    process.env,
    'DISCOVERY_SERVER_URL',
    `http://${HOST}:4000/graphql`
  ),
  notifications: `http://${HOST}:3456`,
  performanceMode: false,
  graphql: `http://${HOST}:4002`,
  automine: 2000,
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
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
  ProxyFactory: addresses.ProxyFactory,
  ProxyFactory_Epoch: addresses.ProxyFactoryEpoch,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
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
