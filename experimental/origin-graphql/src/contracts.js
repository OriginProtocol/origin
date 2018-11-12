import MarketplaceContract from 'origin-contracts/build/contracts/V00_Marketplace'
import UserRegistryContract from 'origin-contracts/build/contracts/V00_UserRegistry'
import ClaimHolderRegisteredContract from 'origin-contracts/build/contracts/ClaimHolderRegistered'
import OriginTokenContract from 'origin-contracts/build/contracts/OriginToken'
import TokenContract from 'origin-contracts/build/contracts/StandardToken'

import Web3 from 'web3'
import eventCache from './utils/eventCache'
import pubsub from './utils/pubsub'
import EventSource from './utils/OriginEventSource'

import msg from './utils/messagingInstance'

let metaMask, metaMaskEnabled, web3WS, wsSub
const HOST = process.env.HOST || 'localhost'

const Configs = {
  mainnet: {
    provider: 'https://mainnet.infura.io',
    providerWS: 'wss://mainnet.infura.io/ws',
    ipfsGateway: 'https://ipfs.originprotocol.com',
    ipfsRPC: `https://ipfs.originprotocol.com`,
    V00_UserRegistry: '0xa4428439ec214cc68240552ec93298d1da391114',
    OriginIdentity: '0x1af44feeb5737736b6beb42fe8e5e6b7bb7391cd',
    OriginToken: '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26',
    V00_Marketplace: '0x819bb9964b6ebf52361f1ae42cf4831b921510f9',
    V00_Marketplace_Epoch: '6436157',
    tokens: [
      {
        id: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        type: 'Standard',
        name: 'DAI Stablecoin',
        symbol: 'DAI',
        decimals: '18'
      }
    ]
  },
  rinkeby: {
    provider: 'https://rinkeby.infura.io',
    providerWS: 'wss://rinkeby.infura.io/ws',
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsRPC: `https://ipfs.staging.originprotocol.com`,
    V00_UserRegistry: '0x56727c8a51b276aec911afa8d6d80d485c89d5cc',
    OriginIdentity: '0x8a294aaece85ca472f09ab6c09d75448bf3b25c1',
    OriginToken: '0xa115e16ef6e217f7a327a57031f75ce0487aadb8',
    V00_Marketplace: '0xe842831533c4bf4b0f71b4521c4320bdb669324e',
    V00_Marketplace_Epoch: '3086315'
  },
  rinkebyTst: {
    provider: 'https://rinkeby.infura.io',
    providerWS: 'wss://rinkeby.infura.io/ws',
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsRPC: `https://ipfs.staging.originprotocol.com`
  },
  kovanTst: {
    provider: 'https://kovan.infura.io',
    providerWS: 'wss://kovan.infura.io/ws',
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsRPC: `https://ipfs.staging.originprotocol.com`,
    OriginToken: '0x0EF2f63397657DD71384C8c26F81deE23bA9c6dC',
    V00_Marketplace: '0x72184988E5b102D32439c475E714b482D7E270df'
  },
  localhost: {
    provider: `http://${HOST}:8545`,
    providerWS: `ws://${HOST}:8545`,
    ipfsGateway: `http://${HOST}:9090`,
    ipfsRPC: `http://${HOST}:5002`,
    automine: true
  }
}

const context = {}

msg.events.on('initialized', accountKey => {
  console.log('Messaging initialized', accountKey)
})
msg.events.on('new', accountKey => {
  console.log('Messaging new', accountKey)
})

// detect existing messaging account
msg.events.on('ready', accountKey => {
  console.log('Messaging ready', accountKey)
})
// detect existing messaging account
msg.events.on('pending_conv', conv => {
  console.log('Messaging pending_conv', conv)
})

// detect new decrypted messages
msg.events.on('msg', obj => {
  console.log('Messaging msg', obj)
  // if (obj.decryption) {
  //   const { roomId, keys } = obj.decryption
  //
  //   origin.messaging.initRoom(roomId, keys)
  // }
  //
  // this.props.addMessage(obj)
  //
  // this.debouncedFetchUser(obj.senderAddress)
})

// To Do: handle incoming messages when no Origin Messaging Private Key is available
msg.events.on('emsg', obj => {
  console.error('A message has arrived that could not be decrypted:', obj)
})

