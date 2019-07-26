import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import TokenContract from '@origin/contracts/build/contracts/TestToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'
import IdentityProxyFactory from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import { exchangeAbi, factoryAbi } from './contracts/UniswapExchange'

import Web3 from 'web3'
import EventSource from '@origin/eventsource'
import { patchWeb3Contract } from '@origin/event-cache'
import { initStandardSubproviders, createEngine } from '@origin/web3-provider'

import pubsub from './utils/pubsub'
import currencies from './utils/currencies'

import Configs from './configs'

const isBrowser =
  typeof window !== 'undefined' && window.localStorage ? true : false
const isWebView =
  typeof window !== 'undefined' &&
  typeof window.ReactNativeWebView !== 'undefined'

let metaMask, metaMaskEnabled, web3WS, wsSub, web3, blockInterval

let OriginMessaging
let OriginMobileBridge
if (typeof window !== 'undefined') {
  OriginMessaging = require('@origin/messaging-client').default
  OriginMobileBridge = require('@origin/mobile-bridge').default
}

const DefaultMessagingConfig = {
  messagingNamespace: 'origin:dev',
  globalKeyServer: 'https://messaging.dev.originprotocol.com'
}

const context = {}

// web3.js version 35 + 36 need this hack...
function applyWeb3Hack(web3Instance) {
  if (!web3Instance.version.match(/(35|36)$/)) return web3Instance

  web3Instance.eth.abi.decodeParameters = function(outputs, bytes) {
    if (bytes === '0x') bytes = '0x00'
    return web3Instance.eth.abi.__proto__.decodeParameters(outputs, bytes)
  }
  return web3Instance
}

let lastBlock
export function newBlock(blockHeaders) {
  if (!blockHeaders) return
  if (blockHeaders.number <= lastBlock) return
  lastBlock = blockHeaders.number
  context.marketplace.eventCache.setLatestBlock(lastBlock)
  context.identityEvents.eventCache.setLatestBlock(lastBlock)
  context.ProxyFactory.eventCache.setLatestBlock(lastBlock)
  context.eventSource.resetCache()
  pubsub.publish('NEW_BLOCK', {
    newBlock: { ...blockHeaders, id: blockHeaders.hash }
  })
}

function pollForBlocks() {
  let inProgress = false
  try {
    blockInterval = setInterval(() => {
      if (inProgress) {
        return
      }
      inProgress = true
      web3.eth
        .getBlockNumber()
        .then(block => {
          if (block > lastBlock) {
            web3.eth.getBlock(block).then(newBlock)
          }
          inProgress = false
        })
        .catch(err => {
          console.log(err)
          inProgress = false
        })
    }, 5000)
  } catch (error) {
    console.log(`Polling for new blocks failed: ${error}`)
    inProgress = false
  }
}

