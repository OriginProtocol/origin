import chunk from 'lodash/chunk'
import flattenDeep from 'lodash/flattenDeep'
import Web3 from 'web3'

import { get, post } from '@origin/ipfs'

import { debug, validateParams } from './utils'
import {
  InMemoryBackend,
  IndexedDBBackend,
  PostgreSQLBackend
} from './backends'

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
export default class EventCache {
  /**
   * constructor
   *
   * @param contract {web3.eth.Contract} The contract to patch
   * @param fromBlock {number} The block number to start the event search at. If
   *    null, or not given it will start at the latest known to the cache
   *    backend
   * @param config {object} A configuration JS object (See EventCache)
   */
  constructor(contract, fromBlock = null, config) {
    this._processConfig(config)

    this.contract = contract
    this.web3 = new Web3(contract.currentProvider)

    // If the cache is populated, start from the latest known block
    if (fromBlock === null) {
      const latestKnown = this.backend.getLatestBlock()
      if (latestKnown && latestKnown > 0) {
        fromBlock = latestKnown
      } else {
        fromBlock = 0
      }
    }

    this.originBlock = fromBlock
    this.fromBlock = this.originBlock
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
      case 'mobile':
        // TODO
        throw new Error('mobile platform not yet implemented')

      case 'nodejs':
        return new PostgreSQLBackend()

      case 'browser':
        return new IndexedDBBackend()

      default:
        return new InMemoryBackend()
    }
  }

  /**
   * _processConfig processes the provided configuration object
   */
  _processConfig(conf) {
    if (typeof conf.backend !== 'undefined') {
      this.backend = conf.backend
    } else {
      this.backend = this._getBackend(conf.platform)
    }

    this.ipfsServer =
      conf.ipfsGateway || conf.ipfsServer || 'https://ipfs.originprotocol.com'

    if (typeof conf.ipfsEventCache !== 'undefined') {
      self.loadCheckpoint(conf.ipfsEventCache)
    }
  }

  /**
   * _fetchEvents makes the necessary calls to fetch the event logs from the JSON-RPC provider
   *
   * @param fromBlock {number} The block to start the search at
   * @param toBlock {T} The number to search to (or 'latest')
   * @returns {Array} An array of event objects
   */
  async _fetchEvents(fromBlock, toBlock = 'latest') {
    if (toBlock === 'latest') {
      // We need to be able to math it
      toBlock = await this.web3.eth.getBlockNumber()
      debug(`New block found: ${toBlock}`)
    }

    if (fromBlock > toBlock) return []

    const partitions = []
    const results = []

    while (fromBlock <= toBlock) {
      toBlock = Math.min(fromBlock + 20000, toBlock)
      partitions.push(
        this.contract.getPastEvents('allEvents', { fromBlock, toBlock })
      )
      fromBlock = toBlock + 1
    }

    this.fromBlock = fromBlock

    const chunks = chunk(partitions, 7)
    for (const chunklet of chunks) {
      results.push(await Promise.all(chunklet))
    }

    return flattenDeep(results)
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
    if (!validateParams(this.contract, params)) {
      debug(params)
      throw new TypeError('Invalid event parameters')
    }

    const newEvents = await this._fetchEvents(this.fromBlock)
    if (newEvents.length > 0) {
      await this.backend.addEvents(newEvents)
    }

    return await this.backend.get(params)
  }

  /**
   * saveCheckpoint saves a checkpoint to IPFS for later reload
   *
   * @returns {string} - The IPFS hash of the checkpoint
   */
  async saveCheckpoint() {
    const serialized = await this.backend.serialize()
    return await post(this.ipfsServer, serialized)
  }

  /**
   * loadCheckpoint loads events from an IPFS hash
   */
  async loadCheckpoint(ipfsHash) {
    const serialized = await get(this.ipfsServer, ipfsHash)
    return await this.backend.loadSerialized(serialized)
  }
}
