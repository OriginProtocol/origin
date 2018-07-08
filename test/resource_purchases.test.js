import { expect } from 'chai'
import Listings from '../src/resources/listings.js'
import Purchase from '../src/resources/purchases.js'
import Review from '../src/resources/reviews.js'
import ContractService from '../src/services/contract-service'
import IpfsService from '../src/services/ipfs-service.js'
import Web3 from 'web3'
import asAccount from './helpers/as-account'
import fetchMock from 'fetch-mock'

describe('Purchase Resource', function() {
  this.timeout(5000) // default is 2000

  let listings
  let listing
  let purchases
  let purchase
  let reviews
  let contractService
  let ipfsService
  let web3
  let buyer

  before(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    listings = new Listings({ contractService, ipfsService })
    purchases = new Purchase({ contractService, ipfsService })
    reviews = new Review({ contractService, ipfsService })
    const accounts = await web3.eth.getAccounts()
    buyer = accounts[1]
  })

  // Helpers
  // -----

  const resetUnitListingAndPurchase = async () => {
    // Create a new listing and a new purchase for the tests to use.
    const listingData = {
      name: 'Australorp Rooser',
      category: 'For Sale',
      location: 'Atlanta, GA',
      description:
        'Peaceful and dignified, Australorps are an absolutely delightful bird which we highly recommend to anyone who wants a pet chicken that lays dependably.',
      pictures: undefined,
      price: 0.2
    }
    const schema = 'for-sale'
    const listingTransaction = await listings.create(listingData, schema)

    const listingEvent = listingTransaction.events.NewListing
    listing = await listings.getByIndex(listingEvent.returnValues._index)

    // Buy listing to create a purchase
    const purchaseTransaction = await asAccount(
      contractService.web3,
      buyer,
      async () => {
        return await listings.buy(listing.address, 1, listing.price - 0.1)
      }
    )
    const purchaseEvent = purchaseTransaction.events.ListingPurchased
    purchase = await purchases.get(purchaseEvent.returnValues._purchaseContract)
  }

  const resetFractionalListingAndPurchase = async () => {
    // Create a new listing and a new purchase for the tests to use.
    const listingData = {
      name: 'Australorp Rooser',
      category: 'For Rent',
      location: 'Atlanta, GA',
      description:
        'Peaceful and dignified, Australorps are an absolutely delightful bird which we highly recommend to anyone who wants a pet chicken that lays dependably.',
      pictures: undefined,
      priceWei: 2000,
      listingType: 'fractional'
    }
    const listingTransaction = await listings.create(listingData)

    const listingEvent = listingTransaction.events.NewListing
    listing = await listings.getByIndex(listingEvent.returnValues._index)

    // Buy listing to create a purchase
    const purchaseData = {
      slot: {}
    }
    const purchaseTransaction = await asAccount(
      contractService.web3,
      buyer,
      async () => {
        return await listings.request(listing.address, purchaseData, 1)
      }
    )
    const purchaseEvent = purchaseTransaction.events.ListingPurchased
    purchase = await purchases.get(purchaseEvent.returnValues._purchaseContract)
  }

  const reloadPurchase = async function() {
    purchase = await purchases.get(purchase.address)
  }

  const expectStage = function(expectedStage) {
    expect(purchase.stage).to.equal(expectedStage)
  }

  // Tests
  // -----

  describe('simple purchase flow: unit listing', async () => {
    before(async () => {
      await resetUnitListingAndPurchase()
    })

    it('should get a purchase', async () => {
      expectStage('awaiting_payment')
      expect(purchase.listingAddress).to.equal(listing.address)
      expect(purchase.buyerAddress).to.equal(buyer)
    })

    it('should allow the buyer to pay', async () => {
      expectStage('awaiting_payment')
      await asAccount(contractService.web3, buyer, async () => {
        await purchases.pay(
          purchase.address,
          contractService.web3.utils.toWei('0.1', 'ether')
        )
      })
      await reloadPurchase()
      expectStage('in_escrow')
    })

    it('should allow the seller to mark as shipped', async () => {
      expectStage('in_escrow')
      await purchases.sellerConfirmShipped(purchase.address)
      await reloadPurchase()
      expectStage('buyer_pending')
    })

    it('should allow the buyer to mark a purchase received', async () => {
      expectStage('buyer_pending')
      await asAccount(contractService.web3, buyer, async () => {
        await purchases.buyerConfirmReceipt(purchase.address, { rating: 3 })
      })
      await reloadPurchase()
      expectStage('seller_pending')
    })

    it('should allow the seller to collect money', async () => {
      expectStage('seller_pending')
      const reviewText = 'Some delay before marking purchase recieved'
      await purchases.sellerGetPayout(purchase.address, {
        rating: 4,
        reviewText: reviewText
      })
      await reloadPurchase()
      expectStage('complete')
      const purchaseReviews = await reviews.find({
        purchaseAddress: purchase.address
      })
      expect(purchaseReviews[1].rating).to.equal(4)
      expect(purchaseReviews[1].revieweeAddress).to.equal(purchase.buyerAddress)
      expect(purchaseReviews[1].revieweeRole).to.equal('BUYER')
    })

    it('should list logs', async () => {
      const logs = await purchases.getLogs(purchase.address)
      expect(logs[0].stage).to.equal('awaiting_payment')
      expect(logs[1].stage).to.equal('in_escrow')
      expect(logs[2].stage).to.equal('buyer_pending')
      expect(logs[3].stage).to.equal('seller_pending')
      expect(logs[4].stage).to.equal('complete')
    })
  })

  describe('simple purchase flow: fractional listing', async () => {
    before(async () => {
      await resetFractionalListingAndPurchase()
    })

    it('should get a purchase', async () => {
      expect(purchase.listingAddress).to.equal(listing.address)
      expect(purchase.buyerAddress).to.equal(buyer)
      expectStage('awaiting_seller_approval')
    })

    it('should allow the seller to approve', async () => {
      await purchases.sellerApprove(purchase.address)
      await reloadPurchase()
      expectStage('buyer_pending')
    })

    it('should allow the buyer to mark a purchase received', async () => {
      await asAccount(contractService.web3, buyer, async () => {
        await purchases.buyerConfirmReceipt(purchase.address, { rating: 3 })
      })
      await reloadPurchase()
      expectStage('seller_pending')
    })

    it('should allow the seller to collect money', async () => {
      expectStage('seller_pending')
      const reviewText = 'Some delay before marking purchase recieved'
      await purchases.sellerGetPayout(purchase.address, {
        rating: 4,
        reviewText: reviewText
      })
      await reloadPurchase()
      expectStage('complete')
      const purchaseReviews = await reviews.find({
        purchaseAddress: purchase.address
      })
      expect(purchaseReviews[1].rating).to.equal(4)
      expect(purchaseReviews[1].revieweeAddress).to.equal(purchase.buyerAddress)
      expect(purchaseReviews[1].revieweeRole).to.equal('BUYER')
    })

    it('should list logs', async () => {
      const logs = await purchases.getLogs(purchase.address)
      expect(logs[0].stage).to.equal('awaiting_payment')
      expect(logs[1].stage).to.equal('awaiting_seller_approval')
      expect(logs[2].stage).to.equal('buyer_pending')
      expect(logs[3].stage).to.equal('seller_pending')
      expect(logs[4].stage).to.equal('complete')
    })
  })

  describe('transactions have a whenMined promise', async () => {
    before(async () => {
      await resetUnitListingAndPurchase()
    })

    it('should allow us to wait for a transaction to be mined', async () => {
      const transaction = await purchases.pay(
        purchase.address,
        contractService.web3.utils.toWei('0.1', 'ether')
      )
      await transaction.whenFinished()
    })
  })

  describe('all', () => {
    it('should get all purchases', async () => {
      const fetch = fetchMock.sandbox().mock(
        (requestUrl, opts) => {
          expect(opts.method).to.equal('GET')
          expect(requestUrl).to.equal('http://hello.world/api/purchase')
          return true
        },
        {
          body: JSON.stringify({
            objects: [
              {
                contract_address: '0xefb3fd7f9260874d8afd7cb4b42183babea0ca1b',
                stage: 'in_escrow',
                listing_address: '0x05a52d9a9e9e91c6932ec2af7bf0c127660fa181',
                buyer_address: '0x627306090abab3a6e1400e9345bc60c78a8bef57',
                created_at: 1524492517,
                buyer_timeout: 0
              }
            ]
          })
        }
      )
      const purchases = new Purchase({
        contractService,
        ipfsService,
        fetch,
        indexingServerUrl: 'http://hello.world/api'
      })
      const all = await purchases.all()
      expect(all.length).to.equal(1)
      const first = all[0]
      expect(first.address).to.equal(
        '0xefb3fd7f9260874d8afd7cb4b42183babea0ca1b'
      )
      expect(first.stage).to.equal('in_escrow')
      expect(first.created).to.equal(1524492517)
    })
  })
})
