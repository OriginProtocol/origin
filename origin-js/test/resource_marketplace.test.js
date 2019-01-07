import sinon from 'sinon'
import { expect } from 'chai'
import Web3 from 'web3'

import Marketplace from '../src/resources/marketplace'
import contractServiceHelper from './helpers/contract-service-helper'
import asAccount from './helpers/as-account'
import { validateOffer, validateListing, validateNotification } from './helpers/schema-validation-helper'
import IpfsService from '../src/services/ipfs-service'
import { Listing } from '../src/models/listing'
import { Offer } from '../src/models/offer'

import listingValid from './fixtures/listing-valid.json'
import updatedListing from './fixtures/updated-listing.json'
import offerValid from './fixtures/offer-valid.json'
import reviewValid from './fixtures/review-valid.json'
import { OFFER_DATA_TYPE } from '../src/ipfsInterface/store'

// oddly changing an imported object here can affect other or subsequent tests that import the same file
const listingData = Object.assign({}, listingValid)
const updatedListingData = Object.assign({}, updatedListing)
const multiUnitListingData = Object.assign({}, listingValid, { unitsTotal: 2 })
const multiUnitListingWithCommissionData = Object.assign(
  {},
  multiUnitListingData,
  {
    unitsTotal: 3,
    commission: { currency: 'OGN', amount: '1.6' },
    commissionPerUnit: { currency: 'OGN', amount: '1' }
  }
)
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
const multiUnitCommissionOffer = Object.assign({}, offerData, {
  commission: { currency: 'OGN', amount: '1' }
})
const invalidMultiUnitCommissionOffer = Object.assign({}, offerData, {
  commission: { currency: 'OGN', amount: '0.9' }
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
  this.timeout(20000) // default is 2000
  let marketplace, web3, contractService, validBuyer, validArbitrator, validAffiliate,
    evilAddress, makeMaliciousOffer

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    this.userAddress = accounts[0]
    validBuyer = accounts[1]
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
      store,
      blockEpoch: await web3.eth.getBlockNumber()
    })

    // Set default account for contract calls.
    // Use helper method asAccount to make calls on behalf of a different user.
    contractService.web3.eth.defaultAccount = accounts[0]

    // Create a listing using default account.
    await marketplace.createListing(listingData)

    // Make an offer on that listing using the buyer account.
    await asAccount(contractService.web3, validBuyer, async () => {
      await marketplace.makeOffer('999-000-0', offerData)
    })

    makeMaliciousOffer = async ({ affiliate = validAffiliate, arbitrator = validArbitrator }) => {
      const ipfsHash = await marketplace.ipfsDataStore.save(OFFER_DATA_TYPE, offerData)
      const ipfsBytes = contractService.getBytes32FromIpfsHash(ipfsHash)
      const price = await contractService.moneyToUnits(listingData.price)
      const finalizes = Math.round(+new Date() / 1000) + 60 * 60 * 24 // 24 hrs
      await contractService.call(
        'V00_Marketplace',
        'makeOffer',
        [
          0,
          ipfsBytes,
          finalizes,
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

    it ('should return all detailed listings with offers', async () => {
      const listings = await marketplace.getListings({ loadOffers: true })
      expect(listings).to.have.lengthOf(1)
      expect(listings[0].offers).to.have.lengthOf(1)

      listings[0].offers.map(validateOffer)
      listings.map(validateListing)
    })

    it('should return all listing ids when idsOnly is true', async () => {
      await marketplace.createListing(listingData)
      const listings = await marketplace.getListings({ idsOnly: true })

      expect(listings).to.be.an('array')
      expect(listings.length).to.equal(2)
      expect(listings).to.deep.equal(['999-000-1', '999-000-0'])
    })

    it('should return listing data as it was when an offer was made with purchasesFor option', async () => {
      await marketplace.createListing(listingData)

      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.makeOffer('999-000-1', offerData)
      })

      await asAccount(contractService.web3, this.userAddress, async () => {
        await marketplace.updateListing('999-000-1', updatedListingData)
      })

      const listings = await marketplace.getListings({
        purchasesFor: validBuyer,
        withBlockInfo: true
      })

      expect(listings).to.be.an('array')
      expect(listings.length).to.equal(2)
      expect(listings[0].id).to.equal('999-000-1')
      expect(listings[0].title).to.equal('my listing') // not 'my listing EDITED!'
    })

    it('should return a seller\'s listings using listingsFor option', async () => {
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.createListing(listingData)
      })

      const listings = await marketplace.getListings({
        listingsFor: validBuyer
      })

      expect(listings).to.be.an('array')
      expect(listings.length).to.equal(1)
      expect(listings[0].id).to.equal('999-000-1')
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

  describe('updateListing', () => {
    it('should update a listing', async () => {
      await marketplace.updateListing('999-000-0', updatedListingData)
      const listing = await marketplace.getListing('999-000-0')
      expect(listing.title).to.equal('my listing EDITED!')
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

  describe('getOffers', () => {
    it('should get offers with data', async () => {
      const offers = await marketplace.getOffers('999-000-0')
      expect(offers.length).to.equal(1)
      expect(offers[0].status).to.equal('created')
      expect(offers[0].unitsPurchased).to.exist
      validateOffer(offers[0])
    })

    it('should exclude invalid offers', async () => {
      await marketplace.createListing(listingData)

      await marketplace.makeOffer('999-000-1', invalidPriceOffer)
      await marketplace.makeOffer('999-000-1', offerData)

      const offers = await marketplace.getOffers('999-000-1')
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
      await marketplace.createListing(listingData)
      await marketplace.makeOffer('999-000-1', originTokenOffer)
      await expect(marketplace.getOffer('999-000-1-0'))
        .to.be.rejectedWith('Invalid offer: currency does not match listing')
    })

    it('should throw an error if price is not sufficient', async () => {
      await marketplace.createListing(listingData)
      await marketplace.makeOffer('999-000-1', invalidPriceOffer)
      await expect(marketplace.getOffer('999-000-1-0'))
        .to.be.rejectedWith('Invalid offer: insufficient offer amount for listing')
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
      await marketplace.createListing(listingData)
      const anOffer = Object.assign({}, offerData, {
        totalPrice: { currency: 'ETH', amount: '0.033' }
      })
      await marketplace.makeOffer('999-000-1', anOffer)
      const offer = await marketplace.getOffer('999-000-1-0')
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
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.finalizeOffer('999-000-0-0', reviewData)
      })
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('finalized')
    })
  })

  describe('myPurchases', () => {
    it('should return a user\'s purchases with listing data as it was at the time of the offer', async () => {
      await marketplace.createListing(listingData)
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.makeOffer('999-000-1', offerData)
      })

      await asAccount(contractService.web3, this.userAddress, async () => {
        await marketplace.updateListing('999-000-1', updatedListingData)
      })

      const purchases = await marketplace.getPurchases(validBuyer)

      expect(purchases).to.be.an('array')
      expect(purchases.length).to.equal(2)
      expect(purchases[0].offer.listingId).to.equal('999-000-1')
      expect(purchases[0].listing.title).to.equal('my listing') // not 'my listing EDITED!'
    })
  })

  describe('mySales', () => {
    it('should return a seller\'s sales with listing data as it was at the time of the offer', async () => {
      await marketplace.createListing(listingData)

      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.makeOffer('999-000-1', offerData)
      })

      await asAccount(contractService.web3, this.userAddress, async () => {
        await marketplace.updateListing('999-000-1', updatedListingData)
      })

      const sales = await marketplace.getSales(this.userAddress)

      expect(sales).to.be.an('array')
      expect(sales.length).to.equal(2)
      expect(sales[0].offer.listingId).to.equal('999-000-1')
      expect(sales[0].listing.title).to.equal('my listing') // not 'my listing EDITED!'
    })
  })

  describe('sellerReview', () => {
    it('should changed the status to sellerReviewed', async () => {
      let offer = await marketplace.getOffer('999-000-0-0')
      expect(offer.status).to.equal('created')
      await marketplace.acceptOffer('999-000-0-0')
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.finalizeOffer('999-000-0-0', reviewData)
      })
      await marketplace.addData(0, offer.id, reviewData)
      offer = await marketplace.getOffer('999-000-0-0')

      validateOffer(offer)
      expect(offer.status).to.equal('sellerReviewed')
    })
  })

  describe('getListingReviews', () => {
    it('should get reviews', async () => {
      await marketplace.acceptOffer('999-000-0-0')
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.finalizeOffer('999-000-0-0', reviewData)
      })
      const reviews = await marketplace.getListingReviews('999-000-0')
      expect(reviews.length).to.equal(1)
      expect(reviews[0].rating).to.equal(3)
      expect(reviews[0].text).to.equal('Good stuff')
    })
  })

  describe('getNotifications', () => {
    let notifications

    function expectNotification(type, eventName) {
      expect(notifications.length).to.equal(1)
      validateNotification(notifications[0])
      expect(notifications[0].type).to.equal(type)
      expect(notifications[0].status).to.equal('unread')
      expect(notifications[0].event.event).to.equal(eventName)
    }

    beforeEach(async function() {
      // Before each test a listing is created with an offer from a buyer.
      // Therefore seller should receive a notification for it.
      notifications = await marketplace.getNotifications()
      expectNotification('seller_offer_created', 'OfferCreated')
    })

    it('should return notifications', async () => {
      // Seller accepts the offer. Buyer should receive a notification.
      await marketplace.acceptOffer('999-000-0-0')
      await asAccount(contractService.web3, validBuyer, async () => {
        notifications = await marketplace.getNotifications()
      })
      expectNotification('buyer_offer_accepted', 'OfferAccepted')

      // Buyer finalizes, seller should receive a notification.
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.finalizeOffer('999-000-0-0', reviewData)
      })
      notifications = await marketplace.getNotifications()
      expectNotification('seller_offer_finalized', 'OfferFinalized')

      // Seller writes a review, buyer should receive a notification.
      await marketplace.addData(0, '999-000-0-0', reviewData)
      await asAccount(contractService.web3, validBuyer, async () => {
        notifications = await marketplace.getNotifications()
      })
      expectNotification('buyer_offer_review', 'OfferData')
    })

    it('buyer should get a notifications when offer rejected by seller', async () => {
      // Seller rejects offer, buyer should receive a notification.
      await marketplace.withdrawOffer('999-000-0-0')
      await asAccount(contractService.web3, validBuyer, async () => {
        notifications = await marketplace.getNotifications()
      })
      expectNotification('buyer_offer_withdrawn', 'OfferWithdrawn')
    })

    it('seller should get a notifications when offer withdrawn by buyer', async () => {
      // Seller rejects offer, buyer should receive a notification.
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.withdrawOffer('999-000-0-0')
      })
      notifications = await marketplace.getNotifications()
      expectNotification('seller_offer_withdrawn', 'OfferWithdrawn')
    })

    it('Should get a notifications when offer disputed and ruled', async () => {
      await marketplace.acceptOffer('999-000-0-0')
      // Buyer initiates dispute, seller should get a notification.
      await asAccount(contractService.web3, validBuyer, async () => {
        await marketplace.initiateDispute('999-000-0-0')
      })
      notifications = await marketplace.getNotifications()
      expectNotification('seller_offer_disputed', 'OfferDisputed')

      // Dispute ruled, both buyer and seller should get a notification.
      await asAccount(contractService.web3, validArbitrator, async () => {
        await marketplace.resolveDispute('999-000-0-0', {}, 1, 0)
      })
      notifications = await marketplace.getNotifications()
      expectNotification('seller_offer_ruling', 'OfferRuling')

      await asAccount(contractService.web3, validBuyer, async () => {
        notifications = await marketplace.getNotifications()
      })
      expectNotification('buyer_offer_ruling', 'OfferRuling')
    })

    it('Buyer should get a notifications when offer disputed by seller', async () => {
      await marketplace.acceptOffer('999-000-0-0')
      await marketplace.initiateDispute('999-000-0-0')
      await asAccount(contractService.web3, validBuyer, async () => {
        notifications = await marketplace.getNotifications()
      })
      expectNotification('buyer_offer_disputed', 'OfferDisputed')
    })

    it('should exclude notifications for invalid offers', async () => {
      await marketplace.createListing(listingData)
      await marketplace.makeOffer('999-000-1', invalidPriceOffer)
      await marketplace.makeOffer('999-000-1', offerData)

      notifications = await marketplace.getNotifications()

      expect(notifications.length).to.equal(1)
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
      await marketplace.createListing(listingData)
      await marketplace.makeOffer('999-000-1', offerData)
      let offer = await marketplace.getOffer('999-000-1-0')
      expect(offer.status).to.equal('created')

      await marketplace.acceptOffer('999-000-1-0')
      offer = await marketplace.getOffer('999-000-1-0')
      expect(offer.status).to.equal('accepted')
      validateOffer(offer)

      await marketplace.initiateDispute('999-000-1-0')
      offer = await marketplace.getOffer('999-000-1-0')
      expect(offer.status).to.equal('disputed')

      const offerPrice = Web3.utils.toWei(offer.totalPrice.amount)

      await asAccount(contractService.web3, validArbitrator, async () => {
        await marketplace.resolveDispute('999-000-1-0', {}, 1, offerPrice)
      })
      offer = await marketplace.getOffer('999-000-1-0')

      validateOffer(offer)
      expect(offer.status).to.be.equal('ruling')
    })
  })

  describe('multi-unit (quantity=2)', () => {
    let makeOfferForTooManyUnits

    beforeEach(async () => {
      await marketplace.createListing(multiUnitListingData)
      const listings = await marketplace.getListings({ idsOnly: true })
      expect(listings).to.have.lengthOf(2)

      makeOfferForTooManyUnits = async () => {
        const offerDataTooManyUnits = Object.assign(
          {},
          offerData,
          {
            totalPrice: { currency: 'ETH', amount: '0.099' },
            unitsPurchased: 3
          }
        )
        const ipfsHash = await marketplace.ipfsDataStore.save(OFFER_DATA_TYPE, offerDataTooManyUnits)
        const ipfsBytes = contractService.getBytes32FromIpfsHash(ipfsHash)
        const price = await contractService.moneyToUnits(offerDataTooManyUnits.totalPrice)
        const finalizes = Math.round(+new Date() / 1000) + 60 * 60 * 24 // 24 hrs
        await contractService.call(
          'V00_Marketplace',
          'makeOffer',
          [
            1, // listing index
            ipfsBytes,
            finalizes,
            validAffiliate,
            0,
            price,
            emptyAddress,
            validArbitrator
          ],
          { value: price }
        )
      }
    })

    describe('makeOffer', () => {
      it('should allow 2 offers to be accepted', async () => {
        // Create first offer.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')

        await marketplace.acceptOffer('999-000-1-0')
        offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('accepted')
        validateOffer(offer1)

        // Create second offer.
        await marketplace.makeOffer('999-000-1', offerData)
        const offer2 = await marketplace.getOffer('999-000-1-1')
        expect(offer2.status).to.equal('created')
        validateOffer(offer2)
      })

      it('should not allow a 3rd offer to be accepted', async () => {
        // Create and accept first offer.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')

        await marketplace.acceptOffer('999-000-1-0')
        offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('accepted')
        validateOffer(offer1)

        // Create and accept second offer.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer2 = await marketplace.getOffer('999-000-1-1')
        expect(offer2.status).to.equal('created')

        await marketplace.acceptOffer('999-000-1-1')
        offer2 = await marketplace.getOffer('999-000-1-1')
        expect(offer2.status).to.equal('accepted')
        validateOffer(offer2)

        // Try to create third offer and expect failure.
        await expect(marketplace.makeOffer('999-000-1', offerData))
          .to.be.rejectedWith('units purchased exceeds units available')
      })

      it('should reject an offer for too many units', async() => {
        await marketplace.makeOffer('999-000-1', offerData)
        const invalidOfferData = Object.assign({}, offerData, { unitsPurchased: 3 })
        await expect(marketplace.makeOffer('999-000-1', invalidOfferData))
          .to.be.rejectedWith('units purchased exceeds units available')
      })
    })

    describe('getOffers', () => {
      describe('getOffers: idsOnly=true', () => {
        it('should get offer ids', async () => {
          await marketplace.makeOffer('999-000-1', offerData)
          await marketplace.makeOffer('999-000-1', offerData)
          const offers = await marketplace.getOffers('999-000-1', { idsOnly: true })

          expect(offers).be.an('array')
          expect(offers).to.have.lengthOf(2)
          expect(offers[0]).to.equal('999-000-1-0')
          expect(offers[1]).to.equal('999-000-1-1')
        })
      })

      it('should filter offers with insufficient value', async () => {
        // Create offer for 2 units but a value that only covers 1 unit.
        // This succeeds, because marketplace.makeOffer() doesn't validate
        // price.
        expect(offerData.unitsPurchased).to.equal(1)
        const undervaluedOfferData = Object.assign({}, offerData, { unitsPurchased: 2 })
        await marketplace.makeOffer('999-000-1', undervaluedOfferData)

        // Create valid offer.
        await marketplace.makeOffer('999-000-1', offerData)
        const validOffer = await marketplace.getOffer('999-000-1-1')
        expect(validOffer.status).to.equal('created')
        validateOffer(validOffer)

        // getOffers filters out invalid offers.
        const offers = await marketplace.getOffers('999-000-1')
        expect(offers).be.an('array')
        expect(offers).to.have.lengthOf(1)
        expect(offers[0].unitsPurchased).to.equal(1)
      })

      it('should filter offers for units that exceed available units', async () => {
        await makeOfferForTooManyUnits()

        // Create valid offer for 1 unit.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer1 = await marketplace.getOffer('999-000-1-1')
        expect(offer1.status).to.equal('created')
        validateOffer(offer1)

        // getOffers filters out invalid offers.
        const offers = await marketplace.getOffers('999-000-1')
        expect(offers).be.an('array')
        expect(offers).to.have.lengthOf(1)
        expect(offers[0].id).to.equal('999-000-1-1')
        expect(offers[0].unitsPurchased).to.equal(1)
      })
    })

    describe('getOffer', () => {
      it('should throw an error for an offer with insufficient value', async () => {
        // Create offer for 2 units but a value that only covers 1 unit.
        // This succeeds, because marketplace.makeOffer() doesn't validate
        // price.
        expect(offerData.unitsPurchased).to.equal(1)
        const undervaluedOfferData = Object.assign({}, offerData, { unitsPurchased: 2 })
        await marketplace.makeOffer('999-000-1', undervaluedOfferData)

        // getOffer fails, because this is where we do validation.
        await expect(marketplace.getOffer('999-000-1-0'))
          .to.be.rejectedWith('Invalid offer: insufficient offer amount for listing')
      })
    })

    describe('acceptOffer', () => {
      it('should throw an error for offers for excessive quantity', async () => {
        await makeOfferForTooManyUnits()
        await expect(marketplace.acceptOffer('999-000-1-0'))
          .to.be.rejectedWith('cannot accept invalid offer 999-000-1-0')
      })

      it('should throw an error for an offer with insufficient value', async () => {
        // Create offer for 2 units but a value that only covers 1 unit.
        // This succeeds, because marketplace.makeOffer() doesn't validate
        // price.
        expect(offerData.unitsPurchased).to.equal(1)
        const undervaluedOfferData = Object.assign({}, offerData, { unitsPurchased: 2 })
        await marketplace.makeOffer('999-000-1', undervaluedOfferData)
        await expect(marketplace.acceptOffer('999-000-1-0'))
          .to.be.rejectedWith('cannot accept invalid offer 999-000-1-0')
      })

      it('should not deduct units available for withdrawn offers', async function() {
        this.timeout(35000)

        // Create and accept offer for 1 unit.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')
        await marketplace.acceptOffer('999-000-1-0')
        await marketplace.finalizeOffer('999-000-1-0', reviewData)
        validateOffer(offer1)
        offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('finalized')

        // Create and withdraw an offer for 1 unit.
        await marketplace.makeOffer('999-000-1', offerData)
        const offer2 = await marketplace.getOffer('999-000-1-1')
        expect(offer2.status).to.equal('created')
        await marketplace.withdrawOffer('999-000-1-1')

        // Create and accept another offer for 1 unit.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer3 = await marketplace.getOffer('999-000-1-2')
        expect(offer3.status).to.equal('created')
        await marketplace.acceptOffer('999-000-1-2')
        offer3 = await marketplace.getOffer('999-000-1-2')
        expect(offer3.status).to.equal('accepted')
        validateOffer(offer3)
      })
    })

    describe('updateListing', () => {
      it('should allow inventory to be increased', async () => {
        const newUnitsTotal = multiUnitListingData.unitsTotal + 1
        const newOfferData = Object.assign(
          {},
          offerData,
          { unitsPurchased: newUnitsTotal }
        )

        // Make an offer for too many units, which should fail.
        await expect(marketplace.makeOffer('999-000-1', newOfferData))
          .to.be.rejectedWith('units purchased exceeds units available')

        // Increase units for listing.
        const newListingData = Object.assign(
          {},
          multiUnitListingData,
          { unitsTotal: newUnitsTotal }
        )
        await marketplace.updateListing('999-000-1', newListingData)

        // Create and accept offer for new number of units.
        await marketplace.makeOffer('999-000-1', offerData)
        let offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')
        await marketplace.acceptOffer('999-000-1-0')
        offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('accepted')
      })

      it('should allow inventory to be decreased', async () => {
        await marketplace.makeOffer('999-000-1', offerData)
        let offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')
        await marketplace.acceptOffer('999-000-1-0')
        offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('accepted')

        const newListingData = Object.assign(
          {},
          multiUnitListingData,
          { unitsTotal: 1 }
        )
        await marketplace.updateListing('999-000-1', newListingData)

        const listing = await marketplace.getListing('999-000-1')
        const offers = await marketplace.getOffers('999-000-1')
        const unitsAvailable = await marketplace.unitsAvailable(listing, offers)
        expect(unitsAvailable).to.equal(0)
      })

      it('should throw an error if decreasing inventory invalidates accepted offers', async () => {
        const newOfferData = Object.assign({}, offerData, {
          unitsPurchased: 2,
          totalPrice: { currency: 'ETH', amount: '0.066' }
        })
        await marketplace.makeOffer('999-000-1', newOfferData)
        let offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')
        await marketplace.acceptOffer('999-000-1-0')
        offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('accepted')

        // This decrease in units is invalid, because all units were purchased
        // above.
        const newListingData = Object.assign(
          {},
          multiUnitListingData,
          { unitsTotal: 1 }
        )
        await expect(marketplace.updateListing('999-000-1', newListingData))
          .to.be.rejectedWith('new unitsTotal insufficient to cover accepted offers')
      })
    })
  })

  describe('multi-unit (quantity=3) with commission', () => {
    beforeEach(async () => {
      await marketplace.createListing(multiUnitListingWithCommissionData)
      const listings = await marketplace.getListings({ idsOnly: true })
      expect(listings).to.have.lengthOf(2)
    })

    describe('makeOffer', () => {
      it('should allow 3 offers to be accepted', async function() {
        // Without the discovery server, this test is slow. To allow CI to pass,
        // we increase the timeout.
        // TODO: optimize this test, if possible
        this.timeout(35000)

        // Create first offer, for which there is sufficient listing commission
        // for an offer with full commission.
        const offer1Data = Object.assign({}, multiUnitCommissionOffer,
          { commission: { currency: 'OGN', amount: '1' } }
        )
        await marketplace.makeOffer('999-000-1', offer1Data)
        await marketplace.acceptOffer('999-000-1-0')
        const offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('accepted')
        validateOffer(offer1)

        // Create second offer, for which there is partial commission available
        // in the listing.
        const offer2Data = Object.assign({}, multiUnitCommissionOffer,
          { commission: { currency: 'OGN', amount: '0.6' } }
        )
        await marketplace.makeOffer('999-000-1', offer2Data)
        await marketplace.acceptOffer('999-000-1-1')
        const offer2 = await marketplace.getOffer('999-000-1-1')
        expect(offer2.status).to.equal('accepted')
        validateOffer(offer2)

        // Create third offer, for which there is no commission remaining on
        // the listing.
        const offer3Data = Object.assign({}, multiUnitCommissionOffer,
          { commission: { currency: 'OGN', amount: '0' } }
        )
        await marketplace.makeOffer('999-000-1', offer3Data)
        await marketplace.acceptOffer('999-000-1-2')
        const offer3 = await marketplace.getOffer('999-000-1-2')
        expect(offer3.status).to.equal('accepted')
        validateOffer(offer3)

        const offers = await marketplace.getOffers('999-000-1')
        expect(offers.length).to.equal(3)
        expect(offers[0].id).to.equal('999-000-1-0')
        expect(offers[1].id).to.equal('999-000-1-1')
        expect(offers[2].id).to.equal('999-000-1-2')
      })
    })

    describe('getOffers', () => {
      it('should filter offers with insufficient per-unit commission', async () => {
        await marketplace.makeOffer('999-000-1', multiUnitCommissionOffer)
        const offer1 = await marketplace.getOffer('999-000-1-0')
        expect(offer1.status).to.equal('created')

        await marketplace.makeOffer('999-000-1', invalidMultiUnitCommissionOffer)
        const offer2 = await marketplace.getOffer('999-000-1-1')
        expect(offer2.status).to.equal('created')

        const offers = await marketplace.getOffers('999-000-1')
        expect(offers.length).to.equal(1)
        expect(offers).not.to.include(invalidMultiUnitCommissionOffer)
        expect(offers[0].status).to.equal('created')
        expect(offers[0].id).to.equal('999-000-1-0')
      })
    })
  })
})

