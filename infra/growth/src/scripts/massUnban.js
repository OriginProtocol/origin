// Script to mass unban accounts.
//
// Takes as input a csv file with entries having the following format:
//   <eth_address_to_unban>,<optional_eth_address_to_close>
//
// Outputs a payout file that can be fed to the adjustPayout.js script.
//

const BigNumber = require('bignumber.js')
const fs = require('fs')
const Sequelize = require('sequelize')

const _growthModels = require('../models')
const _identityModels = require('@origin/identity/src/models')
const db = { ..._growthModels, ..._identityModels }
const enums = require('../enums')
const { GrowthCampaign } = require('../resources/campaign')

const Logger = require('logplease')
Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('massUnban', { showTimestamp: false })

const scaling = BigNumber(10).pow(18)

class MassUnban {
  constructor(config) {
    this.config = config
    this.stats = {
      numUnbanned: 0,
      numClosed: 0,
      numPayouts: 0,
      totalPayout: 0
    }
    this.entries = []
    this.payouts = []
    this._loadInpu(config.input)
  }

  _loadInpu(filename) {
    const data = fs.readFileSync(filename).toString()
    const lines = data.split('\n')
    for (const line of lines) {
      if (!line.length || line.match(/\s+#.+/g)) {
        continue
      }
      const parts = line.split(',')
      if (parts.length > 2) {
        throw new Error(`Invalid line: ${line}`)
      }
      const addressToUnban = parts[0].trim().toLowerCase()
      const addressToClose =
        parts.length === 2 ? parts[1].trim().toLowerCase() : null

      if (!addressToUnban) {
        throw new Error(`Invalid ETH address at line: ${line}`)
      }

      this.entries.push({ addressToUnban, addressToClose })
    }
    logger.info(`Loaded a total of ${this.entries.length} entries.`)
  }

  async _loadAccount(ethAddress) {
    const participant = await db.GrowthParticipant.findOne({
      where: { ethAddress }
    })
    if (!participant) {
      throw new Error(`No growth_participant row associated with ${ethAddress}`)
    }
    return participant
  }

  async _loadAccountDetails(ethAddress) {
    logger.info('Wallet: ', ethAddress)
    // Load proxy, if it exists.
    const proxy = await db.Proxy.findOne({
      where: { ownerAddress: ethAddress }
    })
    const addresses = [ethAddress]
    if (proxy) {
      addresses.push(proxy.address)
      logger.info('Proxy: ', proxy.address)
    }

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

    // Load admin activity.
    const activities = await db.GrowthAdminActivity.findAll({
      where: { ethAddress }
    })
    logger.info('Admin activity')
    logger.info('Action\tData\tCreatedAd')
    logger.info('------------------------------------')
    for (const a of activities) {
      logger.info(`${a.action}\t${a.data}\t${a.createdAt}`)
    }

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

    // Load referrals
    logger.info('Referrals')
    logger.info('EthAddress\tStatus\tCreatedAt')
    logger.info('------------------------------------')
    const referrals = await db.GrowthReferral.findAll({
      where: { referrerEthAddress: ethAddress },
      order: [['createdAt', 'ASC']]
    })
    for (const r of referrals) {
      const referee = await this._loadAccount(r.refereeEthAddress)
      logger.info(
        `${referee.ethAddress}\t${
          referee.status
        }\t${referee.createdAt.toLocaleString()}`
      )
    }

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

    return addresses
  }

  // Calculate owed payout for an account that was banned.
  // Returns amount owed in token units or zero if nothing is owed.
  async _calcPayout(account) {
    // Load all past campaigns that have already been distributed.
    const campaigns = await GrowthCampaign.getDistributed()
    if (!campaigns) {
      logger.info('Did not find any campaign already distributed')
      return BigNumber(0)
    }

    let startCampaignId = campaigns[0].campaign.id

    // Look for the most recent payout date, if any.
    const payout = await db.GrowthPayout.findOne({
      where: { toAddress: account },
      order: [['id', 'DESC']]
    })
    if (payout) {
      startCampaignId = payout.campaignId + 1
    }
    // Calculate the due rewards for each campaign starting at startCampaignId.
    let total = BigNumber(0)
    for (const campaign of campaigns.filter(
      c => c.campaign.id >= startCampaignId
    )) {
      const rewards = await campaign.getEarnedRewards(account, {
        allEvents: true
      })
      const amount =
        rewards.length === 0
          ? BigNumber(0)
          : rewards
              .map(reward => BigNumber(reward.value.amount))
              .reduce((v1, v2) => v1.plus(v2))
              .dividedBy(scaling) // convert to token unit.
      logger.info(
        `Campaign ${campaign.campaign.nameKey}: Found unpaid earnings of ${amount} OGN`
      )
      total = total.plus(amount)
    }
    logger.info(`Found total unpaid earnings of ${total} OGN`)
    return total.toNumber()
  }

  async _closeAccount(account, unbannedAccount) {
    const participant = await this._loadAccount(account)
    // Check account's current status.
    if (participant.status !== 'Active') {
      throw new Error(
        `Can't close account ${account} status is not Active but ${participant.status}`
      )
    }

    await this._loadAccountDetails(account)

    const ban = {
      date: Date.now(),
      type: 'Manual Review',
      reasons: ['Customer request (duplicate account)']
    }
    if (this.config.doIt) {
      await participant.update({
        status: enums.GrowthParticipantStatuses.Closed,
        ban
      })
      await db.GrowthAdminActivity.create({
        ethAddress: account,
        action: enums.GrowthAdminActivityActions.Close,
        data: { info: `Closed and unbanned ${unbannedAccount}` }
      })
      logger.info(`Closed account ${account}`)
    } else {
      logger.info(`Would close account ${account}`)
    }
    this.stats.numClosed++
  }

  async _unbanAccount(account) {
    const participant = await this._loadAccount(account)
    // Check account's current status.
    if (participant.status !== 'Banned') {
      throw new Error(
        `Can't unban account ${account} status is not Banned but ${participant.status}`
      )
    }

    const addresses = await this._loadAccountDetails(account)
    const events = await db.GrowthEvent.findAll({
      where: {
        ethAddress: { [Sequelize.Op.in]: addresses },
        status: enums.GrowthEventStatuses.Fraud
      }
    })

    // 1. Update the account's growth_participant record status to Active.
    if (this.config.doIt) {
      await participant.update({
        status: enums.GrowthParticipantStatuses.Active,
        ban: null
      })
      // Record the admin activity.
      await db.GrowthAdminActivity.create({
        ethAddress: account,
        action: enums.GrowthAdminActivityActions.Unban
      })
    } else {
      logger.info(`Would unban account ${account}`)
    }
    this.stats.numUnbanned++

    // 2. Change status of all growth_events from Fraud to Verified.
    if (this.config.doIt) {
      for (const event of events) {
        await event.update({ status: enums.GrowthEventStatuses.Verified })
      }
      logger.info(`Changed status of ${events.length} events to Verified`)
      logger.info(`Unbanned account ${account}`)
    } else {
      logger.info(`Would change status of ${events.length} events to Verified`)
    }

    // 3. Calculate the reward payout. If it's non-zero, add it to our list of payouts.
    const amount = await this._calcPayout(account)
    if (amount > 0) {
      this.payouts.push({ address: account, amount })
      this.stats.totalPayout += amount
      this.stats.numPayouts++
    }
  }

  async _viewAccount(account) {
    const participant = await this._loadAccount(account)
    logger.info('Status:', participant.status)
    logger.info(
      'Ban data:',
      participant.data ? JSON.stringify(participant.data, null, 2) : 'null'
    )
    await this._loadAccountDetails(account)
  }

  // Write all the payouts in token units to an output file.
  async _writePayouts() {
    for (const payout of this.payouts) {
      const line = `${payout.address}|${payout.amount}|Incorrectly banned\n`
      await fs.appendFileSync(this.config.output, line)
    }
  }

  async process() {
    // Process each entry.
    for (const entry of this.entries) {
      logger.info('\n\n\n')
      logger.info(`########################################################`)
      logger.info('#    Address to unban:', entry.addressToUnban)
      logger.info(`########################################################`)
      await this._unbanAccount(entry.addressToUnban)
      if (entry.addressToClose) {
        logger.info(`########################################################`)
        logger.info('#    Address to close:', entry.addressToClose)
        logger.info(`########################################################`)
        await this._closeAccount(entry.addressToClose, entry.addressToUnban)
      }
    }
    // Output a payout file.
    await this._writePayouts()
  }
}

//
// Main
//
const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const input = args['--input']
if (!input) {
  logger.error('Missing --input argument')
  process.exit()
}

const config = {
  input,
  output: args['--output'] || 'payout.txt',
  doIt: args['--doIt'] === 'true' || false
}

// Initialize the job and start it.
const job = new MassUnban(config)
job
  .process()
  .then(() => {
    logger.info('MassUnban stats:')
    logger.info('  Num acct unbanned:', job.stats.numUnbanned)
    logger.info('  Num acct closed:  ', job.stats.numClosed)
    logger.info('  Num acct to pay:  ', job.stats.numPayouts)
    logger.info('  Total to pay:     ', job.stats.totalPayout, 'OGN')
    logger.info('Finished')
    process.exit()
  })
  .catch(err => {
    logger.error('Job failed: ', err)
    logger.error('Exiting')
    process.exit(-1)
  })
