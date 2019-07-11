/**
 * Wallet abstraction for high-volume transactions
 *
 * References
 * ----------
 * BIP44 - HD Wallet paths - https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 * Ethereum and BIP44 discussion - https://github.com/ethereum/EIPs/issues/84
 *
 * TODO
 * ----
 * - Non-memory locks and support for mmultiple instances?
 * - Auto-scale children when all accounts hit the max pending setting?
 * - If the service is restarted, callbacks are lost for pending transactions.  How to deal?
 */
const { promisify } = require('util')
const redis = require('redis')
const BN = require('bn.js')
const bip39 = require('bip39')
const hdkey = require('ethereumjs-wallet/hdkey')
const { createEngine } = require('@origin/web3-provider')
const {
  stringToBN,
  numberToBN,
  getBIP44Path,
  bufferToHex,
  sendRawTransaction
} = require('./util')
const logger = require('./logger')
const Sentry = require('./sentry')

const MAX_LOCK_TIME = 15000
const REDIS_RETRY_TIMEOUT = 30000
const REDIS_RETRY_DELAY = 500
const DEFAULT_CHILDREN = 5
const DEFAULT_MNEMONIC = 'one two three four five six'
const DEFAULT_MAX_PENDING_PER_ACCOUNT = 3
const ZERO = new BN('0', 10)
const BASE_FUND_VALUE = new BN('500000000000000000', 10) // 0.5 Ether
const MIN_CHILD_BALANCE = new BN('100000000000000000', 10) // 0.1 Ether
const MAX_GAS_PRICE = new BN('25000000000', 10) // 25 gwei
const REDIS_TX_COUNT_PREFIX = 'txcount_'
const REDIS_PENDING_KEY = `pending_txs`
const REDIS_PENDING_PREFIX = `pending_tx_`
const REDIS_PENDING_TX_PREFIX = `pending_txobj_`
const JSONRPC_QPS = 100
const JSONRPC_MAX_CONCURRENT = 25

async function tick(wait = 1000) {
  return new Promise(resolve => setTimeout(() => resolve(true), wait))
}

class Account {
  constructor({ txCount, pendingCount = 0, wallet }) {
    this.txCount = txCount
    this.pendingCount = pendingCount // needed?
    this.wallet = wallet
    this.locked = null
    this.hasPendingFundingTx = false
  }
}

/**
 * Purse is an account abstraction that allows relayer to feed it arbitrary transactions to send
 * with whatever account it has available.  It does not block and wait for transactions to be mined.
 * You can not choose which account to send from.  No transactions, except those to fund the
 * derived children will be sent from the master account (of the mnemonic provided).
 *
 * Usage
 * -----
 * a = Accounts({ web3, mnemonic: 'one two three' })
 * await a.init()
 * await a.sendTx({ from: you, to: me, data: '0xdeadbeef' })
 */
class Purse {
  constructor({
    web3,
    mnemonic = DEFAULT_MNEMONIC,
    children = DEFAULT_CHILDREN,
    autofundChildren = false,
    redisHost = 'redis://localhost:6379/0',
    maxPendingPerAccount = DEFAULT_MAX_PENDING_PER_ACCOUNT,
    jsonrpcQPS = JSONRPC_QPS
  }) {
    if (!web3 || !mnemonic) {
      throw new Error('missing required parameters')
    }

    // If it's not already a web3-provider-engine provider...
    if (
      web3.currentProvider &&
      typeof web3.currentProvider._providers === 'undefined'
    ) {
      // init the custom provider
      createEngine(web3, {
        qps: jsonrpcQPS,
        maxConcurrent: JSONRPC_MAX_CONCURRENT
      })
    }

    this.web3 = web3
    this.mnemonic = mnemonic
    this._childrenToCreate = children
    this.autofundChildren = autofundChildren
    this.maxPendingPerAccount = maxPendingPerAccount

    this.ready = false
    this.masterKey = null
    this.masterWallet = null

    this.children = []
    this.accounts = {}
    // Complete unsigned transaction objects stored by hash
    this.transactionObjects = {}
    // Keep track of transactions that are waiting to be mined
    this.pendingTransactions = {}
    // Counter for tx rebroadcasts
    this.rebroadcastCounters = {}
    // Callbacks for when receipts show up
    this.receiptCallbacks = {}

    this.rclient = this._setupRedis(redisHost)

    // "Am I garbage?" - This thing, probably
    new Promise(async (resolve, reject) => {
      try {
        await this._process()
        resolve('oh no!')
      } catch (err) {
        reject(err)
      }
    })
      .then(() => {
        const err = new Error('Fake thread promise should not have resolved!')
        logger.error(err)
        Sentry.captureException(err)
        process.exit(2)
      })
      .catch(err => {
        logger.error('Error occurred in _process()')
        logger.error(err)
        Sentry.captureException(err)
        process.exit(2)
      })
  }

