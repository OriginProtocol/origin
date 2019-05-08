// Script to distribute Growth Engine rewards.

'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const Token = require('@origin/token/src/token')
const { createProviders } = require('@origin/token/src/config')

const db = require('../models')
const enums = require('../enums')
const parseArgv = require('../util/args')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('distRewards', { showTimestamp: false })

// Minimum number of block confirmations to wait for before considering
// a reward distributed.
const MinBlockConfirmation = 8
const BlockMiningTimeMsec = 15000 // 15sec

class TokenDistributor {
  // Note: we can't use a constructor due to the async call to defaultAccount.
  async init(networkId) {
    this.networkId = networkId
    this.token = new Token({ providers: createProviders([config.networkId]) })
    this.supplier = await this.token.defaultAccount(networkId)
    this.web3 = this.token.web3(networkId)
  }

  async credit(ethAddress, amount) {
    const txnReceipt = await this.token.credit(
      this.networkId,
      ethAddress,
      amount
    )
    logger.info('Transaction')
    logger.info('  NetworkId:        ', this.networkId)
    logger.info('  Amount (natural): ', amount)
    logger.info('  Amount (tokens):  ', this.token.toTokenUnit(amount))
    logger.info('  From:             ', this.supplier)
    logger.info('  To:               ', ethAddress)
    logger.info('  TxnHash:          ', txnReceipt.transactionHash)
    logger.info('  BlockNumber:      ', txnReceipt.blockNumber)
    return txnReceipt
  }
}

class DistributeRewards {
  constructor(config, distributor) {
    this.config = config
    this.distributor = distributor
    this.web3 = distributor.web3
    this.stats = {
      numCampaigns: 0,
      numTxns: 0,
      distGrandTotal: BigNumber(0)
    }
  }

  /**
   *
   * @param {string} ethAddress
   * @param {Array<models.GrowthReward>} rewards
   * @returns {Promise<*>}
   * @private
   */
  async _distributeRewards(ethAddress, rewards) {
    // Paranoia consistency checks
    if (!rewards || rewards.length < 1) {
      throw new Error(`Expected at least 1 reward for ${ethAddress}`)
    }
    const campaignId = rewards[0].campaignId
    const currency = rewards[0].currency
    for (const reward of rewards) {
      if (reward.ethAddress !== ethAddress) {
        throw new Error(
          `Expected address ${ethAddress} for reward id ${reward.id}`
        )
      }
      if (reward.campaignId !== campaignId) {
        throw new Error(
          `Expected campaign id ${campaignId} for reward id ${reward.id}`
        )
      }
      if (reward.currency !== currency) {
        throw new Error(
          `Expected currency ${currency} for reward id ${reward.id}`
        )
      }
    }

    // Sum up the reward amount.
    let amount = rewards
      .map(reward => BigNumber(reward.amount))
      .reduce((a1, a2) => a1.plus(a2))

    if (!this.config.persist) {
      logger.info(`Would distribute total reward of ${amount} to ${ethAddress}`)
      return amount
    }

    // Check there is not already a payout row.
    // If there is and it is not in status Failed, something is wrong. Bail out.
    let payout = await db.GrowthReward.findOne({
      where: {
        ethAddress,
        campaignId,
        status: { [Sequelize.Op.ne]: enums.GrowthPayoutStatuses.Failed }
      }
    })
    if (payout) {
      throw new Error(
        `Existing payout row id ${payout.id} with status ${
          payout.status
        } for account ${ethAddress}`
      )
    }

    logger.info(`Distributing reward of ${amount} to ${ethAddress}`)

    // Create a payout row with status Pending.
    payout = await db.GrowthReward.create({
      from_address: this.distributor.supplier,
      to_address: ethAddress,
      status: enums.GrowthPayoutStatuses.Pending,
      campaignId,
      amount,
      currency
    })

    // Send a blockchain transaction to payout the reward to the participant.
    let status, txnHash, txnReceipt
    try {
      txnReceipt = await this.distributor.credit(ethAddress, amount)
    } catch (e) {
      logger.error('Credit failed: ', e)
    }
    if (txnReceipt && txnReceipt.status) {
      status = enums.GrowthPayoutStatuses.Paid
      txnHash = txnReceipt.transactionHash
    } else {
      logger.error(
        `EVM reverted transaction - Marking payout id ${payout.id} as Failed`
      )
      status = enums.GrowthPayoutStatuses.Failed
      txnHash = null
      amount = 0
    }

    // Update the status of the payout row.
    try {
      await payout.update({ status, txnHash })
    } catch (e) {
      logger.error(`IMPORTANT: failed updating payout id ${payout.id} status.`)
      logger.error(`Need manual intervention.`)
      throw e
    }

    this.stats.numTxns++
    return amount
  }

