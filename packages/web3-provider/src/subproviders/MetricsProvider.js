const SubProvider = require('./Subprovider')

/**
 * A web3-provider-engine subprovider to gether metrics on JSON-RPC calls
 */
class MetricsProvider extends SubProvider {
  constructor(options) {
    super()

    this.totalRPC = 0
    this.totalErrors = 0
    this.totalRateLimitedRequests = 0
    this.methodCallTotals = new Map()
    this.methodErrorTotals = new Map()

    this.lastRPCMethod = null
    this.lastPayload = null

    // Echo stats every N requests
    this.echoEvery = options.echoEvery ? options.echoEvery : 1000
    // Echo stats per RPC method every N requests
    this.breakdownEvery = options.breakdownEvery
      ? options.breakdownEvery
      : 10000
  }

  _increment(method) {
    this.totalRPC += 1
    const oldCount = this.methodCallTotals.get(method)
    this.methodCallTotals.set(method, oldCount ? oldCount + 1 : 1)
    return this.methodCallTotals.get(method)
  }

  incrementError(method) {
    this.totalErrors += 1

    if (!method) {
      /**
       * The accuracy of this could be iffy... not clear to me if concurrency
       * of calls could be a thing with a single instance of web3.
       */
      method = this.lastRPCMethod
    }

    if (method) {
      const oldCount = this.methodErrorTotals.get(method)
      this.methodErrorTotals.set(method, oldCount ? oldCount + 1 : 1)
      return this.methodErrorTotals.get(method)
    }
    return this.totalErrors
  }

  incrementRateLimited() {
    return (this.totalRateLimitedRequests += 1)
  }

  _echo() {
    if (this.totalRPC % this.echoEvery === 0) {
      console.log(
        `JSON-RPC stats -- total calls: ${this.totalRPC}  methods used: ${this.methodCallTotals.size}  error count: ${this.totalErrors}  rate limited requests: ${this.totalRateLimitedRequests}`
      )
    }
    if (this.totalRPC % this.breakdownEvery === 0) {
      console.log(`JSON-RPC call stats`)
      console.log(`-------------------`)
      this.methodCallTotals.forEach((val, key) => {
        const errors = this.methodErrorTotals.get(key)
        console.log(`${key}: ${val} (errors: ${errors ? errors : 0})`)
      })
      console.log(`-------------------`)
    }
  }

  handleRequest(payload, next) {
    const { method } = payload

    this.lastRPCMethod = method
    this.lastPayload = payload

    this._increment(method)
    this._echo()

    next((err, result, cb) => {
      if (err) {
        // Perhaps this should be separated from 429s at some point?
        this.incrementError()

        if (err.code === -32603) {
          if (err.message.indexOf('Too Many Requests') > -1) {
            this.incrementRateLimited()
            console.error('429 Rate limited')
          } else {
            console.error(`Invalid JSON-RPC response: ${err.message}`)
          }
        } else if (err.code === -32600) {
          console.error(`Invalid request on method ${this.lastRPCMethod}`)
          console.debug('Payload: ', JSON.stringify(this.lastPayload))
        } else {
          console.error(
            `Unknown error occurred in a following subprovider on method ${this.lastRPCMethod}!`
          )
          console.debug('Payload: ', JSON.stringify(this.lastPayload))
          if (err.code) console.error(`JSON-RPC error code: ${err.code}`)
          else console.error(err)
        }
      }

      return cb()
    })

    return
  }
}

module.exports = MetricsProvider
