import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import pubsub from '../utils/pubsub'
import contracts from '../contracts'

import { getTransaction } from '../resolvers/web3/transactions'
// import relayerHelper from './_relayer'

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

// function useRelayer({ mutation }) {
//   if (!contracts.config.relayer) return false
//   if (mutation !== 'deployIdentity') return false
//   return true
// }

contracts.hasAccount = async function hasAccount(address) {
  try {
    const web3 = contracts.web3Exec

    const changeOwner = await contracts.ProxyImp.methods
      .changeOwner(address)
      .encodeABI()

    const salt = web3.utils.soliditySha3(web3.utils.sha3(changeOwner), 0)

    let creationCode = await contracts.ProxyFactory.methods
      .proxyCreationCode()
      .call()

    creationCode += web3.eth.abi
      .encodeParameter('uint256', contracts.ProxyImp._address)
      .slice(2)

    const creationHash = web3.utils.sha3(creationCode)

    const create2hash = web3.utils
      .soliditySha3('0xff', contracts.ProxyFactory._address, salt, creationHash)
      .slice(-40)
    const predicted = `0x${create2hash}`

    const code = await web3.eth.getCode(predicted)
    return code.slice(2).length > 0
      ? web3.utils.toChecksumAddress(predicted)
      : false
  } catch (e) {
    return false
  }
}

export default function txHelper({
  tx,
  mutation,
  onConfirmation,
  onReceipt,
  from,
  to,
  gas,
  value,
  web3
}) {
  // if (useRelayer({ mutation })) {
  //   return relayerHelper({ tx, from, address: tx._parent._address })
  // }

  return new Promise(async (resolve, reject) => {
    let txHash
    let toSend = tx
    web3 = contracts.web3Exec

    // Use proxy is this wallet has one deployed
    const proxyAddress = await contracts.hasAccount(from)
    if (proxyAddress && !to && mutation !== 'deployIdentityViaProxy') {
      const Proxy = new web3.eth.Contract(IdentityProxy.abi, proxyAddress)
      const txData = await tx.encodeABI()
      const addr = tx._parent._address
      toSend = Proxy.methods.execute(0, addr, value || '0', txData)
      gas += 1000
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
