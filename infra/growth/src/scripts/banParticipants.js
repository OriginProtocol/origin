// Tool that runs the fraud model to detect fraudulent accounts and mark them as such.
//  - Scans all Active participants
//  - Check account against whitelist and if match, set growth_participant.whitelisted to true
//  - Run fraud model if positive, update growth_participant.status to 'Banned' and store reason in growth_participant.ban_reason.
'use strict'
const fs = require('fs')

const Logger = require('logplease')

const enums = require('../enums')
const _growthModels = require('../models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const parseArgv = require('../util/args')
const { SdnMatcher } = require('../util/sdnMatcher')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('banParticipants', { showTimestamp: false })

let FraudEngine, employeesFilename, trustedFilename
if (process.env.NODE_ENV === 'production' || process.env.USE_PROD_FRAUD) {
  FraudEngine = require('../fraud/prod/engine')
  employeesFilename = `${__dirname}/../fraud/prod/data/employees.txt`
  trustedFilename = `${__dirname}/../fraud/prod/data/trusted.txt`
  logger.info('Loaded PROD fraud engine.')
} else {
  FraudEngine = require('../fraud/dev/engine')
  employeesFilename = `${__dirname}/../fraud/dev/data/employees.txt`
  trustedFilename = `${__dirname}/../fraud/dev/data/trusted.txt`
  logger.info('Loaded DEV fraud engine.')
}

/**
 * Helper class that checks if a participant is an employee by checking
 * two sources:
 *  1. List of ETH addresses self-reported by employees
 *  2. Email stored in the identity (looks for @originprotocol.com domain in the email).
 * Employee accounts are exempt from fraud check but do not get any reward payout.
 */
class OriginEmployees {
  constructor(filename) {
    this.addresses = {}
    const data = fs.readFileSync(filename).toString()
    const lines = data.split('\n')
    for (const line of lines) {
      if (line.match(/\s+#.+/g)) {
        continue
      }
      const address = line.trim().toLowerCase()
      this.addresses[address] = true
    }
    logger.info(`Loaded ${lines.length} employee addresses.`)
  }

  async match(ethAddress) {
    const identity = await db.Identity.findOne({ where: { ethAddress } })
    const employeeEmail = identity && identity.email && identity.email.toLowerCase().indexOf('@originprotocol.com') !== -1
    const employeeAddress = this.addresses[ethAddress] !== undefined
    return employeeEmail || employeeAddress
  }
}

/**
 * Helper class that loads the list of trusted accounts.
 * These accounts are exempt from fraud check.
 */
class TrustedAccounts {
  constructor(filename) {
    this.addresses = {}
    const data = fs.readFileSync(filename).toString()
    const lines = data.split('\n')
    for (const line of lines) {
      if (line.startsWith('#')) {
        continue
      }
      const address = line.trim().toLowerCase()
      this.addresses[address] = true
    }
    logger.info(`Loaded ${lines.length} trusted addresses.`)
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
      numEmployeesTagged: 0,
      numTrustedTagged: 0,
      numBanned: 0,
      numBannedSdn: 0,
      numBannedReferrer: 0,
      numBannedDupe: 0
    }
    this.employees = new OriginEmployees(employeesFilename)
    this.trusted = new TrustedAccounts(trustedFilename)
    this.sdnMatcher = new SdnMatcher()
    this.fraudEngine = new FraudEngine()
  }

  /**
   * Returns an object if the identity associated with the ethAddress tests positive
   * against the SDN blacklist, null otherwise.
   *
   * @param ethAddress
   * @returns {Promise<Object|null>}
   * @private
   */
  async _matchSdn(ethAddress) {
    const identity = await db.Identity.findOne({ where: { ethAddress } })
    if (!identity) {
      return null
    }
    const match = this.sdnMatcher.match(identity.firstName, identity.lastName)
    if (match) {
      const reason = `Name ${identity.firstName} ${identity.lastName} matches against SDN list`
      return { type: 'SdnMatch', reasons: [reason] }
    }
    return null
  }

  async _banParticipant(participant, banData) {
    if (this.config.persist) {
      logger.info(
        `Banning account ${participant.ethAddress} - Ban type: ${banData.type} reasons: ${banData.reasons}`
      )
      // Change status to banned and add the ban data.
      await participant.update({
        status: enums.GrowthParticipantStatuses.Banned,
        ban: banData
      })
    } else {
      logger.info(
        `Would ban account ${participant.ethAddress} - Ban type: ${banData.type} reasons: ${banData.reasons}`
      )
    }
  }

  async process() {
    await this.fraudEngine.init()

    // Get list of all growth engine participants that are active and not whitelisted,
    // in account creation date asc order.
    let participants = await db.GrowthParticipant.findAll({
      where: {
        status: enums.GrowthParticipantStatuses.Active,
        employee: false,
        trusted: false
      },
      order: [['created_at', 'ASC']]
    })

    for (const participant of participants) {
      const address = participant.ethAddress

      this.stats.numProcessed++

      let isEmployee, isTrusted

      // Check if participant is an employee and if yes mark them as such.
      if (await this.employees.match(address)) {
        if (this.config.persist) {
          await participant.update({ employee: true })
          logger.info('Setting employee flag on account ', address)
        } else {
          logger.info('Would set employee flag on account ', address)
        }
        this.stats.numEmployeesTagged++
        isEmployee = true
      }

      // Check if participant is trusted and if yes mark them as such.
      if (this.trusted.match(address)) {
        if (this.config.persist) {
          await participant.update({ trusted: true })
          logger.info('Setting trusted flag on account ', address)
        } else {
          logger.info('Would set trusted flag on account ', address)
        }
        this.stats.numTrustedTagged++
        isTrusted = true
      }

      if (isEmployee || isTrusted) {
        // Trusted and employee accounts do not get checked for fraud.
        // Proceed with the next participant record.
        continue
      }

      // Check if participant should be banned according to the government SDN list.
      const sdn = await this._matchSdn(address)
      if (sdn) {
        await this._banParticipant(participant, sdn)
        this.stats.numBanned++
        this.stats.numBannedSdn++
        continue
      }

      // Check if the participant is a duplicate account
      const fraud = await this.fraudEngine.isDupeAccount(address)
      if (fraud) {
        await this._banParticipant(participant, fraud)
        this.stats.numBanned++
        this.stats.numBannedDupe++
        continue
      }
      logger.debug(`Account ${address} passed dupe fraud checks.`)
    }

    //
    // Do a second pass focusing on detecting fraudulent referrers.
    //
    participants = await db.GrowthParticipant.findAll({
      where: {
        status: enums.GrowthParticipantStatuses.Active,
        employee: false,
        trusted: false
      },
      order: [['created_at', 'ASC']]
    })
    for (const participant of participants) {
      const address = participant.ethAddress

      // Check if the participant is a fraudulent referrer account
      const fraud = await this.fraudEngine.isFraudReferrerAccount(address)
      if (fraud) {
        // TODO: also consider banning all referees of fraudulent referrer.
        await this._banParticipant(participant, fraud)
        this.stats.numBanned++
        this.stats.numBannedReferrer++
        continue
      }
      logger.debug(`Account ${address} passed fraud referrer checks.`)
    }

    logger.info('Detailed FraudEngine stats:')
    logger.info(this.fraudEngine.stats)
  }
}

/**
 * MAIN
 */
if (require.main === module) {
  logger.info('Starting ban participant job.')

  const args = parseArgv()
  const config = {
    // By default run in dry-run mode unless explicitly specified using persist.
    persist: args['--persist'] === 'true' || false
  }
  logger.info('Config:')
  logger.info(config)

  const job = new BanParticipants(config)

  job
    .process(config)
    .then(() => {
      logger.info('================================')
      logger.info('Ban particpant stats:')
      logger.info(
        '  Total number of participants processed:  ',
        job.stats.numProcessed
      )
      logger.info(
        '  Number of participants tagged as employees:',
        job.stats.numEmployeesTagged
      )
      logger.info(
        '  Number of participants tagged as trusted:',
        job.stats.numTrustedTagged
      )
      logger.info(
        '  Total number of participants banned:       ',
        job.stats.numBanned
      )
      logger.info(
        '  Number of participants banned due to SDN match:     ',
        job.stats.numBannedSdn
      )
      logger.info(
        '  Number of participants banned as dupe:     ',
        job.stats.numBannedDupe
      )
      logger.info(
        '  Number of participants banned as referrer: ',
        job.stats.numBannedReferrer
      )
      logger.info('Finished')
      process.exit()
    })
    .catch(err => {
      logger.error('Job failed: ', err)
      logger.error('Exiting')
      process.exit(-1)
    })
}
