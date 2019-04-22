const flattenDeep = require('lodash/flattenDeep')
const memoize = require('lodash/memoize')
const range = require('lodash/range')
const chunk = require('lodash/chunk')
const Web3 = require('web3')
const Bottleneck = require('bottleneck')

const { get, post } = require('@origin/ipfs')

const { debug, validateParams } = require('./utils')
const {
  InMemoryBackend,
  IndexedDBBackend,
  PostgreSQLBackend
} = require('./backends/browser')

const limiter = new Bottleneck({ maxConcurrent: 25 })

const getPastEvents = memoize(
  async function(instance, fromBlock, toBlock, batchSize = 10000) {
    // if (typeof instance.ipfsEventCache !== 'undefined') {
    //   debug(`loading event cache checkpoint ${instance.ipfsEventCache}`)
    //   instance.loadCheckpoint(instance.ipfsEventCache)
    // }
    if (!instance.loadedCache && instance.ipfsEventCache) {
      debug('Loading event cache from IPFS')
      const cachedEvents = await Promise.all(
        instance.ipfsEventCache.map(hash => get(instance.ipfsServer, hash))
      )

      debug('Loaded event cache', flattenDeep(cachedEvents))
      instance.loadedCache = true
    }

    const requests = range(fromBlock, toBlock, batchSize).map(start =>
      limiter.schedule(
        args => instance.contract.getPastEvents('allEvents', args),
        { fromBlock: start, toBlock: Math.min(start + batchSize - 1, toBlock) }
      )
    )

    const numBlocks = toBlock - fromBlock
    debug(`Get ${numBlocks} blocks in ${requests.length} requests`)

    if (!numBlocks) return

    const newEvents = flattenDeep(await Promise.all(requests))
    debug(`Got ${newEvents.length} new events`)

    if (newEvents.length > 0) {
      await instance.backend.addEvents(newEvents)
      debug(`Added all events to backend`)
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

    this.contract = contract
    this.originBlock = Number(originBlock)
    this.web3 = new Web3(contract.currentProvider)

    const addr = this.contract._address.substr(0, 10)
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
        return new PostgreSQLBackend()

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
    this.ipfsEventCache =
      conf.ipfsEventCache && conf.ipfsEventCache.length
        ? conf.ipfsEventCache
        : null

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
    let fromBlock = this.lastQueriedBlock || this.originBlock
    const latestKnown = await this.backend.getLatestBlock()
    // if (!latestKnown && this.ipfsEventCache) {
    if (latestKnown >= fromBlock) {
      fromBlock = latestKnown + 1
    }

    let toBlock = this.latestBlock
    if (this.useLatestFromChain || !toBlock) {
      toBlock = this.latestBlock = await this.web3.eth.getBlockNumber()
    }

    if (fromBlock > toBlock) {
      debug('fromBlock > toBlock')
      return
    }

    await getPastEvents(this, fromBlock, toBlock, this.batchSize)
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
  getBlockNumber() {
    return this.backend.getLatestBlock()
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
