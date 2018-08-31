class MarkeplaceAdapter {
  constructor({ contractService, contractName }) {
    this.web3 = contractService.web3
    this.contractService = contractService
    this.contractName = contractName
  }

  async getContract() {
    if (!this.contract) {
      this.contract = await this.contractService.deployed(
        this.contractService[this.contractName]
      )
    }
  }

  async getListingsCount() {
    await this.getContract()
    const total = await this.contract.methods.totalListings().call()
    return Number(total)
  }

  async createListing(
    ipfsBytes,
    { deposit = '0', arbitrator },
    confirmationCallback
  ) {
    await this.getContract()
    const from = await this.contractService.currentAccount()

    const transactionReceipt = await new Promise((resolve, reject) => {
      this.contract.methods
        .createListing(ipfsBytes, deposit, arbitrator || from)
        .send({ gas: 4612388, from })
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('error', reject)
    })
    const timestamp = await this.contractService.getTimestamp(
      transactionReceipt
    )
    const listingIndex =
      transactionReceipt.events['ListingCreated'].returnValues.listingID
    return Object.assign({ timestamp, listingIndex }, transactionReceipt)
  }

  async withdrawListing(listingId, ipfsBytes, confirmationCallback) {
    await this.getContract()
    const from = await this.contractService.currentAccount()

    const opts = { gas: 4612388, from }
    const transactionReceipt = await new Promise((resolve, reject) => {
      this.contract.methods
        .withdrawListing(listingId, from, ipfsBytes)
        .send(opts)
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('error', reject)
    })
    const timestamp = await this.contractService.getTimestamp(
      transactionReceipt
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async makeOffer(listingId, ipfsBytes, data, confirmationCallback) {
    await this.getContract()
    const from = await this.contractService.currentAccount()
    const {
      finalizes,
      affiliate,
      commission,
      price,
      arbitrator,
      currencyAddr
    } = data

    const args = [
      listingId,
      ipfsBytes,
      finalizes || Math.round(+new Date() / 1000) + 60 * 60 * 24, // 24 hrs
      affiliate || '0x0',
      commission || '0',
      price,
      currencyAddr || '0x0',
      arbitrator || '0x0'
    ]
    const opts = { gas: 4612388, from }
    if (!currencyAddr) {
      opts.value = price
    }

    const transactionReceipt = await new Promise((resolve, reject) => {
      this.contract.methods
        .makeOffer(...args)
        .send(opts)
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('error', reject)
    })
    const timestamp = await this.contractService.getTimestamp(
      transactionReceipt
    )
    const offerIndex =
      transactionReceipt.events['OfferCreated'].returnValues.offerID
    return Object.assign({ timestamp, offerIndex }, transactionReceipt)
  }

  async acceptOffer(listingIndex, offerIndex, ipfsBytes, confirmationCallback) {
    await this.getContract()
    const from = await this.contractService.currentAccount()

    const args = [listingIndex, offerIndex, ipfsBytes]
    const opts = { gas: 4612388, from }
    const transactionReceipt = await new Promise((resolve, reject) => {
      this.contract.methods
        .acceptOffer(...args)
        .send(opts)
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('error', reject)
    })
    const timestamp = await this.contractService.getTimestamp(
      transactionReceipt
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async finalizeOffer(
    listingIndex,
    offerIndex,
    ipfsBytes,
    confirmationCallback
  ) {
    await this.getContract()
    const from = await this.contractService.currentAccount()

    const args = [listingIndex, offerIndex, ipfsBytes]
    const opts = { gas: 4612388, from }
    const transactionReceipt = await new Promise((resolve, reject) => {
      this.contract.methods
        .finalize(...args)
        .send(opts)
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('error', reject)
    })
    const timestamp = await this.contractService.getTimestamp(
      transactionReceipt
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async getListing(listingId) {
    await this.getContract()

    // Get the raw listing data from the contract
    const rawListing = await this.contract.methods.listings(listingId).call()

    // Find all events related to this listing
    const listingTopic = this.padTopic(listingId)
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, null, listingTopic, null],
      fromBlock: 0
    })

    const status =
      rawListing.seller.indexOf('0x00000') === 0 ? 'inactive' : 'active'

    // Loop through the events looking and update the IPFS hash appropriately
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
        offers[event.returnValues.offerID] = { status: 'buyerReviewed', event }
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
      const total = await this.contract.methods.totalListings().call()
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
    const rawOffer = await this.contract.methods
      .offers(listingIndex, offerIndex)
      .call()

    // Find all events related to this offer
    const listingTopic = this.padTopic(listingIndex)
    const offerTopic = this.padTopic(offerIndex)
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, null, listingTopic, offerTopic],
      fromBlock: 0
    })

    // Loop through the events looking and update the IPFS hash appropriately
    let ipfsHash, createdAt
    for (const e of events) {
      const timestamp = await this.contractService.getTimestamp(e)
      if (e.event === 'OfferCreated') {
        ipfsHash = e.returnValues.ipfsHash
        createdAt = timestamp
      }
      // Override status if offer was deleted from blockchain state
      if (e.event === 'OfferFinalized') {
        rawOffer.status = '3'
      }
      // TODO: Assumes OfferData event is a seller review
      if (e.event === 'OfferData') {
        rawOffer.status = '4'
      }
      e.timestamp = timestamp
    }

    // Return the raw listing along with events and IPFS hash
    return Object.assign({}, rawOffer, { ipfsHash, events, createdAt })
  }

  async addData(ipfsBytes, listingIndex, offerIndex, confirmationCallback) {
    await this.getContract()
    const from = await this.contractService.currentAccount()
    const transactionReceipt = await new Promise((resolve, reject) => {
      return this.contract.methods
        .addData(listingIndex, offerIndex, ipfsBytes)
        .send({ gas: 4612388, from })
        .on('receipt', resolve)
        .on('confirmation', confirmationCallback)
        .on('error', reject)
    })
    const timestamp = await this.contractService.getTimestamp(
      transactionReceipt
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

  padTopic(id) {
    return this.web3.utils.padLeft(this.web3.utils.numberToHex(id), 64)
  }
}

export default MarkeplaceAdapter