  /**
   * Returns true if the payout transaction was confirmed on the blockchain.
   * False otherwise.
   * Updates the status of the payout row to either Confirmed or Failed.
   *
   * @param {models.GrowthPayout} payout
   * @param {integer} currentBlockNumber
   * @returns {Promise<boolean>}
   * @private
   */
  async _confirmTransaction(payout, currentBlockNumber) {
    if (!this.config.persist) {
      return true
    }

    // Consistency checks.
    if (payout.status === enums.GrowthPayoutStatuses.Confirmed) {
      // Already confirmed. Nothing to do.
      return true
    }
    if (payout.status !== enums.GrowthPayoutStatuses.Paid) {
      throw new Error(
        `Can't confirm payout id ${payout.id}, status is ${
          payout.status
        } rather than Paid`
      )
    }
    if (!payout.txnHash) {
      throw new Error(`Can't confirm payout id ${payout.id}, txnHash is empty`)
    }

    // Load the transaction receipt form the blockchain.
    const txnReceipt = await this.web3.eth.getTransactionReceipt(payout.txnHash)

    // Make sure we've waited long enough to verify the confirmation.
    const numConfirmations = currentBlockNumber - txnReceipt.blockNumber
    if (numConfirmations < MinBlockConfirmation) {
      throw new Error('_confirmTransaction called too early.')
    }

    if (!txnReceipt.status) {
      // The transaction did not get confirmed.
      // Rollback the payout status from Paid to Failed so that the transaction
      // gets attempted again next time the job runs.
      logger.error(`Account ${payout.ethAddress} Payout ${payout.id}`)
      logger.error('  Transaction hash ${payout.txnHash} failed confirmation.')
      logger.error('  Setting status to PaymentFailed.')
      await payout.update({ status: enums.GrowthPayoutStatuses.Failed })
      return false
    }
    await payout.update({ status: enums.GrowthPayoutStatuses.Confirmed })
    return true
  }

  /**
   * Returns true if all payout with status Paid are confirmed on the blockchain.
   * False otherwise.
   *
   * @param campaignId
   * @returns {Promise<boolean>}
   * @private
   */
  async _confirmAllTransactions(campaignId) {
    // Wait a bit for the last transaction to settle.
    const waitMsec = MinBlockConfirmation * BlockMiningTimeMsec
    logger.info(
      `Waiting ${waitMsec / 1000} seconds to allow transactions to settle...`
    )
    await new Promise(resolve => setTimeout(resolve, waitMsec))

    // Get current blockNumber from the blockchain.
    const blockNumber = await this.web3.eth.getBlockNumber()

    // Reload the payouts that are in status Paid.
    const payouts = db.GrowthPayout.findAll({
      where: {
        campaignId,
        status: enums.GrowthPayoutStatuses.Paid
      }
    })

    let allConfirmed = true
    for (const payout of payouts) {
      let confirmed
      try {
        confirmed = await this._confirmTransaction(payout, blockNumber)
      } catch (e) {
        logger.error('Failed verifying transaction:', e)
        confirmed = false
      }
      allConfirmed = allConfirmed && confirmed
    }

    return allConfirmed
  }

