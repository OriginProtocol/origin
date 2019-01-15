const ipfs = require('origin-ipfs')
const offerStatus = require('./offerStatus')
const get = ipfs.get
// import { get } from 'origin-ipfs'
const startCase = require('lodash/startCase')
const pick = require('lodash/pick')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

class OriginEventSource {
  constructor({ ipfsGateway, marketplaceContract, web3, arbitrator }) {
    this.ipfsGateway = ipfsGateway
    this.contract = marketplaceContract
    this.web3 = web3
    this.offerCache = {}
    this.listingCache = {}
    this.arbitrator = arbitrator ? arbitrator.toLowerCase() : ZERO_ADDRESS
  }

  async getMarketplace() {
    return {
      totalListings: ''
    }
  }

  async getListing(listingId, blockNumber) {
    const id = `${listingId}-${blockNumber}`
    if (this.listingCache[id]) {
      return this.listingCache[id]
    }

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
        'unitsTotal',
        'commissionPerUnit'
      )
    } catch (e) {
      return null
    }
    if (data.category) {
      data.categoryStr = startCase(data.category.replace(/^schema\./, ''))
    }

    if (data.media && data.media.length) {
      data.media = data.media.map(m => ({
        ...m,
        urlExpanded: `${this.ipfsGateway}/${m.url.replace(':/', '')}`
      }))
    }

    const type = 'unit'
    this.listingCache[id] = this.withOffers(listingId, {
      id: `999-1-${listingId}${blockNumber ? `-${blockNumber}` : ''}`,
      ipfs: ipfsHash ? { id: ipfsHash } : null,
      deposit: listing.deposit,
      arbitrator: listing.depositManager
        ? { id: listing.depositManager }
        : null,
      seller: seller ? { id: seller } : null,
      contract: this.contract,
      status,
      events,
      type,
      multiUnit: type === 'unit' && data.unitsTotal > 1,
      commissionPerUnit: listing.commissionPerUnit,
      ...data
    })

    return this.listingCache[id]
  }

  // Returns a listing with offers and any fields that are computed from the
  // offers.
  async withOffers(listingId, listing) {
    const totalOffers = await this.contract.methods
      .totalOffers(listingId)
      .call()

    const allOffers = []
    for (const id of Array.from({ length: totalOffers }, (_, i) => i)) {
      allOffers.push(await this._getOffer(listing, listingId, id))
    }

    // Compute fields from valid offers.
    let depositAvailable = this.web3.utils.toBN(listing.deposit)
    let unitsAvailable = listing.unitsTotal
    if (listing.type === 'unit') {
      allOffers.forEach(offer => {
        if (!offer.valid || offer.status === 0) {
          // No need to do anything here.
        } else if (offer.quantity > unitsAvailable) {
          offer.valid = false
          offer.validationError = 'units purchased exceeds available'
        } else {
          unitsAvailable -= offer.quantity
          if (offer.commission) {
            const offerCommission = this.web3.utils.toBN(offer.commission)
            depositAvailable = depositAvailable.sub(offerCommission)
          }
          // TODO: validate offer commission when dapp2 passes that in
        }
      })
    }
    depositAvailable = !depositAvailable.isNeg()
      ? depositAvailable.toString()
      : '0'
    return Object.assign({}, listing, {
      allOffers,
      unitsAvailable,
      unitsSold: listing.unitsTotal - unitsAvailable,
      depositAvailable: depositAvailable
    })
  }

  async getOffer(listingId, offerId) {
    return this._getOffer(await this.getListing(listingId), listingId, offerId)
  }

  async _getOffer(listing, listingId, offerId) {
    const id = `${listingId}-${offerId}`
    if (this.offerCache[id]) {
      return this.offerCache[id]
    }

    let blockNumber, status, ipfsHash, lastEvent, withdrawnBy, createdBlock
    const events = await this.contract.eventCache.offers(
      listingId,
      Number(offerId)
    )
    events.forEach(e => {
      if (e.event === 'OfferCreated') {
        ipfsHash = e.returnValues.ipfsHash
        createdBlock = e.blockNumber
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

    if (lastEvent && lastEvent.event === 'OfferWithdrawn') {
      status = 0
      withdrawnBy = { id: lastEvent.returnValues.party }
    } else if (lastEvent && lastEvent.event === 'OfferRuling') {
      status = 5
    }

    const offer = await this.contract.methods
      .offers(listingId, offerId)
      .call(undefined, blockNumber)

    if (status === undefined) {
      status = offer.status
    }

    let data = await get(this.ipfsGateway, ipfsHash)
    data = pick(data, 'unitsPurchased')

    const offerObj = {
      id: `999-1-${listingId}-${offerId}`,
      listingId: String(listing.id),
      offerId: String(offerId),
      createdBlock,
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
      arbitrator: { id: offer.arbitrator },
      quantity: data.unitsPurchased
    }
    offerObj.statusStr = offerStatus(offerObj)

    try {
      await this.validateOffer(offerObj, listing)
      offerObj.valid = true
      offerObj.validationError = null
    } catch (e) {
      offerObj.valid = false
      offerObj.validationError = e.message
    }

    this.offerCache[id] = offerObj
    return offerObj
  }

  // Validates an offer, throwing an error if an issue is found.
  async validateOffer(offer, listing) {
    if (offer.status != 1 /* pending */) {
      return
    }

    // TODO: make this better by getting the listing price currency address
    if (listing.price.currency === 'ETH' && offer.currency !== ZERO_ADDRESS) {
      throw new Error('Invalid offer: currency does not match listing')
    }

    const offerArbitrator = offer.arbitrator
      ? offer.arbitrator.id.toLowerCase()
      : ZERO_ADDRESS
    if (offerArbitrator !== this.arbitrator) {
      throw new Error(
        `Arbitrator: offer ${offerArbitrator} !== listing ${this.arbitrator}`
      )
    }

    const affiliateWhitelistDisabled = await this.contract.methods
      .allowedAffiliates(this.contract._address)
      .call()
    const offerAffiliate = offer.affiliate
      ? offer.affiliate.id.toLowerCase()
      : ZERO_ADDRESS
    const affiliateAlowed = affiliateWhitelistDisabled ||
      await this.contract.methods
        .allowedAffiliates(offer.offerAffiliate)
        .call()
    if (!affiliateAlowed) {
      throw new Error(
        `Offer affiliate ${offerAffiliate} not whitelisted`
      )
    }

    if (listing.type !== 'unit') {
      // TODO: validate fractional offers
      return
    }

    // Compare offer value with listing price. This assumes listing currency
    // has 18 decimal places like ETH.
    const listingPriceWei = this.web3.utils.toBN(
      this.web3.utils.toWei(listing.price.amount, 'ether')
    )
    const expectedValue = listingPriceWei.mul(
      this.web3.utils.toBN(offer.quantity)
    )
    const offerValue = this.web3.utils.toBN(offer.value)
    if (expectedValue.gt(offerValue)) {
      throw new Error('Invalid offer: insufficient offer amount for listing')
    }
  }

  async getReview(listingId, offerId, party, ipfsHash) {
    const data = await get(this.ipfsGateway, ipfsHash)
    return {
      id: `999-1-${listingId}-${offerId}`,
      reviewer: { id: party, account: { id: party } },
      listing: { id: listingId },
      offer: { id: offerId },
      review: data.text,
      rating: data.rating
    }
  }

  resetCache() {
    this.offerCache = {}
    this.listingCache = {}
  }
}

module.exports = OriginEventSource
