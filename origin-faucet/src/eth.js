const BigNumber = require('bignumber.js')
const PrivateKeyProvider = require('truffle-privatekey-provider')
const HDWalletProvider = require('truffle-hdwallet-provider')

const Sequelize = require('sequelize')
const Web3 = require('web3')

const logger = require('./logger')
const db = require('./models')
const enums = require('./enums')

class EthDistributor {

  constructor(config) {
    this.config = config

    let hotWalletPk, providerUrl
    if (config.networkIds[0] === 999) {
      // In dev environment, use truffle's default account as hot wallet.
      hotWalletPk =
        '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
      providerUrl = 'http://localhost:8545'
    } else {
      hotWalletPk = process.env.HOT_WALLET_PK
      providerUrl = `https://mainnet.infura.io/${
        process.env.INFURA_ACCESS_TOKEN
      }`
    }

    const provider = new Web3.providers.HttpProvider(providerUrl)
    this.web3 = new Web3(provider)

    const account = this.web3.eth.accounts.privateKeyToAccount(hotWalletPk)
    this.web3.eth.accounts.wallet.add(account)
    this.web3.eth.defaultAccount = account.address
    this.hotWalletAddress = account.address

    // Needed to be able to use the process method as a route in Express.
    this.process  = this.process.bind(this)
  }

  error(res, message) {
    logger.error(message)
    res.send(`<h2>Error: ${message}</h2>`)
  }

  async process(req, res, next) {
    const code = req.query.code
    if (!code) {
      return this.error(res, 'An invite code must be supplied.')
    }

    const ethAddress = req.query.wallet
    if (!ethAddress) {
      return this.error(res, 'A wallet address must be supplied.')
    } else if (!this.web3.utils.isAddress(ethAddress)) {
      return this.error(res, `Invalid wallet address ${ethAddress}.`)
    }

    try {
      // Load the campaign based on invite code.
      const now = new Date()
      const campaign = await db.FaucetCampaign.findOne({
        where: {
          inviteCode: code,
          startDate: { [Sequelize.Op.lt]: now },
          endDate: { [Sequelize.Op.gt]: now }
        }
      })
      if (!campaign) {
        return this.error(res, `Invalid campaign code ${code}`)
      }

      // Check the campaign's budget is not exhausted by summing up
      // all existing transaction in Confirmed or Pending status.
      const amount = BigNumber(campaign.amount)
      const budget = BigNumber(campaign.budget)
      const faucetsTxns = await db.FaucetTxn.findAll({
        where: {
          campaignId: campaign.id,
          status: {
            [Sequelize.Op.in]: [
              enums.FaucetTxnStatuses.Pending,
              enums.FaucetTxnStatuses.Confirmed
            ]
          }
        }
      })
      const budgetUsed = faucetsTxns
        .map(faucetTxn => faucetTxn.amount)
        .reduce((x, y) => BigNumber(x).plus(y), BigNumber(0))
      if (budgetUsed.plus(amount).gt(budget)) {
        return this.error(res, `Campaign budget exhausted.`)
      }

      // Check the ethAddress hasn't already been used for this campaign.
      const existingTxn = await db.FaucetTxn.findOne({
        where: {
          campaignId: campaign.id,
          toAddress: ethAddress.toLowerCase(),
          status: {
            [Sequelize.Op.in]: [
              enums.FaucetTxnStatuses.Pending,
              enums.FaucetTxnStatuses.Confirmed
            ]
          }
        }
      })
      if (existingTxn) {
        return this.error(res, `Address ${ethAddress} already used this code.`)
      }

      // Create a FaucetTxn row in Pending status.
      const faucetTxn = await db.FaucetTxn.create({
        campaignId: campaign.id,
        status: enums.FaucetTxnStatuses.Pending,
        fromAddress: this.hotWalletAddress.toLowerCase(),
        toAddress: ethAddress.toLowerCase(),
        amount: campaign.amount,
        currency: campaign.currency,
        txnHash: null
      })

      // Issue the blockchain transaction.
      logger.info(`Blockchain call to send ${amount.toFixed()} to ${ethAddress} from ${this.hotWalletAddress}`)

      // FIXME(franck): calculate nonce so as to handle parallel
      // transaction issued from hotwallet.
      const receipt = await await this.web3.eth.sendTransaction({
        from: this.hotWalletAddress,
        to: ethAddress,
        value: amount.toFixed(),
        gas: 21000
      })
      const txnHash = receipt.transactionHash

      // Record the transaction hash and update the row status to Confirmed.
      await faucetTxn.update({
        status: enums.FaucetTxnStatuses.Confirmed,
        txnHash
      })

      // Send response back to client.
      const amountEth = this.web3.utils.fromWei(amount.toFixed(), 'ether')
      const resp = `
        Distributed <b>${amountEth}</b> ETH to account <b>${ethAddress}</b>
        </br></br>
        TransactionHash=<a href="https://etherscan.io/tx/${txnHash}">${txnHash}</a>`
      res.send(resp)
    } catch (err) {
      logger.error(err)
      next(err) // Errors will be passed to Express.
    }
  }
}

module.exports = EthDistributor
