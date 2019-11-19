const network =
  process.env.NETWORK || process.env.NODE_ENV === 'production'
    ? 'rinkeby'
    : 'localhost'
const site = process.env.SITE || 'ethereum'
const AlchemyKey = process.env.ALCHEMY_KEY

let localContractAddress
try {
  const Addresses = require(`@origin/contracts/build/contracts.json`)
  localContractAddress = Addresses.Marketplace_V01
} catch (e) {
  /* Ignore */
}

const Configs = {
  localhost: {
    netId: 999,
    ipfsGateway: 'http://localhost:8080',
    ipfsApi: 'http://localhost:5002',
    providerWs: 'ws://localhost:8545',
    provider: 'http://localhost:8545',
    backend: 'http://localhost:3000',
    paymentUrl: 'http://localhost:3000/pay',
    marketplace: localContractAddress
  },
  rinkeby: {
    netId: 4,
    ipfsGateway: 'https://ipfs.staging.originprotocol.com',
    ipfsApi: 'https://ipfs.staging.originprotocol.com',
    providerWs: `wss://eth-rinkeby.ws.alchemyapi.io/ws/${AlchemyKey}`,
    provider: `https://eth-rinkeby.alchemyapi.io/jsonrpc/${AlchemyKey}`,
    paymentUrl: 'https://origin-pay.herokuapp.com/pay',
    backend: 'https://origin-pay.herokuapp.com',
    marketplace: '0x3d608cce08819351ada81fc1550841ebc10686fd',
    fetchPastLogs: true
  },
  mainnet: {
    netId: 1,
    ipfsGateway: 'https://ipfs.originprotocol.com',
    ipfsApi: 'https://ipfs.originprotocol.com',
    providerWs: `wss://eth-mainnet.ws.alchemyapi.io/ws/${AlchemyKey}`,
    provider: `https://eth-mainnet.alchemyapi.io/jsonrpc/${AlchemyKey}`,
    paymentUrl: 'https://origin-pay.herokuapp.com',
    backend: '',
    marketplace: '0x698ff47b84837d3971118a369c570172ee7e54c2',
    fetchPastLogs: true
  }
}

const SiteData = {
  brave: {
    dataDir: 'brave',
    title: 'Brave Swag Store',
    supportEmailName: 'Origin Swag',
    supportEmail: 'swag@originprotocol.com',
    emailSubject: 'Your Origin Swag',
    storeUrl: 'https://www.ethswag.com',
    productUrl: 'https://www.ethswag.com/products/',
    emailAssets: 'https://www.ethswag.com/products',
    contentHash: 'QmP5ynAZ7akpjUnfSjHXme2nTQGF5hvn7ZSEnYWjdDE66j'
  },
  origin: {
    dataDir: 'origin',
    title: 'Swag',
    fullTitle: 'Origin Swag',
    byline: 'Free shipping on all orders! 🚚💨',
    supportEmailName: 'Origin Swag',
    supportEmail: 'help@originswag.com',
    emailSubject: '🦄🌈 Your Origin Swag!',
    storeUrl: 'https://www.originswag.com',
    productUrl: 'https://www.originswag.com/origin/',
    emailAssets: 'https://www.originswag.com/origin',
    logo: 'logo.svg',
    css: 'style.css',
    twitter: 'https://twitter.com/originprotocol',
    medium: 'https://medium.com/originprotocol',
    instagram: 'https://www.instagram.com/originprotocol'
  },
  gitcoin: {
    dataDir: 'gitcoin',
    title: 'Gitcoin Schwag Store',
    byline:
      'Support the supporters of Open Source Sustainability (and look good while doing it) 😎',
    supportEmailName: 'Gitcoin Schwag Store',
    supportEmail: 'help@ethswag.com',
    emailSubject: '🦄🌈 Your Gitcoin Schwag!',
    storeUrl: 'https://www.ethswag.com/gitcoin',
    productUrl: 'https://www.ethswag.com/gitcoin/products/',
    emailAssets: 'https://www.ethswag.com/gitcoin/products',
    logo: 'logo.png',
    css: 'style.css',
    contentHash: 'QmTBTU8SmUbX32UHRmW13WviUE5wqMJBsW9V4RaVUBfKyP'
  },
  ethereum: {
    dataDir: 'ef',
    title: 'Ethporeum',
    byline:
      'Serving the finest Ethereum swag since block <a href="https://etherscan.io/block/4832686">4832686</a>.',
    supportEmailName: 'Ethereum Swag Store',
    supportEmail: 'help@ethswag.com',
    emailSubject: '🦄🌈 Your Ethereum Swag!',
    storeUrl: 'https://www.ethswag.com',
    productUrl: 'https://www.ethswag.com/products/',
    emailAssets: 'https://www.ethswag.com/products',
    logo: 'logo.svg',
    contentHash: 'QmNod6kFeaNMdtNxMBe3KVxtGKhpdQKzwoisfTVrSwiBW4'
  },
  ethhub: {
    dataDir: 'ethhub',
    title: 'EthHub',
    supportEmailName: 'EthHub Swag Store',
    supportEmail: 'help@ethswag.com',
    emailSubject: '🦄🌈 Your Ethereum Swag!',
    storeUrl: 'https://www.ethswag.com',
    productUrl: 'https://www.ethswag.com/products/',
    emailAssets: 'https://www.ethswag.com/products'
  }
}

module.exports = function() {
  if (!Configs[network]) {
    process.exit(`No config for network ${network}`)
  }

  return { ...Configs[network], network, siteData: SiteData[site] }
}
