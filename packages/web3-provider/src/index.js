/**
 * Web3 Provider Engine Subproviders
 */
const ProviderEngine = require('./ProviderEngine')
const {
  MetricsProvider,
  ThrottleRPCProvider,
  EthGasStationProvider
} = require('./subproviders')

/**
 * Convert a standard provider to a web3-provider-engine subprovider
 * @param provider {object} - A Web3 provider
 * @param options {object} - Any options to give the subproviders
 * @returns {object} - A web3-provider-engine subprovider
 */
function convertWeb3Provider(provider, options) {
  if (!provider) {
    throw new Error('provider not provided')
  }

  if (provider.host && provider.host.startsWith('http')) {
    return new ThrottleRPCProvider({ rpcUrl: provider.host, ...options })
  } else if (typeof provider.setEngine !== 'undefined') {
    // This would be a web3-provider-engine subprovider, anyway. Unlikely.
    return provider
  } else {
    throw new Error('Provider unsupported...')
  }
}

/**
 * Creates a web3-provider-engine provider and replaces the current provider on
 * a web3.js instance
 * @param web3Inst {object} - An initialized Web3 instance
 * @param options {object} - Any options to give the subproviders
 * @returns {object} - An initialized web3 instance with the altered providers
 */
function createEngine(web3Inst, options) {
  // Convert the standard Web3 provider to a W3PE subprovider
  const convertedProvider = convertWeb3Provider(
    web3Inst.currentProvider,
    options
  )

  const engine = new ProviderEngine()
  engine.addProvider(convertedProvider)
  web3Inst.setProvider(engine)
}

/**
 * Add a W3PE SubProvider, or convert the currentProvider, then add
 * @param web3Inst {object} - An initialized Web3 instance
 * @param subprovider {object} - An initialized subprovider
 * @param index {number} - Where to stick th eprovider
 * @returns {object} - An initialized web3 instance with the altered providers
 */
function addSubprovider(web3Inst, subprovider, index = 0) {
  const currentProvider = web3Inst.currentProvider

  // This is a web3-provider-engine subprovider
  if (typeof currentProvider.setEngine !== 'undefined') {
    currentProvider.addProvider(subprovider, index)
  } else if (web3Inst.currentProvider instanceof ProviderEngine) {
    web3Inst.currentProvider.addProvider(subprovider, index)
  } else {
    throw new Error('Unsupported provider type')
  }

  return web3Inst
}

/**
 * Initialize the entire set of Origin subproviders and set 'em up'
 * @param web3Inst {object} - An initialized Web3 instance
 * @param options {object} - Options to provide to the subproviders
 * @returns {object} - A web3 instance with the altered providers
 */
function initStandardSubproviders(web3Inst, options) {
  if (
    !(web3Inst.currentProvider instanceof ProviderEngine) &&
    typeof web3Inst.currentProvider.setEngine === 'undefined'
  ) {
    createEngine(web3Inst, options)
  } else {
    if (web3Inst.currentProvider instanceof ProviderEngine) {
      console.log('is wpe provider')
    }
    if (web3Inst.currentProvider.setEngine !== 'undefined') {
      console.log('is wpe subprovider')
    }
    throw new Error('Not Implemented') // TODO? Already existing web3-provider-engine provider
  }

  addSubprovider(web3Inst, new MetricsProvider(options))
  if (options.ethGasStation) {
    addSubprovider(web3Inst, new EthGasStationProvider(options))
  }
  return web3Inst
}

module.exports = {
  createEngine,
  initStandardSubproviders,
  addSubprovider,
  MetricsProvider,
  ThrottleRPCProvider
}
