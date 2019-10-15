import fetch from 'cross-fetch'
import Web3 from 'web3'
import get from 'lodash/get'

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import TokenContract from '@origin/contracts/build/contracts/TestToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'
import IdentityProxyFactory from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import { exchangeAbi, factoryAbi } from './contracts/UniswapExchange'

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

async function isValidContract(web3, contract, name) {
  const address = get(contract, 'options.address')
  if (!address) return false
  let valid
  try {
    const code = await web3.eth.getCode(address)
    valid = code && typeof code === 'string' && code.length > 2
  } catch (err) {
    console.debug(err)
  }
  if (!valid) console.error(`${name} contract appears to be invalid!`)
}

let lastBlock

export function newBlock(blockNumber) {
  if (blockNumber <= lastBlock) return
  lastBlock = blockNumber
  Object.keys(context.marketplaces || {}).forEach(version => {
    context.marketplaces[version].contract.eventCache.setLatestBlock(
      blockNumber
    )
    context.marketplaces[version].eventSource.resetCache()
  })

  if (context.identityEvents) {
    context.identityEvents.eventCache.setLatestBlock(blockNumber)
  }
  if (context.ProxyFactory) {
    context.ProxyFactory.eventCache.setLatestBlock(blockNumber)
  }

  pubsub.publish('NEW_BLOCK', { newBlock: { id: blockNumber } })
}

