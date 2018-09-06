const { ApolloServer, gql } = require('apollo-server')

var search = require('../lib/search.js')
var db = require('../lib/db.js')

/*
 * Implementation of the Origin GraphQL server.
  * Uses the Apollo framework: https://www.apollographql.com/server
 *
 */

// Type definitions define the "shape" of the data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  ######################
  #
  # Query output schema.
  #
  ######################

  # When querying a set of items, the output is a page.
  #interface OutputPage {
    # num: Int!      # Current page number
    # size: Int!     # Size of pages.
    # total: Int!    # Total number of pages available.
  #}

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

  # type ReviewPage implements OutputPage {
  #   num: Int!
  #   size: Int!
  #   total: Int!
  #   reviews: [Review]
  # }

  # TODO: Add a status indicating if Listing is sold out.
  type Listing {
    id: ID!
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

  type ListingPage { # implements OutputPage
    # num: Int!
    # size: Int!
    # total: Int!
    nodes: [Listing]
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
    num: Int!  # Page number.
    size: Int! # Number of items per page.
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

  # TODO:
  #  - Filtering definition needs more thinking. This is not flexible at all...
  #  - Add location based filtering.
  #  - Add fractional usage (e.g. availability) filtering.
  input ListingFilter {
    priceMin: inPrice
    priceMax: inPrice
    category: String
    subCategory: String
    locale: String
    sellerAddress: String
    buyerAddress: String
  }

  # The "Query" type is the root of all GraphQL queries.
  type Query {
    listings(searchQuery: String): ListingPage, # (page: Page, order: ListingOrder, filter: ListingFilter)
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
  Query: {
    async listings(root, args, context, info) {
      // TODO: handle pagination (including enforcing MaxResultsPerPage), filters, order.
      let listings = []
      listings = await search.Listing.search(args.searchQuery)
      return {
        num: 1,
        size: listings.length,
        total: 1,
        nodes: listings,
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
    seller(listing) {
      return { walletAddress: 'S_WADDR' }
    },
    title(listing) {
      return listing.name
    },
    category(listing) {
      return listing.type
    },
    subCategory(listing) {
      return listing.category
    },
    price(listing) {
      return {currency: 'ETH', amount: listing.priceEth}
    },
    offers(listing, args) {
      const offers = search.Offer.search({listingId:listing.id})
      return {nodes: offers}
    },
    // reviews(listing, args) {
    //   // TODO: handle pagination (including enforcing MaxResultsPerPage), filters, order.
    //   return {
    //     num: 1,
    //     size: 1,
    //     total: 1,
    //     reviews: [{
    //       ipfsHash: 'IPFS_H', reviewer: {walletAddress: 'R_WADDR'},
    //       text: 'Great product. Great seller.', rating: 5,
    //     }]
    //   }
    // },
  },
  Offer: {
    seller(offer){
      return {walletAddress: offer.seller}
    },
    buyer(offer){
      return {walletAddress: offer.buyer}
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

// Start ApolloServer by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web-server.
server.listen().then(({ url }) => {
  console.log(`Apollo server ready at ${url}`)
})
