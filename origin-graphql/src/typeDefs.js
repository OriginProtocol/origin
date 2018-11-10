export default `
  type Subscription {
    newBlock: Block
    transactionUpdated: TransactionUpdate
  }

  type TransactionUpdate {
    id: ID!
    status: String
    mutation: String
    confirmations: Int
  }

  type Query {
    web3: Web3
    marketplace: Marketplace
    marketplaces: [Marketplace]
    contracts: [Contract]
    contract(id: String!): Contract
    tokens: [Token]
    token(id: String!): Token
    ethUsd: String
    messaging(id: String!): Messaging
  }

  type Messaging {
    id: String
    enabled: Boolean
    conversations: [Conversation]
  }

  type Conversation {
    id: String!
    timestamp: String
    messages: [Message]
  }

  type Message {
    id: String
    address: String
    hash: String
    index: Int
    msg: MessageContent
  }

  type MessageContent {
    content: String
    created: String
  }

  type Mutation {
    refetch: Boolean
    setNetwork(network: String): Boolean
    toggleMetaMask(enabled: Boolean): Boolean
    deployToken(name: String!, symbol: String!, decimals: String!, supply: String!, type: String, from: String): Transaction
    transferToken(token: String!, from: String!, to: String!, value: String!): Transaction
    updateTokenAllowance(token: String!, from: String!, to: String!, value: String!): Transaction
    deployMarketplace(token: String!, version: String, from: String, autoWhitelist: Boolean): Transaction

    sendFromNode(from: String!, to: String!, value: String!): Transaction
    sendFromWallet(from: String!, to: String!, value: String!): Transaction
    setActiveWallet(address: String!): Account
    createWallet(role: String, name: String): Account
    importWallet(role: String, name: String, privateKey: String!): Account
    removeWallet(address: String!): String

    createListing(
      deposit: String!
      depositManager: String
      from: String
      data: NewListingInput
      autoApprove: Boolean
    ): Transaction

    updateListing(
      listingID: String!
      additionalDeposit: String
      from: String,
      data: NewListingInput
      autoApprove: Boolean
    ): Transaction

    withdrawListing(
      listingID: String!
      target: String!
      reason: String
      from: String
    ): Transaction

    makeOffer(
      listingID: String
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
      listingID: String!
      offerID: String!
      ruling: String!
      commission: String!
      message: String
      refund: String
      from: String
    ): Transaction

    addData(data: String!, listingID: String, offerID: String): Transaction
    addAffiliate(affiliate: String!, from: String): Transaction

    acceptOffer(listingID: String!, offerID: String!, from: String): Transaction
    withdrawOffer(listingID: String!, offerID: String!, from: String): Transaction
    finalizeOffer(listingID: String!, offerID: String!, from: String, rating: Int, review: String): Transaction
    disputeOffer(listingID: String!, offerID: String!, from: String): Transaction
    addFunds(listingID: String!, offerID: String!, amount: String!, from: String): Transaction
    updateRefund(listingID: String!, offerID: String!, amount: String!, from: String): Transaction

    enableMessaging: Boolean
    sendMessage(to: String!, content: String!): Boolean
  }

  type Web3 {
    networkId: Int
    nodeAccounts: [Account]
    nodeAccount(id: String!): Account
    accounts: [Account]
    account(id: String!): Account
    defaultAccount: Account
    transaction(id: ID!): Transaction
    metaMaskAvailable: Boolean
    metaMaskEnabled: Boolean
    metaMaskAccount: Account
    metaMaskNetworkId: Int
  }

  type Price {
    currency: String
    amount: String
  }

  type Account {
    id: String!
    balance: Balance
    role: String
    name: String
    token(symbol: String!): TokenHolder
    identity: Identity
  }

  type Balance {
    wei: String
    eth: String
    usd: String
  }

  type TokenHolder {
    id: String!
    account: Account
    token: Token
    balance: String
    allowance(contract: String): String
  }

  type Token {
    id: ID!
    address: String
    name: String
    symbol: String
    decimals: Int
    totalSupply: String
  }

  type Contract {
    id: String!
    balance: Balance
    type: String
    name: String
    token(symbol: String!): TokenHolder
  }

  type SendFromNodeOutput {
    toAccount: Account
    fromAccount: Account
  }

  type TransferTokenOutput {
    to: TokenHolder
    from: TokenHolder
  }

  type Marketplace {
    id: String
    address: String
    version: String
    token: Token
    owner: Account
    account: Account
    totalListings: Int
    getListing(id: String!): Listing
    allListings(offset: Int, limit: Int): [Listing]
    totalEvents: Int
    events(offset: Int, limit: Int): [Event]
  }

  type Listing {
    id: String!

    # On-chain:
    seller: Account
    deposit: String
    arbitrator: Account

    # Connections
    offers: [Offer]
    getOffer(id: String!): Offer
    totalOffers: Int
    events: [Event]
    totalEvents: Int
    createdEvent: Event

    # Computed
    status: String

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
    id: String!
    listingId: String!

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

  type Transaction {
    id: ID!
    status: String
    blockHash: String
    blockNumber: Int
    from: String
    gas: Int
    gasPrice: String
    hash: String
    input: String
    nonce: Int
    to: String
    value: String
    pct: Float
  }

  type Event {
    id: ID!
    address: String
    blockHash: String
    blockNumber: Int
    block: Block
    event: String
    logIndex: Int
    raw: EventRaw
    returnValues: EventReturnValues
    signature: String
    transactionHash: String
    transactionIndex: Int
    type: String
    timestamp: Int
  }

  type EventRaw {
    data: String
    topics: [String]
  }

  type EventReturnValues {
    listingID: String
    offerID: String
    party: String!
    ipfsHash: String!
  }

  type Block {
    id: ID!
    number: Int
    hash: String
    parentHash: String
    mixHash: String
    nonce: String
    sha3Uncles: String
    logsBloom: String
    transactionsRoot: String
    stateRoot: String
    receiptsRoot: String
    miner: String
    difficulty: String
    totalDifficulty: String
    extraData: String
    size: Int
    gasLimit: Int
    gasUsed: Int
    timestamp: Int
    transactions: [String]
    uncles: [String]
  }

  type Identity {
    id: ID!
    name: String
    claims: [Claim]
    profile: ProfileData
  }

  type ProfileData {
    id: ID!
    firstName: String
    lastName: String
    description: String
    avatar: String
  }

  type Claim {
    id: String!
    topic: String
    scheme: String
    issuer: String
    signature: String
    data: String
    uri: String
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

  input PriceInput {
    amount: String
    currency: String
  }

  input MediaInput {
    url: String
    contentType: String
  }

  input MakeOfferInput {
    currency: String
  }
`
