import BigNumber from 'bignumber.js'
import { Listing } from '../models/listing'
import { Offer } from '../models/offer'
import { Review } from '../models/review'
import { Notification } from '../models/notification'
import { notificationStatuses, storeKeys } from '../models/notification'
import { generateListingId, generateOfferId } from '../utils/id'
import stringify from 'json-stable-stringify'
import { recoverTypedSignature } from 'eth-sig-util'
import {
  LISTING_DATA_TYPE,
  LISTING_WITHDRAW_DATA_TYPE,
  OFFER_DATA_TYPE,
  OFFER_WITHDRAW_DATA_TYPE,
  OFFER_ACCEPT_DATA_TYPE,
  DISPUTE_DATA_TYPE,
  RESOLUTION_DATA_TYPE,
  REVIEW_DATA_TYPE,
  IpfsDataStore,
} from '../ipfsInterface/store'
import MarketplaceResolver from '../contractInterface/marketplace/resolver'

export default class Marketplace {
  constructor({
    contractService,
    ipfsService,
    discoveryService,
    hotService,
    store,
    affiliate,
    arbitrator,
    perfModeEnabled })
  {
    this.hotService = hotService
    this.contractService = contractService
    this.ipfsService = ipfsService
    this.discoveryService = discoveryService
    this.affiliate = affiliate
    this.arbitrator = arbitrator
    this.ipfsDataStore = new IpfsDataStore(this.ipfsService)
    this.resolver = new MarketplaceResolver(...arguments)
    this.perfModeEnabled = perfModeEnabled

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
    return await this.resolver.getListingsCount()
  }

  /**
   * getPurchases
   * @description - Gets an array of purchases for a given buyer in the form { offer, listing }
   * @param account - The account of the buyer for whom the purchases are needed
   * @return {Promise<List(Listing)>}
   */
  async getPurchases(account) {
    const listings = await this.getListings({
      purchasesFor: account,
      loadOffers: true,
      withBlockInfo: true
    })

    return listings
      .map(listing => listing.offers)
      .reduce((offers = [], offerArr) => offers = [...offers, ...offerArr], [])
      // only keep the purchases where user identified by `account` is the buyer
      .filter(offer => offer.buyer.toLowerCase() === account.toLowerCase())
      .map(offer => {
        return {
          offer,
          listing: listings.find(listing => listing.id === offer.listingId)
        }
      })
  }

  /**
   * getSales
   * @description - Gets an array of sales for a given seller in the form { offer, listing }
   * @param account - The account of the seller for whom the sales are needed
   * @return {Promise<List(Listing)>}
   */
  async getSales(account) {
    const listings = await this.getListings({
      listingsFor: account
    })

    const offerArrays = await Promise.all(
      listings.map(async listing => {
        return await this.getOffers(listing.id)
      })
    )

    const offers =
      offerArrays &&
      offerArrays.length &&
      offerArrays.reduce((offers = [], offerArr) => offers = [...offers, ...offerArr]) ||
      []

    // Since we didn't have the block numbers from the OfferCreated events when we first
    // fetched the listing data, we now have to re-fetch it, passing in the block number
    // of the offer to make sure we have the listing data as it was when the offer was made
    const listingsToFetch = offers.map(offer => {
      const { listingId, blockInfo } = offer
      return {
        listingId,
        blockInfo
      }
    })

    const listingsAtTimeOfPurchase = await Promise.all(
      listingsToFetch.map(async listingData => {
        const { listingId, blockInfo } = listingData
        return await this.getListing(listingId, { blockInfo: blockInfo })
      })
    )

    return offers.map(offer => {
      return {
        offer,
        listing: listingsAtTimeOfPurchase.find(listing => listing.id === offer.listingId)
      }
    })
  }

  /**
   * private helper function to enrich listing with offers
   * @param {Listing} listing to be enriched with offer information
   */
  async _addOffersToListing(listingId, listing) {
    listing.offers = await this.getOffers(listingId, { listing })
    return listing
  }