  async process() {
    const now = new Date()

    // Look for campaigns with rewards_status Calculated and distribution date past now.
    const campaigns = await db.GrowthCampaign.findAll({
      where: {
        distributionDate: { [Sequelize.Op.lt]: now },
        rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
      }
    })

    for (const campaign of campaigns) {
      logger.info(
        `Calculating rewards for campaign ${campaign.id} (${campaign.name})`
      )
      let campaignDistTotal = BigNumber(0)

      // Load rewards rows for this campaign.
      const rewardRows = await db.GrowthReward.findAll({
        where: { campaignId: campaign.id }
      })

      // TODO: If this data set becomes too large to hold in memory,
      // handle the grouping in the SQL query above and process in chunks.
      const ethAddressToRewards = {}
      rewardRows.forEach(reward => {
        if (ethAddressToRewards[reward.ethAddress]) {
          ethAddressToRewards[reward.ethAddress].push(reward)
        } else {
          ethAddressToRewards[reward.ethAddress] = [reward]
        }
      })

      // Distribute the rewards to all accounts.
      // This will create payout rows.
      for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
        const distAmount = await this._distributeRewards(ethAddress, rewards)
        campaignDistTotal = campaignDistTotal.plus(distAmount)
      }

      // Confirm the transactions.
      const allConfirmed = await this._confirmAllTransactions(campaign.id)

      // Check that all users got paid.
      await this._checkAllUsersPaid()
      for (const ethAddress of Object.keys(ethAddressToRewards)) {
        const payout = db.GrowthPayout.findOne({
          where: {
            ethAddress,
            campaignId: campaign.id,
            status: enums.GrowthPayoutdStatuses.Confirmed
          }
        })
        if (!payout) {
          throw new Error(`Account ${ethAddress} was not paid.`)
        }
      }

      if (allConfirmed) {
        if (this.config.persist) {
          // We are done ! Update the campaign status to Distributed.
          await campaign.update({
            rewardStatus: enums.GrowthCampaignRewardStatuses.Distributed
          })
          logger.info(`Updated campaign ${campaign.id} status to Distributed.`)
        } else {
          logger.info(
            `Would update campaign ${campaign.id} status to Distributed.`
          )
        }
      } else {
        logger.error(
          `One or more transactions not confirmed. Leaving campaign ${
            campaign.id
          } status as Calculated.`
        )
      }

      this.stats.numCampaigns++
      this.stats.distGrandTotal = this.stats.distGrandTotal.plus(
        campaignDistTotal
      )
      logger.info(
        `Finished distribution for campaign ${campaign.id} / ${campaign.name}`
      )
      logger.info(`Distributed a total of ${campaignDistTotal}`)
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting rewards distribution job.')

// Parse config.
const args = parseArgv()
const config = {
  // 1=Mainnet, 4=Rinkeby, 999=Local.
  networkId: parseInt(args['--networkId'] || process.env.NETWORK_ID || 0),
  // By default run in dry-run mode unless explicitly specified using persist.
  persist: args['--persist'] ? args['--persist'] : false
}
logger.info('Config:')
logger.info(config)

if (!config.networkId) {
  throw new Error('--networkId is a mandatory argument.')
}

// Initialize the job and start it.
const distributor = new TokenDistributor()
distributor.init(config.networkId).then(() => {
  const job = new DistributeRewards(config, distributor)
  job
    .process()
    .then(() => {
      logger.info('Distribution job stats:')
      logger.info(
        '  Number of campaigns processed:     ',
        job.stats.numCampaigns
      )
      logger.info('  Number of transactions:            ', job.stats.numTxns)
      logger.info(
        '  Grand total distributed (natural): ',
        job.stats.distGrandTotal
      )
      logger.info(
        '  Grand total distributed (tokens):  ',
        job.distributor.token.toTokenUnit(job.stats.distGrandTotal)
      )
      logger.info('Finished')
      process.exit()
    })
    .catch(err => {
      logger.error('Job failed: ', err)
      logger.error('Exiting')
      process.exit(-1)
    })
})
