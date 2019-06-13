/**
 * Wallet abstraction and stuff
 *
 * References
 * ----------
 * BIP44 - HD Wallet paths - https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 * Ethereum and BIP44 discussion - https://github.com/ethereum/EIPs/issues/84
 *
 * TODO
 * ----
 * - Correct redis stored nonce if a tx fails?
 * - Add optional onReceipt callback to sendTx
 * - Locks and support for parallelism so multiple instances can work at the same time?
 * - Auto-scale children when all accounts hit the max pending setting?
 */
const { promisify } = require('util')
const redis = require('redis')
const BN = require('bn.js')
const bip39 = require('bip39')
const hdkey = require('ethereumjs-wallet/hdkey')
const {
  stringToBN,
  numberToBN,
  getBIP44Path,
  bufferToHex,
  sendRawTransaction
} = require('./util')
const logger = require('./logger')

const REDIS_RETRY_TIMEOUT = 30000
const REDIS_RETRY_DELAY = 500
const DEFAULT_CHILDREN = 5
const DEFAULT_MAX_PENDING_PER_ACCOUNT = 3
const ZERO = new BN('0', 10)
const BASE_FUND_VALUE = new BN('50000000000000000', 10) // 0.05 Ether
const MIN_CHILD_BALANCE = new BN('1000000000000000', 10) // 0.001 Ether
const MAX_GAS_PRICE = new BN('20000000000', 10) // 20 gwei
const REDIS_TX_COUNT_PREFIX = 'txcount_'

async function tick(wait = 1000) {
  return new Promise(resolve => setTimeout(() => resolve(true), wait))
}

class Account {
  constructor({ txCount, pendingCount = 0, wallet, funded }) {
    this.txCount = txCount
    this.pendingCount = pendingCount // needed?
    this.wallet = wallet
    this.funded = funded
  }
}

/**
 * Purse is an account abstraction that allows relayer to feed it arbitrary transactions to send
 * with whatever account it has avilable.  It does not block and wait for transactions to be mined.
 * You can not choose which account to send from.  No transactions, except those to fund the
 * derived children will sent from the master account (of the mnemonic provided).
 *
 * It can
 *
 * Usage (proposed)
 * -----
 * a = Accounts({ web3, mnemonic: 'one two three' })
 * await a.sendTx({ from: you, to: me, data: '0xdeadbeef' })
 */
