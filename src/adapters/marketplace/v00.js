const OFFER_STATUS = [
  'error',
  'created',
  'accepted',
  'disputed',
  'finalized',
  'sellerReviewed',
  'withdrawn',
  'ruled'
]
const emptyAddress = '0x0000000000000000000000000000000000000000'

class V00_MarkeplaceAdapter {
  constructor({ contractService }) {
    this.web3 = contractService.web3
    this.contractService = contractService
    this.contractName = 'V00_Marketplace'
  }

  async getContract() {
    if (!this.contract) {
      this.contract = await this.contractService.deployed(
        this.contractService.contracts[this.contractName]
      )
    }
  }

  async call(methodName, args, opts) {
    return await this.contractService.call(
      this.contractName,
      methodName,
      args,
      opts
    )
  }

  async getListingsCount() {
    const total = await this.call('totalListings')
    return Number(total)
  }

  async createListing(
    ipfsBytes,
    { deposit = '0', arbitrator },
    confirmationCallback
  ) {
    const from = await this.contractService.currentAccount()

    const { transactionReceipt, timestamp } = await this.call(
      'createListing',
      [ipfsBytes, deposit, arbitrator || from],
      { from, confirmationCallback }
    )
    const listingIndex =
      transactionReceipt.events['ListingCreated'].returnValues.listingID
    return Object.assign({ timestamp, listingIndex }, transactionReceipt)
  }

