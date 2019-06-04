import EthBlockTracker from 'eth-block-tracker'
import ProviderEngine from 'web3-provider-engine'
import SubProvider from 'web3-provider-engine/subproviders/subprovider'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'

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
        `JSON-RPC stats -- total calls: ${this.totalRPC}  methods used: ${
          this.methodCallTotals.size
        }  error count: ${this.totalErrors}  rate limited requests: ${
          this.totalRateLimitedRequests
        }`
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
            `Unknown error occurred in a following subprovider on method ${
              this.lastRPCMethod
            }!`
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

/**
 * Convert a standard provider to a web3-provider-engine subprovider
 * @param provider {object} - A Web3 provider
 * @returns {object} - A web3-provider-engine subprovider
 */
function convertWeb3Provider(provider) {
  if (!provider) {
    throw new Error('provider not provided')
  }

  if (provider.host && provider.host.startsWith('http')) {
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
  // Our new shiny subproviders
  const convertedProvider = convertWeb3Provider(web3Inst.currentProvider)
  const metricsProvider = new MetricsProvider(options)

  /**
   * The blockTracker seems be a default function of web3-provider-engine, but
   * it's not completely clear if it's necessary(emits the 'latest' event).  It
   * has an internal currentBlock tracker.  Perhaps we should bolt onto it.
   * Right now, we're specifically initializing the block tracker so we can
   * disable the `skipConfig` parameter that it sends which breaks Alchemy
   */
  const engine = new ProviderEngine({
    blockTracker: new EthBlockTracker({
      provider: convertedProvider,
      pollingInterval: 15000,
      setSkipCacheFlag: false
    })
  })

  /**
   * IF YOU REMOVE THIS, EVERYTHING WITH EXPLODE
   *
   * This is more or less duplication of the handling in MetricsProvider, but we
   * can't do anything intelligent from here.  And if we don't have this event
   * listener, web3-provider-engine will crash the process...  And looking at
   * their source, I don't *think* there's any exceptions where an error would
   * present here, and not in the next() callback, so we're more or less just
   * supressing the crash here.  Probably.
   */
  engine.on('error', () => {})

  // web3-provider-engine sets to 30, which apparently isn't enough for Origin
  engine.setMaxListeners(50)

  engine.addProvider(metricsProvider)
  engine.addProvider(convertedProvider)

  web3Inst.setProvider(engine)

  /**
   * This is REQUIRED.  If you don't do this, you will probably spend a few
   * hours wondering why web3-provider-engine is gaslighting you.
   */
  engine.start()

  return web3Inst
}

export { MetricsProvider, addMetricsProvider }
