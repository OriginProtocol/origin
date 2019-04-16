let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: `http://localhost:8545`,
  providerWS: `ws://localhost:8545`,
  ipfsGateway: `http://localhost:8080`,
  ipfsRPC: `http://localhost:5002`,
  growth: `http://localhost:4001`,
  bridge: 'http://localhost:5000',
  automine: 2000,
  attestationIssuer: '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101',
  messaging: {
    globalKeyServer: 'http://localhost:6647'
  },
  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  IdentityEvents: addresses.IdentityEvents,
  DaiExchange: addresses.UniswapDaiExchange,
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
