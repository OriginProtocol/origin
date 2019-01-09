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

    // Retrieve the IPFS data for all offers
    const offerCreationData = {}
    await Promise.all(
      events.map(async e => {
        if (e.event === 'OfferCreated') {
          const data = await get(this.ipfsGateway, e.returnValues.ipfsHash)
          offerCreationData[e.returnValues.offerID] = data
        }
      })
    )

    let unitsSold = 0
    let depositAvailable = web3.utils.toBN(listing.deposit)
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

      const offerId = e.returnValues.offerID
      const offer = offerId && offerCreationData[offerId]
      const offerCommission = offer &&
        web3.utils.toBN(web3.utils.toWei(offer.commission.amount, 'ether'))
      if (e.event === 'OfferCreated') {
        const unitsPurchased = offer && offer.unitsPurchased
        if (unitsPurchased) {
          unitsSold += unitsPurchased
        }
        if (offerCommission) {
          depositAvailable = depositAvailable.sub(offerCommission)
        }
      }
      if (e.event === 'OfferWithdrawn') {
        const unitsPurchased = offer && offer.unitsPurchased
        if (unitsPurchased) {
          unitsSold -= unitsPurchased
        }
        if (offerCommission) {
          depositAvailable = depositAvailable.add(offerCommission)
        }
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

    if (data.media && data.media.length) {
      data.media = data.media.map(m => ({
        ...m,
        urlExpanded: `${this.ipfsGateway}/${m.url.replace(':/', '')}`
      }))
    }

    const unitsAvailable = data.unitsTotal >= unitsSold
      ? data.unitsTotal - unitsSold
      : 0
    console.log()
    return {
      id: `999-1-${listingId}${blockNumber ? `-${blockNumber}` : ''}`,
      ipfs: ipfsHash ? { id: ipfsHash } : null,
      deposit: listing.deposit,
      depositAvailable: depositAvailable.toString(),
      arbitrator: listing.depositManager
        ? { id: listing.depositManager }
        : null,
      seller: seller ? { id: seller } : null,
      contract: this.contract,
      status,
      events,
      unitsSold,
      unitsAvailable,
      ...data
    }
  }

  async getOffer(listingId, offerId) {
    let blockNumber, status, ipfsHash, lastEvent, withdrawnBy, createdBlock
    const events = await this.contract.eventCache.offers(listingId, Number(offerId))

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

    let data = await get(this.ipfsGateway, ipfsHash)
    data = pick(
      data,
      'unitsPurchased'
    )

    const offerObj = {
      id: `999-1-${listingId}-${offerId}`,
      listingId: String(listingId),
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

    return offerObj
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
}

module.exports = OriginEventSource
