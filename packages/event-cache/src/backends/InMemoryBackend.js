import AbstractBackend from './AbstractBackend'

const ROOT_EVENT_KEYS = [
  'logIndex',
  'transactionIndex',
  'transactionHash',
  'blockHash',
  'blockNumber',
  'address',
  'type',
  'id',
  'returnValues',
  'event',
  'signature',
  'raw'
]

/**
 * @class
 * @classdesc InMemoryBackend to handle storage of EventCache data in memory
 */
export default class InMemoryBackend extends AbstractBackend {
  constructor() {
    super()

    this.type = 'memory'
    this._storage = Array() // Array of objects
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
    return this._storage.filter(el => {
      const matches = Object.keys(argMatchObject).filter(key => {
        let isReturnValue = false

        if (ROOT_EVENT_KEYS.indexOf(key) < 0) {
          isReturnValue = true
        }

        let matchingEl = el

        if (isReturnValue) matchingEl = el.returnValues

        if (typeof argMatchObject[key] !== 'undefined') {
          if (
            (argMatchObject[key] instanceof Array &&
              argMatchObject[key].indexOf(matchingEl[key]) > -1) ||
            argMatchObject[key] == matchingEl[key]
          ) {
            return el
          }
        }
      })

      // Make sure all provided keys were matched
      if (matches.length === Object.keys(argMatchObject).length) {
        return el
      }
    })
  }

  /**
   * Fetch all events from the store
   *
   * @returns {Array} An array of event objects
   */
  async all() {
    return this._storage
  }

  /**
   * Stores a single event
   *
   * For more info on the eventObject, see: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-events-return
   *
   * @param eventObject {object} A JS object representing the event
   */
  async addEvent(eventObject) {
    this._storage.push(eventObject)
    this.setLatestBlock(eventObject.blockNumber)
  }
}
