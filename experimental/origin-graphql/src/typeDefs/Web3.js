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
    contracts: [Contract]
    contract(id: String!): Contract
    tokens: [Token]
    token(id: String!): Token
    ethUsd: String
  }

  type Mutation {
    refetch: Boolean
    setNetwork(network: String): Boolean
    toggleMetaMask(enabled: Boolean): Boolean
    deployToken(name: String!, symbol: String!, decimals: String!, supply: String!, type: String, from: String): Transaction
    transferToken(token: String!, from: String!, to: String!, value: String!): Transaction
    updateTokenAllowance(token: String!, from: String!, to: String!, value: String!): Transaction

    sendFromNode(from: String!, to: String!, value: String!): Transaction
    sendFromWallet(from: String!, to: String!, value: String!): Transaction
    setActiveWallet(address: String!): Account
    createWallet(role: String, name: String): Account
    importWallet(role: String, name: String, privateKey: String!): Account
    importWallets(accounts: [WalletInput]): Boolean
    removeWallet(address: String!): String
  }

  type Web3 {
    networkId: Int
    nodeAccounts: [Account]
    nodeAccount(id: ID!): Account
    accounts: [Account]
    account(id: ID!): Account
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
    id: ID!
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
    listingID: ID
    offerID: ID
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

  input WalletInput {
    privateKey: String
    name: String
    role: String
  }

`