  /**
   * initialize the master key and generate the required HD keys
   * @param force {boolean} - Force generation of key
   */
  async init(force = false) {
    if (!force && this.masterWallet !== null) return

    const seed = await bip39.mnemonicToSeed(this.mnemonic)
    this.masterKey = hdkey.fromMasterSeed(seed)
    this.masterWallet = this.masterKey.getWallet()

    const masterAddress = this.masterWallet.getChecksumAddressString()
    this.accounts[masterAddress] = new Account({
      txCount: await this.txCount(masterAddress),
      pendingCount: 0,
      wallet: this.masterWallet
    })

    logger.info(`Initialized master key for account ${masterAddress}`)

    for (let i = 0; i < this._childrenToCreate; i++) {
      const childKey = this.masterKey.derivePath(getBIP44Path(i))
      const childWallet = childKey.getWallet()
      const address = childWallet.getChecksumAddressString()

      this.children[i] = address
      this.accounts[address] = new Account({
        txCount: await this.txCount(address),
        pendingCount: 0, // assumed
        wallet: childWallet
      })

      logger.info(`Initialized child account ${address}`)
    }

    // Load pending tx state
    await this._populatePending()

    this.ready = true
  }

  /**
   * Tear it all down!  Probably only used in testing.
   * @param clearRedis {boolean} - Remove all keys from redis
   */
  async teardown(clearRedis = false) {
    this.transactionObjects = {}
    this.pendingTransactions = {}
    this.rebroadcastCounters = {}
    this.receiptCallbacks = {}
    if (this.rclient && this.rclient.connected) {
      if (clearRedis) {
        await this._resetRedis()
      }
      this.rclient.quit()
    }
  }

  /**
   * Get the gas price to use for a transaction
   * @returns {BN} The gas price in wei
   */
  async gasPrice() {
    let gp = new BN('3000000000', 10) // 3 gwei
    try {
      const netGp = stringToBN(await this.web3.eth.getGasPrice())
      if (netGp) {
        gp = netGp
      }
    } catch (err) {
      logger.warn('Failed getting network gas price')
      logger.debug(err)
      Sentry.captureException(err)
    }

    if (gp.gt(MAX_GAS_PRICE)) {
      // TODO: best way to handle this?
      throw new Error('Current gas prices are too high!')
    }

    return gp
  }

  /**
   * Select an available account
   * @returns {string} address of the available account
   */
  async getAvailableAccount() {
    let resolvedAccount = null

    /**
     * Select the account with the lowest pending that's under the max allowed
     * pending transactions.  If none vailable, twiddle our thumbs until one
     * becomes available...  The order is also important here.  According to the
     * HD wallet "standards" the lowest index/path should be used first.  That
     * way, any wallets using the mnemonic in the future will discover all the
     * children and their funds.  It is supposed to stop at the first one
     * without a tx history.
     */
    do {
      let totalPending = 0
      let lowestPending = this.maxPendingPerAccount
      for (const child of this.children) {
        const childBal = stringToBN(await this.web3.eth.getBalance(child))
        totalPending += this.accounts[child].pendingCount
          ? this.accounts[child].pendingCount
          : 0
        if (
          this.accounts[child].locked === null &&
          this.accounts[child].pendingCount < lowestPending &&
          childBal.gt(MIN_CHILD_BALANCE)
        ) {
          lowestPending = this.accounts[child].pendingCount
          resolvedAccount = child
          logger.debug(`selecting account ${child}`)
        }
      }

      if (resolvedAccount) {
        this.accounts[resolvedAccount].locked = new Date()
        break
      } else {
        logger.debug('waiting for an account to become available...')
        logger.debug(`there are ${totalPending} total pending transactions`)
      }
    } while (await tick())

    return resolvedAccount
  }

