const shopConfig = {
  title: '',
  fullTitle: '',
  byline: 'Free shipping on all orders! 🚚💨',
  logo: '',
  css: '',
  footer:
    '© 2019 <a href="https://www.originprotocol.com">Origin Protocol</a>. <span class="ml-1">Learn more about this <a class="ul" href="https://medium.com/originprotocol/built-on-origin-a-decentralized-shopify-alternative-888adc4198b0">decentralized e-commerce store</a>.</span>',
  backendAuthToken: '',
  favicon: 'favicon.png',

  supportEmail: 'Store <store@ogn.app>',
  emailSubject: 'Your Order',
  twitter: '',
  medium: '',
  facebook: '',

  stripe: false,
  beta: false,
  discountCodes: true,

  pgpPublicKey: '',
  contentCDN: '',
  contentHash: '',
  stripeKey: '',

  networks: {
    '1': {
      marketplaceContract: '0x698ff47b84837d3971118a369c570172ee7e54c2',
      marketplaceEpoch: 8582597,
      listingId: '1-001-X',
      affiliate: '',
      arbitrator: '',
      backend: 'https://dshopapi.ogn.app',
      ipfsGateway: 'https://ipfs-prod.ogn.app',
      ipfsApi: 'https://ipfs.ogn.app'
    },
    '4': {
      marketplaceContract: '0x3d608cce08819351ada81fc1550841ebc10686fd',
      marketplaceEpoch: 5119455,
      listingId: '4-001-XXX',
      backend: 'https://example.herokuapp.com',
      ipfsGateway: 'https://ipfs.staging.originprotocol.com',
      ipfsApi: 'https://ipfs.staging.originprotocol.com'
    },
    '999': {
      marketplaceEpoch: 0,
      listingId: '999-001-2',
      backend: 'http://0.0.0.0:3000',
      ipfsGateway: 'http://localhost:8080',
      ipfsApi: 'http://localhost:5002'
    }
  }
}

const shipping = [
  {
    id: 'domestic',
    label: 'Free Shipping',
    detail: 'Arrives in 7 to 10 days',
    countries: ['US'],
    amount: 0
  },
  {
    id: 'international',
    label: 'Free International Shipping',
    detail: 'Arrives in 10 to 14 days',
    amount: 0
  }
]

module.exports = {
  shopConfig,
  shipping
}
