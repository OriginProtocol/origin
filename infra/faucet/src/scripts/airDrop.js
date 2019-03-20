// Tool to distribute OGN tokens to a list of ETH addresses stored in a text file.

'use strict'

const fs = require('fs')
const Logger = require('logplease')
const Web3 = require('web3')

const Token = require('@origin/token/src/token')
const enums = require('../enums')
const db = require('../models')

Logger.setLogLevel(process.env.LOG_LEVEL || 'INFO')
const logger = Logger.create('airdrop')

/**
 * Parse command line arguments into a dict.
 * @returns {Object} - Parsed arguments.
 */
function parseArgv() {
  const args = {}
  for (const arg of process.argv) {
    const elems = arg.split('=')
    const key = elems[0]
    const val = elems.length > 1 ? elems[1] : true
    args[key] = val
  }
  return args
}

/**
 * Reads a file having an eth address on each line
 * @param filename
 * @returns {string[]}
 */
function readRecipients(filename) {
  const data = fs.readFileSync(filename).toString()
  const addresses = data
    .split('\n')
    .map(l => l.trim().toLowerCase())
    .filter(l => Boolean(l))
  const seen = {}
  for (const address of addresses) {
    if (!Web3.utils.isAddress(address)) {
      throw new Error('Invalid address: ', address)
    }
    if (seen[address]) {
      throw new Error('Duplicate address: ', address)
    }
    seen[address] = true
  }
  logger.info(`Read ${addresses.length} recipient addresses.`)
  return addresses
}

class AirDrop {
  /**
   * Sends OGN to an address.
   *
   * @param networkId
   * @param toAddress
   * @param amount
   * @returns {Promise<string>} Transaction hash
   * @private
   */
  async _send(networkId, toAddress, amount) {
    const receipt = await this.token.credit(networkId, toAddress, amount)
    const txnHash = receipt.transactionHash
    logger.info(
      `${this.config.dropAmount} OGN -> ${toAddress} TxHash=${txnHash}`
    )
    return txnHash
  }

  /**
   * Sends OGN to all recipients.
   *
   * @returns {Promise<void>}
   */
  async process() {
    for (const toAddress of this.recipients) {
      logger.info('Processing airdrop to ', toAddress)
      const faucetTxn = await db.FaucetTxn.create({
        campaignId: this.campaignId,
        status: enums.FaucetTxnStatuses.Pending,
        fromAddress: this.sender.toLowerCase(),
        toAddress: toAddress.toLowerCase(),
        amount: this.dropAmount, // Amount in natural units (Wei for ETH).
        currency: 'OGN'
      })

      if (!this.config.dryRun) {
        try {
          const txnHash = this._send(this.networkId, toAddress, this.dropAmount)
          await faucetTxn.update({
            status: enums.FaucetTxnStatuses.Confirmed,
            txnHash
          })
        } catch (error) {
          logger.error('Failed sending OGN to ', toAddress, error, error.stack)
          // Bail out - operator should manually review what went wrong
          // and clean up data before resuming.
          throw error
        }
      } else {
        logger.info(`Would send ${this.config.dropAmount} OGN to ${toAddress}`)
      }

      this.stats.numTxns++
      this.stats.totalAmount += this.config.dropAmount
    }
  }

  async _init(config) {
    this.networkId = config.networkId
    this.campaignId = config.campaignId
    this.recipients = config.recipients

    // Create a token object for handling the distribution.
    this.token = new Token(config)
    logger.info(
      'OGN contract address: ',
      this.token.contractAddress(this.networkId)
    )

    // Load the campaign.
    const campaign = await db.FaucetCampaign.findOne({
      where: { id: this.campaignId }
    })
    if (!campaign) {
      throw new Error(`Failed loading campaign with id ${this.campaignId}`)
    }
    if (campaign.currency != 'OGN') {
      throw new Error(`Campaign currency is not OGN: ${campaign.currency}`)
    }
    this.dropAmount = campaign.amount
    this.campaignId = campaign.id

    const fromAddress = await this.token.senderAddress(this.networkId)
    if (fromAddress != campaign.fromAddress) {
      throw new Error(
        'Campaign from_address and hot wallet address do not match'
      )
    }
    this.sender = fromAddress

    logger.info('AirDrop config:')
    logger.info(this)
  }

  async main(config) {
    await this._init(config)
    await this._process()
  }
}

/**
 * MAIN
 */
if (require.main === module) {
  logger.info('Starting airDrop job.')

  const args = parseArgv()

  if (!args['--campaignId']) {
    logger.error('--campaignId is mandatory')
    process.exit(-1)
  }
  if (!args['--networkId']) {
    logger.error('--networkId is mandatory')
    process.exit(-1)
  }
  if (!args['--recipientsFilename']) {
    logger.error('--recipientsFilename is mandatory')
    process.exit(-1)
  }

  const config = {
    // By default use dry-run mode unless explicitly specified.
    dryRun: args['--dryRun'] ? args['--dryRun'] !== 'false' : true,
    campaignId: args['--campaignId'],
    networkId: parseInt(args['--networkId'])
  }

  // A provider must be set.
  if (!process.env.PROVIDER_URL) {
    logger.error('PROVIDER_URL not set')
    process.exit(-1)
  }
  config.providerUrl = process.env.PROVIDER_URL

  // Load and validate the recipients list.
  config.recipients = readRecipients(args['--recipientsFilename'])

  const job = new AirDrop()
  job
    .main(config)
    .then(() => {
      logger.info('Airdrop stats:')
      logger.info('  Number of txns:      ', job.stats.numTxns)
      logger.info(
        '  Total amount distributed (natural units): ',
        job.stats.totalAmount
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