describe('Marketplace Resource - Performance mode', function() {
  const unitListingData = Object.assign({}, listingValid, { type: 'unit' })
  const unitListing = Listing.init('1-000-123', {}, unitListingData)
  const unitListing2 = Listing.init('1-000-124', {}, unitListingData)
  const unitOffer1 = Offer.init('1-000-123-1', '1-000-123', {}, offerValid)
  const unitOffer2 = Offer.init('1-000-123-2', '1-000-123', {}, offerValid)

  const fracListingData = Object.assign({}, listingValid, { type: 'fractional' })
  const fracListing = Listing.init('1-000-456', {}, fracListingData)
  const fracOffer1 = Offer.init('1-000-456-1', '1-000-123', {}, offerValid)
  const fracOffer2 = Offer.init('1-000-456-2', '1-000-123', {}, offerValid)

  const mockDiscoveryService = new Object()
  mockDiscoveryService.getListings = sinon.stub()
  mockDiscoveryService.getOffer = sinon.stub()

  const marketplace = new Marketplace({
    contractService: { web3: null },
    store: new StoreMock(),
    discoveryService: mockDiscoveryService,
    perfModeEnabled: true
  })

  describe('getListings', () => {
    it('Should call discovery service to fetch listings', async () => {
      mockDiscoveryService.getListings = sinon.stub().resolves([ unitListing, unitListing2 ])
      mockDiscoveryService.getOffers = sinon.stub().resolves([ unitOffer1 ])
      await marketplace.getListings()
      expect(mockDiscoveryService.getListings.callCount).to.equal(1)
      expect(mockDiscoveryService.getOffers.callCount).to.equal(0)
    })
  })

  describe('getListings', () => {
    it('Should call discovery service to fetch listings and also call getOffers', async () => {
      mockDiscoveryService.getListings = sinon.stub().resolves([ unitListing, unitListing2  ])
      mockDiscoveryService.getOffers = sinon.stub().resolves([ unitOffer1 ])
      await marketplace.getListings({ loadOffers: true })
      expect(mockDiscoveryService.getListings.callCount).to.equal(1)
      expect(mockDiscoveryService.getOffers.callCount).to.equal(2)
    })
  })

  describe('getListing', () => {
    it('Should call discovery service to fetch a listing', async () => {
      mockDiscoveryService.getListing = sinon.stub().resolves(unitListing)
      await marketplace.getListing()
      expect(mockDiscoveryService.getListing.callCount).to.equal(1)
    })
  })

  describe('getOffers', () => {
    it('Should filter out invalid offers on multi-units listing', async () => {
      mockDiscoveryService.getListing = sinon.stub().resolves(unitListing)
      mockDiscoveryService.getOffers = sinon.stub().resolves([unitOffer1, unitOffer2])
      const offers = await marketplace.getOffers()
      expect(mockDiscoveryService.getOffers.callCount).to.equal(1)
      // 2 offers and unitsTotal is 1 => 1 offer should get filtered out.
      expect(offers.length).to.equal(1)
    })

    it('Should not filter out any offer on fractional listing', async () => {
      mockDiscoveryService.getListing = sinon.stub().resolves(fracListing)
      mockDiscoveryService.getOffers = sinon.stub().resolves([fracOffer1, fracOffer2])
      const offers = await marketplace.getOffers()
      expect(mockDiscoveryService.getOffers.callCount).to.equal(1)
      expect(offers.length).to.equal(2)
    })
  })

  describe('getOffer', () => {
    it('Should call discovery service to fetch an offer', async () => {
      await marketplace.getOffer()
      expect(mockDiscoveryService.getOffer.callCount).to.equal(1)
    })
  })
})
