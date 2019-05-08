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
  bridge: `http://${HOST}:5000`,
  notifications: `http://${HOST}:3456`,
  //growth: 'http://localhost:4001',
  automine: 2000,
  attestationIssuer: '0x02c14Ee67799e1dFac9f776F2f4D5dC69Ab3Ee23',
  affiliate: addresses.Affiliate,
  arbitrator: addresses.Arbitrator,
  OriginToken: addresses.OGN,
  V00_Marketplace: addresses.Marketplace,
  V00_Marketplace_Epoch: addresses.MarketplaceEpoch,
  IdentityEvents: addresses.IdentityEvents,
  IdentityEvents_Epoch: addresses.IdentityEventsEpoch,
  DaiExchange: addresses.UniswapDaiExchange,
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
