import fetch from 'cross-fetch'
import ProxyFactoryDef from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxyDef from '@origin/contracts/build/contracts/IdentityProxy_solc'
import pubsub from '../utils/pubsub'
import mineBlock from '../utils/mineBlock'
import contracts from '../contracts'
import { proxyOwner, resetProxyCache, predictedProxy } from '../utils/proxy'
import get from 'lodash/get'
import createDebug from 'debug'

import { getTransaction } from '../resolvers/web3/transactions'
import relayer from './_relayer'

const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json'
const GAS_PRICE_KEY = process.env.GAS_PRICE_KEY || 'average'
const SAFETY_GAS_LIMIT = 1000000 // 1m

const debug = createDebug('origin:tx-helper:')
const formatAddr = address => (address ? address.substr(0, 8) : '')

export async function checkMetaMask(from) {
  if (contracts.metaMask && contracts.metaMaskEnabled) {
    const net = await contracts.web3.eth.net.getId()
    const mmNet = await contracts.metaMask.eth.net.getId()
    if (net !== mmNet) {
      throw new Error(`MetaMask is not on network ${net}`)
    }
    const mmAccount = await contracts.metaMask.eth.getAccounts()

    const owner = await proxyOwner(from)
    if (owner) {
      from = owner
    }

    if (!mmAccount || mmAccount[0] !== from) {
      throw new Error(`MetaMask is not set to account ${from}`)
    }
  }
}

// Do not listen for confirmations if we're on the server as it causes mocha
// to hang
const isServer = typeof window === 'undefined'

// Should we try to use the relayer
function useRelayer({ mutation, value }) {
  if (isServer) return

  let reason
  if (!contracts.config.relayerEnabled) reason = 'relayer disabled'
  if (!contracts.config.relayer) reason = 'relayer not configured'
  if (!mutation) reason = 'no mutation specified'

  if (
    ['makeOffer', 'swapAndMakeOffer'].includes(mutation) &&
    value &&
    value !== '0'
  ) {
    reason = 'makeOffer has a value'
  }
  if (mutation === 'transferToken') reason = 'transferToken is disabled'
  if (mutation === 'transferTokenMakeOffer')
    reason = 'transferTokenMakeOffer is disabled'
  if (mutation === 'swapToToken') reason = 'swapToToken is disabled'
  if (reason) {
    debug(`cannot useRelayer: ${reason}`)
    return false
  }
  return true
}

/**
 * Should we use existing proxy, create new proxy, or don't use proxy at all.
 * @param {string} proxy - Existing proxy address
 * @param {string} destinationContract - Contract address
 * @param {string} to - Recipient wallet
 * @param {string} from - Wallet address (proxy owner)
 * @param {string} mutation - Name of mutation
 * @returns String or `undefined` if proxy should not be used.
 *  - execute: Wrap transaction with proxy's `execute` method
 *  - execute-no-wrap: Send transaction direct to proxy
 *  - create: Wrap transaction with proxy's `changeOwnerAndExecute` method
 *  - create-no-wrap: Send transaction direct to proxy after creation
 */
