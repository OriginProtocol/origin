/**
 * Based on: https://github.com/MetaMask/web3-provider-engine/blob/e90af04ee57f5b4f2e33f44630f28d7cd2ec7c72/subproviders/rpc.js
 * This is a modified subprovider to handle rate limiting.
 *
 * Blame: Mike Shultz <shultzm@gmail.com>
 */
const fetch = require('cross-fetch')
const Bottleneck = require('bottleneck/es5')
const JsonRpcError = require('json-rpc-error')
const createPayload = require('web3-provider-engine/util/create-payload')
const SubProvider = require('web3-provider-engine/subproviders/subprovider')

const MAX_RETRIES = 3
const BUFFER_MS = 5
// TODO Expand on this maybe?
const METHOD_PRIORITY = {
  eth_blockNumber: 9,
  eth_getBlockByNumber: 7,
  eth_getLogs: 4,
  eth_call: 1
}

/**
 * Send a JSON-RPC request
 * @param url {string} The destination for the request
 * @param payload {object} The JSON-RPC body
 * @returns {object} The JS repr of the JSON response data
 */
async function sendRequest(url, payload) {
  let response = null
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    throw new JsonRpcError.InternalError(err)
  }

  // check for error code
  switch (response.status) {
    case 405:
      throw new JsonRpcError.MethodNotFound()
    case 504: // Gateway timeout
      throw new JsonRpcError.InternalError(
        new Error(
          `Gateway timeout. The request took too long to process. This can happen when querying logs over too wide a block range.`
        )
      )
    case 429: // Too many requests (rate limiting)
      throw new JsonRpcError.InternalError(new Error(`Too Many Requests`))
    default:
      if (response.status != 200) {
        throw new JsonRpcError.InternalError(response.text)
      }
  }

  // parse response
  let data
  try {
    data = await response.json()
  } catch (err) {
    console.log('errror parser')
    console.error(err.stack)
    throw new JsonRpcError.InternalError(err)
  }
  if (data.error) {
    console.error(data.error)
    throw new JsonRpcError.InternalError(data.error)
  }

  return data.result
}

class ThrottleRPCProvider extends SubProvider {
  constructor(options) {
    super()

    this.rpcUrl = options.rpcUrl
    this.qps = options.qps || 250
    this.maxConcurrent = options.maxConcurrent || 25

    this.limiter = this._initLimiter({
      maxConcurrent: this.maxConcurrent,
      minTime: 1000 / this.qps + BUFFER_MS
    })
  }

  _initLimiter(options) {
    const limiter = new Bottleneck(options)

    limiter.on('error', err => {
      console.log('unhandled error in subprovider job: ')
      console.error(err)
    })
    limiter.on('failed', (err, jobInfo) => {
      if (jobInfo.retryCount > MAX_RETRIES - 1) return null // This will allow the error to throw
      return (jobInfo.retryCount || 1) * BUFFER_MS
    })
    limiter.on('retry', (message, jobInfo) => {
      console.debug('retrying request method: ', jobInfo.args[1].method)
    })

    return limiter
  }

  handleRequest(payload, next, end) {
    const self = this
    const targetUrl = self.rpcUrl
    const { method } = payload
    const priority = METHOD_PRIORITY.hasOwnProperty(method)
      ? METHOD_PRIORITY[method]
      : 5

    // overwrite id to conflict with other concurrent users
    const newPayload = createPayload(payload)

    this.limiter
      .schedule({ priority }, sendRequest, targetUrl, newPayload)
      .then(res => {
        end(null, res)
      })
      .catch(err => {
        end(err, null)
      })
  }
}

module.exports = ThrottleRPCProvider
