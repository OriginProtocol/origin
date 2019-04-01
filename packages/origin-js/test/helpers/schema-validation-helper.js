import { expect } from 'chai'

const base64Regex = /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)/

export const validateEvent = (event) => {
  expect(event).to.have.property('id').that.is.a('string')
  expect(event).to.have.property('blockNumber').that.is.a('number')
  expect(event).to.have.property('logIndex').that.is.a('number')
  expect(event).to.have.property('transactionIndex').that.is.a('number')
  expect(event).to.have.property('transactionHash').startsWith('0x')
  expect(event).to.have.property('blockHash').startsWith('0x')
  expect(event).to.have.property('address').startsWith('0x')
  expect(event).to.have.property('signature').startsWith('0x')
  expect(event).to.have.property('type', 'mined')
  expect(event).to.have.property('event').that.is.a('string')
  expect(event).to.have.property('returnValues').that.is.an('object')
}

export const validateListing = (listing) => {
  expect(listing).to.be.an('object')
  expect(listing).to.have.property('id').that.is.a('string')
  expect(listing).to.have.property('media').that.is.an('array')
  expect(listing).to.have.property('schemaId').that.is.a('string')
  expect(listing).to.have.property('dappSchemaId').that.is.a('string')
  expect(listing).to.have.property('unitsTotal').that.is.a('number')

  expect(listing).to.have.property('type').that.is.a('string')
  expect(listing.type).to.equal('unit')

  expect(listing).to.have.property('category').that.is.a('string')
  expect(listing).to.have.property('subCategory').that.is.a('string')
  expect(listing).to.have.property('language').that.is.a('string')

  expect(listing).to.have.property('title').that.is.a('string')
  expect(listing).to.have.property('description').that.is.a('string')

  expect(listing).to.have.property('price').that.is.an('object')
  expect(listing.price).to.have.property('currency').that.is.a('string')
  expect(listing.price).to.have.property('amount').that.is.a('string')
  expect(listing).to.have.property('commission').that.is.an('object')
  expect(listing.commission).to.have.property('currency', 'OGN')
  expect(listing.commission).to.have.property('amount', '0')

  expect(listing).to.have.property('ipfsHash').to.startWith('0x')
  expect(listing).to.have.property('ipfs').that.is.an('object')
  expect(listing).to.have.property('deposit').that.is.a('string')
  expect(listing).to.have.property('depositManager').startsWith('0x')
  expect(listing).to.have.property('seller').startsWith('0x')
  expect(listing).to.have.property('status').that.is.a('string')
  /* We have inconsistancies here. By default offers is an object where keys are (simplified) offer ids (0,1,2...)
   * and values are offer events. If `loadOffers` option is passed along offers is an array consisting of 
   * offer models.
   *
   * This shall be resolved once we rewrite to GraphQl
   */
  //expect(listing).to.have.property('offers').that.is.an('array')
  expect(listing).to.have.property('events').that.is.an('array')

  if (listing.events.length) {
    listing.events.map(validateEvent)
  }
}

export const validateOffer = (offer) => {
  expect(offer).to.have.property('id').that.is.a('string')
  expect(offer).to.have.property('status').that.is.a('string')
  expect(offer).to.have.property('unitsPurchased').that.is.a('number')
  expect(offer).to.have.property('listingId').that.is.a('string')
  expect(offer).to.have.property('createdAt').that.is.a('number')
  expect(offer).to.have.property('schemaId').that.is.a('string')
  expect(offer).to.have.property('buyer').that.is.a('string')
  expect(offer.buyer).to.startWith('0x')

  expect(offer).to.have.property('refund').that.is.a('string')
  expect(offer).to.have.property('listingType', 'unit').that.is.a('string')
  expect(offer).to.have.property('totalPrice').that.is.an('object')
  expect(offer.totalPrice).to.have.property('currency').that.is.a('string')
  expect(offer.totalPrice).to.have.property('amount').that.is.a('string')
  expect(offer).to.have.property('ipfs').that.is.an('object')
  expect(offer).to.have.property('events').that.is.an('array')

  if (offer.events.length) {
    offer.events.map(validateEvent)
  }

  expect(offer.ipfs).to.have.property('hash').that.is.a('string')
  expect(offer.ipfs).to.have.property('data').that.is.an('object')
}

export const validateAttestation = (attestation) => {
  expect(attestation).to.have.property('topic').that.is.a('number')
  expect(attestation).to.have.property('service').that.is.a('string')
  expect(attestation).to.have.property('data')
  expect(attestation).to.have.property('signature')
}

export const validateUser = (user) => {
  expect(user).to.have.property('identityAddress').that.is.a('string')
  expect(user).to.have.property('profile').that.is.an('object')
  expect(user.profile).to.have.property('firstName').that.is.a('string')
  expect(user.profile).to.have.property('lastName').that.is.a('string')
  expect(user.profile).to.have.property('schemaId').that.is.a('string')

  expect(user.attestations).to.be.an('array')
  if (user.attestations.length) user.attestations.map(validateAttestation)

  if (user.profile.avatar) {
    expect(user.profile.avatar).to.be.a('string')
    expect(base64Regex.test(user.profile.avatar)).to.equal(true)
  }

  if (user.profile.description) {
    expect(user.profile.description).to.be.a('string')
  }

  if (user.address) {
    expect(user.address).to.be.a('string')
    expect(user.address).to.startWith('0x')
  }
}

export const validateNotification = (notification) => {
  expect(notification).to.have.property('id').that.is.a('string')
  expect(notification).to.have.property('type').that.is.a('string')
  expect(notification).to.have.property('status').that.is.a('string')
  expect(notification).to.have.property('event').that.is.an('object')
  expect(notification).to.have.property('resources').that.is.an('object')

  validateEvent(notification.event)

  expect(notification.resources).to.have.property('listingId').that.is.a('string')
  expect(notification.resources).to.have.property('offerId').that.is.a('string')
  expect(notification.resources).to.have.property('listing').that.is.an('object')
  expect(notification.resources).to.have.property('offer').that.is.an('object')
}

export const validateMessaging = (messaging) => {
  expect(messaging).to.be.an('object')
  expect(messaging).to.have.property('web3').that.is.an('object')
  expect(messaging).to.have.property('ipfsCreator').to.be.an('object')
  expect(messaging).to.have.property('OrbitDB').to.be.an('object')
  expect(messaging).to.have.property('sharedRooms').to.be.an('object')
  expect(messaging).to.have.property('convs').to.be.an('object')
  expect(messaging).to.have.property('ecies').to.be.an('object')
  expect(messaging).to.have.property('events').to.be.an('object')
  expect(messaging).to.have.property('GLOBAL_KEYS').to.be.a('string')
  expect(messaging).to.have.property('CONV').to.be.a('string')
  expect(messaging).to.have.property('CONV_INIT_PREFIX').to.be.a('string')
  expect(messaging).to.have.property('cookieStorage').to.be.an('object')
}
