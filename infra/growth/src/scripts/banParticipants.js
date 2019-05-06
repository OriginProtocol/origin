// Tool that runs the fraud model to detect fraudulent accounts and mark them as such.
//  - Scans all Active participants
//  - Check account against whitelist and if match, set growth_participant.whitelisted to true
//  - Run fraud model if positive, update growth_participant.status to 'Banned' and store reason in growth_participant.ban_reason.
'use strict'
const fs = require('fs')

const Logger = require('logplease')

const enums = require('../enums')
const db = require('../models')
const parseArgv = require('../util/args')

//
const whitelistFilename = `${__dirname}/../../data/whitelist.txt`

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('banParticipants', { showTimestamp: false })

let FraudEngine
if (process.env.NODE_ENV === 'production' || process.env.USE_PROD_FRAUD) {
  FraudEngine = require('../fraud/prod')
  logger.info('Loaded PROD fraud engine.')
} else {
  FraudEngine = require('../fraud/dev')
  logger.info('Loaded DEV fraud engine.')
}

/**
 * Helper class that loads the list of whitelisted accounts.
 * Those are typically accounts used for testing.
 */
class Whitelist {
  constructor(filename) {
    this.addresses = {}
    const data = fs.readFileSync(filename).toString()
    const lines = data.split('\n')
    for (const line of lines) {
      const address = line.trim().toLowerCase()
      this.addresses[address] = true
    }
    logger.info(`Loaded ${lines.length} addresses from the whitelist.`)
  }

  match(ethAddress) {
    return this.addresses[ethAddress] || false
  }
}

class BanParticipants {
  constructor(config) {
    this.config = config
    this.stats = {
      numProcessed: 0,
      numWhitelisted: 0,
      numBanned: 0
    }
    this.whitelist = new Whitelist(whitelistFilename)
    this.fraudEngine = new FraudEngine()
  }

  async process() {
    await this.fraudEngine.init()

    // Get list of all growth engine participants that are active and not whitelisted,
    // in account creation date asc order.
    const participants = await db.GrowthParticipant.findAll({
      where: {
        status: enums.GrowthParticipantStatuses.Active,
        whitelisted: false
      },
      order: [['created_at', 'ASC']]
    })

    for (const participant of participants) {
      // Check if participant should be whitelisted.
      if (this.whitelist.match(participant.ethAddress)) {
        if (this.config.persist) {
          await participant.update({ whitelisted: true })
          logger.info('Whitelisted account ', participant.ethAddress)
        } else {
          logger.info('Would whitelist account ', participant.ethAddress)
        }
        this.stats.numWhitelisted++
        // Whitelisted participants do not need to be checked for fraud.
        // Proceed with the next participant record.
        continue
      }

      // Check if participant should be banned according to our fraud model.
      //const data = this.fraudEngine.checkParticipant(participant.ethAddress)
      const data = {}
      if (data.isFraud) {
        logger.info(
          `Banning account ${participant.ethAddress} for ${data.type}`
        )
        await participant.update({
          status: enums.GrowthParticipantStatus.Banned,
          banReason: { type: data.type, data: data.reasons }
        })
        this.stats.numBanned++
        continue
      }
      logger.debug(`Account ${participant.ethAddress} passed fraud checks.`)
      this.stats.numProcessed++
    }
  }
}

/**
 * MAIN
 */
if (require.main === module) {
  logger.info('Starting events verification job.')

  const args = parseArgv()
  const config = {
    // By default run in dry-run mode unless explicitly specified using persist.
    persist: args['--persist'] ? args['--persist'] : false
  }
  logger.info('Config:')
  logger.info(config)

  const job = new BanParticipants(config)

  job
    .process(config)
    .then(() => {
      logger.info('Events verification stats:')
      logger.info(
        '  Number of participants processed:  ',
        job.stats.numProcessed
      )
      logger.info(
        '  Number of participants whitelisted:',
        job.stats.numWhitelisted
      )
      logger.info('  Number of participants banned:     ', job.stats.numBanned)
      logger.info('Finished')
      process.exit()
    })
    .catch(err => {
      logger.error('Job failed: ', err)
      logger.error('Exiting')
      process.exit(-1)
    })
}
