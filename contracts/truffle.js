var HDWalletProvider = require("truffle-hdwallet-provider");

// Local setup
truffleSetup = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
  },
  solc: { optimizer: { enabled: true, runs: 200 } }
}

// For global test networks and mainnet, set your wallet mnemonic in env
// variable. Assumes we're using first address for that mnemonic.
// In future we might consider prompting for mnemonics:
// https://www.npmjs.com/package/prompt
//
if (process.env.MAINNET_MNEMONIC) {
  truffleSetup.networks.mainnet = {
    provider: function() {
      return new HDWalletProvider(
        process.env.MAINNET_MNEMONIC,
        `https://mainnet.infura.io/${process.env.INFURA_ACCESS_TOKEN}`)
    },
    network_id: 1
  }
}
if (process.env.RINKEBY_MNEMONIC) {
  truffleSetup.networks.rinkeby = {
    provider: function() {
      return new HDWalletProvider(
        process.env.RINKEBY_MNEMONIC,
        `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`)
    },
    network_id: 4
  }
}
if (process.env.ROPSTEN_MNEMONIC) {
  truffleSetup.networks.ropsten = {
    provider: function() {
      return new HDWalletProvider(
        process.env.ROPSTEN_MNEMONIC,
        `https://ropsten.infura.io/${process.env.INFURA_ACCESS_TOKEN}`)
    },
    network_id: 3
  }
}

module.exports = truffleSetup
