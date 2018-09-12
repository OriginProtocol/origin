const Web3 = require('web3')

const Config = require('../lib/config.js')
const Token = require('../lib/token.js')

const DEFAULT_NETWORK_ID = '999' // Local blockchain.


async function run(config) {
  const token = new Token(config)

  switch (config.action) {
  case 'balance': {
    // Check wallet balance.
    const balance = await token.balance(config.networkId, config.wallet)
    console.log(`Balance (natural unit)=${balance}`)
    break
  }
  case 'credit': {
    // Credit 100 OGN.
    const newBalance = await token.credit(config.networkId, config.wallet, token.toNaturalUnit(100))
    console.log(`Credited 100 OGN tokens to wallet. New balance (natural unit) = ${newBalance}`)
    break
  }
  case 'address': {
    // Get the address the token contract was deployed to.
    const address = token.contractAddress(config.networkId)
    console.log(`Token contract address = ${address}`)
    break
  }
  case 'pause': {
    config.verbose = true
    await token.pause(config.networkId)
    console.log('Token transfers have been paused.')
    break
  }
  case 'unpause': {
    config.verbose = true
    await token.unpause(config.networkId)
    console.log('Token transfers have been paused.')
    break
  }
  default:
    throw `Unsupported action ${config.action}`
  }
}

//
// Main
//
const args = Config.parseArgv()

const config = {
  // Action: balance, credit, etc...
  action: args['--action'],

  // Network ids, comma separated.
  // If no network ids specified, defaults to using local blockchain.
  networkId: args['--network_id'] || DEFAULT_NETWORK_ID,

  // Target wallet for the action.
  wallet: args['--wallet'],

  // Verbose logs.
  verbose: false,
}

try {
  config.providers = Config.createProviders([config.networkId])
} catch (err) {
  console.log('Config error:', err)
  process.exit(-1)
}

run(config)
  .then(() => {process.exit(0)})
  .catch((err) => { console.trace(err); process.exit(-1) })
