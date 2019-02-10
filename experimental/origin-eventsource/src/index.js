const ipfs = require('origin-ipfs')
const offerStatus = require('./offerStatus')
const get = ipfs.get
// import { get } from 'origin-ipfs'
const startCase = require('lodash/startCase')
const pick = require('lodash/pick')
const _get = require('lodash/get')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

class OriginEventSource {
  constructor({ ipfsGateway, marketplaceContract, web3 }) {
    this.ipfsGateway = ipfsGateway
    this.contract = marketplaceContract
    this.web3 = web3
    this.offerCache = {}
    this.listingCache = {}
  }

  async getNetworkId() {
    if (!this.networkId) {
      this.networkId = await this.web3.eth.net.getId()
    }
    return this.networkId
  }

  async getMarketplace() {
    return {
      totalListings: ''
    }
  }

  async getListing(listingId, blockNumber) {
    const cacheBlockNumber = blockNumber
      ? blockNumber
      : this.contract.eventCache.getBlockNumber()
    const cacheKey = `${listingId}-${cacheBlockNumber}`
    const networkId = await this.getNetworkId()
    if (this.listingCache[cacheKey]) {
      // Return the listing with the an ID that includes the block number, if
      // one was specified
      return Object.assign({}, this.listingCache[cacheKey], {
        id: `${networkId}-0-${listingId}${blockNumber ? `-${blockNumber}` : ''}`
      })
    }

    let listing,
      seller,
      ipfsHash,
      oldIpfsHash,
      status = 'active'

    try {
      listing = await this.contract.methods.listings(listingId).call()
    } catch (e) {
      return null
    }

    const events = await this.contract.eventCache.listings(listingId)

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
      if (blockNumber && e.blockNumber <= blockNumber) {
        oldIpfsHash = ipfsHash
      }
    })

    let data
    try {
      data = await get(this.ipfsGateway, ipfsHash)
      data = pick(
        data,
        'listingType',
        'title',
        'description',
        'currencyId',
        'price',
        'category',
        'subCategory',
        'media',
        'unitsTotal',
        'commission',
        'commissionPerUnit',

        'weekendPrice',
        'booked',
        'unavailable',
        'customPricing'
      )
    } catch (e) {
      return null
    }

    // If a blockNumber has been specified, override certain fields with the
    // 'old' version of that data.
    if (blockNumber) {
      try {
        const oldData = await get(this.ipfsGateway, oldIpfsHash)
        data = {
          ...data,
          ...pick(
            oldData,
            'title',
            'description',
            'category',
            'subCategory',
            'media'
          )
        }
      } catch (e) {
        return null
      }
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
    let commissionPerUnit = '0',
      commission = '0'
    if (type === 'unit') {
      const commissionPerUnitOgn =
        data.unitsTotal === 1
          ? (data.commission && data.commission.amount) || '0'
          : (data.commissionPerUnit && data.commissionPerUnit.amount) || '0'
      commissionPerUnit = this.web3.utils.toWei(commissionPerUnitOgn, 'ether')

      const commissionOgn = (data.commission && data.commission.amount) || '0'
      commission = this.web3.utils.toWei(commissionOgn, 'ether')
    }

    this.listingCache[cacheKey] = await this.withOffers(listingId, {
      ...data,
      __typename:
        data.listingType === 'fractional' ? 'FractionalListing' : 'UnitListing',
      id: `${networkId}-0-${listingId}${blockNumber ? `-${blockNumber}` : ''}`,
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
      commissionPerUnit,
      commission
    })

    return this.listingCache[cacheKey]
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
    let commissionAvailable = this.web3.utils.toBN(listing.commission)
    let unitsAvailable = listing.unitsTotal
    const booked = []

    if (listing.listingType === 'fractional') {
      allOffers.forEach(offer => {
        if (!offer.valid || offer.status === 0) {
          // No need to do anything here.
        } else if (offer.startDate && offer.endDate) {
          booked.push(`${offer.startDate}-${offer.endDate}`)
        }
      })
    } else if (listing.type === 'unit') {
      const commissionPerUnit = this.web3.utils.toBN(listing.commissionPerUnit)
      allOffers.forEach(offer => {
        if (!offer.valid || offer.status === 0) {
          // No need to do anything here.
        } else if (offer.quantity > unitsAvailable) {
          offer.valid = false
          offer.validationError = 'units purchased exceeds available'
        } else {
          try {
            unitsAvailable -= offer.quantity

            // Validate offer commission.
            const normalCommission = commissionPerUnit.mul(
              this.web3.utils.toBN(offer.quantity)
            )
            const expCommission = normalCommission.lte(commissionAvailable)
              ? normalCommission
              : commissionAvailable
            const offerCommission =
              (offer.commission && this.web3.utils.toBN(offer.commission)) ||
              this.web3.utils.toBN(0)
            if (!offerCommission.eq(expCommission)) {
              offer.valid = false
              offer.validationError = `offer commission: ${offerCommission.toString()} != exp ${expCommission.toString()}`
              return
            }
            if (!offerCommission.isZero()) {
              commissionAvailable = commissionAvailable.sub(offerCommission)
            }
          } catch (e) {
            offer.valid = false
            offer.validationError = 'invalid IPFS data'
          }
        }
      })
    }
    commissionAvailable = !commissionAvailable.isNeg()
      ? commissionAvailable.toString()
      : '0'
    return Object.assign({}, listing, {
      allOffers,
      booked,
      unitsAvailable,
      unitsSold: listing.unitsTotal - unitsAvailable,
      depositAvailable: commissionAvailable
    })
  }

  async getOffer(listingId, offerId) {
    return this._getOffer(await this.getListing(listingId), listingId, offerId)
  }

  async _getOffer(listing, listingId, offerId, blockNumber) {
    if (blockNumber === undefined) {
      blockNumber = this.contract.eventCache.getBlockNumber()
    }
    const cacheKey = `${listingId}-${offerId}-${blockNumber}`
    if (this.offerCache[cacheKey]) {
      return this.offerCache[cacheKey]
    }

    let latestBlock, status, ipfsHash, lastEvent, withdrawnBy, createdBlock
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
        latestBlock = e.blockNumber
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
      .call(undefined, latestBlock)

    if (status === undefined) {
      status = offer.status
    }

    const data = await get(this.ipfsGateway, ipfsHash)

    const networkId = await this.getNetworkId()

    const offerObj = {
      id: `${networkId}-0-${listingId}-${offerId}`,
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
      quantity: _get(data, 'unitsPurchased'),
      startDate: _get(data, 'startDate'),
      endDate: _get(data, 'endDate')
    }
    offerObj.statusStr = offerStatus(offerObj)

    if (!data) {
      offerObj.valid = false
      offerObj.validationError = 'IPFS data not found'
    } else {
      try {
        await this.validateOffer(offerObj, listing)
        offerObj.valid = true
        offerObj.validationError = null
      } catch (e) {
        offerObj.valid = false
        offerObj.validationError = e.message
      }
    }

    this.offerCache[cacheKey] = offerObj
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

    const offerArbitrator =
      offer.arbitrator && offer.arbitrator.id.toLowerCase()
    if (!offerArbitrator || offerArbitrator === ZERO_ADDRESS) {
      throw new Error('No arbitrator set')
    }

    const affiliateWhitelistDisabled = await this.contract.methods
      .allowedAffiliates(this.contract._address)
      .call()
    const offerAffiliate = offer.affiliate
      ? offer.affiliate.id.toLowerCase()
      : ZERO_ADDRESS
    const affiliateAllowed =
      affiliateWhitelistDisabled ||
      (await this.contract.methods.allowedAffiliates(offerAffiliate).call())
    if (!affiliateAllowed) {
      throw new Error(`Offer affiliate ${offerAffiliate} not whitelisted`)
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
    const networkId = await this.getNetworkId()
    return {
      id: `${networkId}-0-${listingId}-${offerId}`,
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
