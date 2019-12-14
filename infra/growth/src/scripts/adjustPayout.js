// Script to make manual adjustment payouts for Origin Rewards.
// Take as input a file with format: <ethAddress>|<amountInTokenUnit>|<reason>
// For example:
//  0x627306090abaB3A6e1400e9345bC60c78a8BEf57|1973|Account manually reviewed. Not a duplicate.
//  0xf17f52151EbEF6C7334FAD080c5704D77216b732|27|Trusted partner account.
//
// Command line examples.
//   Dry run:
//     node adjustPayout.js --networkId=1 --campaignId=2 --adjustmentFilename="./adjust.txt"
//   For real:
//     node adjustPayout.js --networkId=1 --campaignId=2 --adjustmentFilename="./adjust.txt" --doIt=true
//
// TODO(franck): refactor to share more code with the distributeRewards script.

'use strict'

const fs = require('fs')
const BigNumber = require('bignumber.js')
const Logger = require('logplease')
const Sequelize = require('sequelize')

const db = require('../models')
const enums = require('../enums')
const parseArgv = require('../util/args')
const TokenDistributor = require('../util/tokenDistributor')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('adjustPayout')

// Min/max payout amounts.
const scaling = BigNumber(10).pow(18)
const minPayoutAmountNaturalUnit = BigNumber(1).times(scaling) // 1 OGN
const maxPayoutAmountNaturalUnit = BigNumber(2000).times(scaling) // 2k OGN

// Minimum number of block confirmations to wait for before considering
// a reward distributed.
const MinBlockConfirmation = 8
const BlockMiningTimeMsec = 15000 // 15sec

class AdjustPayout {
  constructor(config, distributor) {
    this.config = config
    this.distributor = distributor
    this.web3 = distributor.web3
    this.stats = {
      numTxns: 0,
      totalAdjusted: BigNumber(0)
    }
    this.adjustments = []
    this._load(config.adjustmentFilename)
  }

