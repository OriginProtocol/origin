const Bottleneck = require('bottleneck')
const flattenDeep = require('lodash/flattenDeep')
const range = require('lodash/range')

const db = {
  //...require('@origin/bridge/src/models'),
  //...require('@origin/identity/src/models'),
  ...require('../../../models')
}

const log = require('../../logger')

const JSONRPC_REQUEST_BATCH_SIZE = 1000 // 10000 was too much?
const limiter = new Bottleneck({ maxConcurrent: 25 })
limiter.on('error', err => {
  log.error('Error occurred within rate limiter', err)
})
limiter.on('failed', async (err, jobInfo) => {
  log.warn(`Job ${jobInfo.options.id} failed`, err)
  // Retry 3 times
  if (jobInfo.retryCount < 4) {
    // 250ms wait for retry
    log.info('Retrying job...')
    return 250
  }
})

/**
 * Simple assert function
 *
 * @param expr {bool} Boolean expression to evailuate
 * @mparam msg {string} message to include with the thrown error
 * @returns {bool} Useless bool, returns true if success
 * @throws {Error} describing assertion error
 */
function assert(expr, msg) {
  if (!expr) throw new Error(`Assertion error: ${msg}`)
  return true
}

/**
 * Get latest block number for a specific event listener
 *
 * @param id {string} listener ID
 * @param prefix {string} Prefix of the listener ID, if one
 * @returns {number} block number the listener is at
 */
async function getListenerBlock(id, prefix) {
  const listenerId = `${prefix}${id}`

  const res = await db.Listener.findAll({
    where: {
      id: listenerId
    },
    order: [['created_at', 'DESC'], ['updated_at', 'DESC']]
  })

  if (res.length < 1) {
    return 0
  }

  const listenerBlock = res[0].blockNumber

  if (!listenerBlock) {
    return 0
  }

  return listenerBlock
}

/**
 * Do getPastEvents for a contract in batched requests
 */
async function getPastEvents(contract, event, { fromBlock = 0, toBlock = 0 }) {
  event = event ? event : 'allEvents'

  log.debug(
    `getPastEvents(${contract}, ${event}) fromBlock: ${fromBlock} toBlock: ${toBlock}`
  )

  const requests = range(fromBlock, toBlock, JSONRPC_REQUEST_BATCH_SIZE).map(
    start =>
      limiter.schedule(args => contract.getPastEvents(event, args), {
        fromBlock: start,
        toBlock: Math.min(start + JSONRPC_REQUEST_BATCH_SIZE - 1, toBlock)
      })
  )

  log.debug(`Request batch count: ${requests.length}`)

  return flattenDeep(await Promise.all(requests))
}

module.exports = {
  assert,
  getListenerBlock,
  getPastEvents
}
