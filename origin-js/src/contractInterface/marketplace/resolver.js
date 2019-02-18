import V00_MarketplaceAdapter from './v00_adapter'
import VA_MarketplaceAdapter from './vA_adapter'
import {
  parseListingId,
  parseOfferId,
  generateListingId,
  generateOfferId,
  generateNotificationId
} from '../../utils/id'
import {
  readStatus,
  unreadStatus,
  storeKeys
} from '../../models/notification'

export default class MarketplaceResolver {
  constructor({ contractService, store, blockEpoch, hotService }) {
    this.adapters = {
      '000': new V00_MarketplaceAdapter({ contractService, store, blockEpoch }),
      'A': new VA_MarketplaceAdapter({ contractService, store, blockEpoch, hotService })
    }
    this.versions = ['A', '000']
    this.currentVersion = this.versions[this.versions.length - 1]
    this.currentAdapter = this.adapters[this.currentVersion]
    this.contractService = contractService
    this.store = store
  }

  async getListingsCount() {
    let total = 0
    for (const version of this.versions) {
      total += await this.adapters[version].getListingsCount()
    }
    return total
  }

  async getListingIds(opts = {}) {
    const network = await this.contractService.web3.eth.net.getId()
    const listingIds = []

    for (const version of this.versions) {
      const listingIndexes = await this.adapters[version].getListings(opts)
      if (opts.withBlockInfo) {
        listingIndexes.forEach(listingData => {
          const { listingIndex } = listingData
          listingIds.unshift({
            listingId: this.generateListingId({ version, network, listingIndex }),
            ...listingData
          })
        })
      } else {
        listingIndexes.forEach(listingIndex => {
          listingIds.unshift(
            this.generateListingId({ version, network, listingIndex })
          )
        })
      }
    }

    return listingIds
  }

  async getListing(listingId, blockInfo) {
    const { adapter, listingIndex } = this.parseListingId(listingId)
    return await adapter.getListing(listingIndex, blockInfo)
  }

  async getOfferIds(listingId, opts = {}) {
    const network = await this.contractService.web3.eth.net.getId()
    const { adapter, listingIndex, version } = this.parseListingId(listingId)
    const offers = await adapter.getOffers(listingIndex, opts)
    return offers.map(offerIndex => {
      return generateOfferId({ network, version, listingIndex, offerIndex })
    })
  }

  async getOffer(offerId) {
    const {
      adapter,
      listingIndex,
      offerIndex,
      version,
      network
    } = this.parseOfferId(offerId)
    const listingId = this.generateListingId({ version, network, listingIndex })

    // Load chain data.
    const chainOffer = await adapter.getOffer(listingIndex, offerIndex)

    return { chainOffer, listingId }
  }

  async createListing(ipfsBytes, ipfsData, confirmationCallback) {
    const transactionReceipt = await this.currentAdapter.createListing(
      ipfsBytes,
      ipfsData,
      confirmationCallback
    )
    const version = this.currentVersion
    const network = await this.contractService.web3.eth.net.getId()
    const { listingIndex } = transactionReceipt
    const listingId = this.generateListingId({ network, version, listingIndex })

    return Object.assign({ listingId }, transactionReceipt)
  }

  async updateListing(listingId, ipfsBytes, additionalDeposit, confirmationCallback) {
    const { adapter, listingIndex } = this.parseListingId(listingId)

    return await adapter.updateListing(
      listingIndex,
      ipfsBytes,
      additionalDeposit,
      confirmationCallback
    )
  }

