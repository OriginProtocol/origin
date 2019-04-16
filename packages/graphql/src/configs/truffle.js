const HOST = process.env.HOST || 'localhost'

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
  growth: `http://${HOST}:4001`,
  bridge: `http://${HOST}:5000`,
  automine: 2000,
  attestationIssuer: '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101',
  messaging: {
    globalKeyServer: 'http://${HOST}:6647'
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
