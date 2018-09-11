import Marketplace from '../src/resources/marketplace.js'
import contractServiceHelper from './helpers/contract-service-helper'
import IpfsService from '../src/services/ipfs-service.js'
import { expect } from 'chai'
import Web3 from 'web3'
import listingValid from './fixtures/listing-valid.json'
import offerValid from './fixtures/offer-valid.json'
import reviewValid from './fixtures/review-valid.json'

// oddly changing an imported object here can affect other or subsequent tests that import the same file
const listingData = Object.assign({}, listingValid)
const offerData = Object.assign({}, offerValid)
const reviewData = Object.assign({}, reviewValid)

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
  this.timeout(10000) // default is 2000
  let marketplace, web3

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    web3 = new Web3(provider)
    const contractService = await contractServiceHelper(web3)
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
      store
    })

    await marketplace.createListing(listingData)
    await marketplace.makeOffer('999-001-0', offerData)
  })

  describe('getListingsCount', () => {
    it('should return the count of listings', async () => {
      const listingCount = await marketplace.getListingsCount()
      expect(listingCount).to.equal(1)
    })
  })

  describe('getListings', () => {
    it('should return all listings', async () => {
      await marketplace.createListing(listingData)
      const listings = await marketplace.getListings()
      expect(listings.length).to.equal(2)
      expect(listings).to.include('999-001-0')
      expect(listings).to.include('999-001-1')
    })
  })

  describe('getListing', () => {
    it('should return details of a listing', async () => {
      const listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      const listing = await marketplace.getListing(listings[0])
      expect(listing.type).to.equal('unit')
      expect(listing.title).to.equal('my listing')
      expect(listing.description).to.equal('my description')
    })
  })

  describe('createListing', () => {
    it('should create a listing', async () => {
      let listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      await marketplace.createListing(listingData)
      listings = await marketplace.getListings()
      expect(listings.length).to.equal(2)
    })
  })

  // TODO: either don't return withdrawn listings, or have some property that indicates withdraws status
  describe.skip('withdrawListing', () => {
    it('should delete a listing', async () => {
      let listings = await marketplace.getListings()
      expect(listings.length).to.equal(1)
      await marketplace.withdrawListing(listings[0], {})
      listings = await marketplace.getListings()
      expect(listings.length).to.equal(0)
    })
  })

  describe('getOffers: idsOnly=true', () => {
    it('should get offer ids', async () => {
      await marketplace.makeOffer('999-001-0', offerData)
      const offers = await marketplace.getOffers('999-001-0', { idsOnly: true })
      expect(offers.length).to.equal(2)
      expect(offers[0]).to.equal('999-001-0-0')
      expect(offers[1]).to.equal('999-001-0-1')
    })
  })

  describe('getOffers', () => {
    it('should get offers with data', async () => {
      await marketplace.makeOffer('999-001-0', offerData)
      const offers = await marketplace.getOffers('999-001-0')
      expect(offers.length).to.equal(2)
      expect(offers[0].status).to.equal('created')
      expect(offers[0].unitsPurchased).to.exist
      expect(offers[1].status).to.equal('created')
      expect(offers[1].unitsPurchased).to.exist
    })
  })

  describe('getOffer', () => {
    it('should get offer data', async () => {
      const offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('created')
      expect(offer.unitsPurchased).to.exist
    })
  })

  describe('makeOffer', () => {
    it('should make an offer', async () => {
      const anotherOffer = Object.assign({}, offerData, {
        totalPrice: { currency: 'ETH', amount: '0.02' }
      })
      await marketplace.makeOffer('999-001-0', anotherOffer)
      const offer = await marketplace.getOffer('999-001-0-1')
      expect(offer.totalPrice.amount).to.equal('0.02')
    })
  })

  describe('acceptOffer', () => {
    it('should changed the status to accepted', async () => {
      let offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-001-0-0')
      offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('accepted')
    })
  })

  describe('finalizeOffer', () => {
    it('should changed the status to finalized', async () => {
      let offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-001-0-0')
      await marketplace.finalizeOffer('999-001-0-0', reviewData)
      offer = await marketplace.getOffer('999-001-0-0')
      expect(offer.status).to.equal('finalized')
    })
  })

  describe('getListingReviews', () => {
    it('should get reviews', async () => {
      await marketplace.acceptOffer('999-001-0-0')
      await marketplace.finalizeOffer('999-001-0-0', reviewData)
      const reviews = await marketplace.getListingReviews('999-001-0')
      expect(reviews.length).to.equal(1)
      expect(reviews[0].rating).to.equal(3)
      expect(reviews[0].text).to.equal('Good stuff')
    })
  })

  describe('getNotifications', () => {
    it('should return notifications', async () => {
      let notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      expect(notifications[0].type).to.equal('seller_listing_purchased')
      expect(notifications[0].status).to.equal('unread')

      await marketplace.acceptOffer('999-001-0-0')
      notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      expect(notifications[0].type).to.equal('buyer_listing_shipped')
      expect(notifications[0].status).to.equal('unread')

      await marketplace.finalizeOffer('999-001-0-0', reviewData)
      notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      expect(notifications[0].type).to.equal('seller_review_received')
      expect(notifications[0].status).to.equal('unread')
    })
  })

  describe('setNotification', () => {
    it('should allow notifications to be marked as read', async () => {
      let notifications = await marketplace.getNotifications()
      expect(notifications.length).to.equal(1)
      expect(notifications[0].status).to.equal('unread')
      notifications[0].status = 'read'
      marketplace.setNotification(notifications[0])
      notifications = await marketplace.getNotifications()
      expect(notifications[0].status).to.equal('read')
    })
  })
})
