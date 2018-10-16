import { expect } from 'chai'

export const listingValidation = (listing) => {
  expect(listing).to.be.an('object')
  expect(listing).to.have.property('id').that.is.a('string')
  expect(listing).to.have.property('media').that.is.an('array')
  expect(listing).to.have.property('schemaId').that.is.a('string')
  expect(listing).to.have.property('type').that.is.a('string')
  expect(listing.type).to.equal('unit')

  expect(listing).to.have.property('category').that.is.a('string')
  expect(listing.category).to.equal('schema.forSale')
  expect(listing).to.have.property('subCategory').that.is.a('string')
  expect(listing.subCategory).to.equal('schema.forSale.mushrooms')

  expect(listing).to.have.property('title').that.is.a('string')
  expect(listing.title).to.equal('my listing')
  expect(listing).to.have.property('description').that.is.a('string')
  expect(listing.description).to.equal('my description')

  expect(listing).to.have.property('expiry')
  expect(new Date(listing.expiry).getMonth).to.be.a('function')
  expect(listing).to.have.property('price').that.is.an('object')
  expect(listing.price).to.have.property('currency', 'ETH')
  expect(listing.price).to.have.property('amount', '0.033')
  expect(listing).to.have.property('commission').that.is.an('object')
  expect(listing.commission).to.have.property('currency', 'OGN')
  expect(listing.commission).to.have.property('amount', '0')

  expect(listing).to.have.property('ipfsHash').startsWith('0x')
  expect(listing).to.have.property('depositManager').startsWith('0x')
  expect(listing).to.have.property('seller').startsWith('0x')
  expect(listing).to.have.property('status', 'active')
  expect(listing).to.have.property('offers').that.is.an('object')
  expect(listing).to.have.property('events').that.is.an('array')

  const event = listing.events[0]

  expect(event).to.have.property('id').that.is.a('string')
  expect(event).to.have.property('blockNumber').that.is.a('number')
  expect(event).to.have.property('logIndex', 0)
  expect(event).to.have.property('transactionIndex', 0)
  expect(event).to.have.property('transactionHash').startsWith('0x')
  expect(event).to.have.property('blockHash').startsWith('0x')
  expect(event).to.have.property('address').startsWith('0x')
  expect(event).to.have.property('signature').startsWith('0x')
  expect(event).to.have.property('type', 'mined')
  expect(event).to.have.property('event', 'ListingCreated')
  expect(event).to.have.property('returnValues').that.is.an('object')
}

export const offerValidation = (offer) => {
  expect(offer).to.have.property('status').that.is.a('string')
  expect(offer).to.have.property('unitsPurchased').that.is.a('number')
  expect(offer).to.have.property('listingId').that.is.a('string')
  expect(offer).to.have.property('createdAt').that.is.a('number')
  expect(offer).to.have.property('schemaId').that.is.a('string')
  expect(offer).to.have.property('buyer').that.is.a('string')
  expect(offer.buyer).to.startWith('0x')

  expect(offer).to.have.property('refund', '0')
  expect(offer).to.have.property('listingType', 'unit')
  expect(offer).to.have.property('totalPrice').that.is.an('object')
  expect(offer.totalPrice).to.have.property('currency').that.is.a('string')
  expect(offer.totalPrice).to.have.property('amount').that.is.a('string')
  expect(offer).to.have.property('ipfs').that.is.an('object')
  expect(offer).to.have.property('events').that.is.an('array')

  expect(offer.ipfs).to.have.property('hash').that.is.a('string')
  expect(offer.ipfs).to.have.property('data').that.is.an('object')
}
