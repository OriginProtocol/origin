const ListingInterface = `
  id: ID!
  contractAddr: String

  # On-chain:
  seller: Account
  deposit: String
  arbitrator: Account

  # Connections
  offers: [Offer]
  allOffers: [Offer]
  offer(id: ID!): Offer
  pendingBuyers: [Account]
  totalOffers: Int
  events: [Event]
  totalEvents: Int
  createdEvent: Event

  # Computed
  status: String
  depositAvailable: String
  type: String
  valid: Boolean
  validationError: String

  # IPFS
  title: String
  description: String
  currencyId: String
  price: Price
  acceptedTokens: [Token]
  category: String
  subCategory: String
  categoryStr: String
  media: [Media]
  location: Location
  "IPFS: total commission, in natural units, available across all units"
  commission: String
  "IPFS: commission, in natural units, to be paid for each unit sold"
  commissionPerUnit: String
  marketplacePublisher: String
  requiresShipping: Boolean
`

export const mutations = `
  extend type Mutation {
    deployMarketplace(token: String!, version: String!, from: String, autoWhitelist: Boolean): Transaction

    createListing(
      from: String!
      version: String
      deposit: String
      depositManager: String
      autoApprove: Boolean
      data: ListingInput!
      unitData: UnitListingInput
      fractionalData: FractionalListingInput
    ): Transaction

    updateListing(
      listingID: ID!
      from: String!
      additionalDeposit: String
      autoApprove: Boolean
      data: ListingInput!
      unitData: UnitListingInput
      fractionalData: FractionalListingInput
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
      commission: String
      value: String
      currency: String
      from: String
      withdraw: String
      quantity: Int
      shippingAddress: ShippingAddressInput
      autoswap: Boolean
      encryptedData: String

      # Optional: normally inherited from listing
      arbitrator: String
      affiliate: String
      fractionalData: FractionalOfferInput
    ): Transaction

    executeRuling(
      offerID: ID!
      offerID: ID!
      # ruling may be one of:
      #
      # - refund-buyer: Buyer gets all value in the offer
      # - pay-seller: Seller gets all value in the offer
      # - partial-refund: Buyer the refund value, Seller gets all remaining value
      ruling: String!
      # commission may be one of:
      #
      # - pay: Affiliate receives commission tokens, if any
      # - refund: Seller refunded commission tokens, if any
      commission: String!
      message: String
      refund: String
      from: String
    ): Transaction

    addData(data: String!, listingID: ID, offerID: ID, from: String!): Transaction
    addAffiliate(affiliate: String!, from: String, version: String): Transaction

    acceptOffer(offerID: ID!, from: String): Transaction
    withdrawOffer(offerID: ID!, from: String): Transaction
    finalizeOffer(offerID: ID!, from: String, rating: Int, review: String): Transaction
    disputeOffer(offerID: ID!, from: String): Transaction
    addFunds(offerID: ID!, amount: String!, from: String): Transaction
    updateRefund(offerID: ID!, amount: String!, from: String): Transaction
    withdrawDust(from: String, currency: String!, amount: String!): Transaction
  }
`

