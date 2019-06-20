/**
 * Random utils
 */
const BN = require('bn.js')

function stringToBN(str, base = 10) {
  return new BN(str, base)
}

function numberToBN(num) {
  return new BN(num)
}

function getBIP44Path(idx) {
  return `m/44'/60'/${idx}'/0`
}

function bufferToHex(buf) {
  return `0x${buf.toString('hex')}`
}

function sendRawTransaction(web3Inst, rawTx) {
  return new Promise(async (resolve, reject) => {
    try {
      const hasAsync = typeof web3Inst.currentProvider.sendAsync !== 'undefined'

      if (hasAsync) {
        web3Inst.currentProvider.sendAsync(
          {
            id: Number(new Date()),
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [rawTx]
          },
          result => {
            resolve(result)
          }
        )
      } else {
        web3Inst.currentProvider.send(
          {
            id: Number(new Date()),
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [rawTx]
          },
          (err, response) => {
            if (err) return reject(err)
            if (response.error) {
              console.debug(response.error.data)
              reject(new Error(response.error.message))
            }

            resolve(response.result)
          }
        )
        // Future web3.js 1.0 API:
        // resolve(await web3Inst.currentProvider.send('eth_sendRawTransaction', [rawTx]))
      }
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = {
  stringToBN,
  numberToBN,
  getBIP44Path,
  bufferToHex,
  sendRawTransaction
}
