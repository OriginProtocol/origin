const flattenDeep = require('lodash/flattenDeep')
const memoize = require('lodash/memoize')
const range = require('lodash/range')
const chunk = require('lodash/chunk')
const Web3 = require('web3')
const Bottleneck = require('bottleneck')

const { get, post } = require('@origin/ipfs')

const { debug, validateParams } = require('./utils')
const { InMemoryBackend, IndexedDBBackend } = require('./backends/browser')

let PostgreSQLBackend
if (!process.env.WEBPACK_BUILD) {
  PostgreSQLBackend = require('./backends/PostgreSQLBackend').PostgreSQLBackend
}

const limiter = new Bottleneck({ maxConcurrent: 25 })
limiter.on('error', err => {
  debug('Error occurred within rate limiter', err)
})
limiter.on('failed', async (err, jobInfo) => {
  debug(`Job ${jobInfo.options.id} failed`, err)
  // Retry 3 times
  if (jobInfo.retryCount < 4) {
    // 250ms wait for retry
    debug('Retrying job...')
    return 250
  }
})

const getPastEvents = memoize(
  async function(instance, fromBlock, toBlock, batchSize = 10000) {
    if (
      instance.ipfsEventCache && // IPFS cache configured.
      !instance.loadedCache && // IPFS cache hasn't been loaded yet.
      (!instance.latestIndexedBlock || // Back-end does not support persistent storage. Always load cache at startup.
        instance.latestIndexedBlock < instance.cacheMaxBlock) // Data indexed in back-end is not as fresh as cache.
    ) {
      try {
        debug('Loading event cache from IPFS', instance.ipfsEventCache)
        const cachedEvents = flattenDeep(
          await Promise.all(
            instance.ipfsEventCache.map(hash => get(instance.ipfsServer, hash))
          )
        )
        const lastCached = cachedEvents[cachedEvents.length - 1].blockNumber
        debug(`Loaded ${cachedEvents.length} events from IPFS cache`)
        debug(`Last cached blockNumber: ${lastCached}`)
        debug(`Latest indexed block: ${instance.latestIndexedBlock}`)
        if (
          !instance.latestIndexedBlock ||
          lastCached > instance.latestIndexedBlock
        ) {
          debug(`Adding IPFS events to backend`)
          await instance.backend.addEvents(cachedEvents)
          fromBlock = lastCached + 1
        }
      } catch (e) {
        debug(`Error loading IPFS events`, e)
      }

      instance.loadedCache = true
    } else {
      debug('Skipped loading event from IPFS cache.')
    }

    // Paranoia check.
    if (!instance.contract || !instance.contract.options.address) {
      throw new Error(
        `EventCache.getPastEvents failure. Contract ${instance.prefix} missing address!`
      )
    }

    const requests = range(fromBlock, toBlock + 1, batchSize).map(start =>
      limiter.schedule(
        args => instance.contract.getPastEvents('allEvents', args),
        { fromBlock: start, toBlock: Math.min(start + batchSize - 1, toBlock) }
      )
    )

    const numBlocks = toBlock - fromBlock + 1
    debug(`Get ${numBlocks} blocks in ${requests.length} requests`)

    if (!numBlocks) return

    const newEvents = flattenDeep(await Promise.all(requests))
    debug(`Got ${newEvents.length} new events`)

    if (newEvents.length > 0) {
      try {
        await instance.backend.addEvents(newEvents)
        debug(`Added all new events to backend`)
      } catch (e) {
        debug('Error adding new events to backend', e)
      }
    }

    instance.lastQueriedBlock = toBlock
  },
  (...args) => `${args[0].contract._address}-${args[1]}-${args[2]}`
)

/**
 * @class
 * @classdesc EventCache to define the interface for EventCache backends
 *
 * Example configuration object(all optional):
 * {
 *    backend: new InMemoryBackend(),
 *    platform: 'browser', // or 'nodejs', and eventually 'mobile'
 *    ipfsServer: 'http://localhost:5002',
 *    ipfsEventCache: 'QmBase64HashThisisTHISis...'
 * }
 */
class EventCache {
  /**
   * constructor
   *
   * @param contract {web3.eth.Contract} The contract to patch
   * @param fromBlock {number} The block number to start the event search at. If
   *    null, or not given it will start at the latest known to the cache
   *    backend
   * @param config {object} A configuration JS object (See EventCache)
   */
  constructor(contract, originBlock = 0, config) {
    this._processConfig(config)

    if (
      !(contract._address || (contract.options && contract.options.address))
    ) {
      throw new Error(
        `Contract ${this.prefix} missing address!  Can not initialize EventCache`
      )
    }

    this.contract = contract
    this.originBlock = Number(originBlock)
    this.web3 = new Web3(contract.currentProvider)
    this.lastQueriedBlock = 0
    this.latestIndexedBlock = 0

    const addr = (this.contract._address || 'no-contract').substr(0, 10)
    debug(`EventCache using backend ${this.backend.type}`)
    debug(`Initialized ${addr} with originBlock ${this.originBlock}`)
  }

  /**
   * Detect and return a platform string
   *
   * @returns {string} - The platform string
   */
  _detectPlatform() {
    if (typeof window !== 'undefined') {
      return 'browser'
    }
    return 'nodejs'
  }