  /**
   * Sign a transaction using a specific child account
   * @param address {string} - The address of the account to sign the tx
   * @param tx {object} - The transaction object
   * @returns {object} The signed transaction object from web3.js
   */
  async signTx(address, tx) {
    this._enforceChild(address)
    await this.init()

    const privKey = this.accounts[address].wallet.getPrivateKey()
    return await this.web3.eth.accounts.signTransaction(
      tx,
      bufferToHex(privKey)
    )
  }

  /**
   * Send a transaction from an available sender account.
   *
   * NOTE: This does not wait for the transaction to be mined!
   *
   * @param tx {object} - The transaction object, sans `from` and `nonce`
   * @param onReceipt {function} - An optional callback to call when a receipt is found
   * @returns {{txHash: string, gasPrice: BN}} The transaction hash and gas price of the sent transaction
   */
  async sendTx(tx, onReceipt) {
    const address = await this.getAvailableAccount()

    // Set the from and nonce for the account
    tx = {
      ...tx,
      to: this.web3.utils.toChecksumAddress(tx.to),
      from: address,
      nonce: await this.txCount(address)
    }

    if (!tx.gasPrice) {
      tx.gasPrice = await this.gasPrice()
    }
    const gasPrice = new BN(tx.gasPrice)

    logger.debug('Sending tx: ', tx)

    const signed = await this.signTx(address, tx)
    const rawTx = signed.rawTransaction
    // Not in this version of web3.js 1.0...
    // const txHash = signed.transactionHash
    const txHash = this.web3.utils.sha3(rawTx)

    // If there's an onReceipt cb, store it for later
    if (onReceipt) {
      if (typeof onReceipt !== 'function') {
        throw new Error('onReceipt is not a function')
      }
      this.receiptCallbacks[txHash] = onReceipt
    }

    try {
      // blast it
      await sendRawTransaction(this.web3, rawTx)

      // In case it needs to be rebroadcast
      await this.addPending(txHash, tx, rawTx)

      await this.incrementTxCount(address)

      logger.info(`Sent ${txHash}`)
    } catch (err) {
      logger.error(`Error sending transaction ${txHash}`)
      Sentry.captureException(err)
      throw err
    }

    return { txHash, gasPrice }
  }

  /**
   * Get the current transaction count for an account (includes known pending)
   * @param address {string} - The account address to increment
   */
  async txCount(address) {
    let txCount = this.accounts[address] ? this.accounts[address].txCount : 0

    // If we have one in memory, go with that
    if (txCount > 0) return txCount

    // Check redis, if available
    if (txCount === 0 && this.rclient && this.rclient.connected) {
      const countFromRedis = await this.rclient.getAsync(
        `${REDIS_TX_COUNT_PREFIX}${address}`
      )
      // null defense
      if (countFromRedis) {
        try {
          txCount = parseInt(countFromRedis)
        } catch (err) {
          logger.warn(err)
          Sentry.captureException(err)
          txCount = 0
        }
      }
    } else {
      logger.warn('Redis unavailable')
    }

    /**
     * Finally, check with the JSON-RPC provider.  Chance of some pendings screwing this up if we
     * get this far.  I'm at least sure that eth_pendingTransactions, is completely  not supported
     * by Alchemy.  Doubtful from Infura as well.  And it's a poor method anyway with no arguments.
     *
     * EDGE CASE WARNING
     * -----------------
     *
     * The only time this should be an issue is if the service is magically restarted, Redis is
     * wiped or unavailable, all while there are transactions still in the pool waiting to be
     * mined.
     *
     * Also, tiny chance of transaction replacement here if the gas price goes up during the above
     * edge case.  That would be... like a dropped transaction in the client.  Perhaps not a deal
     * breaker, but maybe some thought should be put into that in the future as volume goes up. The
     * bigger the load, the likelier this becomes.
     */
    const w3txCount = parseInt(
      await this.web3.eth.getTransactionCount(address, 'pending')
    )
    if (txCount < w3txCount) {
      if (txCount > 0)
        logger.warn('Transaction counts appear lower than on the chain!')
      // Return the one from the network
      txCount = w3txCount
      // ...and make sure redis is up to date for future instances
      if (this.rclient && this.rclient.connected) {
        await this.rclient.setAsync(
          `${REDIS_TX_COUNT_PREFIX}${address}`,
          txCount
        )
      }
    }

    return txCount
  }

