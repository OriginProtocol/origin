const Web3 = require('web3')

const Config = require('../lib/config.js')
const Token = require('../lib/token.js')

const DEFAULT_NETWORK_ID = '999' // Local blockchain.


async function run(config) {
  const token = new Token(config)

  switch (config.action) {
  case 'balance':
    // Check wallet balance.
    const balance = await token.balance(config.networkId, config.wallet)
    console.log(`Balance (natural unit)=${balance}`)
    break
  case 'credit':
    // Credit 100 OGN.
    const newBalance = await token.transfer(config.networkId, config.wallet, token.toNaturalUnit(100))
    console.log(`Credited 100 OGN tokens to wallet. New balance (natural unit) = ${newBalance}`)
    break
  default:
    throw `unsupported action ${config.action}`
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
}

try {
  config.providers = Config.createProviders([config.networkId])
} catch (err) {
  console.log('Config error:', err)
  process.exit(-1)
}

run(config)
process.exit(0)