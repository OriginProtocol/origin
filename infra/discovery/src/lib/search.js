const elasticsearch = require('elasticsearch')
const scoring = require('../lib/scoring')
const { getAsync } = require('../lib/redis')

/*
  Module to interface with ElasticSearch.
 */

const client = new elasticsearch.Client({
  hosts: [process.env.ELASTICSEARCH_HOST || 'elasticsearch:9200']
})

// Elasticsearch index and type names for our data
// Elasticsearch is depreciating storing different types in the same index.
// (and forbids it unless you enable a special flag)
const LISTINGS_INDEX = 'listings'
const LISTINGS_TYPE = 'listing'

const getExchangeRates = async currencies => {
  try {
    const exchangeRates = {}
    const promises = currencies.map(currency => {
      return new Promise(async (resolve, reject) => {
        try {
          const rate = await getAsync(`${currency}-USD_price`)
          resolve({ market: currency, rate: rate })
        } catch (e) {
          reject(e)
        }
      })
    })
    const result = await Promise.all(promises)
    result.forEach(r => {
      exchangeRates[r.market] = r.rate
    })
    return exchangeRates
  } catch (e) {
    return e
  }
}

class Cluster {
  /**
   * Gets cluster health and prints it.
   */
  static async health() {
    const resp = await client.cluster.health({})
    console.log('-- Search cluster health --\n', resp)
  }
}

class Listing {
  /**
   * Counts number of listings indexed.
   * @returns The number of listings indexed.
   */
  static async count() {
    const resp = await client.count({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE
    })
    console.log(`Counted ${resp.count} listings in the search index.`)
    return resp.count
  }

  /**
   * Indexes a listing.
   * @param {string} listingId - The unique ID of the listing.
   * @param {string} buyerAddress - ETH address of the buyer.
   * @param {string} ipfsHash - 32 bytes IPFS hash, in hex (not base58 encoded).
   * @param {object} listing - JSON listing data.
   * @throws Throws an error if indexing operation failed.
   * @returns The listingId indexed.
   */
  static async index(listingId, buyerAddress, ipfsHash, listing) {
    // Create a copy of the listing object
    const listingToIndex = JSON.parse(JSON.stringify(listing))

    // commissionPerUnit is critical for calculating scoring.
    // Log a warning if that field is not populated - it is likely a bug.
    if (!listingToIndex.commissionPerUnit) {
      console.log(
        `WARNING: missing field commissionPerUnit on listing ${listingId}`
      )
    }

    // jCal fields are very dynamic and cause issues with ElasticSearch dynamic mappings.
    // Disabling indexing of those fields for now until we need to support search by availability.
    delete listingToIndex.ipfs
    delete listingToIndex.availability
    if (listingToIndex.offers) {
      listingToIndex.offers.forEach(offer => {
        delete offer.ipfs
        delete offer.timeSlots
      })
    }

    // Precompute score for listing
    const { scoreMultiplier } = await scoring.scoreListing(listingToIndex)
    listingToIndex.scoreMultiplier = scoreMultiplier

    await client.index({
      index: LISTINGS_INDEX,
      id: listingId,
      type: LISTINGS_TYPE,
      body: listingToIndex
    })
    return listingId
  }

  /**
   * Gets a listing
   * @param {string} id
   */
  static async get(id) {
    return client.get({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE,
      id: id
    })
  }

  /**
   * Updates the score tags and score for a listing.
   * Uses a small painless script that runs on the server to update the values.
   * This reduces the race condition window when two systems could be updating
   * the same listing at the same time. It also scales better.
   *
   * @param {string} id
   * @param {string[]} scoreTags
   */
  static async updateScoreTags(id, scoreTags) {
    const result = await client.get({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE,
      id: id
    })
    const listing = result._source
    listing.scoreTags = scoreTags
    const { scoreMultiplier } = await scoring.scoreListing(result._source)
    listing.scoreMultiplier = scoreMultiplier
    const body = {
      script: {
        lang: 'painless',
        source: `
          ctx._source.scoreTags = params.scoreTags;
          ctx._source.scoreMultiplier = params.scoreMultiplier;
        `,
        params: {
          scoreTags: scoreTags,
          scoreMultiplier: scoreMultiplier
        }
      }
    }
    client.update({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE,
      id: id,
      body
    })
    return listing
  }

