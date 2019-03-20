const OFFER_STATUS = [
  'error',
  'created',
  'accepted',
  'disputed',
  'finalized',
  'sellerReviewed',
  'withdrawn',
  'ruling'
]
const offerStatusToSellerNotificationType = {
  'created': 'seller_offer_created',
  'finalized': 'seller_offer_finalized',
  'disputed': 'seller_offer_disputed',
  'ruling': 'seller_offer_ruling',
  'withdrawn': 'seller_offer_withdrawn',
}
const offerStatusToBuyerNotificationType = {
  'accepted': 'buyer_offer_accepted',
  'disputed': 'buyer_offer_disputed',
  'ruling': 'buyer_offer_ruling',
  'sellerReviewed': 'buyer_offer_review',
  'withdrawn': 'buyer_offer_withdrawn',
}
const SUPPORTED_DEPOSIT_CURRENCIES = ['OGN']
const emptyAddress = '0x0000000000000000000000000000000000000000'

class V00_MarketplaceAdapter {
  constructor({ contractService, blockEpoch }) {
    this.web3 = contractService.web3
    this.contractService = contractService
    this.contractName = 'V00_Marketplace'
    this.tokenContractName = 'OriginToken'
    this.blockEpoch = blockEpoch || 0
    this.contract = null
  }


  toListingID(listingIndex) {
    return listingIndex
  }

  toListingIndex(listingID) {
    return listingID
  }

  async getContract() {
    if (!this.contract) {
      this.contract = await this.contractService.deployed(
        this.contractService.contracts[this.contractName]
      )
    }
    return this.contract
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
    { deposit = '0', arbitrator, commission = {} },
    confirmationCallback
  ) {
    const from = (await this.contractService.currentAccount()) || this.contractService.placeholderAccount()
    const { amount, currency } = commission

    if (currency && !SUPPORTED_DEPOSIT_CURRENCIES.includes(currency)) {
      throw `${currency} is not a supported deposit currency`
    }
    if (amount > 0) {
      deposit = await this.contractService.moneyToUnits(commission)
      const {
        market_address,
        selector,
        call_params
      } = await this._getTokenAndCallWithSenderParams(
        'createListingWithSender',
        ipfsBytes,
        deposit,
        arbitrator || from 
      )

      // In order to estimate gas correctly, we need to add the call to a create listing since that's called by the token
      const extra_estimated_gas = await this.contract.methods['createListing'](
        ipfsBytes,
        0,
        arbitrator || from
      ).estimateGas({ from })

      const { transactionReceipt, timestamp } = await this.contractService.call(
        this.tokenContractName,
        'approveAndCallWithSender',
        [market_address, deposit, selector, call_params],
        { from, confirmationCallback, additionalGas: extra_estimated_gas }
      )
      const events = await this.contract.getPastEvents('ListingCreated', {
        fromBlock: transactionReceipt.blockNumber,
        toBlock: transactionReceipt.blockNumber
      })

      for (const e of events) {
        if (e.transactionHash == transactionReceipt.transactionHash) {
          const listingIndex = e.returnValues.listingID
          return Object.assign({ timestamp, listingIndex }, transactionReceipt)
        }
      }
    } else {
      const { transactionReceipt, timestamp } = await this.call(
        'createListing',
        [ipfsBytes, deposit, arbitrator || from],
        { from, confirmationCallback }
      )
      const listingIndex =
        transactionReceipt.events['ListingCreated'].returnValues.listingID
      return Object.assign({ timestamp, listingIndex }, transactionReceipt)
    }
  }

