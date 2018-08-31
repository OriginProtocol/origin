import URL from 'url-parse'

import { generateListingId, generateOfferId, generateNotificationId } from '../utils/id'
import { validateListing } from '../utils/schemaValidators'

import Adaptable from './adaptable'

const unreadStatus = 'unread'
const readStatus = 'read'
const notificationStatuses = [unreadStatus, readStatus]

const storeKeys = {
  notificationSubscriptionStart: 'notification_subscription_start',
  notificationStatuses: 'notification_statuses'
}

class Marketplace extends Adaptable {
  constructor({
    contractService,
    ipfsService,
    fetch,
    indexingServerUrl,
    store
  }) {
    super(...arguments)
    this.contractService = contractService
    this.ipfsService = ipfsService
    this.indexingServerUrl = indexingServerUrl
    this.fetch = fetch

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
    let total = 0
    for (const version of this.versions) {
      total += await this.adapters[version].getListingsCount()
    }
    return total
  }

  async getListings(opts = {}) {
    const network = await this.contractService.web3.eth.net.getId()
    const listingIds = []
    console.log(opts)
    for (const version of this.versions) {
      const listingIndexes = await this.adapters[version].getListings(opts)
      listingIndexes.forEach(listingIndex => {
        listingIds.unshift(
          generateListingId({ version, network, listingIndex })
        )
      })
    }

    if (opts.idsOnly) {
      return listingIds
    }

    // TODO: return full listings with data
    return listingIds
  }

  async getListing(listingId) {
    const { adapter, listingIndex } = this.parseListingId(listingId)
    const listing = await adapter.getListing(listingIndex)
    const { offers } = listing

    const ipfsHash = this.contractService.getIpfsHashFromBytes32(
      listing.ipfsHash
    )
    const ipfsJson = await this.ipfsService.loadObjFromFile(ipfsHash)
    const ipfsData = ipfsJson && ipfsJson.data

    // Rewrite IPFS image URLs to use the configured IPFS gateway
    if (ipfsData && ipfsData.pictures) {
      ipfsData.pictures = ipfsData.pictures.map(url => {
        return this.ipfsService.rewriteUrl(url)
      })
    }

    const unitsForSale = (ipfsData && (typeof ipfsData.units !== 'undefined'))
      ? ipfsData.units
      : 1 // default value

    const unitsSold = Object.keys(offers).reduce((acc, offerId) => {
      if (offers[offerId].status === 'created') {
        return acc + 1
      }
      // TODO: we need to subtract 1 for every offer that is canceled
      return acc
    }, 0)

    // units available is derived from units for sale and offers created.
    // should never be negative
    const unitsAvailable = Math.max(unitsForSale - unitsSold, 0)

    return Object.assign({}, listing, {
      id: listingId,
      ipfsData: ipfsJson || {},
      unitsAvailable
    })
  }

  // async getOffersCount(listingId) {}

