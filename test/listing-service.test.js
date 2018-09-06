import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'

import { ListingIpfsStore} from '../src/services/listing-service'
import goodListing from './data/listing-valid'

chai.use(chaiAsPromised)
const expect = chai.expect


describe('ListingIpfsStore load', () => {
  let mockIpfsService, store

  before(() => {
    mockIpfsService = new Object()
    store = new ListingIpfsStore(mockIpfsService)
  })

  it(`Should load a valid object`, async () => {
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(goodListing)
    mockIpfsService.rewriteUrl = sinon.stub().returns('http://test-gateway')

    const listing = await store.load('TestHash')

    expect(listing.type).to.equal('unit')
    expect(listing.category).to.equal('ForSale')
    expect(listing.subCategory).to.equal('Mushrooms')
    expect(listing.language).to.equal('en-US')
    expect(listing.title).to.equal('my listing')
    expect(listing.description).to.equal('my description')
    expect(listing.expiry).to.equal('1996-12-19T16:39:57-08:00')
    expect(listing.media.length).to.equal(2)
    expect(listing.media[0].url).to.equal('http://test-gateway')
    expect(listing.unitsTotal).to.equal(1)
    expect(listing.price).to.deep.equal({amount:'200', currency:'ETH'})
    expect(listing.commission).to.deep.equal({amount:'10', currency:'OGN'})
    expect(listing.securityDeposit).to.deep.equal({amount:'100', currency:'ETH'})
    expect(listing.ipfs.hash).to.equal('TestHash')
    expect(listing.ipfs.data).to.deep.equal(goodListing)
  })

  it(`Should throw an exception on listing using unsupported schema version`, () => {
    const listingUnsupportedVersion = Object.assign({}, goodListing, { 'schemaVersion': 'X.Y.Z' })
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(listingUnsupportedVersion)

    expect(store.load('TestHash')).to.eventually.be.rejectedWith(Error)
  })

  it(`Should throw an exception on listing data with missing fields`, () => {
    const badListing = { 'schemaVersion': '1.0.0', 'title': 'bad listing' }
    mockIpfsService.loadObjFromFile = sinon.stub().resolves(badListing)

    expect(store.load('TestHash')).to.eventually.be.rejectedWith(Error)
  })

})

describe('ListingIpfsStore save', () => {
  let mockIpfsService, store
  
  before(() => {
    mockIpfsService = new Object()
    store = new ListingIpfsStore(mockIpfsService)
  })

  it(`Should save a valid object with IPFS URLs`, () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ListingHash')
    mockIpfsService.saveDataURIAsFile = sinon.stub().returns('DataHash')
    mockIpfsService.gatewayUrlForHash = sinon.stub().returns('http://test-gateway')

    expect(store.save(goodListing)).to.eventually.equal('ListingHash')

    expect(mockIpfsService.saveDataURIAsFile.callCount).to.equal(0)
    expect(mockIpfsService.gatewayUrlForHash.callCount).to.equal(0)
  })

  it(`Should save a valid listing with data`, async () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ListingHash')
    mockIpfsService.saveDataURIAsFile = sinon.stub().returns('DataHash')
    mockIpfsService.gatewayUrlForHash = sinon.stub().returns('http://test-gateway')

    const media = { media: [
      {url: 'data:image/jpeg;name=test1.jpg;base64,/AA/BB'},
      {url: 'data:image/jpeg;name=test2.jpg;base64,/CC/DD'}
    ] }
    const listing = Object.assign({}, goodListing, media)
    const ipfsHash = await store.save(listing)

    expect(ipfsHash).to.equal('ListingHash')

    // Check the media content was saved as separate IPFS files.
    expect(mockIpfsService.saveDataURIAsFile.callCount).to.equal(2)

    // Check the URL for media content is an IPFS URL.
    const ipfsData = mockIpfsService.saveObjAsFile.firstCall.args[0]
    expect(ipfsData.media[0].url.substring(0,7)).to.equal('ipfs://')
    expect(ipfsData.media[1].url.substring(0,7)).to.equal('ipfs://')
  })

  it(`Should filter out invalid media`, async () => {
    mockIpfsService.saveObjAsFile = sinon.stub().returns('ListingHash')
    const media = { media: [
      {url: 'bogus://'},             // Invalid data field.
      {url:'http://notallowed'},  // Only ipfs and dwed URL are allowed.
    ] }
    const listing = Object.assign({}, goodListing, media)
    await store.save(listing)

    // Check all the entries were filtered out in the listing data saved to IPFS.
    const ipfsData = mockIpfsService.saveObjAsFile.firstCall.args[0]
    expect(ipfsData.media.length).to.equal(0)
  })

  it(`Should throw an exception on listing using unsupported schema version`, async () => {
    const listingUnsupportedVersion = Object.assign({}, goodListing, { 'schemaVersion': 'X.Y.Z' })
    expect(store.save(listingUnsupportedVersion)).to.eventually.be.rejectedWith(Error)
  })

  it(`Should throw an exception on invalid listing`, async () => {
    const badListing = {'schemaVersion': '1.0.0', 'title': 'bad listing'}
    expect(store.save(badListing)).to.eventually.be.rejectedWith(Error)
  })

})