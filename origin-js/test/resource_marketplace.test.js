import sinon from 'sinon'

import Marketplace from '../src/resources/marketplace.js'
import contractServiceHelper from './helpers/contract-service-helper'
import asAccount from './helpers/as-account'
import { validateOffer, validateListing, validateNotification } from './helpers/schema-validation-helper'
import IpfsService from '../src/services/ipfs-service.js'
import { expect } from 'chai'
import Web3 from 'web3'

import listingValid from './fixtures/listing-valid.json'
import offerValid from './fixtures/offer-valid.json'
import reviewValid from './fixtures/review-valid.json'
import { OFFER_DATA_TYPE } from '../src/ipfsInterface/store'

// oddly changing an imported object here can affect other or subsequent tests that import the same file
const listingData = Object.assign({}, listingValid)
const offerData = Object.assign({}, offerValid)
const reviewData = Object.assign({}, reviewValid)

const emptyAddress = '0x0000000000000000000000000000000000000000'

const originTokenListing = Object.assign({}, listingData, {
  price: { currency: 'OGN', amount: '1' }
})
const commissionListing = Object.assign({}, listingData, {
  commission: { currency: 'OGN', amount: '2' }
})
const originTokenOffer = Object.assign({}, offerData, {
  totalPrice: { currency: 'OGN', amount: '1' }
})
const invalidPriceOffer = Object.assign({}, offerData, {
  totalPrice: { currency: 'ETH', amount: '0.032' }
})
const commissionOffer = Object.assign({}, offerData, {
  commission: { currency: 'OGN', amount: '2' }
})
const invalidCommissionOffer = Object.assign({}, offerData, {
  commission: { currency: 'OGN', amount: '1' }
})

class StoreMock {
  constructor() {
    this.storage = {}
  }

  get(key) {
    return this.storage[key]
  }

  set(key, value) {
    this.storage[key] = value
  }
}

