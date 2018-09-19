import { Listing } from '../models/listing'
import { Offer } from '../models/offer'
import { Review } from '../models/review'
import { Notification } from '../models/notification'
import { notificationStatuses, storeKeys } from '../models/notification'
import { generateListingId, generateOfferId } from '../utils/id'
import {
  LISTING_DATA_TYPE,
  LISTING_WITHDRAW_DATA_TYPE,
  OFFER_DATA_TYPE,
  OFFER_WITHDRAW_DATA_TYPE,
  OFFER_ACCEPT_DATA_TYPE,
  DISPUTE_DATA_TYPE,
  RESOLUTION_DATA_TYPE,
  REVIEW_DATA_TYPE,
  IpfsDataStore,
} from '../services/data-store-service'
import MarketplaceResolver from '../adapters/marketplace/_resolver'

class Marketplace {
  constructor({ contractService, ipfsService, store }) {
    this.contractService = contractService
    this.ipfsService = ipfsService
    this.ipfsDataStore = new IpfsDataStore(this.ipfsService)
    this.resolver = new MarketplaceResolver(...arguments)

    // initialize notifications
    if (!store.get(storeKeys.notificationSubscriptionStart)) {
      store.set(storeKeys.notificationSubscriptionStart, Date.now())
    }
    if (!store.get(storeKeys.notificationStatuses)) {
      store.set(storeKeys.notificationStatuses, {})
    }
    this.store = store
  }

  async getListingsCount() {
    return await this.resolver.getListingsCount()
  }

  async getListings(opts = {}) {
    const listingIds = await this.resolver.getListingIds(opts)

    if (opts.idsOnly) {
      return listingIds
    }

    return Promise.all(
      listingIds.map(async listingId => {
        return await this.getListing(listingId)
      })
    )
  }

  /**
   * Returns a Listing object based in its id.
   * @param listingId
   * @returns {Promise<Listing>}
   * @throws {Error}
   */
  async getListing(listingId) {
    // Get the on-chain listing data.
    const chainListing = await this.resolver.getListing(listingId)

    // Get the off-chain listing data from IPFS.
    const ipfsHash = this.contractService.getIpfsHashFromBytes32(
      chainListing.ipfsHash
    )
    const ipfsListing = await this.ipfsDataStore.load(LISTING_DATA_TYPE, ipfsHash)

    // Create and return a Listing from on-chain and off-chain data .
    return new Listing(listingId, chainListing, ipfsListing)
  }

  // async getOffersCount(listingId) {}

  async getOffers(listingId, opts = {}) {
    const offerIds = await this.resolver.getOfferIds(listingId, opts)
    if (opts.idsOnly) {
      return offerIds
    } else {
      const allOffers = await Promise.all(
        offerIds.map(async offerId => {
          try {
            return await this.getOffer(offerId)
          } catch(e) {
            return null
          }
        })
      )
      // filter out invalid offers
      return allOffers.filter(offer => Boolean(offer))
    }
  }

  /**
   * Returns an offer based on its id.
   * @param {string}offerId - Unique offer Id.
   * @return {Promise<Offer>} - models/Offer object
   */
  async getOffer(offerId) {
    // Load chain data.
    const { chainOffer, listingId } = await this.resolver.getOffer(offerId)

    // Load ipfs data.
    const ipfsHash = this.contractService.getIpfsHashFromBytes32(
      chainOffer.ipfsHash
    )
    const ipfsOffer = await this.ipfsDataStore.load(OFFER_DATA_TYPE, ipfsHash)

    // validate offers awaiting approval
    if (chainOffer.status === 'created') {
      const listing = await this.getListing(listingId)

      const listingCurrency = listing.price && listing.price.currency
      const listingPrice = this.contractService.moneyToUnits(listing.price)
      const listingCommision = this.contractService.moneyToUnits(listing.commission)
      const currency = this.contractService.currencies[listingCurrency]
      const currencyAddress = currency && currency.address

      if (currencyAddress !== chainOffer.currency) {
        throw new Error('Invalid offer: currency does not match listing')
      }

      if (listingPrice > chainOffer.value) {
        throw new Error('Invalid offer: insufficient offer amount for listing')
      }

      if (listingCommision > chainOffer.commission) {
        throw new Error('Invalid offer: insufficient commission amount for listing')
      }
    }

    // Create an Offer from on-chain and off-chain data.
    return new Offer(offerId, listingId, chainOffer, ipfsOffer)
  }

