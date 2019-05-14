import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import pubsub from '../utils/pubsub'
import contracts from '../contracts'
import hasProxy from '../utils/hasProxy'
import get from 'lodash/get'

import { getTransaction } from '../resolvers/web3/transactions'
import relayer from './_relayer'

export async function checkMetaMask(from) {
  if (contracts.metaMask && contracts.metaMaskEnabled) {
    const net = await contracts.web3.eth.net.getId()
    const mmNet = await contracts.metaMask.eth.net.getId()
    if (net !== mmNet) {
      throw new Error(`MetaMask is not on network ${net}`)
    }
    const mmAccount = await contracts.metaMask.eth.getAccounts()
    if (!mmAccount || mmAccount[0] !== from) {
      throw new Error(`MetaMask is not set to account ${from}`)
    }
  }
}

// Do not listen for confirmations if we're on the server as it causes mocha
// to hang
const isServer = typeof window === 'undefined'

function useRelayer({ mutation, value }) {
  if (!contracts.config.relayer) return false
  if (!mutation) return false
  if (mutation === 'makeOffer' && value) return false
  if (mutation === 'transferToken') return false
  if (mutation === 'swapToToken') return false
  return window.localStorage.enableRelayer ? true : false
}

function useProxy({ proxy, addr, to, mutation }) {
  if (!contracts.config.proxyAccountsEnabled) return false
  if (!proxy) return false
<<<<<<< HEAD
  if (addr === proxy) return false
  if (to) return false
  if (mutation === 'deployIdentityViaProxy') return false
=======
  if (addr === proxy && mutation !== 'deployIdentityViaProxy') return false
  if (to) return false
>>>>>>> meta-tx-wip
  if (mutation === 'updateTokenAllowance') return false
  if (mutation === 'swapToToken') return false
  return true
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
    let txHash
    let toSend = tx
    web3 = contracts.web3Exec

    // Use proxy if this wallet has one deployed
    const proxy = await hasProxy(from)

    if (useRelayer({ mutation, value })) {
      const address = tx._parent._address
      try {
        const relayerResponse = await relayer({ tx, proxy, from, to: address })
        return resolve(relayerResponse)
      } catch (err) {
        console.log('Relayer error', err)
      }
    }

    const addr = get(tx, '_parent._address')
    if (useProxy({ proxy, addr, to, mutation })) {
      const Proxy = new web3.eth.Contract(IdentityProxy.abi, proxy)
      const txData = await tx.encodeABI()
      toSend = Proxy.methods.execute(0, addr, value || '0', txData)
      gas = await toSend.estimateGas({ from })
    }

    if (web3 && to) {
      toSend = web3.eth.sendTransaction({ from, to, value, gas })
    } else {
      toSend = toSend.send({ from, value, gas })
    }
    toSend
      .once('transactionHash', async hash => {
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
            contracts.web3.currentProvider.send(
              { method: 'evm_mine' },
              () => {}
            )
          }, contracts.automine)
        }
      })
      .on(`confirmation${isServer ? 'X' : ''}`, function(confNumber, receipt) {
        if (confNumber === 1 && onConfirmation) {
          onConfirmation(receipt)
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