  /**
   * Loads an adjustment file.
   * Format: <address>|<amount in token units>|<reason>
   * Example:
   *   0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE|75|Incorrectly banned account.
   * @param filename
   */
  _load(filename) {
    const data = fs.readFileSync(filename).toString()
    const lines = data.split('\n')
    for (const line of lines) {
      if (!line.length || line.match(/\s+#.+/g)) {
        continue
      }
      const parts = line.split('|')
      if (parts.length !== 3) {
        throw new Error(`Invalid line in adjustment file: ${line}`)
      }
      const ethAddress = parts[0].trim().toLowerCase()
      const amount = BigNumber(parts[1].trim())
      const reason = parts[2].trim()

      if (!ethAddress) {
        throw new Error(`Invalid ETH address at line: ${line}`)
      }
      if (amount.isNaN()) {
        throw new Error(`Invalid amount at line: ${line}`)
      }
      if (!reason) {
        throw new Error(`Invalid reason at line: ${line}`)
      }
      const adjustment = { ethAddress, amount, reason }
      this.adjustments.push(adjustment)
      logger.info('Loaded adjustment', adjustment)
    }
    logger.info(`Loaded a total of ${this.adjustments.length} adjustments.`)
  }

  /**
   * Pay the adjustment.
   *
   * @param {models.GrowthCampaign} campaign
   * @param {string} ethAddress
   * @param {string} amount in token unit.
   * @param {string} reason for the adjustment.
   * @returns {Promise<models.GrowthPayout>}
   * @private
   */
  async _adjust(campaign, ethAddress, amount, reason) {
    // Check there is not already a payout row.
    // If there is and it is not in status Failed, something is wrong. Bail out.
    let payout = await db.GrowthPayout.findOne({
      where: {
        toAddress: ethAddress,
        campaignId: campaign.id,
        type: enums.GrowthPayoutTypes.Adjustment,
        status: { [Sequelize.Op.ne]: enums.GrowthPayoutStatuses.Failed }
      }
    })
    if (payout) {
      throw new Error(
        `Existing payout row id ${payout.id} with status ${payout.status} for account ${ethAddress}`
      )
    }

    const amountNaturalUnit = this.distributor.token.toNaturalUnit(amount)
    logger.info(
      `Paying adjustment of ${amount} OGN (${amountNaturalUnit} in natural unit) to ${ethAddress}`
    )

    // Check amount to payout is within expected range.
    if (amountNaturalUnit.lt(minPayoutAmountNaturalUnit)) {
      throw new Error(`Payout amount too low: ${amountNaturalUnit.toFixed()}`)
    }
    if (amountNaturalUnit.gt(maxPayoutAmountNaturalUnit)) {
      throw new Error(`Payout amount too high: ${amountNaturalUnit.toFixed()}`)
    }

    // Create a payout row with status Pending.
    payout = await db.GrowthPayout.create({
      fromAddress: this.distributor.supplier.toLowerCase(),
      toAddress: ethAddress,
      status: enums.GrowthPayoutStatuses.Pending,
      type: enums.GrowthPayoutTypes.Adjustment,
      campaignId: campaign.id,
      amount: amountNaturalUnit,
      currency: campaign.currency,
      data: { reason }
    })

    // Send a blockchain transaction to payout the reward to the participant.
    let status, txnHash, txnReceipt
    try {
      if (this.config.doIt) {
        txnReceipt = await this.distributor.credit(
          ethAddress,
          amountNaturalUnit
        )
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
    if (txnReceipt && txnReceipt.status) {
      status = enums.GrowthPayoutStatuses.Paid
      txnHash = txnReceipt.transactionHash
    } else {
      logger.error(
        `EVM reverted transaction - Marking payout id ${payout.id} as Failed`
      )
      status = enums.GrowthPayoutStatuses.Failed
      txnHash = null
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
    return payout
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
  async _confirm(payout, currentBlockNumber) {
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

    // Load the transaction receipt form the blockchain.
    logger.info(`Verifying payout ${payout.id}`)
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

  async process() {
    const campaign = await db.GrowthCampaign.findOne({
      where: { id: this.config.campaignId }
    })
    if (!campaign) {
      throw new Error(`Failed loading campaign ${this.config.campaignId}`)
    }

    // Make sure all users are enrolled and not banned.
    for (const adjustment of this.adjustments) {
      const participant = await db.GrowthParticipant.findOne({
        where: { ethAddress: adjustment.ethAddress }
      })
      if (!participant) {
        throw new Error(`${adjustment.ethAddress} not enrolled !`)
      }
      if (participant.status !== enums.GrowthParticipantStatuses.Active) {
        throw new Error(`${adjustment.ethAddress} banned !`)
      }
    }

    // Process each adjustment.
    for (const adjustment of this.adjustments) {
      logger.info(
        `Processing adjustment of ${adjustment.amount} to ${adjustment.ethAddress} with reason "${adjustment.reason}"`
      )
      adjustment.payout = await this._adjust(
        campaign,
        adjustment.ethAddress,
        adjustment.amount,
        adjustment.reason
      )
      this.stats.totalAdjusted = this.stats.totalAdjusted.plus(
        adjustment.amount
      )
    }
    logger.info(`Adjusted a total of ${this.stats.totalAdjusted.toFixed()}`)

    // Wait a bit for the last transaction to settle.
    const waitMsec = this.config.doIt
      ? 2 * MinBlockConfirmation * BlockMiningTimeMsec
      : 1000
    logger.info(
      `Waiting ${waitMsec / 1000} seconds to allow transactions to settle...`
    )
    await new Promise(resolve => setTimeout(resolve, waitMsec))

    // Check all transactions are confirmed.
    const blockNumber = await this.web3.eth.getBlockNumber()
    for (const adjustment of this.adjustments) {
      let confirmed
      try {
        confirmed = await this._confirm(adjustment.payout, blockNumber)
      } catch (e) {
        logger.error('Failed verifying transaction:', e)
        confirmed = false
      }
      if (confirmed) {
        logger.info(`Verified payout ${adjustment.payout.id}`)
      } else {
        logger.error(`Failed verification for payout ${adjustment.payout.id}`)
      }
    }
  }
}

/**
 * MAIN
 */
logger.info('Starting PayoutAdjustment job.')

// Parse config.
const args = parseArgv()
const config = {
  // 1=Mainnet, 4=Rinkeby, 999=Local.
  networkId: parseInt(args['--networkId'] || process.env.NETWORK_ID || 0),
  // By default run in dry-run mode unless explicitly specified using doIt.
  doIt: args['--doIt'] === 'true' || false,
  // Gas price multiplier to use for sending transactions. Optional.
  gasPriceMultiplier: args['--gasPriceMultiplier'] || null,
  // Campaign the adjustment is for.
  campaignId: parseInt(args['--campaignId']),
  // Text file containing adjustment data.
  adjustmentFilename: args['--adjustmentFilename']
}
logger.info('Config:')
logger.info(config)

if (!config.networkId) {
  throw new Error('--networkId is a mandatory argument.')
}

// Initialize the job and start it.
const distributor = new TokenDistributor()
distributor.init(config.networkId, config.gasPriceMultiplier).then(() => {
  const job = new AdjustPayout(config, distributor)
  job
    .process()
    .then(() => {
      logger.info('AdjustPayout job stats:')
      logger.info('  Number of transactions:            ', job.stats.numTxns)
      logger.info(
        '  Grand total adjusted (natural): ',
        job.distributor.token.toNaturalUnit(job.stats.totalAdjusted).toFixed()
      )
      logger.info('  Grand total adjusted (tokens):  ', job.stats.totalAdjusted)
      logger.info('Finished')
      process.exit()
    })
    .catch(err => {
      logger.error('Job failed: ', err)
      logger.error('Exiting')
      process.exit(-1)
    })
})