export function setNetwork(net, customConfig) {
  if (process.env.DOCKER && net !== 'test') {
    net = 'docker'
  }
  if (!Configs[net]) {
    net = 'rinkeby'
  }

  let config = JSON.parse(JSON.stringify(Configs[net]))
  if (
    isBrowser &&
    window.localStorage.customConfig &&
    window.localStorage.customConfig !== 'undefined'
  ) {
    try {
      config = { ...config, ...JSON.parse(window.localStorage.customConfig) }
    } catch (error) {
      console.log('Could not load custom config: ', error)
    }
  }

  if (!config) {
    return
  }
  config = { ...config, ...customConfig }

  context.net = net
  context.config = config
  context.automine = config.automine

  context.ipfsGateway = config.ipfsGateway
  context.ipfsRPC = config.ipfsRPC
  context.discovery = config.discovery
  context.growth = config.growth
  context.graphql = config.graphql

  delete context.marketplace
  delete context.marketplaceExec
  delete context.ogn
  delete context.ognExec
  delete context.marketplaces
  delete context.tokens
  delete context.identityEvents
  delete context.metaMask
  if (wsSub) {
    wsSub.unsubscribe()
  }
  clearInterval(blockInterval)

  const provider = process.env.PROVIDER_URL
    ? process.env.PROVIDER_URL
    : config.provider
  web3 = applyWeb3Hack(new Web3(provider))

  const qps =
    typeof process.env.MAX_RPC_QPS !== 'undefined'
      ? parseInt(process.env.MAX_RPC_QPS)
      : 100
  const maxConcurrent =
    typeof process.env.MAX_RPC_CONCURRENT !== 'undefined'
      ? parseInt(process.env.MAX_RPC_CONCURRENT)
      : 25
  if (config.useMetricsProvider) {
    // These are "every N requests"
    const echoEvery =
      typeof process.env.ECHO_EVERY !== 'undefined'
        ? parseInt(process.env.ECHO_EVERY)
        : 250
    const breakdownEvery =
      typeof process.env.BREAKDOWN_EVERY !== 'undefined'
        ? parseInt(process.env.BREAKDOWN_EVERY)
        : 1000

    initStandardSubproviders(web3, {
      echoEvery,
      breakdownEvery,
      maxConcurrent,
      qps,
      ethGasStation: ['mainnet', 'rinkeby'].includes(net)
    })
  } else if (!isBrowser) {
    // TODO: Allow for browser?
    createEngine(web3, { qps, maxConcurrent })
  }

  if (isBrowser) {
    window.localStorage.ognNetwork = net
    window.web3 = web3
  }

  context.web3 = web3
  context.web3Exec = web3

  if (isBrowser) {
    const MessagingConfig = config.messaging || DefaultMessagingConfig
    MessagingConfig.personalSign = metaMask && metaMaskEnabled ? true : false
    if (isWebView) {
      context.mobileBridge = OriginMobileBridge({ web3 })
    }
    context.messaging = OriginMessaging({
      ...MessagingConfig,
      web3,
      mobileBridge: context.mobileBridge
    })
  }

  context.metaMaskEnabled = metaMaskEnabled
  if (isBrowser && window.localStorage.privateKeys) {
    JSON.parse(window.localStorage.privateKeys).forEach(key =>
      web3.eth.accounts.wallet.add(key)
    )
  }

  context.EventBlock = config.V00_Marketplace_Epoch || 0

  setMarketplace(config.V00_Marketplace, config.V00_Marketplace_Epoch)
  setIdentityEvents(config.IdentityEvents, config.IdentityEvents_Epoch)

  setProxyContracts(config)

  if (config.providerWS) {
    web3WS = applyWeb3Hack(new Web3(config.providerWS))
    context.web3WS = web3WS
    try {
      wsSub = web3WS.eth
        .subscribe('newBlockHeaders')
        .on('data', newBlock)
        .on('error', () => {
          console.log('WS connection error. Polling for new blocks...')
          pollForBlocks()
        })
    } catch (err) {
      console.log('Websocket error. Polling for new blocks...')
      console.error(err)
      pollForBlocks()
    }
  } else {
    pollForBlocks()
  }
  try {
    web3.eth.getBlockNumber().then(block => {
      web3.eth.getBlock(block).then(newBlock)
    })
  } catch (error) {
    console.log(`Could not retrieve block: ${error}`)
  }
  context.pubsub = pubsub

  context.tokens = config.tokens || []
  if (config.OriginToken) {
    context.ogn = new web3.eth.Contract(
      OriginTokenContract.abi,
      config.OriginToken
    )
    context[config.OriginToken] = context.ogn
    context.tokens.unshift({
      id: config.OriginToken,
      type: 'OriginToken',
      name: 'Origin Token',
      symbol: 'OGN',
      decimals: '18',
      supply: '1000000000'
    })
  }

  try {
    const storedTokens = JSON.parse(window.localStorage[`${net}Tokens`])
    storedTokens.forEach(token => {
      if (context.tokens.find(t => t.id === token.id)) {
        return
      }
      context.tokens.push(token)
    })
  } catch (e) {
    /* Ignore */
  }

  context.tokens.forEach(token => {
    const contractDef =
      token.type === 'OriginToken' ? OriginTokenContract : TokenContract
    const contract = new web3.eth.Contract(contractDef.abi, token.id)
    token.contract = contract
    token.contractExec = contract
  })

  context.uniswapFactory = new web3.eth.Contract(factoryAbi)
  if (config.DaiExchange) {
    const contract = new web3.eth.Contract(exchangeAbi, config.DaiExchange)
    context.daiExchange = contract
    context.daiExchangeExec = contract
    if (metaMask) {
      context.daiExchangeMM = new metaMask.eth.Contract(
        exchangeAbi,
        config.DaiExchange
      )
      if (metaMaskEnabled) {
        context.daiExchangeExec = context.daiExchangeMM
      }
    }
  }

  context.transactions = {}
  try {
    context.transactions = JSON.parse(window.localStorage[`${net}Transactions`])
  } catch (e) {
    /* Ignore */
  }

  if (metaMask) {
    context.metaMask = metaMask
    context.ognMM = new metaMask.eth.Contract(
      OriginTokenContract.abi,
      config.OriginToken
    )
    context.tokens.forEach(token => {
      token.contractMM = new metaMask.eth.Contract(
        token.contract.options.jsonInterface,
        token.contract.options.address
      )
    })
  }
  setMetaMask()

  if (isWebView) {
    setMobileBridge()
  }
}

