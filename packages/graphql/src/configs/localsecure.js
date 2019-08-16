const HOST = process.env.HOST || 'localhost'

let addresses = {}
try {
  addresses = require('@origin/contracts/build/contracts.json')
} catch (e) {
  /* No local contracts */
}

const config = {
  provider: `https://${HOST}:8546`,
  providerWS: `wss://${HOST}:8546`,
  ipfsGateway: `https://${HOST}:8081`,
  ipfsRPC: `https://${HOST}:5003`,
  bridge: 'https://bridge.dev.originprotocol.com',
  discovery: `https://${HOST}:4000/graphql`,
  notifications: `http://${HOST}:3456`,
  //growth: 'http://localhost:4001',
  performanceMode: false,
  graphql: `https://${HOST}:4007`,
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
