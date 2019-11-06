const addresses = require('@origin/contracts/build/contracts_rinkeby.json')

export default {
  networkId: 4,
  // Web3 provider
  provider:
    'https://eth-rinkeby.alchemyapi.io/jsonrpc/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI',
  providerWS:
    'wss://eth-rinkeby.ws.alchemyapi.io/ws/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI',

  // Services
  ipfsGateway: 'https://ipfs.staging.originprotocol.com',
  ipfsRPC: `https://ipfs.staging.originprotocol.com`,
  discovery: 'https://discovery.staging.originprotocol.com',
  growth: 'https://growth.staging.originprotocol.com',
  bridge: 'https://bridge.staging.originprotocol.com',
  identityServer: 'https://bridge.staging.originprotocol.com',
  graphql: 'https://graphql.staging.originprotocol.com',
  notifications: 'https://notifications.staging.originprotocol.com',
  relayer: 'https://relayer.staging.originprotocol.com',
  messaging: {
    messagingNamespace: 'origin:staging',
    globalKeyServer: 'https://messaging.staging.originprotocol.com'
  },
  authServer: 'https://auth.staging.originprotocol.com',

  // Contracts
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  V00_Marketplace_EventCache: [
    'QmTu6ykq6sTKJVFFZftRacQY8XbVb1WCA2HWGjqDAVf9bq',
    'QmSUR3caMhEy3DEQJp7QuSyHSsBrFtqQ1UQEKKPB5fWMRT'
  ],
  V00_Marketplace_EventCacheMaxBlock: 4263321,
  V01_Marketplace: addresses.Marketplace_V01,
  V01_Marketplace_Epoch: addresses.MarketplaceEpoch_V01,
  IdentityEvents: addresses.IdentityEvents,
  IdentityEvents_Epoch: addresses.IdentityEventsEpoch,
  IdentityEvents_EventCache: ['QmPe4ESMh4FhCN82bKwk2y2dkgVSMYS98U7Y5w8qmuhcUh'],
  IdentityEvents_EventCacheMaxBlock: 4265704,
  ProxyFactory: addresses.ProxyFactory,
  ProxyFactory_Epoch: addresses.ProxyFactoryEpoch,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
  DaiExchange: addresses.UniswapDaiExchange,
  tokens: [
    {
      id: addresses.DAI,
      type: 'Standard',
      name: 'DAI Stablecoin',
      symbol: 'DAI',
      decimals: '18'
    },
    {
      id: addresses.OKB,
      type: 'Standard',
      name: 'OKB Token',
      symbol: 'OKB',
      decimals: '18'
    }
  ],

  // Accounts
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
  affiliate: '0xc1a33cda27c68e47e370ff31cdad7d6522ea93d5',
  arbitrator: '0xc9c1a92ba54c61045ebf566b154dfd6afedea992',
  messagingAccount: '0xA9F10E485DD35d38F962BF2A3CB7D6b58585D591',

  // Wire-on/off configs.
  centralizedIdentityEnabled: true,
  performanceMode: true,
  proxyAccountsEnabled: true,
  relayerEnabled: true
}
