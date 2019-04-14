const HOST = process.env.HOST || 'localhost'
const LINKER_HOST = process.env.LINKER_HOST || HOST

export default {
  provider: `http://${HOST}:8545`,
  providerWS: `ws://${HOST}:8545`,
  ipfsGateway: `http://${HOST}:8080`,
  ipfsRPC: `http://${HOST}:5002`,
  bridge: 'https://bridge.dev.originprotocol.com',
  automine: 2000,
  affiliate: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
  attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
  arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
  linker: `http://${LINKER_HOST}:3008`,
  linkerWS: `ws://${LINKER_HOST}:3008`
}
