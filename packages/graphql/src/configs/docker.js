import get from 'lodash/get'

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const isBrowser =
  typeof window !== 'undefined' && window.localStorage ? true : false
const isWebView =
  typeof window !== 'undefined' &&
  typeof window.ReactNativeWebView !== 'undefined'

const HOST =
  isBrowser || isWebView ? process.env.HOST || 'localhost' : undefined
const SERVICES_HOST = HOST || 'services'
const IPFS_HOST = HOST || 'ipfs-proxy'
const BRIDGE_HOST = HOST || 'bridge'
const GROWTH_HOST = HOST || 'growth'
const DISCOVERY_HOST = HOST || 'discovery'
const NOTIFICATIONS_HOST = HOST || 'notifications'
const GRAPHQL_HOST = HOST || 'graphql'
const MESSAGING_HOST = HOST || 'messaging'

const config = {
  provider: get(process.env, 'PROVIDER_URL', `http://${SERVICES_HOST}:8545`),
  providerWS: get(process.env, 'PROVIDER_WS_URL', `ws://${SERVICES_HOST}:8545`),
  ipfsGateway: get(process.env, 'IPFS_GATEWAY_URL', `http://${IPFS_HOST}:9999`),
  ipfsRPC: get(process.env, 'IPFS_API_URL', `http://${IPFS_HOST}:9999`),
  bridge: get(process.env, 'BRIDGE_SERVER_URL', `http://${BRIDGE_HOST}:5000`),
  growth: get(process.env, 'GROWTH_SERVER_URL', `http://${GROWTH_HOST}:4008`),
  discovery: get(
    process.env,
    'DISCOVERY_SERVER_URL',
    `http://${DISCOVERY_HOST}:4000/graphql`
  ),
  notifications: `http://${NOTIFICATIONS_HOST}:3456`,
  performanceMode: false,
  graphql: `http://${GRAPHQL_HOST}:4002`,
  automine: 2000,
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
  messaging: {
    messagingNamespace: 'origin:docker',
    globalKeyServer: `http://${MESSAGING_HOST}:6647`
  },

  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  V01_Marketplace: addresses.Marketplace_V01,
  V01_Marketplace_Epoch: addresses.MarketplaceEpoch_V01,
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