  async updateListing(listingId, ipfsBytes, additionalDeposit, confirmationCallback) {
    const from = await this.contractService.currentAccount()
    const { transactionReceipt, timestamp } = await this.call(
      'updateListing',
      [listingId, ipfsBytes, additionalDeposit],
      { from, confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
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
      affiliate,
      arbitrator,
      commission,
      finalizes,
      totalPrice = {},
    } = data
    const price = await this.contractService.moneyToUnits(totalPrice)
    const commissionUnits = await this.contractService.moneyToUnits(commission)
    const currencies = await this.contractService.currencies()

    const args = [
      listingId,
      ipfsBytes,
      finalizes || 30 * 24 * 60 * 60, // 30 days from offer acceptance
      affiliate || emptyAddress,
      commissionUnits,
      price,
      currencies[totalPrice.currency].address,
      arbitrator || emptyAddress
    ]

    const opts = { confirmationCallback }

    if (totalPrice.currency === 'ETH') {
      opts.value = price
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

  async withdrawOffer(
    listingIndex,
    offerIndex,
    ipfsBytes,
    confirmationCallback
  ) {
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

  async initiateDispute(
    listingIndex,
    offerIndex,
    ipfsBytes,
    confirmationCallback
  ) {
    const { transactionReceipt, timestamp } = await this.call(
      'dispute',
      [listingIndex, offerIndex, ipfsBytes],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async resolveDispute(
    listingIndex,
    offerIndex,
    ipfsBytes,
    ruling,
    refund,
    confirmationCallback
  ) {
    const { transactionReceipt, timestamp } = await this.call(
      'executeRuling',
      [listingIndex, offerIndex, ipfsBytes, ruling, refund],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  async getListing(listingId, blockInfo) {
    await this.getContract()

    // Get the raw listing data from the contract.
    const rawListing = await this.call('listings', [listingId])

    // Find all events related to this listing
    const listingTopic = this.padTopic(listingId)
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, null, listingTopic],
      fromBlock: this.blockEpoch
    })

    let status = 'active'

    // Loop through the events looking and update the IPFS hash and offers appropriately.
    let ipfsHash
    const offers = {}
    events.forEach(event => {
      if (event.event === 'ListingCreated') {
        ipfsHash = event.returnValues.ipfsHash
      } else if (event.event === 'ListingUpdated') {
        // If a blockInfo is passed in, ignore updated IPFS data that occurred after.
        // This is used when we want to see what a listing looked like at the time an offer was made.
        // Specifically, on myPurchases and mySales requests as well as for arbitration.
        if (!blockInfo ||
          (event.blockNumber < blockInfo.blockNumber) ||
          (event.blockNumber === blockInfo.blockNumber && event.logIndex <= blockInfo.logIndex)) {
          ipfsHash = event.returnValues.ipfsHash
        }
      } else if (event.event === 'ListingWithdrawn') {
        status = 'inactive'
      } else if (event.event === 'OfferCreated') {
        offers[event.returnValues.offerID] = { status: 'created', event }
      } else if (event.event === 'OfferAccepted') {
        offers[event.returnValues.offerID] = { status: 'accepted', event }
      } else if (event.event === 'OfferDisputed') {
        offers[event.returnValues.offerID] = { status: 'disputed', event }
      } else if (event.event === 'OfferRuling') {
        offers[event.returnValues.offerID] = { status: 'ruling', event }
      } else if (event.event === 'OfferFinalized') {
        offers[event.returnValues.offerID] = { status: 'finalized', event }
      } else if (event.event === 'OfferWithdrawn') {
        offers[event.returnValues.offerID] = { status: 'withdrawn', event }
      } else if (event.event === 'OfferData') {
        offers[event.returnValues.offerID] = { status: 'sellerReviewed', event }
      }
    })

    if (!ipfsHash) {
      throw(`ipfsHash not found in events for listing ${listingId}`)
    }

    // Return the raw listing along with events and IPFS hash
    return Object.assign({}, rawListing, { ipfsHash, events, offers, status })
  }

  // Logs a listing and its associated events and offers to the browser's JS
  // console. This is meant for live debugging of listings and should not be
  // used from other functions.
  async logListing(listingId) {
    if (!window || !window.originTest) {
      throw new Error('This can only be called from a browser JS console')
    }
    await this.getContract()

    // Dump Listing struct from marketplace contract
    const rawListing = await this.call('listings', [listingId])
    const filteredListing = {
      seller: rawListing.seller,
      deposit: rawListing.deposit,
      depositManager: rawListing.depositManager
    }
    console.log('Listing:')
    console.table(filteredListing)

    // Find all events related to this listing
    const listingTopic = this.padTopic(listingId)
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, null, listingTopic],
      fromBlock: this.blockEpoch
    })
    console.log('Events:')

    // Objects returned from web3 often have redundant entries with numeric
    // keys, so we filter those out.
    const filterObject = (obj) => {
      const filteredObj = {}
      for (const [key, value] of Object.entries(obj)) {
        if (isNaN(parseInt(key[0], 10))) {
          filteredObj[key] = value
        }
      }
      return filteredObj
    }

    // Log each event and its corresponding IPFS object, if available.
    let eventIndex = 0
    for (const event of events) {
      const filteredEvent = Object.assign(
        { eventIndex, name: event.event },
        filterObject(event.returnValues)
      )
      // Only keep keys that don't start with a digit. The filtered keys are
      // redundant.
      for (const [key, value] of Object.entries(event.returnValues)) {
        if (isNaN(parseInt(key[0], 10))) {
          filteredEvent[key] = value
        }
      }

      // Load the associated IPFS object.
      const ipfsService = window.originTest.marketplace.ipfsService
      try {
        const ipfsHash = this.contractService.getIpfsHashFromBytes32(
          event.returnValues.ipfsHash
        )
        if (ipfsHash && ipfsService) {
          const ipfsObj = await ipfsService.loadObjFromFile(ipfsHash)
          filteredEvent.ipfsData = ipfsObj
        }
      } catch(e) {
        filteredEvent.ipfsData = 'Could not load from IPFS'
      }

      // Load the associated offer, if applicable.
      if (filteredEvent.offerID !== undefined) {
        filteredEvent.offer = filterObject(
          await this.call('offers', [listingId, filteredEvent.offerID])
        )
      }

      console.log(filteredEvent)
      eventIndex++
    }
  }

  /**
   * Returns list of listing Ids. Options:
   *  - listingsFor: returns only listings created by the specified address (e.g. seller).
   *  - purchasesFor: returns only listings the specified address (e.g. buyer) made an offer on.
   * @param opts {Object} Options: purchasesFor, listingsFor
   * @return {Promise<*>}
   */
  async getListings(opts) {
    await this.getContract()

    if (opts.purchasesFor) {
      const events = await this.contract.getPastEvents('OfferCreated', {
        filter: { party: opts.purchasesFor },
        fromBlock: this.blockEpoch
      })
      const listingIds = []
      events.forEach(e => {
        const listingId = Number(e.returnValues.listingID)

        if (opts.withBlockInfo) {
          const idExists = listingIds.some(obj => obj.listingIndex === listingId)

          if (!idExists) {
            const { blockNumber, logIndex } = e
            listingIds.push({
              listingIndex: listingId,
              blockInfo: {
                blockNumber,
                logIndex
              }
            })
          }
        } else {
          if (listingIds.indexOf(listingId) < 0) {
            listingIds.push(listingId)
          }
        }
      })
      return listingIds
    } else if (opts.listingsFor) {
      const events = await this.contract.getPastEvents('ListingCreated', {
        filter: { party: opts.listingsFor },
        fromBlock: this.blockEpoch
      })
      return events.map(e => Number(e.returnValues.listingID))
    } else {
      const total = await this.call('totalListings')
      return [...Array(Number(total)).keys()]
    }
  }

  /**
   * Returns list of offer Ids for a given listing. Options:
   *  - for: returns only offers made by a specific buyer.
   * @param listingIndex
   * @param opts { for: buyer address }
   * @return {Promise<*>}
   */
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
      fromBlock: this.blockEpoch
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
      fromBlock: this.blockEpoch
    })

