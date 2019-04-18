const chai = require('chai')
const {
  getNotificationMessage,
  processableEvent
} = require('../src/notification')
const expect = chai.expect

describe('processableEvent', () => {
  it(`should return true or false depending on event name`, async () => {
    const p1 = processableEvent('OfferCreated', 'mobile')
    const p2 = processableEvent('RandomEvent', 'mobile')
    expect(p1).to.equal(true)
    expect(p2).to.equal(false)
  })
})

describe('getNotificationMessage', () => {
  it(`Messages on buyer side`, async () => {
    let msg = getNotificationMessage(
      'OfferAccepted',
      '0x123',
      '0x456',
      'buyer',
      'mobile'
    )
    expect(msg)
      .to.have.property('title')
      .that.is.a('string')
    expect(msg)
      .to.have.property('body')
      .that.is.a('string')

    // Not an event of interest. No notification expected.
    msg = getNotificationMessage(
      'RandomEvent',
      '0x123',
      '0x456',
      'buyer',
      'mobile'
    )
    expect(msg).to.equal(null)

    // Buyer is the initiator. No notification expected.
    msg = getNotificationMessage(
      'OfferAccepted',
      '0x123',
      '0x123',
      'buyer',
      'mobile'
    )
    expect(msg).to.equal(null)
  })

  it(`Messages on seller side`, async () => {
    let msg = getNotificationMessage(
      'OfferCreated',
      '0x123',
      '0x456',
      'seller',
      'mobile'
    )
    expect(msg)
      .to.have.property('title')
      .that.is.a('string')
    expect(msg)
      .to.have.property('body')
      .that.is.a('string')

    // Not an event of interest. No notification expected.
    msg = getNotificationMessage(
      'RandomEvent',
      '0x123',
      '0x456',
      'seller',
      'mobile'
    )
    expect(msg).to.equal(null)

    // Seller is the initiator. No notification expected.
    msg = getNotificationMessage(
      'OfferCreated',
      '0x123',
      '0x123',
      'seller',
      'mobile'
    )
    expect(msg).to.equal(null)
  })
})
