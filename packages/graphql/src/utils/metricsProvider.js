import ProviderEngine from 'web3-provider-engine'
import SubProvider from 'web3-provider-engine/subproviders/subprovider'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'

class MetricsProvider extends SubProvider {
  constructor(options) {
    super()

    this.totalRPC = 0
    this.totalErrors = 0
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

  _echo() {
    if (this.totalRPC % this.echoEvery === 0) {
      console.log(
        `JSON-RPC stats -- total calls: ${this.totalRPC}  methods used: ${
          this.methodCallTotals.size
        }  error count: ${this.totalErrors}`
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
      return cb()
    })

    return
  }
}

/**
 * Convert a standard provider to a web3-provider-engine subprovider
 * @param provider {object} - A Web3 provider
 * @returns {object} - A web3-provider-engine subprovider
 */
function convertWeb3Provider(provider) {
  if (!provider) {
    throw new Error('provider not provided')
  }

  if (provider.host && provider.host.indexOf('http') === 0) {
    return new RpcSubprovider({ rpcUrl: provider.host })
  } else if (typeof provider.setEngine !== 'undefined') {
    // This would be a web3-provider-engine subprovider, anyway. Unlikely.
    return provider
  } else {
    throw new Error('Provider unsupported...')
  }
}

/**
 * Adds MetricsProvider to the web3 provider stack of a Web3 instance.
 * @param web3Inst {object} - An initialized Web3 instance
 * @param options {object} - Mapping of configuration options
 * @returns {object} - An initialized web3 instance with the altered providers
 */
function addMetricsProvider(web3Inst, options) {
  const engine = new ProviderEngine()
  const metricsProvider = new MetricsProvider(options)

  engine.on('error', function(err) {
    metricsProvider.incrementError()
    const lastCall = metricsProvider.lastRPCMethod
    const lastPayload = metricsProvider.lastPayload
    console.error(`Provider error [${lastCall}]: `, err)
    console.debug(`Last payload: `, lastPayload)
  })

  // web3-provider-engine sets to 30, which apparently isn't enough for Origin
  engine.setMaxListeners(50)

  engine.addProvider(metricsProvider)
  engine.addProvider(convertWeb3Provider(web3Inst.currentProvider))

  web3Inst.setProvider(engine)

  /**
   * This is REQUIRED.  If you don't do this, you will probably spend a few
   * hours wondering why web3-provider-engine is gaslighting you.
   */
  engine.start()

  return web3Inst
}

export { MetricsProvider, addMetricsProvider }
