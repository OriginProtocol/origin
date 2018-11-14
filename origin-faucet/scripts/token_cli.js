const path = require('path')

const Config = require('../lib/config.js')
const Token = require('../lib/token.js')
const Marketplace = require('../lib/marketplace.js')

const DEFAULT_NETWORK_ID = '999' // Local blockchain.

const command = `node ${path.basename(__filename)}`
const usage = `
syntax: ${command} --action=ACTION ...

-----------------------------------------------------------------------------

Token Actions

Print status of token contract:
${command} --action=status [--network_id=NETWORK_ID]

Transfer 100 OGN to ADDRESS:
${command} --action=credit [--network_id=NETWORK_ID] --address=ADDRESS

Print OGN balance for ADDRESS:
${command} --action=balance [--network_id=NETWORK_ID] --address=ADDRESS

Pause all token transfers and approvals:
${command} --action=pause [--network_id=NETWORK_ID]

Unpause all token transfers and approvals:
${command} --action=unpause [--network_id=NETWORK_ID]

Set owner of token contract to ADDRESS:
${command} --action=setTokenOwner --address=ADDRESS [--network_id=NETWORK_ID]

-----------------------------------------------------------------------------

Marketplace Actions

Print status of all marketplace contracts:
${command} --action=marketplaceStatus [--network_id=NETWORK_ID]

Set owner of marketplace contract to ADDRESS:
${command} --action=setMarketplaceOwner --contract=CONTRACT_NAME --address=ADDRESS [--network_id=NETWORK_ID]

Set token contract address for marketplace contract:
${command} --action=setMarketplaceTokenAddress --contract=CONTRACT_NAME--address=ADDRESS [--network_id=NETWORK_ID]

CONTRACT_NAME is the name the contract on which to perform the action. For
example: --contract=V00_Marketplace

-----------------------------------------------------------------------------

General parameters

--network_id defaults to 999 (local blockchain)
`

function errorAndExit(/* all args are logged */) {
  console.error('ERROR:', ...arguments)
  console.error(usage)
  process.exit(-1)
}

async function run(config) {
  const token = new Token(config)
  const marketplace = new Marketplace(config)

  if (!config.networkId) {
    errorAndExit('--network_id=NETWORK_ID must be specified')
  }

  switch (config.action) {
  case 'balance': {
    // Check wallet balance.
    if (!config.address) {
      errorAndExit('--address=ADDRESS must be specified')
    }
    const balance = await token.balance(config.networkId, config.address)
    const displayBalance = balance.toFixed(0)
    console.log(`Balance (natural unit) = ${displayBalance}`)
    const displayOgnBalance = token.toTokenUnit(balance).toFixed(5)
    console.log(`Balance (in OGN) = ${displayOgnBalance}`)
    break
  }
  case 'credit': {
    // Credit 100 OGN.
    if (!config.address) {
      errorAndExit('--address=ADDRESS must be specified')
    }
    const receipt = await token.credit(config.networkId, config.address, token.toNaturalUnit(100))
    if (!config.multisig) {
      console.log(`Credited 100 OGN tokens to wallet. Txn receipt = ${receipt}`)
    }
    break
  }
  case 'pause': {
    config.verbose = true
    await token.pause(config.networkId)
    if (!config.multisig) {
      console.log('Token transfers have been paused.')
    }
    break
  }
  case 'unpause': {
    config.verbose = true
    await token.unpause(config.networkId)
    if (!config.multisig) {
      console.log('Token transfers have been unpaused.')
    }
    break
  }
  case 'setTokenOwner': {
    config.verbose = true
    if (!config.address) {
      errorAndExit('--address=ADDRESS needs to be specified')
    }
    await token.setOwner(config.networkId, config.address)
    console.log(`Contract owner set to ${config.address}`)
    break
  }
  case `status`: {
    await token.logStatus(config.networkId)
    break
  }
  // Marketplace actions. These are shoehorned in here due to time constraints.
  // TODO: move these to a separate marketplace CLI
  case `marketplaceStatus`: {
    await marketplace.logStatus(config.networkId)
    break
  }
  case 'setMarketplaceOwner': {
    config.verbose = true
    if (!config.address) {
      errorAndExit('--address=ADDRESS needs to be specified')
    }
    if (!config.contractName) {
      errorAndExit('--contract=CONTRACT_NAME must be specified')
    }
    await marketplace.setOwner(config.networkId, config.contractName, config.address)
    console.log(`${config.contractName} owner set to ${config.address}`)
    break
  }
  case 'setMarketplaceTokenAddress': {
    config.verbose = true
    if (!config.address) {
      errorAndExit('--address=ADDRESS needs to be specified')
    }
    if (!config.contractName) {
      errorAndExit('--contract=CONTRACT_NAME must be specified')
    }
    await marketplace.setTokenAddress(
      config.networkId,
      config.contractName,
      config.address
    )
    break
  }
  case undefined:
    errorAndExit('--action=ACTION must be specified')
    break
  default:
    errorAndExit(`Unsupported action ${config.action}`)
    break
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

  // Target address for the action.
  address: args['--address'],

  // Verbose logs.
  verbose: args['--verbose'],

  // When the sender of a contract call is a multisig wallet, this contains the
  // address of the multisig wallet.
  multisig: args['--multisig'],

  // Name of contract, to disambiguate when there are multiple active contracts
  // that serve the same function.
  contractName: args['--contract'],

  // Override owner whitelist. NEVER use this unless you're on a local dev
  // blockchain.
  overrideOwnerWhitelist: args['--OVERRIDE_OWNER_WHITELIST_DO_NOT_USE'],
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
