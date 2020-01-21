// Script to distribute Growth Engine rewards.

'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const _chunk = require('lodash/chunk')
const Sequelize = require('sequelize')

const db = require('../models')
const enums = require('../enums')
const parseArgv = require('../util/args')
const TokenDistributor = require('../util/tokenDistributor')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('distRewards')

// Minimum number of block confirmations to wait for before considering
// a reward distributed.
const MinBlockConfirmation = 8
const BlockMiningTimeMsec = 15000 // 15sec

// Min/max payout amounts.
const scaling = BigNumber(10).pow(18)
const minPayoutAmountNaturalUnit = BigNumber(1).times(scaling) // 1 OGN
const maxPayoutAmountNaturalUnit = BigNumber(2000).times(scaling) // 2k OGN

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
    this.receiptCache = {}
  }

  /**
   * Utility method. Performs various checks on the data integrity and inserts
   * a row in the growth_payout table. Throws in case of error.
   * @param {string} ethAddress
   * @param {Array<models.GrowthReward>} rewards
   * @returns {Promise<{amount: BigNumber, payout: ,models.GrowthPayout}>}
   * @private
   */
  async _preparePayout(ethAddress, rewards) {
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
    const amount = rewards
      .map(reward => BigNumber(reward.amount))
      .reduce((a1, a2) => a1.plus(a2))
    const amountTokenUnit = this.distributor.token.toTokenUnit(amount)

    logger.info(`Distribution of ${amountTokenUnit} OGN to ${ethAddress}`)

    // Check there is not already a payout row.
    // If there is and it is not in status Failed, something is wrong. Bail out.
    let payout = await db.GrowthPayout.findOne({
      where: {
        toAddress: ethAddress,
        campaignId,
        status: { [Sequelize.Op.ne]: enums.GrowthPayoutStatuses.Failed }
      }
    })
    if (!payout) {
      logger.info(`Checked there is no existing payout row for ${ethAddress}`)
    } else if (
      payout.status === enums.GrowthPayoutStatuses.Pending ||
      payout.status === enums.GrowthPayoutStatuses.Paid ||
      payout.status === enums.GrowthPayoutStatuses.Confirmed
    ) {
      logger.info(
        `Skipping distribution. Found existing payout ${payout.id} with status ${payout.status}`
      )
      return BigNumber(0)
    } else {
      throw new Error(
        `Existing payout row id ${payout.id} with status ${payout.status} for account ${ethAddress}`
      )
    }

    logger.info(
      `Distributing reward of ${amountTokenUnit} OGN to ${ethAddress}`
    )

    // Check amount is within expected range.
    if (amount.lt(minPayoutAmountNaturalUnit)) {
      throw new Error(`Payout amount too low: ${amount.toFixed()}`)
    }
    if (amount.gt(maxPayoutAmountNaturalUnit)) {
      throw new Error(`Payout amount too high: ${amount.toFixed()}`)
    }

    // Create a payout row with status Pending.
    payout = await db.GrowthPayout.create({
      fromAddress: this.distributor.supplier.toLowerCase(),
      toAddress: ethAddress,
      status: enums.GrowthPayoutStatuses.Pending,
      type: enums.GrowthPayoutTypes.CampaignDistribution,
      campaignId,
      amount,
      currency
    })

    return { amount, payout }
  }

  /**
   * Pays out the sum of the rewards to a user.
   * Throws in case of an error.
   *
   * @param {string} ethAddress
   * @param {Array<models.GrowthReward>} rewards
   * @returns {Promise<BigNumber>} Total payout amount.
   * @private
   */
  async _distributeRewards(ethAddress, rewards) {
    const { amount, payout } = await this._preparePayout(ethAddress, rewards)

    // Send a blockchain transaction to payout the reward to the participant.
    let txnReceipt, error
    try {
      if (this.config.doIt) {
        txnReceipt = await this.distributor.credit(ethAddress, amount)
      } else {
        txnReceipt = {
          status: 'OK',
          transactionHash: 'TESTING',
          blockNumber: 123
        }
      }
    } catch (e) {
      logger.error('Credit failed: ', e)
    }
    const updates = {}
    if (txnReceipt && txnReceipt.status) {
      updates.status = enums.GrowthPayoutStatuses.Paid
      updates.txnHash = txnReceipt.transactionHash
    } else {
      error = true
      logger.error(
        `EVM reverted transaction - Marking payout id ${payout.id} as Failed`
      )
      updates.status = enums.GrowthPayoutStatuses.Failed
    }

    // Update the status of the payout.
    try {
      await payout.update(updates)
    } catch (e) {
      logger.error(`IMPORTANT: failed updating payout id ${payout.id} status.`)
      logger.error(`Need manual intervention.`)
      throw e
    }

    if (error) {
      logger.error('Payout failure')
      throw new Error(`Failure. Check payout ${payout.id}`)
    }

    this.stats.numTxns++
    return amount
  }

  /**
   * Distribute rewards to a batch of users
   * @param {Array<{ethAddress: string, rewards: Array<models.GrowthReward>}>} Batch of payouts to process.
   * @returns {Promise<void>}
   * @private
   */
  async _distributeRewardsBatch(chunk) {
    // Prepare for the batch payout. This creates entries in the payout table.
    let total = BigNumber(0)
    const payouts = []
    const addresses = []
    const amounts = []
    for (const [ethAddress, rewards] of Object.entries(chunk)) {
      const { amount, payout } = await this._preparePayout(ethAddress, rewards)
      payouts.push(payout)
      addresses.push(ethAddress)
      amounts.push(amount)
      total = total.plus(amount)
    }

    // Send a blockchain transaction to payout the recipients.
    let txnReceipt, error
    try {
      if (this.config.doIt) {
        txnReceipt = await this.distributor.creditMulti(addresses, amounts)
      } else {
        txnReceipt = {
          status: 'OK',
          transactionHash: 'TESTING',
          blockNumber: 123
        }
      }
    } catch (e) {
      logger.error('multiCredit failed: ', e)
    }
    const updates = {}
    if (txnReceipt && txnReceipt.status) {
      updates.status = enums.GrowthPayoutStatuses.Paid
      updates.txnHash = txnReceipt.transactionHash
    } else {
      error = true
      logger.error(
        `EVM reverted transaction - Marking all payouts from the chunk as Failed`
      )
      updates.status = enums.GrowthPayoutStatuses.Failed
    }

    // Update the status of the payouts in the DB.
    // Note that they all get the same txHash since all the addresses were paid as part
    // of a single blockchain transaction.
    try {
      for (const payout of payouts) {
        await payout.update(updates)
      }
    } catch (e) {
      logger.error(`IMPORTANT: failed updating payout status.`)
      logger.error(`Need manual intervention.`)
      throw e
    }

    if (error) {
      logger.error('Payout failure')
      throw new Error(`Failure. Check payout data.`)
    }

    this.stats.numTxns++
    return total
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
    if (!this.config.doIt) {
      return true
    }

    // Consistency checks.
    if (payout.status === enums.GrowthPayoutStatuses.Confirmed) {
      // Already confirmed. Nothing to do.
      return true
    }
    if (payout.status !== enums.GrowthPayoutStatuses.Paid) {
      throw new Error(
        `Can't confirm payout id ${payout.id}, status is ${payout.status} rather than Paid`
      )
    }
    if (!payout.txnHash) {
      throw new Error(`Can't confirm payout id ${payout.id}, txnHash is empty`)
    }

    // Check if the transaction receipt is in the cache, otherwise load it from the blockchain
    // and add it to the cache. We expect cache hits in the case of batch payouts where
    // multiple payouts are made under the same transaction and therefore share the same receipt.
    logger.info(`Verifying payout ${payout.id}`)
    if (!this.receiptCache[payout.txnHash]) {
      this.receiptCache[
        payout.txnHash
      ] = await this.web3.eth.getTransactionReceipt(payout.txnHash)
    }
    const txReceipt = this.receiptCache[payout.txnHash]

    // Make sure we've waited long enough to verify the confirmation.
    const numConfirmations = currentBlockNumber - txReceipt.blockNumber
    if (numConfirmations < MinBlockConfirmation) {
      throw new Error('_confirmTransaction called too early.')
    }

    if (!txReceipt.status) {
      // The transaction did not get confirmed.
      // Rollback the payout status from Paid to Failed so that the transaction
      // gets attempted again next time the job runs.
      logger.error(`Account ${payout.toAddress} Payout ${payout.id}`)
      logger.error('  Transaction hash ${payout.txnHash} failed confirmation.')
      logger.error('  Setting status to PaymentFailed.')
      await payout.update({ status: enums.GrowthPayoutStatuses.Failed })
      return false
    }
    logger.info(`Payout ${payout.id} confirmed.`)
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
    const waitMsec = this.config.doIt
      ? 2 * MinBlockConfirmation * BlockMiningTimeMsec
      : 1000
    logger.info(
      `Waiting ${waitMsec / 1000} seconds to allow transactions to settle...`
    )
    await new Promise(resolve => setTimeout(resolve, waitMsec))

    // Get current blockNumber from the blockchain.
    const blockNumber = await this.web3.eth.getBlockNumber()

    // Reload the payouts that are in status Paid.
    const payouts = await db.GrowthPayout.findAll({
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

  /**
   * Verifies all addresses passed as argument have a Confirmed payout.
   * Returns true if check passed, false otherwise.
   *
   * @param campaignId
   * @param ethAddresses
   * @returns {Promise<boolean>}
   * @private
   */
  async _checkAllUsersPaid(campaignId, ethAddresses) {
    if (!this.config.doIt) {
      return true
    }

    let allPaid = true
    for (const ethAddress of ethAddresses) {
      const payout = await db.GrowthPayout.findOne({
        where: {
          toAddress: ethAddress,
          campaignId,
          status: enums.GrowthPayoutStatuses.Confirmed
        }
      })
      if (!payout) {
        logger.error(`Account ${ethAddress} was not paid.`)
        allPaid = false
      }
    }
    return allPaid
  }

  /**
   * Process each payout individually.
   * @param ethAddressToRewards
   * @returns {Promise<*>}
   * @private
   */
  async _individualPayoutProcess(ethAddressToRewards) {
    let total = BigNumber(0)
    for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
      const amount = await this._distributeRewards(ethAddress, rewards)
      total = total.plus(amount)
    }
    return total
  }

  /**
   * Process the payouts in batches.
   * @param {Dict{BigNumber}} ethAddressToRewards: dict with eth adddress as key
   *   and amount in natural units as value
   * @returns {Promise<BigNumber>} total amount paid in natural units.
   * @private
   */
  async _batchPayoutProcess(ethAddressToRewards) {
    // Sum up all the rewards to compute the total distribution, in natural unit.
    let total = BigNumber(0)
    for (const rewards of Object.values(ethAddressToRewards)) {
      const amount = rewards
        .map(reward => BigNumber(reward.amount))
        .reduce((a1, a2) => a1.plus(a2))
      total = total.plus(amount)
    }
    const totalTokenUnit = this.distributor.token.toTokenUnit(total)
    logger.info(
      `Approving distributor to send a max total of ${totalTokenUnit} OGN`
    )

    // Approve the total amount that the distributor contract
    // will send to recipients.
    await this.distributor.approveMulti(total)

    // Process each chunk sequentially. Each chunk results in a single tx
    // that handles the distribution to all the addresses in the batch.
    const chunks = _chunk(ethAddressToRewards, this.config.batchSize)
    for (const chunk of chunks) {
      await this._distributeRewardsBatch(chunk)
    }
    return total
  }

  /**
   * Main loop.
   * @returns {Promise<void>}
   */
  async process() {
    const now = new Date()

    let campaigns
    if (this.config.campaignId) {
      // A specific campaign ID was provided. Load it up.
      const campaign = await db.GrowthCampaign.findOne({
        where: {
          id: this.config.campaignId
        }
      })
      if (!campaign) {
        throw new Error(`Campaign ${campaign.id} does not exist`)
      }
      logger.debug('Loaded campaign', campaign.id, campaign.nameKey)
      campaigns = [campaign]
    } else {
      // No campaign ID provided.
      // Look for campaigns with rewards_status Calculated and distribution date past now.
      campaigns = await db.GrowthCampaign.findAll({
        where: {
          distributionDate: { [Sequelize.Op.lt]: now },
          rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
        }
      })
    }

    for (const campaign of campaigns) {
      logger.info(
        `Calculating rewards for campaign ${campaign.id} (${campaign.shortNameKey})`
      )

      // Load rewards rows to process.
      const where = { campaignId: campaign.id }
      if (this.config.ethAddress) {
        // A specific account was specified. Only load rewards associated with it.
        where.ethAddress = this.config.ethAddress.toLowerCase()
        logger.info(`Loading rewards for account ${this.config.ethAddress}`)
      }
      const rewardRows = await db.GrowthReward.findAll({ where })

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
      let campaignDistTotal
      if (this.config.batchSize > 1) {
        // Process payouts in chunks.
        campaignDistTotal = await this._batchPayoutProcess()
      } else {
        // Process each payout individually.
        campaignDistTotal = await this._individualPayoutProcess()
      }
      this.stats.distGrandTotal = this.stats.distGrandTotal.plus(
        campaignDistTotal
      )
      logger.info(
        `Finished distribution for campaign ${campaign.id} / ${campaign.shortNameKey}`
      )
      logger.info(`Distributed a total of ${campaignDistTotal.toFixed()}`)

      //
      // Check all transactions are confirmed and that all users got paid.
      //
      const allConfirmed = await this._confirmAllTransactions(campaign.id)
      if (!allConfirmed) {
        logger.error('One or more transactions not confirmed')
      }
      const allUsersPaid = await this._checkAllUsersPaid(
        campaign.id,
        Object.keys(ethAddressToRewards)
      )
      if (!allUsersPaid) {
        logger.error('Some users did not get paid. Inspect the data!')
      }

      if (allConfirmed && allUsersPaid) {
        // All checks passed. Flip campaign reward status to Distributed.
        // Except if a specific eth address was specified which is typically
        // used for doing post campaign payout adjustments.
        if (!this.config.ethAddress) {
          if (this.config.doIt) {
            await campaign.update({
              rewardStatus: enums.GrowthCampaignRewardStatuses.Distributed
            })
            logger.info(
              `Updated campaign ${campaign.id} reward status to Distributed.`
            )
          } else {
            logger.info(
              `Would update campaign ${campaign.id} reward status to Distributed.`
            )
          }
        }
      } else {
        logger.error('Campaign reward status NOT updated to Distributed.')
        logger.error('Manual intervention required.')
      }

      this.stats.numCampaigns++
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
  // By default run in dry-run mode unless explicitly specified using doIt.
  doIt: args['--doIt'] === 'true' || false,
  // Gas price multiplier to use for sending transactions. Optional.
  gasPriceMultiplier: args['--gasPriceMultiplier'] || null,
  // Specific campaign to process.
  campaignId: parseInt(args['--campaignId'] || 0),
  // Batch vs individual payout processing.
  batchSize: parseInt(args['--batchSize'] || 1),
  // Specific account to process.
  ethAddress: args['--ethAddress'] || null
}
logger.info('Config:')
logger.info(config)

if (!config.networkId) {
  throw new Error('--networkId is a mandatory argument.')
}

// Initialize the job and start it.
const distributor = new TokenDistributor()
distributor.init(config.networkId, config.gasPriceMultiplier).then(() => {
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
        job.stats.distGrandTotal.toFixed()
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