  async withdrawListing(listingId, ipfsBytes, confirmationCallback) {
    const { adapter, listingIndex } = this.parseListingId(listingId)

    return await adapter.withdrawListing(
      listingIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async makeOffer(listingId, ipfsBytes, offerData, confirmationCallback) {
    const { adapter, listingIndex, version, network } = this.parseListingId(
      listingId
    )

    const transactionReceipt = await adapter.makeOffer(
      listingIndex,
      ipfsBytes,
      offerData,
      confirmationCallback
    )

    // Success. Return listingId, newly created offerId and chain transaction receipt.
    const { offerIndex } = transactionReceipt
    const offerId = generateOfferId({
      network,
      version,
      listingIndex,
      offerIndex
    })
    return Object.assign({ listingId, offerId }, transactionReceipt)
  }

  async withdrawOffer(id, ipfsBytes, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    return await adapter.withdrawOffer(
      listingIndex,
      offerIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async acceptOffer(id, ipfsBytes, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    return await adapter.acceptOffer(
      listingIndex,
      offerIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async signAcceptOffer(id, ipfsBytes) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    return await adapter.signAcceptOffer(
        listingIndex,
        offerIndex,
        ipfsBytes
    )
  }

  async acceptSignedOffer(id, ipfsBytes, seller, signature) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    return await adapter.acceptSignedOffer(
        listingIndex,
        offerIndex,
        ipfsBytes,
        seller,
        signature
    )
  }

  async verifiedFinalizeOffer(id, ipfsBytes, verifyFee, payout, signature, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    return await adapter.verifyFinalizeOffer(
        listingIndex,
        offerIndex,
        ipfsBytes,
        verifyFee,
        payout,
        signature,
        confirmationCallback
    )
  }

  async finalizeOffer(id, ipfsBytes, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    return await adapter.finalizeOffer(
      listingIndex,
      offerIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async initiateDispute(offerId, ipfsBytes, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(offerId)

    return await adapter.initiateDispute(
      listingIndex,
      offerIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async resolveDispute(
    offerId,
    ipfsBytes,
    ruling,
    refund,
    confirmationCallback
  ) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(offerId)

    return await adapter.resolveDispute(
      listingIndex,
      offerIndex,
      ipfsBytes,
      ruling,
      refund,
      confirmationCallback
    )
  }

  async addData(listingId, offerId, ipfsBytes, confirmationCallback) {
    if (offerId) {
      const { adapter, listingIndex, offerIndex } = this.parseOfferId(offerId)

      return await adapter.addData(
        ipfsBytes,
        listingIndex,
        offerIndex,
        confirmationCallback
      )
    } else if (listingId) {
      const { adapter, listingIndex } = this.parseListingId(listingId)

      return await adapter.addData(
        ipfsBytes,
        listingIndex,
        null,
        confirmationCallback
      )
    } else {
      throw new Error(
        'addData must be called with either a listing or offer id.'
      )
    }
  }

  async getListingReviews(listingId) {
    const { adapter, listingIndex, version, network } = this.parseListingId(
      listingId
    )

    // Get all the OfferFinalized events for the listing.
    const listing = await adapter.getListing(listingIndex)
    const reviewEvents = listing.events.filter(
      e => e.event === 'OfferFinalized' || e.event === 'OfferData'
    )

    return Promise.all(
      reviewEvents.map(async event => {
        const offerIndex = event.returnValues.offerID
        const offerId = generateOfferId({
          network,
          version,
          listingIndex,
          offerIndex
        })
        // TODO(franck): Store the review timestamp in IPFS to avoid
        //               a call to the blockchain to get the event's timestamp.
        const timestamp = await this.contractService.getTimestamp(event)
        return Object.assign({ offerId, timestamp }, event)
      })
    )
  }

  /**
   * Returns all notifications relevant to a user.
   * The notification status is set to 'read' if either
   *   - The notification was previously marked as read in local storage.
   *   - The event occurred prior to the subscription start time (e.g. date at which
   *   the notification component was initialized for the first time).
   *
   * @param {string} party - User's ETH address.
   * @return {Promise<Array{
   *   id: string,
   *   status: read | unread
   *   event: web3 event,
   *   type: seller_listing_purchased | seller_review_received | buyer_listing_shipped,
   *   resources: {listingId: string, offerId: string} (Note: those are index, not global ids)
   *   network: eth network ID,
   *   version: version of marketplace contract that emitted the event
   *  }>}
   **/
  async getNotifications(party) {
    const network = await this.contractService.web3.eth.net.getId()
    let notifications = []
    for (const version of this.versions) {
      const rawNotifications = await this.adapters[version].getNotifications(
        party
      )

      for (const notification of rawNotifications) {
        notification.id = generateNotificationId({
          network,
          version,
          transactionHash: notification.event.transactionHash
        })
        // Check if the event occurred prior to the subscription start time.
        const timestamp = await this.contractService.getTimestamp(
          notification.event
        )
        const timestampInMilli = timestamp * 1000
        const isWatched =
          timestampInMilli >
          this.store.get(storeKeys.notificationSubscriptionStart)
        const notificationStatuses = this.store.get(
          storeKeys.notificationStatuses
        )
        notification.status =
          isWatched && notificationStatuses[notification.id] !== readStatus
            ? unreadStatus
            : readStatus
        notification.network = network
        notification.version = version
      }

      notifications = notifications.concat(rawNotifications)
    }
    return notifications
  }

  async getTokenAddress() {
    return await this.currentAdapter.getTokenAddress()
  }

  isNoGas(listingId) {
    const { version } = parseListingId(listingId)
    return version == 'A'
  }

  parseListingId(listingId) {
    const { version, network, listingIndex } = parseListingId(listingId)
    // use appropriate adapter for version
    const adapter = this.adapters[version]
    if (!adapter) {
      throw new Error(`Adapter not found for version ${version}`)
    }
    return { adapter, listingIndex: adapter.toListingID(listingIndex), version, network }
  }

  parseOfferId(offerId) {
    const { version, network, listingIndex, offerIndex } = parseOfferId(offerId)
    // use appropriate adapter for version
    const adapter = this.adapters[version]
    if (!adapter) {
      throw new Error(`Adapter not found for version ${version}`)
    }
    return { adapter, listingIndex: adapter.toListingID(listingIndex), offerIndex, version, network }
  }

  generateListingId({ version, network, listingIndex }) {
    return generateListingId({ version, network, listingIndex: this.adapters[version].toListingIndex(listingIndex) })
  }

  makeListingId(network, contractName, listingId) {
    for (const version of this.versions) {
      if (this.adapters[version].contractName == contractName)
      {
        return this.generateListingId({ version, network, listingIndex: listingId })
      }
    }
  }
}
