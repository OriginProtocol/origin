const Origin = require('origin').default
const Web3 = require('web3')
const web3Provider = new Web3.providers.HttpProvider('http://origin:8545')
const web3 = new Web3(web3Provider)

const listingValid = require('origin/test/fixtures/listing-valid.json')
const listingData = Object.assign({}, listingValid)

describe('create listing and retrieve using discovery', () => {

  before(async () => {
    this.origin = new Origin({
      ipfsDomain: 'ipfs-proxy',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      ipfsApiPort: 9999,
      discoveryServerUrl: 'http://origin-discovery:4000/graphql',
      web3: web3,
      perfModeEnabled: true
    })

    await origin.marketplace.createListing(listingData)
  })

  it('should allow listing to be retrieved from discovery', () => {
  })

  it('should allow listing to be searched from discovery', () => {
  })

})
