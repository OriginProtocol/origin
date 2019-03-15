require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const express = require('express')
const { RateLimiterMemory } = require('rate-limiter-flexible')

const Config = require('@origin/token/src/config')

const logger = require('./logger')

const EthDistributor = require('./eth')
const OgnDistributor = require('./ogn')

const DEFAULT_SERVER_PORT = 5000
const DEFAULT_NETWORK_ID = '999' // Local blockchain.

// Starts the Express server.
async function runApp(config) {
  const app = express()

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
          logger.error(`Rejecting request due to rate limiting.`)
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

  // Register the /tokens route for distributing tokens.
  const ognDistributor = new OgnDistributor(config)
  app.get('/tokens', ognDistributor.process)

  // Register the /eth route for distributing Eth.
  const ethDistributor = new EthDistributor(config)
  app.get('/eth', ethDistributor.main)
  app.get('/eth_dist', ethDistributor.process)

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

logger.info('Config: ', config)

if (!config.networkIds) {
  logger.error('Network ids not configured.')
  process.exit(-1)
}
if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL not configured.')
  process.exit(-1)
}

try {
  config.providers = Config.createProviders(config.networkIds)
} catch (err) {
  logger.error('Config error:', err)
  process.exit(-1)
}

runApp(config)