class Purse {
  constructor({
    web3,
    mnemonic,
    children = DEFAULT_CHILDREN,
    autofundChildren = false,
    redisHost = 'redis://localhost:6379/0',
    maxPendingPerAccount = DEFAULT_MAX_PENDING_PER_ACCOUNT
  }) {
    if (!web3 || !mnemonic) {
      throw new Error('missing required parameters')
    }

    this.web3 = web3
    this.mnemonic = mnemonic
    this._childrenToCreate = children
    this.autofundChildren = autofundChildren
    this.maxPendingPerAccount = maxPendingPerAccount

    this.ready = false
    this.masterKey = null
    this.masterWallet = null

    this.gasPrice = new BN('3000000000', 10) // 3 gwei TODO: floating source?

    this.children = []
    this.accounts = {}
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
    }).then(() => {
      throw new Error('Fake thread promise should not have resolved!')
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
    const masterBalance = stringToBN(
      await this.web3.eth.getBalance(masterAddress)
    )
    this.accounts[masterAddress] = new Account({
      txCount: await this.txCount(masterAddress),
      pendingCount: 0,
      wallet: this.masterWallet,
      funded: masterBalance.gt(ZERO)
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
        wallet: childWallet,
        funded: false
      })

      logger.info(`Initialized child account ${address}`)
    }

    this.ready = true
  }

  /**
   * Tear it all down!  Probalby only used in testing.
   * @param clearRedis {boolean} - Remove all keys from redis
   */
  async teardown(clearRedis = false) {
    if (this.rclient) {
      if (clearRedis) {
        await this._resetRedis()
      }
      this.rclient.quit()
    }
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
     * HD wallet "standards" the lowest index/path should be uesd first.  That
     * way, any wallets using the mnemonic in the future will discover all the
     * children and their funds.  It is supposed to stop at the first one
     * without a tx history.
     */
    do {
      let lowestPending = this.maxPendingPerAccount
      for (const child of this.children) {
        /*logger.debug(
          `checking child ${child}  pending: ${
            this.accounts[child].pendingCount
          }`
        )*/
        const childBal = stringToBN(await this.web3.eth.getBalance(child))
        if (
          this.accounts[child].pendingCount < lowestPending &&
          childBal.gt(MIN_CHILD_BALANCE)
        ) {
          lowestPending = this.accounts[child].pendingCount
          resolvedAccount = child
          logger.debug(`selecting account ${child}`)
        }
      }

      if (resolvedAccount) {
        break
      } else {
        logger.debug('waiting for an account to become available...')
      }
    } while (await tick())

    return resolvedAccount
  }

  /**
   * Send a transaction from an available sender account
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
   * @param onReceipt {function} - A callback to call when a receipt is found
   * @returns {string} The transaction hash of the sent transaction
   */
  async sendTx(tx, onReceipt) {
    const address = await this.getAvailableAccount()

    // Set the from and nonce for the account
    tx = {
      ...tx,
      from: address,
      nonce: await this.txCount(address)
    }

    if (!tx.gasPrice) {
      const gasPrice = stringToBN(await this.web3.eth.getGasPrice())
      if (gasPrice.gt(MAX_GAS_PRICE)) {
        // TODO: best way to handle this?
        throw new Error('Current gas prices are too high!')
      }
      tx.gasPrice = gasPrice
    }

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

    // In case it needs to be rebroadcast
    this.pendingTransactions[txHash] = rawTx
    await this.incrementTxCount(address)

    // blast it
    await sendRawTransaction(this.web3, rawTx)

    logger.info(`Sent ${txHash}`)

    return txHash
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
    if (txCount === 0 && this.rclient) {
      const countFromRedis = await this.rclient.getAsync(
        `${REDIS_TX_COUNT_PREFIX}${address}`
      )
      // null defense
      if (countFromRedis) {
        txCount = countFromRedis
      }
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
    const w3txCount = parseInt(await this.web3.eth.getTransactionCount(address))
    if (txCount < w3txCount) txCount = w3txCount

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
    if (this.rclient)
      await this.rclient.incrAsync(`${REDIS_TX_COUNT_PREFIX}${address}`)
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
    const eqSplit = masterBalance.div(numberToBN(this.children.length))
    const useAvg = eqSplit.lt(BASE_FUND_VALUE)
    const fundAmount = useAvg ? eqSplit : BASE_FUND_VALUE

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      logger.info(`Funding ${child} with ${fundAmount}`)
      const txHash = await this._fundChild(child, fundAmount)

      logger.debug(`${child} funded with ${txHash}`)

      this.accounts[child].funded = true
    }
  }

  /**
   * Draain all children back to the master account
   */
  async drainChildren() {
    const gasPrice = stringToBN(await this.web3.eth.getGasPrice())
    const gas = new BN('21000', 10)
    const valueTxFee = gas.mul(gasPrice)
    const masterAddress = this.masterWallet.getChecksumAddressString()
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i]
      const childBalance = numberToBN(await this.web3.eth.getBalance(child))
      const value = childBalance.sub(valueTxFee)

      // Drain account only if it has more than the cost of the tx in it
      if (childBalance.gt(valueTxFee)) {
        const signed = await this.signTx(child, {
          to: masterAddress,
          gas,
          gasPrice,
          value
        })
        const rawTx = signed.rawTransaction
        const txHash = this.web3.utils.sha3(rawTx)
        this.pendingTransactions[txHash] = rawTx
        await sendRawTransaction(this.web3, rawTx)
        await this.incrementTxCount(child)
      }
    }
  }

  /**
   * Sets up the Redis connection to be used for persistant nonce tracking
   * @param redisHost {string} A redis URL to conect to
   * @returns {'redis client'} A node_redist instance
   */
  _setupRedis(redisHost) {
    // TODO: Does prod use auth? How to make testing clean?
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
    client.incrAsync = promisify(client.incr).bind(client)
    client.keysAsync = promisify(client.keys).bind(client)
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

    const fundingValue = value ? value : BASE_FUND_VALUE
    const txCost = fundingValue.add(numberToBN(this.gasPrice * 21000))
    const masterPrivkey = this.masterWallet.getPrivateKey()
    const masterAddress = this.masterWallet.getChecksumAddressString()
    const masterBalance = stringToBN(await this.web3.eth.getBalance(masterAddress))

    if (masterBalance.lt(BASE_FUND_VALUE)) {
      logger.error(`Unable to find child account because master account (${masterAddress}) does't have the funds!`)
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
      gasPrice: this.gasPrice.toString()
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

    await sendRawTransaction(this.web3, rawTx)
    await this.incrementTxCount(masterAddress)

    logger.info(`Funded ${address} with ${txHash}`)

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
        // Prompt for funding of the master account
        const masterAddress = this.masterWallet.getChecksumAddressString()
        const masterBalance = numberToBN(
          await this.web3.eth.getBalance(masterAddress)
        )
        const balanceEther = this.web3.utils.fromWei(
          masterBalance.toString(),
          'ether'
        )
        if (masterBalance.eq(ZERO)) {
          logger.error(
            `Master account needs funding! Send funds to ${masterAddress}`
          )
        } else if (
          masterBalance.lt(BASE_FUND_VALUE.mul(new BN(this.children.length)))
        ) {
          logger.warn(
            `Master account is low @ ${balanceEther} Ether. Add funds soon!`
          )
        } else {
          logger.info(`Master account balance: ${balanceEther} Ether`)
        }

        // Check for child balances dropping below set minimum and fund if necessary
        if (this.ready && this.autofundChildren) {
          for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i]
            const childBalance = numberToBN(
              await this.web3.eth.getBalance(child)
            )
            if (childBalance.lte(MIN_CHILD_BALANCE)) {
              await this._fundChild(child)
            }
          }
        }
      }

      /**
       * Handle incoming receipts and remove pending transactions and adjust pending counts.  This
       * is processed in reverse order so we can alter the array without it effecting the rest as
       * we go.
       */
      const pendingHashes = Object.keys(this.pendingTransactions)
      for (let i = pendingHashes.length - 1; i >= 0; i--) {
        const txHash = pendingHashes[i]
        const receipt = await this.web3.eth.getTransactionReceipt(txHash)

        if (!receipt) continue

        logger.debug(`Transaction ${txHash} has been mined.`)

        // Remove from pending if it exists(it should)
        if (!receipt.status) {
          // TODO Should this be communicated to the user and/or tracked?
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

        delete this.pendingTransactions[txHash]

        logger.debug(`Removed ${txHash} from pending`)

        // Adjust the pendingCount for the account
        const checksummedFrom = this.web3.utils.toChecksumAddress(receipt.from)
        if (this.accounts.hasOwnProperty(checksummedFrom)) {
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

      /**
       * Look for dropped transactions and re-broadcast if necessary.  This can sometimes happen
       * if the transaction has a low gas price and the txpool is loaded.  Or it could have been
       * garbage collected by the pool for some arbitrary reason.
       *
       * TODO: If this becomes a common issue, it might be good to re-sign with the same nonce and
       * an updated gas price.  Hopefully we'll find this rare, at least until CryptoKitties v57
       * comes out.
       */
      for (const txHash of Object.keys(this.pendingTransactions)) {
        const tx = await this.web3.eth.getTransaction(txHash)
        if (!tx) {
          logger.warn(`Transaction ${txHash} was dropped!  Re-broadcasting...`)

          await sendRawTransaction(this.web3, this.pendingTransactions[txHash])

          // Increment our internal counter.  No functional use yet, but good for testing.
          if (this.rebroadcastCounters[txHash]) {
            this.rebroadcastCounters[txHash] += 1
          } else {
            this.rebroadcastCounters[txHash] = 1
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
