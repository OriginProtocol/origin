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

    const { listingId } = await this.origin.marketplace.createListing(listingData)
    this.listingId = listingId

    // Wait to allow event-listener to process listing
    // TODO: As opposed to sleeping for a fixed amount of time, it would make the tests
    // run faster if we would poll the event-listener or the discovery server until the
    // newly created listing is returned.
    return new Promise(resolve => setTimeout(resolve, 20000))
  })

  it('discovery should return all listings', async () => {
    const listings = await this.origin.marketplace.getListings()
    assert.equal(listings.length, 6)
  })

  it('discovery should return newly created listing', async () => {
    const listing = await this.origin.marketplace.getListing(this.listingId)
    assert.equal(listing.id, this.listingId)
    assert.equal(listing.schemaId, listingData.schemaId)
    assert.equal(listing.dappSchemaId, listingData.dappSchemaId)
    assert.equal(listing.type, listingData.listingType)
    assert.equal(listing.category, listingData.category)
    assert.equal(listing.subCategory, listingData.subCategory)
    assert.equal(listing.title, listingData.title)
    assert.equal(listing.description, listingData.description)
    assert.equal(listing.language, listingData.language)
    assert.equal(listing.media[0].url, listingData.media[0].url)
    assert.equal(listing.media[0].contentType, listingData.media[0].contentType)
    assert.equal(listing.unitsTotal, listingData.unitsTotal)
    assert.equal(listing.schemaId, listingData.schemaId)
    assert.equal(listing.price.currency, listingData.price.currency)
    assert.equal(listing.price.amount, listingData.price.amount)
    assert.equal(listing.commission.currency, listingData.commission.currency)
    assert.equal(listing.commission.amount, listingData.commission.amount)
    assert.equal(listing.commissionPerUnit.currency, listingData.commissionPerUnit.currency)
    assert.equal(listing.commissionPerUnit.amount, listingData.commissionPerUnit.amount)
  })

  // TODO: An exercise for the reader...
  it('should allow created listing to be searched from discovery', () => {
  })

})