  /**
   * Returns listings.
   * TODO: This won't scale. Add support for pagination.
   * @param opts: {idsOnly: boolean, listingsFor: sellerAddress, purchasesFor: buyerAddress, withBlockInfo: boolean, loadOffers: boolean}
   *  - idsOnly: Returns only ids rather than the full Listing object.
   *  - listingsFor: Returns latest version of all listings created by a seller.
   *  - purchasesFor: Returns all listings a buyer made an offer on.
   *  - withBlockinfo: Only used in conjunction with purchasesFor option. Loads version
   *    of the listing at the time offer was made by the buyer.
   *  - loadOffers: also load offers for this listing
   * @return {Promise<List(Listing)>}
   * @throws {Error}
   */
  async getListings(opts = {}) {
    if (this.perfModeEnabled) {
      // In performance mode, fetch data from the discovery back-end to reduce latency.
      const listings = await this.discoveryService.getListings(opts)
      if (opts.loadOffers){
        return Promise.all(
          listings.map(async listing => {
            return await this._addOffersToListing(listing.id, listing)
          })
        )
      }
      return listings
    }

    const listingIds = await this.resolver.getListingIds(opts)
    if (opts.idsOnly) {
      return listingIds
    }

    if (opts.withBlockInfo) {
      return Promise.all(
        listingIds.map(async listingData => {
          const { listingId, blockInfo } = listingData
          return await this.getListing(listingId, { blockInfo: blockInfo, loadOffers: opts.loadOffers })
        })
      )
    } else {
      return Promise.all(
        listingIds.map(async listingId => {
          return await this.getListing(listingId, { loadOffers: opts.loadOffers })
        })
      )
    }
  }

  /**
   * Returns a Listing object based on its id.
   * @param {string} listingId
   * @param {{blockNumber: integer, logIndex: integer}} blockInfo - Optional argument
   *   to indicate a specific version of the listing should be loaded.
   * @param opts: {loadOffers: boolean, blockInfo: Object}
   *   - loadOffers: also load offers for this listing
   *   - blockInfo: {{blockNumber: integer, logIndex: integer}} - Optional argument
   * @returns {Promise<Listing>}
   * @throws {Error}
   */
  async getListing(listingId, opts = {}) {
    const {
      blockInfo,
      loadOffers
    } = opts

    if (this.perfModeEnabled) {
      // In performance mode, fetch data from the discovery back-end to reduce latency.
      let listing = await this.discoveryService.getListing(listingId, blockInfo)
      if (loadOffers)
        listing = await this._addOffersToListing(listingId, listing)

      return listing
    }

    // Get the on-chain listing data.
    let chainListing = await this.resolver.getListing(listingId, blockInfo)
    if (loadOffers)
      chainListing = await this._addOffersToListing(listingId, chainListing)

    // Create and return a Listing from on-chain and off-chain data.
    return this._listingFromData(listingId, chainListing)
  }

  async _listingFromData(listingId, chainListing) {
    // Get the off-chain listing data from IPFS.
    const ipfsHash = this.contractService.getIpfsHashFromBytes32(
      chainListing.ipfsHash
    )
    const ipfsListing = await this.ipfsDataStore.load(LISTING_DATA_TYPE, ipfsHash)

    // Create and return a Listing from on-chain and off-chain data.
    return Listing.init(listingId, chainListing, ipfsListing)
  }

