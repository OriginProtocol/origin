const ipfs = require('@origin/ipfs')
const offerStatus = require('./offerStatus')
const get = ipfs.get
// import { get } from '@origin/ipfs'
const startCase = require('lodash/startCase')
const pick = require('lodash/pick')
const _get = require('lodash/get')
const memoize = require('lodash/memoize')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const getListingFn = async (contract, listingId) =>
  await contract.methods.listings(listingId).call()

const getListing = memoize(getListingFn, (...args) => args[1])

const getOfferFn = async (contract, listingId, offerId, latestBlock) =>
  await contract.methods.offers(listingId, offerId).call(undefined, latestBlock)

const getOffer = memoize(getOfferFn, (...args) => {
  return [args[1], args[2], args[3]].join('-')
})

const affiliatesFn = async (contract, address) =>
  await contract.methods.allowedAffiliates(address).call()
const getAffiliates = memoize(affiliatesFn, (...args) => args[1])

function mutatePrice(price) {
  if (_get(price, 'currency.id')) {
    return
  }
  let currency = price.currency || 'token-ETH'
  if (currency === 'ETH') currency = 'token-ETH'
  if (currency.indexOf('0x00') === 0) currency = 'token-ETH'
  price.currency = { id: currency }
}

const netId = memoize(async web3 => await web3.eth.net.getId())

class OriginEventSource {
  constructor({ ipfsGateway, marketplaceContract, web3 }) {
    this.ipfsGateway = ipfsGateway
    this.contract = marketplaceContract
    this.web3 = web3
    this.offerCache = {}
    this.listingCache = {}
  }

