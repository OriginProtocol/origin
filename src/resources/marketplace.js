import { Listing } from '../models/listing'
import { Offer } from '../models/offer'
import { Review } from '../models/review'
import {
  readStatus,
  unreadStatus,
  notificationStatuses,
  storeKeys
} from '../models/notification'
import {
  ListingIpfsStore,
  OfferIpfsStore,
  ReviewIpfsStore
} from '../services/data-store-service'
import MarketplaceResolver from '../adapters/marketplace/_resolver'

class Marketplace {
  constructor({ contractService, ipfsService, store }) {
    this.contractService = contractService
    this.ipfsService = ipfsService
    this.listingIpfsStore = new ListingIpfsStore(this.ipfsService)
    this.offerIpfsStore = new OfferIpfsStore(this.ipfsService)
    this.reviewIpfsStore = new ReviewIpfsStore(this.ipfsService)
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
    const listingIds = await this.resolver.getListingIds()

    if (opts.idsOnly) {
      return listingIds
    }

    return Promise.all(listingIds.map(async (listingId) => {
      return await this.getListing(listingId)
    }))
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
    const ipfsListing = await this.listingIpfsStore.load(ipfsHash)

    // Create and return a Listing from on-chain and off-chain data .
    return new Listing(listingId, chainListing, ipfsListing)
  }

  // async getOffersCount(listingId) {}

  async getOffers(listingId, opts = {}) {
    const offerIds = await this.resolver.getOfferIds(listingId, opts)
    if (opts.idsOnly) {
      return offerIds
    } else {
      return await Promise.all(
        offerIds.map(offerId => {
          return this.getOffer(offerId)
        })
      )
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
    const ipfsOffer = await this.offerIpfsStore.load(ipfsHash)

    // Create an Offer from on-chain and off-chain data.
    return new Offer(offerId, listingId, chainOffer, ipfsOffer)
  }

  /**
   * Creates a new listing in the system. Data is recorded both on-chain and off-chain in IPFS.
   * @param {object} ipfsData - Listing data to store in IPFS
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @returns {Promise<object>} - Object with listingId and transactionReceipt fields.
   */
  async createListing(ipfsData, confirmationCallback) {
    // Validate and save the data to IPFS.
    const ipfsHash = await this.listingIpfsStore.save(ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.createListing(ipfsBytes, ipfsData, confirmationCallback)
  }

  // updateListing(listingId, data) {}

  async withdrawListing(listingId, ipfsData, confirmationCallback) {
    const ipfsHash = await this.ipfsService.saveObjAsFile({ data: ipfsData })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await adapter.withdrawListing(
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
  async makeOffer(listingId, offerData, confirmationCallback) {
    // For V1, we only support quantity of 1.
    if (offerData.unitsPurchased != 1)
      throw new Error(
        `Attempted to purchase ${offerData.unitsPurchased} - only 1 allowed.`
      )

    // Save the offer data in IPFS.
    const ipfsHash = await this.offerIpfsStore.save(offerData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    // Record the offer on chain.
    const priceWei = this.contractService.web3.utils.toWei(
      offerData.totalPrice.amount,
      'ether'
    )
    return await this.resolver.makeOffer(listingId, ipfsBytes, priceWei, confirmationCallback)
  }

  // updateOffer(listingId, offerId, data) {}
  // withdrawOffer(listingId, offerId, data) {}

  /**
   * Accepts an offer.
   * @param {string} id - Offer unique ID.
   * @param data - Empty object. Currently not used.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, transactionReceipt}>}
   */
  async acceptOffer(id, data, confirmationCallback) {
    // FIXME(franck): implement support for empty data.
    //const ipfsHash = await this.offerIpfsStore.save(data)
    //const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    const ipfsBytes = '0x0000000000000000000000000000000000000000'

    return await this.resolver.acceptOffer(
      id,
      ipfsBytes,
      confirmationCallback
    )
  }

  /**
   * Finalizes an offer. Store review data in IPFS.
   * @param {string} id - Offer unique ID.
   * @param {object} reviewData - Buyer's review. Data expected in schema version 1.0 format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, transactionReceipt}>}
   */
  async finalizeOffer(id, reviewData, confirmationCallback) {
    const ipfsHash = await this.reviewIpfsStore.save(reviewData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.finalizeOffer(
      id,
      ipfsBytes,
      confirmationCallback
    )
  }

  // setOfferRefund(listingId, offerId, data) {}

  // initiateDispute(listingId, offerId) {}
  // disputeRuling(listingId, offerId, data) {}
  // manageListingDeposit(listingId, data) {}

  /**
   * Adds data to either a listing or an offer.
   * Use cases:
   *  - offer: allows seller to add review data.
   *  - listing: for future use.
   * @param listingId
   * @param offerId
   * @param {object} data - In case of an offer, Seller review data in schema 1.0 format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, transactionReceipt}>}
   */
  async addData(listingId, offerId, data, confirmationCallback) {
    const ipfsHash = await this.reviewIpfsStore.save(data)
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
      const ipfsReview = await this.reviewIpfsStore.load(ipfsHash)

      // Create a Review object based on IPFS and event data.
      const review = new Review(listingId, event.offerId, event, ipfsReview)
      reviews.push(review)
    }
    return reviews
  }

  async getNotifications() {
    const party = await this.contractService.currentAccount()
    return await this.resolver.getNotifications(party)
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
