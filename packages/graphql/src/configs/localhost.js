const HOST = process.env.HOST || 'localhost'
const localStorageHas = require('./_localStorageHas')

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  networkId: 999,
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  relayer: `http://${HOST}:5100`,
  bridge: 'https://bridge.dev.originprotocol.com',
  identityServer: 'http://localhost:5000',
  // discovery: `http://${HOST}:4000/graphql`,
  notifications: `http://${HOST}:3456`,
  growth: localStorageHas('localGrowthServer', 'true')
    ? 'http://localhost:4008'
    : null,
  graphql: `http://${HOST}:4007`,
  automine: 2000,
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  V01_Marketplace: addresses.Marketplace_V01,
  V01_Marketplace_Epoch: addresses.MarketplaceEpoch_V01,
  IdentityEvents: addresses.IdentityEvents,
  IdentityEvents_Epoch: addresses.IdentityEventsEpoch,
  DaiExchange: addresses.UniswapDaiExchange,
  ProxyFactory: addresses.ProxyFactory,
  ProxyFactory_Epoch: addresses.ProxyFactoryEpoch,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
  tokens: [],
  messagingAccount: '0xBfDd843382B36FFbAcd00b190de6Cb85ff840118',
  messaging: {
    messagingNamespace: 'origin:dev',
    globalKeyServer: 'https://messaging.dev.originprotocol.com'
  },

  authServer: `http://${HOST}:5200`,

  // Wire-on/off configs.
  centralizedIdentityEnabled: !!process.env.ENABLE_CENTRALIZED_IDENTITY,
  performanceMode: localStorageHas('performanceMode', 'true'),
  proxyAccountsEnabled: localStorageHas('proxyAccountsEnabled', 'true'),
  relayerEnabled: localStorageHas('relayerEnabled', 'true')
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

if (addresses.OKB) {
  config.tokens.push({
    id: addresses.OKB,
    type: 'Standard',
    name: 'OKB Token',
    symbol: 'OKB',
    decimals: '18'
  })
}

export default config
