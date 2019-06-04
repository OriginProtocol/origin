module.exports = `
  type TokenHolder {
    id: ID!
    account: Account
    token: Token
    balance: String
    allowance(contract: String): String
  }

  type Account {
    id: ID!
    checksumAddress: String
    balance: Balance
    role: String
    name: String
    token(symbol: String!): TokenHolder
    identity: Identity
    owner: Account
    proxy: Account
    predictedProxy: Account
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
`
