// Script to distribute Growth Engine rewards.
//  - Scans growth_reward table for rows with status Pending, grouped by account.
//  - For each row, distribute tokens to account

'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const Token = require('origin-token/src/token')
const { createProviders } = require('origin-token/src/config')

const db = require('../models')
const enums = require('../enums')
const parseArgv = require('../util/args')

const { Campaign } = require('../rules/rules')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('distRewards', { showTimestamp: false })

// Minimum number of block confirmations to wait for before considering
// a reward distributed.
const MinBlockConfirmation = 8
const BlockMiningTimeMsec = 15000 // 15sec


class TokenDistributor {
  // Note: we can't use a constructor due to the async call to defaultAccount.
  async init(networkId, tokenClass) {
    // Setup token library
    const config = {
      providers: createProviders([networkId])
    }
    this.networkId = networkId
    this.token = new tokenClass(config)
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
    logger.info('  TxnReceipt:       ', txnReceipt)
    return txnReceipt
  }
}

class DistributeRewards {
  constructor(config, distributor) {
    this.config = config
    this.distributor = distributor
    this.stats = {
      numCampaigns: 0,
      numTxns: 0,
      distGrandTotal: BigNumber(0)
    }
  }

  async _distributeRewards(ethAddress, rewards) {
    // Sum up the reward amount.
    const total = rewards
      .map(reward => reward.amount)
      .reduce((a1, a2) => BigNumber(a1).plus(a2))
    logger.info(`Distributing reward of ${total} to ${ethAddress}`)

    // Mark the reward row(s) as InPayment.
    let txn = await Sequelize.transaction()
    try {
      rewards.forEach(reward => {
        reward.update({ status: enums.GrowthRewardStatuses.InPayment })
      })
      await txn.commit()
    } catch (e) {
      await txn.rollback()
      throw e
    }

    // Send a transaction for the total amount.
    const txnReceipt = this.distributor.credit(ethAddress, total)
    if (!txnReceipt.status) {
      throw new Error('EVM reverted transaction')
    }

    // Mark the rewards as Paid.
    txn = await Sequelize.transaction()
    try {
      rewards.forEach(reward => {
        reward.update({
          status: enums.GrowthRewardStatuses.Paid,
          data: Object.assign({}, reward.data, {
            txnHash: txnReceipt.transactionHash
          })
        })
      })
      await txn.commit()
    } catch (e) {
      await txn.rollback()
      throw e
    }

    this.stats.numTxns++
    return total
  }

  async _verifyRewardConfirmation(ethAddress, rewards, currentBlockNumber) {
    let txnHash = null
    rewards.forEach(async reward => {
      // Reload the reward to get the txnHash.
      await reward.reload()
      if (!txnHash) {
        txnHash = reward.data.txnHash
      } else {
        // Paranoia check: make sure all the rewards point to same txnHash.
        if (reward.data.txnHash !== txnHash) {
          logger.error(
            `Reward $(reward.id} - Expected txnHash ${txnHash}, got ${
              reward.data.txnHash
            }`
          )
          throw new Error(`Consistency check failure for reward ${reward.id}`)
        }
      }
    })

    // Load the transaction receipt.
    const txnReceipt = await this.web3.eth.getTransactionReceipt(txnHash)

    // Make sure we've waited long enough to verify the confirmation.
    const numConfirmations = currentBlockNumber - txnReceipt.blockNumber
    if (numConfirmations < MinBlockConfirmation) {
      throw new Error('_verifyRewardConfirmation called too early.')
    }

    if (!txnReceipt.status) {
      // The transaction did not get confirmed.
      // Rollback the rewards status to Pending.
      const ids = rewards.map(reward => reward.id)
      logger.error(`Rewards with ids ${ids}`)
      logger.error('  Transaction hash ${txnHash} failed confirmation.')
      logger.error('  Rolling back status to Pending.')
      const txn = await Sequelize.transaction()
      try {
        rewards.forEach(reward => {
          delete reward.data.txnHash
          reward.update({
            status: enums.GrowthRewardStatuses.Pending,
            data: reward.data
          })
        })
        await txn.commit()
      } catch (e) {
        await txn.rollback()
        throw e
      }
    }
  }

  async process() {
    const now = new Date().toISOString()

    // Look for campaigns with rewards_status Calculated and distribution date past now.
    const campaignRows = await db.findall({
      where: {
        distributionDate: { [Sequelize.Op.lt]: now },
        rewardStatus: enums.GrowthCampaignRewardStatuses.Calculated
      }
    })

    for (const campaignRow of campaignRows) {
      const campaign = new Campaign(campaignRow, campaignRow.rules)
      logger.info(
        `Calculating rewards for campaign ${campaign.id} (${campaign.name})`
      )
      const campaignDistTotal = BigNumber(0)

      // Load rewards rows for this campaign that are in status Pending.
      const rewardRows = await db.GrowthRewards.findAll({
        where: {
          campaignId: campaign.Id,
          status: enums.GrowthRewardStatuses.Pending
        }
      })

      // TODO: If this data set becomes too large to hold in memory,
      // handle the grouping in the SQL query above and process in chunks.
      const ethAddressToRewards = {}
      rewardRows.forEach(
        reward =>
          (ethAddressToRewards[reward.ethAddress] = ethAddressToRewards[
            reward.ethAddress
          ]
            ? ethAddressToRewards[reward.ethAddress].push(reward)
            : [])
      )

      // Distribute the rewards to each account.
      for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
        const distAmount = await this._distributeRewards(ethAddress, rewards)
        campaignDistTotal.plus(distAmount)
      }

      // Wait a bit for the last transaction to settle.
      const waitMsec = MinBlockConfirmation * BlockMiningTimeMsec
      logger.info(
        `Waiting ${waitMsec / 1000} seconds to allow transactions to settle...`
      )
      await new Promise(resolve => setTimeout(resolve, waitMsec))

      // Verify the reward transactions were confirmed on the blockchain.
      const blockNumber = await this.web3.eth.getBlockNumber()
      for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
        await this._confirmTransaction(ethAddress, rewards, blockNumber)
      }

      // Update the campaign reward status to indicate it was distributed.
      await campaignRow.update({
        rewardStatus: enums.GrowthCampaignRewardStatuses.Distributed
      })

      this.stats.numCampaigns++
      this.stats.distGrandTotal += campaignDistTotal
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
const args = parseArgv()
const config = {
  networkId: args['--networkId'] || process.env.NETWORK_ID,
  // By default run in dry-run mode unless explicitly specified
  dryRun: args['--dryRun'] || true
}
logger.info('Config:')
logger.info(config)

const distributor = new TokenDistributor().init(config.networkId, Token)
const job = new DistributeRewards(config, distributor)

job.process().then(() => {
  logger.info('Distribution job finished.')
  logger.info('  Number of campaigns processed:     ', job.stats.numCampaigns)
  logger.info('  Number of transactions:            ', job.stats.numTxns)
  logger.info('  Grand total distributed (natural): ', job.stats.distGrandTotal)
  logger.info(
    '  Grand total distributed (tokens):  ',
    job.token.toTokenUnit(job.stats.distGrandTotal)
  )
})
