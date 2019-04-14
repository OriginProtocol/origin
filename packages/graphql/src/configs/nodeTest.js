const HOST = process.env.HOST || 'localhost'

export default {
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  affiliate: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
  attestationIssuer: '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101',
  arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544'
  // automine: 500
}