function applyWeb3Hack(web3Instance) {
  web3Instance.eth.abi.decodeParameters = function(outputs, bytes) {
    if (bytes === '0x') bytes = '0x00'
    return web3Instance.eth.abi.__proto__.decodeParameters(outputs, bytes)
  }
  return web3Instance
}

export function setNetwork(net) {
  const config = JSON.parse(JSON.stringify(Configs[net]))
  if (!config) {
    return
  }
  if (net === 'localhost') {
    config.OriginToken = window.localStorage.OGNContract
    config.V00_Marketplace = window.localStorage.marketplaceContract
    config.V00_UserRegistry = window.localStorage.userRegistryContract
  }
  context.net = net
  context.automine = config.automine

  context.ipfsGateway = config.ipfsGateway
  context.ipfsRPC = config.ipfsRPC

  window.localStorage.ognNetwork = net

  delete context.marketplace
  delete context.marketplaceExec
  delete context.ogn
  delete context.ognExec
  delete context.marketplaces
  delete context.tokens
  delete context.claimHolderRegistered
  delete context.metaMask
  if (wsSub) {
    wsSub.unsubscribe()
  }

  window.web3 = applyWeb3Hack(new Web3(config.provider))
  context.web3Exec = web3

  context.messaging = msg
  msg.web3 = web3

  context.metaMaskEnabled = metaMaskEnabled
  web3WS = applyWeb3Hack(new Web3(config.providerWS))
  if (window.localStorage.privateKeys) {
    JSON.parse(window.localStorage.privateKeys).forEach(key =>
      web3.eth.accounts.wallet.add(key)
    )
    web3.eth.defaultAccount = window.localStorage.defaultAccount
  }

  context.EventBlock = config.V00_Marketplace_Epoch || 0

  context.claimHolderRegistered = new web3.eth.Contract(
    ClaimHolderRegisteredContract.abi
  )

  context.userRegistry = new web3.eth.Contract(
    UserRegistryContract.abi,
    config.V00_UserRegistry
  )
  context.marketplace = new web3.eth.Contract(
    MarketplaceContract.abi,
    config.V00_Marketplace
  )
  context.marketplace.eventCache = eventCache(
    context.marketplace,
    config.V00_Marketplace_Epoch
  )
  if (config.V00_Marketplace) {
    context.marketplaces = [context.marketplace]
  } else {
    context.marketplaces = []
  }

  context.eventSource = new EventSource({
    marketplaceContract: context.marketplace,
    ipfsGateway: context.ipfsGateway
  })

  wsSub = web3WS.eth.subscribe('newBlockHeaders').on('data', blockHeaders => {
    context.marketplace.eventCache.updateBlock(blockHeaders.number)
    pubsub.publish('NEW_BLOCK', {
      newBlock: { ...blockHeaders, id: blockHeaders.hash }
    })
  })
  web3.eth.getBlockNumber().then(block => {
    web3.eth.getBlock(block).then(blockHeaders => {
      if (blockHeaders) {
        context.marketplace.eventCache.updateBlock(blockHeaders.number)
        pubsub.publish('NEW_BLOCK', {
          newBlock: { ...blockHeaders, id: blockHeaders.hash }
        })
      }
    })
  })

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

  if (metaMask) {
    context.metaMask = metaMask
    context.marketplaceMM = new metaMask.eth.Contract(
      MarketplaceContract.abi,
      config.V00_Marketplace
    )
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
}

function setMetaMask() {
  if (metaMask && metaMaskEnabled) {
    context.metaMaskEnabled = true
    context.web3Exec = metaMask
    context.marketplaceExec = context.marketplaceMM
    context.ognExec = context.ognMM
    context.tokens.forEach(token => (token.contractExec = token.contractMM))
  } else {
    context.metaMaskEnabled = false
    context.web3Exec = web3
    context.marketplaceExec = context.marketplace
    context.ognExec = context.ogn
    context.tokens.forEach(token => (token.contractExec = token.contract))
  }
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

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'CSS') {
  if (window.ethereum) {
    metaMask = applyWeb3Hack(new Web3(window.ethereum))
    metaMaskEnabled = window.localStorage.metaMaskEnabled ? true : false
  }

  setNetwork(window.localStorage.ognNetwork || 'mainnet')

  window.context = context
}

export default context
