import { get } from './ipfsHash'
import startCase from 'lodash/startCase'
import pick from 'lodash/pick'

class OriginEventSource {
  constructor({ ipfsGateway, marketplaceContract }) {
    this.ipfsGateway = ipfsGateway
    this.contract = marketplaceContract
  }

  async getMarketplace() {
    return {
      totalListings: ''
    }
  }

  async getListing(listingId, blockNumber) {
    let listing,
      seller,
      ipfsHash,
      status = 'active'

    try {
      listing = await this.contract.methods
        .listings(listingId)
        .call(undefined, blockNumber)
    } catch (e) {
      return null
    }

    const events = await this.contract.eventCache.listings(listingId)
    let soldUnits = 0

    events.forEach(e => {
      if (e.event === 'ListingCreated') {
        ipfsHash = e.returnValues.ipfsHash
        seller = e.returnValues.party
      }
      if (e.event === 'ListingUpdated') {
        ipfsHash = e.returnValues.ipfsHash
      }
      if (e.event === 'ListingWithdrawn') {
        status = 'withdrawn'
      }
      if (e.event === 'OfferCreated') {
        soldUnits += 1
      }
      if (e.event === 'OfferWithdrawn') {
        soldUnits -= 1
      }
      if (e.event === 'OfferFinalized') {
        status = 'sold'
      }
      if (e.event === 'OfferRuling') {
        status = 'sold'
      }
    })

    let data
    try {
      data = await get(this.ipfsGateway, ipfsHash)
      data = pick(data, 'title', 'description', 'currencyId', 'price', 'category', 'media', 'unitsTotal')
    } catch (e) {
      return null
    }
    if (data.category) {
      data.categoryStr = startCase(data.category.replace(/^schema\./, ''))
    }

    data.unitsTotal = data.unitsTotal ? data.unitsTotal - soldUnits : 0

    return {
      id: listingId,
      ipfs: ipfsHash ? { id: ipfsHash } : null,
      deposit: listing.deposit,
      arbitrator: listing.depositManager
        ? { id: listing.depositManager }
        : null,
      seller: seller ? { id: seller } : null,
      contract: this.contract,
      status,
      events,
      ...data
    }
  }

  async getOffer(listingId, offerId) {

    let blockNumber, status, ipfsHash, lastEvent, withdrawnBy
    const events = await this.contract.eventCache.offers(listingId, offerId)

    events.forEach(e => {
      if (e.event === 'OfferCreated') {
        ipfsHash = e.returnValues.ipfsHash
      } else if (e.event === 'OfferFinalized') {
        status = 4
      }
      if (!e.event.match(/(OfferFinalized|OfferWithdrawn|OfferRuling)/)) {
        blockNumber = e.blockNumber
      }
      lastEvent = e
    })

    if (lastEvent.event === 'OfferWithdrawn') {
      status = 0
      withdrawnBy = { id: lastEvent.returnValues.party }
    } else if (lastEvent.event === 'OfferRuling') {
      status = 5
    }

    const offer = await this.contract.methods
      .offers(listingId, offerId)
      .call(undefined, blockNumber)

    if (status === undefined) { status = offer.status }

    return {
      id: offerId,
      listingId: String(listingId),
      status,
      contract: this.contract,
      withdrawnBy,
      value: offer.value,
      commission: offer.commission,
      refund: offer.refund,
      currency: offer.currency,
      finalizes: offer.finalizes,
      ipfs: { id: ipfsHash },
      buyer: { id: offer.buyer },
      affiliate: { id: offer.affiliate },
      arbitrator: { id: offer.arbitrator }
    }
  }
}

export default OriginEventSource
