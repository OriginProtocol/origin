// Script to distribute Growth Engine rewards.
//  - Scans growth_reward table for rows with status Pending, grouped by account.
//  - For each row, distribute tokens to acco

'use strict'

const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const Token = require('origin-token/src/token')
const { createProviders } = require('origin-token/src/config')

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

  async _distributeRewards(ethAddress, rewards) {
    // Sum up the reward amount.
    let total = rewards
      .map(reward => reward.amount)
      .reduce((a1, a2) => BigNumber(a1).plus(a2))

    if (!this.config.persist) {
      logger.info(`Would distribute reward of ${total} from to ${ethAddress}`)
      return total
    }

    logger.info(`Distributing reward of ${total} to ${ethAddress}`)

    // Mark the reward row(s) as InPayment.
    let txn = await db.sequelize.transaction()
    try {
      for (const reward of rewards) {
        await reward.update({ status: enums.GrowthRewardStatuses.InPayment })
      }
      await txn.commit()
    } catch (e) {
      await txn.rollback()
      throw e
    }

    // Send a transaction for the total amount.
    let status, txnHash, txnReceipt
    try {
      txnReceipt = await this.distributor.credit(ethAddress, total)
    } catch (e) {
      logger.error('Credit failed: ', e)
    }
    if (txnReceipt && txnReceipt.status) {
      status = enums.GrowthRewardStatuses.Paid
      txnHash = txnReceipt.transactionHash
    } else {
      logger.error(`EVM reverted transaction - Marking rewards as Failed`)
      status = enums.GrowthRewardStatuses.PaymentFailed
      txnHash = null
      total = 0
    }

    // Mark the rewards as Paid.
    txn = await db.sequelize.transaction()
    try {
      for (const reward of rewards) {
        await reward.update({ status, txnHash })
      }
      await txn.commit()
    } catch (e) {
      logger.error(`IMPORTANT: failed updating reward status to Paid.`)
      logger.error(`Leaving status as InPayment. Needs manual intervention.`)
      await txn.rollback()
      throw e
    }

    this.stats.numTxns++
    return total
  }

  async _confirmTransaction(ethAddress, rewards, currentBlockNumber) {
    if (!this.config.persist) {
      return true
    }

    // Reload the reward to get the txnHash and run some consistency checks.
    for (const reward of rewards) {
      await reward.reload()
      if (!reward.txnHash) {
        // Make sure all rewards have a txnHash.
        throw new Error(`Null txnHash for reward ${reward.id}`)
      }
      if (reward.txnHash !== rewards[0].txnHash) {
        // Make sure all rewards point to same txnHash.
        throw new Error(`Inconsistent txnHash reward ${reward.id}`)
      }
    }
    const txnHash = rewards[0].txnHash

    // Load the transaction receipt.
    const txnReceipt = await this.web3.eth.getTransactionReceipt(txnHash)

    // Make sure we've waited long enough to verify the confirmation.
    const numConfirmations = currentBlockNumber - txnReceipt.blockNumber
    if (numConfirmations < MinBlockConfirmation) {
      throw new Error('_confirmTransaction called too early.')
    }

    if (!txnReceipt.status) {
      // The transaction did not get confirmed.
      // Rollback the rewards status to Pending so that the transaction
      // gets attempted again next time the job runs.
      const ids = rewards.map(reward => reward.id)
      logger.error(`Rewards with ids ${ids}`)
      logger.error('  Transaction hash ${txnHash} failed confirmation.')
      logger.error('  Setting status to PaymentFailed.')
      const txn = await db.sequelize.transaction()
      try {
        for (const reward of rewards) {
          delete reward.data.txnHash
          await reward.update({
            status: enums.GrowthRewardStatuses.PaymentFailed,
            data: reward.data
          })
        }
        await txn.commit()
      } catch (e) {
        await txn.rollback()
        throw e
      }
      return false
    }
    return true
  }

  async _confirmAllTransactions(ethAddressToRewards) {
    // Wait a bit for the last transaction to settle.
    const waitMsec = MinBlockConfirmation * BlockMiningTimeMsec
    logger.info(
      `Waiting ${waitMsec / 1000} seconds to allow transactions to settle...`
    )
    await new Promise(resolve => setTimeout(resolve, waitMsec))

    // Verify the reward transactions were confirmed on the blockchain.
    const blockNumber = await this.web3.eth.getBlockNumber()

    let allConfirmed = true
    for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
      try {
        const confirmed = await this._confirmTransaction(
          ethAddress,
          rewards,
          blockNumber
        )
        allConfirmed = allConfirmed && confirmed
      } catch (e) {
        logger.error('Failed verifying transaction:', e)
        allConfirmed = false
      }
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

      // Load rewards rows for this campaign that are in status Pending or Failed.
      const rewardRows = await db.GrowthReward.findAll({
        where: {
          campaignId: campaign.id,
          status: {
            [Sequelize.Op.in]: [
              enums.GrowthRewardStatuses.Pending,
              enums.GrowthRewardStatuses.PaymentFailed
            ]
          }
        }
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

      // Distribute the rewards to each account.
      for (const [ethAddress, rewards] of Object.entries(ethAddressToRewards)) {
        const distAmount = await this._distributeRewards(ethAddress, rewards)
        campaignDistTotal = campaignDistTotal.plus(distAmount)
      }

      // Confirm the transactions.
      const allConfirmed = await this._confirmAllTransactions(
        ethAddressToRewards
      )

      // Update the campaign reward status to indicate it was distributed.
      if (allConfirmed) {
        if (this.config.persist) {
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
        logger.info(
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
