const HDWalletProvider = require('truffle-hdwallet-provider')
const PrivateKeyProvider = require('truffle-privatekey-provider')

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
    let privateKey

    switch (networkId) {
    case ROPSTEN_NETWORK_ID:
      privateKey = process.env.ROPSTEN_PRIVATE_KEY
      mnemonic = process.env.ROPSTEN_MNEMONIC
      if (!privateKey && !mnemonic) {
        throw 'Must have either ROPSTEN_PRIVATE_KEY or ROPSTEN_MNEMONIC env var'
      }
      if (!process.env.INFURA_ACCESS_TOKEN) {
        throw 'Missing INFURA_ACCESS_TOKEN env var'
      }
      providerUrl = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`
      break
    case RINKEBY_NETWORK_ID:
      privateKey = process.env.RINKEBY_PRIVATE_KEY
      mnemonic = process.env.RINKEBY_MNEMONIC
      if (!privateKey && !mnemonic) {
        throw 'Must have either RINKEBY_PRIVATE_KEY or RINKEBY_MNEMONIC env var'
      }
      if (!process.env.INFURA_ACCESS_TOKEN) {
        throw 'Missing INFURA_ACCESS_TOKEN env var'
      }

      providerUrl = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`
      break
    case LOCAL_NETWORK_ID:
      privateKey = process.env.LOCAL_PRIVATE_KEY
      mnemonic = process.env.LOCAL_MNEMONIC || DEFAULT_MNEMONIC
      providerUrl = 'http://localhost:8545'
      break
    default:
      throw `Unsupported network id ${networkId}`
    }
    // Private key takes precedence
    if (privateKey) {
      console.log(`Network=${networkId} URL=${providerUrl} Using private key`)
      providers[networkId] = new PrivateKeyProvider(privateKey, providerUrl)
    } else {
      console.log(`Network=${networkId} Url=${providerUrl} Mnemonic=${mnemonic}`)
      providers[networkId] = new HDWalletProvider(mnemonic, providerUrl)
    }
  }
  return providers
}

module.exports = { parseArgv, createProviders }
