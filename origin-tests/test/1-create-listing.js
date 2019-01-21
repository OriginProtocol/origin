const chai = require('chai')
const assert = chai.assert
const expect = chai.expect
const Web3 = require('web3')
const web3Provider = new Web3.providers.HttpProvider('http://origin:8545')
const web3 = new Web3(web3Provider)

const Origin = require('origin').default
const listingValid = require('origin/test/fixtures/listing-valid.json')
const listingData = Object.assign({}, listingValid)

const offerValid = require('origin/test/fixtures/offer-valid.json')
const offerData = Object.assign({}, offerValid)


describe('create listing with offer and retrieve using discovery', () => {

  before(async () => {
    this.origin = new Origin({
      ipfsDomain: 'origin-ipfs-proxy',
      ipfsGatewayProtocol: 'http',
      ipfsGatewayPort: 9999,
      ipfsApiPort: 9999,
      discoveryServerUrl: 'http://origin-discovery:4000/graphql',
      web3: web3,
      perfModeEnabled: true,
      // Note: make sure to use same affiliate and arbitrator as event-listener
      // otherwise event-listener's data consistency checks will fail and
      // data does not get indexed.
      // See origin/development/envfiles/event-listener.env for values to use.
      affiliate: '0x821aea9a577a9b44299b9c15c88cf3087f3b5544',
      arbitrator: '0x0d1d4e623d10f9fba5db95830f7d3839406c6af2',
    })

    const { listingId } = await this.origin.marketplace.createListing(listingData)
    this.listingId = listingId

    // Wait to allow event-listener to index the listing since the offer
    // creation logic depends on being able to read the listing data from the back-end.
    // TODO: As opposed to sleeping for a fixed amount of time, it would make the tests
    // run faster if we would poll the event-listener or the discovery server until the
    // newly created listing or offer is returned.
    await new Promise(resolve => setTimeout(resolve, 20000))
    const { offerId } = await this.origin.marketplace.makeOffer(listingId, offerData)
    this.offerId = offerId

    // Wait to allow event-listener to index the offer data.
    return new Promise(resolve => setTimeout(resolve, 20000))
  })

  it('discovery should return all listings', async () => {
    const listings = await this.origin.marketplace.getListings()
    assert.equal(listings.length, 7)
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
    // Note: URL gets rewritten so can't compare URL equality.
    expect(listing.media[0].url).to.be.a('string')
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

  it('discovery should return offer', async () => {
    const offer = await this.origin.marketplace.getOffer(this.offerId)
    assert.equal(offer.id, this.offerId)
    expect(offer.blockInfo.blockNumber).to.be.a('number')
    expect(offer.blockInfo.logIndex).to.be.a('number')
    assert.equal(offer.schemaId, offerData.schemaId)
    assert.equal(offer.listingId, this.listingId)
    assert.equal(offer.listingType, offerData.listingType)
    assert.equal(offer.unitsPurchased, offerData.unitsPurchased)
    assert.equal(offer.totalPrice.currency, offerData.totalPrice.currency)
    assert.equal(offer.totalPrice.amount, offerData.totalPrice.amount)
    assert.equal(offer.commission.currency, offerData.commission.currency)
    assert.equal(offer.commission.amount, offerData.commission.amount)
  })


  // TODO: An exercise for the reader...
  it('should allow created listing to be searched from discovery', () => {
  })

})