describe('Marketplace Resource', function() {
  // TODO speed up the notifications test so that this timeout can be reduced
  this.timeout(15000) // default is 2000
  let marketplace, web3, contractService, validArbitrator, validAffiliate,
    evilAddress, makeMaliciousOffer

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    this.userAddress = accounts[0]
    validAffiliate = accounts[3]
    validArbitrator = accounts[4]
    evilAddress = accounts[5]
    contractService = await contractServiceHelper(web3)
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    const store = new StoreMock()
    store.set(
      'notification_subscription_start',
      new Date('2017-01-01').getTime()
    )
    marketplace = new Marketplace({
      contractService,
      ipfsService,
      affiliate: validAffiliate,
      arbitrator: validArbitrator,
      store
    })

    await marketplace.createListing(listingData)
    await marketplace.makeOffer('999-000-0', offerData)

    makeMaliciousOffer = async ({ affiliate = validAffiliate, arbitrator = validArbitrator }) => {
      const ipfsHash = await marketplace.ipfsDataStore.save(OFFER_DATA_TYPE, offerData)
      const ipfsBytes = contractService.getBytes32FromIpfsHash(ipfsHash)
      const price = await contractService.moneyToUnits(listingData.price)
      const expiry = Math.round(+new Date() / 1000) + 60 * 60 * 24 // 24 hrs
      await contractService.call(
        'V00_Marketplace',
        'makeOffer',
        [
          0,
          ipfsBytes,
          expiry,
          affiliate,
          0,
          price,
          emptyAddress,
          arbitrator
        ],
        { value: price }
      )
    }
  })

  describe('getListingsCount', () => {
    it('should return the count of listings', async () => {
      const listingCount = await marketplace.getListingsCount()
      expect(listingCount).to.equal(1)
    })
  })

  describe('getListings', () => {
    it ('should return all detailed listings', async () => {
      await marketplace.createListing(listingData)
      const listings = await marketplace.getListings()
      expect(listings).to.have.lengthOf(2)

      listings.map(validateListing)
    })

    it('should return all listing ids when idsOnly is true', async () => {
      await marketplace.createListing(listingData)
      const listings = await marketplace.getListings({ idsOnly: true })

      expect(listings).to.be.an('array')
      expect(listings.length).to.equal(2)
      expect(listings).to.deep.equal(['999-000-1', '999-000-0'])
    })
  })

  describe('getListing', () => {
    it('should return details of a listing', async () => {
      const listings = await marketplace.getListings({ idsOnly: true })
      expect(listings.length).to.equal(1)
      const listing = await marketplace.getListing(listings[0])

      validateListing(listing)
    })
  })

  describe('createListing', () => {
    it('should create a listing', async () => {
      let listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      await marketplace.createListing(listingData)
      listings = await marketplace.getListings()

      expect(listings.length).to.equal(2)

      listings.map(validateListing)

      expect(listings[1].status).to.equal('active')
      expect(listings[1].title).to.equal(listingData.title)
      expect(listings[1].seller).to.equal(this.userAddress)
      expect(listings[1].price).to.deep.equal(listingData.price)
    })
  })

  describe('withdrawListing', () => {
    it('should delete a listing', async () => {
      let listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      expect(listings[0].status).to.equal('active')
      await marketplace.withdrawListing(listings[0].id)
      listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      expect(listings[0].status).to.equal('inactive')
    })
  })

  describe('getOffers: idsOnly=true', () => {
    it('should get offer ids', async () => {
      await marketplace.makeOffer('999-000-0', offerData)
      const offers = await marketplace.getOffers('999-000-0', { idsOnly: true })

      expect(offers).be.an('array')
      expect(offers).to.have.lengthOf(2)
      expect(offers[0]).to.equal('999-000-0-0')
      expect(offers[1]).to.equal('999-000-0-1')
    })
  })

  describe('getOffers', () => {
    it('should get offers with data', async () => {
      await marketplace.makeOffer('999-000-0', offerData)
      const offers = await marketplace.getOffers('999-000-0')
      const listings = await marketplace.getListings()

      expect(offers.length).to.equal(2)
      expect(offers[0].status).to.equal('created')
      expect(offers[0].unitsPurchased).to.exist
      validateOffer(offers[0])

      const latestOffer = offers[1]

      validateOffer(latestOffer)

      expect(latestOffer.status).to.equal('created')
      expect(latestOffer.unitsPurchased).to.equal(1)
      expect(latestOffer.listingId).to.equal(listings[0].id)
    })

    it('should exclude invalid offers', async () => {
      await marketplace.makeOffer('999-000-0', invalidPriceOffer)
      const offers = await marketplace.getOffers('999-000-0')
      expect(offers.length).to.equal(1)
      expect(offers).not.to.include(invalidPriceOffer)
      expect(offers[0].status).to.equal('created')
      expect(offers[0].unitsPurchased).to.exist
    })
  })

  describe('getOffer', () => {
    it('should get offer data', async () => {
      const offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('created')
      expect(offer.unitsPurchased).to.exist
    })

    it('should throw an error if currency does not match listing', async () => {
      await marketplace.makeOffer('999-000-0', originTokenOffer)
      let errorThrown = false
      let errorMessage
      try {
        await marketplace.getOffer('999-000-0-1')
      } catch(e) {
        errorThrown = true
        errorMessage = String(e)
      }
      expect(errorThrown).to.be.true
      expect(errorMessage).to.equal('Error: Invalid offer: currency does not match listing')
    })


    it('should throw an error if price is not sufficient', async () => {
      await marketplace.makeOffer('999-000-0', invalidPriceOffer)
      let errorThrown = false
      let errorMessage
      try {
        await marketplace.getOffer('999-000-0-1')
      } catch(e) {
        errorThrown = true
        errorMessage = String(e)
      }
      expect(errorThrown).to.be.true
      expect(errorMessage).to.equal('Error: Invalid offer: insufficient offer amount for listing')
    })

    it('should throw an error if commission is not sufficient', async () => {
      await marketplace.createListing(commissionListing)
      await marketplace.makeOffer('999-000-1', invalidCommissionOffer)
      let errorThrown = false
      let errorMessage
      try {
        await marketplace.getOffer('999-000-1-0')
      } catch(e) {
        errorThrown = true
        errorMessage = String(e)
      }
      expect(errorThrown).to.be.true
      expect(errorMessage).to.equal('Error: Invalid offer: insufficient commission amount for listing')
    })

    it('should throw an error if arbitrator is invalid', async () => {
      // Create malicious offer by interacting directly with contract
      await makeMaliciousOffer({ arbitrator: evilAddress })

      let errorThrown = false
      let errorMessage
      try {
        await marketplace.getOffer('999-000-0-1')
      } catch(e) {
        errorThrown = true
        errorMessage = String(e)
      }
      expect(errorThrown).to.be.true
      expect(errorMessage).to.equal('Error: Invalid offer: arbitrator is invalid')
    })

    it('should throw an error if affiliate is invalid', async () => {
      // Create malicious offer by interacting directly with contract
      let errorThrown = false
      let errorMessage
      try {
        await makeMaliciousOffer({ affiliate: evilAddress })
      } catch(e) {
        errorThrown = true
        errorMessage = String(e)
      }
      expect(errorThrown).to.be.true
      expect(errorMessage).to.contain('revert Affiliate not allowed')
    })
  })

  describe('makeOffer', () => {
    it('should make an offer', async () => {
      const anotherOffer = Object.assign({}, offerData, {
        totalPrice: { currency: 'ETH', amount: '0.033' }
      })
      await marketplace.makeOffer('999-000-0', anotherOffer)
      const offer = await marketplace.getOffer('999-000-0-1')
      expect(offer.totalPrice.amount).to.equal('0.033')
      expect(offer.totalPrice.currency).to.equal('ETH')
    })

    it('should make an offer in ERC20', async () => {
      await marketplace.createListing(originTokenListing)
      await marketplace.makeOffer('999-000-1', originTokenOffer)
      const offer = await marketplace.getOffer('999-000-1-0')

      validateOffer(offer)
      expect(offer.totalPrice.amount).to.equal('1')
      expect(offer.totalPrice.currency).to.equal('OGN')
    })

    it('should make an offer with a commission', async () => {
      await marketplace.createListing(commissionListing)
      await marketplace.makeOffer('999-000-1', commissionOffer)
      const offer = await marketplace.getOffer('999-000-1-0')

      validateOffer(offer)
    })
  })

  describe('withdrawOffer', () => {
    it('should delete an offer', async () => {
      let offer = await marketplace.getOffer('999-000-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.withdrawOffer(offer.id)
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('withdrawn')
    })
  })

  describe('acceptOffer', () => {
    it('should changed the status to accepted', async () => {
      let offer = await marketplace.getOffer('999-000-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-000-0-0')
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('accepted')
    })
  })

  describe('finalizeOffer', () => {
    it('should changed the status to finalized', async () => {
      let offer = await marketplace.getOffer('999-000-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-000-0-0')
      await marketplace.finalizeOffer('999-000-0-0', reviewData)
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('finalized')
    })
  })

  describe('sellerReview', () => {
    it('should changed the status to sellerReviewed', async () => {
      let offer = await marketplace.getOffer('999-000-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-000-0-0')
      await marketplace.finalizeOffer('999-000-0-0', reviewData)
      await marketplace.addData(0, offer.id, reviewData)
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('sellerReviewed')
    })
  })

  describe('getListingReviews', () => {
    it('should get reviews', async () => {
      await marketplace.acceptOffer('999-000-0-0')
      await marketplace.finalizeOffer('999-000-0-0', reviewData)
      const reviews = await marketplace.getListingReviews('999-000-0')
      expect(reviews.length).to.equal(1)
      expect(reviews[0].rating).to.equal(3)
      expect(reviews[0].text).to.equal('Good stuff')
    })
  })

  describe('getNotifications', () => {
    let notifications

    beforeEach(async function() {
      notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      validateNotification(notifications[0])
      expect(notifications[0].type).to.equal('seller_listing_purchased')
      expect(notifications[0].status).to.equal('unread')
    })

    it('should return notifications', async () => {
      await marketplace.acceptOffer('999-000-0-0')
      notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      validateNotification(notifications[0])

      expect(notifications[0].type).to.equal('buyer_listing_shipped')
      expect(notifications[0].status).to.equal('unread')
      expect(notifications[0].event.event).to.equal('OfferAccepted')

      await marketplace.finalizeOffer('999-000-0-0', reviewData)
      notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      validateNotification(notifications[0])

      expect(notifications[0].type).to.equal('seller_review_received')
      expect(notifications[0].status).to.equal('unread')
      expect(notifications[0].event.event).to.equal('OfferFinalized')
    })

    it('should exclude notifications for invalid offers', async () => {
      await marketplace.makeOffer('999-000-0', invalidPriceOffer)

      const notifications = await marketplace.getNotifications()

      expect(notifications.length).to.equal(1)
      validateNotification(notifications[0])
      expect(notifications).to.not.include(invalidPriceOffer)
    })
  })

  describe('setNotification', () => {
    it('should allow notifications to be marked as read', async () => {
      let notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      expect(notifications[0].status).to.equal('unread')

      marketplace.setNotification({ id: notifications[0].id, status: 'read' })
      notifications = await marketplace.getNotifications()
      validateNotification(notifications[0])

      expect(notifications[0].status).to.equal('read')
    })
  })

  describe('initiateDispute', () => {
    it('should put an offer into "Disputed" state', async () => {
      await marketplace.acceptOffer('999-000-0-0')
      let offer = await marketplace.getOffer('999-000-0-0')
      expect(offer.status).to.equal('accepted')
      await marketplace.initiateDispute('999-000-0-0')
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('disputed')
    })
  })

  describe('resolveDispute', () => {
    it('should resolve a disputed offer with a ruling', async () => {
      await marketplace.makeOffer('999-000-0', offerData)
      let offer = await marketplace.getOffer('999-000-0-1')
      expect(offer.status).to.equal('created')

      await marketplace.acceptOffer('999-000-0-1')
      offer = await marketplace.getOffer('999-000-0-1')
      expect(offer.status).to.equal('accepted')
      validateOffer(offer)

      await marketplace.initiateDispute('999-000-0-1')
      offer = await marketplace.getOffer('999-000-0-1')
      expect(offer.status).to.equal('disputed')

      const offerPrice = Web3.utils.toWei(offer.totalPrice.amount)

      await asAccount(contractService.web3, validArbitrator, async () => {
        await marketplace.resolveDispute('999-000-0-1', {}, 1, offerPrice)
      })
      offer = await marketplace.getOffer('999-000-0-1')

      validateOffer(offer)
      expect(offer.status).to.be.equal('ruling')
    })
  })
})

describe('Marketplace Resource - Performance mode', function() {
  const mockDiscoveryService = new Object()
  mockDiscoveryService.getListings = sinon.stub()
  mockDiscoveryService.getListing = sinon.stub()

  const marketplace = new Marketplace({
    contractService: { web3: null },
    store: new StoreMock(),
    discoveryService: mockDiscoveryService,
    perfModeEnabled: true
  })

  describe('getListings', () => {
    it('Should call discovery service to fetch listings', async () => {
      await marketplace.getListings()
      expect(mockDiscoveryService.getListings.callCount).to.equal(1)
    })
  })

  describe('getListing', () => {
    it('Should call discovery service to fetch listing', async () => {
      await marketplace.getListing()
      expect(mockDiscoveryService.getListing.callCount).to.equal(1)
    })
  })

})