    // Scan through the events to retrieve information of interest.
    let buyer, ipfsHash, createdAt, blockNumber, logIndex
    for (const e of events) {
      const timestamp = await this.contractService.getTimestamp(e)
      e.timestamp = timestamp

      switch (e.event) {
      case 'OfferCreated':
        buyer = e.returnValues.party
        ipfsHash = e.returnValues.ipfsHash
        createdAt = timestamp
        blockNumber = e.blockNumber
        logIndex = e.logIndex
        break
        // In all cases below, the offer was deleted from the blockchain and therefore
        // rawOffer fields are set to zero => populate rawOffer.status based on event history.
      case 'OfferFinalized':
        rawOffer.status = 4
        break
        // FIXME: This assumes OfferData event is always a seller review whereas it may be
        // emitted by the marketplace contract in other cases such as a seller initiated refund.
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

      e.timestamp = timestamp
    }

    // Translate status number to string
    rawOffer.status = OFFER_STATUS[rawOffer.status]

    // Return the raw listing along with events and IPFS hash
    return Object.assign({}, rawOffer, { buyer, ipfsHash, events, createdAt, blockNumber, logIndex })
  }

  async addData(ipfsBytes, listingIndex, offerIndex, confirmationCallback) {
    const { transactionReceipt, timestamp } = await this.call(
      'addData',
      [listingIndex, offerIndex, ipfsBytes],
      { confirmationCallback }
    )
    return Object.assign({ timestamp }, transactionReceipt)
  }

