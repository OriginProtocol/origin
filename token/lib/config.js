const HDWalletProvider = require('truffle-hdwallet-provider')


const ROPSTEN_NETWORK_ID = '3'
const RINKEBY_NETWORK_ID = '4'
const LOCAL_NETWORK_ID = '999'

const DEFAULT_MNEMONIC = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'

/*
 * Parse command line arguments into a dict.
 * @returns {dict} - Parsed arguments.
 */
function parseArgv() {
  const args = {}
  for (const arg of process.argv) {
    const elems = arg.split('=')
    const key = elems[0]
    const val = elems.length > 1 ? elems[1] : true
    args[key] = val
  }
  return args
}

/*
 * Helper function. Creates a config object based on command line arguments.
 * @returns {dict} - Config.
 */
function createProviders(networkIds) {
  const providers = {}

  // Create a provider for each of the network id.
  for (const networkId of networkIds) {
    let mnemonic
    let providerUrl

    switch (networkId) {
    case ROPSTEN_NETWORK_ID:
      if (!process.env.ROPSTEN_MNEMONIC) {
        throw 'Missing ROPSTEN_MNEMONIC env var'
      }
      if (!process.env.INFURA_ACCESS_TOKEN) {
        throw 'Missing INFURA_ACCESS_TOKEN env var'
      }
      mnemonic = process.env.ROPSTEN_MNEMONIC
      providerUrl = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`
      break
    case RINKEBY_NETWORK_ID:
      if (!process.env.RINKEBY_MNEMONIC) {
        throw 'Missing RINKEBY_MNEMONIC env var'
      }
      if (!process.env.INFURA_ACCESS_TOKEN) {
        throw 'Missing INFURA_ACCESS_TOKEN env var'
      }
      mnemonic = process.env.RINKEBY_MNEMONIC
      providerUrl = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`
      break
    case LOCAL_NETWORK_ID:
      mnemonic = process.env.LOCAL_MNEMONIC || DEFAULT_MNEMONIC
      providerUrl = 'http://localhost:8545'
      break
    default:
      throw `Unsupported network id ${networkId}`
    }
    console.log(`Network=${networkId} Url=${providerUrl} Mnemonic=${mnemonic}`)
    providers[networkId] = new HDWalletProvider(mnemonic, providerUrl)
  }
  return providers
}

module.exports = { parseArgv, createProviders }
