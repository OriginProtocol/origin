/**
 * Utility functions for testing
 */
const { stringToBN } = require('../src/util')

/**
 * Wait for a transaction to be mined and a receipt return
 * @param txHash {string} - The transaction hash to be mined
 * @param duration {number} - How long to wait before timeout
 * @returns {Promise<object>} The transaction receipt
 */
function waitForTransactionReceipt(web3Inst, txHash, duration = 5000) {
  let timeout, interval

  if (!txHash) {
    throw new Error('Missing transaction hash')
  }

  // ewww....
  return new Promise((resolve, reject) => {
    try {
      timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for receipt!'))
      }, duration)

      interval = setInterval(async () => {
        const receipt = await web3Inst.eth.getTransactionReceipt(txHash)
        if (receipt && receipt.blockNumber) {
          clearTimeout(timeout)
          resolve(receipt)
        }
      }, 500)
    } catch (err) {
      reject(err)
    }
  }).then((rcpt) => {
    clearInterval(interval)
    clearTimeout(timeout)
    return rcpt
  })
}

/**
 * Return the balance for an account as a BigNumber
 * @param address {string} - The address for an account
 * @returns {BN} BigNumber representation of the balance
 */
async function getBalance(web3Inst, address) {
  return stringToBN(await web3Inst.eth.getBalance(address))
}

/**
 * Send an RPC request
 * @param web3Inst {Web3} a Web3 instance
 * @param method {string} the JSON-RPC method
 * @param params {Array} the request parameters
 * @returns {Promise<result>} - A Promise that resolves to the response result
 */
function sendRPC(web3Inst, method, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const hasAsync = typeof web3Inst.currentProvider.sendAsync !== 'undefined'

      if (hasAsync) {
        web3Inst.currentProvider.sendAsync({ method, params }, (result) => {
          resolve(result)
        })
      } else {
        web3Inst.currentProvider.send({ method, params }, (err, response) => {
          if (err) return reject(err)
          resolve(response.result)
        })
        // Future web3.js 1.0 API:
        // resolve(await web3Inst.currentProvider.send('eth_sendRawTransaction', [rawTx]))
      }
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * trigger the EVM to mine a block, supporting the WPE-style providers, and
 * the standard ones...
 * @param web3 {Web3} a Web3 instance
 */
async function mineBlock(web3Inst) {
  return await sendRPC(web3Inst, 'evm_mine')
}

/**
 * start the ganache autominer
 * @param web3 {Web3} a Web3 instance
 */
async function startMining(web3Inst) {
  return await sendRPC(web3Inst, 'miner_start')
}

/**
 * stop the ganache autominer
 * @param web3 {Web3} a Web3 instance
 */
async function stopMining(web3Inst) {
  return await sendRPC(web3Inst, 'miner_stop')
}

/**
 * Look for an exact match of a string in an array in a case-insensitive way
 * @param str {string} - The search string
 * @param arr {Array} - The array to search
 * @returns {boolean} - If the string is an exact match to an element in an array
 */
function insensitiveInArray(str, arr) {
  for (const item of arr) {
    if (item.toLowerCase() === str.toLowerCase()) {
      return true
    }
  }
  return false
}

module.exports = {
  waitForTransactionReceipt,
  getBalance,
  sendRPC,
  mineBlock,
  startMining,
  stopMining,
  insensitiveInArray
}