async function useProxy({ proxy, destinationContract, to, from, mutation }) {
  const { proxyAccountsEnabled } = contracts.config
  const predicted = await predictedProxy(from)
  const targetIsProxy = destinationContract === predicted
  debug('useProxy', { proxy, targetIsProxy, predicted, destinationContract })

  if (!proxyAccountsEnabled) {
    debug('cannot useProxy: disabled in config')
    return
  } else if (to) {
    debug('cannot useProxy: sending value to wallet')
    return
  } else if (mutation === 'updateTokenAllowance') {
    // Since token approvals need to come direct from a wallet, don't use proxy
    debug('cannot useProxy: updateTokenAllowance should come from wallet')
    return
  } else if (mutation === 'swapToToken') {
    debug('cannot useProxy: swapToToken disabled')
    return
  } else if (mutation === 'swapAndMakeOffer') {
    debug('cannot useProxy: swapAndMakeOffer')
    return
  } else if (mutation === 'transferTokenMarketplaceExecute') {
    debug('cannot useProxy: transferTokenMarketplaceExecute')
    return
  }

  if (proxy) {
    debug(`useProxy: ${targetIsProxy ? 'execute-no-wrap' : 'execute'}`)
    return targetIsProxy && mutation !== 'finalizeOffer'
      ? 'execute-no-wrap'
      : 'execute'
  } else if (mutation === 'deployIdentity' || mutation === 'createListing') {
    // For 'first time' interactions, create proxy and execute in single transaction
    debug(`useProxy: create`)
    return 'create'
  } else if (
    mutation === 'makeOffer' ||
    mutation === 'transferTokenMakeOffer'
  ) {
    // If the target contract is the same as the predicted proxy address,
    // no need to wrap with changeOwnerAndExecute
    debug(`useProxy: ${targetIsProxy ? 'create-no-wrap' : 'create'}`)
    return targetIsProxy ? 'create-no-wrap' : 'create'
  }

  debug('cannot useProxy: no proxy specified')
}

/**
 * Fetch the gas price data from ethgasstation
 *
 * @returns {number} gas price in wei
 * @throws Error if it fails
 */
async function fetchGasPrice() {
  const res = await fetch(GAS_STATION_URL)
  if (res.status !== 200) {
    throw new Error(`Fetch returned code ${res.status}`)
  }
  const jason = await res.json()
  if (typeof jason[GAS_PRICE_KEY] !== 'undefined') {
    // values come from EGS as tenths of gwei
    return jason[GAS_PRICE_KEY] * 1e8
  }
  throw new Error(`Gas key of ${GAS_PRICE_KEY} is unavailable`)
}

/**
 * Return a globally available web3 instance if available, or die
 *
 * @returns {object} web3 instance
 * @throws {Error} if no global web3 available
 */
function globalWeb3() {
  if (window && window.web3) {
    return window.web3
  } else if (global && global.web3) {
    return global.web3
  }
  throw new Error('No available web3')
}

/**
 * Get the current going gas price.  If MM is in use, don't use eth_gasPrice,
 * but fetch from ethgasstation
 *
 * @param {object} web3 instance to use (optional)
 * @returns {number} gas price in wei
 * @throws {Error} if gas price fetch fails, no web3 given, and no global web3 available
 */
async function getGasPrice(w3) {
  w3 = w3 || globalWeb3()
  // Don't use eth_gasPrice for MM
  if (
    typeof window !== 'undefined' &&
    window.ethereum &&
    ['mainnet', 'rinkeby'].includes(contracts.net)
  ) {
    return await fetchGasPrice()
  }
  // But use it when we're using our provider
  return await w3.eth.getGasPrice()
}

/**
 * ABI encode a transaction if necessary
 *
 * @param {object} a web3.js transaction object
 * @returns {string} hex encoded transaction
 */
async function encodeTransaction(tx) {
  if (
    typeof tx !== 'object' ||
    !Object.prototype.hasOwnProperty.call(tx, 'encodeABI')
  ) {
    return tx
  }
  return await tx.encodeABI()
}

/**
 * Wrap a transaction for sending through a proxy
 *
 * @param {object} args
 * @param {object} args.ProxyContract - An instance of IdentityProxy
 * @param {object} args.tx - A web3.js transaction object
 * @param {string} args.destinationContract - Address of the target contract
 * @param {string} args.value - the value being sent with the tx
 * @returns {object} a web3.js transaction object
 */
async function txWrapExecute({
  ProxyContract,
  tx,
  destinationContract,
  value
}) {
  const txData = await encodeTransaction(tx)

  return ProxyContract.methods.execute(
    0,
    destinationContract,
    value || '0',
    txData
  )
}

