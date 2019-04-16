export default {
  provider:
    'https://eth-rinkeby.alchemyapi.io/jsonrpc/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI',
  // provider: 'https://rinkeby.infura.io',
  // providerWS: 'wss://rinkeby.infura.io/ws',
  ipfsGateway: 'https://ipfs.staging.originprotocol.com',
  ipfsRPC: `https://ipfs.staging.originprotocol.com`,
  discovery: 'https://discovery.staging.originprotocol.com',
  growth: 'https://growth.staging.originprotocol.com',
  bridge: 'https://bridge.staging.originprotocol.com',
  IdentityEvents: '0x160455a06d8e5aa38862afc34e4eca0566ee4e7e',
  IdentityEvents_Epoch: '3670528',
  OriginToken: '0xa115e16ef6e217f7a327a57031f75ce0487aadb8',
  V00_Marketplace: '0xe842831533c4bf4b0f71b4521c4320bdb669324e',
  V00_Marketplace_Epoch: '3086315',
  ipfsEventCache: 'QmYqzB3WE4YzyxD9ptQnG6UURw1CR1hj1siqVry4Da2GLx',
  affiliate: '0xc1a33cda27c68e47e370ff31cdad7d6522ea93d5',
  arbitrator: '0xc9c1a92ba54c61045ebf566b154dfd6afedea992',
  messaging: {
    messagingNamespace: 'origin:staging',
    globalKeyServer: 'https://messaging.staging.originprotocol.com'
  },
  messagingAccount: '0xA9F10E485DD35d38F962BF2A3CB7D6b58585D591',
  linker: `https://linking.staging.originprotocol.com`,
  linkerWS: `wss://linking.staging.originprotocol.com`,
  linkingEnabled: true,
  DaiExchange: '0x77dB9C915809e7BE439D2AB21032B1b8B58F6891',
  tokens: [
    {
      id: '0x2448eE2641d78CC42D7AD76498917359D961A783',
      type: 'Standard',
      name: 'DAI Stablecoin',
      symbol: 'DAI',
      decimals: '18'
    }
  ]
}
