module.exports = `
  extend type Subscription {
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

  extend type Query {
    web3: Web3
    config: String
    contracts: [Contract]
    contract(id: String!): Contract
    tokens: [Token]
    token(id: String!): Token
    ethUsd: String
    configObj: Config
  }

  input ConfigInput {
    discovery: String
    growth: String
    relayer: String
    bridge: String
    ipfsRPC: String
    ipfsGateway: String
    provider: String
    providerWS: String
    performanceMode: Boolean
    relayerEnabled: Boolean
    proxyAccountsEnabled: Boolean
  }

  type Config {
    affiliate: String
    arbitrator: String
    discovery: String
    growth: String
    bridge: String
    ipfsRPC: String
    ipfsGateway: String
    ipfsEventCache: String
    originGraphQLVersion: String
    provider: String
    providerWS: String
    proxyAccountsEnabled: Boolean
    relayerEnabled: Boolean
    relayer: String
    performanceMode: Boolean
    marketplaceVersion: String
  }

  extend type Mutation {
    refetch: Boolean
    setNetwork(network: String, customConfig: ConfigInput): Boolean
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
    importWallets(accounts: [WalletInput]): [Account]
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
    walletType: String
    mobileWalletAccount: Account
    primaryAccount: Account
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

  input WalletInput {
    privateKey: String
    name: String
    role: String
  }

`
