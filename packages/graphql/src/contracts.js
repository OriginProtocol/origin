import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import TokenContract from '@origin/contracts/build/contracts/TestToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'
import { exchangeAbi, factoryAbi } from './contracts/UniswapExchange'

import Web3 from 'web3'
import EventSource from '@origin/eventsource'

import eventCache from './utils/eventCache'
import genericEventCache from './utils/genericEventCache'
import pubsub from './utils/pubsub'
import currencies from './utils/currencies'

import Configs from './configs'

let metaMask, metaMaskEnabled, web3WS, wsSub, web3, blockInterval

let OriginMessaging
if (typeof window !== 'undefined') {
  OriginMessaging = require('@origin/messaging-client').default
}

let OriginLinkerClient
if (typeof window !== 'undefined') {
  OriginLinkerClient = require('@origin/linker-client').default
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
  context.marketplace.eventCache.updateBlock(blockHeaders.number)
  context.identityEvents.eventCache.updateBlock(blockHeaders.number)
  context.eventSource.resetCache()
  pubsub.publish('NEW_BLOCK', {
    newBlock: { ...blockHeaders, id: blockHeaders.hash }
  })
}

function pollForBlocks() {
  blockInterval = setInterval(() => {
    web3.eth.getBlockNumber().then(block => {
      if (block > lastBlock) {
        web3.eth.getBlock(block).then(newBlock)
      }
    })
  }, 5000)
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
    typeof window !== 'undefined' &&
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
  if (net === 'test') {
    config = { ...config, ...customConfig }
  }
  context.net = net
  context.config = config
  context.automine = config.automine

  context.ipfsGateway = config.ipfsGateway
  context.ipfsRPC = config.ipfsRPC
  context.discovery = config.discovery
  context.growth = config.growth

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

  web3 = applyWeb3Hack(new Web3(config.provider))
  if (typeof window !== 'undefined') {
    window.localStorage.ognNetwork = net
    window.web3 = web3
  }
  context.web3 = web3
  context.web3Exec = web3

  if (typeof window !== 'undefined') {
    const MessagingConfig = config.messaging || DefaultMessagingConfig
    MessagingConfig.personalSign = metaMask && metaMaskEnabled ? true : false
    context.linker = OriginLinkerClient({
      httpUrl: config.linker,
      wsUrl: config.linkerWS,
      web3: context.web3
    })
    context.messaging = OriginMessaging({
      ...MessagingConfig,
      web3,
      walletLinker: context.linker
    })
  }

  context.metaMaskEnabled = metaMaskEnabled
  if (typeof window !== 'undefined' && window.localStorage.privateKeys) {
    JSON.parse(window.localStorage.privateKeys).forEach(key =>
      web3.eth.accounts.wallet.add(key)
    )
    if (window.localStorage.defaultAccount) {
      web3.eth.defaultAccount = window.localStorage.defaultAccount
    }
  }

  context.EventBlock = config.V00_Marketplace_Epoch || 0

  setMarketplace(config.V00_Marketplace, config.V00_Marketplace_Epoch)
  setIdentityEvents(config.IdentityEvents, config.IdentityEvents_Epoch)

  if (config.providerWS) {
    web3WS = applyWeb3Hack(new Web3(config.providerWS))
    context.web3WS = web3WS
    wsSub = web3WS.eth
      .subscribe('newBlockHeaders')
      .on('data', newBlock)
      .on('error', () => {
        console.log('WS connection error. Polling for new blocks...')
        pollForBlocks()
      })
  } else {
    pollForBlocks()
  }
  web3.eth.getBlockNumber().then(block => {
    web3.eth.getBlock(block).then(newBlock)
  })
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
  setLinkerClient()
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

function setLinkerClient() {
  const linkingEnabled =
    (typeof window !== 'undefined' && window.linkingEnabled) ||
    process.env.ORIGIN_LINKING ||
    context.config.linkingEnabled

  if (context.metaMaskEnabled) return
  if (!linkingEnabled) return
  if (!context.linker) return
  if (metaMask && metaMaskEnabled) return

  const linkerProvider = context.linker.getProvider()
  context.web3Exec = applyWeb3Hack(new Web3(linkerProvider))
  context.defaultLinkerAccount = '0x3f17f1962B36e491b30A40b2405849e597Ba5FB5'

  // Funnel marketplace contract transactions through mobile wallet
  context.marketplaceL = new context.web3Exec.eth.Contract(
    MarketplaceContract.abi,
    context.marketplace._address
  )
  context.marketplaceExec = context.marketplaceL

  // Funnel token contract transactions through mobile wallet
  context.ognExecL = new context.web3Exec.eth.Contract(
    OriginTokenContract.abi,
    context.ogn._address
  )
  context.ognExec = context.ognExecL

  // Funnel identity contract transactions through mobile wallet
  context.identityEventsExecL = new context.web3Exec.eth.Contract(
    IdentityEventsContract.abi,
    context.identityEvents._address
  )
  context.identityEventsExec = context.identityEventsExecL

  if (context.messaging) {
    context.messaging.web3 = context.web3Exec
  }

  context.linker.start()
}

export function toggleMetaMask(enabled) {
  if (typeof window === 'undefined') {
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
  context.marketplace.eventCache = eventCache(
    context.marketplace,
    epoch,
    context.web3,
    context.config
  )
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
  context.identityEvents.eventCache = genericEventCache(
    context.identityEvents,
    epoch,
    context.web3,
    context.config,
    context.config.IdentityEvents_EventCache
  )
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

export function shutdown() {
  if (wsSub) {
    wsSub.unsubscribe()
    web3WS.currentProvider.connection.close()
  }
  clearInterval(blockInterval)
  clearInterval(currencies.interval)
}

if (typeof window !== 'undefined') {
  if (window.ethereum) {
    metaMask = applyWeb3Hack(new Web3(window.ethereum))
    metaMaskEnabled = window.localStorage.metaMaskEnabled ? true : false
  } else if (window.web3) {
    metaMask = applyWeb3Hack(new Web3(window.web3.currentProvider))
    metaMaskEnabled = window.localStorage.metaMaskEnabled ? true : false
  }

  setNetwork(window.localStorage.ognNetwork || 'mainnet')

  window.context = context
}

export default context