  /**
   * Creates a new listing in the system. Data is recorded both on-chain and off-chain in IPFS.
   * @param {object} data - Listing data to store in IPFS
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{listingId, ...transactionReceipt}>}
   */
  async createListing(ipfsData, confirmationCallback) {
    // Validate and save the data to IPFS.
    const ipfsHash = await this.ipfsDataStore.save(LISTING_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.createListing(
      ipfsBytes,
      ipfsData,
      confirmationCallback
    )
  }

  // updateListing(listingId, data) {}

  /**
   * Closes a listing.
   * @param listingId
   * @param ipfsData - Data to store in IPFS. For future use, currently empty.
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async withdrawListing(listingId, ipfsData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(LISTING_WITHDRAW_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.withdrawListing(
      listingId,
      ipfsBytes,
      confirmationCallback
    )
  }

  /**
   * Adds an offer for a listing.
   * @param {string} listingId
   * @param {object} offerData - Offer data, expected in V1 schema format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{listingId, offerId, ...transactionReceipt}>}
   */
  async makeOffer(listingId, offerData = {}, confirmationCallback) {
    // TODO: nest offerData.affiliate, offerData.arbitrator, offerData.finalizes under an "_untrustworthy" key
    // Validate and save the data to IPFS.
    const ipfsHash = await this.ipfsDataStore.save(OFFER_DATA_TYPE, offerData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.makeOffer(
      listingId,
      ipfsBytes,
      offerData,
      confirmationCallback
    )
  }

  // updateOffer(listingId, offerId, data) {}

  /**
   * Withdraws an offer.
   * @param {string} id - Offer unique ID.
   * @param ipfsData - Data to store in IPFS. For future use, currently empty.
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async withdrawOffer(id, ipfsData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(OFFER_WITHDRAW_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.withdrawOffer(id, ipfsBytes, confirmationCallback)
  }

  /**
   * Accepts an offer.
   * @param {string} id - Offer unique ID.
   * @param ipfsData - Data to store in IPFS. For future use, currently empty.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async acceptOffer(id, ipfsData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(OFFER_ACCEPT_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.acceptOffer(id, ipfsBytes, confirmationCallback)
  }

  /**
   * Finalizes an offer. Store review data in IPFS.
   * @param {string} id - Offer unique ID.
   * @param {object} reviewData - Buyer's review. Data expected in schema version 1.0 format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async finalizeOffer(id, reviewData, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(REVIEW_DATA_TYPE, reviewData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.finalizeOffer(
      id,
      ipfsBytes,
      confirmationCallback
    )
  }

  // setOfferRefund(listingId, offerId, data) {}
  // manageListingDeposit(listingId, data) {}

  /**
   * Initiate a dispute regarding an offer. Puts the offer into "Disputed" status.
   * @param {string} offerId - Offer ID
   * @param {object} disputeData - Data describing this dispute - stored in IPFS
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async initiateDispute(offerId, disputeData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(DISPUTE_DATA_TYPE, disputeData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.initiateDispute(offerId, ipfsBytes, confirmationCallback)
  }

  /**
   * Resolve a dispute by executing a ruling - either refund to buyer or payment to seller
   * @param {string} listingId - Listing ID
   * @param {string} offerId - Offer ID
   * @param {object} resolutionData - Data describing this resolution - stored in IPFS
   * @param {number} ruling - 0: Seller, 1: Buyer, 2: Com + Seller, 3: Com + Buyer
   * @param {number} refund - Amount (in wei) to be refunded to buyer
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async resolveDispute(
    offerId,
    resolutionData = {},
    ruling,
    refund,
    confirmationCallback
  ) {
    const ipfsHash = await this.ipfsDataStore.save(RESOLUTION_DATA_TYPE, resolutionData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.resolveDispute(
      offerId,
      ipfsBytes,
      ruling,
      refund,
      confirmationCallback
    )
  }

  /**
   * Adds data to either a listing or an offer.
   * Use cases:
   *  - offer: allows seller to add review data.
   *  - listing: for future use.
   * @param listingId
   * @param offerId
   * @param {object} data - In case of an offer, Seller review data in schema 1.0 format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async addData(listingId, offerId, data, confirmationCallback) {
    let ipfsHash
    if (offerId) {
      // We expect this to be review data from the seller.
      ipfsHash = await this.ipfsDataStore.save(REVIEW_DATA_TYPE, data)
    } else if (listingId) {
      throw new Error('Code path not implemented yet')
    }
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.addData(
      listingId,
      offerId,
      ipfsBytes,
      confirmationCallback
    )
  }

  // Convenience methods

  /**
   * Pulls all the Buyer side reviews for a listing.
   * @param {string} listingId
   * @return {Promise<Array[Review]>}
   */
  async getListingReviews(listingId) {
    const reviewEvents = await this.resolver.getListingReviews(listingId)

    const reviews = []
    for (const event of reviewEvents) {
      // Load review data from IPFS.
      const ipfsHash = this.contractService.getIpfsHashFromBytes32(
        event.returnValues.ipfsHash
      )
      const ipfsReview = await this.ipfsDataStore.load(REVIEW_DATA_TYPE, ipfsHash)

      // Create a Review object based on IPFS and event data.
      const review = new Review(listingId, event.offerId, event, ipfsReview)
      reviews.push(review)
    }
    return reviews
  }

  async getNotifications() {
    const party = await this.contractService.currentAccount()
    const notifications = await this.resolver.getNotifications(party)
    return await Promise.all(notifications.map(async (notification) => {
      if (notification.resources.listingId) {
        notification.resources.listing = await this.getListing(
          generateListingId({
            version: notification.version,
            network: notification.network,
            listingIndex: notification.resources.listingId
          })
        )
      }
      if (notification.resources.offerId) {
        notification.resources.purchase = await this.getOffer(
          generateOfferId({
            version: notification.version,
            network: notification.network,
            listingIndex: notification.resources.listingId,
            offerIndex: notification.resources.offerId
          })
        )
      }
      return new Notification(notification)
    }))
  }

  async setNotification({ id, status }) {
    if (!notificationStatuses.includes(status)) {
      throw new Error(`invalid notification status: ${status}`)
    }
    const notifications = this.store.get(storeKeys.notificationStatuses)
    notifications[id] = status
    this.store.set(storeKeys.notificationStatuses, notifications)
  }

  async getTokenAddress() {
    return await this.resolver.getTokenAddress()
  }
}

module.exports = Marketplace
