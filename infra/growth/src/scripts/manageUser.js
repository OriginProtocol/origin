// Script to manage growth user accounts in production.
const BigNumber = require('bignumber.js')
const Sequelize = require('sequelize')

const _growthModels = require('../models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._identityModels }
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
  logger.info('Wallet: ', ethAddress)
  // Load proxy, if it exists.
  const proxy = await db.Proxy.findOne({ where: { ownerAddress: ethAddress } })
  const addresses = [ethAddress]
  if (proxy) {
    addresses.push(proxy.address)
    logger.info('Proxy: ', proxy.address)
  }
  logger.info('\n')

  // Load identity
  const i = await db.Identity.findOne({ where: { ethAddress } })
  if (i) {
    logger.info('Identity:')
    logger.info('First/LastName\tCountry\tEmail\tPhone\tTwitter\tCreatedAd')
    logger.info('------------------------------------')
    logger.info(
      `${i.firstName} ${i.lastName}\t${i.country}\t${i.email}\t${i.phone}\t${
        i.twitter
      }\t${i.createdAt.toLocaleString()}`
    )
  } else {
    logger.info('NO Identity!')
  }
  logger.info('\n')

  // Load events
  logger.info('Events:')
  logger.info('Id\tType\tStatus\tCreatedAt')
  logger.info('------------------------------------')
  const events = await db.GrowthEvent.findAll({
    where: { ethAddress: { [Sequelize.Op.in]: addresses } },
    order: [['createdAt', 'ASC']]
  })
  for (const e of events) {
    logger.info(
      `${String(e.id).padEnd(8, ' ')}${e.type
        .slice(0, 20)
        .padEnd(20, ' ')}${e.status.padEnd(
        10,
        ' '
      )}\t${e.createdAt.toLocaleString()}`
    )
  }
  logger.info('\n')

  // Load referrals
  logger.info('Referrals')
  logger.info('EthAddress\tStatus\tCreatedAt')
  logger.info('------------------------------------')
  const referrals = await db.GrowthReferral.findAll({
    where: { referrerEthAddress: ethAddress },
    order: [['createdAt', 'ASC']]
  })
  for (const r of referrals) {
    const referee = await _loadAccount(r.refereeEthAddress)
    logger.info(
      `${referee.ethAddress}\t${
        referee.status
      }\t${referee.createdAt.toLocaleString()}`
    )
  }
  logger.info('\n')

  // Load rewards
  logger.info('Rewards')
  logger.info('Id\tCampaignId\tRuleId\tAmount')
  logger.info('------------------------------------')
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
  logger.info('\n')

  // Load payouts
  logger.info('Payouts')
  logger.info('CampaignId\tAmount\tDate')
  logger.info('------------------------------------')
  const payouts = await db.GrowthPayout.findAll({
    where: { toAddress: ethAddress },
    order: [['createdAt', 'ASC']]
  })
  for (const p of payouts) {
    logger.info(
      `${p.campaignId}\t${BigNumber(p.amount).dividedBy(
        scaling
      )} OGN\t${p.createdAt.toLocaleString()}`
    )
  }
  logger.info('\n')

  return addresses
}

async function banAccount(account, type, reason, doIt) {
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

  const ban = {
    date: Date.now(),
    type,
    reasons: [reason]
  }
  if (doIt) {
    await participant.update({
      status: enums.GrowthParticipantStatuses.Banned,
      ban
    })
    logger.info(`Banned account ${account}`)
  } else {
    logger.info(`Would ban account ${account}`)
  }
}

async function closeAccount(account, type, reason, doIt) {
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

  const ban = {
    date: Date.now(),
    type,
    reasons: [reason]
  }
  if (doIt) {
    await participant.update({
      status: enums.GrowthParticipantStatuses.Closed,
      ban
    })
    logger.info(`Closed account ${account}`)
  } else {
    logger.info(`Would close account ${account}`)
  }
}

async function unbanAccount(account, doIt) {
  const participant = await _loadAccount(account)
  // Check account's current status.
  if (participant.status !== 'Banned') {
    throw new Error(
      `Can't unban account ${account} status is not Banned but ${participant.status}`
    )
  }

  const addresses = await _loadAccountDetails(account)
  const events = await db.GrowthEvent.findAll({
    where: {
      ethAddress: { [Sequelize.Op.in]: addresses },
      status: enums.GrowthEventStatuses.Fraud
    }
  })

  if (doIt) {
    // Update the account's growth_participant record status to Active.
    await participant.update({
      status: enums.GrowthParticipantStatuses.Active,
      ban: null
    })
    // Change status of all growth_events from Fraud to Verified.

    for (const event of events) {
      await event.update({ status: enums.GrowthEventStatuses.Verified })
    }
    logger.info(`Changed status of ${events.length} events to Verified`)
    logger.info(`Unbanned account ${account}`)
  } else {
    logger.info(
      `Would unban account ${account} and change the status of ${events.length} events`
    )
  }
}

async function viewAccount(account) {
  const participant = await _loadAccount(account)
  logger.info('Status:', participant.status)
  logger.info(
    'Ban data:',
    participant.data ? JSON.stringify(participant.data, null, 2) : 'null'
  )
  await _loadAccountDetails(account)
}

async function main(config) {
  switch (config.action) {
    case 'view':
      await viewAccount(config.account)
      break
    case 'ban':
      await banAccount(config.account, config.type, config.reason, config.doIt)
      break
    case 'close':
      await closeAccount(
        config.account,
        config.type,
        config.reason,
        config.doIt
      )
      break
    case 'unban':
      await unbanAccount(config.account, config.doIt)
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
  type: args['--type'] || 'ManualReview',
  doIt: args['--doIt'] === 'true' || false
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