/**
 * Wrap a transaction for sending through a proxy, and wrap that in a create
 * proxy tx.
 *
 * @param {object} args
 * @param {object} args.ProxyFactory - An instance of ProxyFactory
 * @param {object} args.tx - A web3.js transaction object
 * @param {string} args.from - The originating Ethereum account address
 * @returns {object} a web3.js transaction object
 */
async function txWrapCreateProxy({ ProxyFactory, tx, from }) {
  const txData = await encodeTransaction(tx)

  return ProxyFactory.methods.createProxyWithSenderNonce(
    contracts.config.IdentityProxyImplementation,
    txData,
    from,
    '0'
  )
}

/**
 * Wrap a transaction for sending through a proxy, and wrap that in a create
 * proxy tx that also sets owner.
 *
 * @param {object} args
 * @param {object} args.ProxyContract - An instance of IdentityProxy
 * @param {object} args.tx - A web3.js transaction object
 * @param {string} args.from - The originating Ethereum account address
 * @param {string} args.destinationContract - Address of the target contract
 * @param {string} args.value - the value being sent with the tx
 * @returns {object} a web3.js transaction object
 */
async function txWrapChangeOwner({
  ProxyContract,
  tx,
  from,
  destinationContract,
  value
}) {
  const txData = await encodeTransaction(tx)

  return ProxyContract.methods.changeOwnerAndExecute(
    from,
    destinationContract,
    value || '0',
    txData
  )
}

/**
 * Run callback functions giving them val as an argument
 *
 * @param {object} args
 * @param {Array} args.callbacks - Array of functions to call with val
 * @param {T} args.val - Value to provide callbacks as an argument
 * @returns {undefined}
 */
async function handleCallbacks({ callbacks, val }) {
  if (!callbacks) return
  for (const callback of callbacks) {
    const ret = callback(val)
    if (ret instanceof Promise) {
      await ret
    }
  }
  return
}

/**
 * Transaction hash handler. Used as an internal callback
 *
 * @param {object} args
 * @param {string} args.hash - The transaction hash
 * @param {string} args.from - The originating Ethereum account
 * @param {string} args.mutation - The graphql mutation being executed
 * @returns {undefined}
 */
async function handleHash({ hash, from, mutation }) {
  debug(`got hash ${hash}`)

  contracts.transactions[from] = contracts.transactions[from] || []
  contracts.transactions[from].unshift({
    id: hash,
    submittedAt: Math.round(+new Date() / 1000)
  })
  // Only store last 10 transactions...
  contracts.transactions[from] = contracts.transactions[from].slice(0, 10)

  try {
    window.localStorage[`${contracts.net}Transactions`] = JSON.stringify(
      contracts.transactions
    )
  } catch (e) {
    /* Ignore */
  }

  const node = await getTransaction(hash, true)

  pubsub.publish('NEW_TRANSACTION', {
    newTransaction: { totalCount: 1, node }
  })
  pubsub.publish('TRANSACTION_UPDATED', {
    transactionUpdated: {
      id: hash,
      status: 'pending',
      mutation
    }
  })
}

/**
 * Transaction receipt handler. Used as an internal callback
 *
 * @param {object} args
 * @param {string} args.shouldUseProxy - TODO
 * @param {object} args.receipt - The receipt object from web3.js
 * @param {string} args.mutation - The graphql mutation being executed
 * @returns {undefined}
 */
async function handleReceipt({ shouldUseProxy, receipt, mutation }) {
  if (String(shouldUseProxy).startsWith('create')) {
    // clear the cache since we just created a proxy
    resetProxyCache()
  }

  pubsub.publish('TRANSACTION_UPDATED', {
    transactionUpdated: {
      id: receipt.transactionHash,
      status: 'receipt',
      gasUsed: receipt.gasUsed,
      mutation
    }
  })

  if (contracts.automine) {
    setTimeout(() => mineBlock(contracts.web3), contracts.automine)
  }
}

