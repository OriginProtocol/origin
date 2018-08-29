const express = require('express')
const Web3 = require('web3')

const Config = require('../lib/config.js')
const Token = require('../lib/token.js')

const DEFAULT_SERVER_PORT = 5000
const DEFAULT_NETWORK_ID = '999' // Local blockchain.

// Credit 100 token units per request.
const NUM_TOKENS = 100


// Starts the Express server.
function runApp(config) {
  const app = express()
  const token = new Token(config)

  // Route /tokens is for crediting tokens.
  app.get('/tokens', async function (req, res, next) {
    const networkId = req.query.network_id
    const wallet = req.query.wallet
    if (!req.query.wallet) {
      res.send('Error: A wallet address must be supplied.')
    } else if (!Web3.utils.isAddress(wallet)) {
      res.send(`Error: ${wallet} is a malformed wallet address.`)
      return
    }

    try {
      // Transfer NUM_TOKENS to specified wallet.
      const value = token.toNaturalUnit(NUM_TOKENS)
      const balanceUnit = await token.credit(networkId, wallet, value)
      const balanceToken = token.toTokenUnit(balanceUnit)
      console.log(`${NUM_TOKENS} OGN -> ${wallet} (${balanceUnit})`)

      // Send response back to client.
      const resp = `Credited ${NUM_TOKENS} OGN tokens to wallet <br>` +
                  `New balance (natural unit) = ${balanceUnit}<br>` +
                  `New balance (token unit) = ${balanceToken}`
      res.send(resp)
    } catch (err) {
      next(err) // Errors will be passed to Express.
    }
  })

  app.use(express.static(__dirname + '/public'))
  app.listen(
    config.port || DEFAULT_SERVER_PORT,
    () => console.log(`Origin faucet app listening on port ${config.port}!`))
}

//
// Main
//
let args = Config.parseArgv()
let config = {
  // Port server listens on.
  port: args['--port'] || DEFAULT_SERVER_PORT,
  // Network ids, comma separated.
  // If no network ids specified, defaults to using local blockchain.
  networkIds: (args['--network_ids'] || DEFAULT_NETWORK_ID).split(','),
}

try {
  config.providers = Config.createProviders(config.networkIds)
} catch (err) {
  console.log('Config error:', err)
  process.exit(-1)
}

runApp(config)
