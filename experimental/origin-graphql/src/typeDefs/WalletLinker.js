module.exports = `
  extend type Query {
    walletLinker: WalletLinker
  }

  extend type Mutation {
    unlinkMobileWallet: Boolean
    linkMobileWallet: LinkMobileWalletResult
  }

  type WalletLinker {
    linkCode: String
    linked: Boolean!
  }

  type LinkMobileWalletResult {
    code: String
  }
`