  /**
   * _getBackend initializes a storage backend
   *
   * @returns {object} An initialized storage backend
   */
  _getBackend(platform) {
    if (!platform) platform = this._detectPlatform()

    switch (platform) {
      case 'nodejs':
      case 'postgresql':
        return new PostgreSQLBackend({ prefix: this.prefix })

      case 'browser':
        return new IndexedDBBackend({ prefix: this.prefix })
      case 'mobile':
      case 'memory':
      default:
        return new InMemoryBackend()
    }
  }

  /**
   * _processConfig processes the provided configuration object
   */
  _processConfig(conf) {
    this.prefix = conf.prefix || ''
    if (typeof conf.backend !== 'undefined') {
      this.backend = conf.backend
    } else {
      this.backend = this._getBackend(conf.platform)
    }

    this.ipfsServer =
      conf.ipfsGateway || conf.ipfsServer || 'https://ipfs.originprotocol.com'

    this.batchSize = conf.batchSize || 10000

    // If config specifies a cache, it should also have cacheMaxBlock.
    if (
      conf.ipfsEventCache &&
      conf.ipfsEventCache.length &&
      !conf.cacheMaxBlock
    ) {
      throw new Error('cacheMaxBlock missing from config.')
    }

    this.ipfsEventCache =
      conf.ipfsEventCache && conf.ipfsEventCache.length
        ? conf.ipfsEventCache
        : null
    this.cacheMaxBlock = conf.cacheMaxBlock

    /**
     * Only reason to set this false is if something external will manage the
     * latest block with setLatestBlock()
     */
    this.useLatestFromChain =
      typeof conf.useLatestFromChain !== 'undefined'
        ? conf.useLatestFromChain
        : true
  }

  /**
   * _fetchEvents makes the necessary calls to fetch the event logs from the JSON-RPC provider
   *
   * @param fromBlock {number} The block to start the search at
   * @param toBlock {T} The number to search to (or 'latest')
   * @returns {Array} An array of event objects
   */
  async _fetchEvents() {
    // Do not fetch events if this isn't a writer
    if (typeof process.env.EVENTCACHE_SLAVE !== 'undefined') {
      debug('_fetchEvents disabled. slave instance')
      return
    }
    let toBlock = this.latestBlock

    if (this.useLatestFromChain || !toBlock) {
      toBlock = this.latestBlock = await this.web3.eth.getBlockNumber()
    }

    if (this.latestBlock && this.lastQueriedBlock === this.latestBlock) {
      debug('noop, current')
      return
    }

    // Set if missing
    if (this.latestIndexedBlock === 0) {
      this.latestIndexedBlock = await this.backend.getLatestBlock()
    }

    /**
     * Base fromBlock on the latest block number that had an event and was added
     * to the backend. This is defensive against accidental "future" requests on
     * nodes that may be out of sync
     */
    const fromBlock = this.latestIndexedBlock
      ? this.latestIndexedBlock + 1
      : this.originBlock

    if (fromBlock > toBlock) {
      debug(`fromBlock > toBlock (${fromBlock} > ${toBlock})`)
      return
    }

    await getPastEvents(this, fromBlock, toBlock, this.batchSize)

    // Update latestIndexedBlock
    this.latestIndexedBlock = await this.backend.getLatestBlock()
  }

  /**
   * getPastEvents retrieves all events
   *
   * @param eventName {string} The name of the event
   * @param options {object} An Object as defined by web3.js' getPastEvents
   * @returns {Array} An array of event objects
   */
  async getPastEvents(eventName, options) {
    let args = {}
    if (options && options.filter) {
      args = {
        event: eventName,
        ...options.filter
      }
    } else {
      args = {
        event: eventName
      }
    }
    return await this.getEvents(args)
  }

  /**
   * getEvents retrieves all events fitting the filter
   * @param params {object} - An object with params to match events against
   * @returns {Array} - An array of event objects
   */
  async getEvents(params) {
    if (params && !validateParams(this.contract, params)) {
      debug(params)
      throw new TypeError('Invalid event parameters')
    }

    await this._fetchEvents()
    return await this.backend.get(params)
  }

  /**
   * allEvents retrieves all events wihtout filter
   * @returns {Array} - An array of event objects
   */
  async allEvents() {
    await this._fetchEvents()
    return await this.backend.all()
  }

  /**
   * Returns the latest block number known by the backend
   * @returns {number} The latest known block number
   */
  async getBlockNumber() {
    return await this.backend.getLatestBlock()
  }

  /**
   * Set the latest known block number, if managing this externally
   * @param {number} The latest known block number
   */
  setLatestBlock(num) {
    debug(`setLatestBlock to ${num}`)
    this.latestBlock = num
  }

  /**
   * saveCheckpoint saves a checkpoint to IPFS for later reload
   *
   * @returns {string} - The IPFS hash of the checkpoint
   */
  async saveCheckpoint() {
    const serialized = await this.allEvents()
    return await Promise.all(
      chunk(serialized, 1500).map(events => post(this.ipfsServer, events, true))
    )
  }

  /**
   * loadCheckpoint loads events from an IPFS hash
   */
  async loadCheckpoint(ipfsHashes) {
    const events = await Promise.all(
      ipfsHashes.map(hash => get(this.ipfsServer, hash))
    )
    return flattenDeep(events)
  }
}

module.exports = {
  EventCache
}