  /**
   * Increment the known transaction count for an account
   * @param address {string} - The account address to increment
   */
  async incrementTxCount(address) {
    this._enforceExists(address)

    this.accounts[address].txCount += 1
    this.accounts[address].pendingCount += 1
    this.accounts[address].locked = null
    if (this.rclient && this.rclient.connected) {
      await this.rclient.incrAsync(`${REDIS_TX_COUNT_PREFIX}${address}`)
    } else {
      logger.warn('Redis unavailable')
    }
  }

  /**
   * Adds a pending transaction we should keep an eye on
   * @param txHash {string} - The transaction hash
   * @param rawTx {string} - The raw transaction
   */
  async addPending(txHash, txObj, rawTx) {
    this.pendingTransactions[txHash] = rawTx

    const to = txObj.to ? this.web3.utils.toChecksumAddress(txObj.to) : txObj.to

    // Store the tx object for debugging and in case we need to re-sign later
    this.transactionObjects[txHash] = {
      ...txObj,
      to
    }

    if (this.rclient && this.rclient.connected) {
      await this.rclient.saddAsync(`${REDIS_PENDING_KEY}`, txHash)
      await this.rclient.setAsync(`${REDIS_PENDING_PREFIX}${txHash}`, rawTx)
      await this.rclient.setAsync(
        `${REDIS_PENDING_TX_PREFIX}${txHash}`,
        JSON.stringify(txObj)
      )
    } else {
      logger.warn('Redis unavailable')
    }
  }

  /**
   * Remove a pending transaction from tracking
   * @param txHash {string} - The transaction hash
   */
  async removePending(txHash) {
    delete this.pendingTransactions[txHash]
    delete this.transactionObjects[txHash]

    if (this.rclient && this.rclient.connected) {
      await this.rclient.sremAsync(`${REDIS_PENDING_KEY}`, txHash)
      await this.rclient.delAsync(`${REDIS_PENDING_PREFIX}${txHash}`)
      await this.rclient.delAsync(`${REDIS_PENDING_TX_PREFIX}${txHash}`)
    } else {
      logger.warn('Redis unavailable')
    }
  }

  /**
   * Get a pending transaction object
   * @param txHash {string} - The transaction hash
   * @returns {object} representation of the transaction
   */
  async getPendingTransaction(txHash) {
    if (this.transactionObjects[txHash]) {
      return this.transactionObjects[txHash]
    } else {
      const txObjStr = await this.rclient.getAsync(
        `${REDIS_PENDING_TX_PREFIX}${txHash}`
      )
      if (!txObjStr) {
        return null
      }
      return JSON.parse(txObjStr)
    }
  }

  /**
   * Check if there are any pending transactions to an account.
   */
  async hasPendingTo(proxy) {
    proxy = this.web3.utils.toChecksumAddress(proxy)
    for (const txHash of Object.keys(this.transactionObjects)) {
      if (this.transactionObjects[txHash].to === proxy) {
        return true
      }
    }
    return false
  }

