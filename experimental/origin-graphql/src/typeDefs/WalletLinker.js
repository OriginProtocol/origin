module.exports = `
  extend type Query {
    walletLinker: WalletLinker
  }

  extend type Mutation {
    unlinkMobileWallet: Boolean
  }

  type WalletLinker {
    linkCode: String
    linked: Boolean!
  }
`
