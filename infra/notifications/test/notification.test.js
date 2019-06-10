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
    let msgTemplate = getNotificationMessage(
      'OfferAccepted',
      '0x123',
      '0x456',
      'buyer',
      'mobile'
    )
    expect(msgTemplate)
      .to.have.property('title')
      .that.is.a('function')
    expect(msgTemplate)
      .to.have.property('body')
      .that.is.a('function')

    // Not an event of interest. No notification expected.
    msgTemplate = getNotificationMessage(
      'RandomEvent',
      '0x123',
      '0x456',
      'buyer',
      'mobile'
    )
    expect(msgTemplate).to.equal(null)

    // Buyer is the initiator. No notification expected.
    msgTemplate = getNotificationMessage(
      'OfferAccepted',
      '0x123',
      '0x123',
      'buyer',
      'mobile'
    )
    expect(msgTemplate).to.equal(null)
  })

  it(`Messages on seller side`, async () => {
    let msgTemplate = getNotificationMessage(
      'OfferCreated',
      '0x123',
      '0x456',
      'seller',
      'mobile'
    )
    expect(msgTemplate)
      .to.have.property('title')
      .that.is.a('function')
    expect(msgTemplate)
      .to.have.property('body')
      .that.is.a('function')

    // Not an event of interest. No notification expected.
    msgTemplate = getNotificationMessage(
      'RandomEvent',
      '0x123',
      '0x456',
      'seller',
      'mobile'
    )
    expect(msgTemplate).to.equal(null)

    // Seller is the initiator. No notification expected.
    msgTemplate = getNotificationMessage(
      'OfferCreated',
      '0x123',
      '0x123',
      'seller',
      'mobile'
    )
    expect(msgTemplate).to.equal(null)
  })
})
