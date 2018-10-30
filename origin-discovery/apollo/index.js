const { ApolloServer, gql } = require('apollo-server')
const GraphQLJSON = require('graphql-type-json')

const db = require('../models')
const search = require('../lib/search.js')

/*
 * Implementation of the Origin GraphQL server.
  * Uses the Apollo framework: https://www.apollographql.com/server
 *
 */

// Type definitions define the "shape" of the data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  scalar JSON

  ######################
  #
  # Query output schema.
  #
  ######################

  # When querying a set of items, the output is a page.
  interface OutputPage {
    offset: Int!
    numberOfItems: Int!
    totalNumberOfItems: Int!
  }

  type Price {
    currency: String!
    amount: String!
  }

  type User {
    walletAddress: ID!   # Ethereum wallet address
    identityAddress: ID  # ERC 725 identity address.
    firstName: String
    lastName: String
    description: String
    # listings(page: Page, order: ListingOrder, filter: ListingFilter): ListingPage
    offers: OfferConnection
    # reviews(page: Page, order: ReviewOrder, filter: ReviewFilter): ReviewPage
  }

  enum OfferStatus {
    created
    accepted
    finalized
    buyerReviewed
    disputed
  }

  type Offer {
    id: ID!
    ipfsHash: ID!
    buyer: User!
    seller: User!
    status: OfferStatus!
    affiliate: ID,
    price: Price! 
    listing: Listing!
  }

  type OfferConnection {
    nodes: [Offer]!
  }

  # type Review {
  #   ipfsHash: ID!
  #   reviewer: User!
  #   text: String!
  #   rating: Int!
  # }

  #type ReviewPage implements OutputPage {
  #  offset: Int!
  #  numberOfItems: Int!
  #  totalNumberOfItems: Int!
  # reviews: [Review]
  #}

  # TODO: Add a status indicating if Listing is sold out.
  type Listing {
    id: ID!
    data: JSON
    ipfsHash: ID!
    seller: User!
    title: String!
    description: String
    category: String!
    subCategory: String!
    price: Price!
    offers: OfferConnection
    # reviews(page: Page, order: ReviewOrder, filter: ReviewFilter): ReviewPage
  }

  type Stats {
    maxPrice: Float
    minPrice: Float
  }

  type ListingPage implements OutputPage {
    offset: Int!
    numberOfItems: Int!
    totalNumberOfItems: Int!
    nodes: [Listing]
    stats: Stats
  }

  ######################
  #
  # Query input schema.
  #
  # Note: Some input types have a "in" prefix because GraphQL does not allow to
  # use thw same name for both an input and output type.
  #
  ######################
  enum OrderDirection {
    ASC   # Default if no direction specified.
    DESC
  }

  input Page {
    offset: Int!  # Page number.
    numberOfItems: Int! # Number of items per page.
  }

  input inPrice {
    currency: String!
    amount: String!
  }

  #
  # ORDER
  #
  enum OfferOrderField {
    CREATION_DATE
    STATUS
  }

  enum ReviewOrderField {
    CREATION_DATE
    RATING
  }

  enum ListingOrderField {
    RELEVANCE  # Default if no order field specified in the query.
    PRICE
    CREATION_DATE
    SELLER_RATING
  }

  input OfferOrder {
    field: OfferOrderField!
    order: OrderDirection
  }

  input ReviewOrder {
    field: ReviewOrderField!
    order: OrderDirection
  }

  input ListingOrder {
    field: ListingOrderField!
    order: OrderDirection
  }

  #
  # FILTERS
  #

  input OfferFilter {
    status: OfferStatus
  }

  input ReviewFilter {
    rating: Int
  }

  enum ValueType {
    STRING
    FLOAT
    DATE
    ARRAY_STRING
  }

  enum FilterOperator {
    EQUALS
    CONTAINS #for array values where at least one must match E.g. list of categories 
    GREATER
    GREATER_OR_EQUAL
    LESSER
    LESSER_OR_EQUAL
  }

  # A generic listing filter
  input ListingFilter {
    name: String!
    value: String!
    valueType: ValueType!
    operator: FilterOperator!
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    listings(searchQuery: String, filters: [ListingFilter!], page: Page!): ListingPage,
    listing(id: ID!): Listing,

    offers(buyerAddress: ID, listingId: ID): OfferConnection,
    offer(id: ID!): Offer,
    
    user(walletAddress: ID!): User
  }