  async getOffers(listingId, opts = {}) {
    const network = await this.contractService.web3.eth.net.getId()
    const { adapter, listingIndex, version } = this.parseListingId(listingId)
    const offers = await adapter.getOffers(listingIndex, opts)
    const offerIds = offers.map(offerIndex => {
      return generateOfferId({ network, version, listingIndex, offerIndex })
    })
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

  async getOffer(offerId) {
    const {
      adapter,
      listingIndex,
      offerIndex,
      version,
      network
    } = this.parseOfferId(offerId)
    const offer = await adapter.getOffer(listingIndex, offerIndex)

    const ipfsHash = this.contractService.getIpfsHashFromBytes32(offer.ipfsHash)
    const ipfsJson = await this.ipfsService.loadObjFromFile(ipfsHash)
    const listingId = generateListingId({ version, network, listingIndex })

    // Use data from IPFS is offer no longer in active blockchain state
    if (
      offer.buyer.indexOf('0x00000') === 0 &&
      ipfsJson.data &&
      ipfsJson.data.buyer
    ) {
      offer.buyer = ipfsJson.data.buyer
    }

    return Object.assign({}, offer, {
      id: offerId,
      ipfsData: ipfsJson || {},
      listingId
    })
  }

  async createListing(ipfsData, confirmationCallback) {
    validateListing(ipfsData, this.contractService)

    // Apply filtering to pictures and uploaded any data: URLs to IPFS
    if (ipfsData.pictures) {
      const pictures = ipfsData.pictures
        .filter(url => {
          try {
            // Only allow data:, dweb:, and ipfs: URLs
            return ['data:', 'dweb:', 'ipfs:'].includes(new URL(url).protocol)
          } catch (error) {
            // Invalid URL, filter it out
            return false
          }
        })
        .map(async url => {
          // Upload any data: URLs to IPFS
          // TODO possible removal and only accept dweb: and ipfs: URLS from dapps
          if (url.startsWith('data:')) {
            const ipfsHash = await this.ipfsService.saveDataURIAsFile(url)
            return this.ipfsService.gatewayUrlForHash(ipfsHash)
          }
          // Leave other URLs untouched
          return url
        })

      // Replace data.pictures
      await Promise.all(pictures).then(results => {
        ipfsData.pictures = results
      })
    }

    const ipfsHash = await this.ipfsService.saveObjAsFile({ data: ipfsData })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    const transactionReceipt = await this.currentAdapter.createListing(
      ipfsBytes,
      ipfsData,
      confirmationCallback
    )
    const version = this.currentVersion
    const network = await this.contractService.web3.eth.net.getId()
    const { listingIndex } = transactionReceipt
    const listingId = generateOfferId({ network, version, listingIndex })
    return Object.assign({ listingId }, transactionReceipt)
  }

  // updateListing(listingId, data) {}

  async withdrawListing(listingId, ipfsData, confirmationCallback) {
    const { adapter, listingIndex } = this.parseListingId(listingId)
    const ipfsHash = await this.ipfsService.saveObjAsFile({ data: ipfsData })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await adapter.withdrawListing(
      listingIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async makeOffer(listingId, data, confirmationCallback) {
    const { adapter, listingIndex, version, network } = this.parseListingId(
      listingId
    )
    const buyer = await this.contractService.currentAccount()

    data.price = this.contractService.web3.utils.toWei(
      String(data.price),
      'ether'
    )
    data.buyer = buyer

    const ipfsHash = await this.ipfsService.saveObjAsFile({ data })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    const transactionReceipt = await adapter.makeOffer(
      listingIndex,
      ipfsBytes,
      data,
      confirmationCallback
    )
    const { offerIndex } = transactionReceipt
    const offerId = generateOfferId({
      network,
      version,
      listingIndex,
      offerIndex
    })
    return Object.assign({ listingId, offerId }, transactionReceipt)
  }

  // updateOffer(listingId, offerId, data) {}
  // withdrawOffer(listingId, offerId, data) {}

  async acceptOffer(id, data, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    const ipfsHash = await this.ipfsService.saveObjAsFile({ data })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await adapter.acceptOffer(
      listingIndex,
      offerIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  async finalizeOffer(id, data, confirmationCallback) {
    const { adapter, listingIndex, offerIndex } = this.parseOfferId(id)

    const ipfsHash = await this.ipfsService.saveObjAsFile({ data })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await adapter.finalizeOffer(
      listingIndex,
      offerIndex,
      ipfsBytes,
      confirmationCallback
    )
  }

  // setOfferRefund(listingId, offerId, data) {}

  // initiateDispute(listingId, offerId) {}
  // disputeRuling(listingId, offerId, data) {}
  // manageListingDeposit(listingId, data) {}

  async addData(listingId, offerId, data, confirmationCallback) {
    const ipfsHash = await this.ipfsService.saveObjAsFile({ data })
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

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
    }
  }

  // Convenience methods

  async getListingReviews(listingId) {
    const { adapter, listingIndex } = this.parseListingId(listingId)
    const listing = await adapter.getListing(listingIndex)
    const reviewEvents = listing.events.filter(
      e => e.event === 'OfferFinalized'
    )
    const reviews = []
    for (const event of reviewEvents) {
      const ipfsHash = this.contractService.getIpfsHashFromBytes32(
        event.returnValues.ipfsHash
      )
      const ipfsJson = await this.ipfsService.loadObjFromFile(ipfsHash)
      const timestamp = await this.contractService.getTimestamp(event)
      reviews.push({
        transactionHash: event.transactionHash,
        rating: ipfsJson.data.rating,
        reviewText: ipfsJson.data.reviewText,
        timestamp,
        reviewerAddress: event.returnValues.party
      })
    }
    return reviews
  }

  async getNotifications() {
    const network = await this.contractService.web3.eth.net.getId()
    const party = await this.contractService.currentAccount()
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
        const timestamp = await this.contractService.getTimestamp(notification.event)
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
        if (notification.resources.listingId) {
          notification.resources.listing = await this.getListing(
            `${network}-${version}-${notification.resources.listingId}`
          )
        }
        if (notification.resources.offerId) {
          notification.resources.purchase = await this.getOffer(
            `${network}-${version}-${notification.resources.listingId}-${
              notification.resources.offerId
            }`
          )
        }
      }

      notifications = notifications.concat(rawNotifications)
    }
    return notifications
  }

  async setNotification({ id, status }) {
    if (!notificationStatuses.includes(status)) {
      throw new Error(`invalid notification status: ${status}`)
    }
    const notifications = this.store.get(storeKeys.notificationStatuses)
    notifications[id] = status
    this.store.set(storeKeys.notificationStatuses, notifications)
  }
}

module.exports = Marketplace
