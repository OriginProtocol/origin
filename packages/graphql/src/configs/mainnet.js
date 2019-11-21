const addresses = require('@origin/contracts/build/contracts_mainnet.json')

export default {
  networkId: 1,
  // Web3 provider
  //provider: 'https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2',
  provider:
    'https://eth-mainnet.alchemyapi.io/jsonrpc/FCA-3myPH5VFN8naOWyxDU6VkxelafK6',
  // providerWS: 'wss://mainnet.infura.io/ws',

  // Services
  ipfsGateway: 'https://ipfs.originprotocol.com',
  ipfsRPC: 'https://ipfs.originprotocol.com',
  discovery: 'https://discovery.originprotocol.com',
  growth: 'https://growth.originprotocol.com',
  bridge: 'https://bridge.originprotocol.com',
  identityServer: 'https://bridge.originprotocol.com',
  graphql: 'https://graphql.originprotocol.com',
  notifications: 'https://notifications.originprotocol.com',
  relayer: 'https://relayer.originprotocol.com',
  messaging: {
    messagingNamespace: 'origin',
    globalKeyServer: 'https://messaging.originprotocol.com'
  },
  authServer: 'https://auth.originprotocol.com',

  // Contracts
  IdentityEvents: addresses.IdentityEvents,
  IdentityEvents_Epoch: addresses.IdentityEventsEpoch,
  IdentityEvents_EventCacheMaxBlock: 7631468,
  IdentityEvents_EventCache: [
    'QmVTuRC16Pw2iwEsmAaaLUMVY3PKa3VQ2DzyUdTYwiFJUf',
    'QmQDFYHXVKkwhEF7jgB4twnXcgDH7NQPDWayCGFasJKaok',
    'QmbKmUHJ2JJ1ZuoHtrDtD615mQKu91DXepGB75AwyRxy6d',
    'QmNQuZynZNNepPR4ntZYoGDa9JUKBwApXvLQHM9chBXKWo',
    'QmZ9ANQNA1r3cbPSMNc9YFyAEijXif2j9m6SyaKDMJ8RsL'
  ],
  ProxyFactory: addresses.ProxyFactory,
  ProxyFactory_Epoch: addresses.ProxyFactoryEpoch,
  IdentityProxyImplementation: addresses.IdentityProxyImplementation,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  V00_Marketplace_EventCacheMaxBlock: 7631592,
  V00_Marketplace_EventCache: [
    'QmbViWEBRQmjmxC5VyELJDeW1auSxgRgjWpw5djcCctPMC',
    'QmaMSwML8H1ZREYFKGcdXXRP96JbGA4EShY9DcNmCH5FKD',
    'QmTKCVgs9xuzqH3D86eDF7G2kxmyW1LLmAv4BN3p1evCgD',
    'QmRhtc4tksc9BAwjzw2GJ1D9Hvf1KXyYcEtoEUSeqBjXCX',
    'QmS1ZX41WcG4egabpC3BThC5WNUaRvJYm3urBuCXsxgtbb'
  ],
  V01_Marketplace: addresses.Marketplace_V01,
  V01_Marketplace_Epoch: addresses.MarketplaceEpoch_V01,
  tokens: [
    {
      id: addresses.DAI,
      type: 'Standard',
      name: 'DAI Stablecoin',
      symbol: 'DAI',
      decimals: '18'
    },
    {
      id: addresses.USDC,
      type: 'Standard',
      name: 'USDC Stablecoin',
      symbol: 'USDC',
      decimals: '6'
    },
    {
      id: addresses.GUSD,
      type: 'Standard',
      name: 'Gemini Dollar',
      symbol: 'GUSD',
      decimals: '2'
    },
    {
      id: addresses.OKB,
      type: 'Standard',
      name: 'OKB Token',
      symbol: 'OKB',
      decimals: '18'
    },
    {
      id: addresses.USDT,
      type: 'Standard',
      name: 'Tether',
      symbol: 'USDT',
      decimals: '18'
    }
  ],
  DaiExchange: addresses.UniswapDaiExchange,

  // Accounts
  affiliate: '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8',
  arbitrator: '0x64967e8cb62b0cd1bbed27bee4f0a6a2e454f06a',
  attestationIssuer: '0x8EAbA82d8D1046E4F242D4501aeBB1a6d4b5C4Aa',
  messagingAccount: '0xBfDd843382B36FFbAcd00b190de6Cb85ff840118',

  // Wire-on/off configs.
  centralizedIdentityEnabled: true,
  performanceMode: true,
  proxyAccountsEnabled: true,
  relayerEnabled: true
}
