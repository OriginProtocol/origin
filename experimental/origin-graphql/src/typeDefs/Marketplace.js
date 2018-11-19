export default `
  extend type Query {
    marketplace: Marketplace
    marketplaces: [Marketplace]
  }

  extend type Mutation {
    deployMarketplace(token: String!, version: String, from: String, autoWhitelist: Boolean): Transaction

    createListing(
      deposit: String!
      depositManager: String
      from: String
      data: NewListingInput
      autoApprove: Boolean
    ): Transaction

    updateListing(
      listingID: ID!
      additionalDeposit: String
      from: String,
      data: NewListingInput
      autoApprove: Boolean
    ): Transaction

    withdrawListing(
      listingID: ID!
      target: String!
      reason: String
      from: String
    ): Transaction

    makeOffer(
      listingID: ID!
      finalizes: Int
      affiliate: String
      commission: String
      value: String
      currency: String
      arbitrator: String
      from: String
      withdraw: String
    ): Transaction

    executeRuling(
      listingID: ID!
      offerID: String!
      ruling: String!
      commission: String!
      message: String
      refund: String
      from: String
    ): Transaction

    addData(data: String!, listingID: ID, offerID: ID): Transaction
    addAffiliate(affiliate: String!, from: String): Transaction

    acceptOffer(listingID: ID!, offerID: ID!, from: String): Transaction
    withdrawOffer(listingID: ID!, offerID: ID!, from: String): Transaction
    finalizeOffer(listingID: ID!, offerID: ID!, from: String, rating: Int, review: String): Transaction
    disputeOffer(listingID: ID!, offerID: ID!, from: String): Transaction
    addFunds(listingID: ID!, offerID: ID!, amount: String!, from: String): Transaction
    updateRefund(listingID: ID!, offerID: ID!, amount: String!, from: String): Transaction
  }

  type Marketplace {
    id: ID
    address: String
    version: String
    token: Token
    owner: Account
    account: Account
    totalListings: Int

    listing(id: ID!): Listing
    listings(
      first: Int
      last: Int
      before: String
      after: String
      search: String
      sort: String
      hidden: Boolean
    ): ListingConnection!

    totalEvents: Int
    events(offset: Int, limit: Int): [Event]

    users(
      first: Int
      last: Int
      before: String
      after: String
      sort: String
    ): UserConnection!
    user(id: ID!): User
  }

  type UserConnection {
    nodes: [User]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type User {
    id: ID!
    account: Account!
    firstEvent: Event
    lastEvent: Event
    listings(first: Int, after: String): ListingConnection!
    offers(first: Int, after: String): OfferConnection!
  }

  type OfferConnection {
    nodes: [Offer]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ListingConnection {
    edges: [ListingEdge]
    nodes: [Listing]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ListingEdge {
    cursor: String!
    node: Listing
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }

  type Listing {
    id: ID!

    # On-chain:
    seller: Account
    deposit: String
    arbitrator: Account

    # Connections
    offers: [Offer]
    offer(id: ID!): Offer
    totalOffers: Int
    events: [Event]
    totalEvents: Int
    createdEvent: Event

    # Computed
    status: String
    hidden: Boolean
    featured: Boolean

    # IPFS
    title: String
    description: String
    currencyId: String
    price: Price
    category: String
    categoryStr: String
    unitsTotal: Int
    media: [Media]
  }

  type Media {
    url: String
    contentType: String
  }

  type Offer {
    id: ID!
    listingId: String!
    offerId: String!
    createdBlock: Int

    # Connections
    listing: Listing

    # On-Chain
    value: String
    commission: String
    refund: String
    currency: String
    buyer: Account
    affiliate: Account
    arbitrator: Account
    finalizes: Int
    status: Int

    withdrawnBy: Account
  }

  input NewListingInput {
    title: String!
    description: String
    category: String
    currency: String
    price: PriceInput
    unitsTotal: Int
    media: [MediaInput]
  }

  input MediaInput {
    url: String
    contentType: String
  }

  input MakeOfferInput {
    currency: String
  }

  input PriceInput {
    amount: String
    currency: String
  }

`