export const types = `
  extend type Query {
    marketplace: Marketplace
    marketplaces: [Marketplace]
  }

  type Marketplace {
    id: ID
    address: String
    version: String
    token: Token
    owner: Account
    account: Account
    totalListings: Int

    listing(id: ID!): ListingResult
    listings(
      first: Int
      last: Int
      before: String
      after: String
      search: String
      filters: [ListingFilterInput!]
      sort: String
      order: String
      listingIds: [String]
    ): ListingConnection!

    offer(id: ID!): Offer

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
    identity: Identity
    listings(first: Int, after: String, filter: String): ListingConnection!
    offers(first: Int, after: String, filter: String): OfferConnection!
    sales(first: Int, after: String, filter: String): OfferConnection!
    counterparty(first: Int, after: String, id: String!): UserNotificationConnection!
    reviews(first: Int, after: String): ReviewConnection!
    notifications(first: Int, after: String, filter: String): UserNotificationConnection!
    transactions(first: Int, after: String): UserTransactionConnection!
  }

  type OfferConnection {
    nodes: [Offer]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReviewConnection {
    nodes: [Review]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserNotificationConnection {
    nodes: [UserNotification]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserNotification {
    id: ID!
    offer: Offer!
    party: User!
    event: Event!
    read: Boolean
  }

  type UserTransactionConnection {
    nodes: [Transaction]
    pageInfo: PageInfo!
    totalCount: Int!
    hasPending: Boolean
  }

  type Review {
    id: ID!
    reviewer: User
    target: User
    listing: ListingResult
    offer: Offer
    review: String
    rating: Int
    event: Event
  }

  type ListingConnection {
    edges: [ListingEdge]
    nodes: [ListingResult]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ListingEdge {
    cursor: String!
    node: ListingResult
  }

  interface Listing {
    ${ListingInterface}
  }

  type UnitListing implements Listing {
    ${ListingInterface}

    # Number of units available for sale (IPFS)
    unitsTotal: Int

    # Number of Units Created, Accepted or Disputed (computed)
    unitsPending: Int

    # Number of units Finalized or Ruling (computed)
    unitsSold: Int

    # unitsTotal - unitsPending - unitsSold (computed)
    unitsAvailable: Int

    # Is this is a multi-unit listing or not (computed)
    multiUnit: Boolean
  }

  type ServiceListing implements Listing {
    ${ListingInterface}

    # Number of Units Created, Accepted or Disputed (computed)
    unitsPending: Int

    # Number of units Finalized or Ruling (computed)
    unitsSold: Int

    # Max units that can be ordered at once
    unitsAvailable: Int
  }

  type FractionalListing implements Listing {
    ${ListingInterface}

    # IPFS
    timeZone: String
    workingHours: [String]
    weekendPrice: Price
    unavailable: [String]
    customPricing: [String]
    booked: [String]
  }

  type FractionalHourlyListing implements Listing {
    ${ListingInterface}

    # IPFS
    timeZone: String
    workingHours: [String]
    unavailable: [String]
    customPricing: [String]
    booked: [String]
  }

  type GiftCardListing implements Listing {
    ${ListingInterface}

    # Number of units available for sale (IPFS)
    unitsTotal: Int

    # Number of Units Created, Accepted or Disputed (computed)
    unitsPending: Int

    # Number of units Finalized or Ruling (computed)
    unitsSold: Int

    # unitsTotal - unitsPending - unitsSold (computed)
    unitsAvailable: Int

    # Is this is a multi-unit listing or not (computed)
    multiUnit: Boolean

    # IPFS
    retailer: String
    cardAmount: String
    issuingCountry: String
    isDigital: Boolean
    isCashPurchase: Boolean
    receiptAvailable: Boolean
  }

  type AnnouncementListing implements Listing {
    ${ListingInterface}
  }

  union ListingResult = UnitListing | FractionalListing | FractionalHourlyListing | AnnouncementListing | GiftCardListing | ServiceListing

  type Media {
    url: String
    urlExpanded: String
    contentType: String
  }

  type Location {
    latitude: Float
    longitude: Float
    accuracyInMeters: Float
  }

  type Offer {
    id: ID!
    listingId: String!
    offerId: String!
    createdBlock: Int

    # Connections
    listing: ListingResult
    events: [Event]
    createdEvent: Event
    acceptedEvent: Event
    finalizedEvent: Event
    withdrawnEvent: Event
    fundsAddedEvent: Event
    disputedEvent: Event
    rulingEvent: Event
    history: [OfferHistory]

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

    # Computed
    withdrawnBy: Account
    statusStr: String
    valid: Boolean
    validationError: String
    # A json encoded, encrypted OutOfBandMessage
    # from @origin/messaging-client.
    shippingAddressEncrypted: String

    # IPFS
    quantity: Int
    totalPrice: Price
    startDate: String
    endDate: String
  }

  type OfferHistory {
    id: ID!
    event: Event
    party: Account
    ipfsHash: String
    ipfsUrl: String
  }

  enum ValueType {
    STRING
    FLOAT
    DATE
    ARRAY_STRING
  }

  enum FilterOperator {
    EQUALS
    CONTAINS
    GREATER
    GREATER_OR_EQUAL
    LESSER
    LESSER_OR_EQUAL
  }

  input ListingFilterInput {
    name: String!
    value: String!
    valueType: ValueType!
    operator: FilterOperator!
  }

  input ListingInput {
    typename: String
    title: String!
    description: String
    category: String
    subCategory: String
    currency: String
    acceptedTokens: [String]
    media: [MediaInput]
    price: PriceInput
    location: LocationInput

    "total commission, in natural units, for all units"
    commission: String
    "commission, in natural units, to be paid for each unit sold"
    commissionPerUnit: String

    marketplacePublisher: String

    requiresShipping: Boolean
  }

  input UnitListingInput {
    unitsTotal: Int

    # Gift Cards:
    retailer: String
    cardAmount: String
    issuingCountry: String
    isDigital: Boolean
    isCashPurchase: Boolean
    receiptAvailable: Boolean
  }

  input FractionalListingInput {
    weekendPrice: PriceInput
    workingHours: [String]
    timeZone: String
    unavailable: [String]
    customPricing: [String]
    booked: [String]
  }

  input MediaInput {
    url: String
    contentType: String
  }

  input LocationInput {
    latitude: Float
    longitude: Float
    accuracyInMeters: Float
  }

  input MakeOfferInput {
    currency: String
  }

  input FractionalOfferInput {
    startDate: String
    endDate: String
  }

  input PriceInput {
    amount: String
    currency: String
  }

  input ShippingAddressInput {
    name: String
    address1: String
    address2: String
    city: String
    stateProvinceRegion: String
    postalCode: String
    country: String
    instructions: String
  }
`
export default types + mutations
