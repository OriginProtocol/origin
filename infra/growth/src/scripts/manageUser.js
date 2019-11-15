// Script to manage growth user accounts in production.
const BigNumber = require('bignumber.js')

const db = require('../models')
const enums = require('../enums')

const Logger = require('logplease')
Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('manageUser', { showTimestamp: false })

const scaling = BigNumber(10).pow(18)

async function _loadAccount(ethAddress) {
  const participant = await db.GrowthParticipant.findOne({
    where: { ethAddress }
  })
  if (!participant) {
    throw new Error(`No growth_participant row associated with ${ethAddress}`)
  }
  return participant
}

async function _loadAccountDetails(ethAddress) {
  // Load events
  logger.info('Events:')
  logger.info('Id\tType\tStatus\tCreatedAt')
  logger.info('=================')
  const events = await db.GrowthEvent.findAll({
    where: { ethAddress },
    order: [['createdAt', 'ASC']]
  })
  for (const e of events) {
    logger.info(`${e.id}\t${e.type.slice(0, 20)}\t${e.status}\t${e.createdAt}`)
  }

  // Load rewards
  logger.info('Rewards')
  logger.info('Id\tCampaignId\tRuleId\tAmount')
  logger.info('=================')
  const rewards = await db.GrowthReward.findAll({
    where: { ethAddress },
    order: [['createdAt', 'ASC']]
  })
  for (const r of rewards) {
    logger.info(
      `${r.id}\t${r.campaignId}\t${r.ruleId}\t${BigNumber(r.amount).dividedBy(
        scaling
      )} OGN`
    )
  }

  // Load referrals
  logger.info('Referrals')
  logger.info('EthAddress\tStatus\tCreatedAt')
  logger.info('=================')
  const referrals = await db.GrowthReferral.findAll({
    where: { referrerEthAddress: ethAddress },
    order: [['createdAt', 'ASC']]
  })
  for (const r of referrals) {
    const referee = _loadAccount(r.refereeEthAddress)
    logger.info(
      `${referee.ethAddress}\t${referee.status}\t${referee.createdAt}`
    )
  }
}

async function banAccount(account, reason) {
  if (!reason) {
    throw new Error(`Can't ban account ${account} without a reason`)
  }

  const participant = await _loadAccount(account)
  // Check account's current status.
  if (participant.status !== 'Active') {
    throw new Error(
      `Can't ban account ${account} status is not Active but ${participant.status}`
    )
  }

  await _loadAccountDetails(account)

  logger.info(`Banning account ${account}`)
  const ban = {
    date: Date.now(),
    overwrite: reason
  }
  await participant.update({
    status: enums.GrowthParticipantStatuses.Banned,
    ban
  })
}

async function closeAccount(account, reason) {
  if (!reason) {
    throw new Error(`Can't close account ${account} without a reason`)
  }

  const participant = await _loadAccount(account)
  // Check account's current status.
  if (participant.status !== 'Active') {
    throw new Error(
      `Can't close account ${account} status is not Active but ${participant.status}`
    )
  }

  await _loadAccountDetails(account)

  logger.info(`Closing account ${account}`)
  const ban = {
    date: Date.now(),
    overwrite: reason
  }
  await participant.update({
    status: enums.GrowthParticipantStatuses.Closed,
    ban
  })
}

async function main(config) {
  switch (config.action) {
    case 'ban':
      await banAccount(config.account, config.reason)
      break
    case 'close':
      await closeAccount(config.account, config.reason)
      break
    default:
      throw new Error(`Invalid action ${config.action}`)
  }
}

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const action = args['--action']
if (!action) {
  logger.error('Missing --action argument')
  process.exit()
}

const account = args['--account']
if (!account) {
  logger.error('Missing --account argument')
  process.exit()
}

const config = {
  action,
  account: account.toLowerCase(),
  reason: args['--reason'],
  doIt: args['--persist'] === 'true' || false
}

main(config)
  .then(() => {
    logger.info('Done')
    process.exit()
  })
  .catch(e => {
    logger.error(e)
    process.exit(-1)
  })
