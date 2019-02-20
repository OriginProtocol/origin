const BigNumber = require('bignumber.js')
const fs = require('fs')
const Sequelize = require('sequelize')
const Web3 = require('web3')

const logger = require('./logger')
const db = require('./models')
const enums = require('./enums')

// HTML template for the /eth landing page.
const html = fs.readFileSync(`${__dirname}/../public/eth.html`).toString()

// Max number of transactions that can be waiting to be mined.
const MaxNumberPendingTxnCount = 30

/**
 * Singleton class for managing a monotonically increasing nonce
 * to send web3 transactions.
 *
 * This is necessary since the faucet may be handling multiple requests
 * in parallel but web3.eth.sendTransaction does not take into
 * account pending transactions when generating the nonce to use.
 * For example, assume 50 users attempt to redeem ETH from the faucet
 * at about the same time. Relying on web3.eth.sendTransaction to calculate
 * the nonce for those transactions would result in all of them getting
 * the *same* nonce.  All transactions except one would therefore fail.
 *
 * Note: This solution is far from perfect.
 *  - It only works if we run a single instance of the faucet process.
 *  An improvement could be to store the nonce in a central storage like
 *  Redis or Postgres.
 *  - The nonce could go out of sync if the server is restarted while
 *  it is processing a batch of transactions.
 *  - The nonce could go out of sync if anything else than
 *  the faucet server sends a transaction from the hotwallet.
 *  - A failure of one of the transaction within a batch will cause subsequent
 *  transaction to be stuck until the nonce hole is filled.
 *  For more info on hole in nonce sequence, see this article:
 *  https://ethereum.stackexchange.com/questions/2808/what-happens-when-a-transaction-nonce-is-too-high
 *  - Ethereum nodes have an upper limit of 64 transactions per
 *  source address that they can store in their buffer. Which translates
 *  directly into the max number of pending transactions the faucet
 *  can handle before some start failing. This is roughly 64 / 15 = 4tps.
 *
 *  If a hole in the nonce sequence for the hot wallet ever happens, a
 *  way to fix is to issue transaction(s) with missing nonce(s).
 *  Even 0 ETH transaction with hot wallet as both from and to would do.
 */
class NonceManager {
  constructor(web3, ethAddress) {
    this.web3 = web3
    this.ethAddress = ethAddress
    this.pendingTxnCount = 0
  }

  // This must be called once a transaction is confirmed or failed
  // otherwise the nonce can go out of sync.
  decPendingTxnCount() {
    this.pendingTxnCount--
  }

  // Yields next nonce to use.
  async next() {
    this.pendingTxnCount++
    if (this.pendingTxnCount === 1) {
      // No other pending transaction.
      // Set nonce based on fetched transaction count.
      this.nonce = null
      this.nonce = await this.web3.eth.getTransactionCount(this.ethAddress)
    } else {
      // There is at least one other pending transaction.
      // Wait for nonce to be set and increment it.
      for (let retries = 0; this.nonce === null && retries < 50; retries++) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (this.nonce === null) {
        throw new Error('Timeout waiting for nonce.')
      }
      this.nonce++
    }
    return this.nonce
  }
}

/**
 * Wrapper class for sending a transaction and getting hash and receipt.
 */
class TxnManager {
  constructor(web3, nonceMgr) {
    this.web3 = web3
    this.nonceMgr = nonceMgr
    this.nonce = null
    this.txnHash = null
  }

  // Submits a transaction and returns a promise that resolves
  // with the transaction hash.
  async send(from, to, value) {
    // Get a nonce.
    this.nonce = await this.nonceMgr.next()

    // Issue the blockchain transaction.
    logger.info(
      `sendTransaction value:${value.toFixed()} from:${from} to:${to} nonce:${
        this.nonce
      }`
    )

    return new Promise((resolve, reject) => {
      try {
        this.web3.eth
          .sendTransaction({ from, to, value, gas: 21000, nonce: this.nonce })
          .on('transactionHash', hash => {
            logger.info('Transaction hash: ', hash)
            this.txnHash = hash
            resolve(hash)
          })
      } catch (e) {
        logger.error('Transaction failure: ', e)
        reject(e)
      }
    })
  }

