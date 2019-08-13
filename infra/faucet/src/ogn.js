const Web3 = require('web3')

const Token = require('@origin/token/src/token')
const logger = require('./logger')

// Credit 100 tokens per request.
const NUM_TOKENS = 100

// Number of block confirmations required for a transfer to be consider completed.
const NumBlockConfirmation = 1
// Wait up to 2 min for a transaction to get confirmed
const ConfirmationTimeoutSec = 2 * 60

// Basic class for distributing OGN.
// TODO:
//  - Add support for concurrent requests. As is, if N requests are issued,
//  the same nonce would get used for all of them and only a single transaction
//  would succeed, the other N-1 transactions would get rejected due to using duplicate nonce.
//  - Hardening: handle case where token.waitForTxConfirmation returns an error o times out.
class OgnDistributor {
  constructor(networkId) {
    this.token = new Token(networkId)

    // Needed to use the process method as a route in Express.
    this.process = this.process.bind(this)
  }

  async process(req, res, next) {
    const wallet = req.query.wallet
    if (!req.query.wallet) {
      res.send('<h2>Error: A wallet address must be supplied.</h2>')
    } else if (!Web3.utils.isAddress(wallet)) {
      res.send(`<h2>Error: ${wallet} is a malformed wallet address.</h2>`)
      return
    }

    try {
      // Transfer NUM_TOKENS to the specified wallet.
      const value = this.token.toNaturalUnit(NUM_TOKENS)
      const contractAddress = this.token.contractAddress
      const txHash = await this.token.credit(wallet, value)
      const { status } = await this.token.waitForTxConfirmation(txHash, {
        numBlocks: NumBlockConfirmation,
        timeoutSec: ConfirmationTimeoutSec
      })
      if (status !== 'confirmed') {
        throw new Error(`Failure. status=${status} txHash=${txHash}`)
      }
      logger.info(`${NUM_TOKENS} OGN -> ${wallet} TxHash=${txHash}`)

      // Send response back to client.
      const resp =
        `Credited ${NUM_TOKENS} OGN tokens to wallet ${wallet}<br>` +
        `TxHash = ${txHash}<br>` +
        `OGN token contract address = ${contractAddress}`
      res.send(resp)
    } catch (err) {
      next(err) // Errors will be passed to Express.
    }
  }
}

module.exports = OgnDistributor