  /**
   * Fund all the children from the master account
   */
  async fundChildren() {
    if (this.children.length < 1) {
      logger.warn('No children to fund')
      return
    }

    const masterAddress = this.masterWallet.getChecksumAddressString()
    const masterBalance = stringToBN(
      await this.web3.eth.getBalance(masterAddress)
    )

    const maxFunding = BASE_FUND_VALUE.mul(numberToBN(this.children.length))

    if (masterBalance.lt(maxFunding)) {
      logger.warn(
        `Master account ${masterAddress} does not have enough funding. Expected ${maxFunding}, has ${masterBalance}`
      )
      return
    }

    // If the equal split between all children is less than the base fund value
    // use it instead of trying to overdraw
    const childrenCount = numberToBN(this.children.length)
    const gasPrice = await this.gasPrice()
    const fullFees = gasPrice.mul(numberToBN(21000)).mul(childrenCount)
    const eqSplit = masterBalance.div(childrenCount).sub(fullFees)
    const useAvg = eqSplit.lt(BASE_FUND_VALUE)
    const fundAmount = useAvg ? eqSplit : BASE_FUND_VALUE

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      logger.info(`Funding ${child} with ${fundAmount}`)
      const txHash = await this._fundChild(child, fundAmount)

      logger.debug(`${child} funded with ${txHash}`)
    }
  }

  /**
   * Draain all children back to the master account
   */
  async drainChildren() {
    const gasPrice = await this.gasPrice()
    const gas = new BN('21000', 10)
    const valueTxFee = gas.mul(gasPrice)
    const masterAddress = this.masterWallet.getChecksumAddressString()
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      const childBalance = numberToBN(await this.web3.eth.getBalance(child))
      const value = childBalance.sub(valueTxFee)

      // Drain account only if it has more than the cost of the tx in it
      if (childBalance.gt(valueTxFee)) {
        const txObj = {
          to: masterAddress,
          gas,
          gasPrice,
          value
        }
        const signed = await this.signTx(child, txObj)
        const rawTx = signed.rawTransaction
        const txHash = this.web3.utils.sha3(rawTx)
        await this.addPending(txHash, txObj, rawTx)
        await sendRawTransaction(this.web3, rawTx)
        await this.incrementTxCount(child)
      }
    }
  }

  /**
   * Get all pending transactions and populate this.pendintTransactions
   */
  async _populatePending() {
    logger.debug('Re-populating pending transactions from redis...')

    if (this.rclient && this.rclient.connected) {
      const pendingHashes = await this.rclient.smembersAsync(REDIS_PENDING_KEY)

      logger.debug(
        `Loaded ${
          pendingHashes ? pendingHashes.length : 0
        } pending transaction hashes from redis`
      )

      for (const txHash of pendingHashes) {
        const tx = await this.web3.eth.getTransaction(txHash)
        if (!tx) continue
        if (tx && this.accounts[tx.from]) {
          this.accounts[tx.from].pendingCount += 1
        }
        const rawTx = await this.rclient.getAsync(
          `${REDIS_PENDING_PREFIX}${txHash}`
        )
        if (rawTx) {
          this.pendingTransactions[txHash] = rawTx
        } else {
          logger.error(`Unable to retrieve pending transaction for ${txHash}`)
          // TODO: Pretending this never existed has its own potential issues
          if (tx && this.accounts[tx.from]) {
            this.accounts[tx.from].pendingCount -= 1
          }
        }
      }
    } else {
      logger.warn('Redis unavailable')
    }
  }

  /**
   * Sets up the Redis connection to be used for persistant nonce tracking
   * @param redisHost {string} A redis URL to conect to
   * @returns {'redis client'} A node_redis instance
   */
  _setupRedis(redisHost) {
    const client = redis.createClient({
      url: redisHost,
      retry_strategy: options => {
        if (options.total_retry_time > REDIS_RETRY_TIMEOUT) {
          logger.warn('Unable to connect to redis!')
          return null
        }
        return REDIS_RETRY_DELAY
      }
    })
    client.on('error', err => {
      if (err.errno === 'ECONNREFUSED') {
        this.rclient.quit()
        logger.warn('Connection to Redis failed! Disabling client.')
        this.rclient = null
      } else {
        logger.error('Error occurred in Redis')
        logger.error(err)
      }
    })
    client.getAsync = promisify(client.get).bind(client)
    client.setAsync = promisify(client.set).bind(client)
    client.saddAsync = promisify(client.sadd).bind(client)
    client.sremAsync = promisify(client.srem).bind(client)
    client.smembersAsync = promisify(client.smembers).bind(client)
    client.incrAsync = promisify(client.incr).bind(client)
    client.keysAsync = promisify(client.keys).bind(client)
    client.delAsync = promisify(client.del).bind(client)
    return client
  }

  /**
   * Clear all of our keys from redis.  Could do a FLUSHALL, but we're being
   * careful here in case something else i son this DB.  This is likely only
   * used in testing.
   */
  async _resetRedis() {
    if (!this.rclient) return

    const purseKeys = await this.rclient.keysAsync(`${REDIS_TX_COUNT_PREFIX}*`)

    if (purseKeys.length > 0) {
      logger.info(`Clearing ${purseKeys.length} keys from redis...`)

      for (const key of purseKeys) {
        logger.debug(`Deleting ${key} from redis`)
        await this.rclient.del(key)
      }
    }

    // Remove the pending tx set
    await this.rclient.del(REDIS_PENDING_KEY)

    // Remove all pending transactions
    const pendingKeys = await this.rclient.keysAsync(
      `${REDIS_TX_COUNT_PREFIX}*`
    )

    if (pendingKeys.length > 0) {
      logger.info(`Clearing ${pendingKeys.length} keys from redis...`)

      for (const key of pendingKeys) {
        logger.debug(`Deleting ${key} from redis`)
        await this.rclient.del(key)
      }
    }
  }

  /**
   * Fund a child account from the master wallet
   * @param address {string} - The account to fund
   * @param value {BN} - The amount to fund
   */
  async _fundChild(address, value = null) {
    this._enforceChild(address)

    if (value && !(value instanceof BN)) {
      throw new Error('provided value must be a BN.js instance')
    }

    if (this.accounts[address] && this.accounts[address].hasPendingFundingTx) {
      logger.info(
        `Child ${address} already has a pending funding transaction. Skipping...`
      )
      return
    }

    this.accounts[address].hasPendingFundingTx = true

    const fundingValue = value ? value : BASE_FUND_VALUE
    const gasPrice = await this.gasPrice()
    const txCost = fundingValue.add(gasPrice.mul(new BN(21000)))
    const masterPrivkey = this.masterWallet.getPrivateKey()
    const masterAddress = this.masterWallet.getChecksumAddressString()
    const masterBalance = stringToBN(
      await this.web3.eth.getBalance(masterAddress)
    )

    if (masterBalance.lt(txCost)) {
      logger.error(
        `Unable to fund child account because master account (${masterAddress}) does't have the funds!`
      )
      return
    }

    logger.info(
      `Sending ${fundingValue.toString()} (total cost: ${txCost}) from ${masterAddress} (bal: ${masterBalance})`
    )

    const unsigned = {
      nonce: await this.txCount(masterAddress),
      from: masterAddress,
      to: address,
      value: fundingValue.toString(),
      gas: 21000,
      gasPrice
    }

    /**
     * If you don't do this specific buffer to hex conversion, you'll probably end up chasing an
     * error message that makes no sense.
     */
    const signed = await this.web3.eth.accounts.signTransaction(
      unsigned,
      bufferToHex(masterPrivkey)
    )
    const rawTx = signed.rawTransaction

    // The following isn't availible in our pinned version of web3.js...
    // const txHash = signed.transactionHash
    // So we hash it ourself...
    const txHash = this.web3.utils.sha3(rawTx)

    try {
      await sendRawTransaction(this.web3, rawTx)
      await this.addPending(txHash, unsigned, rawTx)
      await this.incrementTxCount(masterAddress)

      logger.info(`Funded ${address} with ${txHash}`)
    } catch (err) {
      logger.error(`Error sending transaction to fund child ${address}.`)
      logger.error(err)
      Sentry.captureException(err)
      this.accounts[address].hasPendingFundingTx = false
    }

    return txHash
  }

  /**
   * Function triggered on every loop on the ongoing process loop we started in the constructor. Has
   * lots of uses.
   *
   * - Prompt for funding of the master account
   * - Announces a low balance
   * - Funds children when necessary if autofundChildren was set
   * - Does general tx tracking and pending tx count adjustments
   * - Calls onReceipt callbacks if provided
   */
  async _process() {
    let interval = 0
    do {
      if (!this.ready) continue

      if (interval % 10 === 0) {
        try {
          // Prompt for funding of the master account
          const masterAddress = this.masterWallet.getChecksumAddressString()
          const masterBalance = numberToBN(
            await this.web3.eth.getBalance(masterAddress)
          )
          const masterBalanceLow = masterBalance.lt(
            BASE_FUND_VALUE.mul(new BN(this.children.length))
          )
          const balanceEther = this.web3.utils.fromWei(
            masterBalance.toString(),
            'ether'
          )
          if (masterBalance.eq(ZERO)) {
            logger.error(
              `Master account needs funding! Send funds to ${masterAddress}`
            )
          } else if (masterBalanceLow) {
            logger.warn(
              `Master account is low @ ${balanceEther} Ether. Add funds soon!`
            )
          } else {
            logger.info(`Master account balance: ${balanceEther} Ether`)
          }

          const childrenToFund = []

          // Check for child balances dropping below set minimum and fund if necessary
          if (this.ready && this.autofundChildren) {
            for (let i = 0; i < this.children.length; i++) {
              const child = this.children[i]
              const childBalance = numberToBN(
                await this.web3.eth.getBalance(child)
              )
              // Fund the child if there's already not a tx out
              if (
                childBalance.lte(MIN_CHILD_BALANCE) &&
                !this.accounts[child].hasPendingFundingTx
              ) {
                childrenToFund.push(child)
              } else if (
                childBalance.gt(MIN_CHILD_BALANCE) &&
                this.accounts[child].hasPendingFundingTx
              ) {
                // Reset the flag
                // TODO: Why not use onReceipt callbacks for this?
                this.accounts[child].hasPendingFundingTx = false
              }
            }

            logger.debug(
              `Planning to fund ${childrenToFund.length} child accounts`
            )

            if (childrenToFund.length > 0) {
              let valueToSend = BASE_FUND_VALUE
              const maxFee = MAX_GAS_PRICE.mul(numberToBN(21000)).mul(
                new BN(childrenToFund.length)
              )
              if (
                masterBalance.lt(
                  valueToSend.mul(numberToBN(childrenToFund.length)).add(maxFee)
                )
              ) {
                valueToSend = masterBalance
                  .sub(maxFee)
                  .div(numberToBN(childrenToFund.length))
              }

              logger.info(
                `Will fund children with ${this.web3.utils.fromWei(
                  valueToSend,
                  'ether'
                )} ether`
              )

              if (valueToSend.gte(MIN_CHILD_BALANCE)) {
                for (const child of childrenToFund) {
                  await this._fundChild(child, valueToSend)
                }
              } else {
                logger.warn('Unable to fund children.  Balance too low.')
              }
            }
          } else {
            logger.debug('Not ready or autofund disabled')
          }
        } catch (err) {
          logger.error(
            'Error occurred in the balance checks and funding block of _process()'
          )
          logger.error(err)
          Sentry.captureException(err)
        }
      }

      /**
       * Handle incoming receipts and remove pending transactions and adjust pending counts.
       * TODO: refactor to create a Promise for each of these?
       */
      try {
        const pendingHashes = Object.keys(this.pendingTransactions)
        for (const txHash of pendingHashes) {
          const receipt = await this.web3.eth.getTransactionReceipt(txHash)

          if (!receipt || !receipt.blockNumber) continue

          logger.debug(`Transaction ${txHash} has been mined.`)

          // Remove from pending if it exists(it should)
          if (!receipt.status) {
            logger.warn(`Transaction ${txHash} has failed!`)
          }

          // Call the onReceipt callback if provided
          if (typeof this.receiptCallbacks[txHash] === 'function') {
            const cbRet = this.receiptCallbacks[txHash](receipt)
            if (cbRet instanceof Promise) {
              await cbRet
            }
            // remove it from memory after execution
            delete this.receiptCallbacks[txHash]
          }

          await this.removePending(txHash)

          logger.debug(`Removed ${txHash} from pending`)

          // Adjust the pendingCount for the account
          const checksummedFrom = this.web3.utils.toChecksumAddress(
            receipt.from
          )
          if (
            Object.prototype.hasOwnProperty.call(this.accounts, checksummedFrom)
          ) {
            if (this.accounts[checksummedFrom].pendingCount > 0) {
              this.accounts[checksummedFrom].pendingCount -= 1
            } else {
              logger.error(
                `Account ${checksummedFrom}'s pendingCount appears to be inaccurate`
              )
            }
          } else {
            logger.error(
              `Account ${checksummedFrom} isn't one of ours.  This should be impossible!`
            )
          }
        }
      } catch (err) {
        logger.error(
          'Error occurred in the pending transaction processing block of _process()'
        )
        logger.error(err)
        Sentry.captureException(err)
      }

      /**
       * Look for dropped transactions and re-broadcast if necessary.  This can sometimes happen
       * if the transaction has a low gas price and the txpool is loaded.  Or it could have been
       * garbage collected by the pool for some arbitrary reason.
       *
       * TODO: If this becomes a common issue, it might be good to re-sign with the same nonce and
       * an updated gas price.  Hopefully we'll find this rare, at least until CryptoKitties v57
       * comes out.
       */
      try {
        for (const txHash of Object.keys(this.pendingTransactions)) {
          const tx = await this.web3.eth.getTransaction(txHash)
          if (!tx) {
            logger.warn(
              `Transaction ${txHash} was dropped!  Re-broadcasting...`
            )

            try {
              await sendRawTransaction(
                this.web3,
                this.pendingTransactions[txHash]
              )
            } catch (err) {
              logger.error(
                `error attempting to broadcast transaction ${txHash}`
              )
              logger.error(err)
              Sentry.captureException(err)
              const txObj = await this.getPendingTransaction(txHash)
              if (txObj) {
                logger.debug(`Transaction object: ${JSON.stringify(txObj)}`)
              } else {
                logger.debug('no tx object stored')
              }
            }

            // Increment our internal counter.  No functional use yet, but good for testing.
            if (this.rebroadcastCounters[txHash]) {
              this.rebroadcastCounters[txHash] += 1
            } else {
              this.rebroadcastCounters[txHash] = 1
            }
          }
        }
      } catch (err) {
        logger.error(
          'Error occurred in the dropped transaction handling block of _process()'
        )
        logger.error(err)
        Sentry.captureException(err)
      }

      /**
       * Clean up any locks that are inexplicably open.  This really shouldn't happen, but it's
       * worth clearing these in case they do otherwise the whole system could come to a halt.
       */
      if (interval % (MAX_LOCK_TIME / 1000) === 0) {
        for (const child of this.children) {
          const account = this.accounts[child]
          if (
            account.locked !== null &&
            new Date(Number(account.locked) + MAX_LOCK_TIME) < new Date() &&
            account.pendingCount === 0
          ) {
            logger.error(
              'Found a locked account without any pending transactions!'
            )
            account.locked = null
          }
        }
      }

      interval += 1
    } while (await tick())
  }

  /**
   * Make sure the address is one of our accounts or throw
   */
  _enforceExists(address) {
    if (!Object.keys(this.accounts).indexOf(address) < 0) {
      throw new Error('Account does not exist')
    }
  }

  /**
   * Make sure the address is one of our child accounts or throw
   */
  _enforceChild(address) {
    if (this.children.indexOf(address) < 0) {
      throw new Error('Account not a known child')
    }
  }
}

module.exports = Purse