  // Waits for a transaction receipt.
  async receipt() {
    if (!this.txnHash) {
      throw new Error('Cannot get receipt without transaction hash')
    }

    // 60 retries * 5sec = 5min.
    for (let retries = 0; retries < 60; retries++) {
      try {
        const receipt = await this.web3.eth.getTransactionReceipt(this.txnHash)
        if (receipt) {
          if (receipt.status) {
            return receipt
          } else {
            throw new Error('Receipt status false. Transaction failed.')
          }
        }
        logger.info(
          `No receipt available yet after ${(retries + 1) * 5} sec for hash ${
            this.txnHash
          }`
        )
        // Wait 5 sec before retrying.
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (error) {
        logger.error(
          `getTransactionReceipt error for hash ${this.txnHash}`,
          error
        )
      }
    }
    throw new Error(`Timeout: Failed getting receipt for hash ${this.txnHash}`)
  }

  // Must be called to clean up once the transaction completes or fails.
  done() {
    if (this.nonce) {
      this.nonceMgr.decPendingTxnCount()
    }
  }
}

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
    logger.info('Hotwallet address: ', this.hotWalletAddress)

    // Initialize the NonceManager.
    this.nonceMgr = new NonceManager(this.web3, this.hotWalletAddress)

    // Needed to use the process method as a route in Express.
    this.process = this.process.bind(this)
  }

  // Returns HTML with an error message.
  _error(res, message) {
    logger.error(message)
    res.send(`<b>Server error</b></br></br>${message}`)
  }

  // Returns HTML with amount and transaction hash.
  _success(res, to, amount, txnHash) {
    const amountEth = Web3.utils.fromWei(amount.toFixed(), 'ether')
    const resp = `
      Initiated transaction for crediting <b>${amountEth}</b> ETH to account <b>${to}</b>
      </br></br>
      Pending transaction hash: <a href="https://etherscan.io/tx/${txnHash}">${txnHash}</a>`
    res.send(resp)
  }

  // Renders the main /eth page.
  async main(req, res) {
    // Basic templating.
    const out = html
      .replace('${code}', req.query.code || '')
      .replace('${wallet}', req.query.wallet || '')
    return res.send(out)
  }

  // Processes ETH distribution requests.
  async process(req, res) {
    const code = req.query.code
    if (!code) {
      return this._error(res, 'An invite code must be supplied.')
    }

    const ethAddress = req.query.wallet
    if (!ethAddress) {
      return this._error(res, 'A wallet address must be supplied.')
    } else if (!this.web3.utils.isAddress(ethAddress)) {
      return this._error(res, `Invalid wallet address ${ethAddress}.`)
    }

    let txnHash = null
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
        return this._error(res, `Invalid campaign code ${code}`)
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
        return this._error(res, `Campaign budget exhausted.`)
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
        return this._error(res, `Address ${ethAddress} already used this code.`)
      }

      // Safety valve ! Refuse to submit too many pending transactions.
      if (this.nonceMgr.pendingTxnCount > MaxNumberPendingTxnCount) {
        logger.error('Too many pending transactions: ${this.pendingTxnCount}')
        throw new Error('Too many pending transactions. Retry later.')
      }

      // Create a FaucetTxn row in Pending status.
      const faucetTxn = await db.FaucetTxn.create({
        campaignId: campaign.id,
        status: enums.FaucetTxnStatuses.Pending,
        fromAddress: this.hotWalletAddress.toLowerCase(),
        toAddress: ethAddress.toLowerCase(),
        amount: campaign.amount,
        currency: campaign.currency
      })

      const txnMgr = new TxnManager(this.web3, this.nonceMgr)
      try {
        // Submit the transaction and wait for its hash.
        txnHash = await txnMgr.send(this.hotWalletAddress, ethAddress, amount)

        // Waiting for the receipt takes too long (up to several min on Mainnet).
        // Send response back to client showing the transaction hash right away.
        this._success(res, ethAddress, amount, txnHash)

        // Store the txnHash in the DB.
        await faucetTxn.update({ txnHash })

        // Wait for the transaction receipt.
        const receipt = await txnMgr.receipt()
        logger.info(
          `Got receipt. txnHash: ${txnHash} blockNumber: ${receipt.blockNumber}`
        )

        // Update status to Confirmed in the DB.
        await faucetTxn.update({ status: enums.FaucetTxnStatuses.Confirmed })
      } catch (e) {
        // Log error and update txn status in the DB.
        logger.error(`Transaction failure. txnHash: ${txnHash}`)
        await faucetTxn.update({ status: enums.FaucetTxnStatuses.Failed })

        // Rethrow to show an error to the user.
        throw e
      } finally {
        logger.info('Done. Cleaning up TxnMgr.')
        txnMgr.done()
      }
    } catch (err) {
      // If txnHash exists, response was sent back so no need to send an error.
      if (txnHash) {
        logger.error(err)
      } else {
        this._error(res, err)
      }
    }
  }
}

module.exports = EthDistributor
