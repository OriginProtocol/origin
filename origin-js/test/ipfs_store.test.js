import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'

import {
  IpfsDataStore,
  LISTING_DATA_TYPE,
  LISTING_WITHDRAW_DATA_TYPE,
  OFFER_DATA_TYPE,
  OFFER_ACCEPT_DATA_TYPE,
  PROFILE_DATA_TYPE,
  REVIEW_DATA_TYPE
} from '../src/ipfsInterface/store'
import {
  BASE_SCHEMA_ID,
  generateSchemaId,
  parseSchemaId
} from '../src/ipfsInterface/schema-id'
import validListing from './fixtures/listing-valid.json'
import validOffer from './fixtures/offer-valid.json'
import validProfile from './fixtures/profile-valid.json'
import validReview from './fixtures/review-valid.json'


chai.use(chaiAsPromised)
const expect = chai.expect

describe('Schema Ids', () => {
  it(`Should parse old style schemaId`, () => {
    const { dataType, schemaVersion } = parseSchemaId(
      'http://schema.originprotocol.com/my-data-type_v1.0.0')
    expect(dataType).to.equal('my-data-type')
    expect(schemaVersion).to.equal('1.0.0')
  })

  it(`Should parse new style schemaId`, () => {
    const { dataType, schemaVersion } = parseSchemaId(
      BASE_SCHEMA_ID+'my-data-type_1.0.0.json')
    expect(dataType).to.equal('my-data-type')
    expect(schemaVersion).to.equal('1.0.0')
  })

  it(`Should generate a valid schemaId if no version passed`, () => {
    const { schemaId, schemaVersion } = generateSchemaId('my-data-type')
    expect(schemaId).to.equal(BASE_SCHEMA_ID+'my-data-type_1.0.0.json')
    expect(schemaVersion).to.equal('1.0.0')
  })

  it(`Should generate a schemaId using passed version`, () => {
    const { schemaId, schemaVersion } = generateSchemaId('my-data-type', '0.1.2')
    expect(schemaId).to.equal(BASE_SCHEMA_ID+'my-data-type_0.1.2.json')
    expect(schemaVersion).to.equal('0.1.2')
  })
})

