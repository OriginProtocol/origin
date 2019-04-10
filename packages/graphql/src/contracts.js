import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import TokenContract from '@origin/contracts/build/contracts/TestToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'
import { exchangeAbi, factoryAbi } from './contracts/UniswapExchange'

import Web3 from 'web3'
import EventSource from '@origin/eventsource'
import get from 'lodash/get'

import eventCache from './utils/eventCache'
import genericEventCache from './utils/genericEventCache'
import pubsub from './utils/pubsub'

let metaMask, metaMaskEnabled, web3WS, wsSub, web3, blockInterval
const HOST = process.env.HOST || 'localhost'
// We need a separate LINKER_HOST for the mobile wallet, because cookie sharing
// between http and ws only works when using non-localhost linker URLs. At the
// same time, js-ipfs only works for non-secure http when the URL is localhost.
// So, the hostname in the DApp URL can't be the same as the linker hostname
// when testing locally.
const LINKER_HOST = process.env.LINKER_HOST || HOST

let OriginMessaging
if (typeof window !== 'undefined') {
  OriginMessaging = require('@origin/messaging-client').default
}

let OriginLinkerClient
if (typeof window !== 'undefined') {
  OriginLinkerClient = require('@origin/linker-client').default
}

const Configs = {
  mainnet: {
    // provider:
    //   'https://eth-mainnet.alchemyapi.io/jsonrpc/FCA-3myPH5VFN8naOWyxDU6VkxelafK6',
    provider: 'https://mainnet.infura.io/v3/98df57f0748e455e871c48b96f2095b2',
    // providerWS: 'wss://mainnet.infura.io/ws',
    ipfsGateway: 'https://ipfs.originprotocol.com',
    ipfsRPC: 'https://ipfs.originprotocol.com',
    discovery: 'https://discovery.originprotocol.com',
    growth: 'https://growth.originprotocol.com',
    bridge: 'https://bridge.originprotocol.com',
    IdentityEvents: '0x8ac16c08105de55a02e2b7462b1eec6085fa4d86',
    IdentityEvents_Epoch: '7046530',
    IdentityEvents_EventCache: 'QmYu5bTLHYnFMCxgnWd6ywfasQQCeKbkzrU2UJAedycKQL',
    attestationIssuer: '0x8EAbA82d8D1046E4F242D4501aeBB1a6d4b5C4Aa',
    OriginToken: '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26',
    V00_Marketplace: '0x819bb9964b6ebf52361f1ae42cf4831b921510f9',
    V00_Marketplace_Epoch: '6436157',
    ipfsEventCache: 'QmWyqzZMoQB1zzxJyCAhTZ5XenzX5H8sfE3Uh58uEN3MJh',
    messagingAccount: '0xBfDd843382B36FFbAcd00b190de6Cb85ff840118',
    messaging: {
      messagingNamespace: 'origin',
      globalKeyServer: 'https://messaging.originprotocol.com'
    },
    tokens: [
      {
        id: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        type: 'Standard',
        name: 'DAI Stablecoin',
        symbol: 'DAI',
        decimals: '18'
      },
      {
        id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        type: 'Standard',
        name: 'USDC Stablecoin',
        symbol: 'USDC',
        decimals: '6'
      },
      {
        id: '0x056fd409e1d7a124bd7017459dfea2f387b6d5cd',
        type: 'Standard',
        name: 'Gemini Dollar',
        symbol: 'GUSD',
        decimals: '2'
      }
    ],
    DaiExchange: '0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14',
    affiliate: '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8',
    arbitrator: '0x64967e8cb62b0cd1bbed27bee4f0a6a2e454f06a',
    linker: `https://linking.originprotocol.com`,
    linkerWS: `wss://linking.originprotocol.com`
  },
  rinkeby: {
    provider:
      'https://eth-rinkeby.alchemyapi.io/jsonrpc/D0SsolVDcXCw6K6j2LWqcpW49QIukUkI',
    // provider: 'https://rinkeby.infura.io',
    // providerWS: 'wss://rinkeby.infura.io/ws',
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsRPC: `https://ipfs.staging.originprotocol.com`,
    discovery: 'https://discovery.staging.originprotocol.com',
    growth: 'https://growth.staging.originprotocol.com',
    bridge: 'https://bridge.staging.originprotocol.com',
    IdentityEvents: '0x160455a06d8e5aa38862afc34e4eca0566ee4e7e',
    IdentityEvents_Epoch: '3670528',
    OriginToken: '0xa115e16ef6e217f7a327a57031f75ce0487aadb8',
    V00_Marketplace: '0xe842831533c4bf4b0f71b4521c4320bdb669324e',
    V00_Marketplace_Epoch: '3086315',
    ipfsEventCache: 'QmYqzB3WE4YzyxD9ptQnG6UURw1CR1hj1siqVry4Da2GLx',
    affiliate: '0xc1a33cda27c68e47e370ff31cdad7d6522ea93d5',
    arbitrator: '0xc9c1a92ba54c61045ebf566b154dfd6afedea992',
    messaging: {
      messagingNamespace: 'origin:staging',
      globalKeyServer: 'https://messaging.staging.originprotocol.com'
    },
    messagingAccount: '0xA9F10E485DD35d38F962BF2A3CB7D6b58585D591',
    linker: `https://linking.staging.originprotocol.com`,
    linkerWS: `wss://linking.staging.originprotocol.com`,
    linkingEnabled: true,
    DaiExchange: '0x77dB9C915809e7BE439D2AB21032B1b8B58F6891',
    tokens: [
      {
        id: '0x2448eE2641d78CC42D7AD76498917359D961A783',
        type: 'Standard',
        name: 'DAI Stablecoin',
        symbol: 'DAI',
        decimals: '18'
      }
    ]
  },
  rinkebyTst: {
    provider: 'https://rinkeby.infura.io',
    // providerWS: 'wss://rinkeby.infura.io/ws',
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsRPC: `https://ipfs.staging.originprotocol.com`,
    bridge: 'https://bridge.staging.originprotocol.com'
  },
  kovanTst: {
    provider: 'https://kovan.infura.io',
    // providerWS: 'wss://kovan.infura.io/ws/v3/98df57f0748e455e871c48b96f2095b2',
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsRPC: `https://ipfs.staging.originprotocol.com`,
    bridge: 'https://bridge.staging.originprotocol.com',
    OriginToken: '0xb0efa5A1f199B7562Dd4f34758497594797C05E9',
    V00_Marketplace: '0xaE145bE14b9369fE5DF917B58daDe2589ddB48C9',
    ipfsEventCache: 'QmaXMXUws4mq6MQ114Pjqv25hhpYdS6P6cD1z4x5R2ZAja',
    V00_Marketplace_Epoch: '10329348',
    IdentityEvents: '0x967DB2Ed91000efA8d5Ce860d5A8B34a6BCfb6E2',
    IdentityEvents_Epoch: '10339753',
    IdentityEvents_EventCache: 'QmQ5vJa5oFy9rj3E9aEtVb637G3xiJLnHFyAuwvwfj6XTN',
    affiliate: '0x51d7b9FeC7596d573879B4ADFe6700b1CD47C16C',
    arbitrator: '0x51d7b9FeC7596d573879B4ADFe6700b1CD47C16C'
  },
  origin: {
    provider: 'https://testnet.originprotocol.com/rpc',
    ipfsGateway: 'https://ipfs.dev.originprotocol.com',
    ipfsRPC: 'https://ipfs.dev.originprotocol.com',
    discovery: 'https://discovery.dev.originprotocol.com',
    growth: 'https://growth.dev.originprotocol.com',
    OriginToken: '0xc341384f6fe00179b33ef7ae638ed2937a9e4501',
    V00_Marketplace: '0xf3884ecbc6c43383bf7a38c891021380f50abc49',
    V00_Marketplace_Epoch: '0',
    IdentityEvents: '0xe760d066bd8bbe22d7e9d8107be878102bd8d57d',
    IdentityEvents_Epoch: '0',
    affiliate: '0x1E3844b4752172B6E85F390E2DF4FfC4D63425f9',
    arbitrator: '0x1E3844b4752172B6E85F390E2DF4FfC4D63425f9',
    DaiExchange: '0xD4fbAF1dFe100d07f8Ef73d8c92e93d0Bcf7b45D',
    tokens: [
      {
        id: '0xB9B7e0cb2EDF5Ea031C8B297A5A1Fa20379b6A0a',
        type: 'Standard',
        name: 'DAI Stablecoin',
        symbol: 'DAI',
        decimals: '18'
      }
    ]
  },
  localhost: {
    provider: `http://${HOST}:8545`,
    providerWS: `ws://${HOST}:8545`,
    ipfsGateway: `http://${HOST}:8080`,
    ipfsRPC: `http://${HOST}:5002`,
    bridge: 'https://bridge.dev.originprotocol.com',
    automine: 2000,
    affiliate: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
    attestationIssuer: '0x5be37555816d258f5e316e0f84D59335DB2400B2',
    arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    linker: `http://${LINKER_HOST}:3008`,
    linkerWS: `ws://${LINKER_HOST}:3008`
  },
  truffle: {
    provider: `http://${HOST}:8545`,
    providerWS: `ws://${HOST}:8545`,
    ipfsGateway: `http://${HOST}:8080`,
    ipfsRPC: `http://${HOST}:5002`,
    growth: `http://${HOST}:4001`,
    bridge: 'https://bridge.staging.originprotocol.com',
    automine: 2000,
    OriginToken: get(OriginTokenContract, 'networks.999.address'),
    V00_Marketplace: get(MarketplaceContract, 'networks.999.address'),
    IdentityEvents: get(IdentityEventsContract, 'networks.999.address'),
    affiliate: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    attestationIssuer: '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101',
    arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    linker: `http://${LINKER_HOST}:3008`,
    linkerWS: `ws://${LINKER_HOST}:3008`,
    messaging: {
      globalKeyServer: 'http://localhost:6647'
    }
  },
  docker: {
    provider: get(process.env, 'PROVIDER_URL', `http://localhost:8545`),
    providerWS: get(process.env, 'PROVIDER_WS_URL', `ws://localhost:8545`),
    ipfsGateway: get(process.env, 'IPFS_GATEWAY_URL', `http://localhost:9999`),
    ipfsRPC: get(process.env, 'IPFS_API_URL', `http://localhost:9999`),
    bridge: 'http://localhost:5000',
    growth: 'http://localhost:4001',
    discovery: 'http://localhost:4000/graphql',
    automine: 2000,
    OriginToken: get(OriginTokenContract, 'networks.999.address'),
    V00_Marketplace: get(MarketplaceContract, 'networks.999.address'),
    IdentityEvents: get(IdentityEventsContract, 'networks.999.address'),
    affiliate: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
    arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    messaging: {
      messagingNamespace: 'origin:docker',
      globalKeyServer: 'http://localhost:6647'
    }
  },
  test: {
    provider: `http://${HOST}:8545`,
    providerWS: `ws://${HOST}:8545`,
    ipfsGateway: `http://${HOST}:8080`,
    ipfsRPC: `http://${HOST}:5002`,
    affiliate: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
    attestationIssuer: '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101',
    arbitrator: '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    automine: 500
  }
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
    if (typeof window !== 'undefined') {
      config.OriginToken = window.localStorage.OGNContract
      config.V00_Marketplace = window.localStorage.marketplaceContract
      config.IdentityEvents = window.localStorage.identityEventsContract
      config.DaiExchange = window.localStorage.uniswapDaiExchange
    }
  } else if (net === 'localhost') {
    config.OriginToken = window.localStorage.OGNContract
    config.V00_Marketplace = window.localStorage.marketplaceContract
    config.IdentityEvents = window.localStorage.identityEventsContract
    config.DaiExchange = window.localStorage.uniswapDaiExchange
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

  if (typeof window !== 'undefined') {
    if (config.providerWS) {
      web3WS = applyWeb3Hack(new Web3(config.providerWS))
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
  }

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
