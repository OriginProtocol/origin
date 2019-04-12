import AbstractBackend from './AbstractBackend'

import { debug } from '../utils'

/**
 * Convert an event object to an object compatible with sequelize
 *
 * @param eventObject {object} to match the event against
 * @returns {object} object matching the sequelize names
 */
function eventToDB(eventObject) {
  const dbObject = {}

  Object.keys(eventObject).map(key => {
    // Convert camel to underscore
    dbObject[
      key
        .split(/(?=[A-Z])/)
        .join('_')
        .toLowerCase()
    ] = eventObject[key]
  })

  // Rework the topic structure to match the DB structure
  if (dbObject['raw']) {
    dbObject['data'] = dbObject['raw']['data']
    if (dbObject['raw']['topics'] instanceof Array) {
      for (let i = 0; i < dbObject['raw']['topics'].length; i++) {
        if (i > 3) break
        dbObject['topic' + i] = dbObject['raw']['topics'][i] || null
      }
    }
    delete dbObject['raw']
  }

  return dbObject
}

/**
 * Convert a sequelize result object to an event object
 *
 * @param eventObject {object} sequelize object (e.g. result row)
 * @returns {object} event object
 */
function DBToEvent(dbObject) {
  const evObj = {}
  Object.keys(dbObject).map(key => {
    // Convert underscore to camel
    const camelKey = key
      .split(/(?=_[a-z])/)
      .map(part => {
        return part.startsWith('_')
          ? part.charAt(1).toUpperCase() + part.slice(2)
          : part
      })
      .join('')
    evObj[camelKey] = dbObject[key]
  })

  // Rework the topic structure to match an event object
  if (evObj['data'] || evObj['topic0']) {
    evObj['raw'] = {}
    evObj['raw']['data'] = evObj['data']
    evObj['raw']['topics'] = Array()

    if (evObj['topic0']) evObj['raw']['topics'].push(evObj['topic0'])
    if (evObj['topic1']) evObj['raw']['topics'].push(evObj['topic1'])
    if (evObj['topic2']) evObj['raw']['topics'].push(evObj['topic2'])
    if (evObj['topic3']) evObj['raw']['topics'].push(evObj['topic3'])

    delete evObj['data']
  }
  delete evObj['topic0']
  delete evObj['topic1']
  delete evObj['topic2']
  delete evObj['topic3']

  return evObj
}

/**
 * @class
 * @classdesc PostgreSQLBackend to handle event storage in PostgreSQL
 */
export default class PostgreSQLBackend extends AbstractBackend {
  constructor() {
    super()

    this.type = 'postgresql'
    /**
     * This import needs to be done here, because sequelize is a PoS and
     * requires a connection to be initialized to build the models.  And to
     * boot, it won't even play nice with ES6/babel and imports, so it also
     * doesn't even match the codebase.
     *
     * Why is it that ORMs are supposed to save time and yet I always end up
     * spending more time getting them to work than it would have if I just
     * wrote the SQL and did the data translation myself?
     *
     * Do rants count as useful and productive documentation?
     */
    this._models = require('../models')
    this._Sequelize = this._models.Sequelize
    this._sequelize = this._models.sequelize
    this._eventTableColumns = Object.keys(this._models.Event.tableAttributes)

    this._loadLatestBlock()
  }

  /**
   * Get and set the latest known block from the DB
   *
   * @returns {number} The latest block number known by the cache
   */
  async _loadLatestBlock() {
    const result = await this._models.Event.findOne({
      attributes: [
        [
          this._sequelize.fn('MAX', this._sequelize.col('block_number')),
          'max_block'
        ]
      ]
    })
    if (result) {
      const maxBlock = result.dataValues.max_block
      this.setLatestBlock(maxBlock)
      debug(`Cache is current up to block #${maxBlock}`)
      return maxBlock
    }
    return 0
  }

  /**
   * Convert an arg match object to something that can be used for sequelize
   * queries as a `where` argument
   *
   * @param obj {object} An argMatchObject
   * @returns {object} to use as a WHERE clause with sequelize
   */
  _argMatchToWhere(obj) {
    const Op = this._Sequelize.Op
    const newObj = eventToDB(obj)
    Object.keys(newObj).map(key => {
      if (!this._eventTableColumns.includes(key)) {
        newObj['return_values.' + key] = {
          [Op.eq]: newObj[key]
        }
        delete newObj[key]
      }
    })
    return newObj
  }

  /**
   * Dumps an array of event objects
   *
   * @returns {Array} of events
   */
  async serialize() {
    const res = await this._models.Event.findAll({
      order: [['block_number'], ['transaction_index'], ['log_index']]
    })
    if (res.length < 1) {
      return []
    }

    return res.map(row => DBToEvent(row.dataValues))
  }

  /**
   * Loads the serialized data from IPFS
   *
   * @param ipfsData {Array} An array of events to load
   */
  async loadSerialized(ipfsData) {
    // TODO?  Not sure this is healthy for this backend
    throw new Error('Cannot load serialized data on this platform')
  }

  /**
   * Fetch events from the store matching objects
   *
   * @param argMatchObject {object} A JS object representing the event
   * @returns {Array} An array of event objects
   */
  async get(argMatchObject) {
    const where = this._argMatchToWhere(argMatchObject)
    const results = await this._models.Event.findAll({ where })
    return results.map(row => {
      return DBToEvent(row.dataValues)
    })
  }

  /**
   * Stores a single event
   *
   * For more info on the eventObject, see: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#contract-events-return
   *
   * @param eventObject {object} A JS object representing the event
   */
  async addEvent(eventObject) {
    const dbObject = eventToDB(eventObject)
    await this._models.Event.upsert(dbObject)
    this.setLatestBlock(eventObject.blockNumber)
  }
}
