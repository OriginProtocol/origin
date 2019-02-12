module.exports = `
  type Subscription {
    newBlock: Block
    newTransaction: NewTransaction
    transactionUpdated: TransactionUpdate
    transactionUpdated2(id: String!): TransactionUpdate
  }

  type TransactionUpdate {
    id: ID!
    status: String
    mutation: String
    confirmations: Int
  }

  type NewTransaction {
    totalCount: Int
    node: Transaction!
  }

  type Query {
    web3: Web3
    config: String
    contracts: [Contract]
    contract(id: String!): Contract
    tokens: [Token]
    token(id: String!): Token
    ethUsd: String
    configObj: Config
  }

  type Config {
    affiliate: String
    arbitrator: String
    discovery: String
    bridge: String
    facebookAuthUrl: String
    ipfsRPC: String
    ipfsGateway: String
    ipfsEventCache: String
    provider: String
    providerWS: String
    originGraphQLVersion: String
  }

  type Mutation {
    refetch: Boolean
    setNetwork(network: String): Boolean
    toggleMetaMask(enabled: Boolean): Boolean
    deployToken(name: String!, symbol: String!, decimals: String!, supply: String!, type: String, from: String): Transaction
    transferToken(token: String!, from: String!, to: String!, value: String!): Transaction
    updateTokenAllowance(token: String!, from: String!, to: String!, value: String!): Transaction
    useFaucet(wallet: String!, networkId: String): Boolean

    sendFromNode(from: String!, to: String!, value: String!): Transaction
    sendFromWallet(from: String!, to: String!, value: String!): Transaction
    setActiveWallet(address: String!): Account
    createWallet(role: String, name: String): Account
    importWallet(role: String, name: String, privateKey: String!): Account
    importWallets(accounts: [WalletInput]): Boolean
    removeWallet(address: String!): String
    signMessage(address: ID!, message: String!): String
  }

  type Web3 {
    networkId: Int
    networkName: String
    blockNumber: Int
    nodeAccounts: [Account]
    nodeAccount(id: ID!): Account
    accounts: [Account]
    account(id: ID!): Account
    defaultAccount: Account
    transaction(id: ID!): Transaction
    transactionReceipt(id: ID!): TransactionReceipt
    useMetaMask: Boolean
    metaMaskAvailable: Boolean
    metaMaskEnabled: Boolean
    metaMaskApproved: Boolean
    metaMaskUnlocked: Boolean
    metaMaskAccount: Account
    metaMaskNetworkId: Int
    metaMaskNetworkName: String
  }

  type Account {
    id: ID!
    checksumAddress: String
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
    id: ID!
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
    exchangeRate(currency: String!): Int
  }

  type Contract {
    id: ID!
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
    receipt: TransactionReceipt

    # Timestamp transaction originally submitted
    submittedAt: Int
  }

  type TransactionReceipt {
    id: ID!
    blockHash: String
    blockNumber: Int
    contractAddress: String
    cumulativeGasUsed: Int
    gasUsed: Int
    logs: [Log]
    events: [Event]
    logsBloom: String
    status: Boolean
    transactionHash: String
    transactionIndex: Int
  }

  type Log {
    id: ID!
    address: String
    blockHash: String
    blockNumber: Int
    data: String
    logIndex: Int
    topics: [String]
    transactionHash: String
    transactionIndex: Int
    type: String
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
    returnValuesArr: [EventReturnValuesArr]
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
    listingID: ID
    offerID: ID
    party: String!
    ipfsHash: String!
    ipfsUrl: String
  }

  type EventReturnValuesArr {
    field: String
    value: String
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

  input WalletInput {
    privateKey: String
    name: String
    role: String
  }

`