/**
 * Transaction confirmation handler. Used as an internal callback. Each
 * "confirmation" is a mined block *after* the transaction was included in a
 * block
 *
 * @param {object} args
 * @param {string} args.shouldUseProxy - Return from useProxy function
 * @param {number} args.confNumber - The amount of confirmations since a transaction
 * @param {object} args.receipt - The receipt object from web3.js
 * @param {string} args.mutation - The graphql mutation being executed
 * @returns {undefined}
 */
async function handleConfirmation({
  shouldUseProxy,
  confNumber,
  receipt,
  mutation
}) {
  if (confNumber === 1) {
    if (String(shouldUseProxy).startsWith('create')) {
      // clear the cache since we just created a proxy
      resetProxyCache()
    }
  }
  if (confNumber > 0) {
    pubsub.publish('TRANSACTION_UPDATED', {
      transactionUpdated: {
        id: receipt.transactionHash,
        status: 'confirmed',
        mutation,
        confirmations: confNumber
      }
    })
  }
}

/**
 * Send a transaction using the Origin relayer
 *
 * @param {object} args
 * @param {object} args.web3 - a web3.js instance
 * @param {object} args.tx - a web3.js transaction object
 * @param {string} args.proxy - the proxy address to use
 * @param {string} args.sourceAccount - the originating Ethereum account
 * @param {string} args.to - the destination Ethereum address
 * @param {Array} args.hashCallbacks - Array of functions to use as callbacks for transaction hash
 * @param {Array} args.receiptCallbacks - Array of functions to use as callbacks for transaction receipts
 * @param {Array} args.confirmCallbacks - Array of functions to use as callbacks for transaction confirmations
 * @returns {string} transaction hash
 */
async function sendViaRelayer({
  web3,
  tx,
  proxy,
  sourceAccount,
  to,
  hashCallbacks,
  receiptCallbacks,
  confirmCallbacks
}) {
  const resp = await relayer({
    tx,
    proxy,
    from: sourceAccount,
    to
  })

  if (!resp || !resp.id) {
    throw new Error('No transaction hash from relayer!')
  }
  const txHash = resp.id
  if (typeof txHash !== 'string' || ![66, 64].includes(txHash.length)) {
    throw new Error('Invalid transaction hash returned by relayer!')
  }

  if (hashCallbacks && hashCallbacks.length) {
    await handleCallbacks({
      callbacks: hashCallbacks,
      val: txHash
    })
  }

  const hasCallbacks =
    receiptCallbacks.length > 0 || confirmCallbacks.length > 0 ? true : false

  /**
   * Since we don't get the event handlers when the relayer processes a
   * transaction, make sure that any provided callbacks are run by
   * manually listening for new blocks.
   */
  let foundReceipt = false
  if (hasCallbacks) {
    let receipt
    const responseBlocks = async ({ newBlock }) => {
      if (!receipt) {
        receipt = await web3.eth.getTransactionReceipt(txHash)
      }
      /**
       * There some potential races going on here, where we can't use === for
       * block numbers because there may actually be a delay between relayer
       * response and when a tx has been mined.
       */
      if (receipt && newBlock.id >= receipt.blockNumber && !foundReceipt) {
        foundReceipt = true

        if (receiptCallbacks.length) {
          await handleCallbacks({ callbacks: receiptCallbacks, val: receipt })
        }

        // Kill this process early if we're not waiting on confirm
        if (!confirmCallbacks || confirmCallbacks.length < 1) {
          pubsub.ee.off('NEW_BLOCK', responseBlocks)
        }
      }

      if (receipt && newBlock.id >= receipt.blockNumber + 1) {
        if (confirmCallbacks.length) {
          const confNumber = newBlock.id - receipt.blockNumber
          await handleCallbacks({
            callbacks: confirmCallbacks,
            val: { confNumber, receipt }
          })
        }
        pubsub.ee.off('NEW_BLOCK', responseBlocks)
      }
    }
    pubsub.ee.on('NEW_BLOCK', responseBlocks)
  }

  return txHash
}

