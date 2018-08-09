import Notifications from '../src/resources/notifications.js'
import Listings from '../src/resources/listings.js'
import Purchases from '../src/resources/purchases.js'
import IpfsService from '../src/services/ipfs-service.js'
import { expect } from 'chai'
import Web3 from 'web3'
import asAccount from './helpers/as-account'
import contractServiceHelper from './helpers/contract-service-helper'

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

describe('Notification Resource', function() {
  this.timeout(10000) // default is 2000

  let notifications,
    accounts,
    storeMock,
    seller,
    buyer,
    listings,
    contractService,
    createListing,
    buyListing,
    sellerConfirmShipped,
    buyerConfirmReceipt,
    sellerGetPayout,
    purchases

  beforeEach(async () => {
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    contractService = await contractServiceHelper(web3)
    listings = new Listings({ ipfsService, contractService })
    purchases = new Purchases({ ipfsService, contractService })
    accounts = await web3.eth.getAccounts()
    seller = accounts[0]
    buyer = accounts[2]
    storeMock = new StoreMock()
    storeMock.set(
      'notification_subscription_start',
      new Date('2017-01-01').getTime()
    )
    notifications = new Notifications({
      contractService,
      listings,
      purchases,
      store: storeMock
    })

    createListing = async () => {
      const txObj = await listings.create(
        { name: 'Sample Listing 1', price: 1 },
        ''
      )
      return txObj.transactionReceipt.events.NewListing.returnValues._address
    }

    buyListing = async listingAddress => {
      return await asAccount(contractService.web3, buyer, async () => {
        const listingTransactionObj = await listings.buy(listingAddress, 1, 1)
        return listingTransactionObj.transactionReceipt.events.ListingPurchased
          .returnValues._purchaseContract
      })
    }

    sellerConfirmShipped = async purchaseAddress => {
      await purchases.sellerConfirmShipped(purchaseAddress)
    }

    buyerConfirmReceipt = async purchaseAddress => {
      await asAccount(contractService.web3, buyer, async () => {
        await purchases.buyerConfirmReceipt(purchaseAddress)
      })
    }

    sellerGetPayout = async purchaseAddress => {
      await purchases.sellerGetPayout(purchaseAddress)
    }
  })

  describe('all', () => {
    it('should return listing purchased notifications for seller', async () => {
      const listingAddress = await createListing()
      await buyListing(listingAddress)

      const for_seller = await notifications.all(seller)
      const listingPurchased = for_seller.filter(
        ({ type }) => type === 'seller_listing_purchased'
      )
      expect(listingPurchased.length).to.equal(1)
      expect(listingPurchased[0].id).to.exist
      expect(listingPurchased[0].status).to.equal('unread')
    })

    it('should return review received notifications for seller', async () => {
      const listingAddress = await createListing()
      const purchaseAddress = await buyListing(listingAddress)
      await sellerConfirmShipped(purchaseAddress)
      await buyerConfirmReceipt(purchaseAddress)

      const for_seller = await notifications.all(seller)
      const reviewReceived = for_seller.filter(
        ({ type }) => type === 'seller_review_received'
      )
      expect(reviewReceived.length).to.equal(1)
      expect(reviewReceived[0].id).to.exist
      expect(reviewReceived[0].status).to.equal('unread')
    })

    it('should return listing shipped notifications for buyer', async () => {
      const listingAddress = await createListing()
      const purchaseAddress = await buyListing(listingAddress)
      await sellerConfirmShipped(purchaseAddress)

      const for_buyer = await notifications.all(buyer)
      const reviewReceived = for_buyer.filter(
        ({ type }) => type === 'buyer_listing_shipped'
      )
      expect(reviewReceived.length).to.equal(1)
      expect(reviewReceived[0].id).to.exist
      expect(reviewReceived[0].status).to.equal('unread')
    })

    it('should return review received notifications for buyer', async () => {
      const listingAddress = await createListing()
      const purchaseAddress = await buyListing(listingAddress)
      await sellerConfirmShipped(purchaseAddress)
      await buyerConfirmReceipt(purchaseAddress)
      await sellerGetPayout(purchaseAddress)

      const for_buyer = await notifications.all(buyer)
      const reviewReceived = for_buyer.filter(
        ({ type }) => type === 'buyer_review_received'
      )
      expect(reviewReceived.length).to.equal(1)
      expect(reviewReceived[0].id).to.exist
      expect(reviewReceived[0].status).to.equal('unread')
    })
  })

  describe('set', () => {
    it('should allow notifications to be marked as read', async () => {
      const listingAddress = await createListing()
      await buyListing(listingAddress)

      const all = await notifications.all(seller)
      expect(all[0].status).to.equal('unread')
      all[0].status = 'read'
      notifications.set(all[0])
      const updated = await notifications.all(seller)
      expect(updated[0].status).to.equal('read')
    })
  })
})
