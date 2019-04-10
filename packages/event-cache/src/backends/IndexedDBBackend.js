import { openDB } from 'idb'
import uniq from 'lodash/uniq'
import intersectionBy from 'lodash/intersectionBy'

import AbstractBackend from './AbstractBackend'
import { debug } from '../utils'

function checkForIndexedDB() {
  // Just look for a global, since testing in node may inject
  if (typeof indexedDB === 'undefined') {
    throw new Error('Unable to find IndexedDB')
  }
}

function normalizedIndexes(indexes) {
  return uniq(
    indexes.map(idx => {
      if (idx.includes('.')) {
        return idx.split('.').pop()
      }
      return idx
    })
  )
}

function createIndexeMap(indexes) {
  const idxMap = {}
  indexes.map(idx => {
    if (idx.includes('.')) {
      idxMap[idx.split('.').pop()] = idx
    } else {
      idxMap[idx] = idx
    }
  })
  return idxMap
}

const DB_NAME = 'origin-event-cache'
const EVENT_STORE = 'events'
const SCHEMA_VERSION = 1
// TODO: Fill out the indexes
const INDEXES = [
  'event',
  'transactionHash',
  'address',
  'returnValues.account',
  'returnValues.party'
]
const NORM_INDEXES = normalizedIndexes(INDEXES)
const ARG_TO_INDEX_MAP = createIndexeMap(INDEXES)

/**
 * @class
 * @classdesc IndexedDBBackend for running in-browser storage
 */
export default class IndexedDBBackend extends AbstractBackend {
  constructor({ testing = false }) {
    super()

    this.type = 'indexeddb'
    this.ready = false
    this._db = null

    // Make sure we're sane
    if (testing) {
      if (typeof global === 'undefined') {
        throw new Error('Environment not sane for testing.')
      }
      /**
       * We're testing here, anything goes!
       */
      require('fake-indexeddb/auto')
    } else {
      checkForIndexedDB()
    }

    const that = this
    this.initDB().then(() => {
      that.ready = true
    })
  }

  /**
   * Idle until the DB initialization is done
   */
  async waitForReady() {
    // eslint-disable-next-line no-empty
    while (!this.ready) {}
    return this.ready
  }

  async initDB() {
    this._db = await openDB(DB_NAME, SCHEMA_VERSION, {
      upgrade(db) {
        const eventStore = db.createObjectStore(EVENT_STORE, {
          keyPath: 'id',
          autoIncrement: true
        })
        for (let i = 0; i < INDEXES.length; i++) {
          debug(`creatIndex(${INDEXES[i]}, ${INDEXES[i]}, { unique: false })`)
          eventStore.createIndex(INDEXES[i], INDEXES[i], { unique: false })
        }
      }
    })
  }

  /**
   * Dumps an array of event objects
   *
   * @returns {Array} of events
   */
  async serialize() {
    return this._storage
  }

  /**
   * Loads the serialized data from IPFS
   *
   * @param ipfsData {Array} An array of events to load
   */
  async loadSerialized(ipfsData) {
    this._storage = ipfsData
  }

  /**
   * Fetch events from the store matching objects
   *
   * @param argMatchObject {object} A JS object representing the event
   * @returns {Array} An array of event objects
   */
  async get(argMatchObject) {
    await this.waitForReady()

    const indexedArgs = Object.keys(argMatchObject).filter(key => {
      if (
        typeof argMatchObject[key] !== 'undefined' &&
        NORM_INDEXES.includes(key)
      ) {
        return key
      }
    })

    const unindexedArgs = Object.keys(argMatchObject).filter(key => {
      if (
        typeof argMatchObject[key] !== 'undefined' &&
        !NORM_INDEXES.includes(key)
      ) {
        return key
      }
    })

    /**
     * A little hinky, but first get the results from any indexed args. There's
     * apparently no way to utilize multiple indexes at once, so, we're kind of
     * getting spicy here.
     *
     * Since we also don't know the granularity of each index, we're going to
     * run a query against every matching index, then intersect them ourselves
     * for the results.
     */
    const indexedSet = []
    if (indexedArgs.length > 0) {
      let matchedSet = []

      // Query against each index that maches an arg
      for (let i = 0; i < indexedArgs.length; i++) {
        const res = await this._db.getAllFromIndex(
          EVENT_STORE,
          ARG_TO_INDEX_MAP[indexedArgs[i]],
          argMatchObject[indexedArgs[i]]
        )
        indexedSet.push(res)
      }

      // Get only the objects that matched all the indexed args
      matchedSet = intersectionBy(...indexedSet, el => {
        return `${el.event}-${el.transactionHash}-${el.logIndex}`
      })

      // And do further matching against the unindexed args, if any
      if (unindexedArgs.length > 0) {
        return matchedSet.filter(el => {
          return unindexedArgs.filter(key => {
            if (
              typeof argMatchObject[key] !== 'undefined' &&
              argMatchObject[key] == el[key]
            ) {
              return el[key]
            }
          })
        })
      }

      return matchedSet
    } else {
      // What the hell, index your life
      debug('unindexed get(). This will be slow!', argMatchObject)

      const everything = await this._db.getAll(EVENT_STORE)

      return everything.filter(el => {
        return unindexedArgs.map(key => {
          if (
            typeof argMatchObject[key] !== 'undefined' &&
            argMatchObject[key] == el[key]
          ) {
            return el[key]
          }
        })
      })
    }
  }

  /**
   * Stores a single event
   *
   * For more info on the eventObject, see: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-events-return
   *
   * @param eventObject {object} A JS object representing the event
   */
  async addEvent(eventObject) {
    await this.waitForReady()
    this._db.add(EVENT_STORE, eventObject)
    this.setLatestBlock(eventObject.blockNumber)
  }
}