function setMetaMask() {
  if (metaMask && metaMaskEnabled) {
    context.metaMaskEnabled = true
    context.web3Exec = metaMask
    context.marketplaceExec = context.marketplaceMM
    context.ognExec = context.ognMM
    context.tokens.forEach(token => (token.contractExec = token.contractMM))
    context.daiExchangeExec = context.daiExchangeMM
  } else {
    context.metaMaskEnabled = false
    context.web3Exec = web3
    context.marketplaceExec = context.marketplace
    context.ognExec = context.ogn
    context.tokens.forEach(token => (token.contractExec = token.contract))
    context.daiExchangeExec = context.daiExchange
  }
  if (context.messaging) {
    context.messaging.web3 = context.web3Exec
  }
}

/* Initialize mobile bridge to funnel transactions through a react-native
 * webview from the DApp
 */
function setMobileBridge() {
  if (context.metaMaskEnabled) return
  if (!context.mobileBridge) return
  if (metaMask && metaMaskEnabled) return

  // Init our custom web3 provider which modifies certain methods
  const mobileBridgeProvider = context.mobileBridge.getProvider()
  context.web3Exec = applyWeb3Hack(new Web3(mobileBridgeProvider))

  // Replace all the contracts with versions that use our custom web3 provider
  // so that contract calls get routed through window.postMessage
  context.marketplaceExec = new context.web3Exec.eth.Contract(
    MarketplaceContract.abi,
    context.marketplace._address
  )

  context.identityEventsExec = new context.web3Exec.eth.Contract(
    IdentityEventsContract.abi,
    context.identityEvents._address
  )

  if (context.config.OriginToken) {
    context.ognExec = new context.web3Exec.eth.Contract(
      OriginTokenContract.abi,
      context.ogn._address
    )
  }

  if (context.config.DaiExchange) {
    context.daiExchangeExec = new context.web3Exec.eth.Contract(
      exchangeAbi,
      context.daiExchange._address
    )
  }

  context.tokens.forEach(token => {
    const contractDef =
      token.type === 'OriginToken' ? OriginTokenContract : TokenContract
    const contract = new context.web3Exec.eth.Contract(
      contractDef.abi,
      token.id
    )
    token.contract = contract
    token.contractExec = contract
  })

  if (context.messaging) {
    context.messaging.web3 = context.web3Exec
  }
}

export function toggleMetaMask(enabled) {
  if (!isBrowser) {
    return
  }
  metaMaskEnabled = enabled
  if (metaMaskEnabled) {
    window.localStorage.metaMaskEnabled = true
  } else {
    delete window.localStorage.metaMaskEnabled
  }
  setMetaMask()
}