  /**
   * Fetches all notifications for a user since inception.
   * @param {string} party - User's ETH address.
   * @return {Promise<Array{
   *     event: web3Event, type:string,
   *     resources: {listingId: string, offerId: string}}
   *   >}
   */
  async getNotifications(party) {
    await this.getContract()

    const notifications = []

    const partyListingIds = []
    const partyOfferIds = []

    // Fetch all marketplace events where user is the party.
    const events = await this.contract.getPastEvents('allEvents', {
      topics: [null, this.padTopic(party)],
      fromBlock: this.blockEpoch
    })

    // Create a list of
    //  - Ids of listings created by the user as a seller
    //  - Ids of offers made by the user as a buyer.
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

    // Find events of interest on offers for listings created by the user as a seller.
    for (const listingId of partyListingIds) {
      try {
        const listing = await this.getListing(listingId)
        for (const offerId in listing.offers) {
          const offer = listing.offers[offerId]
          // Skip the event if the action was initiated by the user.
          if (party.toLowerCase() === offer.event.returnValues.party.toLowerCase()) {
            continue
          }
          const type =  offerStatusToSellerNotificationType[offer.status]
          if (type) {
            notifications.push({
              type,
              event: offer.event,
              resources: { listingId, offerId }
            })
          }
        }
      } catch (e) {
        // Guard against invalid listing/offer that might be created for example
        // by exploiting a validation loophole in origin-js listing/offer code
        // or by writing directly to the blockchain.
        console.log('getNotifications: skipping invalid listing')
        console.log(`  contract=${this.contractName} listingId=${listingId} error=${e}`)
      }
    }

    // Find events of interest on offers made by the user as a buyer.
    for (const [listingId, offerId] of partyOfferIds) {
      try {
        const listing = await this.getListing(listingId)
        const offer = listing.offers[offerId]
        // Skip the event if the action was initiated by the user.
        if (party.toLowerCase() === offer.event.returnValues.party.toLowerCase()) {
          continue
        }
        const type = offerStatusToBuyerNotificationType[offer.status]
        if (type) {
          notifications.push({
            type,
            event: offer.event,
            resources: { listingId, offerId }
          })
        }
      } catch (e) {
        // Guard against invalid listing/offer that might be created for example
        // by exploiting a validation loophole in origin-js listing/offer code
        // or by writing directly to the blockchain.
        console.log('getNotifications: skipping invalid offer')
        console.log(`  contract=${this.contractName} offerId=${offerId} error=${e}`)
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

  async _getTokenAndCallWithSenderParams(call_name, ...args) {
    await this.getContract()
    for (const call of this.contract.options.jsonInterface) {
      if (
        call.name === call_name &&
        call.type === 'function' &&
        call.signature
      ) {
        const market_address = this.contract.options.address
        // take out the first parameter which is hopefully the seller address
        const input_types = call.inputs.slice(1).map(e => e.type)
        if (input_types.length != args.length) {
          throw 'The number of parameters passed does not match the contract parameters'
        }
        const call_params = this.web3.eth.abi.encodeParameters(
          input_types,
          args
        )
        const selector = call.signature
        return { market_address, selector, call_params }
      }
    }
    throw 'Invalid Marketplace contract for getting create parameters'
  }
}

export default V00_MarketplaceAdapter
