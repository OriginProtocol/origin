require('dotenv').config()
const fetch = require('node-fetch')
const memoize = require('lodash/memoize')
const { IS_PROD } = require('./utils/const')

const defaultNetwork = IS_PROD ? '4' : '999'

const Defaults = {
  '999': {
    ipfsGateway: 'http://localhost:8080',
    ipfsApi: 'http://localhost:5002',
    provider: 'ws://localhost:8545'
  },
  '4': {
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsApi: 'https://ipfs.staging.originprotocol.com',
    marketplace: '0x3d608cce08819351ada81fc1550841ebc10686fd',
    fetchPastLogs: true
  },
  '1': {
    ipfsGateway: 'https://ipfs.originprotocol.com',
    ipfsApi: 'https://ipfs.originprotocol.com',
    marketplace: '0x698ff47b84837d3971118a369c570172ee7e54c2',
    fetchPastLogs: true
  }
}

const getSiteConfig = memoize(async function getSiteConfig(dataURL, networkId) {
  const url = `${dataURL}config.json`
  const dataRaw = await fetch(url)
  const data = await dataRaw.json()
  const defaultData = Defaults[networkId || defaultNetwork] || {}
  const networkData = data.networks[networkId || defaultNetwork] || {}
  const siteConfig = {
    provider: process.env.PROVIDER,
    ...data,
    ...defaultData,
    ...networkData
  }
  return siteConfig
})

module.exports = {
  getSiteConfig,
  provider: process.env.PROVIDER
}

// const Configs = {
//   localhost: {
//     ipfsGateway: 'http://localhost:8080',
//     ipfsApi: 'http://localhost:5002',
//     provider: 'ws://localhost:8545',
//     marketplace: localContractAddress
//   },
//   rinkeby: {
//     ipfsGateway: 'https://ipfs.staging.originprotocol.com',
//     ipfsApi: 'https://ipfs.staging.originprotocol.com',
//     provider: `wss://eth-rinkeby.ws.alchemyapi.io/ws/${AlchemyKey}`,
//     marketplace: '0x3d608cce08819351ada81fc1550841ebc10686fd',
//     fetchPastLogs: true
//   },
//   mainnet: {
//     ipfsGateway: 'https://ipfs.originprotocol.com',
//     ipfsApi: 'https://ipfs.originprotocol.com',
//     provider: `wss://eth-mainnet.ws.alchemyapi.io/ws/${AlchemyKey}`,
//     backend: '',
//     marketplace: '0x698ff47b84837d3971118a369c570172ee7e54c2',
//     fetchPastLogs: true
//   }
// }

// const SiteData = {
//   brave: {
//     dataDir: 'brave',
//     title: 'Brave Swag Store',
//     email: 'Brave Swag <swag@originprotocol.com>',
//     emailSubject: 'Your Brave Swag',
//     storeUrl: 'https://www.ethswag.com',
//     productUrl: 'https://www.ethswag.com/products/',
//     emailAssets: 'https://www.ethswag.com/products',
//     contentHash: 'QmP5ynAZ7akpjUnfSjHXme2nTQGF5hvn7ZSEnYWjdDE66j'
//   },
//   origin: {
//     dataDir: 'origin',
//     title: 'Swag',
//     fullTitle: 'Origin Swag',
//     byline: 'Free shipping on all orders! 🚚💨',
//     email: 'Origin Swag <help@originswag.com>',
//     emailSubject: '🦄🌈 Your Origin Swag!',
//     storeUrl: 'https://www.originswag.com',
//     productUrl: 'https://www.originswag.com/origin/',
//     emailAssets: 'https://www.originswag.com/origin',
//     logo: 'logo.svg',
//     css: 'style.css',
//     twitter: 'https://twitter.com/originprotocol',
//     medium: 'https://medium.com/originprotocol',
//     instagram: 'https://www.instagram.com/originprotocol',
//     localhost: {
//       backend: 'http://localhost:3000'
//     },
//     rinkeby: {
//       backend: 'https://origin-pay.herokuapp.com'
//     },
//     mainnet: {
//       backend: 'https://origin-pay.herokuapp.com'
//     }
//   },
//   gitcoin: {
//     dataDir: 'gitcoin',
//     title: 'Gitcoin Schwag Store',
//     byline:
//       'Support the supporters of Open Source Sustainability (and look good while doing it) 😎',
//     email: 'Gitcoin Schwag Store <help@ethswag.com>',
//     emailSubject: '🦄🌈 Your Gitcoin Schwag!',
//     storeUrl: 'https://www.ethswag.com/gitcoin',
//     productUrl: 'https://www.ethswag.com/gitcoin/products/',
//     emailAssets: 'https://www.ethswag.com/gitcoin/products',
//     logo: 'logo.png',
//     css: 'style.css',
//     contentHash: 'QmTBTU8SmUbX32UHRmW13WviUE5wqMJBsW9V4RaVUBfKyP',
//     localhost: {
//       backend: 'http://localhost:3000'
//     },
//     rinkeby: {
//       backend: 'https://gitcoin-pay.herokuapp.com'
//     },
//     mainnet: {
//       backend: 'https://gitcoin-pay.herokuapp.com'
//     }
//   },
//   ethereum: {
//     dataDir: 'ef',
//     title: 'Ethporeum',
//     byline:
//       'Serving the finest Ethereum swag since block <a href="https://etherscan.io/block/4832686">4832686</a>.',
//     email: 'Ethereum Swag Store <help@ethswag.com>',
//     emailSubject: '🦄🌈 Your Ethereum Swag!',
//     storeUrl: 'https://www.ethswag.com',
//     productUrl: 'https://www.ethswag.com/products/',
//     emailAssets: 'https://www.ethswag.com/products',
//     logo: 'logo.svg',
//     contentHash: 'QmNod6kFeaNMdtNxMBe3KVxtGKhpdQKzwoisfTVrSwiBW4'
//   },
//   ethhub: {
//     dataDir: 'ethhub',
//     title: 'EthHub',
//     email: 'EthHub Swag Store <help@ethswag.com>',
//     emailSubject: '🦄🌈 Your Ethereum Swag!',
//     storeUrl: 'https://www.ethswag.com',
//     productUrl: 'https://www.ethswag.com/products/',
//     emailAssets: 'https://www.ethswag.com/products'
//   }
// }

// module.exports = function() {
//   if (!Configs[network] || !SiteData[site]) {
//     process.exit(`No config for network ${network}`)
//   }
//   const siteNet = SiteData[site][network] || {}
//   const siteData = { ...SiteData[site], ...siteNet }
//   return { ...Configs[network], network, siteData }
// }