export function setMarketplace(address, epoch) {
  context.marketplace = new web3.eth.Contract(MarketplaceContract.abi, address)
  patchWeb3Contract(context.marketplace, epoch, {
    ...context.config,
    useLatestFromChain: false,
    ipfsEventCache: context.config.V00_Marketplace_EventCache,
    cacheMaxBlock: context.config.V00_Marketplace_EventCacheMaxBlock,
    prefix:
      typeof address === 'undefined'
        ? 'Marketplace_'
        : `${address.slice(2, 8)}_`,
    platform: typeof window === 'undefined' ? 'memory' : 'browser'
  })

  if (address) {
    context.marketplaces = [context.marketplace]
  } else {
    context.marketplaces = []
  }
  context.eventSource = new EventSource({
    marketplaceContract: context.marketplace,
    ipfsGateway: context.ipfsGateway,
    web3: context.web3
  })
  context.marketplaceExec = context.marketplace

  if (metaMask) {
    context.marketplaceMM = new metaMask.eth.Contract(
      MarketplaceContract.abi,
      address
    )
    if (metaMaskEnabled) {
      context.marketplaceExec = context.marketplaceMM
    }
  }
}

export function setIdentityEvents(address, epoch) {
  context.identityEvents = new web3.eth.Contract(
    IdentityEventsContract.abi,
    address
  )
  patchWeb3Contract(context.identityEvents, epoch, {
    ...context.config,
    ipfsEventCache: context.config.IdentityEvents_EventCache,
    cacheMaxBlock: context.config.IdentityEvents_EventCacheMaxBlock,
    useLatestFromChain: false,
    prefix:
      typeof address === 'undefined'
        ? 'IdentityEvents_'
        : `${address.slice(2, 8)}_`,
    platform: typeof window === 'undefined' ? 'memory' : 'browser',
    batchSize: 2500
  })
  context.identityEventsExec = context.identityEvents

  if (metaMask) {
    context.identityEventsMM = new metaMask.eth.Contract(
      IdentityEventsContract.abi,
      context.identityEvents.options.address
    )
    if (metaMaskEnabled) {
      context.identityEventsExec = context.identityEventsMM
    }
  }
}

export function setProxyContracts(config) {
  context.ProxyFactory = new web3.eth.Contract(
    IdentityProxyFactory.abi,
    config.ProxyFactory
  )
  context.ProxyImp = new web3.eth.Contract(
    IdentityProxy.abi,
    config.IdentityProxyImplementation
  )
  // Add an event cache to ProxyFactory.
  patchWeb3Contract(context.ProxyFactory, config.ProxyFactory_Epoch, {
    ...context.config,
    ipfsEventCache: null, // TODO add IPFS cache after Meta-txn launch, once we have a non trivial number of events.
    cacheMaxBlock: null,
    useLatestFromChain: false,
    prefix:
      typeof config.ProxyFactory === 'undefined'
        ? 'ProxyFactory_'
        : `${config.ProxyFactory.slice(2, 8)}_`,
    platform: typeof window === 'undefined' ? 'memory' : 'browser',
    batchSize: 2500
  })
}

export function shutdown() {
  if (web3.currentProvider.stop) web3.currentProvider.stop()
  if (wsSub) {
    wsSub.unsubscribe()
    web3WS.currentProvider.connection.close()
  }
  clearInterval(blockInterval)
  clearInterval(currencies.interval)
}

if (isBrowser) {
  if (window.ethereum) {
    metaMask = applyWeb3Hack(new Web3(window.ethereum))
    metaMaskEnabled = window.localStorage.metaMaskEnabled ? true : false
  } else if (window.web3) {
    metaMask = applyWeb3Hack(new Web3(window.web3.currentProvider))
    metaMaskEnabled = window.localStorage.metaMaskEnabled ? true : false
  }

  setNetwork(window.localStorage.ognNetwork || 'mainnet')
}

if (typeof window !== 'undefined') {
  window.context = context
}

export default context