describe('Listing IpfsDataStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should load a valid listing`, async () => {
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(validListing)
    mockIpfsService.rewriteUrl = sinon.stub().returns('http://test-gateway')

    const listing = await store.load(LISTING_DATA_TYPE, 'TestHash')

    expect(listing.dappSchemaId).to.equal(
      'https://dapp.originprotocol.com/schemas/forSale-mushrooms_1.0.0.json')
    expect(listing.type).to.equal('unit')
    expect(listing.category).to.equal('schema.forSale')
    expect(listing.subCategory).to.equal('schema.mushrooms')
    expect(listing.language).to.equal('en-US')
    expect(listing.title).to.equal('my listing')
    expect(listing.description).to.equal('my description')
    expect(listing.media.length).to.equal(2)
    expect(listing.media[0].url).to.equal('http://test-gateway')
    expect(listing.unitsTotal).to.equal(1)
    expect(listing.price).to.deep.equal({ amount: '0.033', currency: 'ETH' })
    expect(listing.commission).to.deep.equal({ amount: '0', currency: 'OGN' })
    expect(listing.ipfs.hash).to.equal('TestHash')
    expect(listing.ipfs.data).to.deep.equal(validListing)
  })

  it(`Should load a listing with no dappSchemaId`, async () => {
    const listingNoDappSChemaId = Object.assign({}, validListing)
    delete listingNoDappSChemaId.dappSchemaId
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(listingNoDappSChemaId)
    mockIpfsService.rewriteUrl = sinon.stub().returns('http://test-gateway')

    const listing = await store.load(LISTING_DATA_TYPE, 'TestHash')
    expect(listing.dappSchemaId).to.equal(undefined)
  })

  it(`Should load a listing with old format schemaId`, async () => {
    const listingOldSchemaid = Object.assign({}, validListing)
    listingOldSchemaid.schemaId = 'http://schema.originprotocol.com/listing_1.0.0'
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(listingOldSchemaid)
    mockIpfsService.rewriteUrl = sinon.stub().returns('http://test-gateway')

    const listing = await store.load(LISTING_DATA_TYPE, 'TestHash')
    expect(listing.title).to.equal('my listing')
  })

  it(`Should throw an exception on listing using invalid schema Id`, () => {
    const listingInvalidSchemaId = Object.assign({}, validListing, {
      schemaId: 'badSchemaId'
    })
    mockIpfsService.loadObjFromFile = sinon
      .stub()
      .resolves(listingInvalidSchemaId)

    return expect(store.load(LISTING_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })

  it(`Should throw an exception on listing data with missing fields`, () => {
    const badListing = { title: 'bad listing' }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(badListing)

    return expect(store.load(LISTING_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })
})

describe('Listing IpfsDataStore save', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should save a valid object with IPFS URLs`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ListingHash')
    mockIpfsService.saveDataURIAsFile = sinon.stub().returns('DataHash')
    mockIpfsService.gatewayUrlForHash = sinon
      .stub()
      .returns('http://test-gateway')

    // Clone validListing, because IpfsDataStore.save() filters out the test
    // media URLs, which appear to be invalid.
    const validListingCopy = JSON.parse(JSON.stringify(validListing))
    return expect(store.save(LISTING_DATA_TYPE, validListingCopy)).to.eventually.equal('ListingHash')
      .then(() => expect(mockIpfsService.saveDataURIAsFile.callCount).to.equal(0))
      .then(() => expect(mockIpfsService.gatewayUrlForHash.callCount).to.equal(0))
      .then(() => expect(mockIpfsService.saveObjAsFile.firstCall.args[0]).to.have.property('schemaId'))
  })

  it(`Should save a valid listing with data`, async () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ListingHash')
    mockIpfsService.saveDataURIAsFile = sinon.stub().returns('DataHash')
    mockIpfsService.gatewayUrlForHash = sinon
      .stub()
      .returns('http://test-gateway')

    const media = {
      media: [
        { url: 'data:image/jpeg;name=test1.jpg;base64,/AA/BB' },
        { url: 'data:image/jpeg;name=test2.jpg;base64,/CC/DD' }
      ]
    }
    const listing = Object.assign({}, validListing, media)
    const ipfsHash = await store.save(LISTING_DATA_TYPE, listing)

    expect(ipfsHash).to.equal('ListingHash')

    // Check the media content was saved as separate IPFS files.
    expect(mockIpfsService.saveDataURIAsFile.callCount).to.equal(2)

    // Check the URL for media content is an IPFS URL.
    const ipfsData = mockIpfsService.saveObjAsFile.firstCall.args[0]
    expect(ipfsData.media[0].url.substring(0, 7)).to.equal('ipfs://')
    expect(ipfsData.media[1].url.substring(0, 7)).to.equal('ipfs://')
  })

  it(`Should filter out invalid media`, async () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ListingHash')
    const media = {
      media: [
        { url: 'bogus://' }, // Invalid data field.
        { url: 'http://notallowed' } // Only ipfs and dwed URL are allowed.
      ]
    }
    const listing = Object.assign({}, validListing, media)
    await store.save(LISTING_DATA_TYPE, listing)

    // Check all the entries were filtered out in the listing data saved to IPFS.
    const ipfsData = mockIpfsService.saveObjAsFile.firstCall.args[0]
    expect(ipfsData.media.length).to.equal(0)
  })

  it(`Should throw an exception on invalid listing`, async () => {
    const badListing = { title: 'bad listing' }
    return expect(store.save(
      LISTING_DATA_TYPE,
      badListing)).to.eventually.be.rejectedWith(Error)
  })
})

describe('ListingWithdraw IpfsDataStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should load a valid object`, async () => {
    // Empty besides schemaId since withdrawal does not have any data yet.
    const validWithdrawal = { schemaId: BASE_SCHEMA_ID+'listing-withdraw_1.0.0.json' }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(validWithdrawal)

    const withdraw = await store.load(LISTING_WITHDRAW_DATA_TYPE, 'WithdrawalHash')

    expect(withdraw.ipfs.hash).to.equal('WithdrawalHash')
    expect(withdraw.ipfs.data).to.deep.equal(validWithdrawal)
  })
})

