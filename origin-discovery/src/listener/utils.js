const logger = require('./logger')
const db = require('../models')
const fs = require('fs')

const MAX_RETRYS = 10
const MAX_RETRY_WAIT_MS = 2 * 60 * 1000

/**
 * Returns the first block the listener should start at for following events.
 * Reads the persisted state from either DB or continue file.
 */
async function getLastBlock(config) {
  let lastBlock
  if (config.continueFile) {
    // Read state from continue file.
    if (!fs.existsSync(config.continueFile)) {
      // No continue file. This happens if a listener is started for the first time.
      lastBlock = config.defaultContinueBlock
    } else {
      const json = fs.readFileSync(config.continueFile, { encoding: 'utf8' })
      const data = JSON.parse(json)

      // check for undefined explicitly -> just checking `if (!data.lastLogBlock)` will throw
      // an error when lastLogBlock === 0
      if (data.lastLogBlock === undefined) {
        throw new Error(`Error: invalid format for continue file.`)
      }
      lastBlock = data.lastLogBlock
    }
  } else {
    // Read state from DB.
    const row = await db.Listener.findByPk(config.listenerId)
    if (!row) {
      // No state in DB. This happens if a listener is started for the first time.
      lastBlock = config.defaultContinueBlock
    } else {
      lastBlock = row.blockNumber
    }
  }
  return lastBlock
}

/**
 * Stores the last block we have read up.
 * Writes in either DB or continue file.
 */
async function setLastBlock(config, blockNumber) {
  if (config.continueFile) {
    const json = JSON.stringify({ lastLogBlock: blockNumber, version: 1 })
    fs.writeFileSync(config.continueFile, json, { encoding: 'utf8' })
  } else {
    await db.Listener.upsert({ id: config.listenerId, blockNumber })
  }
}

/**
 * Ensures data fetched from the blockchain meets the freshness criteria
 * specified in blockInfo. This is to catch the case where data is fetched from
 * an out of sync node that returns stale data.
 * @param {Array<Event>} events
 * @param {{blockNumber: number, logIndex: number}} blockInfo
 * @throws {Error} If freshness check fails
 */
function checkEventsFreshness(events, blockInfo) {
  // Find at least 1 event that is as fresh as blockInfo.
  const fresh = events.some(event => {
    return (
      event.blockNumber > blockInfo.blockNumber ||
      (event.blockNumber === blockInfo.blockNumber &&
        event.logIndex >= blockInfo.logIndex)
    )
  })
  if (!fresh) {
    throw new Error('Freshness check failed')
  }
}

/**
 * Retries up to N times, with exponential backoff.
 * @param {async function} fn - Async function to call
 * @param {boolean} exitOnError - Whether or not to exit the process when
 *   max number of attempts reached.
 * @return {Promise<*>}
 */
async function withRetrys(fn, exitOnError = true) {
  let tryCount = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn() // Do our action.
    } catch (e) {
      // Roughly double wait time each failure
      let waitTime = Math.pow(100, 1 + tryCount / 6)
      // Randomly jiggle wait time by 20% either way. No thundering herd.
      waitTime = Math.floor(waitTime * (1.2 - Math.random() * 0.4))
      // Max out at two minutes
      waitTime = Math.min(waitTime, MAX_RETRY_WAIT_MS)
      logger.error(e, `will retry in ${waitTime / 1000} seconds`)
      tryCount += 1
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    if (tryCount >= MAX_RETRYS) {
      if (exitOnError) {
        logger.error('EXITING ! Maximum number of retrys reached')
        // Now it's up to our environment to restart us.
        // Hopefully with a clean start, things will work better
        process.exit(1)
      } else {
        throw new Error('Maximum number of retrys reached')
      }
    }
  }
}

module.exports = {
  getLastBlock,
  setLastBlock,
  checkEventsFreshness,
  withRetrys
}
