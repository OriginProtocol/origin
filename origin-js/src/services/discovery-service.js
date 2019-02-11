import { Listing } from '../models/listing'
import { Offer } from '../models/offer'
// Max number of results to request from back-end.
const MAX_NUM_RESULTS = 100

class DiscoveryService {
  constructor({ discoveryServerUrl, fetch }) {
    this.discoveryServerUrl = discoveryServerUrl
    this.fetch = fetch
  }

  _toListingModel(listingNode) {
    const data = listingNode.data
    data.display = listingNode.display
    return Listing.initFromDiscovery(data)
  }

  _toOfferModel(offerNode) {
    return Offer.initFromDiscovery(offerNode)
  }

  /**
   * Helper method. Calls discovery server and returns response.
   * @param graphQlQuery
   * @return {Promise<*>}
   * @private
   */
  async _query(graphQlQuery, variables) {
    const resp = await this.fetch(
      this.discoveryServerUrl,
      {
        method: 'POST',
        body: JSON.stringify({
          query: graphQlQuery,
          variables: variables
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      },
      function(error) {
        if (error !== undefined)
          throw new Error(
            `An error occurred when reaching discovery server: ${error}`
          )
      }
    )

    if (resp.status !== 200) {
      //TODO: also report error message here
      throw new Error(
        `Discovery server returned unexpected status code ${
          resp.status
        } with error `
      )
    }

    const jsonResp = await resp.json()
    // Throw an exception if the GraphQL response includes any error.
    if (jsonResp.errors && jsonResp.errors.length > 0) {
      console.log('Discovery server errors:', jsonResp.errors)
      throw new Error(
        `Discovery server internal error: ${jsonResp.errors[0].message}`)
    }
    return jsonResp
  }

  /**
   * Issues a search request against the discovery server.
   * @param searchQuery {string} General search query
   * @param numberOfItems {number} Max number of items to return.
   * @param offset {number} Pagination offset.
   * @param filters {object} Object with properties: name, value, valueType, operator
   * @return {Promise<list(Object)>}
   */
  async search({ searchQuery, numberOfItems, offset, filters = [] }) {
    // Offset should be bigger than 0.
    offset = Math.max(offset, 0)
    // clamp numberOfItems between 1 and MAX_NUM_RESULTS
    numberOfItems = Math.min(Math.max(numberOfItems, 1), MAX_NUM_RESULTS)
    const query = `
    query($searchQuery: String, $filters: [ListingFilter!], $offset: Int!, $numberOfItems: Int!) {
      listings (
        searchQuery: $searchQuery
        filters: $filters
        page: {
          offset: $offset
          numberOfItems: $numberOfItems
        }
      ) {
        nodes {
          data
          display
        }
        offset
        numberOfItems
        totalNumberOfItems
        stats {
          maxPrice
          minPrice
        }
      }
    }`

    return this._query(query, {
      searchQuery: searchQuery,
      filters: filters,
      offset: offset,
      numberOfItems: numberOfItems
    })
  }

  /**
   * Queries discovery server for all listings, with support for pagination.
   * @param opts: {idsOnly: boolean, listingsFor: sellerAddress, purchasesFor: buyerAddress, withBlockInfo: boolean}
   *  - idsOnly(boolean): Returns only ids rather than the full Listing object.
   *  - listingsFor(address): Returns latest version of all listings created by a seller.
   *  - purchasesFor(address): Returns all listings a buyer made an offer on.
   *      Selects the version of the listing at the time the offer was created.
   *  - numberOfItems: Number of listings to return. Any value between 1 and MAX_NUM_RESULTS
   *      is valid. Temporarily, while switching DApp to fetch data from back-end, we use -1 as
   *      a special value for requesting all listings. This will get deprecated in the future.
   * @return {Array<Listing>}
   */
  async getListings(opts) {
    if (opts.listingsFor && opts.purchasesFor) {
      throw new Error('listingsFor and purchasesFor options are incompatible')
    }

    const filters = opts.filters || []

    // Offset should be bigger than 0.
    const offset = Math.max(opts.offset || 0, 0)

    // Keep numberOfItems between 1 and MAX_NUM_RESULTS, with -1 as a special value also allowed.
    const numberOfItems = opts.numberOfItems
      ? Math.min(Math.max(opts.numberOfItems, 1), MAX_NUM_RESULTS)
      : -1

    let query, listings
    if (opts.listingsFor) {
      // Query for all listings created by the specified seller address.
      query = `query($listingsFor: ID!) {
        user(walletAddress: $listingsFor) {
          listings {
            nodes {
              data
              display
            }
          }
        }
      }`
      const resp = await this._query(query, {
        filters: filters,
        listingsFor: opts.listingsFor
      })
      listings = resp.data.user.listings.nodes.map(listing => this._toListingModel(listing))
    } else if (opts.purchasesFor) {
      // Query for all listings the specified buyer address made an offer on.
      query = `query($purchasesFor: ID!) {
        user(walletAddress: $purchasesFor) {
          offers {
            nodes {
              listing {
                data
                display
              }
            }
          }
        }
      }`
      const resp = await this._query(query, { purchasesFor: opts.purchasesFor })
      listings = resp.data.user.offers.nodes.map(offer => this._toListingModel(offer.listing))
    } else {
      // General query against all listings. Used for example on Browse and search pages.
      query = `query($filters: [ListingFilter!], $offset: Int!, $numberOfItems: Int!) {
        listings (
          filters: $filters
          page: {
            offset: $offset,
            numberOfItems: $numberOfItems
          }
        ) {
          nodes {
            data
            display
          }
        }
      }`
      const resp = await this._query(query, {
        filters: filters,
        offset: offset,
        numberOfItems: numberOfItems
      })
      listings = resp.data.listings.nodes.map(listing => this._toListingModel(listing))
    }

    return opts.idsOnly ? listings.map(listing => listing.id) : listings
  }

  /**
   * Queries discovery server for a listing based on its id.
   * @param listingId
   * @param {{blockNumber: integer, logIndex: integer}} blockInfo - Optional arg to use for
   *   fetching a version of the listing with blockNumber and logIndex <= specified values.
   * @return {Listing||null}
   */
  async getListing(listingId, blockInfo = null) {
    let listingArgs = `id: "${listingId}"`
    if (blockInfo) {
      listingArgs += `, blockInfo: { ` +
        `blockNumber: ${blockInfo.blockNumber}, ` +
        `logIndex: ${blockInfo.logIndex} }`
    }
    const query = `{
      listing(${listingArgs}) {
        data
        display
      }
    }`
    const resp = await this._query(query)

    // Throw an error if no listing found with this id.
    if (!resp.data) {
      throw new Error(`No listing found with id: ${listingId} blockInfo: ${blockInfo}`)
    }

    return this._toListingModel(resp.data.listing)
  }

  /**
   * Queries discovery server for offers
   * Options:
   *  - idsOnly(boolean): returns only ids rather than the full Offer object.
   *  - for(string): returns offers of a specific defined by address
   * @param listingId {string}: listing id of a listing to which offer has been made to 
   * @param opts: { idsOnly, for }
   * @return {Array<Offer>}
   */
  async getOffers(listingId, opts) {
    const resp = await this._query(`{
      offers(
        ${opts.for ? `buyerAddress: "${opts.for}"`: ''}
        listingId: "${listingId}"
      ) {
        nodes {
          id
          data
          buyer {
            walletAddress
          }
          seller {
            walletAddress
          }
          listing {
            id
          }
          status
        }
      }
    }`)

    const offers = resp.data.offers.nodes
      .map(offerNode => this._toOfferModel(offerNode))

    return opts.idsOnly ? offers.map(offer => offer.id) : offers
  }

  /**
   * Queries discovery server for an offer
   * @param offerId {string}: offer id to fetch
   * @return {Offer}
   */
  async getOffer(offerId) {
    const resp = await this._query(`{
      offer(
        id: "${offerId}"
      ) {
        id
        data
        buyer {
          walletAddress
        }
        seller {
          walletAddress
        }
        listing {
          id
        }
        status
      }
    }`)

    // Throw an error if no offer found with this id.
    if (!resp.data) {
      throw new Error(`No offer found with id ${offerId}`)
    }

    return this._toOfferModel(resp.data.offer)
  }

  /**
   * Mutates discovery server for an offer
   * @param listingInput {ListingInput}: listing data structure
   * @param signature {string}: signature against the data structure
   * @return {Offer}
   */

  async injectListing(ipfsHash, seller, deposit, depositManager, status, signature) {
    const resp = await this._query(`
      mutation($listing:ListingInput, $signature:String!) {
        injectListing(listingInput:$listing, signature:$signature){
          data
          display
        }
      }
    `, { listing: { ipfsHash, seller, deposit, depositManager, status },
        signature })

    // Throw an error if no offer found with this id.
    if (!resp.data) {
      throw new Error(`Cannot inject listing`)
    }

    return this._toListingModel(resp.data.injectListing)
  }

  async updateListing(listingId, ipfsHash, seller, deposit, depositManager, status, signature) {
    const resp = await this._query(`
      mutation($id:ID!, $listing:ListingInput, $signature:String!) {
        updateListing(id:$id, listingInput:$listing, signature:$signature){
          data
          display
        }
      }
    `, { id: listingId,
        listing: { ipfsHash, seller, deposit, depositManager, status },
        signature })

    // Throw an error if no offer found with this id.
    if (!resp.data) {
      throw new Error(`Cannot update listing`)
    }

    return this._toListingModel(resp.data.updateListing)
  }


}

export default DiscoveryService
