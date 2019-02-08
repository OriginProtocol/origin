require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const express = require('express')
const { RateLimiterMemory } = require('rate-limiter-flexible')
const Web3 = require('web3')

const Config = require('origin-token/src/config')
const Token = require('origin-token/src/token')

const DEFAULT_SERVER_PORT = 5000
const DEFAULT_NETWORK_ID = '999' // Local blockchain.

// Credit 100 tokens per request.
const NUM_TOKENS = 100

// Starts the Express server.
function runApp(config) {
  const app = express()
  const token = new Token(config)

  // Configure rate limiting. Allow at most 1 request per IP every 60 sec.
  const opts = {
    points: 1, // Point budget.
    duration: 60 // Reset points consumption every 60 sec.
  }
  const rateLimiter = new RateLimiterMemory(opts)
  const rateLimiterMiddleware = (req, res, next) => {
    // Rate limiting only applies to the /tokens route.
    if (req.url.startsWith('/tokens')) {
      rateLimiter
        .consume(req.connection.remoteAddress)
        .then(() => {
          // Allow request and consume 1 point.
          next()
        })
        .catch(() => {
          // Not enough points. Block the request.
          console.log(`Rejecting request due to rate limiting.`)
          res.status(429).send('<h2>Too Many Requests</h2>')
        })
    } else {
      next()
    }
  }
  // Note: register rate limiting middleware *before* all routes
  // so that it gets executed first.
  app.use(rateLimiterMiddleware)

  // Configure directory for public assets.
  app.use(express.static(__dirname + '/../public'))

  // Register the /tokens route for crediting tokens.
  app.get('/tokens', async function(req, res, next) {
    const networkId = req.query.network_id
    const wallet = req.query.wallet
    if (!req.query.wallet) {
      res.send('<h2>Error: A wallet address must be supplied.</h2>')
    } else if (!Web3.utils.isAddress(wallet)) {
      res.send(`<h2>Error: ${wallet} is a malformed wallet address.</h2>`)
      return
    }

    try {
      // Transfer NUM_TOKENS to specified wallet.
      const value = token.toNaturalUnit(NUM_TOKENS)
      const contractAddress = token.contractAddress(networkId)
      const receipt = await token.credit(networkId, wallet, value)
      const txHash = receipt.transactionHash
      console.log(`${NUM_TOKENS} OGN -> ${wallet} TxHash=${txHash}`)

      // Send response back to client.
      const resp =
        `Credited ${NUM_TOKENS} OGN tokens to wallet ${wallet}<br>` +
        `TxHash = ${txHash}<br>` +
        `OGN token contract address = ${contractAddress}`
      res.send(resp)
    } catch (err) {
      next(err) // Errors will be passed to Express.
    }
  })

  // Start the server.
  app.listen(config.port || DEFAULT_SERVER_PORT, () =>
    console.log(`Origin faucet app listening on port ${config.port}!`)
  )
}

//
// Main
//
const args = Config.parseArgv()
const config = {
  // Port server listens on.
  port: parseInt(args['--port'] || process.env.PORT || DEFAULT_SERVER_PORT),
  // Network ids, comma separated.
  // If no network ids specified, defaults to using local blockchain.
  networkIds: (
    args['--network_ids'] ||
    process.env.NETWORK_IDS ||
    DEFAULT_NETWORK_ID
  )
    .split(',')
    .map(parseInt)
}

try {
  config.providers = Config.createProviders(config.networkIds)
} catch (err) {
  console.log('Config error:', err)
  process.exit(-1)
}

runApp(config)