  /**
   * Returns all the offers for a listing.
   * @param listingId
   * @param opts: {idsOnly:boolean, for:address, listing:Listing}
   * @return {Promise<List(Offer)>}
   */
  async getOffers(listingId, opts = {}) {
    //
    // Step 1: Fetch offers
    //
    let allOffers
    if (this.perfModeEnabled) {
      // In performance mode, fetch offers from the discovery back-end to reduce latency.
      // Note: we ignore the idsOnly option here in order to fetch the entire offer data.
      const discoveryOpts = Object.assign({}, opts, { idsOnly: false })
      allOffers = await this.discoveryService.getOffers(listingId, discoveryOpts)
    } else {
      // Fetch offers from the blockchain.
      const offerIds = await this.resolver.getOfferIds(listingId, opts)
      allOffers = await Promise.all(
        offerIds.map(async offerId => {
          try {
            return await this.getOffer(offerId)
          } catch (e) {
            // TODO(John) - handle this error better. It's tricky b/c it happens in a map
            // and we want to throw the error, but we don't want the whole getOffers() call to fail.
        listingId,    // We want it to return the offers that it was able to get but still let us know something failed.
            console.error(
              `Error getting offer data for offer ${
                offerId
                }: ${e}`
            )
            return null
          }
        })
      )
      allOffers = allOffers.filter(offer => offer !== null)
    }

    // If not a unit listing, return right away since filtering is not necessary.
    const listing = opts.listing || await this.getListing(listingId)
    if (listing.type !== 'unit') {
      return opts.idsOnly ? allOffers.map(o => o.id) : allOffers
    }

    //
    // Step 2:
    // This is unit listing specific. Filter out offers for which the units purchased exceeds 
    // the units available or boost exceeds the expected boost at the time of the offer.
    const isMultiUnit = listing.unitsTotal > 1 && listing.type === 'unit'
    const commission = listing.commission.amount
      ? BigNumber(listing.commission.amount)
      : null
    const commissionPerUnit = isMultiUnit
      ? BigNumber(listing.commissionPerUnit.amount)
      : commission
    let commissionAvailable = new BigNumber(commission) // create new instance
    let unitsAvailable = listing.unitsTotal

    const offers = allOffers.filter(offer => {
      const offerCommission = offer.commission && BigNumber(offer.commission.amount)

      // required for multi-unit commission and unitsAvailable calculations
      const onValidOffer = () => {
        if (offer.status === 'withdrawn')
          return

        unitsAvailable -= offer.unitsPurchased
        commissionAvailable = BigNumber.max(
          commissionAvailable.minus(offerCommission),
          BigNumber(0)
        )
      }
      /* Validate units purchased against units available.
       *
       * This check is required because of an edge case, where 2 users can make an offer at the same
       * time for the remaining amount of units in a listing. Both offers will get mined, since they
       * are both valid at the time transaction to the blockchain is issued. After they are mined, only
       * the first one is valid.
       */
      if (offer.unitsPurchased > unitsAvailable) {
        return false
      }

      // listing has no commission
      if (!isMultiUnit && (commissionPerUnit === null || commissionPerUnit.isEqualTo(0))) {
        onValidOffer()
        return true
      }
      else if (!isMultiUnit) {
        if (offerCommission && offerCommission.isEqualTo(commission)){
          onValidOffer()
          return true
        }
        return false
      }

      /* Multi unit logic with commission and commission limit from here on...
       * Validate that the offer commission is what we expect. If the amount
       * of commission for the listing isn't sufficient for this offer, we
       * require that the offer have whatever commission is available to it.
       *
       * Currenlty (Dec 2018) sellers can not edit commission and commissionPerUnit
       * on a listing. Once this option is unlocked, this code needs to be
       * modified also.
       */
      const expectedCommission = BigNumber.min(
        commissionAvailable,
        commissionPerUnit.times(offer.unitsPurchased)
      )

      if (!offerCommission || !offerCommission.isEqualTo(expectedCommission)) {
        return false
      }

      onValidOffer()
      return true
    })

    return opts.idsOnly ? offers.map(o => o.id) : offers
  }

  /**
   * Returns an offer based on its id.
   * @param {string}offerId - Unique offer Id.
   * @return {Promise<Offer>} - models/Offer object
   */
  async getOffer(offerId) {
    if (this.perfModeEnabled) {
      // In performance mode, fetch offer from the discovery back-end to reduce latency.
      return await this.discoveryService.getOffer(offerId)
    }
    // Load chain data.
    const { chainOffer, listingId } = await this.resolver.getOffer(offerId)

    // Load ipfs data.
    const ipfsHash = this.contractService.getIpfsHashFromBytes32(
      chainOffer.ipfsHash
    )

    const ipfsOffer = await this.ipfsDataStore.load(OFFER_DATA_TYPE, ipfsHash)

    // validate offers awaiting approval
    if (chainOffer.status === 'created') {
      let listing

      if (chainOffer.listingIpfsHash)
      {
        listing = this._listingFromData(listingId, {ipfsHash:chainOffer.listingIpfsHash})
      }
      else
      {
        listing = await this.getListing(listingId)
      }

      if (listing.type === 'unit') {
        // TODO(John) - there is currently no way to know the currency of a fractional listing.
        // We probably need to add a required "currency" field to the listing schema and write a check here
        // to make sure the chainOffer and the listing have the same currency
        //
        // TODO: also, there is no way to detect whether the currency of the
        // listing commission matches the currency for the offer commission
        const listingCurrency = listing.price && listing.price.currency
        const listingPrice = await this.contractService.moneyToUnits(listing.price)
        const currencies = await this.contractService.currencies()
        const currency = listingCurrency && currencies[listingCurrency]
        const currencyAddress = currency && currency.address

        if (currencyAddress !== chainOffer.currency) {
          throw new Error('Invalid offer: currency does not match listing')
        }

        const expectedValue = BigNumber(listingPrice).multipliedBy(ipfsOffer.unitsPurchased)
        if (expectedValue.isGreaterThan(BigNumber(chainOffer.value))) {
          throw new Error('Invalid offer: insufficient offer amount for listing')
        }
      }

      // We do not validate commission amount here, because to do so would
      // require every other offer for the listing.

      if (chainOffer.arbitrator.toLowerCase() !== this.arbitrator.toLowerCase()) {
        throw new Error('Invalid offer: arbitrator is invalid')
      }

      if (chainOffer.affiliate.toLowerCase() !== this.affiliate.toLowerCase()) {
        throw new Error('Invalid offer: affiliate is invalid')
      }
    }

    // Create an Offer from on-chain and off-chain data.
    return Offer.init(offerId, listingId, chainOffer, ipfsOffer)
  }

