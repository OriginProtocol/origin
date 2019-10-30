const addresses = require('@origin/contracts/build/contracts_origin.json')
const localStorageHas = require('./_localStorageHas')

export default {
  networkId: 2222,
  // Web3 provider
  provider: 'https://testnet.originprotocol.com/rpc',

  // Services
  ipfsGateway: 'https://ipfs.dev.originprotocol.com',
  ipfsRPC: 'https://ipfs.dev.originprotocol.com',
  discovery: 'https://discovery.dev.originprotocol.com',
  growth: 'https://growth.dev.originprotocol.com',
  bridge: 'https://bridge.dev.originprotocol.com',
  graphql: 'https://graphql.dev.originprotocol.com',
  notifications: 'https://notifications.dev.originprotocol.com',
  relayer: 'https://relayer.dev.originprotocol.com',
  messaging: {
    messagingNamespace: 'origin:dev',
    globalKeyServer: 'https://messaging.dev.originprotocol.com'
  },
  authServer: 'https://auth.dev.originprotocol.com',

  // Contracts
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
  tokens: [
    {
      id: addresses.DAI,
      type: 'Standard',
      name: 'DAI Stablecoin',
      symbol: 'DAI',
      decimals: '18'
    }
  ],

  // Accounts
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  messagingAccount: '0xA9F10E485DD35d38F962BF2A3CB7D6b58585D591',

  // Configs
  performanceMode: localStorageHas('performanceMode', 'true'),
  proxyAccountsEnabled: true,
  relayerEnabled: true
}