/**
 * Send a trnsaction using the given web3 or contract instance
 *
 * @param {object} args
 * @param {object} args.web3 - a web3.js instance
 * @param {object} args.tx - a web3.js transaction object
 * @param {string} args.to - the destination Ethereum address
 * @param {string} args.sourceAccount - the originating Ethereum account
 * @param {T} args.value - the ETH value sent with the tx
 * @param {number} args.gas - the gas limit to use
 * @param {T} args.gas - the gas price to use in wei
 * @param {Array} args.hashCallbacks - Array of functions to use as callbacks for transaction hash
 * @param {Array} args.receiptCallbacks - Array of functions to use as callbacks for transaction receipts
 * @param {Array} args.confirmCallbacks - Array of functions to use as callbacks for transaction confirmations
 * @param {string} args.mutation - the graphql mutation being executed
 * @returns {undefined}
 */
async function sendViaWeb3({
  web3,
  tx,
  to,
  sourceAccount,
  value,
  gas,
  gasPrice,
  hashCallbacks,
  receiptCallbacks,
  confirmCallbacks,
  mutation,
  reject
}) {
  if (web3 && to) {
    tx = web3.eth.sendTransaction({
      from: sourceAccount,
      to,
      value,
      gas,
      gasPrice
    })
  } else {
    const toContract = get(tx, '_parent._address')
    debug('send', {
      mutation,
      from: sourceAccount,
      to: toContract,
      value,
      gas,
      gasPrice
    })
    tx = tx.send({ from: sourceAccount, value, gas, gasPrice })
  }

  let txHash

  tx.once('transactionHash', async hash => {
    txHash = hash
    if (
      typeof txHash === 'object' &&
      Object.prototype.hasOwnProperty.call(txHash, 'message')
    ) {
      throw new Error(txHash.message)
    } else if (txHash === null) {
      console.error(tx)
      throw new Error('Transaction hash returned null.  Invalid tx?')
    } else if (
      typeof txHash !== 'string' ||
      ![66, 64].includes(txHash.length)
    ) {
      console.error('Invaild hash: ', txHash)
      throw new Error('Invalid transaction hash returned by web3!')
    }
    await handleCallbacks({ callbacks: hashCallbacks, val: hash })
  })
    .once('receipt', async receipt => {
      await handleCallbacks({ callbacks: receiptCallbacks, val: receipt })
    })
    .on(`confirmation${isServer ? 'X' : ''}`, async (confNumber, receipt) => {
      await handleCallbacks({
        callbacks: confirmCallbacks,
        val: { confNumber, receipt }
      })
    })
    .on('error', function(error) {
      if (txHash) {
        pubsub.publish('TRANSACTION_UPDATED', {
          transactionUpdated: {
            id: txHash,
            status: 'error',
            error,
            mutation
          }
        })
      }
    })
    .catch(reject)
}

