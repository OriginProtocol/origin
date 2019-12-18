// Script to mass enqueue T3 transfers.
// FOR TESTING ONLY - DO NO USE ON MAINNET
'use strict'

const Web3 = require('web3')
const Logger = require('logplease')

const db = require('../models')
const enums = require('../enums')

const { networkId } = require('../config')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('enqueue', { showTimestamp: false })

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

async function run(config) {
  let totalAmount = 0
  for (let i = 0; i < config.num; i++) {
    // Pick a random amount of OGN between 1 and 100.
    const amount = 1 + Math.floor(Math.random() * 100)
    totalAmount += amount
    if (config.doIt) {
      await db.Transfer.create({
        userId: config.userId,
        status: enums.TransferStatuses.Enqueued,
        toAddress: config.toAddress.toLowerCase(),
        amount,
        currency: 'OGN',
        data: { note: `Test transfer num ${i}` }
      })
    } else {
      logger.info(`Would enqueue transfer ${i} for ${amount} OGN`)
    }
  }
  logger.info(
    `Enqueued ${config.num} transfers for a total of ${totalAmount} OGN`
  )
}

/**
 * MAIN
 */
logger.info('Starting EnqueueTestTransfer job.')

if (networkId === 1) {
  throw new Error('Not for use on Mainnet!')
}

const args = parseArgv()
const config = {
  // By default run in dry-run mode.
  doIt: args['--doIt'] === 'true' || false,
  // Number of transfers to enqueue.
  num: args['--num'],
  // Id of the user requesting the transfers.
  userId: args['--userId'],
  // Recipient address for tokens distribution.
  toAddress: args['--toAddress']
}
logger.info('Config:')
logger.info(config)
if (!config.num) {
  throw new Error('--num is a mandatory argument')
}
if (!config.userId) {
  throw new Error('--userId is a mandatory argument')
}
if (!config.toAddress) {
  throw new Error('--toAddress is a mandatory argument')
}
if (!Web3.utils.isAddress(config.toAddress)) {
  throw new Error('Address is invalid')
}

run(config)
  .then(() => {
    logger.info('Finished')
    process.exit()
  })
  .catch(err => {
    logger.error('Job failed: ', err)
    logger.error('Exiting')
    process.exit(-1)
  })
