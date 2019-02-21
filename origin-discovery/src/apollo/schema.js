const { gql } = require('apollo-server-express')

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
  type BlockInfo {
    blockNumber: Int!
    logIndex: Int!
  }

  #
  # USER
  #
  type User {
    walletAddress: ID!   # Ethereum wallet address
    identityAddress: ID  # ERC 725 identity address.
    firstName: String
    lastName: String
    description: String
    listings: ListingConnection # Listings created by the user.
    offers: OfferConnection     # Offers made by the user.
    # reviews(page: Page, order: ReviewOrder, filter: ReviewFilter): ReviewPage
  }

  #
  # OFFER
  #
  type Offer {
    id: ID!
    blockInfo: BlockInfo!
    ipfsHash: ID!
    data: JSON!
    buyer: User!
    seller: User!
    status: String!
    affiliate: ID,
    unitsPurchased: Int,
    totalPrice: Price!
    commission: Price!
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
  #  offset: Int!
  #  numberOfItems: Int!
  #  totalNumberOfItems: Int!
  #  nodes: [Review]
  #}

  #
  # LISTING
  #
  # TODO: Add a status indicating if Listing is sold out.
  enum DisplayType {
    normal
    featured
    hidden
  }
  type Listing {
    id: ID!
    blockInfo: BlockInfo!
    ipfsHash: ID!
    data: JSON!
    seller: User!
    title: String!
    description: String
    category: String!
    subCategory: String!
    price: Price!
    commission: Price!
    commissionPerUnit: Price
    offers(page: Page): OfferConnection
    display: DisplayType!
    marketplacePublisher: String
    createDate: String
    updateVersion: Int
    # reviews(page: Page, order: ReviewOrder, filter: ReviewFilter): ReviewPage
  }

  #
  # This should come from origin-js/models/listing
  # It's all the chainlisting inputs 
  #
  input ListingInput {
    ipfsHash: ID!
    deposit: String
    depositManager: ID
    seller: ID!
    status: String
  }

  type Stats {
    maxPrice: Float
    minPrice: Float
  }
  type ListingConnection {
    nodes: [Listing]!
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
  # use the same name for both an input and output type.
  #
  ######################
  enum OrderDirection {
    ASC   # Default if no direction specified.
    DESC
  }
  input Page {
    offset: Int!
    numberOfItems: Int!
  }
  input inPrice {
    currency: String!
    amount: String!
  }
  input inBlockInfo {
    blockNumber: Int!
    logIndex: Int!
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
    status: String
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

  #
  # The "Query" type is the root of all GraphQL queries.
  #
  type Query {
    listings(searchQuery: String, filters: [ListingFilter!], page: Page!): ListingPage,
    listing(id: ID!, blockInfo: inBlockInfo): Listing,

    offers(buyerAddress: ID, sellerAddress: ID, listingId: ID): OfferConnection,
    offer(id: ID!): Offer,

    user(walletAddress: ID!): User,

    info: JSON!
  }

  #
  # The "Mutation" type is the root of all GraphQL mutations
  #
  type Mutation {
    injectListing(listingInput: ListingInput, signature: String!): Listing
    updateListing(id: ID!, listingInput: ListingInput, signature: String!): Listing
  }
`

module.exports = typeDefs
