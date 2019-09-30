/**
 * Utility functions for testing
 */
const { unpad } = require('ethereumjs-util')
const { stringToBN } = require('../src/util')
const { EVENT_SIG_PROXYCREATION } = require('./const')

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
  if (typeof txHash !== 'string' || txHash.length !== 66) {
    console.log(txHash)
    throw new Error('Invalid transaction hash!')
  }

  // ewww....
  return new Promise((resolve, reject) => {
    try {
      timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for receipt for tx ${txHash}`))
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

/**
 * Sit idle for however many ms you want
 * @param ms {number} number of miliseconds to wait
 */
async function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

/**
 * Check for an event signature in tx receipt logs
 * @param receipt {object} A transaction receipt
 * @param sig {string} An event signature
 * @returns {boolean} If it was found
 */
function eventSigInReceipt(receipt, sig) {
  for (const log of receipt.logs) {
    if (log.topics[0] === sig) {
      return true
    }
  }
  return false
}

/**
 * doecode an address from en event log
 * @param encoded {string} An encoded address
 * @returns {string} The decoded address
 */
function decodeAddress(encoded) {
  if (encoded.startsWith('0x')) {
    encoded = encoded.slice(2)
  }
  if (encoded.length === 40) return encoded
  if (encoded.length < 40) throw new Error('not an address')
  return `0x${unpad(encoded).padStart(40, '0')}`
}

/**
 * Return a proxy address from a ProxyCreation event from receipt logs
 * @param receipt {object} A transaction receipt
 * @returns {string} The decoded address
 */
function getProxyAddress(receipt) {
  for (const log of receipt.logs) {
    if (log.topics[0] === EVENT_SIG_PROXYCREATION) {
      return decodeAddress(log.data)
    }
  }
  return null
}

/**
 * Creates a fake Express Request object for testing
 * @param options {object} request things
 * @returns {object} False Reqeust object
 */
function mockRequest({ body, headers }) {
  const _headers = headers ? headers : {}
  return {
    headers: _headers,
    header(name) {
      return _headers[name]
    },
    body,
  }
}

/**
 * Creates a fake Express Response object for testing
 * @returns {object} False Response object
 */
function mockResponse() {
  const res = {}

  res.statusCode = 200

  res.status = (code) => {
    res.statusCode = code
    return res
  }

  res.send = (body) => {
    res.body = body
    return res
  }

  return res
}

/**
 * The hash function used for relayer transactions
 * @param options {object} Transaction data to hash
 * @returns {string} A bytes32 hash string
 */
function hashTxdata(web3Inst, { from, to, txData, nonce }) {
  return web3Inst.utils.soliditySha3(
    { t: 'address', v: from },
    { t: 'address', v: to },
    { t: 'uint256', v: '0' },
    { t: 'bytes', v: txData },
    { t: 'uint256', v: nonce }
  )
}

module.exports = {
  waitForTransactionReceipt,
  getBalance,
  sendRPC,
  mineBlock,
  startMining,
  stopMining,
  insensitiveInArray,
  wait,
  eventSigInReceipt,
  decodeAddress,
  getProxyAddress,
  mockRequest,
  mockResponse,
  hashTxdata
}