`

// Maximum number of items returned in a page.
// If caller requests more, page size will be trimmed to MaxResultsPerPage.
const MaxResultsPerPage = 100

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    async listings(root, args, context, info) {
      // TODO: handle pagination (including enforcing MaxResultsPerPage), filters, order.
      // Get listing Ids from Elastic.
      let {listings, maxPrice, minPrice, totalNumberOfListings} = await search.Listing
        .search(args.searchQuery, args.filters, args.page.numberOfItems, args.page.offset)

      // Decorate each listing with a data field containing the cached output
      // of the call to marketplace.getListing.
      const listingIds = listings.map(listing => listing.id)
      const rows = db.Listing.findAll({
        where: {
          listingId: {
            [Op.in]: [listingIds]
          }
        }
      })
      let dataDict = {}
      rows.forEach(row => {
        dataDict[row.id] = row.data
      })
      listings.forEach(listing => {
        listing.data = dataDict[listing.id]
      })

      return {
        offset: args.page.offset,
        numberOfItems: listings.length,
        totalNumberOfItems: totalNumberOfListings,
        stats: {
          maxPrice,
          minPrice
        },
        nodes: listings
      }
    },
    async listing(root, args, context, info) {
      return search.Listing.get(args.id)
    },
    async offers(root, args, context, info){
      const opts = {}
      opts.buyerAddress = args.buyerAddress
      opts.listingId = args.listingId
      const offers = search.Offer.search(opts)
      return {nodes: offers}
    },
    async offer(root, args, context, info){
      return search.Offer.get(args.id)
    },
    user(root, args, context, info) {
      return search.User.get(args.walletAddress)
    }
  },
  Listing: {
    seller(listing, args, context, info) {
      return relatedUserResolver(listing.seller, info)
    },
    price(listing) {
      if (listing.priceCurrency === undefined || listing.priceAmount === undefined) {
        return undefined
      }
      return {currency: listing.priceCurrency, amount: listing.priceAmount}
    },
    offers(listing, args) {
      const offers = search.Offer.search({listingId:listing.id})
      return {nodes: offers}
    },
    // reviews(listing, args) {
    //   // TODO: handle pagination (including enforcing MaxResultsPerPage), filters, order.
    //   return {
    //     pageNumber: 1,
    //     numberOfItems: 1,
    //     totalNumberOfItems: 1,
    //     reviews: [{
    //       ipfsHash: 'IPFS_H', reviewer: {walletAddress: 'R_WADDR'},
    //       text: 'Great product. Great seller.', rating: 5,
    //     }]
    //   }
    // },
  },
  Offer: {
    seller(offer, args, context, info){
      return relatedUserResolver(offer.seller, info)
    },
    buyer(offer, args, context, info){
      return relatedUserResolver(offer.buyer, info)
    },
    price(offer) {
      return {currency: 'ETH', amount: offer.priceEth}
    },
    listing(offer, args, context, info) {
      const requestedSubFields = info.fieldNodes[0].selectionSet.selections 
      const isIdOnly = requestedSubFields.filter(x=>x.name.value !== "id").length === 0
      if(isIdOnly){
        return {id: offer.listingId}
      } else {
        return search.Listing.get(offer.listingId)
      }
    }
  },
  User: {
    offers(user, args) {
      const offers = search.Offer.search({buyer: user.walletAddress})
      return {nodes: offers}
    },
  }
  //   identityAddress(user) {
  //     // TODO fetch identify based on user.walletAddress
  //     return `I_${user.walletAddress}`
  //   },
  //   listings(user, args) {
  //     // TODO: load listings for the user, handle pagination, filters, order.
  //     return {}
  //   },
  //   offers(user, args) {
  //     // TODO: load offers for the user, handle pagination, filters, order.
  //     return {}
  //   },
  //   reviews(user, args) {
  //     // TODO: load reviews for the user, handle pagination, filters, order.
  //     return {}
  //   }
  // },
}

/**
 * Gets information on a related user.
 * Includes short-circut code to skip the user look up
 * if the walletAddress is the only field required.
 * @param {string} walletAddress 
 * @param {object} info 
 */
function relatedUserResolver(walletAddress, info){
  const requestedFields = info.fieldNodes[0].selectionSet.selections
  const isIdOnly = requestedFields.filter(x => x.name.value !== 'walletAddress')
    .length === 0
  if (isIdOnly) {
    return { walletAddress: walletAddress }
  } else {
    return search.User.get(walletAddress)
  }
}

// Start ApolloServer by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web-server.
server.listen().then(({ url }) => {
  console.log(`Apollo server ready at ${url}`)
})