  async withdrawListing(listingId, ipfsBytes, confirmationCallback) {
    const from = await this.contractService.currentAccount()
    const { transactionReceipt, timestamp } = await this.call(
      'withdrawListing',
      [listingId, from, ipfsBytes],
      { from, confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async makeOffer(listingId, ipfsBytes, data, confirmationCallback) {
    const {
      finalizes,
      affiliate,
      commission,
      priceWei,
      arbitrator,
      currencyAddr
    } = data

    const args = [
      listingId,
      ipfsBytes,
      finalizes || Math.round(+new Date() / 1000) + 60 * 60 * 24, // 24 hrs
      affiliate || emptyAddress,
      commission || '0',
      priceWei,
      currencyAddr || emptyAddress,
      arbitrator || emptyAddress
    ]
    const opts = { confirmationCallback }
    if (!currencyAddr) {
      opts.value = priceWei
    }

    const { transactionReceipt, timestamp } = await this.call(
      'makeOffer',
      args,
      opts
    )
    const offerIndex =
      transactionReceipt.events['OfferCreated'].returnValues.offerID
    return Object.assign({ timestamp, offerIndex }, transactionReceipt)
  }

  async withdrawOffer(listingIndex, offerIndex, ipfsBytes, confirmationCallback) {
    const { transactionReceipt, timestamp } = await this.call(
      'withdrawOffer',
      [listingIndex, offerIndex, ipfsBytes],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async acceptOffer(listingIndex, offerIndex, ipfsBytes, confirmationCallback) {
    const { transactionReceipt, timestamp } = await this.call(
      'acceptOffer',
      [listingIndex, offerIndex, ipfsBytes],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async finalizeOffer(
    listingIndex,
    offerIndex,
    ipfsBytes,
    confirmationCallback
  ) {
    const { transactionReceipt, timestamp } = await this.call(
      'finalize',
      [listingIndex, offerIndex, ipfsBytes],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async getListing(listingId) {
    await this.getContract()

    // Get the raw listing data from the contract.
    // Note: once a listing is withdrawn, it is deleted from the blockchain to save
    // on gas. In this cases rawListing is returned as an object with all its fields set to zero.
    const rawListing = await this.call('listings', [listingId])

    // Find all events related to this listing
    const listingTopic = this.padTopic(listingId)
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, null, listingTopic, null],
      fromBlock: 0
    })

    const status =
      rawListing.seller === emptyAddress ? 'inactive' : 'active'

    // Loop through the events looking and update the IPFS hash and offers appropriately.
    let ipfsHash
    const offers = {}
    events.forEach(event => {
      if (event.event === 'ListingCreated') {
        ipfsHash = event.returnValues.ipfsHash
      } else if (event.event === 'ListingUpdated') {
        ipfsHash = event.returnValues.ipfsHash
      } else if (event.event === 'OfferCreated') {
        offers[event.returnValues.offerID] = { status: 'created', event }
      } else if (event.event === 'OfferAccepted') {
        offers[event.returnValues.offerID] = { status: 'accepted', event }
      } else if (event.event === 'OfferFinalized') {
        offers[event.returnValues.offerID] = { status: 'finalized', event }
      } else if (event.event === 'OfferData') {
        offers[event.returnValues.offerID] = { status: 'sellerReviewed', event }
      }
    })

    // Return the raw listing along with events and IPFS hash
    return Object.assign({}, rawListing, { ipfsHash, events, offers, status })
  }

  async getListings(opts) {
    await this.getContract()

    if (opts.purchasesFor) {
      const events = await this.contract.getPastEvents('OfferCreated', {
        filter: { party: opts.purchasesFor },
        fromBlock: 0
      })
      const listingIds = []
      events.forEach(e => {
        const listingId = Number(e.returnValues.listingID)
        if (listingIds.indexOf(listingId) < 0) {
          listingIds.push(listingId)
        }
      })
      return listingIds
    } else if (opts.listingsFor) {
      const events = await this.contract.getPastEvents('ListingCreated', {
        filter: { party: opts.listingsFor },
        fromBlock: 0
      })
      return events.map(e => Number(e.returnValues.listingID))
    } else {
      const total = await this.call('totalListings')
      return [...Array(Number(total)).keys()]
    }
  }

  async getOffers(listingIndex, opts) {
    await this.getContract()

    let filter = {}
    if (listingIndex) {
      filter = Object.assign(filter, { listingID: listingIndex })
    }
    if (opts.for) {
      filter = Object.assign(filter, { party: opts.for })
    }
    const events = await this.contract.getPastEvents('OfferCreated', {
      filter,
      fromBlock: 0
    })
    return events.map(e => Number(e.returnValues.offerID))
  }

  async getOffer(listingIndex, offerIndex) {
    await this.getContract()

    // Get the raw listing data from the contract
    // Note: once an offer is finalized|ruled|withdrawn, it is deleted from the blockchain to save
    // on gas. In those cases rawOffer is returned as an object with all its fields set to zero.
    const rawOffer = await this.call('offers', [listingIndex, offerIndex])

    // Find all events related to this offer
    const listingTopic = this.padTopic(listingIndex)
    const offerTopic = this.padTopic(offerIndex)
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, null, listingTopic, offerTopic],
      fromBlock: 0
    })

    // Scan through the events to retrieve information of interest.
    let buyer, ipfsHash, createdAt
    for (const e of events) {
      const timestamp = await this.contractService.getTimestamp(e)
      e.timestamp = timestamp

      switch(e.event) {
      case 'OfferCreated':
        buyer = e.returnValues.party
        ipfsHash = e.returnValues.ipfsHash
        createdAt = timestamp
        break
      // In all cases below, the offer was deleted from the blochain
      // rawOffer fields are set to zero => populate rawOffer.status based on event history.
      case 'OfferFinalized':
        rawOffer.status = 4
        break
      case 'OfferData':
        rawOffer.status = 5
        break
      case 'OfferWithdrawn':
        rawOffer.status = 6
        break
      case 'OfferRuling':
        rawOffer.status = 7
        break
      }
    }

    // Translate status number to string
    rawOffer.status = OFFER_STATUS[rawOffer.status]

    // Return the raw listing along with events and IPFS hash
    return Object.assign({}, rawOffer, { buyer, ipfsHash, events, createdAt })
  }

  async addData(ipfsBytes, listingIndex, offerIndex, confirmationCallback) {
    const { transactionReceipt, timestamp } = await this.call(
      'addData',
      [listingIndex, offerIndex, ipfsBytes],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async getNotifications(party) {
    await this.getContract()

    const notifications = []

    const partyListingIds = []
    const partyOfferIds = []

    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, this.padTopic(party), null, null],
      fromBlock: 0
    })

    for (const event of events) {
      if (event.event === 'ListingCreated') {
        partyListingIds.push(event.returnValues.listingID)
      }
      if (event.event === 'OfferCreated') {
        partyOfferIds.push([
          event.returnValues.listingID,
          event.returnValues.offerID
        ])
      }
    }

    // Find pending offers and pending reviews
    for (const listingId of partyListingIds) {
      const listing = await this.getListing(listingId)
      for (const offerId in listing.offers) {
        const offer = listing.offers[offerId]
        if (offer.status === 'created') {
          notifications.push({
            event: offer.event,
            type: 'seller_listing_purchased',
            resources: { listingId, offerId }
          })
        }
        if (offer.status === 'finalized') {
          notifications.push({
            event: offer.event,
            type: 'seller_review_received',
            resources: { listingId, offerId }
          })
        }
      }
    }
    // Find pending offers and pending reviews
    for (const [listingId, offerId] of partyOfferIds) {
      const listing = await this.getListing(listingId)
      const offer = listing.offers[offerId]
      if (offer.status === 'accepted') {
        notifications.push({
          event: offer.event,
          type: 'buyer_listing_shipped',
          resources: { listingId, offerId }
        })
      }
    }

    return notifications
  }

  async getTokenAddress() {
    await this.getContract()
    return await this.contract.methods.tokenAddr().call()
  }

  padTopic(id) {
    return this.web3.utils.padLeft(this.web3.utils.numberToHex(id), 64)
  }
}

export default V00_MarkeplaceAdapter
