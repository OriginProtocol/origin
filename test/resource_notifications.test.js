import Notifications from '../src/resources/notifications.js'
import Listings from '../src/resources/listings.js'
import Purchases from '../src/resources/purchases.js'
import ContractService from '../src/services/contract-service'
import IpfsService from '../src/services/ipfs-service.js'
import { expect } from 'chai'
import Web3 from 'web3'

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

  let notifications, accounts, storeMock, seller, buyer_1, buyer_2

  beforeEach(async () => {
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    const contractService = new ContractService({ web3 })
    const listings = new Listings({ ipfsService, contractService })
    const purchases = new Purchases({ ipfsService, contractService })
    accounts = await web3.eth.getAccounts()
    seller = accounts[0]
    buyer_1 = accounts[2]
    buyer_2 = accounts[3]
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
  })

  describe('all', () => {
    it('should return listing purchased notifications for seller', async () => {
      const for_seller = await notifications.all(seller)
      const listingPurchased = for_seller.filter(
        ({ type }) => type === 'seller_listing_purchased'
      )
      expect(listingPurchased.length).to.be.greaterThan(0)
      expect(listingPurchased[0].id).to.exist
      expect(listingPurchased[0].status).to.equal('unread')
    })

    it('should return review received notifications for seller', async () => {
      const for_seller = await notifications.all(seller)
      const reviewReceived = for_seller.filter(
        ({ type }) => type === 'seller_review_received'
      )
      expect(reviewReceived.length).to.be.greaterThan(0)
      expect(reviewReceived[0].id).to.exist
      expect(reviewReceived[0].status).to.equal('unread')
    })

    it('should return listing shipped notifications for buyer', async () => {
      const for_seller = await notifications.all(buyer_1)
      const reviewReceived = for_seller.filter(
        ({ type }) => type === 'buyer_listing_shipped'
      )
      expect(reviewReceived.length).to.be.greaterThan(0)
      expect(reviewReceived[0].id).to.exist
      expect(reviewReceived[0].status).to.equal('unread')
    })

    it('should return review received notifications for buyer', async () => {
      const for_seller = await notifications.all(buyer_2)
      const reviewReceived = for_seller.filter(
        ({ type }) => type === 'buyer_review_received'
      )
      expect(reviewReceived.length).to.be.greaterThan(0)
      expect(reviewReceived[0].id).to.exist
      expect(reviewReceived[0].status).to.equal('unread')
    })
  })

  describe('set', () => {
    it('should allow notifications to be marked as read', async () => {
      const all = await notifications.all(seller)
      expect(all[1].status).to.equal('unread')
      all[1].status = 'read'
      notifications.set(all[1])
      const updated = await notifications.all(seller)
      expect(updated[1].status).to.equal('read')
    })
  })
})