  /**
   * Searches for listings.
   * @param {string} query - The search query.
   * @param {object} sortOptions - {target: String, direction: String}
   * @param {array} filters - Array of filter objects
   * @param {integer} numberOfItems - number of items to display per page
   * @param {integer} offset - what page to return results from
   * @param {boolean} idsOnly - only returns listing Ids vs listing object.
   * @throws Throws an error if the search operation failed.
   * @returns A list of listings (can be empty).
   */
  static async search(
    query,
    sortOptions,
    filters,
    numberOfItems,
    offset,
    idsOnly
  ) {
    const currencies = ['ETH', 'DAI', 'JPY', 'EUR', 'KRW', 'GBP']
    const exchangeRates = await getExchangeRates(currencies)

    if (filters === undefined) {
      filters = []
    }
    const esQuery = {
      bool: {
        must: [],
        must_not: [
          {
            match: {
              status: 'withdrawn'
            }
          }
        ],
        should: [],
        filter: []
      }
    }

    // Never return any invalid listings
    esQuery.bool.must_not.push({
      term: { valid: false }
    })

    // Never return any listings moderated as hidden
    esQuery.bool.must_not.push({
      terms: {
        scoreTags: ['Hide', 'Delete']
      }
    })

    if (query !== undefined && query !== '') {
      // all_text is a field where all searchable fields get copied to
      esQuery.bool.must.push({
        match: {
          all_text: {
            query,
            fuzziness: 'AUTO',
            minimum_should_match: '-20%' // most query tokens must be in the listing
          }
        }
      })
      // give extra score if the search query matches in the title
      esQuery.bool.should.push({
        match: {
          title: {
            query: query,
            boost: 2,
            fuzziness: 'AUTO'
          }
        }
      })
      // give extra score for search words being in proximity to each other
      esQuery.bool.should.push({
        match_phrase: {
          all_text: {
            query: query,
            slop: 50
          }
        }
      })
    } else {
      esQuery.bool.must.push({ match_all: {} })
    }

    /* interestingly JSON.stringify performs pretty well:
     * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
     */
    const esAggregationQuery = JSON.parse(JSON.stringify(esQuery))

    filters.forEach(filter => {
      let innerFilter = {}

      if (filter.operator === 'GREATER_OR_EQUAL') {
        innerFilter = {
          range: {
            [filter.name]: {
              gte: filter.value
            }
          }
        }
      } else if (filter.operator === 'LESSER_OR_EQUAL') {
        innerFilter = {
          range: {
            [filter.name]: {
              lte: filter.value
            }
          }
        }
      } else if (
        filter.operator === 'CONTAINS' &&
        filter.valueType === 'ARRAY_STRING'
      ) {
        innerFilter = {
          bool: {
            should: filter.value.split(',').map(singleValue => {
              return { term: { [filter.name]: singleValue } }
            })
          }
        }
      } else if (filter.operator === 'EQUALS') {
        innerFilter = { term: { [filter.name]: filter.value } }
      }

      esQuery.bool.filter.push(innerFilter)
    })

    // All non-time based scoring is staticly computed ahead of time and
    // index in a listing's `scoreMultiplier` field
    const scoreQuery = {
      function_score: {
        query: esQuery,

        script_score: {
          script: {
            params: {
              // Strongly reccomended to pass date in as a paramter since:
              // - All nodes in an elastic search cluster will be using the same value
              // - Script itself stays the same, and never needs to be recompiled
              now: new Date().getTime()
            },
            source: `double score = _score;

            if(doc.containsKey('scoreMultiplier') && doc['scoreMultiplier'] != null){
              score *= doc['scoreMultiplier'].value
            }

            // Temporary boost for recently created listings.
            // linear reduction in boost off during boost period.
            if (doc['createdEvent.timestamp'] != null) {
              double recentBoostAmount = 0.5;
              long boostPeriod = 18 * 24 * 60 * 60;
              long age = params.now - doc['createdEvent.timestamp'].value;
              if (age > 0 && age < boostPeriod) {
                score *= 1.0 + ((double)age / (double)boostPeriod) * recentBoostAmount;
              }
            }
            
            return score;
            `
          }
        }
      }
    }

    // FIXME: This is temporary while switching DApp to use
    // a paginated interface to fetch listings.
    if (numberOfItems === -1) {
      numberOfItems = 1000
    }

    // sorting
    // possibly needs nested mapping + field update to below for price.amount
    const resolveSort = () => {
      console.log('resolveSort - sortOptions', sortOptions)
      console.log('resolveSort - exchangeRates', exchangeRates)
      const { target, direction } = sortOptions
      if (target && direction) {
        if (target === 'price.amount') {
          return {
            sort: {
              _script: {
                type: 'number',
                script: {
                  lang: 'painless',
                  source: `parseFloat(rates[price.currency.id]) * parseFloat([${target}])`,
                  params: {
                    rates: exchangeRates
                  }
                },
                order: direction
              }
            }
          }
        } else if (target === 'createdDate') {
          return {
            sort: [
              {
                [target]: {
                  order: direction
                }
              }
            ]
          }
        }
      } else {
        return {}
      }
    }

    const searchRequest = client.search({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE,
      body: {
        from: offset,
        size: numberOfItems,
        query: scoreQuery,
        sort: resolveSort(),
        _source: [
          'title',
          'description',
          'price',
          'commissionPerUnit',
          'scoreMultiplier',
          'scoreTags'
        ]
      }
    })

    const aggregationRequest = client.search({
      index: LISTINGS_INDEX,
      type: LISTINGS_TYPE,
      body: {
        query: esAggregationQuery,
        _source: ['_id'],
        aggs: {
          max_price: { max: { field: 'price.amount' } },
          min_price: { min: { field: 'price.amount' } }
        }
      }
    })

    const [searchResponse, aggregationResponse] = await Promise.all([
      searchRequest,
      aggregationRequest
    ])
    const listings = []
    searchResponse.hits.hits.forEach(hit => {
      listings.push({
        id: hit._id,
        title: hit._source.title,
        category: hit._source.category,
        subCategory: hit._source.subCategory,
        description: hit._source.description,
        priceAmount: (hit._source.price || {}).amount,
        priceCurrency: (hit._source.price || {}).currency,
        // added redundant fields below to match schema, maybe that
        // should change to the above two fields
        price: {
          amount: (hit._source.price || {}).amount,
          currency: (hit._source.price || {}).currency.id
        }
      })
    })

    const maxPrice = aggregationResponse.aggregations.max_price.value
    const minPrice = aggregationResponse.aggregations.min_price.value
    const stats = {
      maxPrice: maxPrice || 0,
      minPrice: minPrice || 0,
      totalNumberOfListings: searchResponse.hits.total
    }

    const listingIds = listings.map(listing => listing.id)
    if (idsOnly) {
      return { listingIds, stats }
    } else {
      return { listingIds, listings, stats }
    }
  }
}

module.exports = {
  Cluster,
  Listing
}
