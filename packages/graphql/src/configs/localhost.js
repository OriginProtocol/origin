const HOST = process.env.HOST || 'localhost'
const localStorageHas = require('./_localStorageHas')

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  relayer: `http://${HOST}:5100`,
  bridge: 'https://bridge.dev.originprotocol.com',
  // discovery: `http://${HOST}:4000/graphql`,
  notifications: `http://${HOST}:3456`,
  //growth: 'http://localhost:4001',
  performanceMode: localStorageHas('performanceMode'),
  graphql: `http://${HOST}:4007`,
  automine: 2000,
  attestationIssuer: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  IdentityEvents: addresses.IdentityEvents,
  IdentityEvents_Epoch: addresses.IdentityEventsEpoch,
  DaiExchange: addresses.UniswapDaiExchange,
  ProxyFactory: addresses.ProxyFactory,
  ProxyFactory_Epoch: addresses.ProxyFactoryEpoch,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
  proxyAccountsEnabled: localStorageHas('proxyAccountsEnabled'),
  tokens: [],

  messagingAccount: '0xBfDd843382B36FFbAcd00b190de6Cb85ff840118',
  messaging: {
    messagingNamespace: 'origin',
    globalKeyServer: 'http://localhost:6647'
  }
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
