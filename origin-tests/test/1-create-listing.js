const chai = require('chai')
const assert = chai.assert
const Web3 = require('web3')
const web3Provider = new Web3.providers.HttpProvider('http://origin:8545')
const web3 = new Web3(web3Provider)

const Origin = require('origin').default
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

    await this.origin.marketplace.createListing(listingData)

    // Wait to allow event-listener to process listing
    return new Promise(resolve => setTimeout(resolve, 2000))
  })

  it('should allow created listing to be retrieved from discovery', async () => {
    const listings = await this.origin.marketplace.getListings()
    assert.equal(listings.length, 6)
  })

  it('should allow created listing to be searched from discovery', () => {
  })

})
