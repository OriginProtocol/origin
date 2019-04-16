import pubsub from '../utils/pubsub'
import contracts from '../contracts'

import { getTransaction } from '../resolvers/web3/transactions'

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

export default function txHelper({
  tx,
  mutation,
  onConfirmation,
  onReceipt,
  from,
  gas,
  value
}) {
  return new Promise((resolve, reject) => {
    let txHash
    tx.send({ gas, from, value })
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
      .on('error', function(err) {
        if (txHash) {
          pubsub.publish('TRANSACTION_UPDATED', {
            transactionUpdated: {
              id: txHash,
              status: 'error',
              error: err,
              mutation
            }
          })
        }
      })
      .catch(reject)
  })
}