  async getNetworkId() {
    return await netId(this.web3)
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
        id: `${networkId}-000-${listingId}${
          blockNumber ? `-${blockNumber}` : ''
        }`
      })
    }

    let listing,
      seller,
      ipfsHash,
      oldIpfsHash,
      status = 'active'

    try {
      listing = await getListing(this.contract, listingId)
    } catch (e) {
      console.log(`No such listing on contract ${listingId}`)
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
      if (blockNumber && e.blockNumber <= blockNumber) {
        oldIpfsHash = ipfsHash
      }
    })

    let data
    try {
      const rawData = await get(this.ipfsGateway, ipfsHash)
      data = pick(
        rawData,
        '__typename',
        'valid',
        'title',
        'description',
        'currencyId',
        'price',
        'acceptedTokens',
        'category',
        'subCategory',
        'media',
        'unitsTotal',
        'commission',
        'commissionPerUnit',
        'marketplacePublisher',

        'weekendPrice',
        'booked',
        'unavailable',
        'customPricing',
        'timeZone',
        'workingHours'
      )
      data.valid = true

      // TODO: Investigate why some IPFS data has unitsTotal set to -1, eg #1-000-266
      if (data.unitsTotal < 0) {
        data.unitsTotal = 1
      }

      // TODO: Dapp1 fractional compat
      if (rawData.availability && !rawData.weekendPrice) {
        try {
          const isWeekly = _get(rawData, 'availability.2.6.0') === 'x-price'
          const weekdayPrice = _get(rawData, 'availability.2.6.3')
          const isWeekend = _get(rawData, 'availability.3.6.0') === 'x-price'
          const weekendPrice = _get(rawData, 'availability.3.6.3')
          if (isWeekly && isWeekend) {
            data.price = { amount: weekdayPrice, currency: { id: 'token-ETH' } }
            data.weekendPrice = {
              amount: weekendPrice,
              currency: { id: 'token-ETH' }
            }
          }
        } catch (e) {
          /* Ignore */
        }
      }
    } catch (e) {
      console.log(`Error retrieving IPFS data for ${ipfsHash}`)
      data = {
        ...data,
        valid: false,
        validationError: 'No IPFS data'
      }
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
        console.log(`Error retrieving old IPFS data for ${ipfsHash}`)
        data = {
          ...data,
          valid: false,
          validationError: 'No IPFS data'
        }
      }
    }

    if (data.price) {
      mutatePrice(data.price)
    }

    if (data.weekendPrice) {
      mutatePrice(data.weekendPrice)
    }

    if (data.category) {
      data.categoryStr = startCase(data.category.replace(/^schema\./, ''))
    }

    if (data.media && Array.isArray(data.media)) {
      data.media = data.media.map(m => ({
        ...m,
        urlExpanded: `${this.ipfsGateway}/${m.url.replace(':/', '')}`
      }))
    } else {
      data.media = [] // If invalid, set a clean, empty media array
    }

    let __typename = data.__typename
    if (!__typename) {
      if (
        data.category === 'schema.forRent' &&
        data.subCategory === 'schema.housing'
      ) {
        __typename = 'FractionalListing'
      } else if (data.category === 'schema.announcements') {
        __typename = 'AnnouncementListing'
      } else {
        __typename = 'UnitListing'
      }
    }
    if (
      [
        'UnitListing',
        'FractionalListing',
        'FractionalHourlyListing',
        'AnnouncementListing'
      ].indexOf(__typename) < 0
    ) {
      __typename = 'UnitListing'
    }

    let commissionPerUnit = '0',
      commission = '0'
    if (__typename !== 'AnnouncementListing') {
      const commissionPerUnitOgn =
        data.unitsTotal === 1
          ? (data.commission && data.commission.amount) || '0'
          : (data.commissionPerUnit && data.commissionPerUnit.amount) || '0'
      commissionPerUnit = this.web3.utils.toWei(commissionPerUnitOgn, 'ether')

      const commissionOgn = (data.commission && data.commission.amount) || '0'
      commission = this.web3.utils.toWei(commissionOgn, 'ether')
    }

    const listingWithOffers = await this.withOffers(listingId, {
      ...data,
      __typename,
      id: `${networkId}-000-${listingId}${
        blockNumber ? `-${blockNumber}` : ''
      }`,
      ipfs: ipfsHash ? { id: ipfsHash } : null,
      acceptedTokens: (data.acceptedTokens || []).map(id => ({ id })),
      deposit: listing.deposit,
      arbitrator: listing.depositManager
        ? { id: listing.depositManager }
        : null,
      seller: seller ? { id: seller } : null,
      contract: this.contract,
      status,
      events,
      multiUnit: __typename === 'UnitListing' && data.unitsTotal > 1,
      commissionPerUnit,
      commission
    })

    this.listingCache[cacheKey] = listingWithOffers
    return this.listingCache[cacheKey]
  }

  // Returns a listing with offers and any fields that are computed from the
  // offers.
  async withOffers(listingId, listing) {
    const totalOffers = await this.contract.methods
      .totalOffers(listingId)
      .call()

    const allOffers = await Promise.all(
      Array.from({ length: totalOffers }, (_, i) => i).map(id =>
        this._getOffer(listing, listingId, id)
      )
    )

    // Compute fields from valid offers.
    let commissionAvailable = this.web3.utils.toBN(listing.commission)
    let unitsAvailable = listing.unitsTotal,
      unitsPending = 0,
      unitsSold = 0
    const booked = [],
      pendingBuyers = []

    if (listing.__typename === 'FractionalListing') {
      allOffers.forEach(offer => {
        if (!offer.valid || offer.status === 0) {
          // No need to do anything here.
        } else if (offer.startDate && offer.endDate) {
          booked.push(`${offer.startDate}-${offer.endDate}`)
        }
      })
    } else if (listing.__typename !== 'AnnouncementListing') {
      const commissionPerUnit = this.web3.utils.toBN(listing.commissionPerUnit)
      allOffers.forEach(offer => {
        const status = Number(offer.status)
        if (!offer.valid || status === 0) {
          // No need to do anything here.
        } else if (offer.quantity > unitsAvailable) {
          offer.valid = false
          offer.validationError = 'units purchased exceeds available'
        } else {
          try {
            unitsAvailable -= offer.quantity
            if (status === 1 || status === 2 || status === 3) {
              // Created, Accepted or Disputed
              unitsPending += offer.quantity
              pendingBuyers.push({ id: offer.buyer.id })
            } else if (status === 4 || status === 5) {
              // Finalized or Ruling
              unitsSold += offer.quantity
            }

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

    if (listing.status === 'active' && unitsAvailable <= 0) {
      if (listing.unitsTotal === 1 && unitsPending > 0) {
        listing.status = 'pending'
      } else {
        listing.status = 'sold'
      }
    }

    return Object.assign({}, listing, {
      allOffers,
      booked,
      unitsAvailable,
      unitsPending,
      unitsSold,
      pendingBuyers,
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

    const offer = await getOffer(this.contract, listingId, offerId, latestBlock)

    if (status === undefined) {
      status = offer.status
    }

    const data = await get(this.ipfsGateway, ipfsHash)

    const networkId = await this.getNetworkId()

    const offerObj = {
      id: `${networkId}-000-${listingId}-${offerId}`,
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
      endDate: _get(data, 'endDate'),
      totalPrice: _get(data, 'totalPrice')
    }
    offerObj.statusStr = offerStatus(offerObj)
    if (offerObj.totalPrice) {
      mutatePrice(offerObj.totalPrice)
    }

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

    const affiliateWhitelistDisabled = await getAffiliates(
      this.contract,
      this.contract._address
    )
    const offerAffiliate = offer.affiliate
      ? offer.affiliate.id.toLowerCase()
      : ZERO_ADDRESS
    const affiliateAllowed =
      affiliateWhitelistDisabled ||
      (await getAffiliates(this.contract, offerAffiliate))
    if (!affiliateAllowed) {
      throw new Error(`Offer affiliate ${offerAffiliate} not whitelisted`)
    }

    if (listing.__typename !== 'UnitListing') {
      // TODO: validate fractional offers
      return
    }

    if (_get(listing, 'price.currency.id') !== 'token-ETH') {
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

  async getReview(listingId, offerId, party, ipfsHash, event) {
    const data = await get(this.ipfsGateway, ipfsHash)
    const networkId = await this.getNetworkId()
    const offerIdExp = `${networkId}-000-${listingId}-${offerId}`
    const listing = await this.getListing(listingId, event.blockNumber)
    return {
      id: offerIdExp,
      reviewer: { id: party, account: { id: party } },
      listing,
      offer: { id: offerIdExp },
      review: data.text,
      rating: data.rating,
      event
    }
  }

  resetCache() {
    this.offerCache = {}
    this.listingCache = {}
  }
}

module.exports = OriginEventSource
