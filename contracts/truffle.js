const HDWalletProvider = require("truffle-hdwallet-provider")
const PrivateKeyProvider = require('truffle-privatekey-provider')


// How many addresses in wallet should we unlock?
// (For deploying test data, we use other addresses as buyers and sellers)
// Note: This is not used for Mainnet - only for Testnet and local deployment.
const numAddressesToUnlock = 4

// Local setup
truffleSetup = {
  migrations_directory: "./migrations",
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'USD',
      onlyCalledMethods: true
    }
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
  },
  coverage: {
    host: "localhost",
    network_id: "*",
    port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
    gas: 0xfffffffffff, // <-- Use this high gas value
    gasPrice: 0x01      // <-- Use this low gas price
  },
  solc: { optimizer: { enabled: true, runs: 200 } }
}

// When a mnemonic is set, the first address for that mnemonic is used to do the deployment.
// In future we might consider prompting for mnemonics:
// https://www.npmjs.com/package/prompt
//
if (process.env.MAINNET_PRIVATE_KEY || process.env.MAINNET_MNEMONIC) {
  const privateKey = process.env.MAINNET_PRIVATE_KEY
  const mnemonic = process.env.MAINNET_MNEMONIC
  const providerUrl = `https://mainnet.infura.io/${process.env.INFURA_ACCESS_TOKEN}`

  // Private key takes precedence over mnemonic.
  if (privateKey) {
    truffleSetup.networks.mainnet = {
      provider: function() { return new PrivateKeyProvider(privateKey, providerUrl) },
      network_id: 1
    }
    console.log('Configured truffle to use PrivateKey provider for Mainnet.')
  } else {
    truffleSetup.networks.mainnet = {
      provider: function() { return new HDWalletProvider(mnemonic, providerUrl) },
      network_id: 1
    }
    console.log('Configured truffle to use Mnemonic provider for Mainnet.')
  }
}
if (process.env.RINKEBY_MNEMONIC) {
  truffleSetup.networks.rinkeby = {
    provider: function() {
      return new HDWalletProvider(
        process.env.RINKEBY_MNEMONIC,
        `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`,
        0, numAddressesToUnlock)
    },
    network_id: 4
  }
}
if (process.env.ROPSTEN_MNEMONIC) {
  truffleSetup.networks.ropsten = {
    provider: function() {
      return new HDWalletProvider(
        process.env.ROPSTEN_MNEMONIC,
        `https://ropsten.infura.io/${process.env.INFURA_ACCESS_TOKEN}`,
        0, numAddressesToUnlock)
    },
    gas: 3712388,
    network_id: 3
  }
}

// Origin's own test network
if (process.env.ORIGIN_MNEMONIC) {
  truffleSetup.networks.origin = {
    provider: function() {
      return new HDWalletProvider(
        process.env.ORIGIN_MNEMONIC,
        'https://eth.dev.originprotocol.com/rpc',
        0,
        numAddressesToUnlock
      )
    },
    network_id: 2222
  }
}

// These are needed to use ES2015+ syntax, such as import. The token tests
// imported from OpenZeppelin need these.
require('babel-register')
require('babel-polyfill')

module.exports = truffleSetup