export default function txHelper({
  tx, // Raw web3.js transaction
  mutation, // Name of mutation
  onConfirmation, // Optional callback once transaction is confirmed
  onReceipt, // Optional callback once receipt is available
  from, // From address
  to, // To address or contract
  gas, // Max gas to spend
  value, // Eth to send with transaction
  web3 // web3.js instance
}) {
  return new Promise(async (resolve, reject) => {
    debug(`Mutation ${mutation} from ${formatAddr(from)}`)

    let gasPrice
    let toSend = tx
    web3 = contracts.web3Exec

    // callbacks, as an array
    const hashCallbacks = []
    const confirmCallbacks = onConfirmation ? [onConfirmation] : []
    const receiptCallbacks = onReceipt ? [onReceipt] : []

    /**
     * Initialize the contracts we need (ProxyContract will be given an address
     * when we need to)
     */
    const ProxyContract = new web3.eth.Contract(IdentityProxyDef.abi)
    const ProxyFactory = new web3.eth.Contract(
      ProxyFactoryDef.abi,
      contracts.config.ProxyFactory
    )

    // If the from address is a proxy, find the owner
    const owner = await proxyOwner(from)
    const proxy = owner ? from : null
    from = owner || from

    // The contract address if the tx is a contract transaction
    const destinationContract = get(tx, '_parent._address')

    // Determine if we should/can use proxies and the relayer
    const shouldUseRelayer = useRelayer({ mutation, value })
    const shouldUseProxy = await useProxy({
      proxy,
      destinationContract,
      to,
      from,
      mutation
    })
    debug(`shouldUseProxy: ${shouldUseProxy}`)
    debug(`shouldUseRelayer: ${shouldUseRelayer}`)

    // Add our internal callbacks
    hashCallbacks.push(async hash => {
      await handleHash({ hash, from, mutation })
      resolve({ id: hash })
    })
    confirmCallbacks.push(async ({ confNumber, receipt }) => {
      await handleConfirmation({
        shouldUseProxy,
        confNumber,
        receipt,
        mutation
      })
    })
    receiptCallbacks.push(async receipt => {
      await handleReceipt({ shouldUseProxy, receipt, mutation })
    })

    // Get our gas price if not using the relayer
    if (!shouldUseRelayer) {
      try {
        gasPrice = await getGasPrice(web3)
      } catch (err) {
        console.warn('Unable to get a gas price.  Using default set by web3')
        console.warn(err)
      }
    }

    // If this user doesn't have a proxy yet, create one
    if (shouldUseProxy === 'create' || shouldUseProxy === 'create-no-wrap') {
      if (shouldUseProxy === 'create') {
        // wrap the tx in changeOwnerAndExecute
        // TODO: It's not clear to me why create vs create-no-wrap here.
        // don't most proxy calls have changeOwner in them as well?
        toSend = await txWrapChangeOwner({
          ProxyContract,
          tx: toSend,
          from,
          destinationContract,
          value
        })
      }

      // Wrap the tx in a ProxyFactory createProxyWithSenderNonce call
      toSend = await txWrapCreateProxy({ ProxyFactory, tx: toSend, from })

      // TODO: result from estimateGas is too low. Need to work out exact amount
      // gas = await toSend.estimateGas({ from })
      gas = SAFETY_GAS_LIMIT
    }

    if (shouldUseRelayer && shouldUseProxy) {
      const address = get(toSend, '_parent._address')
      try {
        return await sendViaRelayer({
          web3,
          tx: toSend,
          proxy,
          sourceAccount: from, // originating real account
          to: address,
          hashCallbacks,
          receiptCallbacks,
          confirmCallbacks
        })
      } catch (err) {
        // TODO: I have no idea why any of this is a thing
        if (String(err).match(/denied message signature/)) {
          return reject(err)
        } else {
          /**
           * Re-throw in a timeout so we can catch the error in tests, but it
           * should not cause the whole process to burn, so we can fallback to
           * the traditional wallet sendTransaction
           */
          setTimeout(() => {
            throw err
          }, 1)
        }
      }
    }

    if (shouldUseProxy === 'execute') {
      debug(`wrapping tx with Proxy.execute. value: ${value}`)

      // Set the address now that we need
      const UserProxy = ProxyContract.clone()
      UserProxy.options.address = proxy

      // Wrap the tx in Proxy.execute
      toSend = await txWrapExecute({
        ProxyContract: UserProxy,
        proxy,
        tx: toSend,
        destinationContract,
        value
      })

      gas = SAFETY_GAS_LIMIT
    }

    // Send using the availble or given web3 instance
    debug(`Sending via web3`)
    await sendViaWeb3({
      web3,
      tx: toSend,
      to,
      sourceAccount: from,
      value,
      gas,
      gasPrice,
      hashCallbacks,
      receiptCallbacks,
      confirmCallbacks,
      mutation,
      reject
    })
    debug(`Sent via web3`)
  })
}