describe('ListingWithdraw IpfsDataStore save', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should save a valid withdrawal`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('WithdrawHash')
    const validWithdrawal = {}

    return expect(
      store.save(LISTING_WITHDRAW_DATA_TYPE, validWithdrawal)).to.eventually.equal('WithdrawHash')
      .then(() => expect(mockIpfsService.saveObjAsFile.firstCall.args[0]).to.have.property('schemaId'))
  })
})

describe('Offer IpfsStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should load a valid object`, async () => {
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(validOffer)
    mockIpfsService.rewriteUrl = sinon.stub().returns('http://test-gateway')

    const offer = await store.load(OFFER_DATA_TYPE, 'TestHash')

    expect(offer.listingType).to.equal('unit')
    expect(offer.unitsPurchased).to.equal(1)
    expect(offer.totalPrice).to.deep.equal({ amount: '0.033', currency: 'ETH' })
    expect(offer.ipfs.hash).to.equal('TestHash')
    expect(offer.ipfs.data).to.deep.equal(validOffer)
  })

  it(`Should throw an exception on offer using invalid schema Id`, () => {
    const offerInvalidSchemaId = Object.assign({}, validReview, {
      schemaId: 'badSchemaId'
    })
    mockIpfsService.loadObjFromFile = sinon
      .stub()
      .resolves(offerInvalidSchemaId)
    return expect(store.load(OFFER_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })

  it(`Should throw an exception on offer data with missing fields`, () => {
    const badOffer = { title: 'bad offer' }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(badOffer)

    return expect(store.load(OFFER_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })
})

describe('Offer IpfsStore save', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should save a valid offer`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('OfferHash')

    return expect(
      store.save(OFFER_DATA_TYPE, validOffer)).to.eventually.equal('OfferHash')
      .then(() => expect(mockIpfsService.saveObjAsFile.firstCall.args[0]).to.have.property('schemaId'))
  })

  it(`Should throw an exception on invalid offer`, async () => {
    const badOffer = { title: 'bad offer' }

    return expect(store.save(
      OFFER_DATA_TYPE,
      badOffer)).to.eventually.be.rejectedWith(Error)
  })
})

describe('OfferAccept IpfsDataStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should load a valid accept`, async () => {
    // Empty besides schemaId since accept does not have any data yet.
    const validAccept = { schemaId: BASE_SCHEMA_ID+'offer-accept_1.0.0.json' }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(validAccept)

    const accept = await store.load(OFFER_ACCEPT_DATA_TYPE, 'AcceptHash')

    expect(accept.ipfs.hash).to.equal('AcceptHash')
    expect(accept.ipfs.data).to.deep.equal(validAccept)
  })
})

describe('OfferAccept IpfsDataStore save', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should save a valid accept`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('AcceptHash')
    const validAccept = {}
    return expect(
      store.save(OFFER_ACCEPT_DATA_TYPE, validAccept)).to.eventually.equal('AcceptHash')
      .then(() => expect(mockIpfsService.saveObjAsFile.firstCall.args[0]).to.have.property('schemaId'))
  })
})

describe('Review IpfsDataStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should load a valid withdrawal`, async () => {
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(validReview)
    const review = await store.load(REVIEW_DATA_TYPE, 'ReviewHash')
    expect(review.rating).to.equal(3)
    expect(review.text).to.equal('Good stuff')
    expect(review.ipfs.hash).to.equal('ReviewHash')
    expect(review.ipfs.data).to.deep.equal(validReview)
  })

  it(`Should throw an exception on review using invalid schema Id`, () => {
    const reviewInvalidSchemaId = Object.assign({}, validReview, {
      schemaId: 'badSchemaId'
    })
    mockIpfsService.loadObjFromFile = sinon
      .stub()
      .resolves(reviewInvalidSchemaId)

    return expect(store.load(REVIEW_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })

  it(`Should throw an exception on review data with missing fields`, () => {
    const badReview = { title: 'bad review' }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(badReview)
    return expect(store.load(REVIEW_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })
})

describe('Review IpfsDataStore save', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should save a valid review`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ReviewHash')
    return expect(
      store.save(REVIEW_DATA_TYPE, validReview)).to.eventually.equal('ReviewHash')
      .then(() => expect(mockIpfsService.saveObjAsFile.firstCall.args[0]).to.have.property('schemaId'))

  })

  it(`Should throw an exception on invalid review`, async () => {
    const badReview = { title: 'bad review' }
    return expect(store.save(
      REVIEW_DATA_TYPE,
      badReview)).to.eventually.be.rejectedWith(Error)
  })
})

describe('Profile IpfsDataStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should load a valid profile`, async () => {
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(validProfile)
    const profile = await store.load(PROFILE_DATA_TYPE, 'ProfileHash')
    expect(profile.firstName).to.equal('originus')
    expect(profile.lastName).to.equal('protocolus')
    expect(profile.description).to.equal('Semper Fidelis')
    expect(profile.avatar).to.equal('data:,Avatar')
    expect(profile.ipfs.hash).to.equal('ProfileHash')
    expect(profile.ipfs.data).to.deep.equal(validProfile)
  })

  it(`Should throw an exception on profile with invalid schema Id`, () => {
    const profileInvalidSchemaId = Object.assign({}, validProfile, {
      schemaId: 'badSchemaId'
    })
    mockIpfsService.loadObjFromFile = sinon
      .stub()
      .resolves(profileInvalidSchemaId)
    return expect(store.load(PROFILE_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })

  it(`Should throw an exception on profile data with missing schemaId`, () => {
    const badProfile = {  }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(badProfile)
    return expect(store.load(PROFILE_DATA_TYPE, 'TestHash')).to.eventually.be.rejectedWith(Error)
  })
})

describe('Profile IpfsDataStore save', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new IpfsDataStore(mockIpfsService)
  })

  it(`Should save a valid profile`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ProfileHash')
    return expect(
      store.save(PROFILE_DATA_TYPE, validProfile)).to.eventually.equal('ProfileHash')
      .then(() => expect(mockIpfsService.saveObjAsFile.firstCall.args[0]).to.have.property('schemaId'))
  })

})