  get injectPossible() {
    return this.perfModeEnabled
  }

  async generateListingId(listing)
  {
    return [await this.contractService.web3.eth.net.getId(), 'A', listing.uniqueId].join('-')
  }

  async offerListing( ipfsData, offerCreateFunc ) {
    const account = await this.contractService.currentAccount()
    ipfsData.creator = account
    ipfsData.createDate = (new Date()).toISOString()

    if (ipfsData.unitsTotal !== undefined)
    {
      ipfsData.unitsTotal = 1
    }
    const ipfsHash = await this.ipfsDataStore.save(LISTING_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    const ipfsListing = await this.ipfsDataStore.load(LISTING_DATA_TYPE, ipfsHash)

    const seller = "0x0000000000000000000000000000000000000000"

    const listing = Listing.init(undefined, 
      { status:'active',
        ipfsHash:ipfsBytes,
        seller}, ipfsListing)

    const listingID = await this.generateListingId(listing)
    listing.id = listingID

    const listingIpfsHash = listing.ipfsHash
    const verifier = process.env.DEFAULT_VERIFIER_ACCOUNT
    const price = await this.contractService.moneyToUnits(listing.price)

    const offerData = await offerCreateFunc(listing)

    // TODO: nest offerData.affiliate, offerData.arbitrator, offerData.finalizes under an "_untrustworthy" key
    // Validate and save the data to IPFS.
    const offerIpfsHash = await this.ipfsDataStore.save(OFFER_DATA_TYPE, offerData)
    const offerIpfsBytes = this.contractService.getBytes32FromIpfsHash(offerIpfsHash)
    const affiliate = this.affiliate
    const arbitrator = this.arbitrator

    return await this.resolver.makeOffer(
      listingID,
      offerIpfsBytes,
      Object.assign({ affiliate, arbitrator, seller, listingIpfsHash:ipfsBytes, verifier }, offerData)
    )
  }


  async verifyFinalizeOffer(offerId, params ={}) {
    const {signature, ipfsBytes, payout, verifyFee} = await this.hotService.verifyOffer(offerId, params)

    if (signature) {
        await this.resolver.verifiedFinalizeOffer(offerId, ipfsBytes, verifyFee, payout, signature)
        return true
    } else {
      return false
    }
  }

  async verifyListingSignature(listing, signer) {
    // grab the raw ipfs hash
    const ipfs_response = await this.ipfsService.loadFile(listing.ipfs.hash)
    const ipfs_data = await ipfs_response.json()
    const signature = ipfs_data.signature
    delete ipfs_data.signature
    listing.raw_ipfs_hash = this.contractService.web3.utils.sha3(stringify(ipfs_data))
    const signData = await this.contractService.getSignListingData(listing)
    const recoveredAddress =  recoverTypedSignature({data:signData, sig:signature})
    delete listing.raw_ipfs_hash

    if (recoveredAddress == signer.toLowerCase()) {
      return true
    }
    console.log("Signature verification failed:", signData, " recovered address:", recoveredAddress, " signer:", signer)
  }

  async injectListing( ipfsData ) {
    const account = await this.contractService.currentAccount()
    ipfsData.creator = account
    ipfsData.createDate = (new Date()).toISOString()

    const encodedData = await this.ipfsDataStore.encodeData(LISTING_DATA_TYPE, JSON.parse(JSON.stringify(ipfsData)))
    const listingData = await this.ipfsDataStore.processData(LISTING_DATA_TYPE, JSON.parse(JSON.stringify(encodedData)))

    const listing = Listing.init(undefined, 
      { status:'active',
        seller:account}, listingData)

    // Here's where we encode the raw data to a signature
    listing.raw_ipfs = encodedData
    listing.raw_ipfs_hash = web3.utils.sha3(stringify(encodedData))

    listing.id = await this.generateListingId(listing)
    const signature = await this.contractService.signListing(listing)
    ipfsData.signature = signature

    const ipfsHash = await this.ipfsDataStore.save(LISTING_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
   
    return this.discoveryService.injectListing(ipfsBytes, listing.seller, 
      listing.deposit, listing.depositManager, listing.status, signature)
  }

  /**
   * Creates a new listing in the system. Data is recorded both on-chain and off-chain in IPFS.
   * @param {object} data - Listing data to store in IPFS
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{listingId, ...transactionReceipt}>}
   */
  async createListing(ipfsData, confirmationCallback) {
    // Validate and save the data to IPFS.
    const ipfsHash = await this.ipfsDataStore.save(LISTING_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.createListing(
      ipfsBytes,
      ipfsData,
      confirmationCallback
    )
  }

  /**
   * Update a listing.
   * @param {string} listingId - The ID of the listing to update
   * @param {object} ipfsData - The new data to store
   * @param {number} [additionalDeposit] - Amount of additional deposit to send
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{listingId, ...transactionReceipt}>}
   */
  async updateListing(listingId, ipfsData, additionalDeposit = 0, confirmationCallback) {
    const oldListing = await this.getListing(listingId)
    if (
      oldListing.type === 'unit' &&
      ipfsData.unitsTotal !== oldListing.unitsTotal
    ) {
      const offers = await this.getOffers(listingId)
      const unitsSold = this.unitsSold(oldListing, offers)
      if (ipfsData.unitsTotal < unitsSold) {
        throw new Error('new unitsTotal insufficient to cover accepted offers')
      }
    }

    // Validate and save the data to IPFS.
    const ipfsHash = await this.ipfsDataStore.save(LISTING_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.updateListing(
      listingId,
      ipfsBytes,
      additionalDeposit,
      confirmationCallback
    )
  }

  /**
   * Closes a listing.
   * @param listingId
   * @param ipfsData - Data to store in IPFS. For future use, currently empty.
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async withdrawListing(listingId, ipfsData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(LISTING_WITHDRAW_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.withdrawListing(
      listingId,
      ipfsBytes,
      confirmationCallback
    )
  }

  /**
   * Adds an offer for a listing.
   * @param {string} listingId
   * @param {object} offerData - Offer data, expected in V1 schema format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{listingId, offerId, ...transactionReceipt}>}
   */
  async makeOffer(listingId, offerData = {}, confirmationCallback) {
    const listing = await this.getListing(listingId)
    const seller = listing.seller
    const listingIpfsHash = listing.ipfsHash
    const verifier = await this.contractService.currentAccount()
    const ipfsVerifyTerms = "0x00"
    if (offerData.listingType && offerData.listingType === 'unit') {
      const offers = await this.getOffers(listingId, { listing })
      const unitsPurchased = Number.parseInt(offerData.unitsPurchased)
      const unitsAvailable = this.unitsAvailable(listing, offers)
      if (unitsPurchased > unitsAvailable) {
        throw new Error('units purchased exceeds units available')
      }
    }

    // TODO: nest offerData.affiliate, offerData.arbitrator, offerData.finalizes under an "_untrustworthy" key
    // Validate and save the data to IPFS.
    const ipfsHash = await this.ipfsDataStore.save(OFFER_DATA_TYPE, offerData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    const affiliate = this.affiliate
    const arbitrator = this.arbitrator


    return await this.resolver.makeOffer(
      listingId,
      ipfsBytes,
      Object.assign({ affiliate, arbitrator, seller, listingIpfsHash, verifier, ipfsVerifyTerms }, offerData),
      confirmationCallback
    )
  }

  // updateOffer(listingId, offerId, data) {}

  /**
   * Withdraws an offer.
   * This may be called by either the buyer (to cancel an offer)
   * or the seller (to reject an offer).
   * @param {string} id - Offer unique ID.
   * @param ipfsData - Data to store in IPFS. For future use, currently empty.
   * @param {func(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async withdrawOffer(id, ipfsData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(OFFER_WITHDRAW_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.withdrawOffer(id, ipfsBytes, confirmationCallback)
  }

  async signAcceptOffer(id) {
    const ipfsHash = await this.ipfsDataStore.save(OFFER_ACCEPT_DATA_TYPE, {})
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    const signature = await this.resolver.signAcceptOffer(id, ipfsBytes)

    return {offerId:id, ipfsHash:ipfsBytes, signature}
  }

  /**
   * Accepts an offer.
   * @param {string} id - Offer unique ID.
   * @param ipfsData - Data to store in IPFS. For future use, currently empty.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async acceptOffer(id, ipfsData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(OFFER_ACCEPT_DATA_TYPE, ipfsData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    // Throw an error if the offer is invalid. We detect this through
    // getOffers(), which filters out invalid offers.
    const offer = await this.resolver.getOffer(id)
    const { listingId } = offer
    const listing = await this.getListing(listingId)
    if (listing.type === 'unit') {
      const offers = await this.getOffers(listingId, { listing })
      const validOffer = offers.filter(o => o.id === id).length > 0
      if (!validOffer) {
        throw new Error(`cannot accept invalid offer ${id}`)
      }
    }

    // do no gas here
    return await this.resolver.acceptOffer(id, ipfsBytes, confirmationCallback, offer, listing)
  }

  /**
   * Finalizes an offer. Store review data in IPFS.
   * @param {string} id - Offer unique ID.
   * @param {object} reviewData - Buyer's review. Data expected in schema version 1.0 format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async finalizeOffer(id, reviewData, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(REVIEW_DATA_TYPE, reviewData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.finalizeOffer(
      id,
      ipfsBytes,
      confirmationCallback
    )
  }

  // setOfferRefund(listingId, offerId, data) {}
  // manageListingDeposit(listingId, data) {}

  /**
   * Initiate a dispute regarding an offer. Puts the offer into "Disputed" status.
   * @param {string} offerId - Offer ID
   * @param {object} disputeData - Data describing this dispute - stored in IPFS
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async initiateDispute(offerId, disputeData = {}, confirmationCallback) {
    const ipfsHash = await this.ipfsDataStore.save(DISPUTE_DATA_TYPE, disputeData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.initiateDispute(offerId, ipfsBytes, confirmationCallback)
  }

  /**
   * Resolve a dispute by executing a ruling - either refund to buyer or payment to seller
   * @param {string} listingId - Listing ID
   * @param {string} offerId - Offer ID
   * @param {object} resolutionData - Data describing this resolution - stored in IPFS
   * @param {number} ruling - 0: Seller, 1: Buyer, 2: Com + Seller, 3: Com + Buyer
   * @param {number} refund - Amount (in wei) to be refunded to buyer
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async resolveDispute(
    offerId,
    resolutionData = {},
    ruling,
    refund,
    confirmationCallback
  ) {
    const ipfsHash = await this.ipfsDataStore.save(RESOLUTION_DATA_TYPE, resolutionData)
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.resolveDispute(
      offerId,
      ipfsBytes,
      ruling,
      refund,
      confirmationCallback
    )
  }

  /**
   * Adds data to either a listing or an offer.
   * Use cases:
   *  - offer: allows seller to add review data.
   *  - listing: for future use.
   * @param listingId
   * @param offerId
   * @param {object} data - In case of an offer, Seller review data in schema 1.0 format.
   * @param {function(confirmationCount, transactionReceipt)} confirmationCallback
   * @return {Promise<{timestamp, ...transactionReceipt}>}
   */
  async addData(listingId, offerId, data, confirmationCallback) {
    let ipfsHash
    if (offerId) {
      // We expect this to be review data from the seller.
      ipfsHash = await this.ipfsDataStore.save(REVIEW_DATA_TYPE, data)
    } else if (listingId) {
      throw new Error('Code path not implemented yet')
    }
    const ipfsBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)

    return await this.resolver.addData(
      listingId,
      offerId,
      ipfsBytes,
      confirmationCallback
    )
  }

  // Convenience methods

  /**
   * Pulls all the Buyer side reviews for a listing.
   * @param {string} listingId
   * @return {Promise<Array[Review]>}
   */
  async getListingReviews(listingId) {
    const reviewEvents = await this.resolver.getListingReviews(listingId)

    const reviews = []
    for (const event of reviewEvents) {
      // Load review data from IPFS.
      const ipfsHash = this.contractService.getIpfsHashFromBytes32(
        event.returnValues.ipfsHash
      )
      const ipfsReview = await this.ipfsDataStore.load(REVIEW_DATA_TYPE, ipfsHash)

      // Create a Review object based on IPFS and event data.
      const review = new Review(listingId, event.offerId, event, ipfsReview)
      reviews.push(review)
    }
    return reviews
  }

  /**
   * Fetch all notifications for the current user.
   *
   * Notes:
   *  a) Only the latest notification for a given offer is returned (vs the whole history).
   *  Imagine the following scenario:
   *    - Buyer creates offer.
   *    - getNotification called for seller -> offer created notification returned
   *    - Seller accepts offer then buyer finalizes it
   *    - getNotification called for seller -> only the finalized notification is returned.
   *  b) The current implementation is very inefficient, especially for sellers with large
   * number of listings/offers. When this becomes an issue, the logic could be optimized.
   * For example a possibility would be to add a "fromBlockNumber" argument to allow to fetch
   * incrementally new notifications. Alternatively, support for a "performance mode" that
   * fetches data from the back-end could be added.
   *
   * @return {Promise<Array[Notification]>}
   */
  async getNotifications() {
    // Fetch all notifications.
    const party = await this.contractService.currentAccount()

    if (!party) {
      return []
    }

    const notifications = await this.resolver.getNotifications(party)

    // Decorate each notification with listing and offer data.
    const withResources = await Promise.all(notifications.map(async (notification) => {
      try {
        if (notification.resources.listingId) {
          notification.resources.listing = await this.getListing(
            generateListingId({
              version: notification.version,
              network: notification.network,
              listingIndex: notification.resources.listingId
            })
          )
        }
        if (notification.resources.offerId) {
          notification.resources.offer = await this.getOffer(
            generateOfferId({
              version: notification.version,
              network: notification.network,
              listingIndex: notification.resources.listingId,
              offerIndex: notification.resources.offerId
            })
          )
        }
        return new Notification(notification)
      } catch(e) {
        // Guard against invalid listing/offer that might be created for example
        // by exploiting a validation loophole in origin-js listing/offer code
        // or by writing directly to the blockchain.
          return null
        }
    }))
    return withResources.filter(notification => notification !== null)
  }

  /**
   * Update the status of a notification in the local store.
   * @param {string} id - Unique notification ID
   * @param {string} status - 'read' or 'unread'
   * @return {Promise<void>}
   */
  async setNotification({ id, status }) {
    if (!notificationStatuses.includes(status)) {
      throw new Error(`invalid notification status: ${status}`)
    }
    const notifications = this.store.get(storeKeys.notificationStatuses)
    notifications[id] = status
    this.store.set(storeKeys.notificationStatuses, notifications)
  }

  /**
   * Returns units available for a unit listing, taking into account pending
   * offers.
   * @param {Listing} listing - listing JSON object
   * @param {List(Offer)} offers - list of Offer JSON objects for the listing
   * @throws {Error}
   * @return {number} - Units available
   */
  unitsAvailable(listing, offers) {
    if (listing.type !== 'unit') {
      throw new Error('unitsAvailable only works for unit listings')
    }

    return listing.unitsTotal - this.unitsSold(listing, offers)
  }

  /**
   * Returns units sold for a unit listing, taking into account pending offers.
   * @param {Listing} listing - listing JSON object
   * @param {List(Offer)} offers - list of valid Offer JSON objects for the listing
   * @return {number} - Units sold
   */
  unitsSold(listing, offers) {
    if (listing.type !== 'unit') {
      throw new Error('unitsAvailable only works for unit listings')
    }
    return Object.keys(offers).reduce((sold, offerId) => {
      if (
        // Before offers are submitted to the blockchain, they have no status.
        //
        // TODO: We might need some explicit handling of arbitration rulings.
        offers[offerId].status &&
        offers[offerId].status !== 'withdrawn'
      ) {
        return sold + offers[offerId].unitsPurchased
      }
      return sold
    }, 0)
  }

  async getTokenAddress() {
    return await this.resolver.getTokenAddress()
  }
}
