export default {
  // provider:
  //   'https://eth-mainnet.alchemyapi.io/jsonrpc/FCA-3myPH5VFN8naOWyxDU6VkxelafK6',
  provider: 'https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2',
  // providerWS: 'wss://mainnet.infura.io/ws',
  ipfsGateway: 'https://ipfs.originprotocol.com',
  ipfsRPC: 'https://ipfs.originprotocol.com',
  discovery: 'https://discovery.originprotocol.com',
  growth: 'https://growth.originprotocol.com',
  bridge: 'https://bridge.originprotocol.com',
  IdentityEvents: '0x8ac16c08105de55a02e2b7462b1eec6085fa4d86',
  IdentityEvents_Epoch: '7046530',
  IdentityEvents_EventCache: 'QmYu5bTLHYnFMCxgnWd6ywfasQQCeKbkzrU2UJAedycKQL',
  attestationIssuer: '0x8EAbA82d8D1046E4F242D4501aeBB1a6d4b5C4Aa',
  OriginToken: '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26',
  V00_Marketplace: '0x819bb9964b6ebf52361f1ae42cf4831b921510f9',
  V00_Marketplace_Epoch: '6436157',
  ipfsEventCache: 'QmWyqzZMoQB1zzxJyCAhTZ5XenzX5H8sfE3Uh58uEN3MJh',
  messagingAccount: '0xBfDd843382B36FFbAcd00b190de6Cb85ff840118',
  messaging: {
    messagingNamespace: 'origin',
    globalKeyServer: 'https://messaging.originprotocol.com'
  },
  tokens: [
    {
      id: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      type: 'Standard',
      name: 'DAI Stablecoin',
      symbol: 'DAI',
      decimals: '18'
    },
    {
      id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      type: 'Standard',
      name: 'USDC Stablecoin',
      symbol: 'USDC',
      decimals: '6'
    },
    {
      id: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
      type: 'Standard',
      name: 'Gemini Dollar',
      symbol: 'GUSD',
      decimals: '2'
    }
  ],
  DaiExchange: '0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14',
  affiliate: '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8',
  arbitrator: '0x64967e8cb62b0cd1bbed27bee4f0a6a2e454f06a',
  linker: `https://linking.originprotocol.com`,
  linkerWS: `wss://linking.originprotocol.com`
}