const blockQuery = `query BlockNumber { web3 { blockNumber } }`
function queryForBlocks() {
  let inProgress = false
  try {
    blockInterval = setInterval(() => {
      if (inProgress) {
        return
      }
      inProgress = true
      fetch(`${context.config.graphql}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operationName: 'BlockNumber',
          variables: {},
          query: blockQuery
        })
      })
        .then(resp => {
          resp.json().then(result => {
            const blockNumber = get(result, 'data.web3.blockNumber')
            if (blockNumber > lastBlock) {
              newBlock(blockNumber)
            }
          })
          inProgress = false
        })
        .catch(err => {
          console.log(err)
          inProgress = false
        })
    }, 5000)
  } catch (error) {
    console.log(`Querying for new blocks failed: ${error}`)
    inProgress = false
  }
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
        .then(blockNumber => {
          if (blockNumber > lastBlock) {
            newBlock(blockNumber)
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
  if (net !== 'mainnet') console.debug(`Connecting to network ${net}`)
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
  context.networkId = config.networkId
  context.config = config
  context.automine = config.automine

  context.ipfsGateway = config.ipfsGateway
  context.ipfsRPC = config.ipfsRPC
  context.discovery = config.discovery
  context.growth = config.growth
  context.graphql = config.graphql

  delete context.marketplace
  delete context.marketplaceVersionByAddress
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
  } else if (!isBrowser && !isWebView) {
    // TODO: Allow for browser?
    createEngine(web3, {
      qps,
      maxConcurrent,
      ethGasStation: ['mainnet', 'rinkeby'].includes(net)
    })
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
      mobileBridge: context.mobileBridge,
      pubsub: pubsub
    })
  }

  context.metaMaskEnabled = metaMaskEnabled
  if (isBrowser && window.localStorage.privateKeys) {
    JSON.parse(window.localStorage.privateKeys).forEach(key =>
      web3.eth.accounts.wallet.add(key)
    )
  }

  let largestMarketVersion
  Object.keys(config)
    .sort()
    .forEach(k => {
      const marketVersionResult = k.match(/^V([0-9]+)_Marketplace$/)
      if (marketVersionResult) {
        const marketVersion = marketVersionResult[1]
        largestMarketVersion = largestMarketVersion === undefined || largestMarketVersion < marketVersion ?
          parseInt(marketVersion) :
          largestMarketVersion
        setMarketplace(config[k], config[`${k}_Epoch`], `0${marketVersion}`)
      }
    })

  if (!config.marketplaceVersion) {
    config.marketplaceVersion = largestMarketVersion.toString().padStart(3, '0')
  }

  setIdentityEvents(config.IdentityEvents, config.IdentityEvents_Epoch)

  setProxyContracts(config)

  if (config.performanceMode && context.config.graphql && net !== 'test') {
    queryForBlocks()
  } else if (config.providerWS) {
    web3WS = applyWeb3Hack(new Web3(config.providerWS))
    context.web3WS = web3WS
    try {
      wsSub = web3WS.eth
        .subscribe('newBlockHeaders')
        .on('data', latestBlock => newBlock(latestBlock.number))
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
    web3.eth.getBlockNumber().then(newBlock)
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

  // Do a little contract validation
  if (net !== 'mainnet') {
    Object.keys(context.marketplaces || {}).forEach(version => {
      const marketplace = context.marketplaces[version].contract
      isValidContract(web3, marketplace, `Marketplace V${version}`)
    })
    isValidContract(web3, context.identityEvents, 'IdentityEvents')
    isValidContract(web3, context.ProxyFactory, 'ProxyFactory')
    isValidContract(web3, context.ProxyImp, 'ProxyImp')
  }
}

function setMetaMask() {
  if (metaMask && metaMaskEnabled) {
    context.metaMaskEnabled = true
    context.web3Exec = metaMask
    context.marketplaceExec = context.marketplaceMM
    Object.keys(context.marketplaces || {}).forEach(
      version =>
        (context.marketplaces[version].contractExec =
          context.marketplaces[version].contractMM)
    )
    context.ognExec = context.ognMM
    context.tokens.forEach(token => (token.contractExec = token.contractMM))
    context.daiExchangeExec = context.daiExchangeMM
  } else {
    context.metaMaskEnabled = false
    context.web3Exec = web3
    Object.keys(context.marketplaces || {}).forEach(
      version =>
        (context.marketplaces[version].contractExec =
          context.marketplaces[version].contract)
    )
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

  Object.values(context.marketplaces).forEach(marketplace => {
    marketplace.contract = context.marketplaceExec
    marketplace.contractExec = context.marketplaceExec
  })

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

export function setMarketplace(address, epoch, version = '000') {
  if (!address) return
  address = web3.utils.toChecksumAddress(address)
  const contract = new web3.eth.Contract(MarketplaceContract.abi, address)

  try {
    patchWeb3Contract(contract, epoch, {
      useLatestFromChain: false,
      ipfsEventCache:
        context.config[`V${version.slice(1)}_Marketplace_EventCache`],
      cacheMaxBlock:
        context.config[`V${version.slice(1)}_Marketplace_EventCacheMaxBlock`],
      prefix:
        typeof address === 'undefined'
          ? 'Marketplace_'
          : `${address.slice(2, 8)}_`,
      platform:
        typeof window === 'undefined'
          ? process.env.EVENTCACHE_ENABLE_PG
            ? 'postgresql'
            : 'memory'
          : 'browser',
      ...context.config
    })
  } catch (err) {
    console.error('Unable to initialize EventCache for Marketplace')
    throw err
  }

  context.marketplace = contract

  const eventSource = new EventSource({
    marketplaceContract: contract,
    ipfsGateway: context.ipfsGateway,
    web3: context.web3,
    version
  })
  context.eventSource = eventSource
  context.marketplaceExec = context.marketplace

  context.marketplaces = context.marketplaces || {}
  context.marketplaces[version] = {
    address,
    epoch,
    eventSource,
    contract,
    contractExec: contract
  }
  context.marketplaceVersionByAddress =
    context.marketplaceVersionByAddress || {}
  context.marketplaceVersionByAddress[address] = version

  if (metaMask) {
    const contractMM = new metaMask.eth.Contract(
      MarketplaceContract.abi,
      address
    )
    context.marketplaces[version].contractMM = contractMM
    if (metaMaskEnabled) {
      context.marketplaceExec = contractMM
      context.marketplaces[version].contractExec = contractMM
    }
  }
}

export function setIdentityEvents(address, epoch) {
  if (!address) return
  address = web3.utils.toChecksumAddress(address)
  context.identityEvents = new web3.eth.Contract(
    IdentityEventsContract.abi,
    address
  )

  try {
    patchWeb3Contract(context.identityEvents, epoch, {
      ipfsEventCache: context.config.IdentityEvents_EventCache,
      cacheMaxBlock: context.config.IdentityEvents_EventCacheMaxBlock,
      useLatestFromChain: false,
      prefix:
        typeof address === 'undefined'
          ? 'IdentityEvents_'
          : `${address.slice(2, 8)}_`,
      platform:
        typeof window === 'undefined'
          ? process.env.EVENTCACHE_ENABLE_PG
            ? 'postgresql'
            : 'memory'
          : 'browser',
      batchSize: 2500,
      ...context.config
    })
  } catch (err) {
    console.error('Unable to initialize EventCache for IdentityEvents')
    throw err
  }

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
  if (!config.ProxyFactory) return
  context.ProxyFactory = new web3.eth.Contract(
    IdentityProxyFactory.abi,
    config.ProxyFactory
  )
  context.ProxyImp = new web3.eth.Contract(
    IdentityProxy.abi,
    config.IdentityProxyImplementation
  )
  // Add an event cache to ProxyFactory.
  try {
    patchWeb3Contract(context.ProxyFactory, config.ProxyFactory_Epoch, {
      ipfsEventCache: null, // TODO add IPFS cache after Meta-txn launch, once we have a non trivial number of events.
      cacheMaxBlock: null,
      useLatestFromChain: false,
      prefix:
        typeof config.ProxyFactory === 'undefined'
          ? 'ProxyFactory_'
          : `${config.ProxyFactory.slice(2, 8)}_`,
      platform:
        typeof window === 'undefined'
          ? process.env.EVENTCACHE_ENABLE_PG
            ? 'postgresql'
            : 'memory'
          : 'browser',
      batchSize: 2500,
      ...context.config
    })
  } catch (err) {
    console.error('Unable to initialize EventCache for ProxyFactory')
    throw err
  }
}

export function shutdown() {
  if (web3.currentProvider.stop) web3.currentProvider.stop()
  if (wsSub) {
    wsSub.unsubscribe()
  }
  if (web3WS && web3WS.currentProvider) {
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
