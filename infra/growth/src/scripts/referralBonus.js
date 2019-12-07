// Script to give bonus referrals to a set of users.
'use strict'

const csv = require('csvtojson')
const Logger = require('logplease')

const db = require('../models')
const parseArgv = require('../util/args')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('bonus', { showTimestamp: false })

async function run(config) {
  const csvRows = await csv().fromFile(config.filename)
  logger.info(`Loaded ${csvRows.length} rows from ${config.filename}`)

  let line = 1
  let totalRewards = 0
  for (const row of csvRows) {
    const ethAddress = row['eth_address']
    const numReferrals = Number(row['num_referrals'])
    if (!ethAddress || !numReferrals) {
      throw new Error(`Invalid csv row at line ${line}`)
    }

    // Insert <numReferrals> rows in growth_reward
    // Note: may need to adjust those values in the future.
    for (let i = 0; i < numReferrals; i++) {
      if (config.doIt) {
        await db.GrowthReward.create({
          ethAddress,
          campaignId: Number(config.campaignId),
          levelId: 2,
          ruleId: 'Referral',
          amount: 50000000000000000000, // 50 OGN
          currency: 'OGN'
        })
      }
      totalRewards += 50
    }
    logger.info(
      `${
        config.doIt ? 'Inserted' : 'Would insert'
      } ${numReferrals} referral rewards for ${ethAddress}`
    )
    line++
  }
  logger.info(`Granted a total of ${totalRewards} OGN`)
}

/**
 * MAIN
 */
logger.info('Starting referral bonus job.')

const args = parseArgv()
const config = {
  // By default run in dry-run mode unless explicitly specified using persist.
  doIt: args['--doIt'] === 'true' || false,
  // Filename of the input csv. Format <eth_address>,<num_referrals>
  filename: args['--filename'],
  campaignId: args['--campaignId']
}
logger.info('Config:')
logger.info(config)
if (!config.filename) {
  throw new Error('--filename is a mandatory argument')
}
if (!config.campaignId) {
  throw new Error('--campaignId is a mandatory argument')
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
