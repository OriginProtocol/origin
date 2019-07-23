/*
  Script that loads transfer requests enqueued in the DB and submits them to the blockchain.

  Transactions are executed serially. For each transaction, the script waits
  for blockchain confirmation before processing the next one.

  Since we are dealing with large amount of tokens, we err on the safe side and
  any single failure is considered fatal. It stops any further processing as part
  of the current job or subsequent runs of the job until an operator gets a
  chance to manually review the issue.
 */

const fs = require('fs')
const Logger = require('logplease')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('execTransfer')

const { Transfer } = require('../models')
const { executeTransfer } = require('../lib/transfer')
const enums = require('../enums')

logger.info('Starting rewards distribution job.')

class TransferProcessor {
  constructor(config) {
    this.config = config
    this.stats = {
      numTransfers: 0,
      numTransfersSuccess: 0,
      numTransfersFailed: 0,
      totalAmount: 0
    }
  }

  _preflight() {
    // Check on an already existing watchdog.
    if (fs.existsSync(this.config.watchdog)) {
      throw new Error(`Watchdog detected at ${this.config.watchdog}. Processing aborted.`)
    }
    // Create a watchdog for this run.
    fs.writeFileSync(this.config.watchdog, `Pid ${process.pid}`)
  }

  async run() {
    this._preflight()

    // Load all the pending transfers.
    const transfers = await Transfer.findAll({
      where: {
        status: enums.TransferStatuses.Enqueued
      }
    })
    logger.info(`Loaded ${transfers.length} pending transfers.`)

    // Process transfers serially.
    for (const transfer of transfers) {
      logger.info(`Processing transfer ${transfer.id}`)
      const result = executeTransfer(transfer, { networkId: this.config.networkId })
      logger.info(`Processed transfer ${transfer.id}. Status: ${result.txStatus} TxHash: ${result.txHash}`)
    }
  }

  async shutdown() {
    // Clean watchdog.
    fs.unlinkSync(this.config.watchdog)
  }
}

/*
 * Parse command line arguments into a dict.
 * @returns {Object} - Parsed arguments.
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

// Parse config.
const args = parseArgv()
const config = {
  // 1=Mainnet, 4=Rinkeby, 999=Local.
  networkId: parseInt(args['--networkId'] || process.env.NETWORK_ID || 0),
  // By default run in dry-run mode unless explicitly specified using doIt.
  watchdog: args['--watchdog'],
  doIt: args['--doIt'] === 'true' || false,
}
logger.info('Config:')
logger.info(config)

if (!config.networkId) {
  throw new Error('networkId is a mandatory config.')
}
if (!config.watchdog) {
  throw new Error('watchdog is a mandatory config')
}


// Initialize the job and start it.
const processor = new TransferProcessor(config)
processor.run()
  .then(() => {
    logger.info('TransferProcessor stats:')
    logger.info('  Num transfer processed:', processor.stats.numTransfers)
    logger.info('  Num transfer success:  ', processor.stats.numTransfersSuccess)
    logger.info('  Num transfer failed:   ', processor.stats.numTransfersFailed)
    logger.info('  Total OGN distributed: ', processor.stats.totalAmount)

    processor.shutdown().then(() => {
      logger.info('Finished')
      process.exit()
    })
  })
  .catch((e) => {
    logger.error('TransferProcessor failure:', e)
    // Note: we exit without removing the processor watchdog to force an operator to
    // manually look at the failure before the processor runs again.
    process.exit(-1)
  })



