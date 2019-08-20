import ProxyFactory from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import pubsub from '../utils/pubsub'
import contracts from '../contracts'
import { proxyOwner, resetProxyCache, predictedProxy } from '../utils/proxy'
import get from 'lodash/get'
import createDebug from 'debug'

import { getTransaction } from '../resolvers/web3/transactions'
import relayer from './_relayer'

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

  if (mutation === 'makeOffer' && value && value !== '0') {
    reason = 'makeOffer has a value'
  }
  if (mutation === 'transferToken') reason = 'transferToken is disabled'
  if (mutation === 'swapToToken') reason = 'swapToToken is disabled'
  if (reason) {
    debug(`cannot useRelayer: ${reason}`)
    return false
  }
  return true
}

/**
 * trigger the EVM to mine a block, supporting the WPE-style providers, and
 * the standard ones...
 * @param web3 {Web3} a Web3 instance
 */
function mineBlock(web3Inst) {
  const hasAsync = typeof web3Inst.currentProvider.sendAsync !== 'undefined'
  const sendMethod = hasAsync ? 'sendAsync' : 'send'
  return web3Inst.currentProvider[sendMethod]({ method: 'evm_mine' }, () => {})
}

/**
 * Should we use existing proxy, create new proxy, or don't use proxy at all.
 * @param proxy     Existing proxy address
 * @param addr      Contract address
 * @param to        Receipient wallet
 * @param from      Wallet address (proxy owner)
 * @param mutation  Name of mutation
 * @returns String or `undefined` if proxy should not be used.
 *  - execute: Wrap transaction with proxy's `execute` method
 *  - execute-no-wrap: Send transaction direct to proxy
 *  - create: Wrap transaction with proxy's `changeOwnerAndExecute` method
 *  - create-no-wrap: Send transaction direct to proxy after creation
 */
async function useProxy({ proxy, addr, to, from, mutation }) {
  if (isServer) return
  const { proxyAccountsEnabled } = contracts.config
  const predicted = await predictedProxy(from)
  const targetIsProxy = addr === predicted

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
    return targetIsProxy ? 'execute-no-wrap' : 'execute'
  } else if (mutation === 'deployIdentity' || mutation === 'createListing') {
    // For 'first time' interactions, create proxy and execute in single transaction
    debug(`useProxy: create`)
    return 'create'
  } else if (mutation === 'makeOffer') {
    // If the target contract is the same as the predicted proxy address,
    // no need to wrap with changeOwnerAndExecute
    debug(`useProxy: ${targetIsProxy ? 'create-no-wrap' : 'create'}`)
    return targetIsProxy ? 'create-no-wrap' : 'create'
  }

  debug('cannot useProxy: no proxy specified')
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

    let txHash
    let toSend = tx
    web3 = contracts.web3Exec

    // If the from address is a proxy, find the owner
    const owner = await proxyOwner(from)
    const proxy = owner ? from : null
    from = owner || from

    const addr = get(tx, '_parent._address')
    const shouldUseRelayer = useRelayer({ mutation, value })
    const shouldUseProxy = await useProxy({ proxy, addr, to, from, mutation })

    // If this user doesn't have a proxy yet, create one
    if (shouldUseProxy === 'create' || shouldUseProxy === 'create-no-wrap') {
      const txData = await tx.encodeABI()
      let initFn = txData
      if (shouldUseProxy === 'create') {
        debug('wrapping tx with Proxy.changeOwnerAndExecute')
        const Proxy = new web3.eth.Contract(IdentityProxy.abi)
        initFn = await Proxy.methods
          .changeOwnerAndExecute(from, addr, value || '0', txData)
          .encodeABI()
      }

      debug('wrapping tx with Proxy.createProxyWithSenderNonce')
      const Contract = new web3.eth.Contract(
        ProxyFactory.abi,
        contracts.config.ProxyFactory
      )
      toSend = Contract.methods.createProxyWithSenderNonce(
        contracts.config.IdentityProxyImplementation,
        initFn,
        from,
        '0'
      )
      // TODO: result from estimateGas is too low. Need to work out exact amount
      // gas = await toSend.estimateGas({ from })
      gas = 1000000
    } else if (shouldUseProxy && !shouldUseRelayer) {
      debug(`wrapping tx with Proxy.execute. value: ${value}`)
      const Proxy = new web3.eth.Contract(IdentityProxy.abi, proxy)
      const txData = await tx.encodeABI()
      toSend = Proxy.methods.execute(0, addr, value || '0', txData)
      // TODO: result from estimateGas is too low. Need to work out exact amount
      // gas = await toSend.estimateGas({ from })
      gas = 1000000
    }

    if (shouldUseRelayer && shouldUseProxy) {
      const address = toSend._parent._address
      try {
        const relayerResponse = await relayer({
          tx: toSend,
          proxy,
          from,
          to: address
        })
        const hasCallbacks = onReceipt || onConfirmation ? true : false

        /**
         * Since we don't get the event handlers when the relayer processes a
         * transaction, make sure that any provided callbacks are run by
         * manually listening for new blocks.
         */
        if (hasCallbacks && relayerResponse && relayerResponse.id) {
          let receipt
          const responseBlocks = async ({ newBlock }) => {
            if (!receipt) {
              receipt = await web3.eth.getTransactionReceipt(relayerResponse.id)
            }
            if (receipt && newBlock.id === receipt.blockNumber) {
              if (onReceipt) onReceipt()
            } else if (receipt && newBlock.id === receipt.blockNumber + 1) {
              if (onConfirmation) onConfirmation()
              pubsub.ee.off('NEW_BLOCK', responseBlocks)
            }
          }
          pubsub.ee.on('NEW_BLOCK', responseBlocks)
        }

        return resolve(relayerResponse)
      } catch (err) {
        if (String(err).match(/denied message signature/)) {
          return reject(err)
        } else {
          // Re-throw in a timeout so we can catch the error in tests
          setTimeout(() => {
            throw err
          }, 1)
        }
      }
    }

    if (web3 && to) {
      toSend = web3.eth.sendTransaction({ from, to, value, gas })
    } else {
      toSend = toSend.send({ from, value, gas })
    }
    toSend
      .once('transactionHash', async hash => {
        debug(`got hash ${hash}`)
        txHash = hash
        resolve({ id: hash })

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
      })
      .once('receipt', receipt => {
        if (String(shouldUseProxy).startsWith('create')) {
          resetProxyCache()
        }
        if (onReceipt) {
          onReceipt(receipt)
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
          setTimeout(() => {
            mineBlock(contracts.web3)
          }, contracts.automine)
        }
      })
      .on(`confirmation${isServer ? 'X' : ''}`, function(confNumber, receipt) {
        if (confNumber === 1) {
          if (String(shouldUseProxy).indexOf('create') === 0) {
            resetProxyCache()
          }
          if (onConfirmation) {
            onConfirmation(receipt)
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
      })
      .on('error', function(error) {
        console.log('tx error', error)
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
  })
}
