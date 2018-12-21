const ipfs = require('origin-ipfs')
const offerStatus = require('./offerStatus')
const get = ipfs.get
// import { get } from 'origin-ipfs'
const startCase = require('lodash/startCase')
const pick = require('lodash/pick')

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

    const events = await this.contract.eventCache.listings(
      listingId,
      undefined,
      blockNumber
    )
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
      data = pick(
        data,
        'title',
        'description',
        'currencyId',
        'price',
        'category',
        'subCategory',
        'media',
        'unitsTotal'
      )
    } catch (e) {
      return null
    }
    if (data.category) {
      data.categoryStr = startCase(data.category.replace(/^schema\./, ''))
    }

    data.unitsTotal = data.unitsTotal ? data.unitsTotal - soldUnits : 0
    if (data.media && data.media.length) {
      data.media = data.media.map(m => ({
        ...m,
        urlExpanded: `${this.ipfsGateway}/${m.url.replace(':/', '')}`
      }))
    }

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
      if (
        !e.event.match(/(OfferFinalized|OfferWithdrawn|OfferRuling|OfferData)/)
      ) {
        blockNumber = e.blockNumber
      }
      if (e.event !== 'OfferData') {
        lastEvent = e
      }
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

    if (status === undefined) {
      status = offer.status
    }

    const offerObj = {
      id: `999-1-${listingId}-${offerId}`,
      listingId: String(listingId),
      offerId: String(offerId),
      createdBlock: blockNumber,
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
    offerObj.statusStr = offerStatus(offerObj)

    return offerObj
  }
}

module.exports = OriginEventSource
// export default OriginEventSource
