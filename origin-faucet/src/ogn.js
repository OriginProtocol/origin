const Web3 = require('web3')

const Token = require('origin-token/src/token')
const logger = require('./logger')

// Credit 100 tokens per request.
const NUM_TOKENS = 100

class OgnDistributor {
  constructor(config) {
    this.token = new Token(config)

    // Needed to be able to use process as a route in Express.
    this.process  = this.process.bind(this)
  }

  async process(req, res, next) {
    const networkId = req.query.network_id
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
      const contractAddress = this.token.contractAddress(networkId)
      const receipt = await this.token.credit(networkId, wallet, value)
      const txHash = receipt.transactionHash
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
