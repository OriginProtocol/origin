const HOST = process.env.HOST || 'localhost'
const localStorageHas = require('./_localStorageHas')

let addresses = {}
try {
  addresses = require('@origin/contracts/build/tests.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  bridge: 'https://bridge.dev.originprotocol.com',
  performanceMode: localStorageHas('performanceMode', 'true'),
  graphql: `http://${HOST}:4007`,
  relayer: `http://${HOST}:5100`,
  automine: 500,
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',

  affiliate: addresses.Affilaite,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  IdentityEvents: addresses.IdentityEvents,
  DaiExchange: addresses.UniswapDaiExchange,
  ProxyFactory: addresses.ProxyFactory,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
  proxyAccountsEnabled: localStorageHas('proxyAccountsEnabled', 'true'),
  relayerEnabled: localStorageHas('relayerEnabled', 'true'),

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
